import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const PYTHON_SERVICE_URL = process.env.PYTHON_OCR_SERVICE_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { character } = body

    if (!character) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'Character is required' } },
        { status: 400 }
      )
    }

    // Call Python service to generate/retrieve reference
    const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/api/reference/${encodeURIComponent(character)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    })

    if (!pythonResponse.ok) {
      throw new Error(`Python service returned ${pythonResponse.status}`)
    }

    const referenceData = await pythonResponse.json()

    return NextResponse.json({
      success: true,
      reference: referenceData,
    })

  } catch (error) {
    console.error('Reference generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REFERENCE_ERROR',
          message: 'Failed to generate reference',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const character = searchParams.get('character')

    if (!character) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'Character parameter is required' } },
        { status: 400 }
      )
    }

    // Call Python service to retrieve cached reference
    const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/api/reference/${encodeURIComponent(character)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    })

    if (!pythonResponse.ok) {
      throw new Error(`Python service returned ${pythonResponse.status}`)
    }

    const referenceData = await pythonResponse.json()

    return NextResponse.json({
      success: true,
      reference: referenceData,
    })

  } catch (error) {
    console.error('Reference retrieval error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REFERENCE_ERROR',
          message: 'Failed to retrieve reference',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
