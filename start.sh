#!/bin/bash

echo "=== LeRobot Dataset Visualizer - Quick Start ==="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✓ .env.local created"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
    echo ""
fi

# Check AWS credentials
echo "Checking AWS credentials..."
if aws sts get-caller-identity &>/dev/null; then
    echo "✓ AWS credentials configured"
    aws sts get-caller-identity --query 'Arn' --output text
else
    echo "⚠ AWS credentials not found"
    echo "Please configure AWS credentials to access S3 datasets"
fi
echo ""

# Start the server
echo "Starting development server..."
echo ""
echo "⏱ Server will be ready in ~30 seconds"
echo ""
echo "Access the app at: http://localhost:3000"
echo "Example dataset ID: m3/lerobot_so101_block2box"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
