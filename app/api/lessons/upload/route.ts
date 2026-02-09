// app/api/lessons/upload/route.ts
// File upload endpoint for teachers to upload lesson materials

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'
import { hasPermission } from '@/lib/permissions'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { put } from '@vercel/blob'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * Upload lesson files (videos, PDFs, images, audio)
 * POST /api/lessons/upload
 * 
 * Supports:
 * - Video files (.mp4, .webm, .mov) - max 100MB
 * - PDF worksheets (.pdf) - max 10MB
 * - Images (.jpg, .png, .webp) - max 5MB
 * - Audio files (.mp3, .wav) - max 20MB
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.API_GENERAL)
    if (rateLimitResponse) return rateLimitResponse

    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, getJwtSecret())
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check permissions (TEACHER or ADMIN only)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, fullName: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!hasPermission(user.role as any, 'canCreateLesson')) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Teacher or Admin role required.' },
        { status: 403 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const fileType = formData.get('type') as string // 'video' | 'pdf' | 'image' | 'audio'
    const lessonId = formData.get('lessonId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const validation = validateFile(file, fileType)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob Storage
    // Note: You can also use Supabase Storage or AWS S3
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // If lessonId provided, update the lesson
    if (lessonId) {
      const updateData: any = {}
      
      if (fileType === 'video') {
        updateData.videoUrl = blob.url
      } else if (fileType === 'image') {
        updateData.thumbnailUrl = blob.url
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.lesson.update({
          where: { id: lessonId },
          data: updateData,
        })
      }
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
      message: 'File uploaded successfully',
    })

  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'File upload failed', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Validate file type and size
 */
function validateFile(file: File, fileType: string): { valid: boolean; error?: string } {
  const maxSizes = {
    video: 100 * 1024 * 1024, // 100MB
    pdf: 10 * 1024 * 1024,    // 10MB
    image: 5 * 1024 * 1024,   // 5MB
    audio: 20 * 1024 * 1024,  // 20MB
  }

  const allowedTypes = {
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    pdf: ['application/pdf'],
    image: ['image/jpeg', 'image/png', 'image/webp'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/mp3'],
  }

  // Check file type
  const allowed = allowedTypes[fileType as keyof typeof allowedTypes]
  if (!allowed || !allowed.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types for ${fileType}: ${allowed?.join(', ')}`,
    }
  }

  // Check file size
  const maxSize = maxSizes[fileType as keyof typeof maxSizes]
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size for ${fileType}: ${maxSize / (1024 * 1024)}MB`,
    }
  }

  return { valid: true }
}

/**
 * Get uploaded files for a lesson
 * GET /api/lessons/upload?lessonId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID required' },
        { status: 400 }
      )
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        videoUrl: true,
        thumbnailUrl: true,
      },
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      lessonId: lesson.id,
      title: lesson.title,
      files: {
        video: lesson.videoUrl,
        thumbnail: lesson.thumbnailUrl,
      },
    })

  } catch (error: any) {
    console.error('Get files error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve files' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
