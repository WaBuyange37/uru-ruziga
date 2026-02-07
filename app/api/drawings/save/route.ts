// app/api/drawings/save/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string }
    const body = await request.json()
    
    const {
      vowel,
      umweroChar,
      drawingData,
      aiScore,
      feedback,
      lessonId,
      timeSpent
    } = body

    // Save the drawing
    const drawing = await prisma.userDrawing.create({
      data: {
        userId: decoded.userId,
        lessonId: lessonId || null,
        vowel,
        umweroChar,
        drawingData,
        aiScore: aiScore || 100,
        feedback: feedback || 'Practiced',
        isCorrect: (aiScore || 100) >= 70,
        timeSpent: timeSpent || 0,
      }
    })

    // Update or create lesson progress
    if (lessonId) {
      const existingProgress = await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: decoded.userId,
            lessonId: lessonId
          }
        }
      })

      if (existingProgress) {
        await prisma.lessonProgress.update({
          where: {
            userId_lessonId: {
              userId: decoded.userId,
              lessonId: lessonId
            }
          },
          data: {
            attempts: { increment: 1 },
            timeSpent: { increment: timeSpent || 0 },
            score: aiScore || 100,
            completed: true,
            completedAt: new Date()
          }
        })
      } else {
        await prisma.lessonProgress.create({
          data: {
            userId: decoded.userId,
            lessonId: lessonId,
            completed: true,
            score: aiScore || 100,
            timeSpent: timeSpent || 0,
            attempts: 1,
            completedAt: new Date()
          }
        })
      }
    }

    return NextResponse.json({
      drawing,
      message: 'Drawing saved successfully'
    })
  } catch (error) {
    console.error('Error saving drawing:', error)
    return NextResponse.json(
      { error: 'Failed to save drawing' },
      { status: 500 }
    )
  }
}
