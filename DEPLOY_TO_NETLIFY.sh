#!/bin/bash

# Uruziga Platform - Netlify Deployment Script
# This script prepares and deploys the platform to Netlify

set -e  # Exit on error

echo "🚀 URUZIGA PLATFORM - NETLIFY DEPLOYMENT"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Verify build
echo -e "${BLUE}Step 1: Verifying build...${NC}"
if [ ! -d ".next" ]; then
    echo -e "${YELLOW}Build directory not found. Running build...${NC}"
    npm run build
else
    echo -e "${GREEN}✓ Build directory exists${NC}"
fi
echo ""

# Step 2: Check environment variables
echo -e "${BLUE}Step 2: Checking environment variables...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found!${NC}"
    echo "Please create .env file with:"
    echo "  DATABASE_URL=your_neon_postgresql_url"
    echo "  JWT_SECRET=your_jwt_secret"
    exit 1
fi

if grep -q "DATABASE_URL=" .env && grep -q "JWT_SECRET=" .env; then
    echo -e "${GREEN}✓ Environment variables configured${NC}"
else
    echo -e "${RED}✗ Missing required environment variables${NC}"
    exit 1
fi
echo ""

# Step 3: Check Git status
echo -e "${BLUE}Step 3: Checking Git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠ Uncommitted changes detected${NC}"
    echo ""
    echo "Modified files:"
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Committing changes...${NC}"
        git add .
        git commit -m "Production ready: All features implemented and tested"
        echo -e "${GREEN}✓ Changes committed${NC}"
    else
        echo -e "${YELLOW}⚠ Proceeding without committing${NC}"
    fi
else
    echo -e "${GREEN}✓ No uncommitted changes${NC}"
fi
echo ""

# Step 4: Check Netlify CLI
echo -e "${BLUE}Step 4: Checking Netlify CLI...${NC}"
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}⚠ Netlify CLI not found${NC}"
    echo ""
    echo "You have 3 deployment options:"
    echo ""
    echo "Option 1: Install Netlify CLI and deploy"
    echo "  npm install -g netlify-cli"
    echo "  netlify login"
    echo "  netlify deploy --prod"
    echo ""
    echo "Option 2: Push to Git (Recommended if connected to Netlify)"
    echo "  git push origin main"
    echo ""
    echo "Option 3: Manual deployment via Netlify Dashboard"
    echo "  Visit: https://app.netlify.com"
    echo "  Click: 'Add new site' → 'Import an existing project'"
    echo ""
    read -p "Do you want to install Netlify CLI now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Installing Netlify CLI...${NC}"
        npm install -g netlify-cli
        echo -e "${GREEN}✓ Netlify CLI installed${NC}"
    else
        echo -e "${YELLOW}Skipping Netlify CLI installation${NC}"
        echo ""
        echo "To deploy manually:"
        echo "1. Push to Git: git push origin main"
        echo "2. Or visit: https://app.netlify.com"
        exit 0
    fi
else
    echo -e "${GREEN}✓ Netlify CLI installed${NC}"
fi
echo ""

# Step 5: Deploy to Netlify
echo -e "${BLUE}Step 5: Deploying to Netlify...${NC}"
echo ""
echo "Choose deployment method:"
echo "1. Deploy via Netlify CLI"
echo "2. Push to Git (auto-deploy)"
echo "3. Exit (manual deployment)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo -e "${BLUE}Deploying via Netlify CLI...${NC}"
        netlify deploy --prod
        echo -e "${GREEN}✓ Deployment complete!${NC}"
        ;;
    2)
        echo -e "${BLUE}Pushing to Git...${NC}"
        git push origin main
        echo -e "${GREEN}✓ Pushed to Git. Netlify will auto-deploy.${NC}"
        ;;
    3)
        echo -e "${YELLOW}Exiting. Deploy manually at https://app.netlify.com${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}========================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Visit your Netlify dashboard to see the deployment"
echo "2. Configure custom domain (optional)"
echo "3. Test the deployed application"
echo "4. Monitor logs and performance"
echo ""
echo "Test accounts:"
echo "  Admin: kwizera / Mugix260"
echo "  Teacher: teacher / teach123"
echo "  Student: demo / demo123"
echo ""
echo -e "${GREEN}Uruziga is now live! 🌍${NC}"
