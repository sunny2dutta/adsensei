import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAdCopy, generateCampaignInsights, generateCampaignSuggestions } from "./lib/openai";
import { generateInstagramAuthUrl, exchangeCodeForToken, publishToInstagram, getInstagramAccount, formatInstagramCaption, validateImageUrl } from "./lib/instagram";
import { insertCampaignSchema, insertMessageSchema, insertUserSchema, insertShopifyProductSchema, systemLogs } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import axios from "axios";
import { DatabaseLogger } from "./lib/logger";
import { db } from "./db";
import { desc, eq, gte } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      console.log("Login attempt for email:", email);

      // Always use the proper authentication method
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("User not found:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("User found, checking password...");
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log("Password valid:", isValidPassword);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if email is verified
      if (user.emailVerified === false) {
        return res.status(401).json({ 
          message: "Email not verified", 
          needsVerification: true,
          userId: user.id 
        });
      }

      // Don't send password hash to client
      const { password: _, ...userWithoutPassword } = user;
      console.log("Login successful for:", email);
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const user = await storage.createUser(userData);
      
      // Don't send password hash to client
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Validate current session
  app.get("/api/auth/me", async (req, res) => {
    try {
      // In this simple implementation, we'll check if we have a valid user ID in localStorage
      // In a more complex app, you'd validate session tokens or cookies
      const userId = req.headers['x-user-id'];
      
      if (!userId) {
        return res.status(401).json({ message: "No authentication found" });
      }

      const user = await storage.getUser(userId as string);
      if (!user) {
        return res.status(401).json({ message: "Invalid session" });
      }

      // Don't send password hash to client
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Session validation error:", error);
      res.status(401).json({ message: "Invalid session" });
    }
  });

  // Check if username/email exists (for validation)
  app.post("/api/auth/check-availability", async (req, res) => {
    try {
      const { email, username } = req.body;
      
      const result = {
        emailAvailable: true,
        usernameAvailable: true
      };
      
      if (email) {
        const existingEmail = await storage.getUserByEmail(email);
        result.emailAvailable = !existingEmail;
      }
      
      if (username) {
        const existingUsername = await storage.getUserByUsername(username);
        result.usernameAvailable = !existingUsername;
      }
      
      res.json(result);
    } catch (error) {
      console.error("Check availability error:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Send email verification
  app.post("/api/auth/send-verification-email", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }
      
      const token = await storage.generateEmailVerificationToken(userId);
      
      // In development, log the verification token instead of sending email
      console.log("🔗 EMAIL VERIFICATION:");
      console.log(`Email: ${user.email}`);
      console.log(`Verification Token: ${token}`);
      console.log(`Verification URL: http://localhost:5000/verify-email?token=${token}`);
      console.log("⚠️  In production, this would be sent via email service");
      
      res.json({ 
        message: "Verification email sent",
        // For development only - remove in production
        developmentToken: token
      });
    } catch (error) {
      console.error("Send verification email error:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  // Verify email token
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }
      
      const user = await storage.verifyEmailToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
      
      res.json({ 
        message: "Email verified successfully",
        user: { id: user.id, email: user.email, emailVerified: user.emailVerified }
      });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  // Check verification status
  app.get("/api/auth/verification-status/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        emailVerified: user.emailVerified,
        email: user.email
      });
    } catch (error) {
      console.error("Check verification status error:", error);
      res.status(500).json({ message: "Failed to check verification status" });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Don't send password hash to client
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      const campaigns = await storage.getCampaignsByUserId(userId as string);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Error fetching campaigns" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ message: "Invalid campaign data" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Error fetching campaign" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const updates = req.body;
      const campaign = await storage.updateCampaign(req.params.id, updates);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Error updating campaign" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCampaign(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json({ message: "Campaign deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting campaign" });
    }
  });

  // Template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const { category } = req.query;
      const templates = category 
        ? await storage.getTemplatesByCategory(category as string)
        : await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Error fetching templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Error fetching template" });
    }
  });

  app.post("/api/templates/:id/use", async (req, res) => {
    try {
      await storage.incrementTemplateUsage(req.params.id);
      res.json({ message: "Template usage incremented" });
    } catch (error) {
      res.status(500).json({ message: "Error updating template usage" });
    }
  });

  // AI ad copy generation
  app.post("/api/generate-ad-copy", async (req, res) => {
    try {
      const generateAdCopySchema = z.object({
        brandType: z.string(),
        brandName: z.string(),
        productCategory: z.string(),
        targetAudience: z.string(),
        platform: z.string(),
        campaignObjective: z.string(),
        brandValues: z.string().optional(),
        tone: z.string().optional()
      });

      const requestData = generateAdCopySchema.parse(req.body);
      const adCopy = await generateAdCopy(requestData);
      res.json(adCopy);
    } catch (error) {
      res.status(500).json({ message: "Error generating ad copy: " + (error as Error).message });
    }
  });

  // Campaign metrics
  app.get("/api/campaigns/:id/metrics", async (req, res) => {
    try {
      const metrics = await storage.getCampaignMetrics(req.params.id);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching campaign metrics" });
    }
  });

  app.post("/api/campaigns/:id/metrics", async (req, res) => {
    try {
      const metricsData = {
        ...req.body,
        campaignId: req.params.id
      };
      const metrics = await storage.createCampaignMetrics(metricsData);
      res.json(metrics);
    } catch (error) {
      res.status(400).json({ message: "Invalid metrics data" });
    }
  });

  // AI insights
  app.post("/api/campaigns/:id/insights", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      const metrics = await storage.getCampaignMetrics(req.params.id);
      if (metrics.length === 0) {
        return res.status(400).json({ message: "No metrics available for insights" });
      }

      const latestMetrics = metrics[metrics.length - 1];
      const insights = await generateCampaignInsights({
        impressions: latestMetrics.impressions || 0,
        clicks: latestMetrics.clicks || 0,
        conversions: latestMetrics.conversions || 0,
        spend: latestMetrics.spend || 0,
        platform: campaign.platform
      });

      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Error generating insights: " + (error as Error).message });
    }
  });

  // Messages
  app.get("/api/campaigns/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByCampaignId(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.post("/api/campaigns/:id/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        campaignId: req.params.id
      });
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Instagram Integration Routes
  app.get("/api/instagram/auth-url/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const authData = generateInstagramAuthUrl(userId);
      res.json(authData);
    } catch (error) {
      res.status(500).json({ message: "Error generating Instagram auth URL" });
    }
  });

  app.post("/api/instagram/callback", async (req, res) => {
    try {
      const { code, state } = req.body;
      const userId = state.split('_')[0];

      const tokenData = await exchangeCodeForToken(code);
      const accountData = await getInstagramAccount(tokenData.access_token);

      await storage.updateUser(userId, {
        instagramConnected: true,
        instagramAccessToken: tokenData.access_token,
        instagramAccountId: accountData.id
      });

      res.json({ 
        message: "Instagram connected successfully",
        accountId: accountData.id,
        username: accountData.username
      });
    } catch (error) {
      res.status(500).json({ message: "Error connecting Instagram account" });
    }
  });

  app.post("/api/campaigns/:id/publish-instagram", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      const user = await storage.getUser(campaign.userId);
      if (!user || !user.instagramConnected || !user.instagramAccessToken) {
        return res.status(400).json({ message: "Instagram not connected for this user" });
      }

      if (!campaign.imageUrl || !validateImageUrl(campaign.imageUrl)) {
        return res.status(400).json({ message: "Valid image URL required for Instagram post" });
      }

      // Generate Instagram caption from campaign content
      const adCopyData = campaign.adCopy ? JSON.parse(campaign.adCopy) : null;
      let caption = campaign.description || "New fashion collection available now!";
      
      if (adCopyData) {
        caption = formatInstagramCaption(
          adCopyData.headline || "",
          adCopyData.body || "",
          adCopyData.cta || "",
          adCopyData.hashtags || []
        );
      }

      const publishResult = await publishToInstagram({
        caption,
        image_url: campaign.imageUrl,
        access_token: user.instagramAccessToken
      });

      // Update campaign with Instagram post details
      await storage.updateCampaign(req.params.id, {
        publishedToInstagram: true,
        instagramPostId: publishResult.id,
        status: "published"
      });

      res.json({
        message: "Campaign published to Instagram successfully",
        postId: publishResult.id,
        permalink: publishResult.permalink
      });
    } catch (error) {
      res.status(500).json({ message: "Error publishing to Instagram: " + (error as Error).message });
    }
  });

  app.post("/api/instagram/disconnect/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.updateUser(userId, {
        instagramConnected: false,
        instagramAccessToken: null,
        instagramAccountId: null
      });

      res.json({ message: "Instagram disconnected successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error disconnecting Instagram account" });
    }
  });

  // Campaign Suggestions
  app.post("/api/generate-campaign-suggestions", async (req, res) => {
    try {
      const suggestionRequestSchema = z.object({
        brandName: z.string(),
        brandType: z.string(),
        brandValues: z.string().optional(),
        targetDemographic: z.object({
          ageRange: z.string(),
          gender: z.string(),
          interests: z.array(z.string()),
          location: z.string()
        }),
        budget: z.number().optional(),
        platforms: z.array(z.string()),
        seasonality: z.string().optional()
      });

      const requestData = suggestionRequestSchema.parse(req.body);
      const suggestions = await generateCampaignSuggestions(requestData);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Error generating campaign suggestions: " + (error as Error).message });
    }
  });

  // AI Ad Image Generation Routes with Python service + Node.js fallback
  app.post("/api/generate-ad-image", async (req, res) => {
    try {
      const generateImageSchema = z.object({
        prompt: z.string(),
        platform: z.enum(["instagram", "instagram_story", "tiktok", "facebook", "pinterest"]),
        text_overlay: z.string().optional(),
        brand_colors: z.array(z.string()).optional(),
        style: z.enum(["minimalist", "luxury", "street", "sustainable", "bold"]).optional()
      });

      const requestData = generateImageSchema.parse(req.body);
      
      // First try Python service
      try {
        DatabaseLogger.imageGenerationStart('python');
        const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
        const response = await axios.post(`${pythonServiceUrl}/generate-ad-image`, requestData, {
          timeout: 30000 // 30 second timeout
        });
        
        if (response.data.success) {
          DatabaseLogger.imageGenerationSuccess('python', { 
            platform: requestData.platform, 
            prompt: requestData.prompt.substring(0, 100) 
          });
          res.json(response.data.data);
          return;
        } else {
          throw new Error("Python service returned error: " + JSON.stringify(response.data));
        }
      } catch (pythonError) {
        DatabaseLogger.imageGenerationFallback((pythonError as Error).message);
        
        // Fallback to Node.js OpenAI integration
        const platformDimensions = {
          instagram: "1024x1024",
          instagram_story: "1024x1792", 
          tiktok: "1024x1792",
          facebook: "1792x1024",
          pinterest: "1024x1792"
        };
        
        const stylePrompts = {
          minimalist: "clean, minimal, simple composition, white space, modern",
          luxury: "elegant, sophisticated, premium materials, gold accents, high-end",
          street: "urban, edgy, graffiti-inspired, vibrant colors, contemporary",
          sustainable: "natural, eco-friendly, green elements, organic textures",
          bold: "vibrant colors, high contrast, dynamic composition, energetic"
        };
        
        const style = requestData.style || "minimalist";
        const platform = requestData.platform;
        const enhancedPrompt = `${requestData.prompt}, ${stylePrompts[style]}, ${platform}-ready, advertising photography, professional quality, product photography style, commercial use, high resolution`;
        
        const openaiResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          size: platformDimensions[platform] as "1024x1024" | "1024x1792" | "1792x1024",
          quality: "hd",
          n: 1,
        });
        
        const imageUrl = openaiResponse.data[0].url;
        
        const result = {
          image_path: null,
          image_url: imageUrl,
          platform: platform,
          dimensions: {
            width: parseInt(platformDimensions[platform].split('x')[0]),
            height: parseInt(platformDimensions[platform].split('x')[1])
          },
          generation_time: 2.5,
          metadata: {
            original_prompt: requestData.prompt,
            enhanced_prompt: enhancedPrompt,
            style: style,
            platform: platform,
            generated_via: "nodejs_fallback"
          }
        };
        
        DatabaseLogger.imageGenerationSuccess('nodejs', {
          platform: platform,
          prompt: requestData.prompt.substring(0, 100),
          fallback: true
        });
        res.json(result);
      }
      
    } catch (error) {
      DatabaseLogger.imageGenerationFailure((error as Error).message);
      res.status(500).json({ message: "Error generating ad image: " + (error as Error).message });
    }
  });

  app.post("/api/evaluate-ad", async (req, res) => {
    try {
      const evaluateAdSchema = z.object({
        image_path: z.string(),
        text_content: z.string(),
        platform: z.enum(["instagram", "instagram_story", "tiktok", "facebook", "pinterest"]),
        target_audience: z.string(),
        brand_name: z.string().optional()
      });

      const requestData = evaluateAdSchema.parse(req.body);
      
      // Call Python service
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      const response = await axios.post(`${pythonServiceUrl}/evaluate-ad`, requestData);
      
      if (response.data.success) {
        res.json(response.data.data);
      } else {
        throw new Error("Python service returned error");
      }
    } catch (error) {
      res.status(500).json({ message: "Error evaluating ad: " + (error as Error).message });
    }
  });

  // System Logs Routes
  app.get("/api/logs", async (req, res) => {
    try {
      const { limit = 100, level, service } = req.query;
      
      let query = db.select().from(systemLogs);
      
      // Filter by level if provided
      if (level && typeof level === 'string') {
        query = query.where(eq(systemLogs.level, level));
      }
      
      // Filter by service if provided
      if (service && typeof service === 'string') {
        query = query.where(eq(systemLogs.service, service));
      }
      
      const logs = await query
        .orderBy(desc(systemLogs.timestamp))
        .limit(Math.min(parseInt(limit as string), 1000)); // Max 1000 logs
        
      res.json({
        logs,
        total: logs.length,
        filters: { level, service, limit }
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching logs: " + (error as Error).message 
      });
    }
  });

  app.get("/api/logs/stats", async (req, res) => {
    try {
      // Get log counts by level and service for the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const recentLogs = await db.select()
        .from(systemLogs)
        .where(gte(systemLogs.timestamp, twentyFourHoursAgo));
      
      const stats = {
        total: recentLogs.length,
        byLevel: {} as Record<string, number>,
        byService: {} as Record<string, number>,
        lastUpdated: new Date().toISOString()
      };
      
      recentLogs.forEach(log => {
        stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
        stats.byService[log.service] = (stats.byService[log.service] || 0) + 1;
      });
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching log stats: " + (error as Error).message 
      });
    }
  });

  // Shopify Integration Routes
  app.post("/api/shopify/connect", async (req, res) => {
    try {
      const connectSchema = z.object({
        userId: z.string(),
        storeDomain: z.string(),
        accessToken: z.string()
      });

      const { userId, storeDomain, accessToken } = connectSchema.parse(req.body);
      
      // Verify the Shopify connection by making a test API call
      try {
        const shopifyResponse = await axios.get(`https://${storeDomain}.myshopify.com/admin/api/2024-01/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          }
        });

        if (shopifyResponse.data.shop) {
          // Update user with Shopify connection info
          await storage.updateUser(userId, {
            shopifyConnected: true,
            shopifyStoreDomain: storeDomain,
            shopifyAccessToken: accessToken
          });

          res.json({ 
            message: "Shopify store connected successfully",
            shop: shopifyResponse.data.shop
          });
        } else {
          throw new Error("Invalid Shopify connection");
        }
      } catch (shopifyError) {
        throw new Error("Failed to connect to Shopify store. Please check your credentials.");
      }
    } catch (error) {
      res.status(500).json({ message: "Error connecting Shopify: " + (error as Error).message });
    }
  });

  app.post("/api/shopify/sync-products", async (req, res) => {
    try {
      const syncSchema = z.object({
        userId: z.string()
      });

      const { userId } = syncSchema.parse(req.body);
      
      // Get user's Shopify connection info
      const user = await storage.getUser(userId);
      if (!user?.shopifyConnected || !user.shopifyStoreDomain || !user.shopifyAccessToken) {
        return res.status(400).json({ message: "Shopify not connected" });
      }

      // Fetch products from Shopify
      const shopifyResponse = await axios.get(
        `https://${user.shopifyStoreDomain}.myshopify.com/admin/api/2024-01/products.json?limit=250`,
        {
          headers: {
            'X-Shopify-Access-Token': user.shopifyAccessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      const products = shopifyResponse.data.products;
      let syncCount = 0;

      // Save products to database
      for (const product of products) {
        try {
          const productData = {
            userId,
            shopifyProductId: product.id.toString(),
            title: product.title,
            description: product.body_html || product.description,
            vendor: product.vendor,
            productType: product.product_type,
            tags: product.tags ? product.tags.split(',').map((tag: string) => tag.trim()) : [],
            images: product.images?.map((img: any) => ({
              id: img.id,
              src: img.src,
              alt: img.alt
            })) || [],
            variants: product.variants?.map((variant: any) => ({
              id: variant.id,
              title: variant.title,
              price: Math.round(parseFloat(variant.price) * 100), // Convert to cents
              compareAtPrice: variant.compare_at_price ? Math.round(parseFloat(variant.compare_at_price) * 100) : null,
              inventoryQuantity: variant.inventory_quantity
            })) || [],
            price: product.variants?.[0] ? Math.round(parseFloat(product.variants[0].price) * 100) : 0,
            compareAtPrice: product.variants?.[0]?.compare_at_price ? Math.round(parseFloat(product.variants[0].compare_at_price) * 100) : null,
            inventoryQuantity: product.variants?.[0]?.inventory_quantity || 0,
            handle: product.handle,
            seoTitle: product.title,
            seoDescription: product.body_html || product.description
          };

          await storage.createShopifyProduct(productData);
          syncCount++;
        } catch (productError) {
          console.error(`Error syncing product ${product.id}:`, productError);
        }
      }

      res.json({ 
        message: `Successfully synced ${syncCount} products`,
        syncCount,
        totalProducts: products.length
      });
    } catch (error) {
      res.status(500).json({ message: "Error syncing products: " + (error as Error).message });
    }
  });

  app.get("/api/shopify/products/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const products = await storage.getShopifyProducts(userId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products: " + (error as Error).message });
    }
  });

  app.post("/api/shopify/generate-product-ads", async (req, res) => {
    try {
      const generateSchema = z.object({
        productId: z.string(),
        platforms: z.array(z.enum(["google", "meta", "tiktok"])),
        targetAudience: z.string().optional(),
        brandVoice: z.string().optional(),
        languages: z.array(z.string()).optional().default(["en"])
      });

      const { productId, platforms, targetAudience, brandVoice, languages } = generateSchema.parse(req.body);
      
      // Get product data
      const product = await storage.getShopifyProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const generatedAds = [];

      // Generate ads for each platform
      for (const platform of platforms) {
        for (const language of languages) {
          try {
            // Enhanced prompt using product data
            const prompt = `Create compelling ${platform} ad copy for this fashion product:
            
Product: ${product.title}
Description: ${product.description}
Price: $${(product.price / 100).toFixed(2)}
Tags: ${product.tags?.join(', ')}
Brand Voice: ${brandVoice || 'Professional and engaging'}
Target Audience: ${targetAudience || 'Fashion-forward consumers'}
Language: ${language}

Generate platform-specific copy that highlights the product's unique features and drives conversions.`;

            const adCopy = await generateAdCopy({
              brandType: 'fashion',
              brandName: 'Fashion Brand',
              productCategory: product.productType || 'Fashion',
              targetAudience: targetAudience || 'Fashion-forward consumers',
              platform,
              campaignObjective: 'conversion',
              brandValues: brandVoice || 'professional',
              tone: brandVoice || 'professional'
            });

            // Generate SEO description for the product
            let seoDescription = `Discover ${product.title} - ${product.description?.substring(0, 120)}... Perfect for ${targetAudience || 'fashion lovers'}. Shop now!`;
            
            if (language !== 'en') {
              const seoAdCopy = await generateAdCopy({
                brandType: 'fashion',
                brandName: 'Fashion Brand',
                productCategory: product.productType || 'Fashion',
                targetAudience: targetAudience || 'Fashion-forward consumers',
                platform: 'instagram',
                campaignObjective: 'seo',
                brandValues: `Create SEO-friendly description in ${language}`,
                tone: 'seo-optimized'
              });
              seoDescription = seoAdCopy.body;
            }

            generatedAds.push({
              platform,
              language,
              adCopy: adCopy,
              seoDescription,
              productImages: product.images,
              suggestedBudget: Math.max(50, Math.round(product.price / 1000)), // Suggest budget based on product price
              targetKeywords: product.tags?.slice(0, 5) || []
            });
          } catch (error) {
            console.error(`Error generating ad for ${platform} in ${language}:`, error);
          }
        }
      }

      // Generate bundle suggestions if multiple products available
      const allProducts = await storage.getShopifyProducts(product.userId);
      const bundleSuggestions = allProducts
        .filter(p => p.id !== productId && p.tags?.some(tag => product.tags?.includes(tag)))
        .slice(0, 3)
        .map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          commonTags: p.tags?.filter(tag => product.tags?.includes(tag))
        }));

      res.json({
        product: {
          id: product.id,
          title: product.title,
          price: product.price,
          images: product.images
        },
        generatedAds,
        bundleSuggestions,
        message: `Generated ${generatedAds.length} ads across ${platforms.length} platforms`
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating product ads: " + (error as Error).message });
    }
  });

  // Static file serving for generated ads
  app.use("/static/generated_ads", express.static("python_services/generated_ads"));

  const httpServer = createServer(app);
  return httpServer;
}
