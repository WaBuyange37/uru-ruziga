// components/lessons/LessonStepRenderer.tsx
// Step Component Factory Pattern for Uruziga Lesson System

"use client";

import { CharacterOverviewStep } from './steps/CharacterOverviewStep';
import { CulturalContextStep } from './steps/CulturalContextStep';
import { StrokeOrderStep } from './steps/StrokeOrderStep';
import { PracticeCanvasStep } from './steps/PracticeCanvasStep';
import { AIComparisonStep } from './steps/AIComparisonStep';
import { SuccessCelebrationStep } from './steps/SuccessCelebrationStep';
import { DefaultStep } from './steps/DefaultStep';
import type { LessonStep, Lesson, StepComponentProps } from '@/types/lesson';

export function LessonStepRenderer({ 
  step, 
  lesson, 
  languageCode = 'en',
  onComplete,
  onNext,
  onPrevious,
  progress 
}: StepComponentProps) {
  // Find the translation for the current language
  const translation = step.translations?.find(t => t.language?.code === languageCode);
  const lessonTranslation = lesson.translations?.find(t => t.language?.code === languageCode);

  const commonProps = {
    step,
    lesson,
    languageCode,
    translation,
    lessonTranslation,
    onComplete,
    onNext,
    onPrevious,
    progress,
  };

  switch (step.stepType) {
    case 'CHARACTER_OVERVIEW':
      return <CharacterOverviewStep {...commonProps} />;
    
    case 'CULTURAL_CONTEXT':
      return <CulturalContextStep {...commonProps} />;
    
    case 'STROKE_ORDER':
      return <StrokeOrderStep {...commonProps} />;
    
    case 'PRACTICE_CANVAS':
      return <PracticeCanvasStep {...commonProps} />;
    
    case 'AI_COMPARISON':
      return <AIComparisonStep {...commonProps} />;
    
    case 'SUCCESS_CELEBRATION':
      return <SuccessCelebrationStep {...commonProps} />;
    
    default:
      return <DefaultStep {...commonProps} />;
  }
}

// Helper function to get step title with fallback
export function getStepTitle(step: LessonStep, languageCode: string): string {
  const translation = step.translations?.find(t => t.language?.code === languageCode);
  return translation?.title || step.stepType.replace(/_/g, ' ').toLowerCase();
}

// Helper function to get step instructions with fallback
export function getStepInstructions(step: LessonStep, languageCode: string): string {
  const translation = step.translations?.find(t => t.language?.code === languageCode);
  return translation?.instructions || '';
}

// Helper function to get step tips with fallback
export function getStepTips(step: LessonStep, languageCode: string): string[] {
  const translation = step.translations?.find(t => t.language?.code === languageCode);
  return translation?.tips || [];
}
