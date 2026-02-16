'use client'

import { useState, useEffect } from 'react'
import { LessonHeader } from './LessonHeader'
import { LessonTabs } from './LessonTabs'
import { LearningPanel } from './LearningPanel'
import { PracticePanel } from './PracticePanel'
import { useLessonState } from '@/hooks/useLessonState'

interface LessonWorkspaceProps {
  lessonId: string
}

export function LessonWorkspace({ lessonId }: LessonWorkspaceProps) {
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
          />
        </div>
      </div>
    </div>
  )
}
