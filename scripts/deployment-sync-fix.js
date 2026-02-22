#!/usr/bin/env node

// scripts/deployment-sync-fix.js
// Comprehensive deployment synchronization fix

console.log(`
🚀 DEPLOYMENT SYNCHRONIZATION FIX
==================================

ISSUE: Local works, deployed doesn't + database issues
CAUSE: Deployment platform out of sync with local changes

📋 STEP-BY-STEP FIX CHECKLIST:

1️⃣ VERIFY GIT PUSH STATUS
   ✅ Check if latest changes are pushed to main branch
   
   Commands to run:
   git status
   git log --oneline -5
   git push origin main --force-with-lease

2️⃣ DEPLOYMENT PLATFORM REBUILD
   ✅ Force rebuild on your deployment platform
   
   For Netlify:
   - Go to Netlify dashboard
   - Click "Trigger deploy" → "Deploy site"
   - Or: Clear cache and deploy
   
   For Vercel:
   - Go to Vercel dashboard  
   - Click "Redeploy" on latest deployment
   - Enable "Use existing Build Cache: No"

3️⃣ ENVIRONMENT VARIABLES SYNC
   ✅ Ensure production has same environment variables as local
   
   Required variables:
   - DATABASE_URL (production database)
   - DIRECT_URL (production database direct connection)
   - JWT_SECRET
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENAI_API_KEY
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (production URL)

4️⃣ DATABASE MIGRATION
   ✅ Run database migrations on production
   
   Commands:
   npx prisma migrate deploy
   npx prisma generate
   npx prisma db seed

5️⃣ CLEAR BUILD CACHE
   ✅ Clear all caches and rebuild
   
   Local:
   rm -rf .next
   rm -rf node_modules/.cache
   npm run build
   
   Production: Use platform's "Clear cache" option

6️⃣ VERIFY DEPLOYMENT
   ✅ Check production site functionality
   
   Test:
   - Site loads correctly
   - Database connections work
   - Authentication works
   - Progress tracking works

🔧 COMMON DEPLOYMENT PLATFORMS:

NETLIFY:
- Dashboard → Site → Deploys → "Trigger deploy"
- Site settings → Environment variables
- Functions → Check if API routes are deployed

VERCEL:
- Dashboard → Project → Deployments → "Redeploy"
- Settings → Environment Variables
- Functions → Check serverless function logs

RAILWAY/RENDER:
- Dashboard → Service → Deploy
- Environment → Variables
- Logs → Check deployment logs

🚨 CRITICAL CHECKS:

✅ Production DATABASE_URL points to production database
✅ All environment variables are set in production
✅ Latest code is pushed to the correct branch
✅ Deployment platform is watching the correct branch
✅ Build logs show no errors
✅ API routes are accessible in production

💡 DEBUGGING TIPS:

1. Check deployment logs for errors
2. Test API endpoints directly: /api/debug/auth
3. Verify database connection in production
4. Compare local vs production environment variables
5. Check if Prisma schema is up to date in production

🎯 EXPECTED RESULT:
Production site should match local functionality exactly.
`)

// Environment variable checker
function checkEnvironmentVariables() {
  const requiredVars = [
    'DATABASE_URL',
    'DIRECT_URL', 
    'JWT_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ]

  console.log('\n🔍 LOCAL ENVIRONMENT VARIABLES CHECK:')
  console.log('=====================================')
  
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      console.log(`✅ ${varName}: Set (${value.length} chars)`)
    } else {
      console.log(`❌ ${varName}: Missing`)
    }
  })
  
  console.log('\n📝 Copy these to your production environment!')
}

checkEnvironmentVariables()