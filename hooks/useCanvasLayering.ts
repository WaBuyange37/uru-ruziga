// hooks/useCanvasLayering.ts
// Hook for managing 3-layer canvas system

import { useRef, useEffect, useCallback, useState } from 'react'

interface CanvasLayer {
  canvas: HTMLCanvasElement | null
  context: CanvasRenderingContext2D | null
}

interface UseCanvasLayeringOptions {
  gridColor?: string
  referenceOpacity?: number
  strokeColor?: string
  strokeWidth?: number
}

export function useCanvasLayering(options: UseCanvasLayeringOptions = {}) {
  const {
    gridColor = '#E5E7EB',
    referenceOpacity = 0.15,
    strokeColor = '#8B4513',
    strokeWidth = 3
  } = options

  const gridCanvasRef = useRef<HTMLCanvasElement>(null)
  const referenceCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null)

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize all canvas layers with proper DPR scaling
  const initializeLayers = useCallback(() => {
    const canvases = [
      gridCanvasRef.current,
      referenceCanvasRef.current,
      drawingCanvasRef.current
    ]

    if (canvases.some(c => !c)) return

    const firstCanvas = canvases[0]!
    const rect = firstCanvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const width = rect.width
    const height = rect.height

    setCanvasSize({ width, height })

    canvases.forEach(canvas => {
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set actual size in memory (scaled for DPR)
      canvas.width = width * dpr
      canvas.height = height * dpr

      // Scale context to match DPR
      ctx.scale(dpr, dpr)

      // Set display size
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    })

    setIsInitialized(true)
  }, [])

  // Draw grid on background layer
  const drawGrid = useCallback((gridSize: number = 40) => {
    const canvas = gridCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvasSize

    ctx.clearRect(0, 0, width, height)

    // Background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    // Grid lines
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Center guides (darker)
    ctx.strokeStyle = '#D1D5DB'
    ctx.lineWidth = 2

    // Vertical center
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.stroke()

    // Horizontal center
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }, [canvasSize, gridColor])

  // Draw reference image or character
  const drawReference = useCallback((
    imageUrl?: string,
    character?: string,
    visible: boolean = true
  ) => {
    const canvas = referenceCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvasSize

    ctx.clearRect(0, 0, width, height)

    if (!visible) return

    if (imageUrl) {
      const img = new Image()
      img.onload = () => {
        ctx.globalAlpha = referenceOpacity
        
        // Center and scale image
        const scale = Math.min(width / img.width, height / img.height) * 0.8
        const x = (width - img.width * scale) / 2
        const y = (height - img.height * scale) / 2
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
        ctx.globalAlpha = 1.0
      }
      img.src = imageUrl
    } else if (character) {
      // Fallback: render character using font
      ctx.globalAlpha = referenceOpacity
      ctx.font = `${Math.min(width, height) * 0.6}px Umwero, serif`
      ctx.fillStyle = strokeColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(character, width / 2, height / 2)
      ctx.globalAlpha = 1.0
    }
  }, [canvasSize, referenceOpacity, strokeColor])

  // Clear drawing layer
  const clearDrawing = useCallback(() => {
    const canvas = drawingCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvasSize
    ctx.clearRect(0, 0, width, height)
  }, [canvasSize])

  // Get layer contexts
  const getLayers = useCallback((): {
    grid: CanvasLayer
    reference: CanvasLayer
    drawing: CanvasLayer
  } => {
    return {
      grid: {
        canvas: gridCanvasRef.current,
        context: gridCanvasRef.current?.getContext('2d') || null
      },
      reference: {
        canvas: referenceCanvasRef.current,
        context: referenceCanvasRef.current?.getContext('2d') || null
      },
      drawing: {
        canvas: drawingCanvasRef.current,
        context: drawingCanvasRef.current?.getContext('2d') || null
      }
    }
  }, [])

  // Setup on mount
  useEffect(() => {
    initializeLayers()

    const handleResize = () => {
      initializeLayers()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initializeLayers])

  return {
    gridCanvasRef,
    referenceCanvasRef,
    drawingCanvasRef,
    canvasSize,
    isInitialized,
    drawGrid,
    drawReference,
    clearDrawing,
    getLayers
  }
}
