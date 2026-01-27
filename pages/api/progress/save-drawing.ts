// pages/api/progress/save-drawing.ts
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../lib/prisma'

// Helper function to verify JWT token
function verifyToken(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token
  if (!token) throw new Error('No token provided')
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = verifyToken(req)
    const { vowel, umweroChar, drawingData, score, lessonId } = req.body

    // Validate input
    if (!vowel || !umweroChar || !drawingData) {
      return res.status(400).json({ 
        error: 'Missing required fields: vowel, umweroChar, drawingData' 
      })
    }

    // Validate drawingData is base64
    if (!drawingData.startsWith('data:image/png;base64,')) {
      return res.status(400).json({ 
        error: 'Invalid drawing data format' 
      })
    }

    // Validate score if provided
    if (score !== undefined && (typeof score !== 'number' || score < 0 || score > 100)) {
      return res.status(400).json({ 
        error: 'Score must be a number between 0 and 100' 
      })
    }

    // Save drawing to database
    const drawing = await prisma.userDrawing.create({
      data: {
        userId,
        vowel,
        umweroChar,
        drawingData,
        score: score || null,
        lessonId: lessonId || null,
      }
    })

    // If score is provided and lessonId exists, update lesson progress
    if (score !== undefined && lessonId) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId
          }
        },
        update: {
          score: score,
          completed: score >= 70, // Consider 70% as passing
        },
        create: {
          userId,
          lessonId,
          score: score,
          completed: score >= 70,
        }
      })
    }

    res.status(200).json({ 
      success: true,
      message: 'Drawing saved successfully',
      drawingId: drawing.id,
      score: drawing.score
    })
  } catch (error: any) {
    console.error('Error saving drawing:', error)
    
    if (error.message === 'No token provided' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error.message || 'Error saving drawing')
      : 'Error saving drawing'
      
    res.status(500).json({ error: errorMessage })
  }
}