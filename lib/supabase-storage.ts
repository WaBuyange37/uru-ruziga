// lib/supabase-storage.ts
// Supabase Storage - FREE and Easy!

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      console.error('❌ Upload failed:', error)
      throw error
    }

    console.log('✅ File uploaded:', path)
    return data
  } catch (error) {
    console.error('❌ Upload error:', error)
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
  const bucket = 'characters'
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
  const bucket = 'user-drawings'
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
  const bucket = 'avatars'
  const path = `${userId}.png`
  
  await uploadFile(avatarData, bucket, path, 'image/png')
  return getFileUrl(bucket, path)
}

// Upload audio file (pronunciation)
export async function uploadAudioFile(
  character: string, 
  audioData: Buffer
) {
  const bucket = 'audio'
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
    console.error('❌ Delete failed:', error)
    throw error
  }

  console.log('✅ File deleted:', path)
}
