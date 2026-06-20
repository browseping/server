import { Request, Response, NextFunction } from 'express';
import redis, { incrementKeyWithExpiry } from '../utils/redis';
import { normalizeLoginIdentifier, hashIdentifierForLog } from '../utils/loginIdentifier';

/**
 * Email-based rate limiter middleware for login endpoint
 * Protects against brute force attacks on specific user accounts
 *
 * Configuration (via environment variables):
 * - LOGIN_ATTEMPT_MAX: Maximum failed login attempts allowed within window (default: 5)
 * - LOGIN_ATTEMPT_WINDOW: Time window in seconds to track attempts (default: 60 = 1 minute)
 * - LOGIN_COOLDOWN_DURATION: Lockout duration in seconds after exceeding max attempts (default: 600 = 10 minutes)
 */
export const emailRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const MAX_LOGIN_ATTEMPTS = parseInt(process.env.LOGIN_ATTEMPT_MAX || '5', 10);
    const ATTEMPT_WINDOW = parseInt(process.env.LOGIN_ATTEMPT_WINDOW || '60', 10);
    const COOLDOWN_PERIOD = parseInt(process.env.LOGIN_COOLDOWN_DURATION || '600', 10);

    const normalizedIdentifier = normalizeLoginIdentifier(req.body?.identifier);

    if (!normalizedIdentifier) {
      return next();
    }

    const logId = hashIdentifierForLog(normalizedIdentifier);
    const rateLimitKey = `login-attempts:${normalizedIdentifier}`;
    const cooldownKey = `login-cooldown:${normalizedIdentifier}`;

    const isOnCooldown = await redis.get(cooldownKey);
    if (isOnCooldown) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'Invalid credentials'
      });
    }

    const attemptCount = await redis.get(rateLimitKey);
    const currentAttempts = parseInt(attemptCount || '0', 10);

    if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
      await redis.setex(cooldownKey, COOLDOWN_PERIOD, 'locked');
      console.log(`[Rate Limiter] Account locked: ${logId} | Cooldown: ${COOLDOWN_PERIOD}s`);

      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'Invalid credentials'
      });
    }

    res.locals.incrementEmailAttempt = async () => {
      const newCount = await incrementKeyWithExpiry(rateLimitKey, ATTEMPT_WINDOW);

      if (newCount === 1) {
        console.log(`[Rate Limiter] New window: ${logId} | Window duration: ${ATTEMPT_WINDOW}s`);
      }

      if (newCount >= MAX_LOGIN_ATTEMPTS) {
        await redis.setex(cooldownKey, COOLDOWN_PERIOD, 'locked');
        console.log(
          `[Rate Limiter] Max attempts reached: ${logId} (${newCount}/${MAX_LOGIN_ATTEMPTS}) | Locked for ${COOLDOWN_PERIOD}s`
        );
      } else {
        console.log(`[Rate Limiter] Failed attempt: ${logId} (${newCount}/${MAX_LOGIN_ATTEMPTS})`);
      }
    };

    res.locals.clearEmailAttempts = async () => {
      await redis.del(rateLimitKey);
      console.log(`[Rate Limiter] Attempts cleared: ${logId} (successful login)`);
    };

    next();
  } catch (error) {
    console.error('[Rate Limiter] Error:', error);
    next();
  }
};
