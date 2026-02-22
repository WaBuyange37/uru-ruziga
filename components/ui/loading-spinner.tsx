// Simple loading spinner component
import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B4513] mx-auto mb-4" />
        <p className="text-[#8B4513] font-medium">Loading Umwero lessons...</p>
      </div>
    </div>
  )
}