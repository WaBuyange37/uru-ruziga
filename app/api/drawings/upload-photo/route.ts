import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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

    // Parse multipart form data
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const lessonId = formData.get('lessonId') as string
    const characterId = formData.get('characterId') as string
    const stepId = formData.get('stepId') as string
    const relatedAttemptId = formData.get('relatedAttemptId') as string | null

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image must be less than 5MB' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const timestamp = Date.now()
    const fileExt = imageFile.name.split('.').pop() || 'jpg'
    const fileName = `photo-${timestamp}.${fileExt}`
    const filePath = `${userId}/${characterId || 'photos'}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-drawings')
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Failed to upload photo: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('user-drawings')
      .getPublicUrl(filePath)

    const imageUrl = urlData.publicUrl

    // Save attempt to database
    const attempt = await prisma.userAttempt.create({
      data: {
        userId,
        stepId: stepId || 'photo-upload',
        characterId: characterId || null,
        attemptType: 'PHOTO_UPLOAD',
        drawingData: imageUrl,
        answer: relatedAttemptId ? { relatedAttemptId } : null,
        aiScore: null, // Can be evaluated later
        aiMetrics: null,
        feedback: 'Thank you for contributing real handwriting data!',
        isCorrect: true, // Contribution is always valuable
        timeSpent: 0
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
          lastAccessedAt: new Date()
        },
        create: {
          userId,
          lessonId,
          completed: false,
          attempts: 0,
          timeSpent: 0,
          status: 'IN_PROGRESS'
        }
      })
    }

    // Add to training data collection
    await prisma.trainingData.create({
      data: {
        userId,
        sourceType: 'DRAWING_FEEDBACK',
        sourceId: attempt.id,
        latinText: characterId || '',
        umweroText: '', // Will be filled by admin
        context: `Photo upload for character: ${characterId}`,
        language: 'rw',
        quality: null, // To be reviewed
        verified: false,
        metadata: JSON.stringify({
          attemptId: attempt.id,
          imageUrl,
          uploadType: 'photo',
          relatedAttemptId
        })
      }
    })

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      imageUrl,
      message: 'Thank you for contributing to the Umwero dataset!'
    })

  } catch (error: any) {
    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload photo',
        details: error?.message 
      },
      { status: 500 }
    )
  }
}
