// components/learn/practice/PracticeCanvas.tsx
"use client"

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { AccuracyBadge } from './AccuracyBadge'
import type { ValidationResult } from '@/types/stroke-validation'

interface PracticeCanvasProps {
  character: string
  referenceImageUrl?: string
  showGuide: boolean
  onStrokeComplete?: (strokes: any[]) => void
  validationResult?: ValidationResult | null
  disabled?: boolean
}

export function PracticeCanvas({
  character,
  referenceImageUrl,
  showGuide,
  onStrokeComplete,
  validationResult,
  disabled = false
}: PracticeCanvasProps) {
  // Canvas refs for 3-layer system
  const gridCanvasRef = useRef<HTMLCanvasElement>(null)
  const referenceCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [strokes, setStrokes] = useState<any[]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const currentStroke = useRef<any[]>([])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  // Initialize canvases with proper DPR scaling
  const initializeCanvases = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const width = rect.width
    const height = rect.height

    setCanvasSize({ width, height })

    // Setup all three canvases
    const canvases = [gridCanvasRef, referenceCanvasRef, drawingCanvasRef]
    
    canvases.forEach(canvasRef => {
      const canvas = canvasRef.current
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

    // Draw grid on background layer
    drawGrid()

    // Draw reference character
    drawReference()

    // Redraw existing strokes
    redrawStrokes()
  }, [showGuide])

  // Draw grid pattern
  const drawGrid = useCallback(() => {
    const canvas = gridCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvasSize
    if (width === 0 || height === 0) return

    ctx.clearRect(0, 0, width, height)

    // Background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    // Grid lines
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1

    const gridSize = 40

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
  }, [canvasSize])

  // Draw reference character
  const drawReference = useCallback(() => {
    const canvas = referenceCanvasRef.current
    if (!canvas || !showGuide) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvasSize
    if (width === 0 || height === 0) return

    ctx.clearRect(0, 0, width, height)

    if (referenceImageUrl && !useFallback) {
      // Try to load and draw image
      const img = new Image()
      img.onload = () => {
        ctx.globalAlpha = 0.15 // Low opacity for tracing
        
        // Center and scale image
        const scale = Math.min(width / img.width, height / img.height) * 0.8
        const x = (width - img.width * scale) / 2
        const y = (height - img.height * scale) / 2
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
        ctx.globalAlpha = 1.0
        setImageLoaded(true)
      }
      img.onerror = () => {
        setUseFallback(true)
      }
      img.src = referenceImageUrl
    } else {
      // Fallback: render character using Umwero font
      ctx.globalAlpha = 0.15
      ctx.font = `${Math.min(width, height) * 0.6}px Umwero, serif`
      ctx.fillStyle = '#8B4513'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(character, width / 2, height / 2)
      ctx.globalAlpha = 1.0
      setImageLoaded(true)
    }
  }, [character, referenceImageUrl, showGuide, useFallback, canvasSize])

  // Redraw all strokes
  const redrawStrokes = useCallback(() => {
    const canvas = drawingCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvasSize
    ctx.clearRect(0, 0, width, height)

    // Set drawing properties
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 3

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return

      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      }

      ctx.stroke()
    })
  }, [strokes, canvasSize])

  // Get point coordinates relative to canvas
  const getCanvasPoint = useCallback((e: PointerEvent | TouchEvent | MouseEvent) => {
    const canvas = drawingCanvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
    } else {
      return null
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }, [])

  // Drawing handlers
  const startDrawing = useCallback((e: any) => {
    if (disabled) return
    e.preventDefault()
    
    const point = getCanvasPoint(e)
    if (!point) return

    setIsDrawing(true)
    currentStroke.current = [point]

    const canvas = drawingCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }, [disabled, getCanvasPoint])

  const continueDrawing = useCallback((e: any) => {
    if (!isDrawing || disabled) return
    e.preventDefault()

    const point = getCanvasPoint(e)
    if (!point) return

    currentStroke.current.push(point)

    const canvas = drawingCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.lineTo(point.x, point.y)
    ctx.stroke()
  }, [isDrawing, disabled, getCanvasPoint])

  const stopDrawing = useCallback(() => {
    if (!isDrawing || disabled) return
    setIsDrawing(false)

    if (currentStroke.current.length > 1) {
      const stroke = {
        points: [...currentStroke.current],
        timestamp: Date.now(),
      }
      const newStrokes = [...strokes, stroke]
      setStrokes(newStrokes)
      onStrokeComplete?.(newStrokes)
    }

    currentStroke.current = []
  }, [isDrawing, disabled, strokes, onStrokeComplete])

  // Setup event listeners
  useEffect(() => {
    const canvas = drawingCanvasRef.current
    if (!canvas) return

    canvas.addEventListener('pointerdown', startDrawing)
    canvas.addEventListener('pointermove', continueDrawing)
    canvas.addEventListener('pointerup', stopDrawing)
    canvas.addEventListener('pointerleave', stopDrawing)
    canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false })
    canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false })

    return () => {
      canvas.removeEventListener('pointerdown', startDrawing)
      canvas.removeEventListener('pointermove', continueDrawing)
      canvas.removeEventListener('pointerup', stopDrawing)
      canvas.removeEventListener('pointerleave', stopDrawing)
    }
  }, [startDrawing, continueDrawing, stopDrawing])

  // Initialize on mount and resize
  useEffect(() => {
    initializeCanvases()

    const handleResize = () => {
      initializeCanvases()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initializeCanvases])

  // Redraw when guide visibility changes
  useEffect(() => {
    drawReference()
  }, [showGuide, drawReference])

  // Expose clear and undo methods
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).clearCanvas = () => {
        setStrokes([])
        redrawStrokes()
      }
      ;(containerRef.current as any).undoStroke = () => {
        if (strokes.length > 0) {
          const newStrokes = strokes.slice(0, -1)
          setStrokes(newStrokes)
          setTimeout(() => redrawStrokes(), 0)
        }
      }
      ;(containerRef.current as any).getStrokes = () => strokes
    }
  }, [strokes, redrawStrokes])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <div
        ref={containerRef}
        className="relative w-full aspect-square max-w-2xl mx-auto rounded-lg overflow-hidden shadow-2xl border-4 border-[#8B4513]"
        style={{ touchAction: 'none' }}
      >
        {/* Layer 1: Grid background */}
        <canvas
          ref={gridCanvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
        />

        {/* Layer 2: Reference character */}
        <canvas
          ref={referenceCanvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 2, pointerEvents: 'none' }}
        />

        {/* Layer 3: User drawing */}
        <canvas
          ref={drawingCanvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ zIndex: 3 }}
        />

        {/* Accuracy badge overlay */}
        <AccuracyBadge result={validationResult} show={!!validationResult} />
      </div>
    </motion.div>
  )
}

// Export ref methods type
export interface PracticeCanvasRef {
  clearCanvas: () => void
  undoStroke: () => void
  getStrokes: () => any[]
}
