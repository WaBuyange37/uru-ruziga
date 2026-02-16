// lib/progress-tracker.ts
// Professional Progress Tracking Service
// Single source of truth for lesson progress management

import { prisma } from '@/lib/prisma'
import { ProgressStatus } from '@prisma/client'

export interface ProgressUpdate {
  userId: string
  lessonId: string
  stepId?: string
  score?: number
  timeSpent?: number
}

export interface StepCompletion {
  userId: string
  lessonId: string
  stepId: string
  score?: number
  timeSpent?: number
}

export interface ProgressStats {
  totalLessons: number
  completedLessons: number
  inProgressLessons: number
  notStartedLessons: number
  masteredLessons: number
  overallPercentage: number
  totalTimeSpent: number
  averageScore: number
  currentLesson?: {
    id: string
    title: string
    progress: number
    lastAccessed: Date
  }
}

/**
 * Initialize or get lesson progress for a user
 * Creates record if it doesn't exist
 */
export async function initializeLessonProgress(userId: string, lessonId: string) {
  const existing = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: { userId, lessonId }
    }
  })

  if (existing) {
    // Update lastAccessedAt
    return await prisma.lessonProgress.update({
      where: { id: existing.id },
      data: { lastAccessedAt: new Date() }
    })
  }

  // Create new progress record
  return await prisma.lessonProgress.create({
    data: {
      userId,
      lessonId,
      status: ProgressStatus.IN_PROGRESS,
      startedAt: new Date(),
      lastAccessedAt: new Date(),
      completedSteps: [],
      bestScore: 0,
      timeSpent: 0,
      attempts: 1
    }
  })
}

/**
 * Mark a step as completed
 * Updates completedSteps array and recalculates progress
 */
export async function completeStep({ userId, lessonId, stepId, score = 0, timeSpent = 0 }: StepCompletion) {
  // Get or create progress
  let progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } }
  })

  if (!progress) {
    progress = await initializeLessonProgress(userId, lessonId)
  }

  // Add stepId to completedSteps if not already there
  const completedSteps = new Set(progress.completedSteps)
  completedSteps.add(stepId)

  // Get total required steps for this lesson
  const totalRequiredSteps = await prisma.lessonStep.count({
    where: {
      lessonId,
      isRequired: true,
      isActive: true
    }
  })

  const completedCount = completedSteps.size
  const isFullyCompleted = completedCount >= totalRequiredSteps

  // Update best score if improved
  const newBestScore = Math.max(progress.bestScore, score)

  // Determine status
  let status = progress.status
  if (isFullyCompleted) {
    status = newBestScore >= 90 ? ProgressStatus.MASTERED : ProgressStatus.COMPLETED
  }

  // Update progress
  return await prisma.lessonProgress.update({
    where: { id: progress.id },
    data: {
      completedSteps: Array.from(completedSteps),
      currentStepId: stepId,
      bestScore: newBestScore,
      timeSpent: progress.timeSpent + timeSpent,
      lastAccessedAt: new Date(),
      status,
      completed: isFullyCompleted,
      completedAt: isFullyCompleted && !progress.completedAt ? new Date() : progress.completedAt
    }
  })
}

/**
 * Calculate dynamic progress percentage for a lesson
 * Does NOT store percentage - calculates on demand
 */
export async function calculateLessonProgress(userId: string, lessonId: string): Promise<number> {
  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { completedSteps: true }
  })

  if (!progress) return 0

  const totalRequiredSteps = await prisma.lessonStep.count({
    where: {
      lessonId,
      isRequired: true,
      isActive: true
    }
  })

  if (totalRequiredSteps === 0) return 0

  return Math.round((progress.completedSteps.length / totalRequiredSteps) * 100)
}

/**
 * Get user progress with dynamic percentage calculation
 */
export async function getUserLessonProgress(userId: string, lessonId: string) {
  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          type: true,
          module: true,
          duration: true
        }
      }
    }
  })

  if (!progress) {
    return null
  }

  // Calculate dynamic percentage
  const percentage = await calculateLessonProgress(userId, lessonId)

  // Get total required steps
  const totalSteps = await prisma.lessonStep.count({
    where: {
      lessonId,
      isRequired: true,
      isActive: true
    }
  })

  return {
    ...progress,
    progressPercentage: percentage,
    completedStepsCount: progress.completedSteps.length,
    totalSteps,
    remainingSteps: totalSteps - progress.completedSteps.length
  }
}

