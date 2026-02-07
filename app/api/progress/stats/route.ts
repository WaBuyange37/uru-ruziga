// app/api/progress/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}
const JWT_SECRET = process.env.JWT_SECRET

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

    // Get lesson progress
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: { userId: decoded.userId },
      include: {
        lesson: {
          select: {
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

    // Get drawings stats
    const drawings = await prisma.userDrawing.findMany({
      where: { userId: decoded.userId },
      select: {
        aiScore: true,
        isCorrect: true,
        timeSpent: true
      }
    })

    const totalDrawings = drawings.length
    const correctDrawings = drawings.filter(d => d.isCorrect).length
    const accuracy = totalDrawings > 0 ? Math.round((correctDrawings / totalDrawings) * 100) : 0
    const averageScore = totalDrawings > 0 
      ? Math.round(drawings.reduce((sum, d) => sum + (d.aiScore || 0), 0) / totalDrawings)
      : 0
    const totalTimeSpent = drawings.reduce((sum, d) => sum + d.timeSpent, 0)

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

    const completedLessons = lessonProgress.filter(p => p.completed).length
    const progressPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

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
        learningStreak
      },
      lessonProgress: lessonProgress.map(p => ({
        lesson: p.lesson,
        completed: p.completed,
        score: p.score || 0,
        attempts: p.attempts
      })),
      achievements: {
        unlocked: userAchievements.map(ua => ({
          name: ua.achievement.name,
          description: ua.achievement.description,
          icon: ua.achievement.icon,
          points: ua.achievement.points,
          unlockedAt: ua.unlockedAt
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
