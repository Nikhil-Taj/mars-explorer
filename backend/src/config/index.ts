import dotenv from 'dotenv';
import { AppConfig } from '../types';

// Load environment variables
dotenv.config();

/**
 * Application Configuration
 * Centralized configuration management with validation
 */
class Configuration {
  private static instance: Configuration;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  public static getInstance(): Configuration {
    if (!Configuration.instance) {
      Configuration.instance = new Configuration();
    }
    return Configuration.instance;
  }

  private loadConfig(): AppConfig {
    return {
      port: parseInt(process.env.PORT || '3001', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
      nasaApiKey: process.env.NASA_API_KEY || 'DEMO_KEY',
      nasaApiBaseUrl: process.env.NASA_API_BASE_URL || 'https://api.nasa.gov',
      mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nasa-space-explorer',
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      cacheTtl: parseInt(process.env.CACHE_TTL || '3600', 10),
    };
  }

  private validateConfig(): void {
    const requiredFields: (keyof AppConfig)[] = [
      'port',
      'nodeEnv',
      'nasaApiKey',
      'nasaApiBaseUrl',
      'mongodbUri',
    ];

    for (const field of requiredFields) {
      if (!this.config[field]) {
        throw new Error(`Missing required configuration: ${field}`);
      }
    }

    if (this.config.port < 1 || this.config.port > 65535) {
      throw new Error('Port must be between 1 and 65535');
    }
  }

  public get(): AppConfig {
    return { ...this.config };
  }

  public isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  public isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }
}

export const config = Configuration.getInstance().get();
export const isDevelopment = Configuration.getInstance().isDevelopment();
export const isProduction = Configuration.getInstance().isProduction();
export default Configuration;
