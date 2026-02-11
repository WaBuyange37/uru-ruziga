// app/api/auth/register/route.ts
// STANDARD REGISTRATION: fullName, username, email (optional), password
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateRequest, registerSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.AUTH_REGISTER)
    if (rateLimitResponse) return rateLimitResponse

    // Validate input
    const validation = await validateRequest(request.clone(), registerSchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { fullName, username, email, mobileNumber, password, birthday, countryCode } = validation.data

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      )
    }

    // Check if email already exists (email is required)
    const existingEmail = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim() }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Check if mobile number already exists (if provided)
    if (mobileNumber?.trim()) {
      const existingMobile = await prisma.user.findUnique({
        where: { mobileNumber: mobileNumber.trim() }
      })

      if (existingMobile) {
        return NextResponse.json(
          { error: 'An account with this mobile number already exists' },
          { status: 409 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user (NO OTP, direct registration)
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        username: username.toLowerCase(),
        email: email.toLowerCase().trim(),
        mobileNumber: mobileNumber?.trim() || null,
        password: hashedPassword,
        birthday: birthday ? new Date(birthday) : null,
        countryCode: countryCode || 'RW',
        provider: 'EMAIL',
        emailVerified: true, // Auto-verify for simplicity
        role: 'STUDENT' // Default role for new users
      }
    })

    // Auto-login: Generate JWT token
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
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        mobileNumber: user.mobileNumber,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified
      }
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
