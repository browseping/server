/**
 * Conversation API Definitions
 * Documentation for messaging and conversation endpoints
 */

export const conversationDefinitions = {
  schemas: {
    SendMessageRequest: {
      type: 'object',
      required: ['recipientId', 'content'],
      properties: {
        recipientId: { type: 'string', description: 'ID of the message recipient' },
        content: { type: 'string', description: 'Message content' },
        conversationId: { type: 'string', description: 'Existing conversation ID (optional)' },
      },
    },
    Message: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        senderId: { type: 'string' },
        content: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        seen: { type: 'boolean' },
      },
    },
    Conversation: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        participants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
            },
          },
        },
        lastMessage: { $ref: '#/definitions/Message' },
        unreadCount: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  },

  endpoints: {
    '/api/conversation/send': {
      post: {
        tags: ['Conversations'],
        summary: 'Send message',
        description: 'Send a message to another user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/SendMessageRequest' },
          },
        ],
        responses: {
          201: { description: 'Message sent', schema: { $ref: '#/definitions/Message' } },
          400: { description: 'Invalid request' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/conversation/{conversationId}/messages': {
      get: {
        tags: ['Conversations'],
        summary: 'Get messages',
        description: 'Get messages from a conversation',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'conversationId',
            required: true,
            type: 'string',
            description: 'ID of the conversation',
          },
          {
            in: 'query',
            name: 'page',
            type: 'number',
            description: 'Page number for pagination',
          },
          {
            in: 'query',
            name: 'limit',
            type: 'number',
            description: 'Number of messages per page',
          },
        ],
        responses: {
          200: {
            description: 'List of messages',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/Message' },
            },
          },
          404: { description: 'Conversation not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/conversation/{conversationId}/mark-seen': {
      post: {
        tags: ['Conversations'],
        summary: 'Mark conversation as seen',
        description: 'Mark all messages in a conversation as seen',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'conversationId',
            required: true,
            type: 'string',
            description: 'ID of the conversation',
          },
        ],
        responses: {
          200: { description: 'Conversation marked as seen' },
          404: { description: 'Conversation not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/conversation/{conversationId}/accept': {
      post: {
        tags: ['Conversations'],
        summary: 'Accept conversation invite',
        description: 'Accept a conversation invite from another user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'conversationId',
            required: true,
            type: 'string',
            description: 'ID of the conversation',
          },
        ],
        responses: {
          200: { description: 'Conversation invite accepted' },
          404: { description: 'Conversation not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/conversation/{conversationId}/reject': {
      post: {
        tags: ['Conversations'],
        summary: 'Reject conversation invite',
        description: 'Reject a conversation invite from another user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'conversationId',
            required: true,
            type: 'string',
            description: 'ID of the conversation',
          },
        ],
        responses: {
          200: { description: 'Conversation invite rejected' },
          404: { description: 'Conversation not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/conversation': {
      get: {
        tags: ['Conversations'],
        summary: 'Get user conversations',
        description: 'Get all conversations for the authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of conversations',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/Conversation' },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};
