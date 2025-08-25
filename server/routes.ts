import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAdCopy, generateCampaignInsights, generateCampaignSuggestions } from "./lib/openai";
import { generateInstagramAuthUrl, exchangeCodeForToken, publishToInstagram, getInstagramAccount, formatInstagramCaption, validateImageUrl } from "./lib/instagram";
import { insertCampaignSchema, insertMessageSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

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

  const httpServer = createServer(app);
  return httpServer;
}
