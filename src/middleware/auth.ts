import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};