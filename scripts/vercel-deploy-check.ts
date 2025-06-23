import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

/**
 * Comprehensive Vercel Deployment Readiness Checker
 * Validates all prerequisites and configurations for successful deployment
 */

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  fix?: string;
}

class VercelDeploymentChecker {
  private results: CheckResult[] = [];
  private rootPath: string;

  constructor(rootPath: string = process.cwd()) {
    this.rootPath = rootPath;
  }

  /**
   * Execute all deployment checks
   */
  async runAllChecks(): Promise<boolean> {
    console.log(chalk.blue.bold('\n🚀 Vercel Deployment Readiness Check\n'));

    // Configuration checks
    await this.checkVercelConfig();
    await this.checkPackageJson();
    await this.checkEnvironmentVariables();
    await this.checkTypeScriptBuild();
    await this.checkPrismaSetup();
    await this.checkDependencies();
    await this.checkBuildOutput();
    await this.checkStaticAssets();
    await this.checkGitIgnore();
    await this.checkNodeVersion();

    // Display results
    this.displayResults();

    const hasFailures = this.results.some(r => r.status === 'fail');
    return !hasFailures;
  }

  /**
   * Check vercel.json configuration
   */
  private async checkVercelConfig() {
    const configPath = join(this.rootPath, 'vercel.json');
    
    if (!existsSync(configPath)) {
      this.results.push({
        name: 'Vercel Configuration',
        status: 'fail',
        message: 'vercel.json not found',
        fix: 'Create vercel.json with proper configuration'
      });
      return;
    }

    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      
      // Validate required fields
      const requiredFields = ['builds', 'routes'];
      const missingFields = requiredFields.filter(field => !config[field]);
      
      if (missingFields.length > 0) {
        this.results.push({
          name: 'Vercel Configuration',
          status: 'warning',
          message: `Missing fields: ${missingFields.join(', ')}`,
          fix: 'Add missing configuration fields to vercel.json'
        });
      } else {
        this.results.push({
          name: 'Vercel Configuration',
          status: 'pass',
          message: 'vercel.json is properly configured'
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Vercel Configuration',
        status: 'fail',
        message: 'Invalid vercel.json format',
        fix: 'Fix JSON syntax errors in vercel.json'
      });
    }
  }

  /**
   * Check package.json scripts and configuration
   */
  private async checkPackageJson() {
    const packagePath = join(this.rootPath, 'package.json');
    
    try {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
      
      // Check for build script
      if (!packageJson.scripts?.build) {
        this.results.push({
          name: 'Build Script',
          status: 'fail',
          message: 'No build script found in package.json',
          fix: 'Add "build": "tsc" to scripts in package.json'
        });
        return;
      }

      // Check Node.js engine requirement
      if (!packageJson.engines?.node) {
        this.results.push({
          name: 'Node Version',
          status: 'warning',
          message: 'No Node.js version specified',
          fix: 'Add "engines": { "node": ">=18.0.0" } to package.json'
        });
      }

      // Check module type
      if (packageJson.type !== 'module') {
        this.results.push({
          name: 'Module Type',
          status: 'warning',
          message: 'Package type is not set to module',
          fix: 'Consider adding "type": "module" to package.json'
        });
      }

      this.results.push({
        name: 'Package Configuration',
        status: 'pass',
        message: 'package.json is properly configured'
      });
    } catch (error) {
      this.results.push({
        name: 'Package Configuration',
        status: 'fail',
        message: 'Failed to read package.json',
        fix: 'Ensure package.json exists and is valid JSON'
      });
    }
  }

  /**
   * Check environment variables setup
   */
  private async checkEnvironmentVariables() {
    const envExamplePath = join(this.rootPath, '.env.example');
    
    if (!existsSync(envExamplePath)) {
      this.results.push({
        name: 'Environment Variables',
        status: 'warning',
        message: '.env.example not found',
        fix: 'Create .env.example with required variables'
      });
      return;
    }

    const envContent = readFileSync(envExamplePath, 'utf-8');
    const requiredVars = [
      'DATABASE_URL',
      'REDIS_URL',
      'JWT_SECRET',
      'NODE_ENV',
      'PORT'
    ];

    const missingVars = requiredVars.filter(
      varName => !envContent.includes(varName)
    );

    if (missingVars.length > 0) {
      this.results.push({
        name: 'Environment Variables',
        status: 'warning',
        message: `Missing variables in .env.example: ${missingVars.join(', ')}`,
        fix: 'Add missing variables to .env.example'
      });
    } else {
      this.results.push({
        name: 'Environment Variables',
        status: 'pass',
        message: 'All required environment variables documented'
      });
    }
  }

