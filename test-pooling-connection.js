// Test with connection pooling URL
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

// Try different connection string formats
const connectionStrings = [
  process.env.DATABASE_URL,
  `postgresql://postgres.UruzigaUmwero260:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.UruzigaUmwero260:password@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`
];

async function testConnections() {
  for (let i = 0; i < connectionStrings.length; i++) {
    const dbUrl = connectionStrings[i];
    if (!dbUrl) continue;
    
    console.log(`\n--- Testing connection ${i + 1} ---`);
    console.log('URL:', dbUrl.replace(/:([^@]+)@/, ':***@'));
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    });
    
    try {
      await prisma.$connect();
      console.log('✅ Connected successfully!');
      
      const result = await prisma.$queryRaw`SELECT version()`;
      console.log('✅ Query executed:', result[0].version.substring(0, 50) + '...');
      
      await prisma.$disconnect();
      return; // Stop on first successful connection
    } catch (error) {
      console.log('❌ Failed:', error.message);
      await prisma.$disconnect();
    }
  }
}

testConnections();
