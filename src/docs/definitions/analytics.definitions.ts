/**
 * Analytics API Definitions
 * Documentation for analytics-related endpoints
 */

export const analyticsDefinitions = {
  schemas: {
    PresenceData: {
      type: 'object',
      properties: {
        date: { type: 'string', format: 'date' },
        totalMinutes: { type: 'number' },
        sessions: { type: 'number' },
      },
    },
    HourlyPresence: {
      type: 'object',
      properties: {
        hour: { type: 'number', minimum: 0, maximum: 23 },
        minutes: { type: 'number' },
      },
    },
    TabUsage: {
      type: 'object',
      properties: {
        domain: { type: 'string' },
        title: { type: 'string' },
        totalMinutes: { type: 'number' },
        visits: { type: 'number' },
      },
    },
    WeeklyPresence: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/definitions/PresenceData' },
        },
        totalMinutes: { type: 'number' },
      },
    },
  },

  endpoints: {
    '/api/analytics/presence/today': {
      get: {
        tags: ['Analytics'],
        summary: 'Get today\'s presence',
        description: 'Get browser presence data for today',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Today\'s presence data', schema: { $ref: '#/definitions/PresenceData' } },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/analytics/presence/weekly': {
      get: {
        tags: ['Analytics'],
        summary: 'Get weekly presence',
        description: 'Get browser presence data for the past week',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Weekly presence data', schema: { $ref: '#/definitions/WeeklyPresence' } },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/analytics/presence/hourly': {
      get: {
        tags: ['Analytics'],
        summary: 'Get hourly presence',
        description: 'Get browser presence data broken down by hour',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Hourly presence data',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/HourlyPresence' },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/analytics/tab-usage/today': {
      get: {
        tags: ['Analytics'],
        summary: 'Get today\'s tab usage',
        description: 'Get tab/website usage data for today',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Today\'s tab usage',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/TabUsage' },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/analytics/tab-usage/weekly': {
      get: {
        tags: ['Analytics'],
        summary: 'Get weekly tab usage',
        description: 'Get tab/website usage data for the past week',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Weekly tab usage',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/TabUsage' },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/analytics/flush': {
      post: {
        tags: ['Analytics'],
        summary: 'Flush analytics',
        description: 'Manually trigger analytics data flush from cache to database',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Analytics flushed successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};
