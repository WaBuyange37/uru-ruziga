require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSchemas() {
    console.log('🔍 Checking database schemas...');
    try {
        const schemas = await prisma.$queryRaw`SELECT schema_name FROM information_schema.schemata`;
        console.log('Schemas found:', schemas);

        // Check if 'storage' schema exists
        const hasStorage = schemas.some(s => s.schema_name === 'storage');
        if (hasStorage) {
            console.log('✅ Storage schema exists.');
        } else {
            console.log('❌ Storage schema MISSING!');
            // Check extensions
            const extensions = await prisma.$queryRaw`SELECT * FROM pg_extension`;
            console.log('Extensions installed:', extensions);
        }
    } catch (error) {
        console.error('❌ Schema check failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchemas();
