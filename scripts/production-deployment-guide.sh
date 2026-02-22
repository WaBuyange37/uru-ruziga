#!/bin/bash

# scripts/production-deployment-guide.sh
# Complete production deployment guide

echo "🚀 PRODUCTION DEPLOYMENT GUIDE"
echo "==============================="

echo ""
echo "1️⃣ FORCE PUSH LATEST CHANGES"
echo "-----------------------------"
echo "git add ."
echo "git commit -m 'Deploy: State synchronization fixes and Napoleon merge'"
echo "git push origin main --force-with-lease"

echo ""
echo "2️⃣ CLEAR LOCAL BUILD CACHE"
echo "---------------------------"
echo "rm -rf .next"
echo "rm -rf node_modules/.cache"
echo "npm run build"

echo ""
echo "3️⃣ ENVIRONMENT VARIABLES FOR PRODUCTION"
echo "---------------------------------------"
echo "Copy these to your deployment platform:"
echo ""

# Read from .env file
if [ -f .env ]; then
    echo "📋 FROM .env FILE:"
    echo "=================="
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ ! "$line" =~ ^#.*$ ]] && [[ ! -z "$line" ]]; then
            echo "$line"
        fi
    done < .env
else
    echo "❌ .env file not found!"
fi

echo ""
echo "4️⃣ DATABASE MIGRATION COMMANDS"
echo "------------------------------"
echo "Run these in your production environment:"
echo ""
echo "npx prisma migrate deploy"
echo "npx prisma generate" 
echo "npx prisma db seed"

echo ""
echo "5️⃣ DEPLOYMENT PLATFORM ACTIONS"
echo "------------------------------"
echo ""
echo "NETLIFY:"
echo "- Go to Netlify Dashboard"
echo "- Click 'Trigger deploy' → 'Deploy site'"
echo "- Or 'Clear cache and deploy site'"
echo ""
echo "VERCEL:"
echo "- Go to Vercel Dashboard"
echo "- Click 'Redeploy' on latest deployment"
echo "- Uncheck 'Use existing Build Cache'"
echo ""
echo "RAILWAY:"
echo "- Go to Railway Dashboard"
echo "- Click 'Deploy' button"
echo "- Check deployment logs"

echo ""
echo "6️⃣ VERIFICATION CHECKLIST"
echo "-------------------------"
echo "✅ Site loads without errors"
echo "✅ /api/debug/auth returns valid response"
echo "✅ Database connection works"
echo "✅ Login/authentication works"
echo "✅ Progress tracking works"
echo "✅ All new features visible"

echo ""
echo "🔧 TROUBLESHOOTING"
echo "==================="
echo "If deployment still fails:"
echo "1. Check deployment logs for specific errors"
echo "2. Verify all environment variables are set"
echo "3. Test API endpoints directly"
echo "4. Check database connection string"
echo "5. Ensure Prisma schema is up to date"

echo ""
echo "🎯 SUCCESS CRITERIA"
echo "==================="
echo "Production site should:"
echo "- Show all new UI components"
echo "- Have working authentication"
echo "- Save progress correctly"
echo "- Match local functionality exactly"