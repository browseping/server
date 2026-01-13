import { Router } from 'express';
import { requestForgotPasswordOTP, verifyForgotPasswordOTP, resetPassword } from '../controllers/forgotPasswordController';

const router = Router();

/**
 * @swagger
 * /api/forgot-password/request-otp:
 *   post:
 *     summary: Request password reset OTP
 *     description: Send a one-time password to the registered email for password reset
 *     tags: [Password Recovery]
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
 *         description: Password reset OTP sent successfully
 *       404:
 *         description: Email not found
 *       500:
 *         description: Internal server error
 */
router.post('/request-otp', requestForgotPasswordOTP);

/**
 * @swagger
 * /api/forgot-password/verify-otp:
 *   post:
 *     summary: Verify password reset OTP
 *     description: Verify the OTP sent for password reset
 *     tags: [Password Recovery]
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
router.post('/verify-otp', verifyForgotPasswordOTP);

/**
 * @swagger
 * /api/forgot-password/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Reset user password after OTP verification
 *     tags: [Password Recovery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePassword123!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid request or OTP not verified
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password', resetPassword);

export default router;