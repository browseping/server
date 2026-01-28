/**
 * Leaderboard API Definitions
 * Documentation for leaderboard-related endpoints
 */

export const leaderboardDefinitions = {
  schemas: {
    LeaderboardEntry: {
      type: 'object',
      properties: {
        rank: { type: 'number' },
        userId: { type: 'string' },
        username: { type: 'string' },
        totalMinutes: { type: 'number' },
        avatarUrl: { type: 'string' },
      },
    },
    UserRank: {
      type: 'object',
      properties: {
        rank: { type: 'number' },
        totalMinutes: { type: 'number' },
        percentile: { type: 'number' },
      },
    },
    UserPosition: {
      type: 'object',
      properties: {
        position: { type: 'number' },
        totalUsers: { type: 'number' },
        percentile: { type: 'number' },
      },
    },
  },

  endpoints: {
    '/api/leaderboard/rank': {
      get: {
        tags: ['Leaderboard'],
        summary: 'Get user rank',
        description: 'Get the authenticated user\'s rank on the leaderboard',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User rank information', schema: { $ref: '#/definitions/UserRank' } },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/leaderboard/top': {
      get: {
        tags: ['Leaderboard'],
        summary: 'Get top users',
        description: 'Get the top users on the leaderboard',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'limit',
            type: 'number',
            description: 'Number of top users to return (default: 10)',
          },
        ],
        responses: {
          200: {
            description: 'Top users list',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/LeaderboardEntry' },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/leaderboard/public-top': {
      get: {
        tags: ['Leaderboard'],
        summary: 'Get public top users',
        description: 'Get the public leaderboard (no authentication required)',
        parameters: [
          {
            in: 'query',
            name: 'limit',
            type: 'number',
            description: 'Number of top users to return (default: 10)',
          },
        ],
        responses: {
          200: {
            description: 'Public top users list',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/LeaderboardEntry' },
            },
          },
        },
      },
    },
    '/api/leaderboard/user-position': {
      get: {
        tags: ['Leaderboard'],
        summary: 'Get user position',
        description: 'Get the authenticated user\'s position on the leaderboard',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User position information', schema: { $ref: '#/definitions/UserPosition' } },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};
