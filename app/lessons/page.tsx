// app/lessons/page.tsx
// Main lessons page for Uruziga Umwero Learning System

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Users, 
  Trophy, 
  ArrowRight,
  Volume2,
  Globe,
  Heart
} from 'lucide-react';
import { LessonStepRenderer } from '@/components/lessons/LessonStepRenderer';
import type { Lesson, LessonProgress, Character } from '@/types/lesson';

// Mock data - in production this would come from API
const MOCK_LESSONS: Lesson[] = [
  {
    id: 'vowel-a-intro',
    code: 'vowel-a-intro',
    type: 'CHARACTER_INTRO',
    characterId: 'char-a',
    module: 'Vowels',
    difficulty: 1,
    order: 1,
    estimatedTime: 15,
    prerequisiteIds: [],
    isPublished: true,
    publishedAt: new Date(),
    translations: [
      {
        id: 'trans-a-en',
        lessonId: 'vowel-a-intro',
        languageId: 'en',
        title: 'Learn Vowel A',
        description: 'Master the A vowel of Umwero script. Learn its cultural significance: Inyambo Cow\'s head with Horns.',
        objectives: [
          'Recognize vowel A in Umwero script',
          'Understand cultural significance of A',
          'Learn proper stroke order for writing A',
          'Practice drawing A with guidance',
        ],
        language: { id: 'en', code: 'en', name: 'English', displayName: 'English', direction: 'ltr', isActive: true, isDefault: true },
      },
    ],
    steps: [],
    character: {
      id: 'char-a',
      umweroGlyph: '"',
      latinEquivalent: 'a',
      type: 'VOWEL',
      difficulty: 1,
      strokeCount: 2,
      order: 1,
      symbolism: 'Inyambo Cow\'s head with Horns',
      historicalNote: 'The character for "a" symbolizes the sacred Inyambo cows with their distinctive long horns. These cows are a symbol of Rwandan heritage and beauty.',
      isActive: true,
      translations: [
        {
          id: 'char-trans-a-en',
          characterId: 'char-a',
          languageId: 'en',
          name: 'Vowel A',
          pronunciation: '/a/ as in "Abana"',
          meaning: 'Inyambo Cow\'s head with Horns',
          description: 'Represents the sacred Inyambo cows, symbol of Rwandan heritage',
          language: { id: 'en', code: 'en', name: 'English', displayName: 'English', direction: 'ltr', isActive: true, isDefault: true },
        },
      ],
      strokeData: [
        {
          id: 'stroke-a-1',
          characterId: 'char-a',
          strokeNumber: 1,
          pathData: 'M 50 100 L 150 100',
          direction: 'LEFT_TO_RIGHT',
          duration: 800,
          hint: 'Draw the top horizontal stroke (like horn base)',
        },
        {
          id: 'stroke-a-2',
          characterId: 'char-a',
          strokeNumber: 2,
          pathData: 'M 100 100 L 100 200',
          direction: 'TOP_TO_BOTTOM',
          duration: 800,
          hint: 'Draw the vertical stroke downward',
        },
      ],
      culturalContexts: [],
    },
  },
  {
    id: 'vowel-u-intro',
    code: 'vowel-u-intro',
    type: 'CHARACTER_INTRO',
    characterId: 'char-u',
    module: 'Vowels',
    difficulty: 1,
    order: 2,
    estimatedTime: 15,
    prerequisiteIds: ['vowel-a-intro'],
    isPublished: true,
    publishedAt: new Date(),
    translations: [
      {
        id: 'trans-u-en',
        lessonId: 'vowel-u-intro',
        languageId: 'en',
        title: 'Learn Vowel U',
        description: 'Master the U vowel of Umwero script. Learn its cultural significance: Umugozi/umurunga representing relationships.',
        objectives: [
          'Recognize vowel U in Umwero script',
          'Understand cultural significance of U',
          'Learn proper stroke order for writing U',
          'Practice drawing U with guidance',
        ],
        language: { id: 'en', code: 'en', name: 'English', displayName: 'English', direction: 'ltr', isActive: true, isDefault: true },
      },
    ],
    steps: [],
    character: {
      id: 'char-u',
      umweroGlyph: ':',
      latinEquivalent: 'u',
      type: 'VOWEL',
      difficulty: 1,
      strokeCount: 2,
      order: 2,
      symbolism: 'Umugozi/umurunga',
      historicalNote: 'Represents a loop that ties together relationships, symbolizing unity and connection in Rwandan society.',
      isActive: true,
      translations: [
        {
          id: 'char-trans-u-en',
          characterId: 'char-u',
          languageId: 'en',
          name: 'Vowel U',
          pronunciation: '/u/ as in Umunyu or "rude"',
          meaning: 'Represents Umugozi/umurunga',
          description: 'A loop that ties together relationships',
          language: { id: 'en', code: 'en', name: 'English', displayName: 'English', direction: 'ltr', isActive: true, isDefault: true },
        },
      ],
      strokeData: [
        {
          id: 'stroke-u-1',
          characterId: 'char-u',
          strokeNumber: 1,
          pathData: 'M 80 100 L 80 200',
          direction: 'TOP_TO_BOTTOM',
          duration: 800,
          hint: 'Draw the left vertical stroke',
        },
        {
          id: 'stroke-u-2',
          characterId: 'char-u',
          strokeNumber: 2,
          pathData: 'M 120 100 L 120 200',
          direction: 'TOP_TO_BOTTOM',
          duration: 800,
          hint: 'Draw the right vertical stroke',
        },
      ],
      culturalContexts: [],
    },
  },
];

