import { Request, Response, NextFunction } from 'express';
import { ApodService } from '../services/ApodService';
import { ApiResponse, GetApodRequest } from '../types';

/**
 * APOD Controller - Presentation Layer
 * Handles HTTP requests and responses for APOD endpoints
 * Implements proper error handling and response formatting
 */
export class ApodController {
  private apodService: ApodService;

  constructor() {
    this.apodService = new ApodService();
  }

  /**
   * Get APOD data
   * GET /api/apod
   * Query params: date, start_date, end_date, count
   */
  getApod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params: GetApodRequest = {};

      if (req.query.date) {
        params.date = req.query.date as string;
      }
      if (req.query.start_date) {
        params.start_date = req.query.start_date as string;
      }
      if (req.query.end_date) {
        params.end_date = req.query.end_date as string;
      }
      if (req.query.count) {
        params.count = parseInt(req.query.count as string, 10);
      }

      const data = await this.apodService.getApod(params);
      
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: 'APOD data retrieved successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get APOD for specific date
   * GET /api/apod/:date
   */
  getApodByDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { date } = req.params;
      
      if (!date) {
        res.status(400).json({
          success: false,
          error: 'Date parameter is required',
          message: 'Please provide a date in YYYY-MM-DD format',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const data = await this.apodService.getApodByDate(date);
      
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: `APOD data for ${date} retrieved successfully`,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search APOD data
   * GET /api/apod/search
   * Query params: q (query), limit
   */
  searchApod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
          message: 'Please provide a search query using the "q" parameter',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Invalid limit',
          message: 'Limit must be between 1 and 100',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const data = await this.apodService.searchApod(query.trim(), limit);
      
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: `Search results for "${query}" retrieved successfully`,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get latest APOD entries
   * GET /api/apod/latest
   * Query params: limit
   */
  getLatestApod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (limit < 1 || limit > 50) {
        res.status(400).json({
          success: false,
          error: 'Invalid limit',
          message: 'Limit must be between 1 and 50',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const data = await this.apodService.getLatestApod(limit);
      
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: `Latest ${data.length} APOD entries retrieved successfully`,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get random APOD entries
   * GET /api/apod/random
   * Query params: count
   */
  getRandomApod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = req.query.count ? parseInt(req.query.count as string, 10) : 1;

      if (count < 1 || count > 20) {
        res.status(400).json({
          success: false,
          error: 'Invalid count',
          message: 'Count must be between 1 and 20',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const data = await this.apodService.getRandomApod(count);
      
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: `${data.length} random APOD entries retrieved successfully`,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get APOD statistics
   * GET /api/apod/stats
   */
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.apodService.getStats();
      
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        message: 'APOD statistics retrieved successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Health check endpoint
   * GET /api/apod/health
   */
  healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response: ApiResponse<{ status: string; uptime: number }> = {
        success: true,
        data: {
          status: 'healthy',
          uptime: process.uptime(),
        },
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export default ApodController;
