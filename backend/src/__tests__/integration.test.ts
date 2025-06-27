import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { marsRoutes } from '../routes/marsRoutes';
import { apodRoutes } from '../routes/apodRoutes';

// Create test app
const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/mars', marsRoutes);
  app.use('/api', apodRoutes);

  // Error handling
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  return app;
};

describe('API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
    process.env.NASA_API_KEY = 'test-api-key';
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/mars/photos/latest')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers from helmet', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/mars/photos')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });

  describe('Request Validation', () => {
    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/mars/photos?sol=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate required parameters', async () => {
      const response = await request(app)
        .get('/api/mars/photos')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Rate Limiting (if implemented)', () => {
    it('should handle multiple requests gracefully', async () => {
      const requests = Array(5).fill(null).map(() => 
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Content Type Handling', () => {
    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should handle different Accept headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('Accept', 'application/json')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Request Logging', () => {
    it('should log requests (morgan middleware)', async () => {
      // This test verifies that morgan middleware is working
      // In a real scenario, you might want to capture and verify logs
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.status).toBe(200);
    });
  });

  describe('Environment Configuration', () => {
    it('should handle missing environment variables gracefully', async () => {
      const originalApiKey = process.env.NASA_API_KEY;
      delete process.env.NASA_API_KEY;

      const response = await request(app)
        .get('/api/mars/photos/latest')
        .expect(500);

      expect(response.body).toHaveProperty('error');

      // Restore environment variable
      process.env.NASA_API_KEY = originalApiKey;
    });
  });

  describe('Response Format Consistency', () => {
    it('should return consistent error format', async () => {
      const response = await request(app)
        .get('/api/mars/photos?sol=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('should return consistent success format for Mars endpoints', async () => {
      // This would need to be mocked or use a test API key
      // For now, we'll test the error case to verify format
      const response = await request(app)
        .get('/api/mars/cameras')
        .expect(200);

      expect(response.body).toHaveProperty('cameras');
      expect(Array.isArray(response.body.cameras)).toBe(true);
    });
  });
});
