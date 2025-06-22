#!/usr/bin/env node
import { LandingPageGenerator } from './src/core/LandingPageGenerator';
import { config } from 'dotenv';
import { logger } from './src/utils/logger';

config();

const args = process.argv.slice(2);
const getArg = (name: string): string | undefined => {
  const index = args.findIndex(arg => arg === `--${name}`);
  return index !== -1 && args[index + 1] ? args[index + 1] : undefined;
};

async function cli() {
  const productName = getArg('name');
  const description = getArg('description');
  
  if (!productName || !description) {
    console.log('Usage: npx saas-gen --name "Product" --description "Description"');
    console.log('Options: --target, --features, --style, --color, --ab-testing, --demo, --deploy');
    process.exit(1);
  }

  const generator = new LandingPageGenerator();
  try {
    logger.info(`Generating landing page for ${productName}...`);
    const result = await generator.generateLandingPage({
      productName,
      description,
      targetAudience: getArg('target') || 'businesses',
      features: getArg('features')?.split(',') || ['Feature 1', 'Feature 2'],
      style: getArg('style') as any || 'modern',
      colorScheme: getArg('color') as any || 'blue',
    }, {
      enableABTesting: args.includes('--ab-testing'),
      enableInteractiveDemo: args.includes('--demo'),
      deploymentTarget: getArg('deploy') as any,
    });
    logger.info('✅ Success! Landing page generated.');
    logger.info(`Project ID: ${result.projectId}`);
    process.exit(0);
  } catch (error) {
    logger.error('Generation failed:', error);
    process.exit(1);
  }
}

cli();