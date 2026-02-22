'use client'

import { BookOpen, Globe, Pen, BookMarked } from 'lucide-react'
import type { TabType } from '@/hooks/useLessonState'

interface LessonTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs = [
  { id: 'overview' as TabType, label: 'Overview', icon: BookOpen },
  { id: 'culture' as TabType, label: 'Culture', icon: Globe },
  { id: 'strokes' as TabType, label: 'Stroke Guide', icon: Pen },
  { id: 'story' as TabType, label: 'Story', icon: BookMarked },
]

export function LessonTabs({ activeTab, onTabChange }: LessonTabsProps) {
  return (
    <div className="sticky top-[120px] z-40 bg-white border-b border-[#F3E5AB] shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 font-medium text-sm
                  border-b-2 transition-all whitespace-nowrap
                  ${isActive
                    ? 'border-[#8B4513] text-[#8B4513] bg-[#FFF8DC]'
                    : 'border-transparent text-[#D2691E] hover:bg-[#F3E5AB] hover:text-[#8B4513]'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
