// 🚀 PRODUCTION-GRADE ARCHITECTURE: Server Component + Database Priority
// Prioritizes full database with all characters over static fallback

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { LearnPageClient } from '@/components/learn/LearnPageClient'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { STATIC_VOWEL_LESSONS, STATIC_CONSONANT_LESSONS, STATIC_LIGATURE_LESSONS } from '@/lib/static-lessons'

// 🔥 CRITICAL: Add Next.js caching for instant subsequent loads
export const revalidate = 3600 // Cache for 1 hour (lessons rarely change)

// Convert static lessons to database format
function convertStaticToDbFormat(staticLessons: any[]) {
  return staticLessons.map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    content: JSON.stringify({
      [lesson.type.toLowerCase()]: lesson.character,
      umwero: lesson.umwero,
      pronunciation: lesson.pronunciation,
      meaning: lesson.meaning,
      culturalNote: lesson.culturalNote,
      examples: lesson.examples,
      imageUrl: lesson.imageUrl,
      audioUrl: lesson.audioUrl
    }),
    module: null,
    type: lesson.type,
    order: lesson.order,
    duration: lesson.duration,
    videoUrl: null,
    thumbnailUrl: lesson.imageUrl,
    isPublished: true,
    createdAt: new Date()
  }))
}

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

    const totalLessons = vowelLessons.length + consonantLessons.length + ligatureLessons.length

    console.log(`✅ Database connected! Found ${totalLessons} lessons`)
    console.log(`📊 Breakdown: ${vowelLessons.length} vowels, ${consonantLessons.length} consonants, ${ligatureLessons.length} ligatures`)

    // If database has lessons, use them
    if (totalLessons > 0) {
      return {
        vowelLessons,
        consonantLessons,
        ligatureLessons,
        totalLessons,
        source: 'database'
      }
    }

    // 🔄 FALLBACK: Use static lessons if database is empty
    console.log('⚠️ Database is empty, falling back to static lessons...')
    
    const staticVowels = convertStaticToDbFormat(STATIC_VOWEL_LESSONS)
    const staticConsonants = convertStaticToDbFormat(STATIC_CONSONANT_LESSONS)
    const staticLigatures = convertStaticToDbFormat(STATIC_LIGATURE_LESSONS)
    
    const staticTotal = staticVowels.length + staticConsonants.length + staticLigatures.length
    
    console.log(`✅ Using static lessons: ${staticTotal} total (${staticVowels.length} vowels, ${staticConsonants.length} consonants, ${staticLigatures.length} ligatures)`)

    return {
      vowelLessons: staticVowels,
      consonantLessons: staticConsonants,
      ligatureLessons: staticLigatures,
      totalLessons: staticTotal,
      source: 'static'
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error)
    
    // 🔄 FALLBACK: Use static lessons on database error
    console.log('🔄 Using static lessons as fallback...')
    
    const staticVowels = convertStaticToDbFormat(STATIC_VOWEL_LESSONS)
    const staticConsonants = convertStaticToDbFormat(STATIC_CONSONANT_LESSONS)
    const staticLigatures = convertStaticToDbFormat(STATIC_LIGATURE_LESSONS)
    
    const staticTotal = staticVowels.length + staticConsonants.length + staticLigatures.length
    
    console.log(`✅ Static fallback loaded: ${staticTotal} lessons`)

    return {
      vowelLessons: staticVowels,
      consonantLessons: staticConsonants,
      ligatureLessons: staticLigatures,
      totalLessons: staticTotal,
      source: 'static-fallback'
    }
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