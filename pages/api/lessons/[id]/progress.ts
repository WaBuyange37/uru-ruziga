import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../lib/prisma'
// /home/nzela37/Kwizera/Projects/uru-ruziga/pages/api/lessons/[id]/progress.ts
// Helper function to verify JWT token
function verifyToken(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.cookies.token
  
  if (!token) throw new Error('No token provided')
  
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: lessonId } = req.query

  if (typeof lessonId !== 'string') {
    return res.status(400).json({ error: 'Invalid lesson ID' })
  }

  if (req.method === 'POST') {
    try {
      const { userId } = verifyToken(req)
      const { completed, score } = req.body

      // Validate score if provided
      if (score !== undefined && score !== null) {
        if (typeof score !== 'number' || score < 0 || score > 100) {
          return res.status(400).json({ error: 'Score must be a number between 0 and 100' })
        }
      }

      // Check if lesson exists
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId }
      })

      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' })
      }

      // Update or create progress
      const progress = await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId
          }
        },
        update: {
          completed: completed !== undefined ? completed : undefined,
          score: score !== undefined ? score : undefined,
          completedAt: completed ? new Date() : (completed === false ? null : undefined)
        },
        create: {
          userId,
          lessonId,
          completed: completed || false,
          score: score || null,
          completedAt: completed ? new Date() : null
        }
      })

      res.status(200).json({ 
        message: 'Progress updated', 
        progress: {
          id: progress.id,
          completed: progress.completed,
          score: progress.score,
          completedAt: progress.completedAt
        }
      })
    } catch (error: any) {
      console.error('Error updating progress:', error)
      if (error.message === 'No token provided' || error.name === 'JsonWebTokenError') {
        res.status(401).json({ error: 'Authentication required' })
      } else {
        const errorMessage = process.env.NODE_ENV === 'development' 
          ? (error.message || 'Error updating progress')
          : 'Error updating progress'
        res.status(500).json({ error: errorMessage })
      }
    }
  } else if (req.method === 'GET') {
    try {
      const { userId } = verifyToken(req)

      const progress = await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId
          }
        },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              description: true,
              module: true,
              order: true
            }
          }
        }
      })

      res.status(200).json({ progress })
    } catch (error: any) {
      console.error('Error fetching progress:', error)
      if (error.message === 'No token provided' || error.name === 'JsonWebTokenError') {
        res.status(401).json({ error: 'Authentication required' })
      } else {
        const errorMessage = process.env.NODE_ENV === 'development' 
          ? (error.message || 'Error fetching progress')
          : 'Error fetching progress'
        res.status(500).json({ error: errorMessage })
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}