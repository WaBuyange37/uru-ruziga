// app/api/auth/callback/google/route.ts - Google OAuth callback
import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getOAuthUserInfo, verifyOAuthState } from '../../../../../lib/oauth'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '../../../../../lib/jwt'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

function getUsernameBase(email: string, name?: string) {
  const source = name || email.split('@')[0]
  const slug = source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || `user-${randomBytes(3).toString('hex')}`
}

async function generateUniqueUsername(email: string, name?: string) {
  const base = getUsernameBase(email, name)
  let username = base
  let suffix = 0

  while (await prisma.user.findUnique({ where: { username } })) {
    suffix += 1
    username = `${base}-${suffix}`
  }

  return username
}

async function createOAuthPasswordHash() {
  return bcrypt.hash(randomBytes(32).toString('hex'), 12)
}

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
      const email = userInfo.email.toLowerCase()
      user = await prisma.user.create({
        data: {
          email,
          username: await generateUniqueUsername(email, userInfo.name),
          password: await createOAuthPasswordHash(),
          fullName: userInfo.name || email.split('@')[0],
          provider: 'GOOGLE',
          providerId: userInfo.id,
          avatar: userInfo.picture,
          emailVerified: true,
          role: 'STUDENT',
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

    // Redirect to homepage with token
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?token=${encodeURIComponent(token)}`
    
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
