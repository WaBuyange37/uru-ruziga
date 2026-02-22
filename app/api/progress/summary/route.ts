// app/api/progress/summary/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

interface ProgressSummary {
  vowels: { learned: number; total: number }
  consonants: { learned: number; total: number }
  ligatures: { learned: number; total: number }
  overall: { learned: number; total: number; percentage: number }
}

export async function GET(request: NextRequest): Promise<NextResponse<ProgressSummary | { error: string }>> {
  try {
    // Get user from JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    console.log('Fetching progress summary for user:', userId)

    // Get all active characters by type
    const [vowelCount, consonantCount, ligatureCount] = await Promise.all([
      prisma.character.count({ where: { type: 'VOWEL', isActive: true } }),
      prisma.character.count({ where: { type: 'CONSONANT', isActive: true } }),
      prisma.character.count({ where: { type: 'LIGATURE', isActive: true } })
    ])

    // Get user's learned progress by type
    const [vowelLearned, consonantLearned, ligatureLearned] = await Promise.all([
      prisma.userCharacterProgress.count({
        where: {
          userId,
          status: 'LEARNED',
          character: { type: 'VOWEL', isActive: true }
        }
      }),
      prisma.userCharacterProgress.count({
        where: {
          userId,
          status: 'LEARNED',
          character: { type: 'CONSONANT', isActive: true }
        }
      }),
      prisma.userCharacterProgress.count({
        where: {
          userId,
          status: 'LEARNED',
          character: { type: 'LIGATURE', isActive: true }
        }
      })
    ])

    const totalCharacters = vowelCount + consonantCount + ligatureCount
    const totalLearned = vowelLearned + consonantLearned + ligatureLearned
    const overallPercentage = totalCharacters > 0 ? Math.round((totalLearned / totalCharacters) * 100) : 0

    console.log('Progress summary calculated:', {
      userId,
      vowels: { learned: vowelLearned, total: vowelCount },
      consonants: { learned: consonantLearned, total: consonantCount },
      ligatures: { learned: ligatureLearned, total: ligatureCount },
      overall: { learned: totalLearned, total: totalCharacters, percentage: overallPercentage }
    })

    const summary: ProgressSummary = {
      vowels: { learned: vowelLearned, total: vowelCount },
      consonants: { learned: consonantLearned, total: consonantCount },
      ligatures: { learned: ligatureLearned, total: ligatureCount },
      overall: { learned: totalLearned, total: totalCharacters, percentage: overallPercentage }
    }

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Error fetching progress summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress summary' },
      { status: 500 }
    )
  }
}