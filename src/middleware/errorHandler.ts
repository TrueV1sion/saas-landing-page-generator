import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Default error values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const isOperational = err.isOperational || false;

  // Send error response
  res.status(statusCode).json({
    error: {
      message: isOperational ? message : 'Something went wrong',
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
    },
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err,
    }),
  });

  // For non-operational errors in production, we might want to crash
  if (!isOperational && process.env.NODE_ENV === 'production') {
    logger.error('Non-operational error, exiting process:', err);
    process.exit(1);
  }
};