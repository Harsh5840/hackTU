import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify',
  '/health'
];

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (PUBLIC_ROUTES.some(route => req.path.startsWith(route))) {
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    logger.warn(`Access attempt without token: ${req.path}`);
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    logger.error(`Invalid token: ${(err as Error).message}`);
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};
