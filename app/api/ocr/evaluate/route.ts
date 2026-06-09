import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFileUrl, STORAGE_BUCKETS, uploadFile } from '@/lib/storage'
import { verifyToken } from '@/lib/jwt'
import { getAuthTokenFromRequest } from '@/lib/auth-session'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const PYTHON_SERVICE_URL =
  process.env.OCR_API_URL || process.env.PYTHON_OCR_SERVICE_URL || process.env.PYTHON_AI_SERVICE_URL || null

interface EvaluationRequest {
  characterId: string
  strokes: Array<{
    points: Array<{
      x: number
      y: number
      timestamp: number
      pressure?: number
    }>
    startTime: number
    endTime: number
  }>
  imageData: string
  lessonId?: string
  metadata: {
    canvasSize: { width: number; height: number }
    devicePixelRatio: number
    inputMethod: 'mouse' | 'touch' | 'stylus'
    totalDuration: number
    strokeCount: number
    totalPoints: number
    deviceInfo: any
  }
}

function getBearerToken(request: NextRequest): string | null {
  return getAuthTokenFromRequest(request)
}

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; contentType: string } {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/)
  if (!match) {
    throw new Error('imageData must be a base64 data URL')
  }

  return {
    buffer: Buffer.from(match[2], 'base64'),
    contentType: match[1],
  }
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'unknown'
}

