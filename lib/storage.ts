// lib/storage.ts
// Supabase Storage wrapper for Umwero app assets.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const storageClient = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseServiceRoleKey || supabaseAnonKey || 'missing-supabase-key'
)

export const STORAGE_BUCKETS = {
  appAssets: 'app-assets',
  characters: 'characters',
  userDrawings: 'user-drawings',
  avatars: 'avatars',
  audio: 'audio',
  lessonMaterials: 'lesson-materials',
  generatedImages: 'generated-images',
  communityPosts: 'community-posts',
} as const

type UploadBody = Buffer | string | Uint8Array | ArrayBuffer | Blob

interface StorageLocation {
  bucket: string
  path: string
}

function assertSupabaseStorageConfigured() {
  if (!supabaseUrl || (!supabaseServiceRoleKey && !supabaseAnonKey)) {
    throw new Error(
      'Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for server uploads.'
    )
  }
}

function normalizeStorageKey(key: string, defaultBucket = STORAGE_BUCKETS.appAssets): StorageLocation {
  const normalized = key.replace(/^\/+/, '')
  const [maybeBucket, ...pathParts] = normalized.split('/')
  const knownBuckets = new Set<string>(Object.values(STORAGE_BUCKETS))

  if (knownBuckets.has(maybeBucket) && pathParts.length > 0) {
    return { bucket: maybeBucket, path: pathParts.join('/') }
  }

  return { bucket: defaultBucket, path: normalized }
}

// Upload a file to Supabase Storage. Keys may be either "path/to/file.png" or
// "bucket/path/to/file.png" when the first segment is a known bucket.
export async function uploadFile(
  file: UploadBody,
  key: string,
  contentType: string = 'image/png'
) {
  assertSupabaseStorageConfigured()

  const { bucket, path } = normalizeStorageKey(key)
  const { data, error } = await storageClient.storage.from(bucket).upload(path, file, {
    contentType,
    cacheControl: '3600',
    upsert: true,
  })

  if (error) {
    console.error('Supabase Storage upload failed:', error)
    throw error
  }

  return {
    ...data,
    bucket,
    path,
    publicUrl: getPublicFileUrl(bucket, path),
  }
}

export function getPublicFileUrl(bucket: string, path: string) {
  assertSupabaseStorageConfigured()

  const { data } = storageClient.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Get a URL for file access. Public URLs are used by default; pass
// signed=true for private buckets.
export async function getFileUrl(
  key: string,
  options: { signed?: boolean; expiresIn?: number } = {}
) {
  assertSupabaseStorageConfigured()

  const { bucket, path } = normalizeStorageKey(key)

  if (options.signed) {
    const { data, error } = await storageClient.storage
      .from(bucket)
      .createSignedUrl(path, options.expiresIn ?? 3600)

    if (error) {
      console.error('Supabase signed URL generation failed:', error)
      throw error
    }

    return data.signedUrl
  }

  return getPublicFileUrl(bucket, path)
}

export async function deleteFile(key: string) {
  assertSupabaseStorageConfigured()

  const { bucket, path } = normalizeStorageKey(key)
  const { error } = await storageClient.storage.from(bucket).remove([path])

  if (error) {
    console.error('Supabase Storage delete failed:', error)
    throw error
  }
}

export async function uploadCharacterGlyph(character: string, imageData: Buffer) {
  const path = `${character}.png`
  await uploadFile(imageData, `${STORAGE_BUCKETS.characters}/${path}`, 'image/png')
  return getPublicFileUrl(STORAGE_BUCKETS.characters, path)
}

export async function uploadUserDrawing(userId: string, lessonId: string, drawingData: Buffer) {
  const timestamp = Date.now()
  const path = `${userId}/${lessonId}/${timestamp}.png`
  await uploadFile(drawingData, `${STORAGE_BUCKETS.userDrawings}/${path}`, 'image/png')
  return getPublicFileUrl(STORAGE_BUCKETS.userDrawings, path)
}

export async function uploadUserAvatar(userId: string, avatarData: Buffer) {
  const path = `${userId}.png`
  await uploadFile(avatarData, `${STORAGE_BUCKETS.avatars}/${path}`, 'image/png')
  return getPublicFileUrl(STORAGE_BUCKETS.avatars, path)
}
