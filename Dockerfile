# Multi-stage build for YouTube Downloader
FROM node:20-bullseye as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install yt-dlp

# Build API
FROM base as api-builder
WORKDIR /app/api
COPY apps/api/package*.json ./
RUN npm ci
COPY apps/api/ ./
RUN npm run build

# Build Web
FROM base as web-builder
WORKDIR /app/web
COPY apps/web/package*.json ./
RUN npm ci
COPY apps/web/ ./
RUN npm run build

# Production stage
FROM base as production

# Copy API
WORKDIR /app/api
COPY --from=api-builder /app/api/dist ./dist
COPY --from=api-builder /app/api/node_modules ./node_modules
COPY --from=api-builder /app/api/package*.json ./

# Copy Web
WORKDIR /app/web
COPY --from=web-builder /app/web/dist ./dist
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

# Create nginx user
RUN useradd -r -s /bin/false nginx

# Expose ports
EXPOSE 80 443

# Start script
WORKDIR /app
COPY start.sh ./
RUN chmod +x start.sh

CMD ["./start.sh"]
