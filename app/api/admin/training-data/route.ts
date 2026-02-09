// app/api/admin/training-data/route.ts
// Admin endpoint to manage and export training data

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import {
  exportTrainingData,
  getTrainingDataStats,
  verifyTrainingData,
} from '@/lib/training-data-collector'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * Get training data statistics
 * GET /api/admin/training-data
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.ADMIN_ACTION)
    if (rateLimitResponse) return rateLimitResponse

    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, getJwtSecret())
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check admin permission
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'stats') {
      // Get statistics
      const stats = await getTrainingDataStats()
      return NextResponse.json({ stats })
    }

    if (action === 'export') {
      // Export training data
      const verified = searchParams.get('verified') === 'true'
      const minQuality = searchParams.get('minQuality')
      const sourceType = searchParams.get('sourceType')
      const language = searchParams.get('language')
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')

      const data = await exportTrainingData({
        verified,
        minQuality: minQuality ? parseInt(minQuality) : undefined,
        sourceType: sourceType as any,
        language: language || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      })

      // Return as JSON or CSV based on format parameter
      const format = searchParams.get('format') || 'json'

      if (format === 'csv') {
        const csv = convertToCSV(data)
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="training-data-${Date.now()}.csv"`,
          },
        })
      }

      return NextResponse.json({
        count: data.length,
        data,
      })
    }

    // Default: return recent entries
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const data = await prisma.trainingData.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sourceType: true,
        latinText: true,
        umweroText: true,
        context: true,
        language: true,
        quality: true,
        verified: true,
        createdAt: true,
      },
    })

    const total = await prisma.trainingData.count()

    return NextResponse.json({
      data,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })

  } catch (error: any) {
    console.error('Training data error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve training data', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Verify or update training data entry
 * PATCH /api/admin/training-data
 */
export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.ADMIN_ACTION)
    if (rateLimitResponse) return rateLimitResponse

    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, getJwtSecret())
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check admin permission
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { id, verified, quality } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Training data ID required' },
        { status: 400 }
      )
    }

    // Verify training data
    await verifyTrainingData(id, verified, quality)

    return NextResponse.json({
      success: true,
      message: 'Training data updated successfully',
    })

  } catch (error: any) {
    console.error('Update training data error:', error)
    return NextResponse.json(
      { error: 'Failed to update training data', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Delete training data entry
 * DELETE /api/admin/training-data?id=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.ADMIN_ACTION)
    if (rateLimitResponse) return rateLimitResponse

    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, getJwtSecret())
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check admin permission
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get ID from query
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Training data ID required' },
        { status: 400 }
      )
    }

    // Delete training data
    await prisma.trainingData.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Training data deleted successfully',
    })

  } catch (error: any) {
    console.error('Delete training data error:', error)
    return NextResponse.json(
      { error: 'Failed to delete training data', details: error.message },
        { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Convert training data to CSV format
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''

  // Headers
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')

  // Rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  })

  return [csvHeaders, ...csvRows].join('\n')
}
