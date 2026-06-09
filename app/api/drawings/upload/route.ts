import { NextRequest, NextResponse } from 'next/server'
import { uploadDrawing, dataURLtoBlob } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { resolveStoredImageUrl } from '@/lib/image-url'
import { getAuthenticatedUserId } from '@/lib/auth-session'

export async function POST(request: NextRequest) {
  try {
    console.info('[OCR diagnostic] endpoint hit', {
      endpoint: '/api/drawings/upload',
      bucketUploadExpected: 'user-drawings',
      ocrServiceCalled: false,
      referenceGenerationTriggered: false,
    })

    // Verify authentication
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      drawingData, 
      lessonId, 
      characterId, 
      stepId,
      aiScore,
      aiMetrics,
      feedback,
      isCorrect,
      timeSpent 
    } = body

    if (!drawingData) {
      return NextResponse.json(
        { error: 'Drawing data is required' },
        { status: 400 }
      )
    }

    // Convert data URL to Blob
    const imageBlob = dataURLtoBlob(drawingData)

    // Upload to Supabase Storage
    console.info('[OCR diagnostic] bucket upload attempted', {
      endpoint: '/api/drawings/upload',
      bucket: 'user-drawings',
      pathPattern: '<userId>/<characterId>/<timestamp>.png',
      upsert: false,
    })
    const imageStorageKey = await uploadDrawing(
      userId,
      characterId || lessonId || 'practice',
      imageBlob
    )
    const imageUrl = await resolveStoredImageUrl(imageStorageKey, {
      source: '/api/drawings/upload',
      expiresIn: 3600,
    })

    if (!imageUrl) {
      throw new Error('Failed to create signed drawing URL')
    }
    console.info('[OCR diagnostic] bucket upload succeeded', {
      endpoint: '/api/drawings/upload',
      bucket: 'user-drawings',
      imageUrlCreated: Boolean(imageUrl),
    })

    // Save attempt to database with image URL
    const attempt = await prisma.userAttempt.create({
      data: {
        userId,
        stepId: stepId || 'practice-step',
        characterId: characterId || null,
        attemptType: 'DRAWING',
        drawingData: imageStorageKey,
        answer: Prisma.JsonNull,
        aiScore: aiScore || null,
        aiMetrics: aiMetrics || Prisma.JsonNull,
        feedback: feedback || null,
        isCorrect: isCorrect || false,
        timeSpent: timeSpent || 0
      }
    })

    // Update lesson progress if lessonId provided
    if (lessonId) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId
          }
        },
        update: {
          attempts: { increment: 1 },
          timeSpent: { increment: timeSpent || 0 },
          lastAccessedAt: new Date()
        },
        create: {
          userId,
          lessonId,
          completed: false,
          attempts: 1,
          timeSpent: timeSpent || 0,
          status: 'IN_PROGRESS'
        }
      })
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      imageUrl
    })

  } catch (error: any) {
    console.error('Error uploading drawing:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload drawing',
        details: error?.message 
      },
      { status: 500 }
    )
  }
}
