import { Request, Response, NextFunction } from 'express';
import { MarsRoverService } from '../services/MarsRoverService';
import { ApiResponse, GetMarsPhotosRequest } from '../types';

/**
 * Mars Rover Controller - Presentation Layer
 * Handles HTTP requests and responses for Mars Rover endpoints
 */
export class MarsController {
  private marsRoverService: MarsRoverService;

  constructor() {
    this.marsRoverService = new MarsRoverService();
  }

  /**
   * Get Mars photos
   * GET /api/mars/photos
   * Query params: sol, earth_date, camera, page
   */
  getPhotos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params: GetMarsPhotosRequest = {};

      if (req.query.sol) {
        params.sol = parseInt(req.query.sol as string, 10);
      }
      if (req.query.earth_date) {
        params.earth_date = req.query.earth_date as string;
      }
      if (req.query.camera) {
        params.camera = req.query.camera as string;
      }
      if (req.query.page) {
        params.page = parseInt(req.query.page as string, 10);
      }

      const data = await this.marsRoverService.getCuriosityPhotos(params);

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: `Retrieved ${data.length} Mars photos`,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get photos by Sol
   * GET /api/mars/photos/sol/:sol
   */
  getPhotosBySol = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const solParam = req.params.sol;
      if (!solParam) {
        res.status(400).json({
          success: false,
          error: 'Sol parameter is required',
          message: 'Please provide a valid Sol number',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const sol = parseInt(solParam, 10);
      const camera = req.query.camera as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

      if (isNaN(sol)) {
        res.status(400).json({
          success: false,
          error: 'Invalid Sol parameter',
          message: 'Sol must be a valid number',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const data = await this.marsRoverService.getPhotosBySol(sol, camera, page);

      // Set cache headers for Sol photos (cache for 1 hour since Sol data doesn't change)
      res.set({
        'Cache-Control': 'public, max-age=3600',
        'ETag': `"sol-${sol}-${camera || 'all'}-${page}"`,
      });

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: `Retrieved ${data.length} photos from Sol ${sol}`,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get photos by Earth date
   * GET /api/mars/photos/date/:date
   */
  getPhotosByDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const earthDate = req.params.date;
      const camera = req.query.camera as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

      if (!earthDate) {
        res.status(400).json({
          success: false,
          error: 'Date parameter is required',
          message: 'Please provide a date in YYYY-MM-DD format',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const data = await this.marsRoverService.getPhotosByEarthDate(earthDate, camera, page);

      // Set cache headers for date photos (cache for 1 hour since date data doesn't change)
      res.set({
        'Cache-Control': 'public, max-age=3600',
        'ETag': `"date-${earthDate}-${camera || 'all'}-${page}"`,
      });

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: `Retrieved ${data.length} photos from ${earthDate}`,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get latest photos
   * GET /api/mars/photos/latest
   */
  getLatestPhotos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const camera = req.query.camera as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;

      if (limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Invalid limit',
          message: 'Limit must be between 1 and 100',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const data = await this.marsRoverService.getLatestPhotos(camera, limit);

      // Set cache headers for latest photos (cache for 10 minutes)
      res.set({
        'Cache-Control': 'public, max-age=600',
        'ETag': `"latest-${camera || 'all'}-${limit}-${Date.now().toString(36)}"`,
      });

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: `Retrieved ${data.length} latest Mars photos`,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get available cameras
   * GET /api/mars/cameras
   */
  getCameras = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = this.marsRoverService.getAvailableCameras();

      // Set cache headers for cameras (cache for 24 hours since camera list doesn't change)
      res.set({
        'Cache-Control': 'public, max-age=86400',
        'ETag': '"cameras-v1"',
      });

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: 'Available cameras retrieved successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get rover information
   * GET /api/mars/rover
   */
  getRoverInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = {
        name: 'Curiosity',
        landing_date: '2012-08-05',
        launch_date: '2011-11-26',
        status: 'active',
        mission_duration: Math.floor((Date.now() - new Date('2012-08-05').getTime()) / (1000 * 60 * 60 * 24)),
        description: 'NASA\'s Curiosity rover is exploring Gale Crater on Mars as part of NASA\'s Mars Science Laboratory (MSL) mission.',
        cameras: this.marsRoverService.getAvailableCameras().length,
      };

      // Set cache headers for rover info (cache for 1 hour)
      res.set({
        'Cache-Control': 'public, max-age=3600',
        'ETag': '"rover-info-v1"',
      });

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: 'Rover information retrieved successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Mars mission statistics
   * GET /api/mars/stats
   */
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sol, camera, limit = '100' } = req.query;

      // Get sample data for statistics
      const photos = await this.marsRoverService.getLatestPhotos(
        camera as string,
        parseInt(limit as string)
      );

      // Calculate statistics
      const cameraStats = photos.reduce((acc, photo) => {
        acc[photo.camera.name] = (acc[photo.camera.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const solStats = photos.reduce((acc, photo) => {
        acc[photo.sol] = (acc[photo.sol] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const dateStats = photos.reduce((acc, photo) => {
        acc[photo.earth_date] = (acc[photo.earth_date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const data = {
        totalPhotos: photos.length,
        uniqueSols: Object.keys(solStats).length,
        uniqueDates: Object.keys(dateStats).length,
        activeCameras: Object.keys(cameraStats).length,
        cameraDistribution: cameraStats,
        solDistribution: solStats,
        dateDistribution: dateStats,
        averagePhotosPerSol: photos.length / Math.max(Object.keys(solStats).length, 1),
        averagePhotosPerCamera: photos.length / Math.max(Object.keys(cameraStats).length, 1),
        mostActiveSol: Object.entries(solStats).reduce((a, b) => a[1] > b[1] ? a : b, ['0', 0]),
        mostActiveCamera: Object.entries(cameraStats).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]),
        dataRange: {
          minSol: Math.min(...photos.map(p => p.sol)),
          maxSol: Math.max(...photos.map(p => p.sol)),
          minDate: photos.reduce((min, p) => p.earth_date < min ? p.earth_date : min, photos[0]?.earth_date || ''),
          maxDate: photos.reduce((max, p) => p.earth_date > max ? p.earth_date : max, photos[0]?.earth_date || ''),
        },
      };

      // Set cache headers
      res.set({
        'Cache-Control': 'public, max-age=1800', // 30 minutes
        'ETag': `"stats-${camera || 'all'}-${limit}"`,
      });

      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: 'Mars mission statistics retrieved successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Health check endpoint
   * GET /api/mars/health
   */
  healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response: ApiResponse<{ status: string; uptime: number }> = {
        success: true,
        data: {
          status: 'healthy',
          uptime: process.uptime(),
        },
        message: 'Mars service is healthy',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate NASA API key
   * GET /api/mars/validate-key
   */
  validateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Test a simple NASA API call to validate the key
      const testPhotos = await this.marsRoverService.getPhotosBySol(1000, 'FHAZ', 1);

      const response: ApiResponse<{
        keyValid: boolean;
        message: string;
        testResults: {
          photosFound: number;
          samplePhoto: any;
        };
      }> = {
        success: true,
        data: {
          keyValid: true,
          message: 'NASA API key is valid and working',
          testResults: {
            photosFound: testPhotos.length,
            samplePhoto: testPhotos[0] ? {
              id: testPhotos[0].id,
              sol: testPhotos[0].sol,
              camera: testPhotos[0].camera.name
            } : null
          }
        },
        message: 'API key validation successful',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<{
        keyValid: boolean;
        message: string;
        error: string;
      }> = {
        success: false,
        data: {
          keyValid: false,
          message: 'NASA API key validation failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        message: 'API key validation failed',
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
    }
  };
}

export default MarsController;
