#!/bin/bash

echo "🔍 Debugging build process..."
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

echo ""
echo "📁 Checking src directory..."
if [ -d "src" ]; then
    echo "src directory exists"
    echo "Files in src:"
    ls -la src/
    
    if [ -f "src/index.js" ]; then
        echo "✅ index.js found in src/"
        echo "File size: $(stat -c%s src/index.js) bytes"
    else
        echo "❌ index.js NOT found in src/"
    fi
else
    echo "❌ src directory does not exist"
fi

echo ""
echo "📁 Checking public directory..."
if [ -d "public" ]; then
    echo "public directory exists"
    echo "Files in public:"
    ls -la public/
else
    echo "❌ public directory does not exist"
fi

echo ""
echo "📄 Checking package.json..."
if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json not found"
fi

echo ""
echo "🚀 Starting build process..."
npm install && npm run build 