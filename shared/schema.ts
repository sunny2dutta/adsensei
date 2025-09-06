import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationTokenExpiry: timestamp("email_verification_token_expiry"),
  companyName: text("company_name"),
  brandType: text("brand_type"), // luxury, sustainable, streetwear, etc.
  instagramConnected: boolean("instagram_connected").default(false),
  instagramAccessToken: text("instagram_access_token"),
  instagramAccountId: text("instagram_account_id"),
  shopifyConnected: boolean("shopify_connected").default(false),
  shopifyStoreDomain: text("shopify_store_domain"),
  shopifyAccessToken: text("shopify_access_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  platform: text("platform").notNull(), // facebook, instagram, tiktok, etc.
  status: text("status").notNull().default("draft"), // draft, pending, approved, active, completed, published
  budget: integer("budget"), // in cents
  targetAudience: text("target_audience"),
  adCopy: text("ad_copy"),
  imageUrl: text("image_url"),
  expectedReach: text("expected_reach"),
  duration: integer("duration"), // in days
  publishedToInstagram: boolean("published_to_instagram").default(false),
  instagramPostId: text("instagram_post_id"),
  scheduledPublishDate: timestamp("scheduled_publish_date"),
  shopifyProductId: varchar("shopify_product_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // new-arrivals, seasonal-sales, lifestyle, etc.
  imageUrl: text("image_url"),
  adCopyTemplate: text("ad_copy_template").notNull(),
  tags: text("tags").array(),
  isPopular: boolean("is_popular").default(false),
  usageCount: integer("usage_count").default(0),
  rating: integer("rating").default(5), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaignMetrics = pgTable("campaign_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id).notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  spend: integer("spend").default(0), // in cents
  revenue: integer("revenue").default(0), // in cents
  date: timestamp("date").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isFromClient: boolean("is_from_client").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shopifyProducts = pgTable("shopify_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  shopifyProductId: text("shopify_product_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  vendor: text("vendor"),
  productType: text("product_type"),
  tags: text("tags").array(),
  images: jsonb("images"), // Array of image URLs
  variants: jsonb("variants"), // Product variants (size, color, etc.)
  price: integer("price"), // in cents
  compareAtPrice: integer("compare_at_price"), // in cents
  inventoryQuantity: integer("inventory_quantity"),
  handle: text("handle"), // URL handle
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  usageCount: true,
});

export const insertCampaignMetricsSchema = createInsertSchema(campaignMetrics).omit({
  id: true,
  date: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertShopifyProductSchema = createInsertSchema(shopifyProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type CampaignMetrics = typeof campaignMetrics.$inferSelect;
export type InsertCampaignMetrics = z.infer<typeof insertCampaignMetricsSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type ShopifyProduct = typeof shopifyProducts.$inferSelect;
export type InsertShopifyProduct = z.infer<typeof insertShopifyProductSchema>;
