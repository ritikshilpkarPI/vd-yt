#!/bin/bash

# Start API in background on port 3000
cd /app/api
PORT=3000 npm start &

# Wait a moment for API to start
sleep 3

# Start nginx in foreground
nginx -g "daemon off;"
