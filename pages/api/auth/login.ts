// / pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Return user data in format expected by frontend (with username field)
    const userData = {
      id: user.id,
      username: user.fullName, // Map fullName to username for frontend
      email: user.email
    }

    res.status(200).json({
      message: 'Login successful',
      user: userData,
      token
    })

  } catch (error: any) {
    console.error('Login error:', error)
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error.message || 'Internal server error')
      : 'Internal server error'
    res.status(500).json({ error: errorMessage })
  }
}