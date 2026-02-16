// test-supabase-storage.js
// Test Supabase storage connection

import { createClient } from '@supabase/supabase-js'

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Testing Supabase Storage...')
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('\n❌ Please check your .env file:')
  console.log('NEXT_PUBLIC_SUPABASE_URL should be set')
  console.log('SUPABASE_SERVICE_ROLE_KEY should be set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testStorage() {
  try {
    // Test 1: List buckets
    console.log('\n📦 Testing bucket access...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.log('❌ Bucket access failed:', bucketError.message)
    } else {
      console.log('✅ Buckets found:', buckets.length)
      buckets.forEach(bucket => console.log(`  - ${bucket.name}`))
    }

    // Test 2: Upload a test file
    console.log('\n📤 Testing file upload...')
    const testFile = Buffer.from('Hello Supabase Storage!')
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('test-bucket')
      .upload('test.txt', testFile, {
        contentType: 'text/plain'
      })

    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message)
      
      // Try to create bucket if it doesn't exist
      if (uploadError.message.includes('Bucket not found')) {
        console.log('🔨 Creating test-bucket...')
        const { error: createError } = await supabase.storage.createBucket('test-bucket', {
          public: true
        })
        
        if (createError && !createError.message.includes('already exists')) {
          console.log('❌ Bucket creation failed:', createError.message)
        } else {
          console.log('✅ Bucket created, retrying upload...')
          
          // Retry upload
          const { data: retryData, error: retryError } = await supabase.storage
            .from('test-bucket')
            .upload('test.txt', testFile, {
              contentType: 'text/plain'
            })
          
          if (retryError) {
            console.log('❌ Retry upload failed:', retryError.message)
          } else {
            console.log('✅ File uploaded successfully!')
          }
        }
      }
    } else {
      console.log('✅ File uploaded successfully!')
      console.log('📁 File path:', uploadData.path)
    }

    // Test 3: Get public URL
    console.log('\n🔗 Testing public URL...')
    const { data: urlData } = supabase.storage
      .from('test-bucket')
      .getPublicUrl('test.txt')
    
    console.log('✅ Public URL:', urlData.publicUrl)

    // Test 4: List files
    console.log('\n📋 Testing file list...')
    const { data: files, error: listError } = await supabase.storage
      .from('test-bucket')
      .list()
    
    if (listError) {
      console.log('❌ List failed:', listError.message)
    } else {
      console.log('✅ Files in bucket:', files.length)
      files.forEach(file => console.log(`  - ${file.name}`))
    }

    console.log('\n🎉 Supabase Storage test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testStorage()
