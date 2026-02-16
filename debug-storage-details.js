require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStorageDetails() {
    console.log('🔍 Checking Storage details...');
    try {
        // Check extensions
        const extensions = await prisma.$queryRaw`SELECT extname, extversion FROM pg_extension`;
        console.log('Extensions:', extensions);

        // Check tables in storage schema
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'storage'
    `;
        console.log('Tables in storage schema:', tables);

        if (tables.length === 0) {
            console.log('⚠️ No tables found in storage schema!');
        }
    } catch (error) {
        console.error('❌ Check failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkStorageDetails();
