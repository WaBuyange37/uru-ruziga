// app/api/auth/callback/google/route.ts - Google OAuth callback
import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getOAuthUserInfo, verifyOAuthState } from '../../../../../lib/oauth'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '../../../../../lib/jwt'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=${encodeURIComponent(error)}`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=authorization_failed`
      )
    }

    // Verify state parameter
    const storedState = typeof window !== 'undefined' ? sessionStorage.getItem('oauth_state') : null
    const storedProvider = typeof window !== 'undefined' ? sessionStorage.getItem('oauth_provider') : null

    if (!state || !storedState || !verifyOAuthState(state, storedState)) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=invalid_state`
      )
    }

    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken('google', code)
    
    // Get user info
    const userInfo = await getOAuthUserInfo('google', tokenResponse.access_token)

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userInfo.email.toLowerCase() },
          { AND: [{ provider: 'GOOGLE' }, { providerId: userInfo.id }] }
        ]
      }
    })

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          provider: 'GOOGLE',
          providerId: userInfo.id,
          emailVerified: true,
          ...(userInfo.picture && !user.avatar && { avatar: userInfo.picture }),
          ...(userInfo.name && !user.fullName && { fullName: userInfo.name })
        }
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email.toLowerCase(),
          fullName: userInfo.name || userInfo.email.split('@')[0],
          provider: 'GOOGLE',
          providerId: userInfo.id,
          avatar: userInfo.picture,
          emailVerified: true,
          role: 'USER',
          lastLoginAt: new Date()
        }
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    )

    // Clear OAuth state
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('oauth_state')
      sessionStorage.removeItem('oauth_provider')
    }

    // Redirect to dashboard with token
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?token=${encodeURIComponent(token)}`
    
    return NextResponse.redirect(redirectUrl)

  } catch (error: any) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=oauth_failed`
    )
  } finally {
    await prisma.$disconnect()
  }
}