const MOCK_PROGRESS: Record<string, LessonProgress> = {
  'vowel-a-intro': {
    id: 'progress-a',
    userId: 'demo-user',
    lessonId: 'vowel-a-intro',
    status: 'COMPLETED',
    currentStepId: 'step-6',
    completedSteps: ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6'],
    bestScore: 85,
    attempts: 3,
    timeSpent: 1250,
    startedAt: new Date(),
    completedAt: new Date(),
    lastAccessedAt: new Date(),
  },
  'vowel-u-intro': {
    id: 'progress-u',
    userId: 'demo-user',
    lessonId: 'vowel-u-intro',
    status: 'IN_PROGRESS',
    currentStepId: 'step-2',
    completedSteps: ['step-1'],
    bestScore: 0,
    attempts: 1,
    timeSpent: 450,
    startedAt: new Date(),
    lastAccessedAt: new Date(),
  },
};

export default function LessonsPage() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [language, setLanguage] = useState('en');

  const handleStartLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    const progress = MOCK_PROGRESS[lesson.id];
    if (progress) {
      // Find current step index based on progress
      const stepIndex = progress.completedSteps.length;
      setCurrentStepIndex(stepIndex);
    } else {
      setCurrentStepIndex(0);
    }
  };

  const handleStepComplete = (result: any) => {
    console.log('Step completed:', result);
  };

  const handleNextStep = () => {
    if (selectedLesson && currentStepIndex < 5) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleExitLesson = () => {
    setSelectedLesson(null);
    setCurrentStepIndex(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Trophy className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Play className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (selectedLesson) {
    // Create mock step data for the selected lesson
    const mockStep = {
      id: `step-${currentStepIndex + 1}`,
      lessonId: selectedLesson.id,
      stepType: ['CHARACTER_OVERVIEW', 'CULTURAL_CONTEXT', 'STROKE_ORDER', 'PRACTICE_CANVAS', 'AI_COMPARISON', 'SUCCESS_CELEBRATION'][currentStepIndex],
      order: currentStepIndex + 1,
      config: {},
      isRequired: true,
      translations: [
        {
          id: `step-trans-${currentStepIndex}`,
          stepId: `step-${currentStepIndex + 1}`,
          languageId: language,
          title: `Step ${currentStepIndex + 1}`,
          instructions: 'Learn about this character',
          tips: ['Take your time', 'Practice regularly'],
          language: { id: language, code: language, name: language, displayName: language, direction: 'ltr', isActive: true, isDefault: false },
        },
      ],
    };

    const progress = MOCK_PROGRESS[selectedLesson.id];

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        {/* Lesson Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleExitLesson}>
                  ← Back to Lessons
                </Button>
                <div>
                  <h2 className="text-xl font-bold">{selectedLesson.translations[0]?.title}</h2>
                  <p className="text-sm text-gray-600">{selectedLesson.translations[0]?.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  Step {currentStepIndex + 1} of 6
                </Badge>
                <Button variant="outline" size="sm">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Progress:</span>
              <Progress value={(currentStepIndex + 1) * 16.67} className="flex-1" />
              <span className="text-sm text-gray-600">{Math.round((currentStepIndex + 1) * 16.67)}%</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="py-8">
          <LessonStepRenderer
            step={mockStep}
            lesson={selectedLesson}
            languageCode={language}
            onComplete={handleStepComplete}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            progress={progress}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Uruziga Lessons</h1>
              <p className="text-gray-600 mt-2">Learn the authentic Umwero script and preserve Rwandan cultural heritage</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {language.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Cultural Preservation
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cultural Introduction */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🌍</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-blue-800 mb-2">Preserving Rwandan Heritage</h2>
                <p className="text-blue-700 leading-relaxed">
                  The Umwero script represents an important effort to preserve and celebrate Rwandan linguistic heritage. 
                  Each character carries deep cultural significance and helps maintain the connection between language, 
                  culture, and identity. By learning these characters, you participate in the preservation of 
                  endangered writing systems and the celebration of African linguistic diversity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_LESSONS.map((lesson) => {
            const progress = MOCK_PROGRESS[lesson.id];
            const isLocked = lesson.order > 1 && !MOCK_PROGRESS['vowel-a-intro']?.completedAt;

            return (
              <Card key={lesson.id} className={`hover:shadow-lg transition-shadow ${isLocked ? 'opacity-75' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-umwero text-primary">
                        {lesson.character?.umweroGlyph}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{lesson.translations[0]?.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {lesson.character?.latinEquivalent.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {lesson.difficulty}/5
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {progress && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(progress.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(progress.status)}
                          {progress.status.replace('_', ' ')}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {lesson.translations[0]?.description}
                  </p>

                  {/* Progress Info */}
                  {progress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(progress.timeSpent)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {progress.bestScore}%
                        </span>
                      </div>
                      <Progress value={(progress.completedSteps.length / 6) * 100} className="h-2" />
                    </div>
                  )}

                  {/* Objectives Preview */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700">Objectives:</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {lesson.translations[0]?.objectives.slice(0, 2).map((objective, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span>•</span>
                          <span className="line-clamp-1">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full"
                    onClick={() => handleStartLesson(lesson)}
                    disabled={isLocked}
                  >
                    {isLocked ? (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Complete Previous Lesson
                      </>
                    ) : progress?.status === 'IN_PROGRESS' ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Continue
                      </>
                    ) : progress?.status === 'COMPLETED' ? (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Review
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Start Lesson
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Cultural Note */}
        <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">🏛️</div>
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Join the Cultural Movement</h3>
            <p className="text-amber-700 max-w-2xl mx-auto">
              Every character you learn helps preserve the endangered Umwero script and honors Rwandan cultural heritage. 
              Together, we can ensure this beautiful writing system continues to inspire future generations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
