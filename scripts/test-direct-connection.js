#!/usr/bin/env node

/**
 * Test Direct Database Connection
 * Tests both pooler and direct connection
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

async function testConnection(url, name) {
  console.log(`\n🔍 Testing ${name}...`);
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    },
    log: ['error']
  });
  
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT current_database(), version()`;
    console.log(`✅ ${name} - SUCCESS`);
    console.log(`   Database: ${result[0].current_database}`);
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log(`❌ ${name} - FAILED`);
    console.log(`   Error: ${error.message}`);
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  DATABASE CONNECTION TEST');
  console.log('═══════════════════════════════════════════════════════');
  
  const poolerUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  
  console.log('\nConnection URLs:');
  console.log(`Pooler: ${poolerUrl?.substring(0, 50)}...`);
  console.log(`Direct: ${directUrl?.substring(0, 50)}...`);
  
  const poolerWorks = await testConnection(poolerUrl, 'Pooler Connection (port 6543)');
  const directWorks = await testConnection(directUrl, 'Direct Connection (port 5432)');
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (poolerWorks || directWorks) {
    console.log('✅ At least one connection method works!');
    if (directWorks && !poolerWorks) {
      console.log('\n💡 Recommendation: Use DIRECT_URL for now');
      console.log('   Update prisma/schema.prisma:');
      console.log('   url = env("DIRECT_URL")');
    }
  } else {
    console.log('❌ Both connection methods failed');
    console.log('\n📋 Possible issues:');
    console.log('   1. Project is paused (check Supabase dashboard)');
    console.log('   2. Credentials are incorrect');
    console.log('   3. Network/firewall blocking connection');
    console.log('   4. Database password changed');
  }
  
  console.log('\n═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
