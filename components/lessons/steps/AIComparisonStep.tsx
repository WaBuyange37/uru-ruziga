// components/lessons/steps/AIComparisonStep.tsx
// Step 5: AI Comparison - Review and improve your drawing

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  EyeOff, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';
import type { StepComponentProps, EvaluationResult, DrawingMetrics } from '@/types/lesson';

interface ExtendedStepProps extends StepComponentProps {
  translation?: any;
  lessonTranslation?: any;
}

export function AIComparisonStep({ 
  step, 
  lesson, 
  languageCode = 'en',
  translation,
  lessonTranslation,
  onComplete,
  onNext,
  onPrevious,
  progress
}: ExtendedStepProps) {
  const [userDrawing, setUserDrawing] = useState<string>('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  const [showSideBySide, setShowSideBySide] = useState(true);
  
  const config = step.config as any;
  const character = lesson.character;
  
  if (!character) {
    return <div>Character not found</div>;
  }

  // Get user drawing from previous step progress
  useEffect(() => {
    if (progress?.attempts) {
      const practiceAttempt = Array.from(progress.attempts.values())
        .find(attempt => attempt.stepId.includes('PRACTICE_CANVAS'));
      
      if (practiceAttempt?.drawingData) {
        setUserDrawing(practiceAttempt.drawingData);
        analyzeDrawing(practiceAttempt.drawingData);
      }
    }
  }, [progress]);

  useEffect(() => {
    setShowSideBySide(config.showSideBySide !== false);
    setShowMetrics(config.showMetrics !== false);
  }, [config]);

  const analyzeDrawing = async (drawingData: string) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI evaluation - in production, this would call an actual AI service
      const result = await evaluateDrawingAI(drawingData, character);
      setEvaluation(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback evaluation
      setEvaluation(generateFallbackEvaluation());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const evaluateDrawingAI = async (drawingData: string, character: any): Promise<EvaluationResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI evaluation - in production, this would be actual AI analysis
    const mockMetrics: DrawingMetrics = {
      pixelCoverage: 65 + Math.random() * 30,
      strokeCount: character.strokeCount + Math.floor(Math.random() * 3) - 1,
      expectedStrokeCount: character.strokeCount,
      centeringScore: 60 + Math.random() * 35,
      symmetryScore: 50 + Math.random() * 45,
      strokeQuality: 70 + Math.random() * 25,
    };

    const score = Math.round(
      mockMetrics.pixelCoverage * 0.35 +
      (mockMetrics.strokeCount === mockMetrics.expectedStrokeCount ? 100 : 60) * 0.25 +
      mockMetrics.centeringScore * 0.20 +
      mockMetrics.symmetryScore * 0.10 +
      mockMetrics.strokeQuality * 0.10
    );

    const feedback = generateFeedback(score, mockMetrics, character);

    return {
      score,
      metrics: mockMetrics,
      feedback,
    };
  };

  const generateFallbackEvaluation = (): EvaluationResult => {
    const mockMetrics: DrawingMetrics = {
      pixelCoverage: 75,
      strokeCount: 2,
      expectedStrokeCount: 2,
      centeringScore: 80,
      symmetryScore: 70,
      strokeQuality: 75,
    };

    return {
      score: 78,
      metrics: mockMetrics,
      feedback: [
        'Good effort! Your character is well-formed.',
        'Try to focus on the stroke directions next time.',
        'Overall, a solid attempt!',
      ],
    };
  };

  const generateFeedback = (score: number, metrics: DrawingMetrics, character: any): string[] => {
    const feedback: string[] = [];
    
    if (score >= 90) {
      feedback.push('Excellent! Your character is nearly perfect.');
    } else if (score >= 75) {
      feedback.push('Great work! You\'re very close to mastering this.');
    } else if (score >= 60) {
      feedback.push('Good effort. Keep practicing to improve.');
    } else {
      feedback.push('Try following the guide overlay more closely.');
    }
    
    if (metrics.strokeCount !== metrics.expectedStrokeCount) {
      const diff = metrics.expectedStrokeCount - metrics.strokeCount;
      feedback.push(
        diff > 0 
          ? `Add ${diff} more stroke${diff > 1 ? 's' : ''}.` 
          : `You have ${-diff} extra stroke${-diff > 1 ? 's' : ''}.` 
      );
    }
    
    if (metrics.centeringScore < 60) {
      feedback.push('Try centering your drawing in the canvas.');
    }
    
    if (metrics.symmetryScore < 60 && character.symbolism?.includes('symmetrical')) {
      feedback.push('This character is symmetrical. Mirror your strokes.');
    }
    
    if (metrics.pixelCoverage < 50) {
      feedback.push('Your strokes are a bit light. Press firmer next time.');
    } else if (metrics.pixelCoverage > 85) {
      feedback.push('Great coverage! Your strokes are well-defined.');
    }

    return feedback;
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

  const getMetricIcon = (metric: keyof DrawingMetrics) => {
    switch (metric) {
      case 'pixelCoverage': return Target;
      case 'strokeCount': return Zap;
      case 'centeringScore': return TrendingUp;
      case 'symmetryScore': return Eye;
      case 'strokeQuality': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const getMetricLabel = (metric: keyof DrawingMetrics) => {
    switch (metric) {
      case 'pixelCoverage': return 'Coverage';
      case 'strokeCount': return 'Stroke Count';
      case 'centeringScore': return 'Centering';
      case 'symmetryScore': return 'Symmetry';
      case 'strokeQuality': return 'Stroke Quality';
      default: return 'Metric';
    }
  };

  const retryPractice = () => {
    // Go back to practice step
    onPrevious?.();
  };

  const handleComplete = () => {
    onComplete?.({
      stepId: step.id,
      completed: true,
      evaluation,
      finalScore: evaluation?.score || 0,
    });
    onNext?.();
  };

  if (!userDrawing) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Drawing Found</h2>
        <p className="text-gray-600 mb-4">
          Please complete the practice step first to see your evaluation.
        </p>
        <Button onClick={onPrevious}>Go to Practice</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {translation?.title || 'Review Your Work'}
        </h1>
        
        <p className="text-gray-600 max-w-lg mx-auto">
          {translation?.instructions || 'Review your drawing compared to the correct form. Read the feedback to improve.'}
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
            <div className="text-sm text-gray-600">Review & Analysis</div>
          </div>
        </CardContent>
      </Card>

      {/* Score Overview */}
      {evaluation && !isAnalyzing && (
        <Card className="text-center p-6 shadow-lg">
          <CardContent className="space-y-4">
            <div className="text-6xl font-bold">
              <span className={getScoreColor(evaluation.score)}>
                {evaluation.score}
              </span>
              <span className="text-gray-400">/100</span>
            </div>
            
            <Badge 
              variant={evaluation.score >= 70 ? "default" : "secondary"}
              className="text-lg px-4 py-2"
            >
              {getScoreLabel(evaluation.score)}
            </Badge>
            
            <div className="w-full max-w-md mx-auto">
              <Progress value={evaluation.score} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Side-by-Side Comparison */}
      {showSideBySide && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Drawing Comparison</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSideBySide(!showSideBySide)}
              >
                {showSideBySide ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* User Drawing */}
              <div className="space-y-3">
                <h3 className="font-semibold text-center">Your Drawing</h3>
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                  <img 
                    src={userDrawing} 
                    alt="Your drawing" 
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
              </div>
              
              {/* Reference */}
              <div className="space-y-3">
                <h3 className="font-semibold text-center">Correct Form</h3>
                <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50 flex items-center justify-center">
                  <div className="text-8xl font-umwero text-primary">
                    {character.umweroGlyph}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      {showMetrics && evaluation && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detailed Analysis</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMetrics(!showMetrics)}
              >
                {showMetrics ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Object.entries(evaluation.metrics).map(([key, value]) => {
                if (key === 'expectedStrokeCount') return null;
                
                const Icon = getMetricIcon(key as keyof DrawingMetrics);
                const label = getMetricLabel(key as keyof DrawingMetrics);
                const percentage = typeof value === 'number' ? value : 0;
                
                return (
                  <div key={key} className="flex items-center gap-4">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{label}</span>
                        <span className="text-sm text-gray-600">
                          {key === 'strokeCount' 
                            ? `${value} / ${evaluation.metrics.expectedStrokeCount}`
                            : `${Math.round(percentage)}%`
                          }
                        </span>
                      </div>
                      {key !== 'strokeCount' && (
                        <Progress value={percentage} className="h-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Feedback */}
      {evaluation && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              AI Feedback & Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evaluation.feedback.map((feedback, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-700">{feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <Card className="text-center p-8">
          <CardContent className="space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-gray-600">AI is analyzing your drawing...</p>
            <p className="text-sm text-gray-500">This usually takes a few seconds</p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      {translation?.tips && translation.tips.length > 0 && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <CardContent className="space-y-2">
            <div className="font-semibold text-orange-800 mb-2">🎯 Improvement Tips:</div>
            {translation.tips.map((tip: string, index: number) => (
              <div key={index} className="text-orange-700 text-sm">
                • {tip}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={retryPractice}
            className="px-6"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button 
            variant="outline"
            onClick={onPrevious}
            className="px-6"
          >
            ← Previous
          </Button>
        </div>
        
        <Button 
          onClick={handleComplete}
          size="lg"
          className="px-8 py-3"
          disabled={isAnalyzing}
        >
          Continue to Celebration
        </Button>
      </div>
    </div>
  );
}
