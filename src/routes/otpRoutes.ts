import { Router } from 'express';
import { requestOTP, verifyOTPController, checkEmailVerification } from '../controllers/otpController';


const router = Router();

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTPController);
router.get('/check-verification', checkEmailVerification);

export default router;