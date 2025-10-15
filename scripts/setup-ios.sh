#!/bin/bash
set -e

echo "Setting up iOS project for Capacitor..."

# Build the web app
npm run build

# Add iOS platform (this will use system Ruby/CocoaPods on EAS build machine)
npx cap add ios

# Sync the web assets
npx cap sync ios

echo "iOS project setup complete!"

