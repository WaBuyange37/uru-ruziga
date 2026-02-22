// components/lessons/steps/CulturalContextStep.tsx
// Step 2: Cultural Context - Authentic Rwandan cultural significance

"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Volume2, Book, Users, History, Globe } from 'lucide-react';
import type { StepComponentProps } from '@/types/lesson';

interface ExtendedStepProps extends StepComponentProps {
  translation?: any;
  lessonTranslation?: any;
}

export function CulturalContextStep({ 
  step, 
  lesson, 
  languageCode = 'en',
  translation,
  lessonTranslation,
  onComplete,
  onNext,
  onPrevious
}: ExtendedStepProps) {
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
  const config = step.config as any;
  
  const character = lesson.character;
  const characterTranslation = character?.translations?.find(t => t.language?.code === languageCode);

  if (!character) {
    return <div>Character not found</div>;
  }

  // Get authentic cultural context based on character
  const getCulturalContext = () => {
    const contexts: Record<string, { title: string; content: string; historicalNote: string; icon: string }> = {
      '"': {
        title: 'Inyambo Cow Heritage',
        content: 'The character for "a" symbolizes the sacred Inyambo cows with their distinctive long horns. These cows are a symbol of Rwandan heritage and beauty, representing prosperity and cultural identity.',
        historicalNote: 'In traditional Rwandan culture, Inyambo cows were considered sacred and played a central role in ceremonies and social status.',
        icon: 'pets',
      },
      ':': {
        title: 'Umugozi/Umurunga - Unity',
        content: 'This character represents a loop that ties together relationships, symbolizing unity and connection in Rwandan society.',
        historicalNote: 'The concept of umurunga (tying together) is fundamental to Rwandan social structure, representing how families and communities are bound together.',
        icon: 'diversity_3',
      },
      '{': {
        title: 'Circular Completeness',
        content: 'The circular form represents 360 degrees of completeness and wholeness, reflecting the cyclical nature of life and seasons in Rwandan culture.',
        historicalNote: 'Circular patterns are significant in Rwandan art and symbolism, representing eternity and the continuous cycle of life.',
        icon: 'all_inclusive',
      },
      '|': {
        title: 'Fundamental Sound',
        content: 'This character represents a fundamental vowel sound that forms the basis of many words in Kinyarwanda.',
        historicalNote: 'Basic vowel sounds are the foundation of language learning, essential for preserving linguistic heritage.',
        icon: 'record_voice_over',
      },
      '}': {
        title: 'Extended Sound',
        content: 'This character represents long vowel sounds, important for proper pronunciation and meaning in Kinyarwanda.',
        historicalNote: 'Long vowels can change word meanings entirely, making them crucial for accurate communication.',
        icon: 'timeline',
      },
    };
    return contexts[character.umweroGlyph] || {
      title: 'Umwero Character',
      content: 'This character represents an important aspect of Rwandan cultural heritage.',
      historicalNote: 'Each character in the Umwero script carries deep cultural significance.',
      icon: 'history_edu',
    };
  };

  const culturalData = getCulturalContext();

  // Get authentic examples from original data
  const getAuthenticExamples = () => {
    const examples: Record<string, { umwero: string; latin: string; english: string; meaning: string }[]> = {
      '"': [
        { umwero: '"M"Z}', latin: 'amazi', english: 'water', meaning: 'Essential for life' },
        { umwero: '"B"M}', latin: 'abami', english: 'Kings', meaning: 'Traditional rulers' },
        { umwero: '"M"T"', latin: 'amata', english: 'milk', meaning: 'Nourishment' },
        { umwero: '"B"NN:', latin: 'abantu', english: 'people', meaning: 'Community' },
      ],
      ':': [
        { umwero: ':M:C{', latin: 'umuco', english: 'culture', meaning: 'Traditions and customs' },
        { umwero: ':B:NN:', latin: 'ubuntu', english: 'humanity', meaning: 'Human kindness' },
        { umwero: ':R:Z}G"', latin: 'uruziga', english: 'circle', meaning: 'Unity and completeness' },
        { umwero: ':RGW"ND"', latin: 'urwanda', english: 'Rwanda', meaning: 'Our homeland' },
      ],
      '{': [
        { umwero: '{R{H"', latin: 'Oroha', english: 'be flex', meaning: 'Flexibility' },
        { umwero: 'B{R{G"', latin: 'boroga', english: 'scream', meaning: 'Expression' },
        { umwero: '{NG||R"', latin: 'ongeera', english: 'increase', meaning: 'Growth' },
        { umwero: 'honda', latin: 'honda', english: 'beat', meaning: 'Rhythm' },
      ],
      '|': [
        { umwero: '|YY|', latin: 'enye', english: 'four/4', meaning: 'Number four' },
        { umwero: '|r|K"N"', latin: 'erekana', english: 'show', meaning: 'Demonstration' },
        { umwero: 'NN|G" "M"TKW}', latin: 'ntega amatwi', english: 'hear me', meaning: 'Listen to me' },
        { umwero: 'T|R"', latin: 'tera', english: 'throw', meaning: 'Action' },
      ],
      '}': [
        { umwero: '}B}', latin: 'ibi', english: 'these things', meaning: 'Demonstrative' },
        { umwero: 'N} N}N}', latin: 'ni nini', english: 'it is big', meaning: 'Size description' },
        { umwero: '}M}Z}', latin: 'imizi', english: 'roots', meaning: 'Foundation' },
        { umwero: '}M}B:', latin: 'imibu', english: 'mosquitos', meaning: 'Small creatures' },
      ],
    };
    return examples[character.umweroGlyph] || [];
  };

  const examples = getAuthenticExamples();

  const playExampleAudio = (exampleId: string) => {
    setAudioPlaying(exampleId);
    // Audio implementation would go here
    setTimeout(() => setAudioPlaying(null), 2000);
  };

  const handleComplete = () => {
    onComplete?.({
      stepId: step.id,
      completed: true,
      timeSpent: 0,
    });
    onNext?.();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {translation?.title || 'Cultural Significance'}
        </h1>
        
        <p className="text-gray-600 max-w-lg mx-auto">
          {translation?.instructions || 'Learn about the cultural heritage and meaning of this character.'}
        </p>
      </div>

      {/* Character Reference */}
      <Card className="text-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="flex items-center justify-center gap-4">
          <div className="text-4xl font-umwero text-primary">
            {character.umweroGlyph}
          </div>
          <div className="text-left">
            <div className="font-semibold">{character.latinEquivalent.toUpperCase()}</div>
            <div className="text-sm text-gray-600">{culturalData.title}</div>
          </div>
        </CardContent>
      </Card>

      {/* Cultural Context */}
      <Card className="shadow-lg">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3 text-blue-700">
            <Globe className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Cultural Heritage</h2>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">
              {culturalData.content}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <History className="h-5 w-5" />
              <span className="font-semibold">Historical Context</span>
            </div>
            <p className="text-blue-600">
              {culturalData.historicalNote}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Authentic Examples */}
      <Card className="shadow-lg">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3 text-green-700">
            <Book className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Authentic Examples</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {examples.map((example: { umwero: string; latin: string; english: string; meaning: string }, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* Umwero Script */}
                  <div className="text-center">
                    <div className="text-2xl font-umwero text-primary mb-2">
                      {example.umwero}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => playExampleAudio(`example-${index}`)}
                      disabled={audioPlaying === `example-${index}`}
                      className="text-xs"
                    >
                      {audioPlaying === `example-${index}` ? (
                        <Volume2 className="h-3 w-3 animate-pulse" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {/* Translations */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Latin:</span>
                      <span className="text-gray-700">{example.latin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">English:</span>
                      <span className="text-gray-700">{example.english}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Meaning:</span>
                      <span className="text-gray-600 italic">{example.meaning}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language Preservation Context */}
      <Card className="p-6 bg-purple-50 border-purple-200">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-purple-700">
            <Users className="h-5 w-5" />
            <span className="font-semibold">Language Preservation</span>
          </div>
          <p className="text-purple-600 leading-relaxed">
            The Umwero script represents an important effort to preserve and celebrate Rwandan linguistic heritage. 
            Each character carries deep cultural significance and helps maintain the connection between language, 
            culture, and identity. By learning these characters, you participate in the preservation of 
            endangered writing systems and the celebration of African linguistic diversity. This work is supported by 
            the <a href="https://endangeredalphabets.net/umwero/" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-800">Endangered Alphabets Project</a> and 
            the <a href="https://scriptkeepers.org/projects" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-800">ScriptKeepers Initiative</a>.
          </p>
        </CardContent>
      </Card>

      {/* Tips */}
      {translation?.tips && translation.tips.length > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <CardContent className="space-y-2">
            <div className="font-semibold text-green-800 mb-2">🌍 Cultural Tips:</div>
            {translation.tips.map((tip: string, index: number) => (
              <div key={index} className="text-green-700 text-sm">
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
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          Continue to Stroke Order
        </Button>
      </div>
    </div>
  );
}
