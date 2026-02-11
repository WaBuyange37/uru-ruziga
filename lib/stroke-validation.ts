// lib/stroke-validation.ts
// Intelligent stroke validation engine

import type { Point, Stroke, ValidationResult, NormalizedPath } from '@/types/stroke-validation'

/**
 * Douglas-Peucker algorithm for path simplification
 */
function simplifyPath(points: Point[], tolerance: number = 2): Point[] {
  if (points.length <= 2) return points

  const perpendicularDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const dx = lineEnd.x - lineStart.x
    const dy = lineEnd.y - lineStart.y
    const mag = Math.sqrt(dx * dx + dy * dy)
    
    if (mag === 0) return Math.sqrt(Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2))
    
    const u = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (mag * mag)
    const closestPoint = {
      x: lineStart.x + u * dx,
      y: lineStart.y + u * dy
    }
    
    return Math.sqrt(Math.pow(point.x - closestPoint.x, 2) + Math.pow(point.y - closestPoint.y, 2))
  }

  let maxDistance = 0
  let maxIndex = 0

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[points.length - 1])
    if (distance > maxDistance) {
      maxDistance = distance
      maxIndex = i
    }
  }

  if (maxDistance > tolerance) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), tolerance)
    const right = simplifyPath(points.slice(maxIndex), tolerance)
    return [...left.slice(0, -1), ...right]
  }

  return [points[0], points[points.length - 1]]
}

/**
 * Normalize path: center and scale to unit square
 */
function normalizePath(points: Point[]): NormalizedPath {
  if (points.length === 0) {
    return { points: [], center: { x: 0, y: 0 }, scale: 1 }
  }

  // Find bounds
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity

  points.forEach(p => {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  })

  const width = maxX - minX
  const height = maxY - minY
  const scale = Math.max(width, height) || 1

  const center = {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2
  }

  // Normalize points
  const normalized = points.map(p => ({
    x: (p.x - center.x) / scale,
    y: (p.y - center.y) / scale
  }))

  return { points: normalized, center, scale }
}

/**
 * Calculate Hausdorff distance between two paths
 */
function hausdorffDistance(path1: Point[], path2: Point[]): number {
  const distance = (p1: Point, p2: Point) => 
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))

  const directed = (from: Point[], to: Point[]) => {
    let maxDist = 0
    from.forEach(p1 => {
      let minDist = Infinity
      to.forEach(p2 => {
        minDist = Math.min(minDist, distance(p1, p2))
      })
      maxDist = Math.max(maxDist, minDist)
    })
    return maxDist
  }

  return Math.max(directed(path1, path2), directed(path2, path1))
}

/**
 * Calculate shape similarity score (0-100)
 */
function calculateShapeSimilarity(userPath: Point[], templatePath: Point[]): number {
  if (userPath.length === 0 || templatePath.length === 0) return 0

  // Simplify paths
  const simplifiedUser = simplifyPath(userPath, 3)
  const simplifiedTemplate = simplifyPath(templatePath, 3)

  // Normalize both paths
  const normalizedUser = normalizePath(simplifiedUser)
  const normalizedTemplate = normalizePath(simplifiedTemplate)

  // Calculate Hausdorff distance
  const distance = hausdorffDistance(normalizedUser.points, normalizedTemplate.points)

  // Convert distance to similarity score (0-100)
  // Lower distance = higher similarity
  const maxDistance = 1.0 // Maximum expected distance in normalized space
  const similarity = Math.max(0, 100 * (1 - distance / maxDistance))

  return similarity
}

/**
 * Validate user strokes against template
 */
export function validateStrokes(
  userStrokes: Stroke[],
  templateStrokes: Point[][],
  options: {
    passingThreshold?: number
    strictOrder?: boolean
  } = {}
): ValidationResult {
  const { passingThreshold = 70, strictOrder = false } = options

  if (userStrokes.length === 0) {
    return {
      accuracy: 0,
      passed: false,
      grade: 'retry',
      feedback: 'Please draw the character to continue.'
    }
  }

  // Combine all user strokes into one path
  const userPath: Point[] = []
  userStrokes.forEach(stroke => {
    userPath.push(...stroke.points)
  })

  // Combine all template strokes into one path
  const templatePath: Point[] = []
  templateStrokes.forEach(stroke => {
    templatePath.push(...stroke)
  })

  // Calculate shape similarity
  const shapeSimilarity = calculateShapeSimilarity(userPath, templatePath)

  // Stroke count penalty (if too few or too many strokes)
  let strokePenalty = 0
  const strokeDiff = Math.abs(userStrokes.length - templateStrokes.length)
  if (strokeDiff > 0) {
    strokePenalty = Math.min(20, strokeDiff * 10)
  }

  // Final accuracy
  const accuracy = Math.max(0, Math.min(100, shapeSimilarity - strokePenalty))

  // Determine grade
  let grade: 'excellent' | 'good' | 'acceptable' | 'retry'
  let feedback: string

  if (accuracy >= 90) {
    grade = 'excellent'
    feedback = 'Excellent! Your stroke is very accurate.'
  } else if (accuracy >= 75) {
    grade = 'good'
    feedback = 'Good job! Your character looks great.'
  } else if (accuracy >= passingThreshold) {
    grade = 'acceptable'
    feedback = 'Well done! You can move to the next character.'
  } else {
    grade = 'retry'
    feedback = 'Try again. Follow the guide lines more carefully.'
  }

  return {
    accuracy: Math.round(accuracy),
    passed: accuracy >= passingThreshold,
    grade,
    feedback
  }
}

/**
 * Simple validation for basic stroke presence
 */
export function validateBasicStrokes(strokes: Stroke[]): ValidationResult {
  if (strokes.length === 0) {
    return {
      accuracy: 0,
      passed: false,
      grade: 'retry',
      feedback: 'Please draw the character to continue.'
    }
  }

  // Calculate total path length
  let totalLength = 0
  strokes.forEach(stroke => {
    for (let i = 1; i < stroke.points.length; i++) {
      const dx = stroke.points[i].x - stroke.points[i - 1].x
      const dy = stroke.points[i].y - stroke.points[i - 1].y
      totalLength += Math.sqrt(dx * dx + dy * dy)
    }
  })

  // Simple heuristic: longer paths = more effort = higher score
  const minLength = 100 // Minimum expected path length
  const maxLength = 1000 // Maximum expected path length
  const lengthScore = Math.min(100, (totalLength / maxLength) * 100)

  // Stroke count bonus
  const strokeBonus = Math.min(20, strokes.length * 10)

  const accuracy = Math.min(100, lengthScore + strokeBonus)

  let grade: 'excellent' | 'good' | 'acceptable' | 'retry'
  let feedback: string

  if (accuracy >= 90) {
    grade = 'excellent'
    feedback = 'Excellent work! Your character looks perfect.'
  } else if (accuracy >= 75) {
    grade = 'good'
    feedback = 'Great job! Keep practicing.'
  } else if (accuracy >= 60) {
    grade = 'acceptable'
    feedback = 'Good effort! You can continue.'
  } else {
    grade = 'retry'
    feedback = 'Try drawing more carefully.'
  }

  return {
    accuracy: Math.round(accuracy),
    passed: accuracy >= 70,
    grade,
    feedback
  }
}
