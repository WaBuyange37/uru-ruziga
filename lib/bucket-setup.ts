// lib/bucket-setup.ts
// Supabase Storage bucket setup for Umwero app.

import { createClient } from '@supabase/supabase-js'
import { STORAGE_BUCKETS } from './storage'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null

const bucketConfigs = [
  { name: STORAGE_BUCKETS.characterImages, public: true },
  { name: STORAGE_BUCKETS.userDrawings, public: false },
  { name: STORAGE_BUCKETS.profilePictures, public: true },
  { name: STORAGE_BUCKETS.audioFiles, public: true },
  { name: STORAGE_BUCKETS.videoFiles, public: true },
  { name: STORAGE_BUCKETS.communityPosts, public: true },
]

export async function setupStorageBuckets() {
  if (!supabaseAdmin) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to create Supabase Storage buckets.')
  }

  const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets()

  if (listError) {
    throw new Error(`Failed to list Supabase Storage buckets: ${listError.message}`)
  }

  const existingBucketNames = new Set(existingBuckets?.map(bucket => bucket.name) || [])

  for (const bucket of bucketConfigs) {
    if (existingBucketNames.has(bucket.name)) {
      continue
    }

    const { error } = await supabaseAdmin.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: 10 * 1024 * 1024,
    })

    if (error) {
      throw new Error(`Failed to create Supabase bucket "${bucket.name}": ${error.message}`)
    }
  }
}

export function getBucketUrl(bucketName = STORAGE_BUCKETS.characterImages) {
  if (!supabaseUrl) {
    throw new Error('Set SUPABASE_URL to build Supabase Storage bucket URLs.')
  }

  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucketName}`
}

if (require.main === module) {
  setupStorageBuckets()
    .then(() => {
      console.log('Supabase Storage buckets are ready.')
      console.log('Default public bucket URL:', getBucketUrl())
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
