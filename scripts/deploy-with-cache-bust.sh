#!/bin/bash

echo "🚀 Deploying with cache busting..."

# Build with timestamp for cache busting
TIMESTAMP=$(date +%s)
export VITE_SW_VERSION=$TIMESTAMP

echo "Building with SW version: $TIMESTAMP"

# Build the project
npm run build

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod --dir=dist

echo "✅ Deployment complete with cache busting!"
echo "Service Worker version: $TIMESTAMP"
echo "Users will automatically get the latest version."
