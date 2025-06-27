import { Router } from 'express';
import { MarsController } from '../controllers/MarsController';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Mars Rover Routes
 * Defines all routes for Mars Rover photo endpoints
 */
const router = Router();
const marsController = new MarsController();

/**
 * @route   GET /api/mars/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', asyncHandler(marsController.healthCheck));

/**
 * @route   GET /api/mars/validate-key
 * @desc    Validate NASA API key
 * @access  Public
 */
router.get('/validate-key', asyncHandler(marsController.validateApiKey));

/**
 * @route   GET /api/mars/rover
 * @desc    Get Curiosity rover information
 * @access  Public
 */
router.get('/rover', asyncHandler(marsController.getRoverInfo));

/**
 * @route   GET /api/mars/cameras
 * @desc    Get available cameras
 * @access  Public
 */
router.get('/cameras', asyncHandler(marsController.getCameras));

/**
 * @route   GET /api/mars/stats
 * @desc    Get Mars mission statistics
 * @access  Public
 * @query   camera - camera name (optional)
 * @query   limit - number of photos to analyze (optional, default: 100)
 */
router.get('/stats', asyncHandler(marsController.getStats));

/**
 * @route   GET /api/mars/photos/latest
 * @desc    Get latest Mars photos
 * @access  Public
 * @query   camera - camera name (optional)
 * @query   limit - number of results (optional, default: 25, max: 100)
 */
router.get('/photos/latest', asyncHandler(marsController.getLatestPhotos));

/**
 * @route   GET /api/mars/photos/sol/:sol
 * @desc    Get Mars photos by Sol (Martian day)
 * @access  Public
 * @param   sol - Martian day number (0-4000)
 * @query   camera - camera name (optional)
 * @query   page - page number (optional, default: 1)
 */
router.get('/photos/sol/:sol', asyncHandler(marsController.getPhotosBySol));

/**
 * @route   GET /api/mars/photos/date/:date
 * @desc    Get Mars photos by Earth date
 * @access  Public
 * @param   date - Earth date in YYYY-MM-DD format
 * @query   camera - camera name (optional)
 * @query   page - page number (optional, default: 1)
 */
router.get('/photos/date/:date', asyncHandler(marsController.getPhotosByDate));

/**
 * @route   GET /api/mars/photos
 * @desc    Get Mars photos with various options
 * @access  Public
 * @query   sol - Martian day number (0-4000)
 * @query   earth_date - Earth date (YYYY-MM-DD)
 * @query   camera - camera name
 * @query   page - page number (default: 1)
 */
router.get('/photos', asyncHandler(marsController.getPhotos));

export default router;
