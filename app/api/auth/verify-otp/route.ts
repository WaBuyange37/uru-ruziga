// app/api/auth/verify-otp/route.ts - Verify OTP code
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sign } from 'jsonwebtoken'
import { getJwtSecret } from '../../../../lib/jwt'
import { sendWelcomeEmail } from '../../../../lib/email'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Find user with matching email and OTP
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        verificationToken: otp
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Check if OTP has expired
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Update user as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
        lastLoginAt: new Date()
      }
    })

    // Send welcome email
    if (user.fullName) {
      await sendWelcomeEmail(user.email, user.fullName)
    }

    // Generate JWT token
    const jwtSecret = getJwtSecret()
    const token = sign(
      {
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      },
      jwtSecret,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified
      }
    })

  } catch (error: any) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
