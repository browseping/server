"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const doc = {
    info: {
        title: 'BrowsePing API',
        version: '1.0.0',
        description: 'API documentation for BrowsePing - A real-time social presence platform that transforms web browsing into a shared social experience.',
    },
    host: 'localhost:3000',
    basePath: '/',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            name: 'Users',
            description: 'User authentication and management endpoints',
        },
        {
            name: 'Friends',
            description: 'Friend request and relationship management endpoints',
        },
        {
            name: 'Profile',
            description: 'User profile management endpoints',
        },
        {
            name: 'Analytics',
            description: 'User activity and analytics tracking endpoints',
        },
        {
            name: 'Leaderboard',
            description: 'Leaderboard and ranking endpoints',
        },
        {
            name: 'Conversations',
            description: 'Messaging and conversation endpoints',
        },
        {
            name: 'Notifications',
            description: 'Notification management endpoints',
        },
        {
            name: 'OTP',
            description: 'One-time password verification endpoints',
        },
        {
            name: 'Password Recovery',
            description: 'Password reset and recovery endpoints',
        },
    ],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'Enter your bearer token in the format: Bearer {token}',
        },
    },
    definitions: {
        ApiResponse: {
            success: true,
            message: 'Operation completed successfully',
            data: {},
        },
        ErrorResponse: {
            success: false,
            message: 'Error message',
            error: 'Detailed error description',
        },
        User: {
            id: 'user-id',
            username: 'johndoe',
            displayName: 'John Doe',
            email: 'john@example.com',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        },
    },
};
const outputFile = path_1.default.join(__dirname, '..', 'swagger-output.json');
const endpointsFiles = [
    path_1.default.join(__dirname, '..', 'src', 'routes', 'userRoutes.ts'),
    path_1.default.join(__dirname, '..', 'src', 'routes', 'friendRoutes.ts'),
    path_1.default.join(__dirname, '..', 'src', 'routes', 'profileRoutes.ts'),
    path_1.default.join(__dirname, '..', 'src', 'routes', 'analyticsRoutes.ts'),
    path_1.default.join(__dirname, '..', 'src', 'routes', 'leaderboardRoutes.ts'),
    path_1.default.join(__dirname, '..', 'src', 'routes', 'conversationRoutes.ts'),
    path_1.default.join(__dirname, '..', 'src', 'routes', 'notificationRoutes.ts'),
    path_1.default.join(__dirname, '..', 'src', 'routes', 'otpRoutes.ts'),
    path_1.default.join(__dirname, '..', 'src', 'routes', 'forgotPasswordRoutes.ts'),
];
console.log('🔄 Generating Swagger documentation...');
console.log('📁 Output file:', outputFile);
console.log('📝 Scanning routes:', endpointsFiles.length, 'files');
(0, swagger_autogen_1.default)({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc)
    .then(() => {
    console.log('✅ Swagger documentation generated successfully!');
    console.log('📄 File created:', outputFile);
    console.log('');
    console.log('To view the documentation:');
    console.log('  1. Set ENABLE_SWAGGER_DOCS=true in your .env file');
    console.log('  2. Run: npm run dev');
    console.log('  3. Visit: http://localhost:3000/api-docs');
    console.log('');
})
    .catch((error) => {
    console.error('❌ Error generating Swagger documentation:', error);
    process.exit(1);
});
