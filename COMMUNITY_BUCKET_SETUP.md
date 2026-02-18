# Community Posts Bucket Setup 🚀

## Quick Fix for Upload Error

The upload is failing because the `community-posts` bucket doesn't exist in your Supabase storage. Here are 3 ways to fix this:

## Option 1: SQL Script (Recommended)
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste this SQL:

```sql
-- Create the community-posts bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-posts',
  'community-posts',
  true,
  52428800, -- 50MB
  ARRAY[
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
) ON CONFLICT (id) DO NOTHING;

-- Create policies for the bucket
CREATE POLICY "Public read access for community posts" ON storage.objects
FOR SELECT USING (bucket_id = 'community-posts');

CREATE POLICY "Authenticated users can upload community posts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'community-posts' AND 
  auth.role() = 'authenticated'
);
```

4. Click "Run" to execute

## Option 2: Manual Creation
1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `community-posts`
4. Make it Public: ✅
5. File size limit: 50MB
6. Allowed MIME types: `image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/wav,application/pdf`

## Option 3: Node.js Script
```bash
npm install @supabase/supabase-js
node setup-community-bucket.js
```

## Test the Fix
1. Go to `/community` page
2. Click "New Post"
3. Try uploading an image
4. Should work now! ✅

## What Changed
- ✅ Updated upload API to use `community-posts` bucket
- ✅ Added detailed logging for debugging
- ✅ Enhanced error handling
- ✅ Created proper storage policies

## File Structure
```
community-posts/
└── community/
    └── {userId}/
        ├── 1708123456789-abc123.jpg
        ├── 1708123456790-def456.mp4
        └── 1708123456791-ghi789.png
```

After creating the bucket, the community image posting will work perfectly! 🎉