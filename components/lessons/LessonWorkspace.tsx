'use client'

import { useState, useEffect } from 'react'
import { LessonHeader } from './LessonHeader'
import { LessonTabs } from './LessonTabs'
import { LearningPanel } from './LearningPanel'
import { PracticePanel } from './PracticePanel'
import { useLessonState } from '@/hooks/useLessonState'
import { AuthDebugger } from '@/components/debug/AuthDebugger'

interface LessonWorkspaceProps {
  lessonId: string
  onCharacterComplete?: (characterId: string) => void
}

// API helper to update character progress
async function updateCharacterProgressAPI(characterId: string, score: number): Promise<boolean> {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      return false // Will fallback to localStorage
    }

    const response = await fetch('/api/character-progress', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        characterId,
        score,
        timeSpent: 0
      })
    })

    if (!response.ok) {
      throw new Error('Failed to update progress')
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error('Error updating character progress:', error)
    return false
  }
}

export function LessonWorkspace({ lessonId, onCharacterComplete }: LessonWorkspaceProps) {
  const {
    lesson,
    character,
    activeTab,
    setActiveTab,
    practiceMode,
    setPracticeMode,
    progress,
    loading,
    error
  } = useLessonState(lessonId)

  // Handle seamless character progression
  const handleNextCharacter = async (nextCharacterId: string) => {
    try {
      // Create lesson ID from character ID (following the pattern)
      const nextLessonId = nextCharacterId.replace('char-', 'lesson-vowel-')
        .replace('char-', 'lesson-consonant-')
        .replace('char-', 'lesson-ligature-')

      // Smooth transition: fade out current, load next, fade in
      setPracticeMode('idle')
      
      // Small delay for smooth UX
      setTimeout(() => {
        // Navigate to next lesson seamlessly
        window.location.href = `/lessons/${nextLessonId}`
      }, 300)

    } catch (error) {
      console.error('Error transitioning to next character:', error)
      // Fallback: go back to learn page
      window.location.href = '/learn'
    }
  }

  // Handle character learning completion
  const handleCharacterLearned = async (characterId: string, score: number) => {
    try {
      // Update progress via API
      const success = await updateCharacterProgressAPI(characterId, score)
      
      if (success) {
        console.log(`🎉 Character ${characterId} learned with score ${score}!`)
        
        // Show success message or redirect
        // You could add a toast notification here
        
        // Optional: Redirect back to learn page after a delay
        setTimeout(() => {
          window.location.href = '/learn'
        }, 3000)
      } else {
        // Fallback: save to localStorage
        const progressKey = `characterProgress_${characterId}`
        const progressData = {
          characterId,
          status: score >= 70 ? 'LEARNED' : 'IN_PROGRESS',
          score,
          timeSpent: 0,
          attempts: 1,
          lastAttempt: new Date().toISOString()
        }
        localStorage.setItem(progressKey, JSON.stringify(progressData))
        console.log(`📝 Character progress saved to localStorage`)
      }
    } catch (error) {
      console.error('Error handling character learned:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-[#8B4513] text-lg">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (error || !lesson || !character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB]">
        <div className="text-center max-w-md">
          <p className="text-red-600 text-xl mb-4">Failed to load lesson</p>
          <p className="text-gray-600">{error || 'Lesson not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB]">
      {/* Sticky Header */}
      <LessonHeader
        lesson={lesson}
        character={character}
        progress={progress}
      />

      {/* Tab Navigation */}
      <LessonTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Debug Component - Remove in production */}
        <AuthDebugger />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Learning Content */}
          <LearningPanel
            lesson={lesson}
            character={character}
            activeTab={activeTab}
          />

          {/* Right Panel: Practice Canvas */}
          <PracticePanel
            lesson={lesson}
            character={character}
            practiceMode={practiceMode}
            onModeChange={setPracticeMode}
            onCharacterLearned={handleCharacterLearned}
            onNextCharacter={handleNextCharacter}
          />
        </div>
      </div>
    </div>
  )
}
