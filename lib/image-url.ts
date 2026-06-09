import { getFileUrl } from './storage'

export const PUBLIC_STORAGE_BUCKETS = new Set([
  'character-images',
  'profile-pictures',
  'audio-files',
  'video-files',
  'community-posts',
])

export const PRIVATE_STORAGE_BUCKETS = new Set([
  'user-drawings',
])

const STORAGE_BUCKETS = new Set([
  ...PUBLIC_STORAGE_BUCKETS,
  ...PRIVATE_STORAGE_BUCKETS,
])

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
type StorageLocation = {
  bucket: string
  path: string
}

type ResolveImageOptions = {
  source: string
  expiresIn?: number
}

function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co'))
}

function encodeStoragePath(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function parseAbsoluteSupabaseUrl(rawUrl: string): StorageLocation | null {
  try {
    const url = new URL(rawUrl)
    const marker = '/storage/v1/object/'
    const markerIndex = url.pathname.indexOf(marker)
    if (markerIndex === -1) return null

    const objectPath = url.pathname.slice(markerIndex + marker.length)
    const normalized = objectPath.replace(/^public\//, '').replace(/^sign\//, '')
    const [bucket, ...pathParts] = normalized.split('/')
    if (!STORAGE_BUCKETS.has(bucket) || pathParts.length === 0) return null

    return {
      bucket,
      path: decodeURIComponent(pathParts.join('/')),
    }
  } catch {
    return null
  }
}

function parseStoragePath(rawUrl: string): StorageLocation | null {
  const cleaned = rawUrl
    .trim()
    .replace(/^\/+/, '')
    .replace(/^storage\/v1\/object\/(?:public|sign)\//, '')

  const [bucket, ...pathParts] = cleaned.split('/')
  if (!STORAGE_BUCKETS.has(bucket) || pathParts.length === 0) return null

  return { bucket, path: pathParts.join('/') }
}

export function getSupabasePublicUrl(bucket: string, path: string) {
  if (!isSupabaseConfigured()) return null
  return `${supabaseUrl!.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodeStoragePath(path)}`
}

export function normalizePublicImageUrl(rawUrl: string | null | undefined, source: string) {
  if (!rawUrl || !rawUrl.trim()) return null

  const value = rawUrl.trim()
  if (value.startsWith('file://') || value.startsWith('/home/') || value.startsWith('/Users/')) {
    console.warn('[image-url] Rejected local filesystem image URL', { source, value })
    return null
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(value)) {
    console.warn('[image-url] Rejected localhost image URL for production', { source, value })
    return null
  }

  if (value.startsWith('data:image/')) return value

  if (value.startsWith('/')) {
    return encodeURI(value)
  }

  if (/^https?:\/\//i.test(value)) {
    const storageLocation = parseAbsoluteSupabaseUrl(value)
    if (storageLocation && PUBLIC_STORAGE_BUCKETS.has(storageLocation.bucket)) {
      return getSupabasePublicUrl(storageLocation.bucket, storageLocation.path) ?? value
    }
    return value
  }

  const storageLocation = parseStoragePath(value)
  if (storageLocation && PUBLIC_STORAGE_BUCKETS.has(storageLocation.bucket)) {
    return getSupabasePublicUrl(storageLocation.bucket, storageLocation.path)
  }

  console.warn('[image-url] Could not normalize image URL', { source, value })
  return null
}

export async function resolveStoredImageUrl(
  rawUrl: string | null | undefined,
  options: ResolveImageOptions
) {
  if (!rawUrl || !rawUrl.trim()) return null

  const value = rawUrl.trim()
  const storageLocation = /^https?:\/\//i.test(value)
    ? parseAbsoluteSupabaseUrl(value)
    : parseStoragePath(value)

  if (storageLocation && PRIVATE_STORAGE_BUCKETS.has(storageLocation.bucket)) {
    try {
      return await getFileUrl(`${storageLocation.bucket}/${storageLocation.path}`, {
        signed: true,
        expiresIn: options.expiresIn ?? 3600,
      })
    } catch (error) {
      console.error('[image-url] Signed image URL generation crashed', {
        source: options.source,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      return null
    }
  }

  return normalizePublicImageUrl(value, options.source)
}

export async function resolveStoredImageUrls(
  rawUrls: Array<string | null | undefined>,
  options: ResolveImageOptions
) {
  return Promise.all(rawUrls.map((url, index) => resolveStoredImageUrl(url, {
    ...options,
    source: `${options.source}[${index}]`,
  })))
}