  /**
   * Check TypeScript build
   */
  private async checkTypeScriptBuild() {
    try {
      console.log(chalk.gray('Running TypeScript build check...'));
      execSync('npx tsc --noEmit', { 
        cwd: this.rootPath,
        stdio: 'pipe' 
      });
      
      this.results.push({
        name: 'TypeScript Build',
        status: 'pass',
        message: 'TypeScript compiles without errors'
      });
    } catch (error: any) {
      const errorOutput = error.stdout?.toString() || error.message;
      const errorCount = (errorOutput.match(/error TS/g) || []).length;
      
      this.results.push({
        name: 'TypeScript Build',
        status: 'fail',
        message: `TypeScript compilation failed with ${errorCount} errors`,
        fix: 'Run "npm run build" locally and fix all TypeScript errors'
      });
    }
  }

  /**
   * Check Prisma setup
   */
  private async checkPrismaSetup() {
    const schemaPath = join(this.rootPath, 'prisma', 'schema.prisma');
    
    if (!existsSync(schemaPath)) {
      this.results.push({
        name: 'Prisma Schema',
        status: 'fail',
        message: 'Prisma schema not found',
        fix: 'Create prisma/schema.prisma file'
      });
      return;
    }

    try {
      // Check if Prisma client can be generated
      execSync('npx prisma validate', {
        cwd: this.rootPath,
        stdio: 'pipe'
      });
      
      this.results.push({
        name: 'Prisma Setup',
        status: 'pass',
        message: 'Prisma schema is valid'
      });
    } catch (error) {
      this.results.push({
        name: 'Prisma Setup',
        status: 'fail',
        message: 'Prisma schema validation failed',
        fix: 'Run "npx prisma validate" and fix any schema errors'
      });
    }
  }

