require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

const client = new Client({ connectionString });

async function fixStorage() {
    console.log('🛠️ Attempting to fix Storage Schema...');
    try {
        await client.connect();

        const sqlPath = path.join(__dirname, 'supabase', 'fix-storage.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        const res = await client.query(sql);
        console.log('✅ Fix script executed.');

        // Check if tables exist now
        const checkRes = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'storage';`);
        if (checkRes.rows.length === 0) {
            console.log('⚠️ Warning: "storage" schema exists but no tables found. The "storage" extension might not be enabled properly.');
            console.log('   Possible validation: Run `select * from pg_extension;`');
        } else {
            console.log('✅ Storage tables found:', checkRes.rows.map(r => r.table_name).join(', '));
        }

    } catch (error) {
        console.error('❌ Fix failed:', error);
    } finally {
        await client.end();
    }
}

fixStorage();
