import { Router } from 'express';
import { getProfileByUsername } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:username', getProfileByUsername);

export default router;