import { Router } from 'express';
import { signup, login, searchUsers, logout } from '../controllers/userController';
import { validateSignup, validateLogin } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/logout', authenticate, logout);
router.get('/search', authenticate, searchUsers);

export default router;
