// app/api/debug/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({
        success: false,
        errorMessage: 'No token provided',
        tokenExists: false
      }, { status: 401 })
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({
        success: false,
        errorMessage: 'JWT_SECRET not configured',
        tokenExists: true,
        tokenLength: token.length
      }, { status: 500 })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string }
      
      return NextResponse.json({
        success: true,
        userId: decoded.userId,
        tokenExists: true,
        tokenLength: token.length,
        tokenValid: true
      })
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        errorMessage: `JWT verification failed: ${jwtError instanceof Error ? jwtError.message : 'Unknown JWT error'}`,
        tokenExists: true,
        tokenLength: token.length,
        tokenValid: false
      }, { status: 401 })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      errorMessage: `Debug auth error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      tokenExists: !!request.headers.get('authorization')
    }, { status: 500 })
  }
}