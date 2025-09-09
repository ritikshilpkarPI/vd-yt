#!/bin/bash

# Start API in background
cd /app/api
npm start &

# Start nginx in foreground
nginx -g "daemon off;"
