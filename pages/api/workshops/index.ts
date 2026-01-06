import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../lib/prisma'

// Helper function to verify JWT token
function verifyToken(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.cookies.token
  
  if (!token) throw new Error('No token provided')
  
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userId } = verifyToken(req)
      const { title, description } = req.body

      if (!title?.trim() || !description?.trim()) {
        return res.status(400).json({ message: 'Title and description are required' })
      }

      const workshop = await prisma.workshopSuggestion.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          suggestedBy: userId
        },
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      })

      res.status(201).json({ 
        message: 'Workshop suggestion submitted successfully', 
        workshop: {
          id: workshop.id,
          title: workshop.title,
          description: workshop.description,
          suggestedBy: workshop.user.fullName,
          createdAt: workshop.createdAt
        }
      })
    } catch (error) {
      console.error('Error submitting workshop suggestion:', error)
      if (error.message === 'No token provided') {
        res.status(401).json({ message: 'Authentication required' })
      } else {
        res.status(500).json({ message: 'Error submitting suggestion' })
      }
    }
  } else if (req.method === 'GET') {
    try {
      const workshops = await prisma.workshopSuggestion.findMany({
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      const formattedWorkshops = workshops.map(workshop => ({
        id: workshop.id,
        title: workshop.title,
        description: workshop.description,
        suggestedBy: workshop.user.fullName,
        createdAt: workshop.createdAt
      }))

      res.status(200).json({ workshops: formattedWorkshops })
    } catch (error) {
      console.error('Error fetching workshop suggestions:', error)
      res.status(500).json({ message: 'Error fetching workshops' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}