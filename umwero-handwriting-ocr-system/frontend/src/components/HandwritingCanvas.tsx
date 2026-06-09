"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  timestamp: number;
}

interface CanvasProps {
  width?: number;
  height?: number;
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
  onDrawingChange?: (hasDrawing: boolean) => void;
  onExport?: (imageData: string) => void;
}

interface EvaluationRequest {
  character: string;
  image: string; // base64 data URL
  sessionId?: string;
  userId?: string;
}

export const HandwritingCanvas: React.FC<CanvasProps> = ({
  width = 400,
  height = 400,
  strokeWidth = 3,
  strokeColor = '#000000',
  backgroundColor = '#ffffff',
  onDrawingChange,
  onExport
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);

  // Initialize canvas and handle high-DPI displays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    setDevicePixelRatio(dpr);

    // Set actual canvas size
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Scale canvas back down using CSS
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale the drawing context so everything draws at the correct size
    ctx.scale(dpr, dpr);

    // Set canvas properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    // Clear canvas with background color
    clearCanvas();
  }, [width, height, strokeWidth, strokeColor, backgroundColor]);

  // Clear canvas and reset state
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Reset state
    setStrokes([]);
    setCurrentStroke([]);
    setHasDrawing(false);
    onDrawingChange?.(false);
  }, [width, height, backgroundColor, onDrawingChange]);

  // Undo last stroke
  const undoLastStroke = useCallback(() => {
    if (strokes.length === 0) return;

    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);

    // Redraw canvas
    redrawCanvas(newStrokes);

    const hasContent = newStrokes.length > 0;
    setHasDrawing(hasContent);
    onDrawingChange?.(hasContent);
  }, [strokes, onDrawingChange]);

  // Redraw all strokes on canvas
  const redrawCanvas = useCallback((strokesToRender: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Redraw all strokes
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    strokesToRender.forEach(stroke => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      // Use quadratic curves for smooth lines
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const currentPoint = stroke.points[i];
        const nextPoint = stroke.points[i + 1];
        const controlX = (currentPoint.x + nextPoint.x) / 2;
        const controlY = (currentPoint.y + nextPoint.y) / 2;
        ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
      }

      // Draw to the last point
      const lastPoint = stroke.points[stroke.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
      ctx.stroke();
    });
  }, [width, height, backgroundColor, strokeColor, strokeWidth]);

  // Get point coordinates from event (handles both mouse and touch)
  const getPointFromEvent = useCallback((event: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    let clientX: number, clientY: number;

    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0] || event.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  // Start drawing
  const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    
    const point = getPointFromEvent(event);
    setIsDrawing(true);
    setCurrentStroke([point]);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, [getPointFromEvent]);

  // Continue drawing
  const continueDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    event.preventDefault();
    
    const point = getPointFromEvent(event);
    const newStroke = [...currentStroke, point];
    setCurrentStroke(newStroke);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw smooth line to new point
    if (newStroke.length >= 2) {
      const prevPoint = newStroke[newStroke.length - 2];
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }
  }, [isDrawing, currentStroke, getPointFromEvent]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (currentStroke.length > 0) {
      const newStroke: Stroke = {
        points: currentStroke,
        timestamp: Date.now()
      };

      const newStrokes = [...strokes, newStroke];
      setStrokes(newStrokes);
      setCurrentStroke([]);
      setHasDrawing(true);
      onDrawingChange?.(true);
    }
  }, [isDrawing, currentStroke, strokes, onDrawingChange]);

  // Export canvas to base64 PNG
  const exportToImage = useCallback((): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';

    // Create a new canvas for export at standard resolution
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 256; // Standard size for evaluation
    exportCanvas.height = 256;
    
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return '';

    // Set white background
    exportCtx.fillStyle = '#ffffff';
    exportCtx.fillRect(0, 0, 256, 256);

    // Draw the original canvas scaled to 256x256
    exportCtx.drawImage(canvas, 0, 0, 256, 256);

    // Convert to base64 PNG
    return exportCanvas.toDataURL('image/png');
  }, []);

  // Handle export button click
  const handleExport = useCallback(() => {
    const imageData = exportToImage();
    onExport?.(imageData);
  }, [exportToImage, onExport]);

  // Prevent scrolling on touch devices
  const preventScroll = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div className="handwriting-canvas-container">
      <canvas
        ref={canvasRef}
        className="handwriting-canvas"
        style={{
          border: '2px solid #ccc',
          borderRadius: '8px',
          cursor: 'crosshair',
          touchAction: 'none' // Prevent scrolling on touch
        }}
        // Mouse events
        onMouseDown={startDrawing}
        onMouseMove={continueDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        // Touch events
        onTouchStart={startDrawing}
        onTouchMove={continueDrawing}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
        // Prevent context menu
        onContextMenu={(e) => e.preventDefault()}
      />
      
      <div className="canvas-controls" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button
          onClick={clearCanvas}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
        
        <button
          onClick={undoLastStroke}
          disabled={strokes.length === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: strokes.length === 0 ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: strokes.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Undo
        </button>
        
        <button
          onClick={handleExport}
          disabled={!hasDrawing}
          style={{
            padding: '8px 16px',
            backgroundColor: !hasDrawing ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !hasDrawing ? 'not-allowed' : 'pointer'
          }}
        >
          Export
        </button>
      </div>

      <div className="canvas-info" style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        Strokes: {strokes.length} | 
        Drawing: {isDrawing ? 'Yes' : 'No'} | 
        Has Content: {hasDrawing ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

// Utility function to create evaluation request
export const createEvaluationRequest = (
  character: string,
  imageData: string,
  sessionId?: string,
  userId?: string
): EvaluationRequest => {
  return {
    character,
    image: imageData,
    sessionId,
    userId
  };
};

export default HandwritingCanvas;