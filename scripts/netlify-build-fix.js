#!/usr/bin/env node

// scripts/netlify-build-fix.js
// Optimized build process for Netlify

const { execSync } = require('child_process');

console.log('🔧 NETLIFY BUILD OPTIMIZATION');
console.log('=============================');

try {
  console.log('\n1️⃣ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n2️⃣ Running Next.js build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ BUILD SUCCESSFUL!');
  
} catch (error) {
  console.error('\n❌ BUILD FAILED:', error.message);
  
  console.log('\n🔍 TROUBLESHOOTING STEPS:');
  console.log('1. Check environment variables are set');
  console.log('2. Verify DATABASE_URL is accessible');
  console.log('3. Check for TypeScript errors');
  console.log('4. Ensure all dependencies are installed');
  
  process.exit(1);
}