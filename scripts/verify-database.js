#!/usr/bin/env node

/**
 * Database Verification Script
 * Checks database connection, schema, and readiness for production
 */

// Load environment variables
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function verifyDatabaseConnection() {
  console.log('🔍 Verifying Database Connection...\n');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('✅ Database query successful');
    console.log(`   Database: ${result[0].current_database}`);
    console.log(`   User: ${result[0].current_user}`);
    console.log(`   Version: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`   ${error.message}\n`);
    return false;
  }
}

async function verifyTables() {
  console.log('🔍 Verifying Database Tables...\n');
  
  const requiredTables = [
    'users',
    'characters',
    'lessons',
    'handwriting_attempts',
    'character_references',
    'community_entries',
    'dataset_entries',
    'user_character_progress',
    'lesson_progress'
  ];
  
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    const tableNames = tables.map(t => t.table_name);
    console.log(`✅ Found ${tableNames.length} tables in database\n`);
    
    // Check required tables
    const missing = requiredTables.filter(t => !tableNames.includes(t));
    
    if (missing.length > 0) {
      console.log('⚠️  Missing required tables:');
      missing.forEach(t => console.log(`   - ${t}`));
      console.log('\n💡 Run: npx prisma db push\n');
      return false;
    }
    
    console.log('✅ All required tables exist\n');
    return true;
  } catch (error) {
    console.error('❌ Table verification failed:');
    console.error(`   ${error.message}\n`);
    return false;
  }
}

async function verifyDataIntegrity() {
  console.log('🔍 Verifying Data Integrity...\n');
  
  try {
    // Check user count
    const userCount = await prisma.user.count();
    console.log(`✅ Users: ${userCount}`);
    
    // Check character count
    const characterCount = await prisma.character.count();
    console.log(`✅ Characters: ${characterCount}`);
    
    // Check lesson count
    const lessonCount = await prisma.lesson.count();
    console.log(`✅ Lessons: ${lessonCount}`);
    
    // Check handwriting attempts
    const attemptCount = await prisma.handwritingAttempt.count();
    console.log(`✅ Handwriting Attempts: ${attemptCount}`);
    
    // Check dataset entries
    const datasetCount = await prisma.datasetEntry.count();
    console.log(`✅ Dataset Entries: ${datasetCount}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Data integrity check failed:');
    console.error(`   ${error.message}\n`);
    return false;
  }
}

async function verifyIndexes() {
  console.log('🔍 Verifying Database Indexes...\n');
  
  try {
    const indexes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;
    
    console.log(`✅ Found ${indexes.length} indexes\n`);
    
    // Check critical indexes
    const criticalIndexes = [
      'users_email_key',
      'characters_umweroGlyph_key',
      'handwriting_attempts_userId_characterId_idx',
      'dataset_entries_characterId_idx'
    ];
    
    const indexNames = indexes.map(i => i.indexname);
    const missingIndexes = criticalIndexes.filter(i => !indexNames.includes(i));
    
    if (missingIndexes.length > 0) {
      console.log('⚠️  Missing critical indexes:');
      missingIndexes.forEach(i => console.log(`   - ${i}`));
      console.log('\n💡 Run: npx prisma db push\n');
      return false;
    }
    
    console.log('✅ All critical indexes exist\n');
    return true;
  } catch (error) {
    console.error('❌ Index verification failed:');
    console.error(`   ${error.message}\n`);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  DATABASE VERIFICATION FOR PRODUCTION DEPLOYMENT');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const checks = [
    { name: 'Connection', fn: verifyDatabaseConnection },
    { name: 'Tables', fn: verifyTables },
    { name: 'Data Integrity', fn: verifyDataIntegrity },
    { name: 'Indexes', fn: verifyIndexes }
  ];
  
  const results = [];
  
  for (const check of checks) {
    const result = await check.fn();
    results.push({ name: check.name, passed: result });
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('  VERIFICATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  results.forEach(r => {
    const status = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${r.name}`);
  });
  
  const allPassed = results.every(r => r.passed);
  
  console.log('\n═══════════════════════════════════════════════════════');
  
  if (allPassed) {
    console.log('✅ DATABASE IS READY FOR PRODUCTION DEPLOYMENT');
  } else {
    console.log('❌ DATABASE NEEDS ATTENTION BEFORE DEPLOYMENT');
    console.log('\n📋 Next Steps:');
    console.log('   1. Fix any failed checks above');
    console.log('   2. Run: npx prisma db push');
    console.log('   3. Run: npx prisma generate');
    console.log('   4. Run this script again');
  }
  
  console.log('═══════════════════════════════════════════════════════\n');
  
  await prisma.$disconnect();
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
