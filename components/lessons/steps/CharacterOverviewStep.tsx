// components/lessons/steps/CharacterOverviewStep.tsx
// Step 1: Character Overview - Introduction to the authentic Umwero character

"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Volume2, Info, Heart } from 'lucide-react';
import type { StepComponentProps } from '@/types/lesson';

interface ExtendedStepProps extends StepComponentProps {
  translation?: any;
  lessonTranslation?: any;
}

export function CharacterOverviewStep({ 
  step, 
  lesson, 
  languageCode = 'en',
  translation,
  lessonTranslation,
  onComplete,
  onNext
}: ExtendedStepProps) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const config = step.config as any;
  
  const character = lesson.character;
  const characterTranslation = character?.translations?.find(t => t.language?.code === languageCode);

  if (!character) {
    return <div>Character not found</div>;
  }

  const displaySize = (config.displaySize || 'large') as 'large' | 'medium' | 'small';
  const showAudio = config.showAudio !== false;
  const backgroundColor = config.backgroundColor || '#f8f7f6';

  const sizeClasses = {
    large: 'text-9xl',
    medium: 'text-7xl',
    small: 'text-5xl',
  };

  const playAudio = () => {
    if (character.audioUrl && showAudio) {
      setAudioPlaying(true);
      // Audio implementation would go here
      const audio = new Audio(character.audioUrl);
      audio.play();
      audio.onended = () => setAudioPlaying(false);
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

  // Get authentic vowel data if available
  const getVowelData = () => {
    const vowelMap: Record<string, { cultural: string; heritage: string }> = {
      '"': { cultural: 'Inyambo Cow\'s head with Horns', heritage: 'Rwandan heritage and beauty' },
      ':': { cultural: 'Umugozi/umurunga', heritage: 'relationships and unity' },
      '{': { cultural: '360 degrees', heritage: 'circular completeness' },
      '|': { cultural: 'Basic vowel sound', heritage: 'fundamental sound' },
      '}': { cultural: 'Long vowel', heritage: 'extended sounds' },
    };
    return vowelMap[character.umweroGlyph] || { cultural: 'Umwero character', heritage: 'Rwandan culture' };
  };

  const vowelData = getVowelData();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6" style={{ backgroundColor }}>
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800">
            {translation?.title || 'Meet the Character'}
          </h1>
          {showAudio && character.audioUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={playAudio}
              disabled={audioPlaying}
              className="ml-2"
            >
              {audioPlaying ? (
                <Volume2 className="h-4 w-4 animate-pulse" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        <p className="text-gray-600 max-w-lg mx-auto">
          {translation?.instructions || 'Observe the character carefully and learn its cultural significance.'}
        </p>
      </div>

      {/* Character Display */}
      <Card className="text-center p-8 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="space-y-6 relative">
          {/* Main Character */}
          <div className={`font-umwero ${sizeClasses[displaySize]} text-primary mx-auto`}>
            {character.umweroGlyph}
          </div>

          {/* Character Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {characterTranslation?.name || character.latinEquivalent.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {character.type}
              </Badge>
            </div>

            {/* Pronunciation */}
            <div className="text-lg text-gray-700">
              <span className="font-semibold">Pronunciation:</span>{' '}
              {characterTranslation?.pronunciation || `/${character.latinEquivalent}/`}
            </div>

            {/* Authentic Cultural Meaning */}
            <div className="text-gray-600 max-w-md mx-auto">
              <span className="font-semibold">Cultural Meaning:</span>{' '}
              {vowelData.cultural}
            </div>

            {/* Heritage Significance */}
            <div className="text-sm text-blue-600 max-w-md mx-auto italic">
              Symbolizes {vowelData.heritage}
            </div>
          </div>

          {/* Cultural Pattern Background */}
          {config.decorativePattern === 'imigongo' && (
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="w-full h-full" style={{
                backgroundImage: `url("/patterns/imigongo.svg")`,
                backgroundSize: '100px 100px',
                backgroundRepeat: 'repeat',
              }} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentic Cultural Description */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-blue-700">
            <Info className="h-5 w-5" />
            <span className="font-semibold">Cultural Heritage</span>
          </div>
          <p className="text-blue-600 leading-relaxed">
            {characterTranslation?.description || character.historicalNote || 
            `This character represents an important aspect of Rwandan cultural heritage and the preservation of the Umwero script.`}
          </p>
        </CardContent>
      </Card>

      {/* Tips */}
      {translation?.tips && translation.tips.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <CardContent className="space-y-2">
            <div className="font-semibold text-amber-800 mb-2">💡 Cultural Tips:</div>
            {translation.tips.map((tip: string, index: number) => (
              <div key={index} className="text-amber-700 text-sm">
                • {tip}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleComplete}
          size="lg"
          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          Continue to Cultural Context
        </Button>
      </div>
    </div>
  );
}
