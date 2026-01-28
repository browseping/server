/**
 * Swagger Documentation Setup
 * 
 * Documentation is only available in development mode and when the
 * swagger-output.json file has been generated.
 */

import { Express, Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs';

const SWAGGER_OUTPUT_PATH = path.join(__dirname, 'swagger-output.json');

/**
 * Check if API documentation should be enabled
 */
function isDocsEnabled(): boolean {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const enableDocs = process.env.ENABLE_API_DOCS;

  // Explicitly disabled
  if (enableDocs === 'false') {
    return false;
  }

  // Explicitly enabled
  if (enableDocs === 'true') {
    return true;
  }

  // Default: enabled in development, disabled in production
  return nodeEnv !== 'production';
}

/**
 * Check if swagger output file exists
 */
function swaggerFileExists(): boolean {
  return fs.existsSync(SWAGGER_OUTPUT_PATH);
}

/**
 * Setup Swagger documentation routes
 * 
 * @param app Express application instance
 */
export async function setupSwaggerDocs(app: Express): Promise<void> {
  if (!isDocsEnabled()) {
    console.log('📚 API documentation is disabled');
    return;
  }

  if (!swaggerFileExists()) {
    console.log('⚠️  Swagger documentation not found. Run "npm run generate:swagger" to generate.');
    
    // Add a placeholder route that informs developers
    app.get('/api-docs', (_req: Request, res: Response) => {
      res.status(503).json({
        error: 'API documentation not available',
        message: 'Swagger documentation has not been generated. Run "npm run generate:swagger" first.',
      });
    });
    return;
  }

  try {
    // Dynamic import to avoid requiring these in production
    const swaggerUi = await import('swagger-ui-express');
    const swaggerDocument = JSON.parse(fs.readFileSync(SWAGGER_OUTPUT_PATH, 'utf-8'));

    // Update host based on current environment
    const port = process.env.PORT || 3000;
    swaggerDocument.host = `localhost:${port}`;

    // Swagger UI options
    const swaggerOptions = {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'BrowsePing API Documentation',
    };

    // Serve Swagger UI
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, swaggerOptions)
    );

    // Serve raw swagger JSON
    app.get('/api-docs.json', (_req: Request, res: Response) => {
      res.json(swaggerDocument);
    });

    console.log(`📚 API documentation available at /api-docs`);
  } catch (error) {
    console.error('❌ Failed to setup Swagger documentation:', error);
    
    // Add error route
    app.get('/api-docs', (_req: Request, res: Response) => {
      res.status(500).json({
        error: 'API documentation setup failed',
        message: 'There was an error loading the Swagger documentation.',
      });
    });
  }
}
