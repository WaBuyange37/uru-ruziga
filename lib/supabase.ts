import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Storage features may not work.');
}

// Client for frontend/anon operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase; // Fallback to anon client if service key not available

// Storage utilities for user drawings (server-side)
export async function uploadDrawing(
  userId: string,
  characterId: string,
  imageBlob: Blob
): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${timestamp}.png`;
  const filePath = `${userId}/${characterId}/${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from('user-drawings')
    .upload(filePath, imageBlob, {
      contentType: 'image/png',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload drawing: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from('user-drawings')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// Delete drawing from storage (server-side)
export async function deleteDrawing(imageUrl: string): Promise<void> {
  // Extract file path from URL
  const urlParts = imageUrl.split('/');
  const bucketIndex = urlParts.findIndex(part => part === 'user-drawings');
  if (bucketIndex === -1) return;
  
  const filePath = urlParts.slice(bucketIndex + 1).join('/');

  const { error } = await supabaseAdmin.storage
    .from('user-drawings')
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete drawing: ${error.message}`);
  }
}

// Convert data URL to Blob
export function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

// List user drawings (server-side)
export async function listUserDrawings(
  userId: string,
  characterId?: string
): Promise<string[]> {
  const prefix = characterId ? `${userId}/${characterId}/` : `${userId}/`;
  
  const { data, error } = await supabaseAdmin.storage
    .from('user-drawings')
    .list(prefix);

  if (error) {
    console.error('List error:', error);
    return [];
  }

  return data.map(file => {
    const { data: urlData } = supabaseAdmin.storage
      .from('user-drawings')
      .getPublicUrl(`${prefix}${file.name}`);
    return urlData.publicUrl;
  });
}

// Community media utilities (server-side)
export async function uploadCommunityMedia(
  userId: string,
  file: File
): Promise<string> {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const fileExtension = file.name.split('.').pop();
  const fileName = `${timestamp}-${randomSuffix}.${fileExtension}`;
  const filePath = `community/${userId}/${fileName}`;

  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = new Uint8Array(arrayBuffer);

  const { data, error } = await supabaseAdmin.storage
    .from('community-posts')
    .upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload media: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from('community-posts')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// Delete community media from storage (server-side)
export async function deleteCommunityMedia(imageUrl: string): Promise<void> {
  // Extract file path from URL
  const urlParts = imageUrl.split('/');
  const bucketIndex = urlParts.findIndex(part => part === 'community-posts');
  if (bucketIndex === -1) return;
  
  const filePath = urlParts.slice(bucketIndex + 1).join('/');

  const { error } = await supabaseAdmin.storage
    .from('community-posts')
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete media: ${error.message}`);
  }
}
