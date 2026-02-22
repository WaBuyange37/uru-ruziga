'use client'

import { OverviewTab } from './tabs/OverviewTab'
import { CultureTab } from './tabs/CultureTab'
import { StrokeGuideTab } from './tabs/StrokeGuideTab'
import { StoryTab } from './tabs/StoryTab'
import type { TabType } from '@/hooks/useLessonState'

interface LearningPanelProps {
  lesson: any
  character: any
  activeTab: TabType
}

export function LearningPanel({ lesson, character, activeTab }: LearningPanelProps) {
  return (
    <div className="bg-white rounded-lg border-2 border-[#8B4513] shadow-lg overflow-hidden">
      <div className="p-6">
        {activeTab === 'overview' && (
          <OverviewTab character={character} />
        )}
        {activeTab === 'culture' && (
          <CultureTab character={character} />
        )}
        {activeTab === 'strokes' && (
          <StrokeGuideTab character={character} />
        )}
        {activeTab === 'story' && (
          <StoryTab character={character} />
        )}
      </div>
    </div>
  )
}
