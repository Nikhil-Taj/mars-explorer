import mongoose from 'mongoose';
import { config, isDevelopment } from '../config';

/**
 * Database Connection Utility
 * Handles MongoDB connection with proper error handling and configuration
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Connect to MongoDB
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      // Configure mongoose options
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      };

      // Connect to MongoDB
      await mongoose.connect(config.mongodbUri, options);

      this.isConnected = true;
      console.log(`✅ Connected to MongoDB: ${this.getMaskedUri()}`);

      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw new Error(`Failed to disconnect from database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if database is connected
   */
  public isDbConnected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get database connection status
   */
  public getConnectionStatus(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }

  /**
   * Setup event listeners for database connection
   */
  private setupEventListeners(): void {
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ Mongoose connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📡 Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await this.disconnect();
        console.log('🛑 Database connection closed due to application termination');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('❌ Uncaught Exception:', error);
      try {
        await this.disconnect();
      } catch (disconnectError) {
        console.error('❌ Error disconnecting during uncaught exception:', disconnectError);
      }
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      try {
        await this.disconnect();
      } catch (disconnectError) {
        console.error('❌ Error disconnecting during unhandled rejection:', disconnectError);
      }
      process.exit(1);
    });
  }

  /**
   * Get masked database URI for logging (hides credentials)
   */
  private getMaskedUri(): string {
    try {
      const uri = config.mongodbUri;
      // Replace credentials with asterisks
      return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://*****:*****@');
    } catch {
      return 'mongodb://***masked***';
    }
  }

  /**
   * Health check for database connection
   */
  public async healthCheck(): Promise<{
    status: string;
    connected: boolean;
    readyState: number;
    host?: string;
    name?: string;
  }> {
    try {
      const connection = mongoose.connection;
      return {
        status: this.getConnectionStatus(),
        connected: this.isDbConnected(),
        readyState: connection.readyState,
        host: connection.host,
        name: connection.name,
      };
    } catch (error) {
      return {
        status: 'error',
        connected: false,
        readyState: -1,
      };
    }
  }
}

// Export singleton instance
export const database = DatabaseConnection.getInstance();
export default database;
