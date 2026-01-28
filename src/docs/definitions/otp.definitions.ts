/**
 * OTP API Definitions
 * Documentation for OTP (email verification) endpoints
 */

export const otpDefinitions = {
  schemas: {
    RequestOTPRequest: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email', description: 'Email address to send OTP to' },
      },
    },
    VerifyOTPRequest: {
      type: 'object',
      required: ['email', 'otp'],
      properties: {
        email: { type: 'string', format: 'email', description: 'Email address' },
        otp: { type: 'string', description: 'OTP code received via email' },
      },
    },
    VerificationStatus: {
      type: 'object',
      properties: {
        verified: { type: 'boolean' },
        email: { type: 'string' },
      },
    },
  },

  endpoints: {
    '/api/otp/request-otp': {
      post: {
        tags: ['OTP'],
        summary: 'Request OTP',
        description: 'Request an OTP code to be sent to the specified email',
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/RequestOTPRequest' },
          },
        ],
        responses: {
          200: { description: 'OTP sent successfully' },
          400: { description: 'Invalid email or rate limited' },
        },
      },
    },
    '/api/otp/verify-otp': {
      post: {
        tags: ['OTP'],
        summary: 'Verify OTP',
        description: 'Verify the OTP code for email verification',
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/VerifyOTPRequest' },
          },
        ],
        responses: {
          200: { description: 'OTP verified successfully' },
          400: { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/api/otp/check-verification': {
      get: {
        tags: ['OTP'],
        summary: 'Check email verification status',
        description: 'Check if an email has been verified',
        parameters: [
          {
            in: 'query',
            name: 'email',
            type: 'string',
            required: true,
            description: 'Email address to check',
          },
        ],
        responses: {
          200: { description: 'Verification status', schema: { $ref: '#/definitions/VerificationStatus' } },
        },
      },
    },
  },
};
