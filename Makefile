# YouTube Downloader - Development Makefile
# ==========================================

.PHONY: help certs clean-certs up down restart logs build test lint clean dev-api dev-web health status

# Default target
.DEFAULT_GOAL := help

# Variables
DOCKER_COMPOSE = docker-compose
DOMAIN = yt.local
API_PORT = 3000
WEB_PORT = 3001

# Colors for output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

## Show this help message
help:
	@echo "$(GREEN)YouTube Downloader - Available Commands$(NC)"
	@echo "==========================================="
	@echo ""
	@echo "$(YELLOW)🔧 Setup Commands:$(NC)"
	@echo "  make certs      - Generate local TLS certificates and setup hosts file"
	@echo "  make clean-certs- Remove certificates and cleanup hosts file"
	@echo ""
	@echo "$(YELLOW)🚀 Application Commands:$(NC)"
	@echo "  make up         - Start all services (builds if needed)"
	@echo "  make down       - Stop and remove all containers"
	@echo "  make restart    - Restart all services"
	@echo "  make build      - Build all Docker images"
	@echo ""
	@echo "$(YELLOW)📊 Monitoring Commands:$(NC)"
	@echo "  make logs       - Show logs from all services"
	@echo "  make logs-api   - Show API service logs"
	@echo "  make logs-web   - Show web service logs"
	@echo "  make logs-nginx - Show nginx service logs"
	@echo "  make health     - Check health of all services"
	@echo "  make status     - Show status of all containers"
	@echo "  make verify     - Verify complete setup and functionality"
	@echo ""
	@echo "$(YELLOW)🔧 Development Commands:$(NC)"
	@echo "  make dev-api    - Run API in development mode"
	@echo "  make dev-web    - Run web app in development mode"
	@echo "  make test       - Run all tests"
	@echo "  make test-api   - Run API tests"
	@echo "  make lint       - Run linting on all projects"
	@echo ""
	@echo "$(YELLOW)🧹 Cleanup Commands:$(NC)"
	@echo "  make clean      - Remove containers, images, and volumes"
	@echo "  make clean-all  - Complete cleanup including certs"
	@echo ""
	@echo "$(YELLOW)📋 Quick Start:$(NC)"
	@echo "  1. make certs   - Setup certificates"
	@echo "  2. make up      - Start application"
	@echo "  3. Open https://$(DOMAIN)"

## Generate local TLS certificates and setup hosts file
certs:
	@echo "$(YELLOW)🔐 Generating TLS certificates...$(NC)"
	@./infra/scripts/generate-certs.sh
	@echo "$(GREEN)✅ Certificates ready!$(NC)"

## Remove certificates and cleanup hosts file
clean-certs:
	@echo "$(YELLOW)🧹 Cleaning up certificates...$(NC)"
	@./infra/scripts/cleanup-certs.sh
	@echo "$(GREEN)✅ Certificates cleaned up!$(NC)"

## Start all services
up: certs
	@echo "$(YELLOW)🚀 Starting YouTube Downloader services...$(NC)"
	@if [ ! -f infra/certs/$(DOMAIN).pem ]; then \
		echo "$(RED)❌ Certificates not found. Running make certs first...$(NC)"; \
		make certs; \
	fi
	@mkdir -p downloads
	$(DOCKER_COMPOSE) up -d --build
	@echo "$(GREEN)✅ Services started!$(NC)"
	@echo ""
	@echo "$(YELLOW)📋 Application URLs:$(NC)"
	@echo "  🌐 Web App:  https://$(DOMAIN)"
	@echo "  🔗 API:      https://$(DOMAIN)/health"
	@echo "  📊 Logs:     make logs"

## Stop and remove all containers
down:
	@echo "$(YELLOW)🛑 Stopping YouTube Downloader services...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✅ Services stopped!$(NC)"

## Restart all services
restart:
	@echo "$(YELLOW)🔄 Restarting services...$(NC)"
	$(DOCKER_COMPOSE) restart
	@echo "$(GREEN)✅ Services restarted!$(NC)"

