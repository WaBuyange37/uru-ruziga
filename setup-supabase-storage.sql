-- Setup Supabase Storage for User Drawings
-- Run this in your Supabase SQL Editor

-- Create the user-drawings bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-drawings',
  'user-drawings',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security policies for user-drawings bucket

-- Allow authenticated users to upload their own drawings
CREATE POLICY "Users can upload their own drawings" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'user-drawings' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own drawings
CREATE POLICY "Users can view their own drawings" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'user-drawings' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own drawings
CREATE POLICY "Users can delete their own drawings" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'user-drawings' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access (for sharing/display purposes)
CREATE POLICY "Public read access to user drawings" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'user-drawings');

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;