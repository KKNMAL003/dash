#!/bin/bash

echo "🧹 Clearing all development caches..."

# Stop any running dev servers
pkill -f "vite" 2>/dev/null || true

# Clear Vite cache
echo "Clearing Vite cache..."
rm -rf node_modules/.vite

# Clear dist folder
echo "Clearing dist folder..."
rm -rf dist

# Clear browser cache instructions
echo ""
echo "🌐 Browser Cache Clearing Instructions:"
echo "1. Open Chrome DevTools (F12)"
echo "2. Right-click the refresh button"
echo "3. Select 'Empty Cache and Hard Reload'"
echo "   OR"
echo "4. Go to Application tab → Storage → Clear storage → Check all → Clear site data"
echo ""
echo "✅ Caches cleared! Run 'npm run dev' to start fresh."

