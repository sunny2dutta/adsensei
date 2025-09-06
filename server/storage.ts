import { type User, type InsertUser, type Campaign, type InsertCampaign, type Template, type InsertTemplate, type CampaignMetrics, type InsertCampaignMetrics, type Message, type InsertMessage, type ShopifyProduct, type InsertShopifyProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  
  // Email verification methods
  generateEmailVerificationToken(userId: string): Promise<string>;
  verifyEmailToken(token: string): Promise<User | null>;
  getUserByVerificationToken(token: string): Promise<User | null>;

  // Campaigns
  getCampaign(id: string): Promise<Campaign | undefined>;
  getCampaignsByUserId(userId: string): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<boolean>;

  // Templates
  getTemplate(id: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  incrementTemplateUsage(id: string): Promise<void>;

  // Campaign Metrics
  getCampaignMetrics(campaignId: string): Promise<CampaignMetrics[]>;
  createCampaignMetrics(metrics: InsertCampaignMetrics): Promise<CampaignMetrics>;

  // Messages
  getMessagesByCampaignId(campaignId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Shopify Products
  getShopifyProduct(id: string): Promise<ShopifyProduct | undefined>;
  getShopifyProducts(userId: string): Promise<ShopifyProduct[]>;
  createShopifyProduct(product: InsertShopifyProduct): Promise<ShopifyProduct>;
  updateShopifyProduct(id: string, updates: Partial<ShopifyProduct>): Promise<ShopifyProduct | undefined>;
  deleteShopifyProduct(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private campaigns: Map<string, Campaign>;
  private templates: Map<string, Template>;
  private campaignMetrics: Map<string, CampaignMetrics>;
  private messages: Map<string, Message>;
  private shopifyProducts: Map<string, ShopifyProduct>;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.templates = new Map();
    this.campaignMetrics = new Map();
    this.messages = new Map();
    this.shopifyProducts = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed templates
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

    sampleTemplates.forEach(template => {
      const id = randomUUID();
      const fullTemplate: Template = {
        ...template,
        id,
        usageCount: Math.floor(Math.random() * 1000) + 100,
        createdAt: new Date()
      };
      this.templates.set(id, fullTemplate);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      emailVerified: false,
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null,
      instagramConnected: false,
      instagramAccessToken: null,
      instagramAccountId: null,
      shopifyConnected: false,
      shopifyStoreDomain: null,
      shopifyAccessToken: null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || user.password !== password) return null;
    return user;
  }

  // Email verification methods (stub implementations for MemStorage)
  async generateEmailVerificationToken(userId: string): Promise<string> {
    const token = Math.random().toString(36).substring(2, 15);
    const user = this.users.get(userId);
    if (user) {
      user.emailVerificationToken = token;
      user.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      this.users.set(userId, user);
    }
    return token;
  }

  async verifyEmailToken(token: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(u => u.emailVerificationToken === token);
    if (!user || !user.emailVerificationTokenExpiry) return null;
    
    if (new Date() > user.emailVerificationTokenExpiry) return null;
    
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiry = null;
    this.users.set(user.id, user);
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | null> {
    return Array.from(this.users.values()).find(u => u.emailVerificationToken === token) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updates
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Campaigns
  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignsByUserId(userId: string): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(campaign => campaign.userId === userId);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;

    const updatedCampaign: Campaign = {
      ...campaign,
      ...updates,
      updatedAt: new Date()
    };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Templates
  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(template => template.category === category);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = {
      ...insertTemplate,
      id,
      usageCount: 0,
      createdAt: new Date()
    };
    this.templates.set(id, template);
    return template;
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    const template = this.templates.get(id);
    if (template) {
      template.usageCount = (template.usageCount || 0) + 1;
      this.templates.set(id, template);
    }
  }

  // Campaign Metrics
  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics[]> {
    return Array.from(this.campaignMetrics.values()).filter(metrics => metrics.campaignId === campaignId);
  }

  async createCampaignMetrics(insertMetrics: InsertCampaignMetrics): Promise<CampaignMetrics> {
    const id = randomUUID();
    const metrics: CampaignMetrics = {
      ...insertMetrics,
      id,
      date: new Date()
    };
    this.campaignMetrics.set(id, metrics);
    return metrics;
  }

  // Messages
  async getMessagesByCampaignId(campaignId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.campaignId === campaignId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  // Shopify Products
  async getShopifyProduct(id: string): Promise<ShopifyProduct | undefined> {
    return this.shopifyProducts.get(id);
  }

  async getShopifyProducts(userId: string): Promise<ShopifyProduct[]> {
    return Array.from(this.shopifyProducts.values()).filter(product => product.userId === userId);
  }

  async createShopifyProduct(insertProduct: InsertShopifyProduct): Promise<ShopifyProduct> {
    const id = randomUUID();
    const product: ShopifyProduct = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.shopifyProducts.set(id, product);
    return product;
  }

  async updateShopifyProduct(id: string, updates: Partial<ShopifyProduct>): Promise<ShopifyProduct | undefined> {
    const product = this.shopifyProducts.get(id);
    if (!product) return undefined;

    const updatedProduct: ShopifyProduct = {
      ...product,
      ...updates,
      updatedAt: new Date()
    };
    this.shopifyProducts.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteShopifyProduct(id: string): Promise<boolean> {
    return this.shopifyProducts.delete(id);
  }
}

import { DatabaseStorage } from './database-storage';

// Use DatabaseStorage instead of MemStorage for production
export const storage = new DatabaseStorage();

// Initialize the database with seed data
storage.seedData().catch(console.error);
