// lib/progress-events.ts
// Simple event system for progress updates

type ProgressUpdateEvent = {
  characterId: string
  status: 'LEARNED' | 'IN_PROGRESS' | 'NOT_STARTED'
  score: number
  type: 'vowel' | 'consonant' | 'ligature'
}

class ProgressEventEmitter {
  private listeners: ((event: ProgressUpdateEvent) => void)[] = []

  subscribe(listener: (event: ProgressUpdateEvent) => void) {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  emit(event: ProgressUpdateEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in progress event listener:', error)
      }
    })
  }
}

export const progressEvents = new ProgressEventEmitter()

// Helper function to emit progress update
export function emitProgressUpdate(
  characterId: string, 
  status: 'LEARNED' | 'IN_PROGRESS' | 'NOT_STARTED',
  score: number,
  type: 'vowel' | 'consonant' | 'ligature'
) {
  progressEvents.emit({ characterId, status, score, type })
}