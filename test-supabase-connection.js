// Test Supabase connection
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Test basic connection
    const { data, error } = await supabase.from('information_schema.tables').select('table_name').limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('Data:', data);
    }
    
    // Test if we can create a simple table
    console.log('\n--- Testing table creation ---');
    const { error: createError } = await supabase.rpc('create_test_table');
    
    if (createError && !createError.message.includes('already exists')) {
      console.log('Table creation test:', createError.message);
    } else {
      console.log('✅ Table operations accessible');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testSupabaseConnection();