async function resolveCharacterReference(characterId: string) {
  const existingReference = await prisma.characterReference.findUnique({
    where: { id: characterId },
  })
  if (existingReference) return existingReference

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: {
      id: true,
      umweroGlyph: true,
      latinEquivalent: true,
      type: true,
      difficulty: true,
      glyphImageUrl: true,
      isActive: true,
    },
  })

  if (!character?.isActive) return null

  const referenceUrl = character.glyphImageUrl ?? `characters/references/${sanitizePathSegment(character.id)}.png`
  return prisma.characterReference.upsert({
    where: { umweroChar: character.umweroGlyph },
    update: {
      latinEquivalent: character.latinEquivalent,
      characterType: character.type.toLowerCase(),
      imageFontPath: referenceUrl,
      fontImageUrl: character.glyphImageUrl,
      difficulty: character.difficulty,
      metadata: {
        source: character.glyphImageUrl ? 'character.glyphImageUrl' : 'deterministic-reference-path',
        characterId: character.id,
      },
    },
    create: {
      umweroChar: character.umweroGlyph,
      latinEquivalent: character.latinEquivalent,
      characterType: character.type.toLowerCase(),
      imageFontPath: referenceUrl,
      fontImageUrl: character.glyphImageUrl,
      difficulty: character.difficulty,
      metadata: {
        source: character.glyphImageUrl ? 'character.glyphImageUrl' : 'deterministic-reference-path',
        characterId: character.id,
      },
    },
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const token = getBearerToken(request)
    if (!token) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded?.userId) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, { status: 401 })
    }

    const body: EvaluationRequest = await request.json()
    const { characterId, strokes, imageData, lessonId, metadata } = body
    const userId = decoded.userId

    // Validate required fields
    if (!characterId || !strokes || !imageData) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'Missing required fields: characterId, strokes, imageData' } },
        { status: 400 }
      )
    }

    const reference = await resolveCharacterReference(characterId)
    if (!reference) {
      return NextResponse.json(
        { error: { code: 'CHARACTER_NOT_FOUND', message: 'Character not found' } },
        { status: 404 }
      )
    }

    const { buffer, contentType } = dataUrlToBuffer(imageData)
    const uploadKey = `${STORAGE_BUCKETS.userDrawings}/${userId}/${characterId}/legacy-ocr/${Date.now()}-${crypto.randomUUID()}.png`
    const upload = await uploadFile(buffer, uploadKey, contentType, { upsert: false })
    const imageStorageKey = `${STORAGE_BUCKETS.userDrawings}/${upload.path}`
    const evaluationImageUrl = await getFileUrl(imageStorageKey, { signed: true, expiresIn: 600 })

    // 1. Create HandwritingAttempt immediately
    const attempt = await prisma.handwritingAttempt.create({
      data: {
        userId,
        characterId: reference.id,
        lessonId,
        strokes: strokes as any,
        strokeCount: strokes.length,
        totalPoints: strokes.reduce((sum, stroke) => sum + stroke.points.length, 0),
        drawingDuration: metadata.totalDuration,
        imageUrl: imageStorageKey,
        metadata: {
          ...metadata,
          storage: {
            bucket: upload.bucket,
            path: upload.path,
          },
          requestedCharacterId: characterId,
        } as any,
      },
    })

    // 2. Call Python OCR service for evaluation
    try {
      if (!PYTHON_SERVICE_URL) {
        throw new Error('OCR service URL is not configured')
      }

      const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/api/evaluate-character`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: characterId,
          image: imageData,
          image_url: evaluationImageUrl,
          reference_image_url: reference.fontImageUrl ?? reference.imageFontPath,
          session_id: attempt.id,
          user_id: userId,
        }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (!pythonResponse.ok) {
        throw new Error(`Python service returned ${pythonResponse.status}`)
      }

      const evaluation = await pythonResponse.json()
      const processingTime = Date.now() - startTime

      // 3. Update HandwritingAttempt with evaluation results
      const updatedAttempt = await prisma.handwritingAttempt.update({
        where: { id: attempt.id },
        data: {
          score: evaluation.score,
          ssimScore: evaluation.detailed_feedback?.find((f: any) => f.category === 'ssim')?.confidence,
          contourScore: evaluation.detailed_feedback?.find((f: any) => f.category === 'contour')?.confidence,
          skeletonScore: evaluation.detailed_feedback?.find((f: any) => f.category === 'skeleton')?.confidence,
          confidenceScore: evaluation.confidence,
          feedback: evaluation.feedback as any,
          feedbackType: evaluation.score >= 70 ? 'constructive' : 'corrective',
          qualityLabel: evaluation.score >= 90 ? 'excellent' : evaluation.score >= 70 ? 'good' : evaluation.score >= 50 ? 'fair' : 'poor',
          processingTime,
        },
      })

      // 4. Create DatasetEntry if quality threshold met (score >= 50)
      if (evaluation.score >= 50) {
        try {
          await prisma.datasetEntry.create({
            data: {
              attemptId: attempt.id,
              userId,
              characterId: reference.id,
              characterType: reference.characterType,
              strokesData: strokes as any,
              imageUrl: imageStorageKey,
              score: evaluation.score,
              qualityLabel: updatedAttempt.qualityLabel,
              timeTaken: metadata.totalDuration,
              userMetadata: {
                deviceInfo: metadata.deviceInfo,
                inputMethod: metadata.inputMethod,
                canvasSize: metadata.canvasSize,
              } as any,
              version: '1.0',
            },
          })
        } catch (datasetError) {
          console.error('Dataset entry creation failed after OCR evaluation', {
            attemptId: attempt.id,
            message: datasetError instanceof Error ? datasetError.message : 'Unknown dataset error',
          })
        }
      }

      // 5. Update UserCharacterProgress
      await prisma.userCharacterProgress.upsert({
        where: {
          userId_characterId: {
            userId,
            characterId,
          },
        },
        create: {
          userId,
          characterId,
          score: Math.round(evaluation.score),
          attempts: 1,
          lastAttempt: new Date(),
        },
        update: {
          score: Math.round(evaluation.score),
          attempts: { increment: 1 },
          lastAttempt: new Date(),
        },
      })

      // 6. Return comprehensive evaluation response
      return NextResponse.json({
        success: true,
        attemptId: attempt.id,
        evaluation: {
          score: evaluation.score,
          passed: evaluation.passed,
          confidence: evaluation.confidence,
          feedback: evaluation.feedback,
          detailedFeedback: evaluation.detailed_feedback,
          processingTime,
        },
        progress: {
          totalAttempts: (await prisma.handwritingAttempt.count({
            where: { userId, characterId },
          })),
          bestScore: Math.round(evaluation.score),
        },
      })

    } catch (pythonError) {
      console.error('Python OCR service error:', pythonError)

      try {
        await prisma.userCharacterProgress.upsert({
          where: {
            userId_characterId: {
              userId,
              characterId,
            },
          },
          create: {
            userId,
            characterId,
            status: 'IN_PROGRESS',
            score: 0,
            attempts: 1,
            lastAttempt: new Date(),
          },
          update: {
            status: 'IN_PROGRESS',
            attempts: { increment: 1 },
            lastAttempt: new Date(),
          },
        })
      } catch (progressError) {
        console.error('Fallback progress update failed after OCR outage', {
          userId,
          characterId,
          message: progressError instanceof Error ? progressError.message : 'Unknown progress error',
        })
      }

      // Return success because the learner attempt is saved; OCR details can arrive later.
      return NextResponse.json({
        success: true,
        attemptId: attempt.id,
        evaluation: {
          score: null,
          passed: false,
          confidence: 0,
          ocrFeedbackAvailable: false,
          fallback: true,
          fallbackReason: pythonError instanceof Error ? pythonError.message : 'OCR unavailable',
          statusLabel: 'Practice recorded',
          feedback: ['Practice saved; detailed handwriting feedback is still improving.'],
          detailedFeedback: [],
          processingTime: Date.now() - startTime,
        },
      })
    }

  } catch (error) {
    console.error('OCR evaluation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process evaluation',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    )
  }
}
