/**
 * Profile API Definitions
 * Documentation for profile-related endpoints
 */

export const profileDefinitions = {
  schemas: {
    Profile: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        bio: { type: 'string' },
        avatarUrl: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
    UpdateProfileRequest: {
      type: 'object',
      properties: {
        bio: { type: 'string', description: 'User bio/description' },
        avatarUrl: { type: 'string', description: 'URL to avatar image' },
      },
    },
    PrivacySettings: {
      type: 'object',
      properties: {
        emailPrivacy: { type: 'string', enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'] },
        onlinePrivacy: { type: 'string', enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'] },
        lastOnlinePrivacy: { type: 'string', enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'] },
        tabPrivacyLevel: { type: 'string', enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'] },
      },
    },
  },

  endpoints: {
    '/api/profile/{username}': {
      get: {
        tags: ['Profile'],
        summary: 'Get profile by username',
        description: 'Get a user profile by their username',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'username',
            required: true,
            type: 'string',
            description: 'Username of the profile to fetch',
          },
        ],
        responses: {
          200: { description: 'User profile', schema: { $ref: '#/definitions/Profile' } },
          404: { description: 'User not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/profile/privacy': {
      patch: {
        tags: ['Profile'],
        summary: 'Update privacy settings',
        description: 'Update privacy settings for the authenticated user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/PrivacySettings' },
          },
        ],
        responses: {
          200: { description: 'Privacy settings updated' },
          400: { description: 'Invalid settings' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/profile': {
      patch: {
        tags: ['Profile'],
        summary: 'Update profile',
        description: 'Update profile information for the authenticated user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/UpdateProfileRequest' },
          },
        ],
        responses: {
          200: { description: 'Profile updated', schema: { $ref: '#/definitions/Profile' } },
          400: { description: 'Invalid data' },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};
