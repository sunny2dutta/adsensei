import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAdCopy, generateCampaignInsights } from "./lib/openai";
import { generateInstagramAuthUrl, exchangeCodeForToken, publishToInstagram, getInstagramAccount, formatInstagramCaption, validateImageUrl } from "./lib/instagram";
import { insertCampaignSchema, insertMessageSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
