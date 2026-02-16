require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

const client = new Client({ connectionString });

async function forceCreateStorage() {
    console.log('☢️  FORCE CREATING STORAGE SCHEMA...');
    try {
        await client.connect();

        const sqlPath = path.join(__dirname, 'supabase', 'force-create-storage.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Check if auth schema exists (dependency)
        try {
            await client.query('SELECT * FROM "auth"."users" LIMIT 1');
        } catch {
            console.log('⚠️  "auth.users" not accessible. Buckets/Objects foreign keys might fail if auth is missing.');
        }

        await client.query(sql);
        console.log('✅ Tables created successfully.');

        // Verify
        const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'storage';`);
        console.log('📊 Tables in storage schema:', res.rows.map(r => r.table_name));

    } catch (error) {
        console.error('❌ Force creation failed:', error.message);
    } finally {
        await client.end();
    }
}

forceCreateStorage();