  /**
   * Check production dependencies
   */
  private async checkDependencies() {
    const packagePath = join(this.rootPath, 'package.json');
    
    try {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      
      // Check for dependencies that should be in production
      const requiredProdDeps = [
        '@prisma/client',
        'express',
        'dotenv'
      ];
      
      const missingProdDeps = requiredProdDeps.filter(
        dep => !dependencies[dep]
      );
      
      if (missingProdDeps.length > 0) {
        this.results.push({
          name: 'Production Dependencies',
          status: 'warning',
          message: `Missing production dependencies: ${missingProdDeps.join(', ')}`,
          fix: 'Move these from devDependencies to dependencies'
        });
      }

      // Check for build tools in dependencies (should be in devDependencies)
      const buildTools = ['typescript', 'tsx', '@types/node'];
      const misplacedDeps = buildTools.filter(
        dep => dependencies[dep]
      );
      
      if (misplacedDeps.length > 0) {
        this.results.push({
          name: 'Dependency Organization',
          status: 'warning',
          message: `Build tools in dependencies: ${misplacedDeps.join(', ')}`,
          fix: 'Move these to devDependencies to reduce deployment size'
        });
      }

      if (missingProdDeps.length === 0 && misplacedDeps.length === 0) {
        this.results.push({
          name: 'Dependencies',
          status: 'pass',
          message: 'Dependencies are properly organized'
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Dependencies',
        status: 'fail',
        message: 'Failed to check dependencies',
        fix: 'Ensure package.json is valid'
      });
    }
  }

  /**
   * Check build output
   */
  private async checkBuildOutput() {
    const distPath = join(this.rootPath, 'dist');
    const indexPath = join(distPath, 'index.js');
    
    if (!existsSync(distPath)) {
      this.results.push({
        name: 'Build Output',
        status: 'warning',
        message: 'No dist folder found',
        fix: 'Run "npm run build" to generate build output'
      });
      return;
    }

    if (!existsSync(indexPath)) {
      this.results.push({
        name: 'Build Output',
        status: 'fail',
        message: 'dist/index.js not found',
        fix: 'Ensure TypeScript build generates dist/index.js'
      });
    } else {
      this.results.push({
        name: 'Build Output',
        status: 'pass',
        message: 'Build output exists'
      });
    }
  }

  /**
   * Check static assets configuration
   */
  private async checkStaticAssets() {
    const generatedPath = join(this.rootPath, 'generated');
    const publicPath = join(this.rootPath, 'public');
    
    const paths = [];
    if (!existsSync(generatedPath)) {
      paths.push('generated');
    }
    
    if (paths.length > 0) {
      this.results.push({
        name: 'Static Assets',
        status: 'warning',
        message: `Missing directories: ${paths.join(', ')}`,
        fix: 'Create missing directories or update vercel.json routes'
      });
    } else {
      this.results.push({
        name: 'Static Assets',
        status: 'pass',
        message: 'Static asset directories configured'
      });
    }
  }

  /**
   * Check .gitignore configuration
   */
  private async checkGitIgnore() {
    const gitignorePath = join(this.rootPath, '.gitignore');
    
    if (!existsSync(gitignorePath)) {
      this.results.push({
        name: 'Git Ignore',
        status: 'fail',
        message: '.gitignore not found',
        fix: 'Create .gitignore file'
      });
      return;
    }

    const content = readFileSync(gitignorePath, 'utf-8');
    const requiredEntries = ['.env', 'node_modules', 'dist'];
    const missingEntries = requiredEntries.filter(
      entry => !content.includes(entry)
    );
    
    if (missingEntries.length > 0) {
      this.results.push({
        name: 'Git Ignore',
        status: 'warning',
        message: `Missing entries: ${missingEntries.join(', ')}`,
        fix: 'Add missing entries to .gitignore'
      });
    } else {
      this.results.push({
        name: 'Git Ignore',
        status: 'pass',
        message: '.gitignore properly configured'
      });
    }
  }

  /**
   * Check Node.js version
   */
  private async checkNodeVersion() {
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion < 18) {
        this.results.push({
          name: 'Node.js Version',
          status: 'fail',
          message: `Node.js ${nodeVersion} is too old`,
          fix: 'Upgrade to Node.js 18 or higher'
        });
      } else {
        this.results.push({
          name: 'Node.js Version',
          status: 'pass',
          message: `Node.js ${nodeVersion} is compatible`
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Node.js Version',
        status: 'fail',
        message: 'Failed to check Node.js version',
        fix: 'Ensure Node.js is installed'
      });
    }
  }

  /**
   * Display check results
   */
  private displayResults() {
    console.log(chalk.blue.bold('\n📋 Check Results:\n'));
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : 
                   result.status === 'warning' ? '⚠️' : '❌';
      const color = result.status === 'pass' ? chalk.green :
                    result.status === 'warning' ? chalk.yellow : chalk.red;
      
      console.log(`${icon} ${color(result.name)}: ${result.message}`);
      if (result.fix && result.status !== 'pass') {
        console.log(chalk.gray(`   → Fix: ${result.fix}`));
      }
    });
    
    console.log(chalk.blue.bold('\n📊 Summary:'));
    console.log(chalk.green(`   ✅ Passed: ${passed}`));
    console.log(chalk.yellow(`   ⚠️  Warnings: ${warnings}`));
    console.log(chalk.red(`   ❌ Failed: ${failed}`));
    
    if (failed === 0) {
      console.log(chalk.green.bold('\n🎉 Your project is ready for Vercel deployment!'));
      console.log(chalk.gray('\nNext steps:'));
      console.log(chalk.gray('1. Run: vercel'));
      console.log(chalk.gray('2. Configure environment variables in Vercel dashboard'));
      console.log(chalk.gray('3. Deploy with: vercel --prod'));
    } else {
      console.log(chalk.red.bold('\n⚠️  Please fix the errors before deploying to Vercel.'));
    }
  }
}

// Run the checker
const checker = new VercelDeploymentChecker();
checker.runAllChecks().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error(chalk.red('Deployment check failed:'), error);
  process.exit(1);
});