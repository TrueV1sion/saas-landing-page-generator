/**
 * Quick Start Script for SaaS Landing Page Generator
 * Run: npm run quickstart
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from './src/utils/logger';

const execAsync = promisify(exec);

async function quickstart() {
  logger.info('🚀 Starting SaaS Landing Page Generator Setup...\n');

  try {
    // Check Node version
    const { stdout: nodeVersion } = await execAsync('node --version');
    logger.info(`✓ Node.js ${nodeVersion.trim()} detected`);

    // Install dependencies
    logger.info('📦 Installing dependencies...');
    await execAsync('npm install');
    logger.info('✓ Dependencies installed');

    // Generate Prisma client
    logger.info('🗄️ Setting up database...');
    await execAsync('npx prisma generate');
    logger.info('✓ Database client generated');

    // Create necessary directories
    logger.info('📁 Creating directories...');
    await execAsync('mkdir -p generated/preview generated/live generated/demos logs');
    logger.info('✓ Directories created');

    logger.info('\n✅ Setup complete! You can now:');
    logger.info('1. Configure your .env file (copy .env.example)');
    logger.info('2. Run database migrations: npm run db:migrate');
    logger.info('3. Start development server: npm run dev');
    logger.info('4. Run the demo: npm run demo');
    logger.info('5. Use the CLI: npx saas-gen --help\n');

  } catch (error) {
    logger.error('Setup failed:', error);
    process.exit(1);
  }
}

quickstart();