/**
 * Get all lessons progress for a user with dynamic calculations
 */
export async function getAllUserProgress(userId: string) {
  const progressRecords = await prisma.lessonProgress.findMany({
    where: { userId },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          type: true,
          module: true,
          duration: true,
          order: true
        }
      }
    },
    orderBy: { lastAccessedAt: 'desc' }
  })

  // Calculate percentage for each lesson
  const progressWithPercentages = await Promise.all(
    progressRecords.map(async (progress) => {
      const percentage = await calculateLessonProgress(userId, progress.lessonId)
      const totalSteps = await prisma.lessonStep.count({
        where: {
          lessonId: progress.lessonId,
          isRequired: true,
          isActive: true
        }
      })

      return {
        ...progress,
        progressPercentage: percentage,
        completedStepsCount: progress.completedSteps.length,
        totalSteps,
        remainingSteps: totalSteps - progress.completedSteps.length
      }
    })
  )

  return progressWithPercentages
}

/**
 * Get comprehensive dashboard statistics
 */
export async function getDashboardStats(userId: string): Promise<ProgressStats> {
  // Get all published lessons
  const totalLessons = await prisma.lesson.count({
    where: { isPublished: true }
  })

  // Get user progress records
  const progressRecords = await prisma.lessonProgress.findMany({
    where: { userId },
    select: {
      status: true,
      completed: true,
      bestScore: true,
      timeSpent: true,
      lessonId: true,
      lastAccessedAt: true,
      lesson: {
        select: {
          id: true,
          title: true
        }
      }
    }
  })

  // Count by status
  const completedLessons = progressRecords.filter(p => p.completed).length
  const inProgressLessons = progressRecords.filter(p => p.status === ProgressStatus.IN_PROGRESS).length
  const masteredLessons = progressRecords.filter(p => p.status === ProgressStatus.MASTERED).length
  const notStartedLessons = totalLessons - progressRecords.length

  // Calculate totals
  const totalTimeSpent = progressRecords.reduce((sum, p) => sum + p.timeSpent, 0)
  const averageScore = progressRecords.length > 0
    ? Math.round(progressRecords.reduce((sum, p) => sum + p.bestScore, 0) / progressRecords.length)
    : 0

  // Overall percentage
  const overallPercentage = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0

  // Get current lesson (most recently accessed in progress)
  const currentLessonProgress = progressRecords
    .filter(p => p.status === ProgressStatus.IN_PROGRESS)
    .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime())[0]

  let currentLesson
  if (currentLessonProgress) {
    const percentage = await calculateLessonProgress(userId, currentLessonProgress.lessonId)
    currentLesson = {
      id: currentLessonProgress.lesson.id,
      title: currentLessonProgress.lesson.title,
      progress: percentage,
      lastAccessed: currentLessonProgress.lastAccessedAt
    }
  }

  return {
    totalLessons,
    completedLessons,
    inProgressLessons,
    notStartedLessons,
    masteredLessons,
    overallPercentage,
    totalTimeSpent,
    averageScore,
    currentLesson
  }
}

/**
 * Update time spent on a lesson
 */
export async function updateTimeSpent(userId: string, lessonId: string, additionalSeconds: number) {
  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } }
  })

  if (!progress) {
    return await initializeLessonProgress(userId, lessonId)
  }

  return await prisma.lessonProgress.update({
    where: { id: progress.id },
    data: {
      timeSpent: progress.timeSpent + additionalSeconds,
      lastAccessedAt: new Date()
    }
  })
}

/**
 * Check if lesson is locked based on prerequisites
 */
export async function isLessonLocked(userId: string, lessonId: string): Promise<boolean> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { prerequisites: true }
  })

  if (!lesson || lesson.prerequisites.length === 0) {
    return false
  }

  // Check if all prerequisites are completed
  const prerequisiteProgress = await prisma.lessonProgress.findMany({
    where: {
      userId,
      lessonId: { in: lesson.prerequisites }
    },
    select: { completed: true }
  })

  // Locked if not all prerequisites are completed
  return prerequisiteProgress.length !== lesson.prerequisites.length ||
         prerequisiteProgress.some(p => !p.completed)
}
