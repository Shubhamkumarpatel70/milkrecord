#!/bin/bash
echo "Starting frontend build process..."
npm install
echo "Dependencies installed, building React app..."
npm run build
echo "Build completed. Checking if build directory exists..."
ls -la
if [ -d "build" ]; then
    echo "Build directory created successfully!"
    ls -la build/
else
    echo "ERROR: Build directory not found!"
    exit 1
fi 