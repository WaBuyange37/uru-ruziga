// app/api/auth/verify/route.ts
// Verify JWT token and return user data
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { getAuthTokenCandidatesFromRequest } from '@/lib/auth-session'
import { getJwtSecret } from '@/lib/jwt'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const tokens = getAuthTokenCandidatesFromRequest(request)
    if (tokens.length === 0) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    for (const token of tokens) {
      let decoded: any
      try {
        decoded = jwt.verify(token, getJwtSecret())
      } catch (error) {
        continue
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

      if (!decoded.userId) continue

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

      if (user) {
        return NextResponse.json({ user })
      }
    }

    return NextResponse.json(
      { error: 'Invalid, expired, or stale token' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
