/**
 * Swagger Documentation Generator Script
 * 
 * This script generates the swagger-output.json file from the API definitions.
 * command to generate swagger file: npm run generate:swagger
 * the swagger docs will be available at: http://localhost:3000/api-docs
 */

import * as fs from 'fs';
import * as path from 'path';
import { swaggerConfig } from './swagger.config';
import { getAllSchemas, getAllPaths } from './definitions';

interface SwaggerDoc {
  swagger: string;
  info: typeof swaggerConfig.info;
  host: string;
  basePath: string;
  schemes: string[];
  securityDefinitions: typeof swaggerConfig.securityDefinitions;
  tags: typeof swaggerConfig.tags;
  paths: Record<string, object>;
  definitions: Record<string, object>;
}

function generateSwaggerDoc(): SwaggerDoc {
  console.log('Starting Swagger documentation generation...');

  const schemas = getAllSchemas();
  const paths = getAllPaths();

  const swaggerDoc: SwaggerDoc = {
    swagger: '2.0',
    info: swaggerConfig.info,
    host: swaggerConfig.host,
    basePath: swaggerConfig.basePath,
    schemes: swaggerConfig.schemes,
    securityDefinitions: swaggerConfig.securityDefinitions,
    tags: swaggerConfig.tags,
    paths: paths,
    definitions: schemas,
  };

  console.log(`Generated documentation for ${Object.keys(paths).length} endpoints`);
  console.log(`Generated ${Object.keys(schemas).length} schema definitions`);

  return swaggerDoc;
}

function writeSwaggerFile(doc: SwaggerDoc): void {
  const outputPath = path.join(__dirname, 'swagger-output.json');
  
  try {
    fs.writeFileSync(outputPath, JSON.stringify(doc, null, 2), 'utf-8');
    console.log(`Swagger documentation generated successfully!`);
    console.log(`Output file: ${outputPath}`);
  } catch (error) {
    console.error('Error writing swagger output file:', error);
    process.exit(1);
  }
}

// Main execution
const swaggerDoc = generateSwaggerDoc();
writeSwaggerFile(swaggerDoc);

console.log('\n To view the documentation:');
console.log('   1. Start the dev server: npm run dev');
console.log('   2. Open http://localhost:3000/api-docs in your browser');
