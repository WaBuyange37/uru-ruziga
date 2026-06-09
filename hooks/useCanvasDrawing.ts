// hooks/useCanvasDrawing.ts
// Production-grade canvas drawing hook with 60fps performance
// Supports touch, mouse, and stylus input with pressure sensitivity
// Enhanced for OCR dataset collection with comprehensive metadata

import { useRef, useEffect, useState, useCallback } from 'react'

interface Point {
  x: number
  y: number
  timestamp: number
  pressure?: number // Stylus pressure (0-1)
}

interface Stroke {
  points: Point[]
  startTime: number
  endTime: number
}

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

interface NormalizedPoint {
  x: number // 0-1 normalized
  y: number // 0-1 normalized
  timestamp: number
  pressure?: number
}

interface NormalizedStroke {
  points: NormalizedPoint[]
  duration: number
}

interface DeviceInfo {
  userAgent: string
  platform: string
  isMobile: boolean
  isTouch: boolean
  hasStylus: boolean
  screenWidth: number
  screenHeight: number
}

interface DrawingMetadata {
  canvasSize: { width: number; height: number }
  devicePixelRatio: number
  inputMethod: 'mouse' | 'touch' | 'stylus'
  totalDuration: number
  strokeCount: number
  totalPoints: number
  deviceInfo: DeviceInfo
  startTime: number
  endTime: number
}

interface StrokeDataExport {
  strokes: Stroke[]
  metadata: DrawingMetadata
  normalized: {
    strokes: NormalizedStroke[]
    boundingBox: BoundingBox
    centerPoint: Point
  }
  imageDataURL: string
}

interface UseCanvasDrawingOptions {
  strokeColor?: string
  strokeWidth?: number
  backgroundColor?: string
  onStrokeComplete?: (stroke: Stroke) => void
  onDrawingComplete?: (data: StrokeDataExport) => void
  enablePerformanceMonitoring?: boolean
  targetFPS?: number
}

interface PerformanceMetrics {
  fps: number
  frameTime: number
  droppedFrames: number
}

