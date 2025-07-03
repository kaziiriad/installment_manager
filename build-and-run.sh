#!/bin/bash
# Build and run script that handles npm issues outside Docker

echo "Building frontend outside Docker to avoid network issues..."
cd frontend
npm install
npm run build
cd ..

echo "Building Docker images..."
docker-compose build

echo "Starting services..."
docker-compose up