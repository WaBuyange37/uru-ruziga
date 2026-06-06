// app/api/discussions/upload-media/route.ts
// Media upload for discussions (Supabase Storage)
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { uploadFile } from '@/lib/storage'

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
    const uploadedFiles: Array<{
      url: string
      originalName: string
      contentType: string
      size: number
      bucket: string
      path: string
    }> = []

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
      const safeExtension = fileExtension?.replace(/[^a-zA-Z0-9]/g, '') || 'bin'
      const fileName = `${timestamp}-${randomSuffix}.${safeExtension}`
      const filePath = `community/${decoded.userId}/${fileName}`
      console.log(`📂 Upload path: ${filePath}`);

      console.log('☁️ Uploading to Supabase...');
      const upload = await uploadFile(file, `community-posts/${filePath}`, file.type)

      console.log(`✅ File uploaded successfully: ${upload.publicUrl}`);
      uploadedUrls.push(upload.publicUrl)
      uploadedFiles.push({
        url: upload.publicUrl,
        originalName: file.name,
        contentType: file.type,
        size: file.size,
        bucket: upload.bucket,
        path: upload.path,
      })
    }

    console.log(`🎉 Upload complete! ${uploadedUrls.length} files processed`);
    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      files: uploadedFiles,
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
