#!/bin/bash

# Vercel Build Script
# This script ensures proper build process for Vercel deployment

echo "🔨 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Run TypeScript build
echo "🔧 Building TypeScript..."
npx tsc --skipLibCheck

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p generated/preview
mkdir -p generated/live
mkdir -p logs

# Copy static assets if they exist
if [ -d "public" ]; then
  echo "📋 Copying static assets..."
  cp -r public/* generated/
fi

# Verify build output
if [ -f "dist/index.js" ]; then
  echo "✅ Build successful!"
  echo "📊 Build stats:"
  find dist -name "*.js" | wc -l | xargs echo "  JavaScript files:"
  du -sh dist | xargs echo "  Total size:"
else
  echo "❌ Build failed: dist/index.js not found"
  exit 1
fi

echo "🎉 Build complete!"