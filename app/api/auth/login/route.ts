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
    console.log('🔐 Login attempt started...')
    
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.AUTH_LOGIN)
    if (rateLimitResponse) {
      console.log('❌ Rate limit exceeded')
      return rateLimitResponse
    }

    const body = await request.json()
    console.log('📝 Request body received:', { identifier: body.identifier, hasPassword: !!body.password })
    
    const { identifier, password } = body

    // Validate input
    if (!identifier || !password) {
      console.log('❌ Missing identifier or password')
      return NextResponse.json(
        { error: 'Username/email and password are required' },
        { status: 400 }
      )
    }

    console.log('🔍 Looking for user with identifier:', identifier)

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
      console.log('❌ User not found for identifier:', identifier)
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      )
    }

    console.log('✅ User found:', { id: user.id, username: user.username, email: user.email })

    // Check if user has a password
    if (!user.password) {
      console.log('❌ User has no password')
      return NextResponse.json(
        { error: 'Please use social login or reset your password' },
        { status: 401 }
      )
    }

    console.log('🔑 Verifying password...')
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('❌ Invalid password')
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      )
    }

    console.log('✅ Password verified successfully')

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    console.log('🔐 Generating JWT token...')

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

    console.log('✅ Login successful for user:', user.username)

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
    console.error('❌ Login error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
