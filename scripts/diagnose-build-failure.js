#!/usr/bin/env node

// scripts/diagnose-build-failure.js
// Diagnose Netlify build failures

console.log('🔍 NETLIFY BUILD FAILURE DIAGNOSIS')
console.log('==================================')

console.log('\n📋 COMMON NETLIFY BUILD FAILURES:')

console.log('\n1️⃣ MISSING ENVIRONMENT VARIABLES')
console.log('   Error: "process.env.VARIABLE_NAME is undefined"')
console.log('   Fix: Add all environment variables to Netlify Dashboard')

console.log('\n2️⃣ TYPESCRIPT COMPILATION ERRORS')
console.log('   Error: "Type error" or "TS2xxx"')
console.log('   Fix: Check TypeScript errors in your code')

console.log('\n3️⃣ DEPENDENCY INSTALLATION FAILURES')
console.log('   Error: "npm ERR!" or "yarn error"')
console.log('   Fix: Check package.json dependencies')

console.log('\n4️⃣ PRISMA GENERATION FAILURES')
console.log('   Error: "Prisma schema not found" or "prisma generate failed"')
console.log('   Fix: Ensure DATABASE_URL is set and schema is valid')

console.log('\n5️⃣ NEXT.JS BUILD ERRORS')
console.log('   Error: "Build failed" or "next build failed"')
console.log('   Fix: Check Next.js configuration and code errors')

console.log('\n6️⃣ OUT OF MEMORY ERRORS')
console.log('   Error: "JavaScript heap out of memory"')
console.log('   Fix: Optimize build or increase memory limit')

console.log('\n🔧 DEBUGGING STEPS:')
console.log('1. Check Netlify build logs for specific error messages')
console.log('2. Look for red error text in the deployment logs')
console.log('3. Verify all environment variables are set')
console.log('4. Test build locally: npm run build')
console.log('5. Check if all dependencies are installed')

console.log('\n💡 QUICK FIXES TO TRY:')
console.log('1. Clear cache and redeploy')
console.log('2. Add missing environment variables')
console.log('3. Check Node.js version (should be 18+)')
console.log('4. Verify build command is "npm run build"')
console.log('5. Ensure publish directory is ".next"')

console.log('\n📞 SHARE THIS INFORMATION:')
console.log('To get specific help, share:')
console.log('- The exact error message from Netlify logs')
console.log('- Which step in the build process failed')
console.log('- Any red error text from the deployment')

console.log('\n🎯 MOST LIKELY ISSUES:')
console.log('1. Missing DATABASE_URL environment variable')
console.log('2. Missing other required environment variables')
console.log('3. TypeScript compilation errors')
console.log('4. Prisma schema generation failure')

console.log('\n⚡ IMMEDIATE ACTION:')
console.log('Go to Netlify Dashboard → Site → Deploys → Click failed deployment')
console.log('Look for the first red error message and share it here!')