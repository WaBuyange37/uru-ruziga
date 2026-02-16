import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Storage features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Storage utilities for user drawings
export async function uploadDrawing(
  userId: string,
  characterId: string,
  imageBlob: Blob
): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${timestamp}.png`;
  const filePath = `${userId}/${characterId}/${fileName}`;

  const { data, error } = await supabase.storage
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
  const { data: urlData } = supabase.storage
    .from('user-drawings')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// Delete drawing from storage
export async function deleteDrawing(imageUrl: string): Promise<void> {
  // Extract file path from URL
  const urlParts = imageUrl.split('/');
  const bucketIndex = urlParts.findIndex(part => part === 'user-drawings');
  if (bucketIndex === -1) return;
  
  const filePath = urlParts.slice(bucketIndex + 1).join('/');

  const { error } = await supabase.storage
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

// List user drawings
export async function listUserDrawings(
  userId: string,
  characterId?: string
): Promise<string[]> {
  const prefix = characterId ? `${userId}/${characterId}/` : `${userId}/`;
  
  const { data, error } = await supabase.storage
    .from('user-drawings')
    .list(prefix);

  if (error) {
    console.error('List error:', error);
    return [];
  }

  return data.map(file => {
    const { data: urlData } = supabase.storage
      .from('user-drawings')
      .getPublicUrl(`${prefix}${file.name}`);
    return urlData.publicUrl;
  });
}
