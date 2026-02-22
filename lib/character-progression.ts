// lib/character-progression.ts
// Handles seamless character progression and lesson mapping

interface CharacterInfo {
  id: string
  type: 'VOWEL' | 'CONSONANT' | 'LIGATURE'
  latinEquivalent: string
  order: number
}

interface ProgressionResult {
  nextLessonId: string | null
  progressMessage: string
  shouldCelebrate: boolean
}

// Map character IDs to lesson IDs
export function getCharacterLessonId(characterId: string): string {
  // Handle the mapping from character ID to lesson ID
  // This follows the pattern from the database seed
  
  if (characterId.startsWith('char-')) {
    const charPart = characterId.replace('char-', '')
    
    // Vowels
    if (['a', 'e', 'i', 'o', 'u'].includes(charPart)) {
      return `lesson-vowel-${charPart}`
    }
    
    // Single consonants
    if (['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'y', 'z'].includes(charPart)) {
      return `lesson-consonant-${charPart}`
    }
    
    // Compound consonants
    if (['mb', 'mf', 'mv', 'nc', 'nd', 'ng', 'nj', 'nk', 'ns', 'nt', 'nz', 'ny', 'pf', 'sh', 'ts', 'jy', 'shy', 'nshy'].includes(charPart)) {
      return `lesson-consonant-${charPart}`
    }
    
    // Ligatures (start with 'lig-' or compound patterns)
    return `lesson-ligature-${charPart}`
  }
  
  return characterId // fallback
}

// Get lesson ID from character info returned by API
export function getLessonIdFromCharacter(character: { id: string, type: string, title: string }): string {
  // Extract the character part from the title or use the ID
  const titleMatch = character.title.match(/([A-Z]+)$/i)
  if (titleMatch) {
    const charPart = titleMatch[1].toLowerCase()
    const type = character.type.toLowerCase()
    return `lesson-${type}-${charPart}`
  }
  
  return getCharacterLessonId(character.id)
}

// Handle character progression with smooth transitions
export async function handleCharacterProgression(
  currentCharacterId: string,
  score: number,
  onProgress?: (message: string) => void
): Promise<ProgressionResult> {
  
  const PASS_MARK = 70
  const isLearned = score >= PASS_MARK
  
  if (!isLearned) {
    return {
      nextLessonId: null,
      progressMessage: `Score: ${score}%. Keep practicing to reach ${PASS_MARK}%!`,
      shouldCelebrate: false
    }
  }

  try {
    // Submit progress and get next character
    const token = localStorage.getItem('token')
    if (!token) {
      return {
        nextLessonId: null,
        progressMessage: 'Character learned! Please log in to save progress.',
        shouldCelebrate: true
      }
    }

    const response = await fetch('/api/progress/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        characterId: currentCharacterId,
        score,
        timeSpent: 0
      })
    })

    if (!response.ok) {
      throw new Error('Failed to submit progress')
    }

    const data = await response.json()
    
    if (data.nextCharacter) {
      const nextLessonId = getLessonIdFromCharacter(data.nextCharacter)
      
      return {
        nextLessonId,
        progressMessage: `🎉 Character learned! Moving to ${data.nextCharacter.title}...`,
        shouldCelebrate: true
      }
    } else {
      return {
        nextLessonId: null,
        progressMessage: `🎉 Congratulations! You've completed all available characters!`,
        shouldCelebrate: true
      }
    }

  } catch (error) {
    console.error('Error in character progression:', error)
    return {
      nextLessonId: null,
      progressMessage: 'Character learned! Returning to lesson selection...',
      shouldCelebrate: true
    }
  }
}

// Smooth transition between lessons
export function transitionToNextLesson(nextLessonId: string, delay: number = 1000) {
  // Add a smooth transition effect
  const body = document.body
  body.style.transition = 'opacity 0.3s ease-in-out'
  body.style.opacity = '0.7'
  
  setTimeout(() => {
    window.location.href = `/lessons/${nextLessonId}`
  }, delay)
}

// Create celebration effect for learned characters
export function celebrateCharacterLearned(characterName: string, score: number) {
  // Could add confetti, sound effects, or other celebration UI
  console.log(`🎉 ${characterName} learned with ${score}% score!`)
  
  // Simple celebration - could be enhanced with animations
  const celebration = document.createElement('div')
  celebration.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #10B981, #059669);
      color: white;
      padding: 20px 40px;
      border-radius: 12px;
      font-size: 18px;
      font-weight: bold;
      z-index: 9999;
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
      animation: celebrationPulse 0.6s ease-in-out;
    ">
      🎉 ${characterName} Learned! 🎉<br>
      <small style="font-size: 14px; opacity: 0.9;">Score: ${score}%</small>
    </div>
  `
  
  // Add animation keyframes
  if (!document.getElementById('celebration-styles')) {
    const style = document.createElement('style')
    style.id = 'celebration-styles'
    style.textContent = `
      @keyframes celebrationPulse {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `
    document.head.appendChild(style)
  }
  
  document.body.appendChild(celebration)
  
  // Remove after animation
  setTimeout(() => {
    if (celebration.parentNode) {
      celebration.parentNode.removeChild(celebration)
    }
  }, 2000)
}