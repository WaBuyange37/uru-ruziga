// Test connection after schema creation
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

async function testAfterSchema() {
  try {
    console.log('Testing after schema creation...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Test if languages table exists
    const { data: languages, error: langError } = await supabase
      .from('languages')
      .select('*')
      .limit(1);
    
    if (langError) {
      console.log('❌ Languages table not found:', langError.message);
    } else {
      console.log('✅ Languages table found!');
      console.log('Sample data:', languages);
    }
    
    // Test if users table exists
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('count(*)')
      .single();
    
    if (userError) {
      console.log('❌ Users table error:', userError.message);
    } else {
      console.log('✅ Users table accessible!');
    }
    
    // Test inserting a test user
    console.log('\n--- Testing insert operations ---');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: 'test@example.com',
        username: 'testuser',
        password: 'testpass123',
        full_name: 'Test User'
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('Insert error:', insertError.message);
    } else {
      console.log('✅ Test user created:', newUser.email);
      
      // Clean up test user
      await supabase
        .from('users')
        .delete()
        .eq('email', 'test@example.com');
      console.log('✅ Test user cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAfterSchema();
