import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Point {
  x: number
  y: number
  timestamp: number
  pressure?: number
}

interface Stroke {
  points: Point[]
  startTime: number
  endTime: number
}

interface SubmitHandwritingRequest {
  characterId: string
  strokes: Stroke[]
  sessionId?: string
  metadata: {
    deviceType: string
    inputMethod: 'touch' | 'mouse' | 'stylus'
    canvasSize: { width: number; height: number }
  }
}

interface EvaluationResponse {
  score: number
  accuracy_level: string
  feedback: Array<{
    type: string
    severity: string
    message: string
  }>
  heatmap_url?: string
  reference_id: string
  processing_time_ms: number
}

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    // Parse request body
    const body: SubmitHandwritingRequest = await request.json()
    const { characterId, strokes, metadata } = body

    // Validate required fields
    if (!characterId || !strokes || !Array.isArray(strokes) || strokes.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: characterId and strokes',
          },
        },
        { status: 400 }
      )
    }

    // Store attempt in database immediately
    const attempt = await prisma.handwritingAttempt.create({
      data: {
        userId: user.id,
        characterId,
        strokes: strokes as any, // Prisma Json type
        metadata: metadata as any,
      },
    })

    // Forward to Python AI service for evaluation (async)
    const evaluationStartTime = performance.now()
    
    try {
      const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000'
      const evaluationResponse = await fetch(`${pythonServiceUrl}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character_id: characterId,
          strokes: strokes.map(stroke => stroke.points),
          options: {
            include_heatmap: true,
            include_stroke_analysis: true,
            detail_level: 'detailed',
          },
        }),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      if (!evaluationResponse.ok) {
        throw new Error(`Python service returned ${evaluationResponse.status}`)
      }

      const evaluationData: EvaluationResponse = await evaluationResponse.json()
      const processingTime = Math.round(performance.now() - evaluationStartTime)

      // Update attempt with evaluation results
      await prisma.handwritingAttempt.update({
        where: { id: attempt.id },
        data: {
          score: evaluationData.score,
          feedback: evaluationData.feedback as any,
          heatmapUrl: evaluationData.heatmap_url,
          processingTime,
        },
      })

      // Create dataset entry for ML training
      await prisma.datasetEntry.create({
        data: {
          attemptId: attempt.id,
          userId: user.id,
          characterId,
          strokesData: strokes as any,
          imageUrl: '', // Will be populated by Python service
          score: evaluationData.score,
          timeTaken: strokes[strokes.length - 1].endTime - strokes[0].startTime,
          userMetadata: {
            deviceType: metadata.deviceType,
            inputMethod: metadata.inputMethod,
          } as any,
        },
      })

      // Return evaluation results
      return NextResponse.json({
        attemptId: attempt.id,
        score: evaluationData.score,
        feedback: evaluationData.feedback,
        heatmapUrl: evaluationData.heatmap_url,
        referenceImageUrl: `/api/reference/${characterId}`,
        processingTime,
      })
    } catch (evaluationError) {
      // Log error but don't fail the request - attempt is already stored
      console.error('Evaluation service error:', evaluationError)

      // Return partial success
      return NextResponse.json({
        attemptId: attempt.id,
        score: null,
        feedback: [
          {
            type: 'system',
            severity: 'warning',
            message: 'Evaluation service temporarily unavailable. Your attempt has been saved.',
          },
        ],
        heatmapUrl: null,
        referenceImageUrl: `/api/reference/${characterId}`,
        processingTime: 0,
      })
    }
  } catch (error) {
    console.error('Handwriting submission error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process handwriting submission',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    )
  }
}
