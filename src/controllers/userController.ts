import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { SignupRequest, LoginRequest, ApiResponse } from '../types';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, password, email, displayName }: SignupRequest = req.body;
    
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        error: 'Username or email is already taken'
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        displayName: displayName || username
      }
    });
    
    const { password: _, ...userWithoutPassword } = newUser;
    
    const response: ApiResponse<typeof userWithoutPassword> = {
      success: true,
      message: 'User created successfully',
      data: userWithoutPassword
    };
    
    return res.status(201).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to create user'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing credentials',
        error: 'Username/email and password are required'
      });
    }

    const isEmail = identifier.includes('@');
    
    const user = await prisma.user.findUnique({
      where: isEmail 
        ? { email: identifier }
        : { username: identifier }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'Invalid credentials'
      });
    }
    
    const token = generateToken({ 
      id: user.id,
      username: user.username
    });

    const { password: _, ...userWithoutPassword } = user;
    
    const response: ApiResponse<any> = {
      success: true,
      message: 'Login successful',
      data: {
        ...userWithoutPassword,
        token
      }
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to authenticate user'
    });
  }
};

// GET /api/users/search?username=...
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    const currentUserId = req.user.id;

    if (!username || typeof username !== 'string' || username.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Username query parameter is required and must be at least 2 characters.',
      });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: username } },
              { displayName: { contains: username } },
            ],
          },
          { id: { not: currentUserId } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
      take: 10,
    });

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('User search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};