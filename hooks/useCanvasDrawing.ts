// hooks/useCanvasDrawing.ts
// Custom hook for canvas drawing with touch support

import { useRef, useEffect, useState, useCallback } from 'react'

interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  timestamp: number
}

interface UseCanvasDrawingOptions {
  strokeColor?: string
  strokeWidth?: number
  backgroundColor?: string
  onStrokeComplete?: (stroke: Stroke) => void
}

export function useCanvasDrawing(options: UseCanvasDrawingOptions = {}) {
  const {
    strokeColor = '#8B4513',
    strokeWidth = 3,
    backgroundColor = '#FFFFFF',
    onStrokeComplete,
  } = options

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const currentStroke = useRef<Point[]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // Initialize canvas with proper DPR scaling
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Get display size
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    // Set actual size in memory (scaled for DPR)
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    // Scale context to match DPR
    ctx.scale(dpr, dpr)

    // Set display size
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Set drawing properties
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth

    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, rect.width, rect.height)

    setCanvasSize({ width: rect.width, height: rect.height })

    // Redraw existing strokes
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke.points, rect)
    })
  }, [strokeColor, strokeWidth, backgroundColor, strokes])

  // Setup canvas on mount and resize
  useEffect(() => {
    initializeCanvas()

    const handleResize = () => {
      initializeCanvas()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initializeCanvas])

  // Get point coordinates relative to canvas
  const getCanvasPoint = useCallback((e: PointerEvent | TouchEvent | MouseEvent): Point | null => {
    const canvas = canvasRef.current
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

  // Draw a stroke on the canvas
  const drawStroke = useCallback((
    ctx: CanvasRenderingContext2D,
    points: Point[],
    rect: DOMRect
  ) => {
    if (points.length < 2) return

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }

    ctx.stroke()
  }, [])

  // Start drawing
  const startDrawing = useCallback((e: PointerEvent | TouchEvent | MouseEvent) => {
    e.preventDefault()
    const point = getCanvasPoint(e)
    if (!point) return

    setIsDrawing(true)
    currentStroke.current = [point]

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }, [getCanvasPoint])

  // Continue drawing
  const continueDrawing = useCallback((e: PointerEvent | TouchEvent | MouseEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const point = getCanvasPoint(e)
    if (!point) return

    currentStroke.current.push(point)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.lineTo(point.x, point.y)
    ctx.stroke()
  }, [isDrawing, getCanvasPoint])

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawing) return
    setIsDrawing(false)

    if (currentStroke.current.length > 1) {
      const stroke: Stroke = {
        points: [...currentStroke.current],
        timestamp: Date.now(),
      }
      setStrokes(prev => [...prev, stroke])
      onStrokeComplete?.(stroke)
    }

    currentStroke.current = []
  }, [isDrawing, onStrokeComplete])

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, rect.width, rect.height)

    setStrokes([])
    currentStroke.current = []
  }, [backgroundColor])

  // Undo last stroke
  const undoStroke = useCallback(() => {
    if (strokes.length === 0) return

    const newStrokes = strokes.slice(0, -1)
    setStrokes(newStrokes)

    // Redraw canvas
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, rect.width, rect.height)

    newStrokes.forEach(stroke => {
      drawStroke(ctx, stroke.points, rect)
    })
  }, [strokes, backgroundColor, drawStroke])

  // Get canvas as data URL
  const getCanvasDataURL = useCallback((): string | null => {
    return canvasRef.current?.toDataURL('image/png') || null
  }, [])

  // Setup event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Pointer events (works for mouse, touch, and stylus)
    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault()
      canvas.setPointerCapture(e.pointerId)
      startDrawing(e)
    }

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault()
      continueDrawing(e)
    }

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault()
      canvas.releasePointerCapture(e.pointerId)
      stopDrawing()
    }

    const handlePointerCancel = (e: PointerEvent) => {
      e.preventDefault()
      canvas.releasePointerCapture(e.pointerId)
      stopDrawing()
    }

    // Prevent default touch behavior
    const preventTouch = (e: TouchEvent) => {
      e.preventDefault()
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('pointercancel', handlePointerCancel)
    canvas.addEventListener('pointerleave', stopDrawing)

    // Prevent default touch behavior to avoid scrolling
    canvas.addEventListener('touchstart', preventTouch, { passive: false })
    canvas.addEventListener('touchmove', preventTouch, { passive: false })
    canvas.addEventListener('touchend', preventTouch, { passive: false })

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('pointercancel', handlePointerCancel)
      canvas.removeEventListener('pointerleave', stopDrawing)
      canvas.removeEventListener('touchstart', preventTouch)
      canvas.removeEventListener('touchmove', preventTouch)
      canvas.removeEventListener('touchend', preventTouch)
    }
  }, [startDrawing, continueDrawing, stopDrawing])

  return {
    canvasRef,
    isDrawing,
    strokes,
    canvasSize,
    clearCanvas,
    undoStroke,
    getCanvasDataURL,
  }
}
