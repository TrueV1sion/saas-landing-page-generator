#!/usr/bin/env node

/**
 * TypeScript Build Verification Script
 * Ensures production build succeeds with comprehensive error handling
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const prefix = {
      'info': '📋',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️'
    };
    console.log(`${prefix[type] || '📋'} ${message}`);
  }

  checkFileExists(filePath, description) {
    if (!fs.existsSync(filePath)) {
      this.errors.push(`Missing ${description}: ${filePath}`);
      return false;
    }
    return true;
  }

  runCommand(command, description) {
    try {
      this.log(`Running: ${description}`);
      const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
      this.log(`${description} completed successfully`, 'success');
      return { success: true, output };
    } catch (error) {
      this.errors.push(`${description} failed: ${error.message}`);
      return { success: false, error: error.stderr || error.message };
    }
  }

  async verifyBuild() {
    this.log('Starting build verification...', 'info');

    // Check essential files
    this.checkFileExists('package.json', 'Package configuration');
    this.checkFileExists('tsconfig.json', 'TypeScript configuration');
    this.checkFileExists('prisma/schema.prisma', 'Prisma schema');
    
    // Clean previous build
    if (fs.existsSync('dist')) {
      this.log('Cleaning previous build...');
      fs.rmSync('dist', { recursive: true, force: true });
    }

    // Generate Prisma client
    const prismaResult = this.runCommand('npx prisma generate', 'Prisma client generation');
    if (!prismaResult.success) return false;

    // Run TypeScript build
    const buildResult = this.runCommand('npx tsc', 'TypeScript compilation');
    if (!buildResult.success) {
      // Parse TypeScript errors
      const errorLines = buildResult.error.split('\n');
      const tsErrors = errorLines.filter(line => line.includes('error TS'));
      this.log(`Found ${tsErrors.length} TypeScript errors`, 'error');
      tsErrors.forEach(error => console.log('  ' + error));
      return false;
    }

    // Verify build output
    if (!this.checkFileExists('dist/index.js', 'Main entry point')) {
      return false;
    }

    // Check for critical API routes
    const apiRoutes = ['landingPageRouter', 'analyticsRouter', 'deploymentRouter', 'templateRouter'];
    apiRoutes.forEach(route => {
      this.checkFileExists(`dist/api/${route}.js`, `API route: ${route}`);
    });

    // Verify all imports can be resolved
    this.log('Verifying module resolution...');
    const verifyResult = this.runCommand('node -e "require(\'./dist/index.js\')"', 'Module loading test');
    
    // Summary
    this.log('\n📊 Build Verification Summary:', 'info');
    if (this.errors.length === 0) {
      this.log('All checks passed! Ready for deployment.', 'success');
      this.log('\nNext steps:', 'info');
      this.log('1. Commit changes: git add . && git commit -m "Fix build issues"');
      this.log('2. Push to GitHub: git push origin main');
      this.log('3. Deploy to Vercel: vercel --prod');
      return true;
    } else {
      this.log(`Found ${this.errors.length} errors:`, 'error');
      this.errors.forEach(error => console.log(`  ❌ ${error}`));
      return false;
    }
  }
}

// Run verification
const verifier = new BuildVerifier();
verifier.verifyBuild().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});