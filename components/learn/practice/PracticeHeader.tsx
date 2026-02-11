// components/learn/practice/PracticeHeader.tsx
"use client"

import { ArrowLeft, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface PracticeHeaderProps {
  title: string
  currentStep: number
  totalSteps: number
  onBack: () => void
  onInfo?: () => void
}

export function PracticeHeader({
  title,
  currentStep,
  totalSteps,
  onBack,
  onInfo
}: PracticeHeaderProps) {
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-[#8B4513] hover:bg-[#F3E5AB] -ml-2"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </Button>

        <h2 className="text-lg font-semibold text-[#8B4513] text-center flex-1">
          {title}
        </h2>

        {onInfo && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onInfo}
            className="text-[#8B4513] hover:bg-[#F3E5AB] -mr-2"
          >
            <Info className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#D2691E]">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-[#8B4513] font-medium">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </div>
  )
}