## Build all Docker images
build:
	@echo "$(YELLOW)🔨 Building Docker images...$(NC)"
	$(DOCKER_COMPOSE) build --no-cache
	@echo "$(GREEN)✅ Images built!$(NC)"

## Show logs from all services
logs:
	$(DOCKER_COMPOSE) logs -f

## Show API service logs
logs-api:
	$(DOCKER_COMPOSE) logs -f api

## Show web service logs
logs-web:
	$(DOCKER_COMPOSE) logs -f web

## Show nginx service logs
logs-nginx:
	$(DOCKER_COMPOSE) logs -f nginx

## Check health of all services
health:
	@echo "$(YELLOW)🏥 Checking service health...$(NC)"
	@echo ""
	@echo "$(YELLOW)API Health:$(NC)"
	@curl -k -s https://$(DOMAIN)/health | jq . 2>/dev/null || curl -k -s https://$(DOMAIN)/health || echo "❌ API not responding"
	@echo ""
	@echo "$(YELLOW)Web Health:$(NC)"
	@curl -k -s -o /dev/null -w "Status: %{http_code}\n" https://$(DOMAIN)/ || echo "❌ Web app not responding"
	@echo ""
	@echo "$(YELLOW)Container Status:$(NC)"
	@$(DOCKER_COMPOSE) ps

## Show status of all containers
status:
	@echo "$(YELLOW)📊 Container Status:$(NC)"
	$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "$(YELLOW)📊 Resource Usage:$(NC)"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $$($(DOCKER_COMPOSE) ps -q) 2>/dev/null || echo "No containers running"

## Run API in development mode
dev-api:
	@echo "$(YELLOW)🔧 Starting API in development mode...$(NC)"
	@cd apps/api && npm install && npm run dev

## Run web app in development mode
dev-web:
	@echo "$(YELLOW)🔧 Starting web app in development mode...$(NC)"
	@cd apps/web && npm install && npm run dev

## Run all tests
test:
	@echo "$(YELLOW)🧪 Running all tests...$(NC)"
	@make test-api
	@echo "$(GREEN)✅ All tests completed!$(NC)"

## Run API tests
test-api:
	@echo "$(YELLOW)🧪 Running API tests...$(NC)"
	@cd apps/api && npm install && npm test
	@echo "$(GREEN)✅ API tests completed!$(NC)"

## Run linting on all projects
lint:
	@echo "$(YELLOW)🔍 Running linting...$(NC)"
	@echo "API linting:"
	@cd apps/api && npm install && npm run lint || true
	@echo "Web linting:"
	@cd apps/web && npm install && npm run lint || true
	@echo "$(GREEN)✅ Linting completed!$(NC)"

## Remove containers, images, and volumes
clean:
	@echo "$(YELLOW)🧹 Cleaning up Docker resources...$(NC)"
	$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans
	@docker system prune -f
	@echo "$(GREEN)✅ Docker cleanup completed!$(NC)"

## Complete cleanup including certificates
clean-all: clean clean-certs
	@echo "$(YELLOW)🧹 Complete cleanup...$(NC)"
	@rm -rf downloads
	@echo "$(GREEN)✅ Complete cleanup finished!$(NC)"

## Install dependencies for all projects
install:
	@echo "$(YELLOW)📦 Installing dependencies...$(NC)"
	@cd apps/api && npm install
	@cd apps/web && npm install
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"

## Quick development setup
dev-setup: install certs
	@echo "$(GREEN)✅ Development setup completed!$(NC)"
	@echo ""
	@echo "$(YELLOW)📋 Next steps:$(NC)"
	@echo "  • Run 'make up' to start with Docker"
	@echo "  • Or run 'make dev-api' and 'make dev-web' for development mode"

## Show application URLs
urls:
	@echo "$(YELLOW)📋 Application URLs:$(NC)"
	@echo "  🌐 Web App:     https://$(DOMAIN)"
	@echo "  🔗 API Health:  https://$(DOMAIN)/health"
	@echo "  📥 Download:    https://$(DOMAIN)/v1/download"

## Verify complete setup
verify:
	@echo "$(YELLOW)🔍 Verifying setup...$(NC)"
	@./infra/scripts/verify-setup.sh
