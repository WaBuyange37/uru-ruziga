// app/api/umwero/generate-image/route.ts
// Generate PNG images of Umwero text for sharing

import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateRequest, generateImageSchema } from '@/lib/validators'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

/**
 * Generate PNG image from Umwero text
 * POST /api/umwero/generate-image
 * 
 * Body:
 * {
 *   text: string (Umwero text)
 *   fontSize: number (12-72, default 24)
 *   fontFamily: string (default 'Umwero')
 *   backgroundColor: string (hex color, default '#FFFFFF')
 *   textColor: string (hex color, default '#000000')
 *   width: number (100-2000, default 800)
 *   height: number (100-2000, default 400)
 * }
 * 
 * Returns:
 * {
 *   success: true,
 *   imageUrl: string (public URL),
 *   width: number,
 *   height: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.IMAGE_GENERATE)
    if (rateLimitResponse) return rateLimitResponse

    // Validate request
    const validation = await validateRequest(request.clone(), generateImageSchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const {
      text,
      fontSize,
      fontFamily,
      backgroundColor,
      textColor,
      width,
      height,
    } = validation.data

    // Generate SVG (server-side rendering)
    const svg = generateSVG({
      text,
      fontSize,
      fontFamily,
      backgroundColor,
      textColor,
      width,
      height,
    })

    // Convert SVG to PNG using sharp (if available) or return SVG
    // For now, we'll upload the SVG and let the browser render it
    // In production, you'd use sharp or canvas to convert to PNG
    
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' })
    const svgFile = new File([svgBlob], `umwero-${Date.now()}.svg`, { type: 'image/svg+xml' })

    // Upload to Vercel Blob
    const blob = await put(svgFile.name, svgFile, {
      access: 'public',
      addRandomSuffix: true,
    })

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
      width,
      height,
      format: 'svg',
      message: 'Image generated successfully',
    })

  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Image generation failed', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Generate SVG from Umwero text
 */
function generateSVG(options: {
  text: string
  fontSize: number
  fontFamily: string
  backgroundColor: string
  textColor: string
  width: number
  height: number
}): string {
  const {
    text,
    fontSize,
    fontFamily,
    backgroundColor,
    textColor,
    width,
    height,
  } = options

  // Calculate text position (centered)
  const x = width / 2
  const y = height / 2

  // Split text into lines if it's too long
  const maxCharsPerLine = Math.floor(width / (fontSize * 0.6))
  const lines = splitTextIntoLines(text, maxCharsPerLine)
  const lineHeight = fontSize * 1.2

  // Generate SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Umwero';
        src: url('/Umwero.ttf') format('truetype');
      }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
  
  <!-- Text -->
  <text 
    x="${x}" 
    y="${y - (lines.length - 1) * lineHeight / 2}" 
    font-family="${fontFamily}, sans-serif" 
    font-size="${fontSize}" 
    fill="${textColor}" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >
    ${lines.map((line, index) => `
    <tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>
    `).join('')}
  </text>
  
  <!-- Watermark -->
  <text 
    x="${width - 10}" 
    y="${height - 10}" 
    font-family="sans-serif" 
    font-size="12" 
    fill="${textColor}" 
    opacity="0.3" 
    text-anchor="end"
  >
    Uruziga.com
  </text>
</svg>`

  return svg
}

/**
 * Split text into lines
 */
function splitTextIntoLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }

  if (currentLine) lines.push(currentLine)
  return lines
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Get image by ID
 * GET /api/umwero/generate-image?id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID required' },
        { status: 400 }
      )
    }

    // In a real implementation, you'd fetch from database
    // For now, return error
    return NextResponse.json(
      { error: 'Image not found' },
      { status: 404 }
    )

  } catch (error: any) {
    console.error('Get image error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve image' },
      { status: 500 }
    )
  }
}
