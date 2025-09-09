#!/bin/bash

# Debug: Check if files exist
echo "=== Debug: Checking file structure ==="
ls -la /app/
ls -la /app/web/
ls -la /app/web/dist/ || echo "dist directory not found"
echo "=== End Debug ==="

# Start API in background on port 3000
cd /app/api
echo "Starting API on port 3000..."
PORT=3000 npm start &
API_PID=$!

# Wait a moment for API to start
sleep 5

# Check if API is running
echo "Checking if API is running..."
curl -f http://127.0.0.1:3000/health || echo "API health check failed"

# Start nginx in foreground
nginx -g "daemon off;"
