-- Create Community Posts Bucket in Supabase
-- Run this in your Supabase SQL Editor

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

CREATE POLICY "Users can delete their own community posts" ON storage.objects
FOR DELETE USING (
  bucket_id = 'community-posts' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = 'community' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Grant permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;