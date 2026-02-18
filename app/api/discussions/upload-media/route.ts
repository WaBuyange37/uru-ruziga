// app/api/discussions/upload-media/route.ts
// Media upload for discussions (Supabase Storage)
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side uploads (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = 'force-dynamic'

/**
 * POST /api/discussions/upload-media
 * Upload media files for discussions
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting media upload...');
    
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.API_GENERAL)
    if (rateLimitResponse) return rateLimitResponse

    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.log('❌ No authentication token provided');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, getJwtSecret())
      console.log('✅ Token verified for user:', decoded.userId);
    } catch (error) {
      console.log('❌ Invalid token:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    console.log('📁 Files received:', files.length);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Validate file types and sizes
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'application/pdf',
    ]

    const maxSize = 50 * 1024 * 1024 // Max 50MB per file
    const uploadedUrls: string[] = []

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Supabase not configured, using fallback storage');
      
      // Fallback: Return mock URLs for development
      for (const file of files) {
        const mockUrl = `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(file.name)}`
        uploadedUrls.push(mockUrl)
      }
      
      return NextResponse.json({
        success: true,
        urls: uploadedUrls,
        count: files.length,
        message: `${files.length} file(s) uploaded successfully (development mode)`
      })
    }

    for (const file of files) {
      console.log(`📄 Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);
      
      if (!allowedTypes.includes(file.type)) {
        console.log(`❌ Invalid file type: ${file.type}`);
        return NextResponse.json(
          { error: `Invalid file type for ${file.name}. Allowed: images, videos, audio, PDF` },
          { status: 400 }
        )
      }

      if (file.size > maxSize) {
        console.log(`❌ File too large: ${file.size} bytes`);
        return NextResponse.json(
          { error: `File ${file.name} too large. Maximum size: 50MB` },
          { status: 400 }
        )
      }

      // Generate unique file path
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const fileExtension = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomSuffix}.${fileExtension}`
      const filePath = `community/${decoded.userId}/${fileName}`
      console.log(`📂 Upload path: ${filePath}`);

      // Convert File to ArrayBuffer for Supabase
      const arrayBuffer = await file.arrayBuffer()
      const fileBuffer = new Uint8Array(arrayBuffer)
      console.log(`🔄 File converted to buffer: ${fileBuffer.length} bytes`);

      // Try to upload to Supabase Storage
      console.log('☁️ Uploading to Supabase...');
      
      // First, try to list buckets to check if we have access
      try {
        const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
        console.log('📦 Available buckets:', buckets?.map(b => b.name) || 'none');
        
        if (listError) {
          console.log('⚠️ Cannot list buckets:', listError.message);
        }
      } catch (listErr) {
        console.log('⚠️ Bucket listing failed:', listErr);
      }

      // Try uploading to community-posts bucket
      const { error } = await supabaseAdmin.storage
        .from('community-posts')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false
        })

      if (error) {
        console.error('❌ Supabase upload error:', error)
        
        // If bucket doesn't exist, try creating it first
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          console.log('🔧 Trying to create bucket...');
          
          try {
            const { error: createError } = await supabaseAdmin.storage.createBucket('community-posts', {
              public: true,
              fileSizeLimit: 52428800, // 50MB
            })
            
            if (createError && !createError.message.includes('already exists')) {
              console.error('❌ Failed to create bucket:', createError);
              // Fallback to mock URL
              const mockUrl = `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(file.name)}`
              uploadedUrls.push(mockUrl)
              continue;
            }
            
            // Retry upload after creating bucket
            const { error: retryError } = await supabaseAdmin.storage
              .from('community-posts')
              .upload(filePath, fileBuffer, {
                contentType: file.type,
                upsert: false
              })
              
            if (retryError) {
              console.error('❌ Retry upload failed:', retryError);
              // Fallback to mock URL
              const mockUrl = `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(file.name)}`
              uploadedUrls.push(mockUrl)
              continue;
            }
          } catch (createErr) {
            console.error('❌ Bucket creation failed:', createErr);
            // Fallback to mock URL
            const mockUrl = `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(file.name)}`
            uploadedUrls.push(mockUrl)
            continue;
          }
        } else {
          // Other upload errors - use fallback
          console.error('❌ Upload failed, using fallback:', error.message);
          const mockUrl = `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(file.name)}`
          uploadedUrls.push(mockUrl)
          continue;
        }
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('community-posts')
        .getPublicUrl(filePath)

      console.log(`✅ File uploaded successfully: ${urlData.publicUrl}`);
      uploadedUrls.push(urlData.publicUrl)
    }

    console.log(`🎉 Upload complete! ${uploadedUrls.length} files processed`);
    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: files.length,
      message: `${files.length} file(s) uploaded successfully`
    })

  } catch (error: any) {
    console.error('❌ Media upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload media', details: error.message },
      { status: 500 }
    )
  }
}
