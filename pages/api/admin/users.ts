// pages/api/admin/users.ts
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../lib/prisma'

// Helper function to verify admin token
function verifyAdminToken(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('No token provided')
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string }
  if (decoded.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  
  return decoded
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Verify admin access
      verifyAdminToken(req)

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              progress: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      res.status(200).json({ users })
    } catch (error) {
      console.error('Error fetching users:', error)
      if (error.message === 'Admin access required' || error.message === 'No token provided') {
        res.status(403).json({ message: 'Access denied' })
      } else {
        res.status(500).json({ message: 'Error fetching users' })
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}