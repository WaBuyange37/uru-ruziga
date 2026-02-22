import { NextRequest, NextResponse } from 'next/server'
import { uploadDrawing, dataURLtoBlob } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let userId: string
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
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
    const imageUrl = await uploadDrawing(
      userId,
      characterId || lessonId || 'practice',
      imageBlob
    )

    // Save attempt to database with image URL
    const attempt = await prisma.userAttempt.create({
      data: {
        userId,
        stepId: stepId || 'practice-step',
        characterId: characterId || null,
        attemptType: 'DRAWING',
        drawingData: imageUrl, // Store URL instead of base64
        answer: null,
        aiScore: aiScore || null,
        aiMetrics: aiMetrics || null,
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
