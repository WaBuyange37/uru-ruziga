require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

const client = new Client({ connectionString });

async function applyDbPolicies() {
    console.log('🔒 Applying Database RLS Policies...');
    try {
        await client.connect();

        const sqlPath = path.join(__dirname, 'supabase', 'setup-db-rls.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split statements to avoid "cannot insert multiple commands into prepared statement" if that issue arises,
        // though pg usually handles it.
        await client.query(sql);

        console.log('✅ Database RLS Policies applied successfully!');
    } catch (error) {
        if (error.code === '42P01') {
            console.error('❌ Table not found:', error.message);
            console.error('   Note: Start checking if Prisma schema maps match DB table names.');
        } else {
            console.error('❌ Execution failed:', error);
        }
    } finally {
        await client.end();
    }
}

applyDbPolicies();
