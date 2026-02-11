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
}

export function AudioPlayer({ src, label, autoPlay = false, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (autoPlay && src) {
      playAudio()
    }
  }, [autoPlay, src])

  const playAudio = async () => {
    if (!src) return

    try {
      setIsLoading(true)
      setError(false)

      if (!audioRef.current) {
        audioRef.current = new Audio(src)
        audioRef.current.onended = () => {
          setIsPlaying(false)
        }
        audioRef.current.onerror = () => {
          setError(true)
          setIsLoading(false)
          setIsPlaying(false)
        }
      }

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

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleAudio}
      disabled={isLoading || error}
      className={`${className} ${isPlaying ? 'bg-[#8B4513] text-white' : ''}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : error ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
      )}
      {label && <span className="ml-2">{label}</span>}
    </Button>
  )
}
