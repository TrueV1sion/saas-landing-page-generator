#!/usr/bin/env node

// Vercel Deployment Readiness Quick Check
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const checks = {
  '✅ vercel.json': () => fs.existsSync('vercel.json'),
  '✅ TypeScript Build': () => {
    try {
      execSync('npx tsc --noEmit', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  },
  '✅ Prisma Schema': () => fs.existsSync('prisma/schema.prisma'),
  '✅ Build Output': () => fs.existsSync('dist/index.js'),
  '✅ Environment Vars': () => fs.existsSync('.env.example'),
  '✅ Node Version': () => {
    const version = process.version.slice(1).split('.')[0];
    return parseInt(version) >= 18;
  }
};

console.log('\n🚀 Vercel Deployment Check\n');

let passed = 0;
Object.entries(checks).forEach(([name, check]) => {
  const result = check();
  console.log(`${result ? '✅' : '❌'} ${name}`);
  if (result) passed++;
});

console.log(`\n📊 ${passed}/${Object.keys(checks).length} checks passed`);

if (passed === Object.keys(checks).length) {
  console.log('\n🎉 Ready for deployment! Run: vercel --prod\n');
} else {
  console.log('\n⚠️  Fix issues before deploying\n');
  process.exit(1);
}