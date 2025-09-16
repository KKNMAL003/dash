#!/bin/bash

# Optimized deployment script for Onolo Admin Dashboard
echo "🚀 Starting optimized deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test:run

# Build optimized version
echo "🔨 Building optimized version..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Copy service worker to dist
    echo "📋 Copying service worker..."
    cp public/sw.js dist/sw.js
    
    # Create a deployment marker
    echo "📝 Creating deployment marker..."
    echo "Deployed at: $(date)" > dist/deployment.txt
    
    echo "🎉 Deployment ready! Files in dist/ directory."
    echo "💡 Deploy the dist/ directory to your hosting provider."
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

