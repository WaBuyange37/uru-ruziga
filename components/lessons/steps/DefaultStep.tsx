// components/lessons/steps/DefaultStep.tsx
// Fallback step component for unsupported step types

"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Settings } from 'lucide-react';
import type { StepComponentProps } from '@/types/lesson';

interface ExtendedStepProps extends StepComponentProps {
  translation?: any;
  lessonTranslation?: any;
}

export function DefaultStep({ 
  step, 
  lesson, 
  languageCode = 'en',
  translation,
  lessonTranslation,
  onComplete,
  onNext,
  onPrevious
}: ExtendedStepProps) {
  
  const handleComplete = () => {
    onComplete?.({
      stepId: step.id,
      completed: true,
      stepType: step.stepType,
    });
    onNext?.();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {translation?.title || step.stepType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h1>
        
        <p className="text-gray-600 max-w-lg mx-auto">
          {translation?.instructions || 'This step type is under development.'}
        </p>
      </div>

      {/* Character Reference */}
      {lesson.character && (
        <Card className="text-center p-4 bg-gray-50">
          <CardContent className="flex items-center justify-center gap-4">
            <div className="text-4xl font-umwero text-primary">
              {lesson.character.umweroGlyph}
            </div>
            <div className="text-left">
              <div className="font-semibold">{lesson.character.latinEquivalent.toUpperCase()}</div>
              <div className="text-sm text-gray-600">{lesson.character.type}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Under Development Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Under Development
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-yellow-700">
            <p className="mb-3">
              This step type (<code className="bg-yellow-100 px-2 py-1 rounded text-xs">{step.stepType}</code>) is currently under development.
            </p>
            
            <div className="bg-yellow-100 p-3 rounded-lg">
              <div className="font-semibold text-sm mb-2">Step Configuration:</div>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(step.config, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <Settings className="h-4 w-4" />
            <span>Coming soon in a future update</span>
          </div>
        </CardContent>
      </Card>

      {/* Step Type Info */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Step Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex justify-between">
              <span className="font-medium">Type:</span>
              <Badge variant="outline">{step.stepType}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Order:</span>
              <span>{step.order}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Required:</span>
              <span>{step.isRequired ? 'Yes' : 'No'}</span>
            </div>
            {step.passingScore && (
              <div className="flex justify-between">
                <span className="font-medium">Passing Score:</span>
                <span>{step.passingScore}%</span>
              </div>
            )}
          </div>
          
          {translation?.tips && translation.tips.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-800 mb-2">💡 Tips:</div>
              {translation.tips.map((tip: string, index: number) => (
                <div key={index} className="text-blue-700 text-sm">
                  • {tip}
                </div>
              ))}
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
          Continue (Skip)
        </Button>
      </div>
    </div>
  );
}
