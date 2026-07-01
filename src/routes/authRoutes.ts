import { Router } from 'express';
import { verifyGoogleToken, googleLogin, linkGoogleAccount } from '../controllers/googleAuthController';

const router = Router();

router.post('/google/verify', verifyGoogleToken);
router.post('/google', googleLogin);
router.post('/google/link', linkGoogleAccount);

export default router;
