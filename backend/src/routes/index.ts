import { Router } from 'express';
import apodRoutes from './apodRoutes';
import marsRoutes from './marsRoutes';
import { ApiResponse } from '../types';

/**
 * Main Routes Index
 * Combines all route modules and provides API information
 */
const router = Router();

/**
 * @route   GET /api
 * @desc    API information and available endpoints
 * @access  Public
 */
router.get('/', (req, res) => {
  const response: ApiResponse<{
    name: string;
    version: string;
    description: string;
    endpoints: Record<string, string>;
  }> = {
    success: true,
    data: {
      name: 'NASA Space Explorer API',
      version: '1.0.0',
      description: 'Clean Architecture API for NASA Space Data',
      endpoints: {
        'GET /api/mars/photos': 'Get Mars rover photos',
        'GET /api/mars/photos/latest': 'Get latest Mars photos',
        'GET /api/mars/photos/sol/:sol': 'Get photos by Martian day',
        'GET /api/mars/photos/date/:date': 'Get photos by Earth date',
        'GET /api/mars/cameras': 'Get available cameras',
        'GET /api/mars/rover': 'Get rover information',
        'GET /api/mars/health': 'Mars service health check',
        'GET /api/apod': 'Get APOD data (legacy)',
      },
    },
    message: 'Welcome to NASA Space Explorer API',
    timestamp: new Date().toISOString(),
  };

  res.json(response);
});

// Mount route modules
router.use('/mars', marsRoutes);
router.use('/apod', apodRoutes);

export default router;
