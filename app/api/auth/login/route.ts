// app/api/auth/login/route.ts
// STANDARD LOGIN: username OR email + password (NO OTP)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { setAuthCookie } from '@/lib/auth-session'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let identifier = ''
  let password = ''

  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.AUTH_LOGIN)
    if (rateLimitResponse) return rateLimitResponse

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid login request' },
        { status: 400 }
      )
    }

    identifier = body.identifier
    password = body.password

    // Validate input
    if (typeof identifier !== 'string' || typeof password !== 'string' || !identifier.trim() || !password) {
      return NextResponse.json(
        { error: 'Username/email and password are required' },
        { status: 400 }
      )
    }

    const developmentDemoLogin = getDevelopmentDemoLogin(identifier, password)
    if (developmentDemoLogin) {
      return jsonAuthResponse(developmentDemoLogin)
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

    return jsonAuthResponse({
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
    const demoLogin = getDevelopmentDemoLogin(identifier, password)
    if (demoLogin) {
      return jsonAuthResponse(demoLogin)
    }

    console.error('Login error:', error)

    if (error?.message?.includes('JWT_SECRET')) {
      return NextResponse.json(
        { error: 'Authentication is not configured. Please set JWT_SECRET and try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}

function jsonAuthResponse(data: any) {
  const response = NextResponse.json(data)
  return data.token ? setAuthCookie(response, data.token) : response
}

function getDevelopmentDemoLogin(identifier: string, password: string) {
  if (process.env.NODE_ENV === 'production') return null

  const normalizedIdentifier = identifier?.toLowerCase().trim()
  const isDemoIdentifier = normalizedIdentifier === 'demo@uruziga.com' || normalizedIdentifier === 'demo'
  const demoPassword = process.env.URUZIGA_DEMO_PASSWORD || 'demo123'
  if (!isDemoIdentifier || !demoPassword || password !== demoPassword) return null

  const user = {
    id: 'demo-development-user',
    email: 'demo@uruziga.com',
    mobileNumber: null,
    fullName: 'Demo Student',
    username: 'demo',
    role: 'STUDENT',
    avatar: null,
    emailVerified: true,
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      developmentDemo: true,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  )

  return {
    success: true,
    token,
    user,
    warning: 'Using development demo login because the database is unavailable.',
  }
}
