import { Router } from 'express';
import { requestForgotPasswordOTP, verifyForgotPasswordOTP, resetPassword } from '../controllers/forgotPasswordController';

const router = Router();

router.post('/request-otp', requestForgotPasswordOTP);

router.post('/verify-otp', verifyForgotPasswordOTP);

router.post('/reset-password', resetPassword);

export default router;