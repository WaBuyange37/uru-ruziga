#!/usr/bin/env node

/**
 * Push Prisma Schema to Database
 * Creates all missing tables including AI dataset tables
 */

require('dotenv').config();

const { execSync } = require('child_process');

console.log('═══════════════════════════════════════════════════════');
console.log('  PUSHING SCHEMA TO DATABASE');
console.log('═══════════════════════════════════════════════════════\n');

console.log('This will create all missing tables including:');
console.log('  ✓ handwriting_attempts');
console.log('  ✓ character_references');
console.log('  ✓ community_entries');
console.log('  ✓ dataset_entries\n');

try {
  console.log('Pushing schema...\n');
  
  const result = execSync('npx prisma db push --skip-generate', {
    encoding: 'utf8',
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL
    }
  });
  
  console.log('\n✅ Schema pushed successfully!\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
} catch (error) {
  console.error('\n❌ Failed to push schema');
  console.error('Error:', error.message);
  console.log('\n📋 Troubleshooting:');
  console.log('  1. Check your DATABASE_URL in .env');
  console.log('  2. Verify project is not paused in Supabase');
  console.log('  3. Try: node scripts/test-direct-connection.js\n');
  process.exit(1);
}
