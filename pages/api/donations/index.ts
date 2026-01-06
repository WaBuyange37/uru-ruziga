import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../lib/prisma'

// Helper function to verify JWT token (optional for donations)
function verifyToken(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.cookies.token
  
  if (!token) return null
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const userInfo = verifyToken(req)
      const { amount, donorName, donorEmail, message, paymentMethod, currency = 'RWF' } = req.body

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Valid donation amount is required' })
      }

      if (!donorName || !donorEmail) {
        return res.status(400).json({ message: 'Donor name and email are required' })
      }

      const donation = await prisma.donation.create({
        data: {
          userId: userInfo?.userId || null,
          amount: parseFloat(amount),
          currency,
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim(),
          message: message?.trim() || null,
          paymentMethod,
          status: 'PENDING'
        }
      })

      res.status(201).json({ 
        message: 'Donation recorded successfully', 
        donation: {
          id: donation.id,
          amount: donation.amount,
          currency: donation.currency,
          donorName: donation.donorName,
          status: donation.status,
          createdAt: donation.createdAt
        }
      })
    } catch (error) {
      console.error('Error recording donation:', error)
      res.status(500).json({ message: 'Error processing donation' })
    }
  } else if (req.method === 'GET') {
    try {
      const userInfo = verifyToken(req)

      if (!userInfo) {
        return res.status(401).json({ message: 'Authentication required' })
      }

      // Only show user's own donations or if admin, show all
      const user = await prisma.user.findUnique({
        where: { id: userInfo.userId },
        select: { role: true }
      })

      let donations
      if (user?.role === 'ADMIN') {
        // Admin can see all donations
        donations = await prisma.donation.findMany({
          orderBy: {
            createdAt: 'desc'
          },
          take: 50 // Limit to recent 50
        })
      } else {
        // Users can only see their own donations
        donations = await prisma.donation.findMany({
          where: { userId: userInfo.userId },
          orderBy: {
            createdAt: 'desc'
          }
        })
      }

      res.status(200).json({ donations })
    } catch (error) {
      console.error('Error fetching donations:', error)
      res.status(500).json({ message: 'Error fetching donations' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}