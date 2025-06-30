#!/bin/bash
set -e

echo "Building NASA Space Explorer Backend..."

# Navigate to backend directory
cd backend

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building TypeScript..."
npm run build

echo "Build completed successfully!"
