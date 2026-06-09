// app/api/auth/verify/route.ts
// Verify JWT token and return user data
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { getAuthTokenFromRequest } from '@/lib/auth-session'
import { getJwtSecret } from '@/lib/jwt'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify token
    let decoded: any
    try {
      decoded = jwt.verify(token, getJwtSecret())
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    if (decoded.developmentDemo && process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        user: {
          id: 'demo-development-user',
          email: 'demo@uruziga.com',
          fullName: 'Demo Student',
          role: 'STUDENT',
        },
      })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
