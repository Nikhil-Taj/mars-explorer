import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';
import { isDevelopment } from '../config';

/**
 * Custom Error Class for API Errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 * Handles all errors in a consistent format
 */
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle different types of errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  } else if (error.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation Error';
    isOperational = true;
  } else if (error.name === 'CastError') {
    // Mongoose cast error
    statusCode = 400;
    message = 'Invalid data format';
    isOperational = true;
  } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    // MongoDB errors
    statusCode = 500;
    message = 'Database error';
    isOperational = true;
  } else if (error.message.includes('NASA API')) {
    // NASA API errors
    statusCode = 502;
    message = error.message;
    isOperational = true;
  } else if (error.message.includes('timeout')) {
    // Timeout errors
    statusCode = 504;
    message = 'Request timeout';
    isOperational = true;
  }

  // Log error for debugging
  console.error(`[${new Date().toISOString()}] Error ${statusCode}:`, {
    message: error.message,
    stack: isDevelopment ? error.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: message,
    message: isOperational ? message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    path: req.path,
    statusCode,
  };

  // Include stack trace in development
  if (isDevelopment && error.stack) {
    (errorResponse as any).stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new ApiError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation Error Helper
 */
export const createValidationError = (message: string): ApiError => {
  return new ApiError(message, 400);
};

/**
 * Not Found Error Helper
 */
export const createNotFoundError = (resource: string): ApiError => {
  return new ApiError(`${resource} not found`, 404);
};

/**
 * Unauthorized Error Helper
 */
export const createUnauthorizedError = (message: string = 'Unauthorized'): ApiError => {
  return new ApiError(message, 401);
};

/**
 * Forbidden Error Helper
 */
export const createForbiddenError = (message: string = 'Forbidden'): ApiError => {
  return new ApiError(message, 403);
};

/**
 * Rate Limit Error Helper
 */
export const createRateLimitError = (message: string = 'Too many requests'): ApiError => {
  return new ApiError(message, 429);
};

export default {
  ApiError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createRateLimitError,
};
