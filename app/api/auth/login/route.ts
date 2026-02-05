// app/api/auth/login/route.ts
// Login API route for Neon database (App Router)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        fullName: userWithoutPassword.fullName || '',
        role: userWithoutPassword.role as 'USER' | 'ADMIN' | 'TEACHER',
      },
      token,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}