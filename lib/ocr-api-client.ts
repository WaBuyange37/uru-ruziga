/**
 * OCR API Client
 * Production-grade client for Umwero OCR evaluation system
 */

export interface Point {
  x: number
  y: number
  timestamp: number
  pressure?: number
}

export interface Stroke {
  points: Point[]
  startTime: number
  endTime: number
}

export interface DrawingMetadata {
  canvasSize: { width: number; height: number }
  devicePixelRatio: number
  inputMethod: 'mouse' | 'touch' | 'stylus'
  totalDuration: number
  strokeCount: number
  totalPoints: number
  deviceInfo: {
    userAgent: string
    platform: string
    isMobile: boolean
    isTouch: boolean
    hasStylus: boolean
    screenWidth: number
    screenHeight: number
  }
}

export interface EvaluationRequest {
  characterId: string
  strokes: Stroke[]
  imageData: string
  lessonId?: string
  metadata: DrawingMetadata
}

export interface LearningAttemptRequest extends EvaluationRequest {
  stepId?: string
  learningStage: string
  journeyPhase: string
}

export interface FeedbackItem {
  category: string
  severity: string
  message: string
  suggestion: string
  confidence: number
}

export interface EvaluationResult {
  score: number
  passed: boolean
  confidence: number
  feedback: string[]
  detailedFeedback: FeedbackItem[]
  processingTime: number
}

export interface EvaluationResponse {
  success: boolean
  attemptId: string
  evaluation: EvaluationResult
  progress?: {
    totalAttempts: number
    bestScore: number
  }
  error?: {
    code: string
    message: string
    details?: string
  }
}

export interface ReferenceResponse {
  success: boolean
  reference: {
    character: string
    image_url: string
    cached: boolean
  }
  error?: {
    code: string
    message: string
  }
}

export interface DatasetStats {
  success: boolean
  statistics: {
    total_attempts: number
    total_dataset_entries: number
    quality_distribution: Record<string, number>
    character_type_distribution: Record<string, number>
    average_score: number
  }
  timestamp: string
}

export class OCRApiClient {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl: string = '/api/ocr', timeout: number = 10000) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  /**
   * Evaluate handwriting against reference
   */
  async evaluate(request: EvaluationRequest): Promise<EvaluationResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    try {
      const response = await fetch(`${this.baseUrl}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Evaluation request timed out')
      }
      
      throw error
    }
  }

  /**
   * Submit an authenticated adaptive-learning attempt.
   */
  async submitLearningAttempt(request: LearningAttemptRequest): Promise<EvaluationResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    try {
      const response = await fetch('/api/learning/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.error?.message || `HTTP ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success,
        attemptId: data.attempt?.userAttemptId,
        evaluation: {
          score: data.evaluation?.score ?? 0,
          passed: Boolean(data.evaluation?.passed),
          confidence: data.evaluation?.confidence ?? 0,
          feedback: data.evaluation?.feedback ?? [],
          detailedFeedback: Object.entries(data.evaluation?.metrics ?? {}).map(([category, value]) => ({
            category,
            severity: 'info',
            message: `${category}: ${value}`,
            suggestion: '',
            confidence: typeof value === 'number' ? value : 0,
          })),
          processingTime: 0,
        },
        progress: data.progression
          ? {
              totalAttempts: data.progression.completedStages?.length ?? 0,
              bestScore: data.progression.masteryScore ?? 0,
            }
          : undefined,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Learning attempt request timed out')
      }

      throw error
    }
  }

  /**
   * Get reference image for a character
   */
  async getReference(character: string): Promise<ReferenceResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(`${this.baseUrl}/reference?character=${encodeURIComponent(character)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Reference request timed out')
      }
      
      throw error
    }
  }

  /**
   * Get dataset statistics (admin only)
   */
  async getDatasetStats(): Promise<DatasetStats> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(`${this.baseUrl}/dataset/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Stats request timed out')
      }
      
      throw error
    }
  }

  /**
   * Export dataset (admin only)
   */
  async exportDataset(options: {
    exportFormat?: 'json' | 'csv' | 'tensorflow' | 'pytorch'
    characterTypes?: string[]
    qualityLabels?: string[]
    minScore?: number
    maxScore?: number
    limit?: number
  }): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

    try {
      const response = await fetch(`${this.baseUrl}/dataset/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Export request timed out')
      }
      
      throw error
    }
  }
}

// Export singleton instance
export const ocrApiClient = new OCRApiClient()
