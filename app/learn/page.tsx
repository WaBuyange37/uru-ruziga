// 🚀 PRODUCTION-GRADE ARCHITECTURE: Server Component + Database Priority
// Prioritizes full database with all characters over static fallback

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { LearnPageClient } from '@/components/learn/LearnPageClient'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// 🔥 CRITICAL: Add Next.js caching for instant subsequent loads
export const revalidate = 3600 // Cache for 1 hour (lessons rarely change)

// 🚀 Server-side data fetching with parallel queries - DATABASE PRIORITY
async function getLessonsData() {
  try {
    console.log('🔍 Attempting database connection...')
    
    // 🔥 PARALLEL FETCHING - All queries run simultaneously
    const [vowelLessons, consonantLessons, ligatureLessons] = await Promise.all([
      prisma.lesson.findMany({
        where: { 
          type: 'VOWEL', 
          isPublished: true 
        },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          content: true,
          module: true,
          type: true,
          order: true,
          duration: true,
          videoUrl: true,
          thumbnailUrl: true,
          isPublished: true,
          createdAt: true,
        }
      }),
      prisma.lesson.findMany({
        where: { 
          type: 'CONSONANT', 
          isPublished: true 
        },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          content: true,
          module: true,
          type: true,
          order: true,
          duration: true,
          videoUrl: true,
          thumbnailUrl: true,
          isPublished: true,
          createdAt: true,
        }
      }),
      prisma.lesson.findMany({
        where: { 
          type: 'LIGATURE', 
          isPublished: true 
        },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          content: true,
          module: true,
          type: true,
          order: true,
          duration: true,
          videoUrl: true,
          thumbnailUrl: true,
          isPublished: true,
          createdAt: true,
        }
      })
    ])

    console.log(`✅ Database connected! Found ${vowelLessons.length} vowels, ${consonantLessons.length} consonants, ${ligatureLessons.length} ligatures`)

    // 🎯 SUCCESS: Return full database data
    return {
      vowelLessons,
      consonantLessons, 
      ligatureLessons,
      totalLessons: vowelLessons.length + consonantLessons.length + ligatureLessons.length,
      source: 'database'
    }
  } catch (error) {
    console.error('❌ Database connection failed:', (error as Error).message)
    console.log('🔄 Please ensure database is seeded and accessible')
    
    // 🛡️ RETURN EMPTY FOR NOW - User prefers full database over static fallback
    return {
      vowelLessons: [],
      consonantLessons: [],
      ligatureLessons: [],
      totalLessons: 0,
      source: 'empty',
      error: (error as Error).message
    }
  }
}

// 🚀 MAIN SERVER COMPONENT - Pre-fetches all data
export default async function LearnPage() {
  // 🔥 SERVER-SIDE FETCH: Data ready before HTML sent to client
  const lessonsData = await getLessonsData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB] px-2 sm:px-4">
      <Suspense fallback={<LoadingSpinner />}>
        <LearnPageClient 
          initialVowelLessons={lessonsData.vowelLessons}
          initialConsonantLessons={lessonsData.consonantLessons}
          initialLigatureLessons={lessonsData.ligatureLessons}
          totalLessons={lessonsData.totalLessons}
        />
      </Suspense>
    </div>
  )
}