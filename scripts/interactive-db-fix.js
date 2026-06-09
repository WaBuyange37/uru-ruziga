#!/usr/bin/env node

/**
 * Interactive Database Fix Script
 * Guides you through fixing database connection issues
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    return error.stdout || error.message;
  }
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  🔧 INTERACTIVE DATABASE FIX WIZARD');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('This wizard will help you fix your database connection.\n');
  
  // Step 1: Check if .env exists
  if (!fs.existsSync('.env')) {
    console.log('❌ .env file not found!\n');
    console.log('Please create a .env file first:');
    console.log('  cp .env.example .env\n');
    process.exit(1);
  }
  
  console.log('✅ .env file found\n');
  
  // Step 2: Ask about Supabase status
  console.log('Step 1: Check Supabase Project Status');
  console.log('─────────────────────────────────────\n');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Check if your project is PAUSED or ACTIVE\n');
  
  const status = await question('Is your Supabase project ACTIVE? (yes/no): ');
  
  if (status.toLowerCase() !== 'yes' && status.toLowerCase() !== 'y') {
    console.log('\n⚠️  Your project is paused!\n');
    console.log('Please:');
    console.log('1. Go to Supabase dashboard');
    console.log('2. Click "Resume" or "Restore" on your project');
    console.log('3. Wait 1-2 minutes');
    console.log('4. Run this script again\n');
    process.exit(0);
  }
  
  console.log('\n✅ Project is active\n');
  
  // Step 3: Ask about credentials
  console.log('Step 2: Update Database Credentials');
  console.log('─────────────────────────────────────\n');
  console.log('Have you updated your .env file with fresh credentials?');
  console.log('(Get them from: Settings → Database → Connection string)\n');
  
  const updated = await question('Credentials updated? (yes/no): ');
  
  if (updated.toLowerCase() !== 'yes' && updated.toLowerCase() !== 'y') {
    console.log('\n📋 Please update your .env file:\n');
    console.log('1. Go to Supabase Dashboard → Settings → Database');
    console.log('2. Copy the Connection string (URI format)');
    console.log('3. Update DATABASE_URL and DIRECT_URL in .env');
    console.log('4. Run this script again\n');
    process.exit(0);
  }
  
  console.log('\n✅ Credentials updated\n');
  
  // Step 4: Test connection
  console.log('Step 3: Testing Database Connection');
  console.log('─────────────────────────────────────\n');
  console.log('Testing connection...\n');
  
  const testResult = exec('node scripts/verify-database.js');
  
  if (testResult.includes('Database connection successful')) {
    console.log('✅ Connection successful!\n');
  } else {
    console.log('❌ Connection failed!\n');
    console.log('Error details:');
    console.log(testResult.substring(0, 500));
    console.log('\n📋 Troubleshooting:');
    console.log('1. Double-check your DATABASE_URL in .env');
    console.log('2. Make sure project is not paused');
    console.log('3. Try creating a new Supabase project\n');
    console.log('See FIX_DATABASE_NOW.md for detailed steps\n');
    process.exit(1);
  }
  
  // Step 5: Generate Prisma Client
  console.log('Step 4: Generating Prisma Client');
  console.log('─────────────────────────────────────\n');
  
  const proceed = await question('Generate Prisma Client? (yes/no): ');
  
  if (proceed.toLowerCase() === 'yes' || proceed.toLowerCase() === 'y') {
    console.log('\nGenerating...\n');
    const genResult = exec('npx prisma generate');
    
    if (genResult.includes('Generated Prisma Client')) {
      console.log('✅ Prisma Client generated\n');
    } else {
      console.log('⚠️  Generation completed with warnings\n');
    }
  }
  
  // Step 6: Push schema
  console.log('Step 5: Creating Database Tables');
  console.log('─────────────────────────────────────\n');
  console.log('This will create all missing tables including:');
  console.log('  - handwriting_attempts');
  console.log('  - character_references');
  console.log('  - community_entries');
  console.log('  - dataset_entries\n');
  
  const push = await question('Push schema to database? (yes/no): ');
  
  if (push.toLowerCase() === 'yes' || push.toLowerCase() === 'y') {
    console.log('\nPushing schema...\n');
    const pushResult = exec('npx prisma db push --accept-data-loss');
    
    if (pushResult.includes('Your database is now in sync')) {
      console.log('✅ Schema pushed successfully!\n');
    } else if (pushResult.includes('already in sync')) {
      console.log('✅ Database already up to date!\n');
    } else {
      console.log('⚠️  Push completed\n');
      console.log(pushResult.substring(0, 300));
    }
  }
  
  // Step 7: Final verification
  console.log('\nStep 6: Final Verification');
  console.log('─────────────────────────────────────\n');
  console.log('Running final checks...\n');
  
  const finalResult = exec('node scripts/verify-database.js');
  
  if (finalResult.includes('DATABASE IS READY FOR PRODUCTION')) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ SUCCESS! DATABASE IS READY FOR PRODUCTION');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Next steps:');
    console.log('  1. Deploy Python AI service: cd python-ai-service && railway up');
    console.log('  2. Deploy Next.js app: git push origin main');
    console.log('  3. Purchase and configure domain');
    console.log('  4. Go live! 🚀\n');
  } else {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ⚠️  SOME ISSUES REMAIN');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Check the output above for details.');
    console.log('See FIX_DATABASE_NOW.md for troubleshooting.\n');
  }
  
  rl.close();
}

main().catch(error => {
  console.error('Error:', error.message);
  rl.close();
  process.exit(1);
});
