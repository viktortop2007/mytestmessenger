import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import logger from '../config/logger';

export interface AuthRequest extends Request {
  user?: { id: string; phoneNumber: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret) as { id: string; phoneNumber: string };
    req.user = decoded;
    next();
  } catch (err) {
    logger.error('Auth error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
