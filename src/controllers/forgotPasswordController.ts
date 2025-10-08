import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
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
  clearEmailVerification,
  checkOTPVerificationAttempts,
  incrementOTPVerificationAttempts,
  resetOTPVerificationAttempts
} from '../utils/redis';
import { sendOTPEmail, sendPasswordResetOTPEmail } from '../services/emailService';
import prisma from '../utils/prisma';

export const requestForgotPasswordOTP = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body; // Can be username or email

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Username or email is required',
        error: 'Missing identifier parameter'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(identifier);
    
    let user;
    let email;

    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: identifier },
        select: { id: true, email: true, username: true }
      });
      email = identifier;
    } else {
      user = await prisma.user.findUnique({
        where: { username: identifier },
        select: { id: true, email: true, username: true }
      });
      email = user?.email;
    }

    if (!user || !email) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
        error: 'No account found with this username or email'
      });
    }

    const attempts = await checkOTPAttempts(email);
    if (attempts >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts',
        error: 'You have exceeded the maximum number of OTP requests. Please try again later.'
      });
    }

    const otp = generateOTP();
    await storeOTP(email, otp);
    await incrementOTPAttempts(email);

    try {
      await sendPasswordResetOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
        error: 'Please try again later'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset OTP sent successfully',
      data: {
        identifier: isEmail ? email : identifier,
        isUsernameRequest: !isEmail,
        expiresIn: 300 // 5 minutes
      }
    });

  } catch (error) {
    console.error('Request forgot password OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to process password reset request'
    });
  }
};

export const verifyForgotPasswordOTP = async (req: Request, res: Response) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and OTP are required',
        error: 'Missing required parameters'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(identifier);
    let email: string;

    if (isEmail) {
      email = identifier;
    } else {
      const user = await prisma.user.findUnique({
        where: { username: identifier },
        select: { email: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Account not found',
          error: 'No account found with this username'
        });
      }

      email = user.email;
    }

    const verificationAttempts = await checkOTPVerificationAttempts(email);
    if (verificationAttempts >= 5) {
      await deleteOTP(email);
      await resetOTPVerificationAttempts(email);
      
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts',
        error: 'OTP has been expired due to too many wrong attempts. Please request a new code.',
        requireResend: true
      });
    }

    const isValid = await verifyOTP(email, otp);
    
    if (!isValid) {
      const newAttempts = await incrementOTPVerificationAttempts(email);
      const remainingAttempts = 5 - newAttempts;
      
      if (remainingAttempts <= 0) {
        await deleteOTP(email);
        await resetOTPVerificationAttempts(email);
        
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

    await markEmailVerified(email);
    await deleteOTP(email);
    await resetOTPAttempts(email);
    await resetOTPVerificationAttempts(email);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        identifier,
        verified: true,
        validFor: 300 // 5 minutes
      }
    });

  } catch (error) {
    console.error('Verify forgot password OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to verify OTP'
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { identifier, newPassword, confirmPassword } = req.body;

    if (!identifier || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        error: 'Missing required parameters'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(identifier);
    let email: string;
    let user;

    if (isEmail) {
      email = identifier;
      user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true }
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: identifier },
        select: { id: true, email: true }
      });
      email = user?.email || '';
    }

    if (!user || !email) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'No user found with this identifier'
      });
    }

    const verified = await isEmailVerified(email);
    if (!verified) {
      return res.status(403).json({
        success: false,
        message: 'Verification required',
        error: 'Please verify your OTP first'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        error: 'New password and confirm password must match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password too weak',
        error: 'Password must be at least 6 characters long'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    await clearEmailVerification(email);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        identifier,
        message: 'You can now login with your new password'
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to reset password'
    });
  }
};