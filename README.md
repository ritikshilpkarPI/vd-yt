# YouTube Downloader 🎥

A local-only YouTube downloader application built with Node.js, React, and Docker. This application respects copyright laws and licensing by enforcing compliance checks before allowing downloads.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-required-blue)](https://www.docker.com/)

## ✨ Features

- **🔒 Compliance First**: Only allows downloads of Creative Commons licensed videos or user-owned content
- **🎵 Multiple Formats**: Download videos as MP4 or extract audio as MP3
- **🚀 Modern Stack**: Node.js 20 + Express + TypeScript backend, React + Vite frontend
- **🔐 HTTPS Local Development**: Self-signed certificates with mkcert for secure local development
- **📊 Rate Limiting**: Built-in protection against abuse
- **🐳 Docker Ready**: Complete containerized setup with nginx reverse proxy
- **🧪 Well Tested**: Comprehensive test suite with Jest and Supertest
- **📋 API Documentation**: Complete OpenAPI 3.0 specification

## 🏗️ Architecture

```
/yt-downloader
├── apps/
│   ├── api/          # Express TypeScript API
│   └── web/          # React + Vite frontend
├── infra/
│   ├── certs/        # TLS certificates (generated)
│   ├── scripts/      # Setup and utility scripts
│   └── nginx.conf    # Reverse proxy configuration
├── docker-compose.yml
├── Makefile          # Development commands
└── README.md
```

### Services

- **API** (`apps/api`): Express server with yt-dlp integration
- **Web** (`apps/web`): React frontend with modern UI
- **Nginx**: Reverse proxy with HTTPS, CORS, and rate limiting

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose**: Required for containerized setup
- **mkcert**: For local HTTPS certificates (auto-installed by setup script)
- **Make**: For running development commands
- **Node.js 20+**: For local development (optional)

### 1. Setup & Start

```bash
# Clone and navigate to the project
git clone <repository-url>
cd yt-downloader

# Generate certificates and start services
make certs && make up
```

### 2. Access the Application

Open your browser and navigate to:
- **Web App**: https://yt.local
- **API Health**: https://yt.local/health

## 📋 Available Commands

### 🔧 Setup Commands
```bash
make certs        # Generate local TLS certificates and setup hosts file
make clean-certs  # Remove certificates and cleanup hosts file
```

### 🚀 Application Commands
```bash
make up          # Start all services (builds if needed)
make down        # Stop and remove all containers
make restart     # Restart all services
make build       # Build all Docker images
```

### 📊 Monitoring Commands
```bash
make logs        # Show logs from all services
make logs-api    # Show API service logs
make logs-web    # Show web service logs
make logs-nginx  # Show nginx service logs
make health      # Check health of all services
make status      # Show status of all containers
```

### 🔧 Development Commands
```bash
make dev-api     # Run API in development mode
make dev-web     # Run web app in development mode
make test        # Run all tests
make test-api    # Run API tests
make lint        # Run linting on all projects
```

### 🧹 Cleanup Commands
```bash
make clean       # Remove containers, images, and volumes
make clean-all   # Complete cleanup including certificates
```

## 🔒 Compliance & Legal

This application enforces copyright compliance through:

### Compliance Rules

Downloads are **only allowed** when:
1. `ALLOW_ALL=true` environment variable is set (for testing), **OR**
2. The video has a Creative Commons license, **OR**
3. The authenticated user owns the channel (OAuth verification - stub implementation)

### Environment Variables

```bash
# API Configuration
PORT=3000
NODE_ENV=production
YOUTUBE_API_KEY=your_api_key_here    # For YouTube Data API (optional)
ALLOW_ALL=false                      # Set to true for testing only

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000         # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100         # Max requests per window

# Logging
LOG_LEVEL=info
```

## 🔧 Development

### Local Development Setup

```bash
# Install dependencies
make install

# Setup development environment
make dev-setup

# Run services in development mode
make dev-api    # Terminal 1
make dev-web    # Terminal 2
```

### API Development

```bash
cd apps/api

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Web Development

```bash
cd apps/web

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🧪 Testing

### Run All Tests
```bash
make test
```

### API Tests
```bash
make test-api
# or
cd apps/api && npm test
```

### Test Coverage

The test suite covers:
- ✅ Health endpoint functionality
- ✅ Download request validation
- ✅ URL parsing and validation
- ✅ Compliance rule enforcement
- ✅ Error handling and edge cases
- ✅ Rate limiting behavior
- ✅ Mock yt-dlp integration

## 📡 API Documentation

### Endpoints

#### `GET /health`
Health check endpoint returning service status.

**Response:**
```json
{
  "ok": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### `POST /v1/download`
Download YouTube video with compliance checking.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "format": "mp4"
}
```

**Response:** Binary stream with appropriate headers

**cURL Example:**
```bash
curl -k -X POST https://yt.local/v1/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","format":"mp4"}' \
  --output video.mp4
```

### OpenAPI Specification

Full API documentation is available at `apps/api/openapi.yaml`

## 🐳 Docker Configuration

### Services

- **API**: Node.js 20 with yt-dlp and ffmpeg
- **Web**: Nginx serving React build
- **Nginx**: Reverse proxy with HTTPS termination

### Docker Compose Features

- **Health Checks**: All services include health monitoring
- **Volume Persistence**: Downloads and logs are persisted
- **Network Isolation**: Services communicate through dedicated network
- **Security**: Non-root users, minimal attack surface

## 🔐 Security Features

### HTTPS & Certificates

- Local HTTPS with mkcert-generated certificates
- Automatic certificate generation and hosts file management
- Secure cookie handling and CSRF protection

### Security Middleware

- **Helmet**: Security headers and protection
- **CORS**: Cross-origin request control
- **Rate Limiting**: Per-IP request throttling
- **Request Validation**: Input sanitization and validation

### Rate Limits

- **General API**: 100 requests per 15 minutes
- **Download Endpoint**: 5 requests per 15 minutes per IP
- **Nginx Level**: Additional rate limiting at proxy layer

## 🛠️ Troubleshooting

### Common Issues

#### Certificate Issues
```bash
# Regenerate certificates
make clean-certs && make certs

# Check certificate status
mkcert -version
```

#### Service Not Starting
```bash
# Check service status
make status

# View logs
make logs

# Restart services
make restart
```

#### Port Conflicts
```bash
# Check what's using ports 80/443
sudo lsof -i :80
sudo lsof -i :443

# Stop conflicting services
sudo systemctl stop apache2  # Example
```

#### Docker Issues
```bash
# Clean Docker resources
make clean

# Rebuild everything
make build && make up
```

### Development Issues

#### API not responding
```bash
# Check API logs
make logs-api

# Test API directly
curl -k https://yt.local/health
```

#### Web app not loading
```bash
# Check web logs
make logs-web

# Verify nginx config
docker exec yt-downloader-nginx nginx -t
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`make test`)
5. Run linting (`make lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow TypeScript best practices
- Update documentation for API changes
- Ensure Docker builds pass
- Maintain compliance checking logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Legal Notice

**Important**: This tool is intended for downloading content you have permission to use. Users are responsible for ensuring they comply with:

- YouTube's Terms of Service
- Copyright laws in their jurisdiction
- Video creators' licensing terms
- Fair use guidelines

The application includes compliance checking features, but users must ensure their usage is legal and ethical.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The powerful YouTube downloader
- [mkcert](https://github.com/FiloSottile/mkcert) - Local certificate generation
- [Express.js](https://expressjs.com/) - Web framework
- [React](https://reactjs.org/) - Frontend library
- [Vite](https://vitejs.dev/) - Build tool

---

**Made with ❤️ for educational and legitimate use cases**
