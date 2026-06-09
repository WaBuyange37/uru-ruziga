import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const PYTHON_SERVICE_URL = process.env.PYTHON_OCR_SERVICE_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
    //     { status: 401 }
    //   )
    // }

    // TODO: Add admin role check
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json(
    //     { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
    //     { status: 403 }
    //   )
    // }

    // Call Python service for dataset statistics
    const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/api/dataset/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    })

    if (!pythonResponse.ok) {
      throw new Error(`Python service returned ${pythonResponse.status}`)
    }

    const stats = await pythonResponse.json()

    return NextResponse.json({
      success: true,
      statistics: stats.statistics,
      timestamp: stats.timestamp,
    })

  } catch (error) {
    console.error('Dataset stats error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Failed to retrieve dataset statistics',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
