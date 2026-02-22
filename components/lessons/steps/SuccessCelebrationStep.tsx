// components/lessons/steps/SuccessCelebrationStep.tsx
// Step 6: Success Celebration - Complete the lesson with celebration

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Star, 
  Sparkles, 
  ArrowRight, 
  CheckCircle,
  Flame,
  Target,
  BookOpen
} from 'lucide-react';
import type { StepComponentProps } from '@/types/lesson';

interface ExtendedStepProps extends StepComponentProps {
  translation?: any;
  lessonTranslation?: any;
}

export function SuccessCelebrationStep({ 
  step, 
  lesson, 
  languageCode = 'en',
  translation,
  lessonTranslation,
  onComplete,
  onNext
}: ExtendedStepProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [stats, setStats] = useState({
    timeSpent: 0,
    stepsCompleted: 0,
    bestScore: 0,
    attempts: 0,
  });
  
  const config = step.config as any;
  const character = lesson.character;
  
  useEffect(() => {
    setShowConfetti(config.showConfetti !== false);
    
    // Calculate stats from progress
    if (progress) {
      setStats({
        timeSpent: progress.timeSpent,
        stepsCompleted: progress.completedSteps.length,
        bestScore: progress.bestScore,
        attempts: progress.attempts,
      });
    }

    // Load next lesson preview if enabled
    if (config.nextLessonPreview) {
      loadNextLessonPreview();
    }
  }, [config, progress]);

  const loadNextLessonPreview = async () => {
    // This would fetch the next lesson in sequence
    // For now, we'll use mock data
    setNextLesson({
      title: 'Learn Vowel E',
      character: '|',
      difficulty: 1,
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Master', color: 'text-purple-600', icon: Trophy };
    if (score >= 75) return { level: 'Expert', color: 'text-blue-600', icon: Star };
    if (score >= 60) return { level: 'Skilled', color: 'text-green-600', icon: CheckCircle };
    return { level: 'Learning', color: 'text-orange-600', icon: Target };
  };

  const performance = getPerformanceLevel(stats.bestScore);
  const PerformanceIcon = performance.icon;

  const handleComplete = () => {
    onComplete?.({
      stepId: step.id,
      completed: true,
      celebrationShown: true,
    });
    onNext?.();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Celebration */}
      <Card className="text-center p-8 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="space-y-6">
          
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <Trophy className="h-16 w-16 text-yellow-500" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">
              {translation?.title || 'Congratulations!'}
            </h1>
            <p className="text-lg text-gray-600">
              {translation?.instructions || 'Excellent work! You have completed this lesson.'}
            </p>
          </div>

          {/* Character Achievement */}
          {character && (
            <div className="flex items-center justify-center gap-4 p-4 bg-white rounded-lg">
              <div className="text-6xl font-umwero text-primary">
                {character.umweroGlyph}
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">{character.latinEquivalent.toUpperCase()}</div>
                <div className="text-sm text-gray-600">Mastered!</div>
                <Badge variant="default" className="mt-1">
                  <PerformanceIcon className="h-3 w-3 mr-1" />
                  {performance.level}
                </Badge>
              </div>
            </div>
          )}

          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{stats.timeSpent > 0 ? formatTime(stats.timeSpent) : '--:--'}</div>
              <div className="text-xs text-gray-600">Time Spent</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{stats.stepsCompleted}</div>
              <div className="text-xs text-gray-600">Steps Done</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg">
              <Target className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{stats.bestScore}%</div>
              <div className="text-xs text-gray-600">Best Score</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{stats.attempts}</div>
              <div className="text-xs text-gray-600">Attempts</div>
            </div>
          </div>

          {/* Achievement Points */}
          <div className="flex items-center justify-center gap-2 p-3 bg-yellow-100 rounded-lg">
            <Star className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">+10 Points Earned!</span>
          </div>
        </CardContent>
      </Card>

      {/* Next Lesson Preview */}
      {nextLesson && config.nextLessonPreview && (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Next Lesson</h3>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-umwero text-primary">
                    {nextLesson.character}
                  </div>
                  <div>
                    <div className="font-medium">{nextLesson.title}</div>
                    <div className="text-sm text-gray-600">Difficulty: {nextLesson.difficulty}/5</div>
                  </div>
                </div>
              </div>
              
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cultural Message */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <CardContent className="text-center space-y-3">
          <div className="text-2xl">🌍</div>
          <h3 className="font-semibold text-blue-800">Cultural Achievement</h3>
          <p className="text-blue-700">
            By learning this character, you're helping preserve the endangered Umwero script 
            and honoring Rwandan cultural heritage. Every character learned is a step toward 
            keeping this beautiful writing system alive for future generations. This preservation 
            effort is supported by the <a href="https://endangeredalphabets.net/umwero/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">Endangered Alphabets Project</a> and 
            the <a href="https://scriptkeepers.org/projects" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">ScriptKeepers Initiative</a>.
          </p>
        </CardContent>
      </Card>

      {/* Tips */}
      {translation?.tips && translation.tips.length > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <CardContent className="space-y-2">
            <div className="font-semibold text-green-800 mb-2">🎉 Success Tips:</div>
            {translation.tips.map((tip: string, index: number) => (
              <div key={index} className="text-green-700 text-sm">
                • {tip}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleComplete}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          Continue Learning
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
