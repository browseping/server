/**
 * Forgot Password API Definitions
 * Documentation for password recovery endpoints
 */

export const forgotPasswordDefinitions = {
  schemas: {
    ForgotPasswordOTPRequest: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email', description: 'Email address for password reset' },
      },
    },
    VerifyForgotPasswordOTPRequest: {
      type: 'object',
      required: ['email', 'otp'],
      properties: {
        email: { type: 'string', format: 'email', description: 'Email address' },
        otp: { type: 'string', description: 'OTP code received via email' },
      },
    },
    ResetPasswordRequest: {
      type: 'object',
      required: ['email', 'token', 'newPassword'],
      properties: {
        email: { type: 'string', format: 'email', description: 'Email address' },
        token: { type: 'string', description: 'Reset token received after OTP verification' },
        newPassword: { type: 'string', minLength: 6, description: 'New password' },
      },
    },
  },

  endpoints: {
    '/api/forgot-password/request-otp': {
      post: {
        tags: ['Forgot Password'],
        summary: 'Request password reset OTP',
        description: 'Request an OTP code for password reset',
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/ForgotPasswordOTPRequest' },
          },
        ],
        responses: {
          200: { description: 'OTP sent successfully' },
          400: { description: 'Invalid email or rate limited' },
          404: { description: 'User not found' },
        },
      },
    },
    '/api/forgot-password/verify-otp': {
      post: {
        tags: ['Forgot Password'],
        summary: 'Verify password reset OTP',
        description: 'Verify OTP and receive a reset token',
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/VerifyForgotPasswordOTPRequest' },
          },
        ],
        responses: {
          200: { description: 'OTP verified, reset token returned' },
          400: { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/api/forgot-password/reset-password': {
      post: {
        tags: ['Forgot Password'],
        summary: 'Reset password',
        description: 'Reset password using the reset token',
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/ResetPasswordRequest' },
          },
        ],
        responses: {
          200: { description: 'Password reset successfully' },
          400: { description: 'Invalid token or weak password' },
        },
      },
    },
  },
};
