import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { users, campaigns, templates, campaignMetrics, messages } from "@shared/schema";
import type { 
  User, 
  InsertUser, 
  Campaign, 
  InsertCampaign, 
  Template, 
  InsertTemplate, 
  CampaignMetrics, 
  InsertCampaignMetrics, 
  Message, 
  InsertMessage 
} from "@shared/schema";
import type { IStorage } from "./storage";
import bcrypt from "bcryptjs";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    
    const userData: InsertUser = {
      ...insertUser,
      password: hashedPassword
    };

    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    return user || undefined;
  }

  // Helper method for authentication
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    return user;
  }

  // Campaigns
  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async getCampaignsByUserId(userId: string): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.userId, userId));
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db
      .insert(campaigns)
      .values(insertCampaign)
      .returning();
    
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined> {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    
    return campaign || undefined;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Templates
  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.category, category));
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    
    return template;
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    await db
      .update(templates)
      .set({ usageCount: sql`${templates.usageCount} + 1` })
      .where(eq(templates.id, id));
  }

  // Campaign Metrics
  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics[]> {
    return await db.select().from(campaignMetrics).where(eq(campaignMetrics.campaignId, campaignId));
  }

  async createCampaignMetrics(insertMetrics: InsertCampaignMetrics): Promise<CampaignMetrics> {
    const [metrics] = await db
      .insert(campaignMetrics)
      .values(insertMetrics)
      .returning();
    
    return metrics;
  }

  // Messages
  async getMessagesByCampaignId(campaignId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.campaignId, campaignId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    
    return message;
  }

  // Seed initial data (templates)
  async seedData(): Promise<void> {
    // Check if templates already exist
    const existingTemplates = await this.getAllTemplates();
    if (existingTemplates.length > 0) {
      console.log("Templates already seeded, skipping...");
      return;
    }

    const sampleTemplates: InsertTemplate[] = [
      {
        name: "New Collection Launch",
        description: "Perfect for announcing fresh arrivals with excitement and urgency",
        category: "new-arrivals",
        imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
        adCopyTemplate: "🌟 NEW ARRIVALS ALERT! 🌟\n\nDiscover our latest {collection_name} featuring {key_features}. Limited quantities available - shop now before they're gone!\n\n✨ {brand_values}\n🚚 Free shipping on orders over ${minimum_order}\n\nShop now: {website_url}",
        tags: ["new-arrivals", "urgency", "limited"],
        isPopular: true,
        rating: 5
      },
      {
        name: "Seasonal Sale",
        description: "Drive conversions with time-sensitive offers and seasonal messaging",
        category: "seasonal-sales",
        imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050",
        adCopyTemplate: "🍂 {season} SALE IS HERE! 🍂\n\nSave {discount_percentage}% on our entire {collection_name}. Perfect for {seasonal_context}.\n\n⏰ Limited time only - sale ends {end_date}\n🎯 Use code: {promo_code}\n\nShop the sale: {website_url}",
        tags: ["sale", "seasonal", "discount"],
        isPopular: false,
        rating: 5
      },
      {
        name: "Lifestyle & Values",
        description: "Connect with customers through brand values and lifestyle messaging",
        category: "lifestyle",
        imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
        adCopyTemplate: "More than just fashion - it's a lifestyle. 🌿\n\n{brand_story} Our {product_category} reflects your values: {brand_values}.\n\nJoin a community that cares about {causes}.\n\n📱 Share your style with #{hashtag}\n\nDiscover more: {website_url}",
        tags: ["lifestyle", "values", "community"],
        isPopular: false,
        rating: 4
      }
    ];

    // Insert templates
    for (const template of sampleTemplates) {
      await this.createTemplate(template);
    }

    console.log("Database seeded with initial templates");
  }
}