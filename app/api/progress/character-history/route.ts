import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveStoredImageUrl } from '@/lib/image-url'
import { getAuthenticatedUserId } from '@/lib/auth-session'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get characterId from query params
    const { searchParams } = new URL(request.url)
    const characterId = searchParams.get('characterId')

    if (!characterId) {
      return NextResponse.json(
        { error: 'characterId is required' },
        { status: 400 }
      )
    }

    // Fetch ALL attempts for this character (never overwrite!)
    const attempts = await prisma.userAttempt.findMany({
      where: {
        userId,
        characterId,
        attemptType: 'DRAWING' // Only canvas drawings for progress
      },
      orderBy: {
        createdAt: 'asc' // Chronological order
      },
      select: {
        id: true,
        aiScore: true,
        aiMetrics: true,
        feedback: true,
        isCorrect: true,
        timeSpent: true,
        drawingData: true,
        createdAt: true
      }
    })

    // Calculate statistics
    const totalAttempts = attempts.length
    const scores = attempts.map(a => a.aiScore).filter(s => s !== null) as number[]
    
    const stats = {
      totalAttempts,
      averageScore: scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      latestScore: scores.length > 0 ? scores[scores.length - 1] : 0,
      improvement: scores.length >= 2 
        ? scores[scores.length - 1] - scores[0]
        : 0,
      passRate: attempts.filter(a => a.isCorrect).length / Math.max(totalAttempts, 1) * 100,
      totalTimeSpent: attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0)
    }

    // Calculate trend (last 5 vs first 5)
    const recentScores = scores.slice(-5)
    const earlyScores = scores.slice(0, 5)
    const trend = recentScores.length > 0 && earlyScores.length > 0
      ? (recentScores.reduce((a, b) => a + b, 0) / recentScores.length) -
        (earlyScores.reduce((a, b) => a + b, 0) / earlyScores.length)
      : 0

    const normalizedAttempts = await Promise.all(attempts.map(async (attempt) => ({
      ...attempt,
      drawingData: await resolveStoredImageUrl(attempt.drawingData, {
        source: `userAttempt:${attempt.id}.drawingData`,
        expiresIn: 3600,
      }),
    })))

    return NextResponse.json({
      attempts: normalizedAttempts,
      stats: {
        ...stats,
        trend: Math.round(trend)
      }
    })

  } catch (error: any) {
    console.error('Error fetching character history:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch character history',
        details: error?.message 
      },
      { status: 500 }
    )
  }
}
