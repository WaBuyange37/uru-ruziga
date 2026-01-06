// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, username, fullName } = req.body

    // Support both 'username' and 'fullName' for compatibility
    const userFullName = fullName || username

    // Validate input
    if (!email || !password || !userFullName) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        fullName: userFullName,
        password: hashedPassword,
        role: 'STUDENT' // Default role
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true
      }
    })

    // Return user in format expected by frontend (with username field)
    const userResponse = {
      id: user.id,
      username: user.fullName, // Map fullName to username for frontend
      email: user.email
    }

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle Prisma errors specifically
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'User already exists with this email' })
    }

    // Handle database connection errors
    if (error.message?.includes('connect') || error.message?.includes('ECONNREFUSED')) {
      console.error('Database connection error:', error.message)
      return res.status(500).json({ error: 'Database connection failed. Please check your database configuration.' })
    }

    // Return more specific error message in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error.message || 'Internal server error')
      : 'Internal server error'
    
    res.status(500).json({ error: errorMessage })
  }
}