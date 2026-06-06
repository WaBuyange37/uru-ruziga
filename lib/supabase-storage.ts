// lib/supabase-storage.ts
// Supabase Storage - FREE and Easy!

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const rawSupabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseServiceRoleKey =
  rawSupabaseServiceRoleKey && rawSupabaseServiceRoleKey !== 'your-supabase-service-role-key'
    ? rawSupabaseServiceRoleKey
    : undefined;

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey);

export const SUPABASE_BUCKETS = {
  userDrawings: 'user-drawings',
  characterImages: 'character-images',
  profilePictures: 'profile-pictures',
  audioFiles: 'audio-files',
  videoFiles: 'video-files',
  communityPosts: 'community-posts',
} as const;

// Upload file to Supabase Storage
export async function uploadFile(
  file: Buffer, 
  bucket: string, 
  path: string, 
  contentType: string = 'image/png'
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Supabase Storage upload failed:', {
        bucket,
        path,
        message: error.message,
        error,
      })
      throw error
    }

    console.log('Supabase Storage upload succeeded:', { bucket, path })
    return data
  } catch (error) {
    console.error('Supabase Storage upload error:', {
      bucket,
      path,
      message: error instanceof Error ? error.message : 'Unknown upload error',
      error,
    })
    throw error
  }
}

// Get public URL for file
export function getFileUrl(bucket: string, path: string) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

// Upload character glyph image
export async function uploadCharacterGlyph(
  character: string, 
  imageData: Buffer
) {
  const bucket = SUPABASE_BUCKETS.characterImages
  const path = `${character}.png`
  
  await uploadFile(imageData, bucket, path, 'image/png')
  return getFileUrl(bucket, path)
}

// Upload user drawing
export async function uploadUserDrawing(
  userId: string, 
  lessonId: string, 
  drawingData: Buffer
) {
  const bucket = SUPABASE_BUCKETS.userDrawings
  const timestamp = Date.now()
  const path = `${userId}/${lessonId}/${timestamp}.png`
  
  await uploadFile(drawingData, bucket, path, 'image/png')
  return getFileUrl(bucket, path)
}

// Upload user avatar
export async function uploadUserAvatar(
  userId: string, 
  avatarData: Buffer
) {
  const bucket = SUPABASE_BUCKETS.profilePictures
  const path = `${userId}.png`
  
  await uploadFile(avatarData, bucket, path, 'image/png')
  return getFileUrl(bucket, path)
}

// Upload audio file (pronunciation)
export async function uploadAudioFile(
  character: string, 
  audioData: Buffer
) {
  const bucket = SUPABASE_BUCKETS.audioFiles
  const path = `${character}.mp3`
  
  await uploadFile(audioData, bucket, path, 'audio/mpeg')
  return getFileUrl(bucket, path)
}

// Delete file
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Supabase Storage delete failed:', {
      bucket,
      path,
      message: error.message,
      error,
    })
    throw error
  }

  console.log('Supabase Storage delete succeeded:', { bucket, path })
}
