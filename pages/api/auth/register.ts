// pages/api/auth/register.ts
// Register API route for Neon database

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { fullName, email, password } = req.body

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (fullName.trim().length < 3) {
      return res.status(400).json({ error: 'Full name must be at least 3 characters' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'USER',
        language: 'en',
        country: 'Rwanda',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      }
    })

    res.status(201).json({
      user,
      message: 'Account created successfully'
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}