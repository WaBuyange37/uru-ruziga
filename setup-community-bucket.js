// Setup Community Posts Bucket
// Run with: node setup-community-bucket.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCommunityBucket() {
  try {
    console.log('🚀 Creating community-posts bucket...');
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('community-posts', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'image/jpeg', 
        'image/png', 
        'image/webp', 
        'image/gif',
        'video/mp4', 
        'video/webm',
        'audio/mpeg', 
        'audio/wav',
        'application/pdf'
      ]
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket already exists!');
      } else {
        console.error('❌ Error creating bucket:', error);
        return;
      }
    } else {
      console.log('✅ Bucket created successfully!', data);
    }

    // Test upload
    console.log('🧪 Testing upload...');
    const testFile = Buffer.from('test content');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('community-posts')
      .upload('test/test.txt', testFile, {
        contentType: 'text/plain'
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
    } else {
      console.log('✅ Upload test successful!');
      
      // Clean up test file
      await supabase.storage
        .from('community-posts')
        .remove(['test/test.txt']);
      console.log('🧹 Test file cleaned up');
    }

    console.log('🎉 Community posts bucket is ready!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

createCommunityBucket();