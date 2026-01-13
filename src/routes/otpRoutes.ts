import { Router } from 'express';
import { requestOTP, verifyOTPController, checkEmailVerification } from '../controllers/otpController';


const router = Router();

/**
 * @swagger
 * /api/otp/request-otp:
 *   post:
 *     summary: Request OTP for email verification
 *     description: Send a one-time password to the provided email address for verification
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid email address
 *       500:
 *         description: Internal server error
 */
router.post('/request-otp', requestOTP);

/**
 * @swagger
 * /api/otp/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verify the one-time password sent to the email address
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Internal server error
 */
router.post('/verify-otp', verifyOTPController);

/**
 * @swagger
 * /api/otp/check-verification:
 *   get:
 *     summary: Check email verification status
 *     description: Check if an email address has been verified
 *     tags: [OTP]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email address to check
 *         example: user@example.com
 *     responses:
 *       200:
 *         description: Verification status returned
 *       400:
 *         description: Email parameter missing
 *       500:
 *         description: Internal server error
 */
router.get('/check-verification', checkEmailVerification);

export default router;