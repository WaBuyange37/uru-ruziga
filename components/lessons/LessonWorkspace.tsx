'use client'

import { useState, useEffect } from 'react'
import { LessonHeader } from './LessonHeader'
import { LessonTabs } from './LessonTabs'
import { LearningPanel } from './LearningPanel'
import { PracticePanel } from './PracticePanel'
import { useLessonState } from '@/hooks/useLessonState'

interface LessonWorkspaceProps {
  lessonId: string
  onCharacterComplete?: (characterId: string) => void
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-[#8B4513] text-lg">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (error || !lesson || !character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <p className="mb-4 text-xl text-black">Failed to load lesson</p>
          <p className="text-black/65">{error || 'Lesson not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
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
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] gap-6 items-start">
          {/* Primary Panel: Practice Canvas */}
          <PracticePanel
            lesson={lesson}
            character={character}
            practiceMode={practiceMode}
            onModeChange={setPracticeMode}
            onNextCharacter={handleNextCharacter}
          />

          {/* Secondary Panel: Reference Content */}
          <LearningPanel
            lesson={lesson}
            character={character}
            activeTab={activeTab}
          />
        </div>
      </div>
    </div>
  )
}
