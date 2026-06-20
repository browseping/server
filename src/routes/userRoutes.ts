import { Router } from 'express';
import { signup, login, searchUsers, logout } from '../controllers/userController';
import { validateSignup, validateLogin } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { emailRateLimiter } from '../middleware/emailRateLimiter';

const router = Router();

router.post('/signup', validateSignup, signup);
// Email-based rate limiter runs BEFORE validation to protect against brute force on password
// validateLogin checks format, emailRateLimiter checks attempt count per email
router.post('/login', emailRateLimiter, validateLogin, login);
router.post('/logout', authenticate, logout);
router.get('/search', authenticate, searchUsers);

export default router;
