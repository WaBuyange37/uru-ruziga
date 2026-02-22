// app/api/test-db/route.ts
// Test database connection in production

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const characterCount = await prisma.character.count()
    
    return NextResponse.json({
      status: 'connected',
      timestamp: new Date().toISOString(),
      stats: {
        users: userCount,
        characters: characterCount
      },
      message: 'Database connection successful'
    })

  } catch (error: any) {
    console.error('Database test error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
      details: {
        name: error.name,
        code: error.code,
        meta: error.meta
      }
    }, { status: 500 })
  }
}