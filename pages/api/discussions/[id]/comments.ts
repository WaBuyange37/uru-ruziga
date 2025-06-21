import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../lib/prisma'

// Helper function to verify JWT token
function verifyToken(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.cookies.token
  
  if (!token) throw new Error('No token provided')
  
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: discussionId } = req.query

  if (typeof discussionId !== 'string') {
    return res.status(400).json({ message: 'Invalid discussion ID' })
  }

  if (req.method === 'POST') {
    try {
      const { userId } = verifyToken(req)
      const { content } = req.body

      if (!content?.trim()) {
        return res.status(400).json({ message: 'Comment content is required' })
      }

      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          authorId: userId,
          discussionId
        },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      })

      res.status(201).json({ message: 'Comment added', comment })
    } catch (error) {
      console.error('Error adding comment:', error)
      if (error.message === 'No token provided') {
        res.status(401).json({ message: 'Authentication required' })
      } else {
        res.status(500).json({ message: 'Error adding comment' })
      }
    }
  } else if (req.method === 'GET') {
    try {
      const comments = await prisma.comment.findMany({
        where: { discussionId },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      res.status(200).json({ comments })
    } catch (error) {
      console.error('Error fetching comments:', error)
      res.status(500).json({ message: 'Error fetching comments' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}