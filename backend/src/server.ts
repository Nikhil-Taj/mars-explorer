import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, isDevelopment } from './config';
import { database } from './utils/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

/**
 * NASA Space Explorer Server
 * Clean Architecture Express.js server with comprehensive middleware setup
 */
class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.port;
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware stack
   */
  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    const corsOrigins = config.corsOrigin.split(',').map(origin => origin.trim());
    this.app.use(cors({
      origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    if (isDevelopment) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Request timestamp middleware
    this.app.use((req, res, next) => {
      req.requestTime = new Date().toISOString();
      next();
    });

    // Health check endpoint (before rate limiting)
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: config.nodeEnv,
          version: '1.0.0',
        },
        message: 'Server is running',
      });
    });
  }

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        data: {
          name: 'NASA Space Explorer API',
          version: '1.0.0',
          description: 'Clean Architecture API for NASA Space Data',
          documentation: '/api',
        },
        message: 'Welcome to NASA Space Explorer API',
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // 404 handler (must be after all routes)
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Try to connect to database (optional for demo)
      console.log('🔌 Connecting to database...');
      try {
        await database.connect();
        console.log('✅ Database connected successfully');
      } catch (dbError) {
        console.warn('⚠️ Database connection failed, running without database:',
          dbError instanceof Error ? dbError.message : 'Unknown error');
        console.log('📝 Note: Some features may be limited without database');
      }

      // Start HTTP server
      this.app.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`📍 Environment: ${config.nodeEnv}`);
        console.log(`🌐 API URL: http://localhost:${this.port}/api`);
        console.log(`💚 Health Check: http://localhost:${this.port}/health`);

        if (isDevelopment) {
          console.log(`🔧 Development mode enabled`);
          console.log(`📊 Database: ${database.getConnectionStatus()}`);
        }
      });

      // Graceful shutdown handlers
      this.setupGracefulShutdown();
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      try {
        // Close database connection
        await database.disconnect();
        console.log('✅ Database connection closed');
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Handle different termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  /**
   * Get Express app instance
   */
  public getApp(): Application {
    return this.app;
  }
}

// Create and start server
const server = new Server();

// Start server if this file is run directly
if (require.main === module) {
  server.start().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}

export default server;
export { Server };
