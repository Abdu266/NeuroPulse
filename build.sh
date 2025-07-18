#!/bin/bash
echo "Building TechNeurology NeuroRelief for Vercel..."

# Install dependencies
npm install

# Build the frontend
echo "Building frontend..."
npm run build

# The build output will be in client/dist
echo "Build complete! Output directory: client/dist"
ls -la client/dist