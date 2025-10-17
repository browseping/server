import { Router } from 'express';
import { getUserRank, getTopUsers, getUserPosition, getPublicTopUsers } from '../controllers/leaderboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/rank', authenticate, getUserRank);
router.get('/top', authenticate, getTopUsers);

router.get('/public-top', getPublicTopUsers);

router.get('/user-position', authenticate, getUserPosition);

export default router;