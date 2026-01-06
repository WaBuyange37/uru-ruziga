import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies.token
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    // Get user community stats
    const [discussionsPosted, commentsPosted, ordersPlaced, donationsMade] = await Promise.all([
      prisma.discussion.count({
        where: { authorId: userId }
      }),
      prisma.comment.count({
        where: { authorId: userId }
      }),
      prisma.order.count({
        where: { userId: userId }
      }),
      prisma.donation.count({
        where: { userId: userId }
      })
    ])

    res.status(200).json({
      discussionsPosted,
      commentsPosted,
      ordersPlaced,
      donationsMade
    })
  } catch (error: any) {
    console.error('User stats error:', error)
    if (error.name === 'JsonWebTokenError' || error.message === 'No token provided') {
      res.status(401).json({ error: 'Authentication required' })
    } else {
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? (error.message || 'Server error')
        : 'Server error'
      res.status(500).json({ error: errorMessage })
    }
  }
}