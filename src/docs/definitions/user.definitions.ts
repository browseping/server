/**
 * User API Definitions
 * Documentation for user-related endpoints
 */

export const userDefinitions = {
  // Request/Response schemas
  schemas: {
    SignupRequest: {
      type: 'object',
      required: ['email', 'password', 'username'],
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: { type: 'string', minLength: 6, example: 'securePassword123' },
        username: { type: 'string', example: 'johndoe' },
      },
    },
    LoginRequest: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: { type: 'string', example: 'securePassword123' },
      },
    },
    AuthResponse: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-string' },
            email: { type: 'string', example: 'user@example.com' },
            username: { type: 'string', example: 'johndoe' },
          },
        },
      },
    },
    UserSearchResult: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
      },
    },
  },

  // Endpoint documentation
  endpoints: {
    '/api/users/signup': {
      post: {
        tags: ['Users'],
        summary: 'Register a new user',
        description: 'Create a new user account with email, password, and username',
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/SignupRequest' },
          },
        ],
        responses: {
          201: { description: 'User created successfully', schema: { $ref: '#/definitions/AuthResponse' } },
          400: { description: 'Validation error or user already exists' },
        },
      },
    },
    '/api/users/login': {
      post: {
        tags: ['Users'],
        summary: 'User login',
        description: 'Authenticate user with email and password',
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/LoginRequest' },
          },
        ],
        responses: {
          200: { description: 'Login successful', schema: { $ref: '#/definitions/AuthResponse' } },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/users/logout': {
      post: {
        tags: ['Users'],
        summary: 'User logout',
        description: 'Logout the authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Logout successful' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/users/search': {
      get: {
        tags: ['Users'],
        summary: 'Search users',
        description: 'Search for users by username or email',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'query',
            type: 'string',
            description: 'Search query string',
          },
        ],
        responses: {
          200: {
            description: 'Search results',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/UserSearchResult' },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};
