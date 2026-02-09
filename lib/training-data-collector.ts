// lib/training-data-collector.ts
// Automatic training data collection for Umwero ML model

import { PrismaClient, DataSourceType } from '@prisma/client'

const prisma = new PrismaClient()

interface TrainingDataInput {
  userId?: string
  sourceType: DataSourceType
  sourceId?: string
  latinText: string
  umweroText?: string
  translatedText?: string
  context?: string
  language?: string
  targetLanguage?: string
  quality?: number
  metadata?: Record<string, any>
}

/**
 * Collect training data from user interactions
 * This function is called automatically when users:
 * - Create community posts
 * - Send chat messages
 * - Complete translations
 * - Submit lesson answers
 */
export async function collectTrainingData(input: TrainingDataInput): Promise<void> {
  try {
    // Anonymize user data for privacy (GDPR compliance)
    const anonymizedUserId = input.userId ? await anonymizeUserId(input.userId) : null
    
    // Store training data
    await prisma.trainingData.create({
      data: {
        userId: anonymizedUserId,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        latinText: input.latinText,
        umweroText: input.umweroText,
        translatedText: input.translatedText,
        context: input.context,
        language: input.language || 'rw',
        targetLanguage: input.targetLanguage,
        quality: input.quality,
        verified: false, // Admin must verify before using in training
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    })
  } catch (error) {
    // Log error but don't fail the main operation
    console.error('Failed to collect training data:', error)
  }
}

/**
 * Anonymize user ID for privacy
 * Uses one-way hash to prevent identification
 */
async function anonymizeUserId(userId: string): Promise<string | null> {
  // For privacy, we can either:
  // 1. Return null (fully anonymous)
  // 2. Return a hashed version (allows grouping by user without identification)
  
  // Option 1: Fully anonymous (recommended for GDPR)
  return null
  
  // Option 2: Hashed (if you need to track user patterns)
  // const crypto = require('crypto')
  // return crypto.createHash('sha256').update(userId).digest('hex')
}

/**
 * Collect data from community post
 */
export async function collectFromPost(
  userId: string,
  postId: string,
  content: string,
  language: string,
  latinText?: string,
  umweroText?: string
): Promise<void> {
  await collectTrainingData({
    userId,
    sourceType: 'COMMUNITY_POST',
    sourceId: postId,
    latinText: latinText || content,
    umweroText,
    context: 'community_post',
    language,
    quality: 3, // Default quality, can be adjusted by admin
  })
}

/**
 * Collect data from post comment
 */
export async function collectFromComment(
  userId: string,
  commentId: string,
  content: string,
  language: string,
  latinText?: string,
  umweroText?: string
): Promise<void> {
  await collectTrainingData({
    userId,
    sourceType: 'POST_COMMENT',
    sourceId: commentId,
    latinText: latinText || content,
    umweroText,
    context: 'post_comment',
    language,
    quality: 3,
  })
}

/**
 * Collect data from chat message
 */
export async function collectFromChat(
  userId: string,
  messageId: string,
  latinText: string,
  umweroText: string
): Promise<void> {
  await collectTrainingData({
    userId,
    sourceType: 'CHAT_MESSAGE',
    sourceId: messageId,
    latinText,
    umweroText,
    context: 'umwero_chat',
    language: 'rw',
    quality: 4, // Higher quality as it's direct translation
  })
}

/**
 * Collect data from user translation
 */
export async function collectFromTranslation(
  userId: string | undefined,
  sourceText: string,
  targetText: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<void> {
  await collectTrainingData({
    userId,
    sourceType: 'USER_TRANSLATION',
    latinText: sourceLanguage === 'um' ? targetText : sourceText,
    umweroText: targetLanguage === 'um' ? targetText : sourceText,
    context: 'translation_tool',
    language: sourceLanguage,
    targetLanguage,
    quality: 3,
  })
}

/**
 * Collect data from lesson content
 */
export async function collectFromLesson(
  lessonId: string,
  latinText: string,
  umweroText: string,
  context: string
): Promise<void> {
  await collectTrainingData({
    sourceType: 'LESSON_CONTENT',
    sourceId: lessonId,
    latinText,
    umweroText,
    context: `lesson_${context}`,
    language: 'rw',
    quality: 5, // Highest quality as it's curated content
  })
}

/**
 * Collect data from drawing feedback
 */
export async function collectFromDrawing(
  userId: string,
  drawingId: string,
  vowel: string,
  umweroChar: string,
  feedback: string
): Promise<void> {
  await collectTrainingData({
    userId,
    sourceType: 'DRAWING_FEEDBACK',
    sourceId: drawingId,
    latinText: vowel,
    umweroText: umweroChar,
    translatedText: feedback,
    context: 'drawing_practice',
    language: 'rw',
    quality: 4,
  })
}

/**
 * Collect data from quiz answer
 */
export async function collectFromQuiz(
  userId: string,
  quizId: string,
  question: string,
  answer: string,
  isCorrect: boolean
): Promise<void> {
  await collectTrainingData({
    userId,
    sourceType: 'QUIZ_ANSWER',
    sourceId: quizId,
    latinText: question,
    translatedText: answer,
    context: 'quiz_answer',
    language: 'rw',
    quality: isCorrect ? 5 : 2, // Higher quality for correct answers
    metadata: { isCorrect },
  })
}

/**
 * Export training data for ML model training
 * Admin-only function
 */
export async function exportTrainingData(
  filters?: {
    verified?: boolean
    minQuality?: number
    sourceType?: DataSourceType
    language?: string
    startDate?: Date
    endDate?: Date
  }
): Promise<any[]> {
  const where: any = {}
  
  if (filters?.verified !== undefined) {
    where.verified = filters.verified
  }
  
  if (filters?.minQuality) {
    where.quality = { gte: filters.minQuality }
  }
  
  if (filters?.sourceType) {
    where.sourceType = filters.sourceType
  }
  
  if (filters?.language) {
    where.language = filters.language
  }
  
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {}
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate
    }
  }
  
  const data = await prisma.trainingData.findMany({
    where,
    select: {
      id: true,
      sourceType: true,
      latinText: true,
      umweroText: true,
      translatedText: true,
      context: true,
      language: true,
      targetLanguage: true,
      quality: true,
      verified: true,
      metadata: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  
  return data
}

/**
 * Get training data statistics
 * Admin-only function
 */
export async function getTrainingDataStats(): Promise<{
  total: number
  verified: number
  bySourceType: Record<string, number>
  byLanguage: Record<string, number>
  byQuality: Record<number, number>
}> {
  const [
    total,
    verified,
    bySourceType,
    byLanguage,
    byQuality,
  ] = await Promise.all([
    prisma.trainingData.count(),
    prisma.trainingData.count({ where: { verified: true } }),
    prisma.trainingData.groupBy({
      by: ['sourceType'],
      _count: true,
    }),
    prisma.trainingData.groupBy({
      by: ['language'],
      _count: true,
    }),
    prisma.trainingData.groupBy({
      by: ['quality'],
      _count: true,
    }),
  ])
  
  return {
    total,
    verified,
    bySourceType: Object.fromEntries(
      bySourceType.map(item => [item.sourceType, item._count])
    ),
    byLanguage: Object.fromEntries(
      byLanguage.map(item => [item.language, item._count])
    ),
    byQuality: Object.fromEntries(
      byQuality.map(item => [item.quality || 0, item._count])
    ),
  }
}

/**
 * Verify training data entry
 * Admin-only function
 */
export async function verifyTrainingData(
  id: string,
  verified: boolean,
  quality?: number
): Promise<void> {
  await prisma.trainingData.update({
    where: { id },
    data: {
      verified,
      ...(quality !== undefined && { quality }),
    },
  })
}
