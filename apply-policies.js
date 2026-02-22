require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Error: DATABASE_URL not found in .env');
    process.exit(1);
}

const client = new Client({
    connectionString,
});

async function applyPolicies() {
    console.log('🔒 Connecting to database to apply policies...');
    try {
        await client.connect();

        // Read SQL file
        const sqlPath = path.join(__dirname, 'supabase', 'setup-policies.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📜 Executing SQL script...');

        // Split by statement if needed, or run as one block. pg usually handles multiple statements.
        await client.query(sql);

        console.log('✅ Policies and Buckets applied successfully!');

    } catch (error) {
        if (error.code === '42P01') {
            console.error('❌ Table/Relation error:', error.message);
            console.error('   Hint: Did you forget to enable the Storage extension or push the schema?');
        } else if (error.code === '42710') {
            console.error('⚠️ Policy already exists (skipping):', error.message);
        } else {
            console.error('❌ Execution failed:', error);
        }
    } finally {
        await client.end();
    }
}

applyPolicies();
