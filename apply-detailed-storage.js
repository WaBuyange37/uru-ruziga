require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

const client = new Client({ connectionString });

async function applyStorage() {
    console.log('📦 Applying Detailed Storage Setup...');
    try {
        await client.connect();

        const sqlPath = path.join(__dirname, 'supabase', 'setup-detailed-storage.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);

        console.log('✅ Storage setup applied successfully!');
    } catch (error) {
        if (error.code === '42P01') {
            console.error('❌ Table not found (storage.buckets):', error.message);
            console.error('   👉 ACTION REQUIRED: Please create at least ONE bucket manually in Supabase Dashboard -> Storage to initialize the system tables.');
        } else if (error.code === '42710') {
            console.log('⚠️ Some policies already exist (skipping/ignoring error).');
        } else {
            console.error('❌ Execution failed:', error);
        }
    } finally {
        await client.end();
    }
}

applyStorage();
