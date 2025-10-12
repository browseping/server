import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'peerpulse-secret-key';

export const generateSessionId = (): string => {
  return uuidv4();
};

export const generateToken = (payload: { id: string; username: string; sessionId: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

export const verifyToken = (token: string): { id: string; username: string; sessionId: string; iat: number; exp: number } => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string; sessionId: string; iat: number; exp: number };
  } catch (error) {
    throw new Error('Invalid token');
  }
};