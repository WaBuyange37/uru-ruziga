// app/api/auth/login/route.ts
// STANDARD LOGIN: username OR email + password (NO OTP)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.AUTH_LOGIN)
    if (rateLimitResponse) return rateLimitResponse

    const { identifier, password } = await request.json()

    // Validate input
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Username/email and password are required' },
        { status: 400 }
      )
    }

    // Find user by username, email, or mobile number
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier.toLowerCase().trim() },
          { email: identifier.toLowerCase().trim() },
          { mobileNumber: identifier.trim() }
        ]
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      )
    }

    // Check if user has a password
    if (!user.password) {
      return NextResponse.json(
        { error: 'Please use social login or reset your password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        mobileNumber: user.mobileNumber,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified
      }
    })

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