export function useCanvasDrawing(options: UseCanvasDrawingOptions = {}) {
  const {
    strokeColor = '#8B4513',
    strokeWidth = 3,
    backgroundColor = '#FFFFFF',
    onStrokeComplete,
    onDrawingComplete,
    enablePerformanceMonitoring = false,
    targetFPS = 60,
  } = options

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const currentStroke = useRef<Point[]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    droppedFrames: 0,
  })

  // Drawing session tracking
  const drawingStartTime = useRef<number>(0)
  const inputMethod = useRef<'mouse' | 'touch' | 'stylus'>('mouse')

  // Performance monitoring
  const frameCount = useRef(0)
  const lastFrameTime = useRef(performance.now())
  const fpsUpdateInterval = useRef<NodeJS.Timeout | null>(null)
  const animationFrameId = useRef<number | null>(null)
  const pendingPoints = useRef<Point[]>([])
  const isRendering = useRef(false)

  // Performance monitoring setup
  useEffect(() => {
    if (!enablePerformanceMonitoring) return

    fpsUpdateInterval.current = setInterval(() => {
      const now = performance.now()
      const elapsed = now - lastFrameTime.current
      const fps = Math.round((frameCount.current * 1000) / elapsed)
      const avgFrameTime = elapsed / frameCount.current

      setPerformanceMetrics({
        fps,
        frameTime: avgFrameTime,
        droppedFrames: Math.max(0, frameCount.current - Math.floor(elapsed / (1000 / targetFPS))),
      })

      frameCount.current = 0
      lastFrameTime.current = now
    }, 1000)

    return () => {
      if (fpsUpdateInterval.current) {
        clearInterval(fpsUpdateInterval.current)
      }
    }
  }, [enablePerformanceMonitoring, targetFPS])

  // Optimized rendering loop using requestAnimationFrame
  const renderPendingPoints = useCallback(() => {
    if (isRendering.current || pendingPoints.current.length === 0) {
      animationFrameId.current = null
      return
    }

    isRendering.current = true
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    if (ctx && canvas) {
      const points = [...pendingPoints.current]
      pendingPoints.current = []

      // Draw all pending points in one frame
      if (points.length > 1) {
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)

        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y)
        }

        ctx.stroke()
      }

      if (enablePerformanceMonitoring) {
        frameCount.current++
      }
    }

    isRendering.current = false

    // Continue rendering if there are more points
    if (pendingPoints.current.length > 0) {
      animationFrameId.current = requestAnimationFrame(renderPendingPoints)
    } else {
      animationFrameId.current = null
    }
  }, [enablePerformanceMonitoring])

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

  // Get point coordinates relative to canvas with pressure support
  const getCanvasPoint = useCallback((e: PointerEvent | TouchEvent | MouseEvent): Point | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number, pressure = 0.5

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
      pressure = 0.5
      inputMethod.current = 'touch'
    } else if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
      if ('pressure' in e && typeof e.pressure === 'number') {
        pressure = e.pressure
        inputMethod.current = pressure > 0 && pressure < 1 ? 'stylus' : 'mouse'
      }
    } else {
      return null
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      timestamp: performance.now(),
      pressure,
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

    // Track drawing start time
    if (strokes.length === 0) {
      drawingStartTime.current = performance.now()
    }

    setIsDrawing(true)
    currentStroke.current = [point]

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }, [getCanvasPoint, strokes.length])

  // Continue drawing with optimized rendering
  const continueDrawing = useCallback((e: PointerEvent | TouchEvent | MouseEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const point = getCanvasPoint(e)
    if (!point) return

    // Store point immediately to prevent data loss
    currentStroke.current.push(point)

    // Add to pending points for batch rendering
    pendingPoints.current.push(point)

    // Schedule rendering if not already scheduled
    if (!animationFrameId.current) {
      animationFrameId.current = requestAnimationFrame(renderPendingPoints)
    }
  }, [isDrawing, getCanvasPoint, renderPendingPoints])

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawing) return
    setIsDrawing(false)

    // Cancel any pending animation frame
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }

    // Render any remaining pending points
    if (pendingPoints.current.length > 0) {
      renderPendingPoints()
    }

    if (currentStroke.current.length > 1) {
      const stroke: Stroke = {
        points: [...currentStroke.current],
        startTime: currentStroke.current[0].timestamp,
        endTime: currentStroke.current[currentStroke.current.length - 1].timestamp,
      }
      setStrokes(prev => [...prev, stroke])
      onStrokeComplete?.(stroke)
    }

    currentStroke.current = []
    pendingPoints.current = []
  }, [isDrawing, onStrokeComplete, renderPendingPoints])

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
    drawingStartTime.current = 0
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

  // Get device information
  const getDeviceInfo = useCallback((): DeviceInfo => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasStylus: inputMethod.current === 'stylus',
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    }
  }, [])

  // Calculate bounding box of all strokes
  const calculateBoundingBox = useCallback((allStrokes: Stroke[]): BoundingBox => {
    if (allStrokes.length === 0) {
      return { x: 0, y: 0, width: canvasSize.width, height: canvasSize.height }
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    allStrokes.forEach(stroke => {
      stroke.points.forEach(point => {
        minX = Math.min(minX, point.x)
        minY = Math.min(minY, point.y)
        maxX = Math.max(maxX, point.x)
        maxY = Math.max(maxY, point.y)
      })
    })

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }, [canvasSize])

  // Normalize strokes to 0-1 range
  const normalizeStrokes = useCallback((allStrokes: Stroke[], bbox: BoundingBox): NormalizedStroke[] => {
    return allStrokes.map(stroke => ({
      points: stroke.points.map(point => ({
        x: bbox.width > 0 ? (point.x - bbox.x) / bbox.width : 0.5,
        y: bbox.height > 0 ? (point.y - bbox.y) / bbox.height : 0.5,
        timestamp: point.timestamp,
        pressure: point.pressure,
      })),
      duration: stroke.endTime - stroke.startTime,
    }))
  }, [])

  // Export complete drawing data for OCR dataset
  const exportDrawingData = useCallback((): StrokeDataExport | null => {
    if (strokes.length === 0) return null

    const imageDataURL = getCanvasDataURL()
    if (!imageDataURL) return null

    const bbox = calculateBoundingBox(strokes)
    const normalizedStrokes = normalizeStrokes(strokes, bbox)
    
    const totalPoints = strokes.reduce((sum, stroke) => sum + stroke.points.length, 0)
    const endTime = performance.now()
    const totalDuration = drawingStartTime.current > 0 ? endTime - drawingStartTime.current : 0

    const metadata: DrawingMetadata = {
      canvasSize,
      devicePixelRatio: window.devicePixelRatio || 1,
      inputMethod: inputMethod.current,
      totalDuration,
      strokeCount: strokes.length,
      totalPoints,
      deviceInfo: getDeviceInfo(),
      startTime: drawingStartTime.current,
      endTime,
    }

    const exportData: StrokeDataExport = {
      strokes,
      metadata,
      normalized: {
        strokes: normalizedStrokes,
        boundingBox: bbox,
        centerPoint: {
          x: bbox.x + bbox.width / 2,
          y: bbox.y + bbox.height / 2,
          timestamp: endTime,
        },
      },
      imageDataURL,
    }

    return exportData
  }, [strokes, canvasSize, getCanvasDataURL, calculateBoundingBox, normalizeStrokes, getDeviceInfo])

  // Replay strokes with animation
  const replayStrokes = useCallback(async (speed: number = 1) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas || strokes.length === 0) return

    // Clear canvas
    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Replay each stroke
    for (const stroke of strokes) {
      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

      for (let i = 1; i < stroke.points.length; i++) {
        const prevPoint = stroke.points[i - 1]
        const currPoint = stroke.points[i]
        const delay = (currPoint.timestamp - prevPoint.timestamp) / speed

        await new Promise(resolve => setTimeout(resolve, delay))
        
        ctx.lineTo(currPoint.x, currPoint.y)
        ctx.stroke()
      }
    }
  }, [strokes, backgroundColor])

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
    undoLastStroke: undoStroke,
    getCanvasDataURL,
    performanceMetrics,
    exportDrawingData,
    replayStrokes,
  }
}

// Export types for use in other components
export type {
  Point,
  Stroke,
  BoundingBox,
  NormalizedPoint,
  NormalizedStroke,
  DeviceInfo,
  DrawingMetadata,
  StrokeDataExport,
  UseCanvasDrawingOptions,
  PerformanceMetrics,
}
