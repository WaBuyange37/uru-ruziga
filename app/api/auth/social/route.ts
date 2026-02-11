// app/api/auth/social/route.ts - Social authentication (Facebook, Twitter/X)
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sign } from 'jsonwebtoken'
import { getJwtSecret } from '../../../../lib/jwt'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, providerId, email, fullName, avatar } = body

    // Validation
    if (!provider || !providerId || !email) {
      return NextResponse.json(
        { error: 'Provider, provider ID, and email are required' },
        { status: 400 }
      )
    }

    if (!['FACEBOOK', 'TWITTER', 'GOOGLE'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      )
    }

    // Check if user exists with this provider
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          {
            provider: provider,
            providerId: providerId
          }
        ]
      }
    })

    if (user) {
      // User exists, update last login and provider info if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          provider: provider,
          providerId: providerId,
          ...(avatar && !user.avatar && { avatar }),
          ...(fullName && !user.fullName && { fullName })
        }
      })
    } else {
      // Create new user with social auth
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          fullName: fullName || email.split('@')[0],
          provider: provider,
          providerId: providerId,
          avatar: avatar,
          emailVerified: true, // Social auth emails are pre-verified
          role: 'STUDENT',
          lastLoginAt: new Date()
        }
      })
    }

    // Generate JWT token
    const jwtSecret = getJwtSecret()
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
        emailVerified: user.emailVerified
      }
    })

  } catch (error: any) {
    console.error('Social auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
