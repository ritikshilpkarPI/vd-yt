#!/bin/bash

# Clean up local TLS certificates and hosts file entries
# This script removes certificates and domain entries created by generate-certs.sh

set -e

DOMAIN="yt.local"
CERTS_DIR="$(dirname "$0")/../certs"
HOSTS_FILE="/etc/hosts"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧹 Cleaning up certificates for YouTube Downloader${NC}"
echo "=================================================="

# Remove certificate files
if [[ -d "$CERTS_DIR" ]]; then
    echo -e "${YELLOW}🗑️  Removing certificate files...${NC}"
    rm -rf "$CERTS_DIR"
    echo -e "${GREEN}✅ Certificate files removed${NC}"
else
    echo -e "${YELLOW}ℹ️  No certificate directory found${NC}"
fi

# Remove domain from /etc/hosts
echo -e "${YELLOW}🔍 Checking /etc/hosts for $DOMAIN...${NC}"
if grep -q "127.0.0.1.*$DOMAIN" "$HOSTS_FILE" 2>/dev/null; then
    echo -e "${YELLOW}📝 Removing $DOMAIN from /etc/hosts...${NC}"
    echo "This requires sudo access to modify /etc/hosts"
    
    # Create backup of hosts file
    sudo cp "$HOSTS_FILE" "$HOSTS_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Remove domain from hosts file
    sudo sed -i.bak "/127.0.0.1.*$DOMAIN/d" "$HOSTS_FILE"
    
    if ! grep -q "127.0.0.1.*$DOMAIN" "$HOSTS_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Removed $DOMAIN from /etc/hosts${NC}"
    else
        echo -e "${RED}❌ Failed to remove $DOMAIN from /etc/hosts${NC}"
        echo "Please manually remove the line containing $DOMAIN from /etc/hosts"
    fi
else
    echo -e "${YELLOW}ℹ️  $DOMAIN not found in /etc/hosts${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Cleanup complete!${NC}"
echo "=================================================="
echo -e "${GREEN}✅ Certificate files removed${NC}"
echo -e "${GREEN}✅ Domain removed from /etc/hosts${NC}"
echo ""
echo -e "${YELLOW}📋 Note:${NC}"
echo "Local CA root certificate is still installed in your system."
echo "To remove it completely, run: mkcert -uninstall"
