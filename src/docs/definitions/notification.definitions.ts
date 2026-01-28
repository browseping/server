/**
 * Notification API Definitions
 * Documentation for notification-related endpoints
 */

export const notificationDefinitions = {
  schemas: {
    Notification: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string', enum: ['FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'MESSAGE', 'SYSTEM'] },
        title: { type: 'string' },
        message: { type: 'string' },
        read: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        data: { type: 'object', description: 'Additional notification data' },
      },
    },
    NotificationList: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: { $ref: '#/definitions/Notification' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        hasMore: { type: 'boolean' },
      },
    },
    UnreadCount: {
      type: 'object',
      properties: {
        count: { type: 'number' },
      },
    },
  },

  endpoints: {
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get user notifications',
        description: 'Get paginated list of notifications for the authenticated user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            type: 'number',
            description: 'Page number (default: 1)',
          },
          {
            in: 'query',
            name: 'limit',
            type: 'number',
            description: 'Items per page (default: 20)',
          },
          {
            in: 'query',
            name: 'unreadOnly',
            type: 'boolean',
            description: 'Filter to show only unread notifications',
          },
        ],
        responses: {
          200: { description: 'List of notifications', schema: { $ref: '#/definitions/NotificationList' } },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread notification count',
        description: 'Get the count of unread notifications',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Unread count', schema: { $ref: '#/definitions/UnreadCount' } },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/notifications/{notificationId}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark notification as read',
        description: 'Mark a specific notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'notificationId',
            required: true,
            type: 'string',
            description: 'ID of the notification',
          },
        ],
        responses: {
          200: { description: 'Notification marked as read' },
          404: { description: 'Notification not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        description: 'Mark all notifications as read for the authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'All notifications marked as read' },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};
