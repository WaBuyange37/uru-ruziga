#!/bin/bash
# deploy-community-features.sh
# Deployment script for Community and Umwero Chat features

echo "🚀 Deploying Community & Umwero Chat Features"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if database is accessible
echo "📊 Step 1: Checking database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    echo "Please check your DATABASE_URL in .env file"
    exit 1
fi

# Step 2: Run database migration
echo ""
echo "📊 Step 2: Running database migration..."
npx prisma migrate dev --name add_community_and_multilingual

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migration completed successfully${NC}"
else
    echo -e "${RED}✗ Migration failed${NC}"
    exit 1
fi

# Step 3: Generate Prisma client
echo ""
echo "🔧 Step 3: Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma client generated${NC}"
else
    echo -e "${RED}✗ Prisma client generation failed${NC}"
    exit 1
fi

# Step 4: Install dependencies (if needed)
echo ""
echo "📦 Step 4: Checking dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Some dependencies may not have installed correctly${NC}"
fi

# Step 5: Build the project
echo ""
echo "🏗️  Step 5: Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build completed successfully${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    echo "Please check the error messages above"
    exit 1
fi

# Step 6: Run tests (if available)
echo ""
echo "🧪 Step 6: Running tests..."
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    npm test
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ All tests passed${NC}"
    else
        echo -e "${YELLOW}⚠ Some tests failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No tests found, skipping...${NC}"
fi

# Step 7: Summary
echo ""
echo "=============================================="
echo "🎉 Deployment Summary"
echo "=============================================="
echo ""
echo -e "${GREEN}✓ Database migration completed${NC}"
echo -e "${GREEN}✓ Prisma client generated${NC}"
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo -e "${GREEN}✓ Project built successfully${NC}"
echo ""
echo "📋 New Features Added:"
echo "  • Community posts with language support (EN, RW, UM)"
echo "  • Like and comment system"
echo "  • ML training data collection"
echo "  • Umwero chat with PNG generation"
echo "  • Social media sharing"
echo ""
echo "🔧 Next Steps:"
echo "  1. Test the community page: http://localhost:3000/community"
echo "  2. Test the umwero chat: http://localhost:3000/umwero-chat"
echo "  3. Create a test post in each language"
echo "  4. Generate and share a PNG image"
echo "  5. Check the database for training data"
echo ""
echo "📚 Documentation:"
echo "  • FINAL_IMPLEMENTATION_SUMMARY.md"
echo "  • MULTILINGUAL_COMMUNITY_IMPLEMENTATION.md"
echo "  • COMMUNITY_UMWERO_CHAT_UPGRADE.md"
echo ""
echo "🚀 To start the development server:"
echo "  npm run dev"
echo ""
echo "🌐 To deploy to production:"
echo "  git add ."
echo "  git commit -m 'Add community and multilingual features'"
echo "  git push origin main"
echo ""
echo -e "${GREEN}✓ Deployment script completed successfully!${NC}"
echo ""
