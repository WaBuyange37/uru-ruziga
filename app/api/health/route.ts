// app/api/health/route.ts
// Simple health check endpoint to test API functionality

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test basic functionality
    const timestamp = new Date().toISOString()
    
    // Test environment variables (without exposing them)
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp,
      environment: envCheck,
      message: 'API is working correctly'
    })

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}