// components/lessons/steps/PracticeCanvasStep.tsx
// Step 4: Practice Canvas - Interactive drawing with real-time feedback

"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Undo2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Grid3x3, 
  Lightbulb,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { StepComponentProps } from '@/types/lesson';

interface ExtendedStepProps extends StepComponentProps {
  translation?: any;
  lessonTranslation?: any;
}

export function PracticeCanvasStep({ 
  step, 
  lesson, 
  languageCode = 'en',
  translation,
  lessonTranslation,
  onComplete,
  onNext,
  onPrevious
}: ExtendedStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [currentStroke, setCurrentStroke] = useState<{points: {x: number, y: number}[]}>({points: []});
  const [realTimeScore, setRealTimeScore] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  
  const config = step.config as any;
  const character = lesson.character;
  
  if (!character) {
    return <div>Character not found</div>;
  }

  const guidanceLevel = config.guidanceLevel || 'full';
  const gridVisible = config.gridVisible !== false;
  const traceOpacity = config.traceOpacity || 0.3;
  const realTimeFeedback = config.realTimeFeedback !== false;
  const tools = config.tools || { undo: true, clear: true, guideToggle: true };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;

    // Clear and setup
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (showGrid && gridVisible) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Draw guide overlay if enabled
    if (showGuide && guidanceLevel !== 'none') {
      drawGuideOverlay(ctx);
    }
  }, [showGuide, showGrid, guidanceLevel, gridVisible]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    
    // Draw center lines
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw grid divisions
    const gridSize = 50;
    ctx.beginPath();
    for (let x = gridSize; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = gridSize; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  };

  const drawGuideOverlay = (ctx: CanvasRenderingContext2D) => {
    if (!character?.strokeData || character.strokeData.length === 0) return;

    ctx.save();
    ctx.globalAlpha = traceOpacity;
    ctx.strokeStyle = '#5e2f17';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([5, 5]);

    // Draw each stroke as a guide
    character.strokeData.forEach(stroke => {
      const path = new Path2D(stroke.pathData);
      ctx.stroke(path);
    });

    ctx.restore();
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setHasDrawn(true);
    setCurrentStroke({ points: [coords] });

    // Save current state for undo
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setStrokeHistory(prev => [...prev, imageData]);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    
    // Add point to current stroke
    setCurrentStroke(prev => ({
      points: [...prev.points, coords]
    }));

    // Draw line segment
    ctx.strokeStyle = '#5e2f17';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);

    const lastPoint = currentStroke.points[currentStroke.points.length - 1];
    if (lastPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }

    // Real-time feedback
    if (realTimeFeedback) {
      updateRealTimeFeedback();
    }
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.points.length > 1) {
      // Stroke completed
      if (realTimeFeedback) {
        analyzeStroke();
      }
    }
    setIsDrawing(false);
    setCurrentStroke({ points: [] });
  };

  const undo = () => {
    if (strokeHistory.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Restore previous state
    const previousState = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    
    setStrokeHistory(prev => prev.slice(0, -1));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showGrid && gridVisible) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    if (showGuide && guidanceLevel !== 'none') {
      drawGuideOverlay(ctx);
    }

    setStrokeHistory([]);
    setRealTimeScore(0);
    setFeedback([]);
    setHasDrawn(false);
  };

  const updateRealTimeFeedback = useCallback(() => {
    // Simple real-time scoring based on canvas coverage
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let drawnPixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      // Check if pixel is not white (has been drawn on)
      if (pixels[i] !== 255 || pixels[i + 1] !== 255 || pixels[i + 2] !== 255) {
        drawnPixels++;
      }
    }

    const coverage = (drawnPixels / (canvas.width * canvas.height)) * 100;
    const score = Math.min(Math.round(coverage * 2), 100); // Rough scoring
    
    setRealTimeScore(score);

    // Generate feedback
    const newFeedback = [];
    if (score < 20) {
      newFeedback.push('Keep drawing! You\'re just getting started.');
    } else if (score < 40) {
      newFeedback.push('Good progress! Try to fill in more of the character.');
    } else if (score < 60) {
      newFeedback.push('Nice work! Focus on the stroke directions.');
    } else if (score < 80) {
      newFeedback.push('Great job! Your strokes are looking good.');
    } else {
      newFeedback.push('Excellent! You\'re very close to the target.');
    }

    setFeedback(newFeedback);
  }, [showGuide, guidanceLevel]);

  const analyzeStroke = () => {
    // More sophisticated stroke analysis would go here
    // For now, we'll use the real-time feedback
    updateRealTimeFeedback();
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Getting There';
    return 'Keep Practicing';
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    let drawingData = '';
    
    if (canvas) {
      drawingData = canvas.toDataURL('image/png');
    }

    onComplete?.({
      stepId: step.id,
      completed: true,
      drawingData,
      score: realTimeScore,
      isCorrect: realTimeScore >= (step.passingScore || 70),
    });
    onNext?.();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {translation?.title || 'Practice Drawing'}
        </h1>
        
        <p className="text-gray-600 max-w-lg mx-auto">
          {translation?.instructions || 'Draw the character on the canvas. Use the guide overlay if you need help.'}
        </p>
      </div>

      {/* Character Reference */}
      <Card className="text-center p-4 bg-gray-50">
        <CardContent className="flex items-center justify-center gap-4">
          <div className="text-4xl font-umwero text-primary">
            {character.umweroGlyph}
          </div>
          <div className="text-left">
            <div className="font-semibold">{character.latinEquivalent.toUpperCase()}</div>
            <div className="text-sm text-gray-600">Practice Mode</div>
          </div>
        </CardContent>
      </Card>

      {/* Main Practice Area */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Drawing Canvas</span>
            <div className="flex items-center gap-2">
              {realTimeFeedback && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Accuracy:</span>
                  <span className={`font-bold ${getScoreColor(realTimeScore)}`}>
                    {realTimeScore}%
                  </span>
                  <Badge variant={realTimeScore >= 70 ? "default" : "secondary"}>
                    {getScoreLabel(realTimeScore)}
                  </Badge>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Canvas */}
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="border-2 border-gray-300 rounded-lg cursor-crosshair shadow-inner"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              
              {/* Real-time feedback overlay */}
              {realTimeFeedback && feedback.length > 0 && (
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded-lg shadow-md max-w-xs">
                  <div className="flex items-center gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span>{feedback[0]}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {realTimeFeedback && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{realTimeScore}%</span>
              </div>
              <Progress value={realTimeScore} className="h-2" />
            </div>
          )}

          {/* Tools */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {tools.undo && (
              <Button
                variant="outline"
                onClick={undo}
                disabled={strokeHistory.length === 0}
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Undo
              </Button>
            )}
            
            {tools.clear && (
              <Button
                variant="outline"
                onClick={clear}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
            
            {tools.guideToggle && (
              <Button
                variant="outline"
                onClick={() => setShowGuide(!showGuide)}
              >
                {showGuide ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showGuide ? 'Hide Guide' : 'Show Guide'}
              </Button>
            )}
            
            {gridVisible && (
              <Button
                variant="outline"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                {showGrid ? 'Hide Grid' : 'Show Grid'}
              </Button>
            )}
          </div>

          {/* Status Messages */}
          <div className="flex items-center justify-center gap-4 text-sm">
            {hasDrawn && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Drawing detected</span>
              </div>
            )}
            
            {guidanceLevel === 'full' && showGuide && (
              <div className="flex items-center gap-2 text-blue-600">
                <AlertCircle className="h-4 w-4" />
                <span>Guide overlay active</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      {translation?.tips && translation.tips.length > 0 && (
        <Card className="p-4 bg-purple-50 border-purple-200">
          <CardContent className="space-y-2">
            <div className="font-semibold text-purple-800 mb-2">🎨 Drawing Tips:</div>
            {translation.tips.map((tip: string, index: number) => (
              <div key={index} className="text-purple-700 text-sm">
                • {tip}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button 
          variant="outline"
          onClick={onPrevious}
          className="px-6"
        >
          ← Previous
        </Button>
        
        <Button 
          onClick={handleComplete}
          size="lg"
          className="px-8 py-3"
          disabled={!hasDrawn || realTimeScore < (step.passingScore || 70)}
        >
          {realTimeScore >= (step.passingScore || 70) ? 'Continue to Review' : `Need ${step.passingScore || 70}% to continue`}
        </Button>
      </div>
    </div>
  );
}
