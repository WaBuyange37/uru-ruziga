require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('languages').select('count', { count: 'exact', head: true });

        if (error) {
            // Table might not exist yet, which is fine, but connection worked if we got a specific error from PG
            if (error.code === '42P01') { // undefined_table
                console.log('✅ Connection successful! (Database connected, but "languages" table not found yet - install schema)');
                return;
            }
            throw error;
        }
        console.log('✅ Connection successful!');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testConnection();
