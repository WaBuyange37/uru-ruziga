#!/bin/bash

# Database Fix Script for Production Deployment
# This script helps diagnose and fix common database issues

echo "═══════════════════════════════════════════════════════"
echo "  URUZIGA DATABASE FIX SCRIPT"
echo "═══════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "   Please create .env file with database credentials"
    echo "   Copy from .env.example and fill in your values"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"
echo ""

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env; then
    echo -e "${RED}❌ DATABASE_URL not set in .env${NC}"
    echo "   Please add DATABASE_URL to your .env file"
    exit 1
fi

echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma Client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi
echo ""

# Step 2: Test database connection
echo "🔌 Step 2: Testing database connection..."
node scripts/verify-database.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo -e "${GREEN}✅ DATABASE IS READY FOR PRODUCTION${NC}"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy to Vercel/Netlify"
    echo "  2. Deploy Python AI service to Railway/Render"
    echo "  3. Configure domain name"
    echo "  4. Test production deployment"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠️  Database connection failed${NC}"
    echo ""
    echo "Possible issues:"
    echo "  1. Supabase project is paused (free tier)"
    echo "  2. Database credentials are incorrect"
    echo "  3. Network/firewall issue"
    echo ""
    echo "Solutions:"
    echo "  1. Check Supabase dashboard: https://supabase.com/dashboard"
    echo "  2. Resume paused project if needed"
    echo "  3. Get fresh connection strings from Settings → Database"
    echo "  4. Update DATABASE_URL and DIRECT_URL in .env"
    echo ""
    echo "Then run this script again:"
    echo "  bash scripts/fix-database.sh"
    echo ""
    
    # Try to push schema anyway
    echo "🔄 Attempting to push schema to database..."
    npx prisma db push --skip-generate
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Schema pushed successfully${NC}"
        echo ""
        echo "Now run verification again:"
        echo "  node scripts/verify-database.js"
    else
        echo -e "${RED}❌ Schema push failed${NC}"
        echo ""
        echo "Please follow the troubleshooting steps in:"
        echo "  DATABASE_PRODUCTION_SETUP.md"
    fi
    
    exit 1
fi
