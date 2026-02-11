// components/learn/practice/PracticeControls.tsx
"use client"

import { Button } from '@/components/ui/button'
import { Undo, Trash2, Eye, EyeOff } from 'lucide-react'

interface PracticeControlsProps {
  onUndo: () => void
  onClear: () => void
  onToggleGuide: () => void
  showGuide: boolean
  canUndo: boolean
  disabled?: boolean
}

export function PracticeControls({
  onUndo,
  onClear,
  onToggleGuide,
  showGuide,
  canUndo,
  disabled = false
}: PracticeControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <Button
        variant="outline"
        size="lg"
        onClick={onUndo}
        disabled={!canUndo || disabled}
        className="flex-1 max-w-[140px] gap-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] disabled:opacity-50"
      >
        <Undo className="h-5 w-5" />
        Undo
      </Button>

      <Button
        variant="outline"
        size="lg"
        onClick={onClear}
        disabled={disabled}
        className="flex-1 max-w-[140px] gap-2 border-[#D2691E] text-[#D2691E] hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="h-5 w-5" />
        Clear
      </Button>

      <Button
        variant="outline"
        size="lg"
        onClick={onToggleGuide}
        disabled={disabled}
        className="flex-1 max-w-[140px] gap-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] disabled:opacity-50"
      >
        {showGuide ? (
          <>
            <EyeOff className="h-5 w-5" />
            Hide
          </>
        ) : (
          <>
            <Eye className="h-5 w-5" />
            Show
          </>
        )}
      </Button>
    </div>
  )
}
