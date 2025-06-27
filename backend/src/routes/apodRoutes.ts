import { Router } from 'express';
import { ApodController } from '../controllers/ApodController';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * APOD Routes
 * Defines all routes for APOD (Astronomy Picture of the Day) endpoints
 */
const router = Router();
const apodController = new ApodController();

/**
 * @route   GET /api/apod/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', asyncHandler(apodController.healthCheck));

/**
 * @route   GET /api/apod/stats
 * @desc    Get APOD statistics
 * @access  Public
 */
router.get('/stats', asyncHandler(apodController.getStats));

/**
 * @route   GET /api/apod/search
 * @desc    Search APOD data
 * @access  Public
 * @query   q - search query (required)
 * @query   limit - number of results (optional, default: 20, max: 100)
 */
router.get('/search', asyncHandler(apodController.searchApod));

/**
 * @route   GET /api/apod/latest
 * @desc    Get latest APOD entries
 * @access  Public
 * @query   limit - number of results (optional, default: 10, max: 50)
 */
router.get('/latest', asyncHandler(apodController.getLatestApod));

/**
 * @route   GET /api/apod/random
 * @desc    Get random APOD entries
 * @access  Public
 * @query   count - number of results (optional, default: 1, max: 20)
 */
router.get('/random', asyncHandler(apodController.getRandomApod));

/**
 * @route   GET /api/apod/:date
 * @desc    Get APOD for specific date
 * @access  Public
 * @param   date - Date in YYYY-MM-DD format
 */
router.get('/:date', asyncHandler(apodController.getApodByDate));

/**
 * @route   GET /api/apod
 * @desc    Get APOD data with various options
 * @access  Public
 * @query   date - specific date (YYYY-MM-DD)
 * @query   start_date - start date for range (YYYY-MM-DD)
 * @query   end_date - end date for range (YYYY-MM-DD)
 * @query   count - number of random entries (1-100)
 */
router.get('/', asyncHandler(apodController.getApod));

export default router;
