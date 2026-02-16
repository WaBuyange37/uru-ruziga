-- ==========================================
-- Storage Setup
-- ==========================================

-- A. Character Images (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'character-images',
  'character-images',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- B. User Drawings (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-drawings',
  'user-drawings',
  false,
  2097152, -- 2MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- C. Audio Files (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-files',
  'audio-files',
  true,
  10485760, -- 10MB
  ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']
) ON CONFLICT (id) DO NOTHING;

-- D. Video Files (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'video-files',
  'video-files',
  true,
  52428800, -- 50MB
  ARRAY['video/mp4', 'video/webm', 'video/ogg']
) ON CONFLICT (id) DO NOTHING;

-- E. Profile Pictures (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- Storage Policies
-- ==========================================

-- Character images
CREATE POLICY "Public Access Character Images" ON storage.objects
FOR SELECT USING (bucket_id = 'character-images');

-- Audio files
CREATE POLICY "Public Access Audio Files" ON storage.objects
FOR SELECT USING (bucket_id = 'audio-files');

-- Video files
CREATE POLICY "Public Access Video Files" ON storage.objects
FOR SELECT USING (bucket_id = 'video-files');

-- Profile pictures
CREATE POLICY "Public Access Profile Pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

-- User Drawings (Private)

-- Upload policy
CREATE POLICY "Users can upload own drawings" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-drawings' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- View policy
CREATE POLICY "Users can view own drawings" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-drawings' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
