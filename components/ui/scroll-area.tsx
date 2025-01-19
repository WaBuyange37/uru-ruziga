import React, { ReactNode } from 'react'
import { cn } from "../../lib/utils"

interface ScrollAreaProps {
  className?: string
  children: ReactNode
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ className, children }) => {
  return (
    <div className={cn("scroll-area-container", className)}>
      <div className="scroll-area-viewport">
        {children}
      </div>
    </div>
  )
}

export const ScrollBar: React.FC = () => {
  return null // We don't need a separate scrollbar component for this implementation
}

