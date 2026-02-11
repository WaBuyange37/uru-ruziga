// types/stroke-validation.ts
// Type definitions for stroke validation system

export interface Point {
  x: number
  y: number
}

export interface Stroke {
  points: Point[]
  timestamp: number
}

export interface CharacterTemplate {
  id: string
  character: string
  strokes: Point[][]
  bounds: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }
}

export interface ValidationResult {
  accuracy: number // 0-100
  passed: boolean
  grade: 'excellent' | 'good' | 'acceptable' | 'retry'
  feedback: string
  deviations?: Array<{
    strokeIndex: number
    issue: string
  }>
}

export interface NormalizedPath {
  points: Point[]
  center: Point
  scale: number
}
