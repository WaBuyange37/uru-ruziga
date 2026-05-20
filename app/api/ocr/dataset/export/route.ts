import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const PYTHON_SERVICE_URL = process.env.PYTHON_OCR_SERVICE_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      exportFormat = 'json',
      characterTypes,
      qualityLabels,
      minScore,
      maxScore,
      limit,
    } = body

    // Build query parameters
    const params = new URLSearchParams()
    params.append('export_format', exportFormat)
    if (characterTypes) params.append('character_types', characterTypes.join(','))
    if (qualityLabels) params.append('quality_labels', qualityLabels.join(','))
    if (minScore !== undefined) params.append('min_score', minScore.toString())
    if (maxScore !== undefined) params.append('max_score', maxScore.toString())
    if (limit) params.append('limit', limit.toString())

    // Call Python service for dataset export
    const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/api/dataset/export?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(60000), // 60 second timeout for large exports
    })

    if (!pythonResponse.ok) {
      throw new Error(`Python service returned ${pythonResponse.status}`)
    }

    const exportResult = await pythonResponse.json()

    return NextResponse.json({
      success: true,
      exportPath: exportResult.export_path,
      format: exportResult.format,
      filters: exportResult.filters,
      timestamp: exportResult.timestamp,
    })

  } catch (error) {
    console.error('Dataset export error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXPORT_ERROR',
          message: 'Failed to export dataset',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
