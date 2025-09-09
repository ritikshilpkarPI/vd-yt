#!/bin/bash

# Verify YouTube Downloader setup
# This script checks if the application is working correctly

set -e

DOMAIN="yt.local"
API_URL="https://$DOMAIN"
WEB_URL="https://$DOMAIN"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 YouTube Downloader - Setup Verification${NC}"
echo "=============================================="

# Function to check if a service is responding
check_service() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Checking $name... "
    
    if response=$(curl -k -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null); then
        if [ "$response" = "$expected_code" ]; then
            echo -e "${GREEN}✅ OK ($response)${NC}"
            return 0
        else
            echo -e "${RED}❌ FAIL (HTTP $response)${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ UNREACHABLE${NC}"
        return 1
    fi
}

# Function to check if containers are running
check_containers() {
    echo -e "${YELLOW}📦 Checking Docker containers...${NC}"
    
    local containers=("yt-downloader-api" "yt-downloader-web" "yt-downloader-nginx")
    local all_running=true
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "$container"; then
            echo -e "  ${GREEN}✅ $container${NC}"
        else
            echo -e "  ${RED}❌ $container (not running)${NC}"
            all_running=false
        fi
    done
    
    return $all_running
}

# Function to test API functionality
test_api() {
    echo -e "${YELLOW}🔧 Testing API functionality...${NC}"
    
    # Test health endpoint
    echo -n "  Health endpoint... "
    if health_response=$(curl -k -s "$API_URL/health" 2>/dev/null); then
        if echo "$health_response" | grep -q '"ok":true'; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ Invalid response${NC}"
            echo "    Response: $health_response"
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
    
    # Test download endpoint with invalid data (should return 400)
    echo -n "  Download validation... "
    if response=$(curl -k -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/v1/download" \
        -H "Content-Type: application/json" \
        -d '{"url":"invalid"}' 2>/dev/null); then
        if [ "$response" = "400" ]; then
            echo -e "${GREEN}✅ OK (validation working)${NC}"
        else
            echo -e "${YELLOW}⚠️  Unexpected response ($response)${NC}"
        fi
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

# Function to check certificates
check_certificates() {
    echo -e "${YELLOW}🔐 Checking TLS certificates...${NC}"
    
    local cert_file="infra/certs/$DOMAIN.pem"
    local key_file="infra/certs/$DOMAIN-key.pem"
    
    if [ -f "$cert_file" ] && [ -f "$key_file" ]; then
        echo -e "  ${GREEN}✅ Certificate files exist${NC}"
        
        # Check certificate validity
        if openssl x509 -in "$cert_file" -noout -checkend 86400 >/dev/null 2>&1; then
            echo -e "  ${GREEN}✅ Certificate is valid${NC}"
        else
            echo -e "  ${YELLOW}⚠️  Certificate may be expired${NC}"
        fi
    else
        echo -e "  ${RED}❌ Certificate files missing${NC}"
        return 1
    fi
}

# Function to check hosts file
check_hosts() {
    echo -e "${YELLOW}🌐 Checking hosts file...${NC}"
    
    if grep -q "127.0.0.1.*$DOMAIN" /etc/hosts 2>/dev/null; then
        echo -e "  ${GREEN}✅ $DOMAIN entry found in /etc/hosts${NC}"
    else
        echo -e "  ${RED}❌ $DOMAIN not found in /etc/hosts${NC}"
        return 1
    fi
}

# Main verification process
main() {
    echo -e "${YELLOW}🔍 Starting verification...${NC}"
    echo
    
    local errors=0
    
    # Check prerequisites
    echo -e "${YELLOW}📋 Prerequisites:${NC}"
    command -v docker >/dev/null 2>&1 && echo -e "  ${GREEN}✅ Docker${NC}" || { echo -e "  ${RED}❌ Docker${NC}"; ((errors++)); }
    command -v docker-compose >/dev/null 2>&1 && echo -e "  ${GREEN}✅ Docker Compose${NC}" || { echo -e "  ${RED}❌ Docker Compose${NC}"; ((errors++)); }
    command -v curl >/dev/null 2>&1 && echo -e "  ${GREEN}✅ curl${NC}" || { echo -e "  ${RED}❌ curl${NC}"; ((errors++)); }
    echo
    
    # Check certificates
    check_certificates || ((errors++))
    echo
    
    # Check hosts file
    check_hosts || ((errors++))
    echo
    
    # Check containers
    check_containers || ((errors++))
    echo
    
    # Check services
    echo -e "${YELLOW}🌐 Checking services...${NC}"
    check_service "Web App" "$WEB_URL" || ((errors++))
    check_service "API Health" "$API_URL/health" || ((errors++))
    echo
    
    # Test API functionality
    test_api || ((errors++))
    echo
    
    # Summary
    echo -e "${BLUE}📊 Verification Summary${NC}"
    echo "========================"
    
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}🎉 All checks passed! Your YouTube Downloader is ready to use.${NC}"
        echo
        echo -e "${YELLOW}📋 Quick links:${NC}"
        echo -e "  🌐 Web App: $WEB_URL"
        echo -e "  🔗 API:     $API_URL/health"
        echo
        echo -e "${YELLOW}📋 Next steps:${NC}"
        echo -e "  1. Open $WEB_URL in your browser"
        echo -e "  2. Try downloading a Creative Commons video"
        echo -e "  3. Check 'make logs' for any issues"
    else
        echo -e "${RED}❌ $errors error(s) found. Please fix the issues above.${NC}"
        echo
        echo -e "${YELLOW}🔧 Common solutions:${NC}"
        echo -e "  • Run 'make clean && make certs && make up'"
        echo -e "  • Check 'make logs' for detailed error messages"
        echo -e "  • Ensure no other services are using ports 80/443"
        echo -e "  • Restart Docker if containers won't start"
        
        return 1
    fi
}

# Run main function
main "$@"
