/**
 * Swagger Configuration
 * Contains the base configuration for Swagger documentation
 */

export const swaggerConfig = {
  info: {
    title: 'BrowsePing API',
    version: '1.0.0',
    description: 'API documentation for BrowsePing - A browser activity tracking and social platform',
    contact: {
      name: 'BrowsePing Support',
    },
  },
  host: 'localhost:3000',
  basePath: '/',
  schemes: ['http', 'https'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Bearer token for authentication. Format: Bearer <token>',
    },
  },
  tags: [
    { name: 'Users', description: 'User authentication and management' },
    { name: 'Friends', description: 'Friend requests and relationships' },
    { name: 'Profile', description: 'User profile management' },
    { name: 'Analytics', description: 'Browser activity analytics' },
    { name: 'Leaderboard', description: 'User rankings and leaderboard' },
    { name: 'Conversations', description: 'Messaging and conversations' },
    { name: 'Notifications', description: 'User notifications' },
    { name: 'OTP', description: 'Email verification via OTP' },
    { name: 'Forgot Password', description: 'Password recovery' },
  ],
  definitions: {},
};

export const outputFile = './src/docs/swagger-output.json';
export const endpointsFiles = ['./src/routes/*.ts', './src/routes/**/*.ts'];
