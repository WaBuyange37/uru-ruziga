require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

const client = new Client({ connectionString });

async function debugExtensions() {
    console.log('🔍 Debugging Extensions...');
    try {
        await client.connect();

        const sqlPath = path.join(__dirname, 'supabase', 'debug-extensions.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute line by line or block to capture specific errors
        // Simple split by ; for now (rough)
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

        for (const stmt of statements) {
            try {
                console.log(`\nExecuting: ${stmt.substring(0, 50)}...`);
                const res = await client.query(stmt);
                if (res.rows.length > 0) {
                    console.log('Result:', res.rows);
                } else {
                    console.log('Success (no rows returned).');
                }
            } catch (e) {
                console.error('Error executing statement:', e.message);
            }
        }

    } catch (error) {
        console.error('❌ Connection failed:', error);
    } finally {
        await client.end();
    }
}

debugExtensions();
