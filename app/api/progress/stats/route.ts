// app/api/progress/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string }
    
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        fullName: true,
        email: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get lesson progress (compatible with new schema)
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: { userId: decoded.userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
            module: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Get total lessons count
    const totalLessons = await prisma.lesson.count({
      where: { isPublished: true }
    })

    // Get drawings stats with recent drawings
    const drawings = await prisma.userDrawing.findMany({
      where: { userId: decoded.userId },
      select: {
        id: true,
        vowel: true,
        umweroChar: true,
        aiScore: true,
        isCorrect: true,
        timeSpent: true,
        feedback: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const totalDrawings = drawings.length
    const correctDrawings = drawings.filter(d => d.isCorrect).length
    const accuracy = totalDrawings > 0 ? Math.round((correctDrawings / totalDrawings) * 100) : 0
    const averageScore = totalDrawings > 0 
      ? Math.round(drawings.reduce((sum, d) => sum + (d.aiScore || 0), 0) / totalDrawings)
      : 0
    const totalTimeSpent = drawings.reduce((sum, d) => sum + d.timeSpent, 0)
    const perfectScores = drawings.filter(d => (d.aiScore || 0) >= 90).length

    // Get recent drawings for display (last 10)
    const recentDrawings = drawings.slice(0, 10).map(drawing => ({
      id: drawing.id,
      vowel: drawing.vowel,
      umweroChar: drawing.umweroChar,
      aiScore: drawing.aiScore || 0,
      isCorrect: drawing.isCorrect,
      timeSpent: drawing.timeSpent,
      createdAt: drawing.createdAt.toISOString(),
      feedback: drawing.feedback || 'Practice completed'
    }))

    // Get achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: decoded.userId },
      include: {
        achievement: true
      },
      orderBy: { unlockedAt: 'desc' }
    })

    const totalPoints = userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0)

    // Calculate learning streak (simplified - days with activity)
    const recentActivity = await prisma.lessonProgress.findMany({
      where: {
        userId: decoded.userId,
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: { updatedAt: true },
      orderBy: { updatedAt: 'desc' }
    })

    let learningStreak = 0
    if (recentActivity.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const activityDates = new Set(
        recentActivity.map(a => {
          const date = new Date(a.updatedAt)
          date.setHours(0, 0, 0, 0)
          return date.getTime()
        })
      )

      let currentDate = today.getTime()
      while (activityDates.has(currentDate)) {
        learningStreak++
        currentDate -= 24 * 60 * 60 * 1000 // Go back one day
      }
    }

    // Count completed lessons (completed === true)
    const completedLessons = lessonProgress.filter(p => p.completed).length
    
    const progressPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    // Calculate characters learned (unique characters from drawings)
    const uniqueCharacters = new Set(drawings.map(d => d.umweroChar)).size

    return NextResponse.json({
      user: {
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt
      },
      overview: {
        completedLessons,
        totalLessons,
        progressPercentage,
        totalDrawings,
        correctDrawings,
        accuracy,
        averageScore,
        totalTimeSpent,
        learningStreak,
        charactersLearned: uniqueCharacters,
        perfectScores
      },
      lessonProgress: lessonProgress.map(p => ({
        lesson: {
          id: p.lesson.id,
          title: p.lesson.title,
          type: p.lesson.type,
          module: p.lesson.module
        },
        completed: p.completed,
        score: p.score || 0,
        attempts: p.attempts,
        timeSpent: p.timeSpent,
        completedAt: p.completedAt?.toISOString()
      })),
      recentDrawings,
      achievements: {
        unlocked: userAchievements.filter(ua => ua.isUnlocked).map(ua => ({
          name: ua.achievement.name,
          description: ua.achievement.description,
          icon: ua.achievement.icon || '🏆',
          points: ua.achievement.points,
          unlockedAt: ua.unlockedAt.toISOString()
        })),
        new: [], // Could track new achievements in session
        totalPoints
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
