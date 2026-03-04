#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci --prefix backend
npm ci --prefix frontend

echo "Building frontend..."
npm run build --prefix frontend

echo "Setup complete!"
