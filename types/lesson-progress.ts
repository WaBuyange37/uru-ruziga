// types/lesson-progress.ts
// Type definitions for lesson progress tracking

export type LessonStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED'

export interface LessonProgress {
  lessonId: string
  completed: boolean
  score: number
  attempts: number
  timeSpent: number // in seconds
  lastAccessed: Date
  currentStep?: number
  totalSteps?: number
}

export interface LessonProgressState {
  [lessonId: string]: LessonProgress
}

export interface GlobalProgress {
  totalLessons: number
  completedLessons: number
  inProgressLessons: number
  percentageComplete: number
  totalTimeSpent: number
  averageScore: number
}

export interface LessonMetadata {
  id: string
  title: string
  description: string
  type: 'VOWEL' | 'CONSONANT' | 'WORD' | 'SENTENCE'
  difficulty: number
  order: number
  duration: number
  prerequisites: string[]
  character?: {
    umwero: string
    latin: string
    pronunciation: string
    meaning: string
    culturalNote: string
    examples: Array<{
      umwero: string
      latin: string
      english: string
    }>
  }
}

export interface CanvasDrawing {
  strokes: Array<{
    points: Array<{ x: number; y: number }>
    timestamp: number
  }>
  timestamp: Date
  score?: number
}
