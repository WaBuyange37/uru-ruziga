// app/api/auth/login-otp/route.ts - OTP-based login
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateOTP, sendVerificationEmail } from '../../../../lib/email'
import { validateEmail } from '../../../../lib/email-validation'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '../../../../lib/jwt'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailValidation = await validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists and is verified
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      )
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email first. Check your inbox for the verification email.' },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user with new OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: otp,
        verificationTokenExpiry: otpExpiry
      }
    })

    // Send OTP email
    const emailSent = await sendVerificationEmail(normalizedEmail, otp, user.fullName || undefined)
    
    if (!emailSent) {
      console.error('Failed to send OTP email to', normalizedEmail)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'OTP sent to your email. Please check your inbox.',
      requiresVerification: true,
      email: normalizedEmail
    })

  } catch (error: any) {
    console.error('OTP login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
