import { db } from "../db";
import { systemLogs, type InsertSystemLog } from "@shared/schema";
import { lt } from "drizzle-orm";

export class DatabaseLogger {
  private static async logToDatabase(logData: InsertSystemLog) {
    try {
      await db.insert(systemLogs).values(logData);
    } catch (error) {
      // Fallback to console if database fails
      console.error('Database logging failed:', error);
      console.log('Original log:', logData);
    }
  }

  static async info(service: string, message: string, metadata?: any) {
    await this.logToDatabase({
      level: 'info',
      service,
      message,
      metadata: metadata || null
    });
    
    // Also log to console with emoji
    console.log(`ℹ️ [${service}] ${message}`);
  }

  static async warn(service: string, message: string, metadata?: any) {
    await this.logToDatabase({
      level: 'warn',
      service,
      message,
      metadata: metadata || null
    });
    
    console.warn(`⚠️ [${service}] ${message}`);
  }

  static async error(service: string, message: string, metadata?: any) {
    await this.logToDatabase({
      level: 'error',
      service,
      message,
      metadata: metadata || null
    });
    
    console.error(`❌ [${service}] ${message}`);
  }

  static async success(service: string, message: string, metadata?: any) {
    await this.logToDatabase({
      level: 'info',
      service,
      message: `✅ ${message}`,
      metadata: metadata || null
    });
    
    console.log(`✅ [${service}] ${message}`);
  }

  // Special methods for image generation logging
  static async pythonServiceStart() {
    await this.info('python', '🐍 Starting Python image generation service...');
  }

  static async pythonServiceSuccess() {
    await this.success('python', 'Python image service started successfully on port 8001');
  }

  static async pythonServiceError(error: string) {
    await this.error('python', `Python service error: ${error}`);
  }

  static async imageGenerationStart(method: 'python' | 'nodejs') {
    await this.info('image_generation', `🎨 Starting image generation via ${method}...`);
  }

  static async imageGenerationSuccess(method: 'python' | 'nodejs', metadata?: any) {
    await this.success('image_generation', `Image generated successfully via ${method}`, metadata);
  }

  static async imageGenerationFallback(reason: string) {
    await this.warn('image_generation', `🔄 Falling back to Node.js: ${reason}`);
  }

  static async imageGenerationFailure(error: string) {
    await this.error('image_generation', `💥 Image generation failed: ${error}`);
  }

  // Cleanup old logs (older than 15 days)
  static async cleanupOldLogs() {
    try {
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      
      const result = await db
        .delete(systemLogs)
        .where(lt(systemLogs.timestamp, fifteenDaysAgo));
        
      if (result.rowCount && result.rowCount > 0) {
        await this.info('system', `🧹 Cleaned up ${result.rowCount} old logs (older than 15 days)`);
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  // Initialize cleanup scheduler
  static initializeCleanup() {
    // Run cleanup on startup
    this.cleanupOldLogs();
    
    // Schedule cleanup to run every 24 hours
    setInterval(() => {
      this.cleanupOldLogs();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    
    this.info('system', '⏰ Log cleanup scheduler initialized (runs every 24 hours)');
  }
}