import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import prisma from '../utils/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No token provided',
        sessionExpired: true
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        username: true, 
        sessionId: true 
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'Invalid user',
        sessionExpired: true
      });
    }

    if (!user.sessionId || user.sessionId !== decoded.sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Session invalid',
        error: 'You have been logged in from another device',
        sessionExpired: true
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: 'Invalid token',
      sessionExpired: true
    });
  }
};