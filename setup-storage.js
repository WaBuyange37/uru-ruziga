require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket(bucketName, isPublic = true) {
    console.log(`Checking bucket: ${bucketName}...`);
    const { data, error } = await supabase.storage.getBucket(bucketName);

    if (error && error.message.includes('not found')) {
        console.log(`Bucket '${bucketName}' not found. Creating...`);
        const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
            public: isPublic,
            fileSizeLimit: isPublic ? 52428800 : 10485760, // 50MB for media, 10MB for submissions
            allowedMimeTypes: isPublic ? ['image/*', 'video/*'] : ['image/*'],
        });

        if (createError) {
            console.error(`❌ Failed to create bucket '${bucketName}':`, createError.message);
        } else {
            console.log(`✅ Bucket '${bucketName}' created successfully.`);
        }
    } else if (error) {
        if (error.code === '42P01') {
            console.error(`❌ Error checking bucket '${bucketName}': Table not found (Service might not be initialized yet).`);
        } else {
            console.error(`❌ Error checking bucket '${bucketName}':`, error.message);
        }
    } else {
        console.log(`✅ Bucket '${bucketName}' already exists.`);
    }
}

async function setupStorage() {
    console.log('📦 Setting up Supabase Storage...');

    // 1. Avatars (Public)
    await createBucket('avatars', true);

    // 2. Lesson Media - Videos & Images (Public only)
    await createBucket('lesson-media', true);

    // 3. User Submissions - Homework/Canvas (Private/Auth only)
    // We make it public: false so it requires signed URLs or RLS policies for access
    await createBucket('user-submissions', false);

    console.log('✨ Storage setup complete!');
}

setupStorage();
