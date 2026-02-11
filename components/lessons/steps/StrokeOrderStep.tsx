// components/lessons/steps/StrokeOrderStep.tsx
// Step 3: Stroke Order - Learn to write the character

"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';
import type { StepComponentProps } from '@/types/lesson';

interface ExtendedStepProps extends StepComponentProps {
  translation?: any;
  lessonTranslation?: any;
}

export function StrokeOrderStep({ 
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  
  const config = step.config as any;
  const character = lesson.character;
  
  if (!character) {
    return <div>Character not found</div>;
  }

  const strokeData = character.strokeData || [];
  const speed = config.animationSpeed || 'normal';
  const showDirectionArrows = config.showDirectionArrows !== false;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);
    
    // Draw character outline
    drawCharacterOutline(ctx, character.umweroGlyph);
  }, [character]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    
    // Draw center lines
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const drawCharacterOutline = (ctx: CanvasRenderingContext2D, glyph: string) => {
    ctx.font = '120px serif';
    ctx.fillStyle = '#f0f0f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, 200, 200);
  };

  const animateStroke = async (strokeIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stroke = strokeData[strokeIndex];
    if (!stroke) return;

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    
    // Animate stroke
    ctx.strokeStyle = '#5e2f17';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Simple path animation (would be more sophisticated in production)
    const path = new Path2D(stroke.pathData);
    ctx.stroke(path);

    // Draw direction arrow if enabled
    if (showDirectionArrows) {
      drawDirectionArrow(ctx, stroke);
    }
  };

  const drawDirectionArrow = (ctx: CanvasRenderingContext2D, stroke: any) => {
    // Simple arrow implementation
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(150, 150, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  const playAnimation = async () => {
    setIsPlaying(true);
    for (let i = 0; i < strokeData.length; i++) {
      setCurrentStroke(i);
      await animateStroke(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setIsPlaying(false);
    setCurrentStroke(0);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentStroke(0);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx, canvas.width, canvas.height);
        drawCharacterOutline(ctx, character.umweroGlyph);
      }
    }
  };

  const handleComplete = () => {
    onComplete?.({
      stepId: step.id,
      completed: true,
      timeSpent: 0,
    });
    onNext?.();
  };

  const getSpeedMultiplier = () => {
    switch (animationSpeed) {
      case 'slow': return 2;
      case 'fast': return 0.5;
      default: return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {translation?.title || 'Learn to Write'}
        </h1>
        
        <p className="text-gray-600 max-w-lg mx-auto">
          {translation?.instructions || 'Watch the animation carefully. Practice the stroke order in the correct sequence.'}
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
            <div className="text-sm text-gray-600">Stroke Order Practice</div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Stroke Animation</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Stroke {currentStroke + 1} of {strokeData.length}
              </Badge>
              {strokeData.length > 0 && (
                <Badge variant={currentStroke < strokeData.length ? "default" : "secondary"}>
                  {currentStroke < strokeData.length ? 'Playing' : 'Complete'}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Canvas */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="border-2 border-gray-300 rounded-lg bg-white"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button
              onClick={playAnimation}
              disabled={isPlaying || strokeData.length === 0}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isPlaying ? 'Playing...' : 'Play Animation'}
            </Button>
            
            <Button
              variant="outline"
              onClick={resetAnimation}
              disabled={isPlaying}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <Button
              variant="outline"
              onClick={() => setCurrentStroke(Math.max(0, currentStroke - 1))}
              disabled={isPlaying || currentStroke === 0}
            >
              <SkipBack className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              variant="outline"
              onClick={() => setCurrentStroke(Math.min(strokeData.length - 1, currentStroke + 1))}
              disabled={isPlaying || currentStroke >= strokeData.length - 1}
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Next
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-medium">Speed:</span>
            <Button
              variant={animationSpeed === 'slow' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnimationSpeed('slow')}
              disabled={isPlaying}
            >
              Slow
            </Button>
            <Button
              variant={animationSpeed === 'normal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnimationSpeed('normal')}
              disabled={isPlaying}
            >
              Normal
            </Button>
            <Button
              variant={animationSpeed === 'fast' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnimationSpeed('fast')}
              disabled={isPlaying}
            >
              Fast
            </Button>
          </div>

          {/* Stroke Info */}
          {strokeData.length > 0 && currentStroke < strokeData.length && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700">
                <div className="font-semibold mb-1">Stroke {currentStroke + 1}:</div>
                <div>{strokeData[currentStroke]?.hint || 'Follow the guide'}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
        >
          Continue to Practice
        </Button>
      </div>
    </div>
  );
}
