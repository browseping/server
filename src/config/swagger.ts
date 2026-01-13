import { Express } from 'express';
import path from 'path';
import fs from 'fs';

/**
 * Setup Swagger UI for API documentation
 * This function conditionally enables Swagger docs based on environment variable
 * and only if the swagger-output.json file exists
 * 
 * @param app - Express application instance
 */
export const setupSwagger = (app: Express): void => {
  // Check if Swagger docs should be enabled
  const enableSwaggerDocs = process.env.ENABLE_SWAGGER_DOCS === 'true';
  
  if (!enableSwaggerDocs) {
    console.log('ℹ️  Swagger documentation disabled (ENABLE_SWAGGER_DOCS=false)');
    return;
  }

  // Path to the generated Swagger JSON file
  // In development (ts-node), __dirname is in src/config
  // In production (compiled), __dirname is in dist/config
  // Swagger file is always at project root
  const swaggerFilePath = path.resolve(process.cwd(), 'swagger-output.json');

  // Check if Swagger JSON file exists
  if (!fs.existsSync(swaggerFilePath)) {
    console.warn('⚠️  Swagger documentation file not found!');
    console.warn('   Generate it by running: npm run generate:swagger');
    console.warn('   Swagger UI will not be available until documentation is generated.');
    return;
  }

  try {
    // Dynamically import swagger-ui-express only when needed
    // This prevents loading it in production when not required
    const swaggerUi = require('swagger-ui-express');
    const swaggerDocument = require(swaggerFilePath);

    // Swagger UI options
    const options = {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'BrowsePing API Documentation',
    };

    // Setup Swagger UI route
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, options)
    );

    console.log('📚 Swagger documentation available at /api-docs');
    console.log('   Visit: http://localhost:' + (process.env.PORT || 3000) + '/api-docs');
  } catch (error) {
    console.error('❌ Error setting up Swagger documentation:', error);
    console.warn('   Server will continue without API documentation.');
  }
};
