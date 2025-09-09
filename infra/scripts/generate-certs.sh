#!/bin/bash

# Generate local TLS certificates using mkcert
# This script sets up HTTPS for local development

set -e

DOMAIN="yt.local"
CERTS_DIR="$(dirname "$0")/../certs"
HOSTS_FILE="/etc/hosts"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Setting up local HTTPS certificates for YouTube Downloader${NC}"
echo "=================================================="

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo -e "${RED}❌ mkcert is not installed${NC}"
    echo -e "${YELLOW}📦 Installing mkcert...${NC}"
    
    # Detect OS and install mkcert
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install mkcert
        else
            echo -e "${RED}❌ Homebrew not found. Please install mkcert manually:${NC}"
            echo "Visit: https://github.com/FiloSottile/mkcert#installation"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y libnss3-tools
            curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
            chmod +x mkcert-v*-linux-amd64
            sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
        elif command -v yum &> /dev/null; then
            sudo yum install -y nss-tools
            curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
            chmod +x mkcert-v*-linux-amd64
            sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
        else
            echo -e "${RED}❌ Package manager not found. Please install mkcert manually:${NC}"
            echo "Visit: https://github.com/FiloSottile/mkcert#installation"
            exit 1
        fi
    else
        echo -e "${RED}❌ Unsupported OS. Please install mkcert manually:${NC}"
        echo "Visit: https://github.com/FiloSottile/mkcert#installation"
        exit 1
    fi
fi

# Create certs directory if it doesn't exist
mkdir -p "$CERTS_DIR"

echo -e "${YELLOW}🔧 Installing local CA...${NC}"
mkcert -install

echo -e "${YELLOW}📜 Generating certificate for $DOMAIN...${NC}"
cd "$CERTS_DIR"
mkcert "$DOMAIN"

# Verify certificates were created
if [[ -f "$DOMAIN.pem" && -f "$DOMAIN-key.pem" ]]; then
    echo -e "${GREEN}✅ Certificates generated successfully!${NC}"
    echo "📁 Certificate location: $CERTS_DIR"
    echo "📄 Certificate: $DOMAIN.pem"
    echo "🔑 Private key: $DOMAIN-key.pem"
else
    echo -e "${RED}❌ Failed to generate certificates${NC}"
    exit 1
fi

# Check if domain is in /etc/hosts
echo -e "${YELLOW}🔍 Checking /etc/hosts for $DOMAIN...${NC}"
if ! grep -q "127.0.0.1.*$DOMAIN" "$HOSTS_FILE" 2>/dev/null; then
    echo -e "${YELLOW}📝 Adding $DOMAIN to /etc/hosts...${NC}"
    echo "This requires sudo access to modify /etc/hosts"
    
    # Create backup of hosts file
    sudo cp "$HOSTS_FILE" "$HOSTS_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Add domain to hosts file
    echo "127.0.0.1 $DOMAIN" | sudo tee -a "$HOSTS_FILE" > /dev/null
    
    if grep -q "127.0.0.1.*$DOMAIN" "$HOSTS_FILE"; then
        echo -e "${GREEN}✅ Added $DOMAIN to /etc/hosts${NC}"
    else
        echo -e "${RED}❌ Failed to add $DOMAIN to /etc/hosts${NC}"
        echo "Please manually add the following line to /etc/hosts:"
        echo "127.0.0.1 $DOMAIN"
    fi
else
    echo -e "${GREEN}✅ $DOMAIN already exists in /etc/hosts${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo "=================================================="
echo -e "${GREEN}✅ Local CA installed${NC}"
echo -e "${GREEN}✅ Certificate generated for $DOMAIN${NC}"
echo -e "${GREEN}✅ Domain added to /etc/hosts${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Run: make up"
echo "2. Open: https://$DOMAIN"
echo ""
echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
echo "- If browser shows security warning, restart browser"
echo "- If certificate issues persist, run: mkcert -install"
echo "- To remove certificates: make clean-certs"
