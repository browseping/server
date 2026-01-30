/**
 * Friend API Definitions
 * Documentation for friend-related endpoints
 */

export const friendDefinitions = {
  schemas: {
    FriendRequest: {
      type: 'object',
      required: ['friendId'],
      properties: {
        friendId: { type: 'string', description: 'ID of the user to send friend request to' },
      },
    },
    Friend: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'IGNORED'] },
      },
    },
    FriendshipStatus: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['NONE', 'PENDING', 'ACCEPTED', 'IGNORED'] },
        requestId: { type: 'string' },
      },
    },
  },

  endpoints: {
    '/api/friends/request': {
      post: {
        tags: ['Friends'],
        summary: 'Send friend request',
        description: 'Send a friend request to another user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/FriendRequest' },
          },
        ],
        responses: {
          201: { description: 'Friend request sent successfully' },
          400: { description: 'Invalid request or already friends' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/friends/accept/{requestId}': {
      patch: {
        tags: ['Friends'],
        summary: 'Accept friend request',
        description: 'Accept a pending friend request',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'requestId',
            required: true,
            type: 'string',
            description: 'ID of the friend request',
          },
        ],
        responses: {
          200: { description: 'Friend request accepted' },
          404: { description: 'Friend request not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/friends/ignore/{requestId}': {
      patch: {
        tags: ['Friends'],
        summary: 'Ignore friend request',
        description: 'Ignore a pending friend request',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'requestId',
            required: true,
            type: 'string',
            description: 'ID of the friend request',
          },
        ],
        responses: {
          200: { description: 'Friend request ignored' },
          404: { description: 'Friend request not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/friends/request/{requestId}': {
      delete: {
        tags: ['Friends'],
        summary: 'Cancel friend request',
        description: 'Cancel a pending friend request you sent',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'requestId',
            required: true,
            type: 'string',
            description: 'ID of the friend request to cancel',
          },
        ],
        responses: {
          200: { description: 'Friend request cancelled' },
          404: { description: 'Friend request not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/friends/{friendId}': {
      delete: {
        tags: ['Friends'],
        summary: 'Remove friend',
        description: 'Remove a user from your friends list',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'friendId',
            required: true,
            type: 'string',
            description: 'ID of the friend to remove',
          },
        ],
        responses: {
          200: { description: 'Friend removed' },
          404: { description: 'Friend not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/friends': {
      get: {
        tags: ['Friends'],
        summary: 'Get all friends',
        description: 'Get list of all accepted friends',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of friends',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/Friend' },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/friends/firends-with-status': {
      get: {
        tags: ['Friends'],
        summary: 'Get friends with status',
        description: 'Get all friends with their online status',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of friends with status' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/friends/requests/pending': {
      get: {
        tags: ['Friends'],
        summary: 'Get pending friend requests',
        description: 'Get all pending friend requests received',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of pending friend requests' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/friends/requests/sent': {
      get: {
        tags: ['Friends'],
        summary: 'Get sent friend requests',
        description: 'Get all pending friend requests sent by you',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of sent friend requests' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/friends/requests/ignored': {
      get: {
        tags: ['Friends'],
        summary: 'Get ignored friend requests',
        description: 'Get all ignored friend requests',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of ignored friend requests' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/friends/status': {
      get: {
        tags: ['Friends'],
        summary: 'Get friendship status',
        description: 'Get the friendship status with a specific user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'userId',
            type: 'string',
            description: 'ID of the user to check status with',
          },
        ],
        responses: {
          200: { description: 'Friendship status', schema: { $ref: '#/definitions/FriendshipStatus' } },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};
