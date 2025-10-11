import { Request, Response, NextFunction } from 'express';
import { SignupRequest, LoginRequest } from '../types/index';

const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{3,15}$/;
const consecutiveSpecialChars = /[_-]{2,}/;
const startsOrEndsWithSpecialChars = /^[_-]|[_-]$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateSignup = (req: Request, res: Response, next: NextFunction) => {
  const { username, password, email } = req.body as SignupRequest;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid username',
      error: 'Username is required'
    });
  }
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid username',
      error: 'Username must start with a letter and be 4-15 characters, only letters, digits, underscores, and hyphens allowed'
    });
  }
  if (consecutiveSpecialChars.test(username) || startsOrEndsWithSpecialChars.test(username)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid username',
      error: 'Underscores and hyphens cannot be at the start/end or used consecutively'
    });
  }
  if (/\s/.test(username)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid username',
      error: 'Username cannot contain spaces'
    });
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email',
      error: 'A valid email address is required'
    });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Invalid password',
      error: 'Password must be at least 8 characters long'
    });
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { identifier, password } = req.body;
  
  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: 'Identifier is required',
      error: 'Username or email must be provided'
    });
  }
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
      error: 'Password must be provided'
    });
  }
  
  next();
};