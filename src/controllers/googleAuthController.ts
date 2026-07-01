import { Request, Response } from 'express';
import { AuthProvider } from '@prisma/client';
import prisma from '../utils/prisma';
import { verifyGoogleIdToken } from '../services/googleAuthService';
import { hashIdentifierForLog, normalizeEmail, isEmailIdentifier } from '../utils/loginIdentifier';
import { generateToken, generateSessionId } from '../utils/jwt';
import { ApiResponse } from '../types';
import bcrypt from 'bcrypt';
import { googleAccountLinked, hasPasswordLogin } from '../utils/authHelpers';

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]{3,15}$/;

const generateUniqueUsername = async (email: string): Promise<string> => {
  const localPart = email.split('@')[0] ?? 'user';
  let base = localPart
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/[_-]{2,}/g, '_')
    .replace(/^[_-]+|[_-]+$/g, '');

  if (!base || !/^[a-zA-Z]/.test(base)) {
    base = 'user';
  }

  base = base.slice(0, 8);

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${base}${suffix}`.slice(0, 15);

    if (!USERNAME_REGEX.test(candidate)) {
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { username: candidate } });
    if (!existing) {
      return candidate;
    }
  }

  throw new Error('Failed to generate unique username');
};

const createSessionResponse = async (user: { id: string; username: string }) => {
  const sessionId = generateSessionId();

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      sessionId,
      lastOnlineAt: new Date(),
    },
  });

  const token = generateToken({
    id: updatedUser.id,
    username: updatedUser.username,
    sessionId,
  });

  const { password: _, sessionId: _sessionId, ...userWithoutPassword } = updatedUser;

  return {
    ...userWithoutPassword,
    token,
  };
};

export const verifyGoogleToken = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID token is required',
        error: 'Missing or invalid idToken in request body',
      });
    }

    const profile = await verifyGoogleIdToken(idToken);

    console.log(
      `[Google Auth] Token verified: googleId=${hashIdentifierForLog(profile.googleId)} email=${hashIdentifierForLog(profile.email)}`
    );

    return res.status(200).json({
      success: true,
      message: 'Google ID token verified',
      data: profile,
    });
  } catch (error) {
    console.error('[Google Auth] Token verification failed:', error);

    return res.status(401).json({
      success: false,
      message: 'Invalid Google ID token',
      error: error instanceof Error ? error.message : 'Verification failed',
    });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID token is required',
        error: 'Missing or invalid idToken in request body',
      });
    }

    const profile = await verifyGoogleIdToken(idToken);

    if (!profile.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified',
        error: 'Your Google account email must be verified',
      });
    }

    let user = await prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (!user) {
      const userByEmail = await prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (userByEmail) {
        if (
          hasPasswordLogin(userByEmail) &&
          !googleAccountLinked(userByEmail)
        ) {
          return res.status(409).json({
            success: false,
            message: 'Account already exists',
            error:
              'An account with this email already exists. Please log in with your password, then link your Google account.',
            usePasswordLogin: true,
            canLink: true,
          });
        }

        if (
          googleAccountLinked(userByEmail) &&
          userByEmail.googleId !== profile.googleId
        ) {
          return res.status(409).json({
            success: false,
            message: 'Account conflict',
            error: 'This email is linked to a different Google account.',
          });
        }

        user = await prisma.user.update({
          where: { id: userByEmail.id },
          data: {
            googleId: profile.googleId,
            authProvider: hasPasswordLogin(userByEmail)
              ? AuthProvider.LOCAL
              : AuthProvider.GOOGLE,
            emailVerified: true,
            displayName: userByEmail.displayName ?? profile.name,
            avatarUrl: userByEmail.avatarUrl ?? profile.picture,
          },
        });

        console.log(
          `[Google Auth] Linked Google account: googleId=${hashIdentifierForLog(profile.googleId)}`
        );
      } else {
        const username = await generateUniqueUsername(profile.email);

        user = await prisma.user.create({
          data: {
            username,
            email: profile.email,
            googleId: profile.googleId,
            authProvider: AuthProvider.GOOGLE,
            emailVerified: true,
            displayName: profile.name ?? username,
            avatarUrl: profile.picture,
          },
        });

        console.log(
          `[Google Auth] New user created: googleId=${hashIdentifierForLog(profile.googleId)} username=${username}`
        );
      }
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          displayName: user.displayName ?? profile.name,
          avatarUrl: profile.picture ?? user.avatarUrl,
          emailVerified: true,
        },
      });
    }

    const sessionData = await createSessionResponse(user);

    const response: ApiResponse<typeof sessionData> = {
      success: true,
      message: 'Login successful',
      data: sessionData,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[Google Auth] Login failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to authenticate with Google',
    });
  }
};

export const linkGoogleAccount = async (req: Request, res: Response) => {
  try {
    const { idToken, identifier, password } = req.body;

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID token is required',
        error: 'Missing or invalid idToken in request body',
      });
    }

    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Identifier is required',
        error: 'Username or email must be provided',
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
        error: 'Password must be provided to link a Google account',
      });
    }

    const profile = await verifyGoogleIdToken(idToken);

    if (!profile.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified',
        error: 'Your Google account email must be verified',
      });
    }

    const normalizedIdentifier = isEmailIdentifier(identifier)
      ? normalizeEmail(identifier)
      : identifier;

    const user = await prisma.user.findUnique({
      where: isEmailIdentifier(identifier)
        ? { email: normalizedIdentifier }
        : { username: normalizedIdentifier },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'Invalid credentials',
      });
    }

    if (!hasPasswordLogin(user)) {
      return res.status(400).json({
        success: false,
        message: 'Linking not available',
        error: 'This account does not use password login.',
        useGoogleLogin: true,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'Invalid credentials',
      });
    }

    if (normalizeEmail(user.email) !== profile.email) {
      return res.status(403).json({
        success: false,
        message: 'Email mismatch',
        error: 'Google account email does not match this BrowsePing account.',
      });
    }

    if (googleAccountLinked(user)) {
      if (user.googleId === profile.googleId) {
        return res.status(200).json({
          success: true,
          message: 'Google account already linked',
          data: { linked: true },
        });
      }

      return res.status(409).json({
        success: false,
        message: 'Account already linked',
        error: 'This account is already linked to a different Google account.',
      });
    }

    const existingGoogleUser = await prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (existingGoogleUser && existingGoogleUser.id !== user.id) {
      return res.status(409).json({
        success: false,
        message: 'Google account in use',
        error: 'This Google account is already linked to another BrowsePing user.',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: profile.googleId,
        authProvider: AuthProvider.LOCAL,
        emailVerified: true,
        avatarUrl: user.avatarUrl ?? profile.picture,
        displayName: user.displayName ?? profile.name,
      },
    });

    console.log(
      `[Google Auth] Account linked: googleId=${hashIdentifierForLog(profile.googleId)} userId=${hashIdentifierForLog(user.id)}`
    );

    return res.status(200).json({
      success: true,
      message: 'Google account linked successfully',
      data: {
        linked: true,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('[Google Auth] Account linking failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to link Google account',
    });
  }
};
