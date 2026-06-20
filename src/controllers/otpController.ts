import { Request, Response } from 'express';
import { 
  generateOTP, 
  storeOTP, 
  verifyOTP, 
  deleteOTP, 
  checkOTPAttempts, 
  incrementOTPAttempts, 
  resetOTPAttempts, 
  markEmailVerified,
  isEmailVerified,
  checkOTPVerificationAttempts,
  incrementOTPVerificationAttempts,
  resetOTPVerificationAttempts
} from '../utils/redis';
import { sendOTPEmail } from '../services/emailService';
import prisma from '../utils/prisma';
import { normalizeEmail } from '../utils/loginIdentifier';

export const requestOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        error: 'Missing email parameter'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'Please provide a valid email address'
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        error: 'This email is already associated with an account'
      });
    }

    const attempts = await checkOTPAttempts(normalizedEmail);
    if (attempts >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts',
        error: 'You have exceeded the maximum number of OTP requests. Please try again later.'
      });
    }

    const otp = generateOTP();
    await storeOTP(normalizedEmail, otp);
    await incrementOTPAttempts(normalizedEmail);

    try {
      await sendOTPEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: 'Please try again later'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        email: normalizedEmail,
        expiresIn: 300 // 5 minutes
      }
    });

  } catch (error) {
    console.error('Request OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to process OTP request'
    });
  }
};

export const verifyOTPController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
        error: 'Missing required parameters'
      });
    }

    if (typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'Please provide a valid email address'
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const verificationAttempts = await checkOTPVerificationAttempts(normalizedEmail);
    if (verificationAttempts >= 5) {
      await deleteOTP(normalizedEmail);
      await resetOTPVerificationAttempts(normalizedEmail);
      
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts',
        error: 'OTP has been expired due to too many wrong attempts. Please request a new code.',
        requireResend: true
      });
    }

    const isValid = await verifyOTP(normalizedEmail, otp);
    
    if (!isValid) {
      const newAttempts = await incrementOTPVerificationAttempts(normalizedEmail);
      
      const remainingAttempts = 5 - newAttempts;
      
      if (remainingAttempts <= 0) {
        await deleteOTP(normalizedEmail);
        await resetOTPVerificationAttempts(normalizedEmail);
        
        return res.status(429).json({
          success: false,
          message: 'Too many failed attempts',
          error: 'OTP has been expired due to too many wrong attempts. Please request a new code.',
          requireResend: true
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
        error: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
        attemptsRemaining: remainingAttempts
      });
    }

    await markEmailVerified(normalizedEmail);
    await deleteOTP(normalizedEmail);
    await resetOTPAttempts(normalizedEmail);
    await resetOTPVerificationAttempts(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        email: normalizedEmail,
        verified: true,
        validFor: 300 // 5 minutes
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to verify OTP'
    });
  }
};

export const checkEmailVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        error: 'Missing email parameter'
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const verified = await isEmailVerified(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: 'Email verification status retrieved',
      data: {
        email: normalizedEmail,
        verified
      }
    });

  } catch (error) {
    console.error('Check email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to check verification status'
    });
  }
};