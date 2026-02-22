// components/learn/AudioPlayer.tsx
"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX, Loader2 } from 'lucide-react'

interface AudioPlayerProps {
  src: string
  label?: string
  autoPlay?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

export function AudioPlayer({ 
  src, 
  label, 
  autoPlay = false, 
  className = '',
  size = 'sm',
  variant = 'outline'
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (autoPlay && src) {
      playAudio()
    }
  }, [autoPlay, src])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const playAudio = async () => {
    if (!src) {
      setError(true)
      return
    }

    try {
      setIsLoading(true)
      setError(false)

      // Create new audio instance if needed
      if (!audioRef.current) {
        audioRef.current = new Audio()
        audioRef.current.preload = 'auto'
        
        audioRef.current.onended = () => {
          setIsPlaying(false)
        }
        
        audioRef.current.onerror = (e) => {
          console.error('Audio error:', e)
          setError(true)
          setIsLoading(false)
          setIsPlaying(false)
        }

        audioRef.current.oncanplaythrough = () => {
          setIsLoading(false)
        }
      }

      // Set source if different
      if (audioRef.current.src !== src) {
        audioRef.current.src = src
      }

      // Reset to beginning
      audioRef.current.currentTime = 0
      
      // Play audio
      await audioRef.current.play()
      setIsPlaying(true)
      setIsLoading(false)
    } catch (err) {
      console.error('Audio playback error:', err)
      setError(true)
      setIsLoading(false)
      setIsPlaying(false)
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio()
    } else {
      playAudio()
    }
  }

  const buttonSizes = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-6'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  }

  return (
    <Button
      variant={variant}
      onClick={toggleAudio}
      disabled={isLoading || error || !src}
      className={`
        ${buttonSizes[size]} 
        ${className} 
        ${isPlaying ? 'bg-[#8B4513] text-white border-[#8B4513] hover:bg-[#A0522D]' : ''}
        ${error ? 'opacity-50 cursor-not-allowed' : ''}
        transition-all duration-200
      `}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : error ? (
        <VolumeX className={`${iconSizes[size]} text-red-500`} />
      ) : (
        <Volume2 className={`${iconSizes[size]} ${isPlaying ? 'animate-pulse' : ''}`} />
      )}
      {label && <span className="ml-2 font-medium">{label}</span>}
    </Button>
  )
}
