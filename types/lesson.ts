// types/lesson.ts
// Core types for the Uruziga Lesson System with authentic Umwero data

export interface Language {
  id: string;
  code: string;
  name: string;
  displayName: string;
  direction: 'ltr' | 'rtl';
  isActive: boolean;
  isDefault: boolean;
}

export interface Character {
  id: string;
  umweroGlyph: string;
  latinEquivalent: string;
  type: CharacterType;
  difficulty: number;
  strokeCount: number;
  order: number;
  glyphImageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  symbolism?: string;
  historicalNote?: string;
  isActive: boolean;
  translations: CharacterTranslation[];
  strokeData: StrokeData[];
  culturalContexts: CulturalContext[];
}

export interface CharacterTranslation {
  id: string;
  characterId: string;
  languageId: string;
  name: string;
  pronunciation: string;
  meaning: string;
  description?: string;
  language: Language;
}

export interface StrokeData {
  id: string;
  characterId: string;
  strokeNumber: number;
  pathData: string;
  direction: StrokeDirection;
  duration: number;
  easing: string;
  hint?: string;
}

export interface CulturalContext {
  id: string;
  characterId: string;
  contextType: ContextType;
  icon?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  translations: CulturalContextTranslation[];
  examples: ContextExample[];
}

export interface CulturalContextTranslation {
  id: string;
  contextId: string;
  languageId: string;
  title: string;
  content: string;
  summary?: string;
  language: Language;
}

export interface ContextExample {
  id: string;
  contextId: string;
  wordUmwero: string;
  wordLatin: string;
  wordEnglish: string;
  audioUrl?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface Lesson {
  id: string;
  code: string;
  type: LessonType;
  characterId?: string;
  module: string;
  difficulty: number;
  order: number;
  estimatedTime: number;
  prerequisiteIds: string[];
  isPublished: boolean;
  publishedAt?: Date;
  translations: LessonTranslation[];
  steps: LessonStep[];
  character?: Character;
}

export interface LessonTranslation {
  id: string;
  lessonId: string;
  languageId: string;
  title: string;
  description: string;
  objectives: string[];
  language: Language;
}

export interface LessonStep {
  id: string;
  lessonId: string;
  stepType: StepType;
  order: number;
  config: Record<string, any>;
  isRequired: boolean;
  passingScore?: number;
  isActive: boolean;
  translations: StepTranslation[];
}

export interface StepTranslation {
  id: string;
  stepId: string;
  languageId: string;
  title: string;
  instructions?: string;
  tips: string[];
  language: Language;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: ProgressStatus;
  currentStepId?: string;
  completedSteps: string[];
  bestScore: number;
  attempts: number;
  timeSpent: number;
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  userAttempts?: UserAttempt[];
}

export interface UserAttempt {
  id: string;
  userId: string;
  stepId: string;
  characterId?: string;
  attemptType: AttemptType;
  drawingData?: string;
  answer?: Record<string, any>;
  aiScore?: number;
  aiMetrics?: Record<string, any>;
  feedback?: string;
  timeSpent: number;
  isCorrect: boolean;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  code: string;
  category: AchievementCategory;
  requirement: Record<string, any>;
  points: number;
  icon?: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  achievement: Achievement;
}

// Authentic Umwero Vowel Data
export const UMWERO_VOWELS = {
  A: {
    umwero: '"',
    latin: 'a',
    pronunciation: '/a/ as in "Abana"',
    meaning: 'Inyambo Cow\'s head with Horns',
    culturalNote: 'The character for "a" symbolizes the sacred Inyambo cows with their distinctive long horns. These cows are a symbol of Rwandan heritage and beauty.',
    examples: [
      { umwero: '"M"Z}', latin: 'amazi', english: 'water' },
      { umwero: '"B"M}', latin: 'abami', english: 'Kings' },
      { umwero: '"M"T"', latin: 'amata', english: 'milk' },
      { umwero: '"B"NN:', latin: 'abantu', english: 'people' },
    ],
    practiceWords: ['amazi', 'abami', 'amata', 'abantu'],
    order: 1,
  },
  U: {
    umwero: ':',
    latin: 'u',
    pronunciation: '/u/ as in Umunyu or "rude"',
    meaning: 'Represents Umugozi/umurunga',
    culturalNote: 'a loop that tier together a relationship',
    examples: [
      { umwero: ':M:C{', latin: 'umuco', english: 'culture' },
      { umwero: ':B:NN:', latin: 'ubuntu', english: 'humanity' },
      { umwero: ':R:Z}G"', latin: 'uruziga', english: 'circle' },
      { umwero: ':RGW"ND"', latin: 'urwanda', english: 'Rwanda' },
    ],
    practiceWords: ['umuco', 'ubuntu', 'uruziga', 'urwanda'],
    order: 2,
  },
  O: {
    umwero: '{',
    latin: 'o',
    pronunciation: '/o/ as in "note"',
    meaning: '360 deg',
    culturalNote: 'it hold 360deg. as other O which is circle mean O can\'change because of language',
    examples: [
      { umwero: '{R{H"', latin: 'Oroha', english: 'be flex' },
      { umwero: 'B{R{G"', latin: 'boroga', english: 'screem' },
      { umwero: '{NG||R"', latin: 'ongeera', english: 'increase' },
      { umwero: 'honda', latin: 'honda', english: 'beat' },
    ],
    practiceWords: ['oroha', 'boroga', 'ongeera', 'honda'],
    order: 3,
  },
  E: {
    umwero: '|',
    latin: 'e',
    pronunciation: '/e/ as "Emera" in "bed--english"',
    meaning: 'E',
    culturalNote: 'none.',
    examples: [
      { umwero: '|YY|', latin: 'enye', english: 'four/4' },
      { umwero: '|r|K"N"', latin: 'erekana', english: 'show' },
      { umwero: 'NN|G" "M"TKW}', latin: 'ntega amatwi', english: 'hear me' },
      { umwero: 'T|R"', latin: 'tera', english: 'throw' },
    ],
    practiceWords: ['enye', 'erekana', 'ntega amatwi', 'tera'],
    order: 4,
  },
  I: {
    umwero: '}',
    latin: 'i',
    pronunciation: '/i/ as in"inyinya" or "machine--eng"',
    meaning: 'long vowel',
    culturalNote: '',
    examples: [
      { umwero: '}B}', latin: 'ibi', english: 'these things' },
      { umwero: 'N} N}N}', latin: 'ni nini', english: 'it is big' },
      { umwero: '}M}Z}', latin: 'imizi', english: 'roots' },
      { umwero: '}M}B:', latin: 'imibu', english: 'mosquitos' },
    ],
    practiceWords: ['ibi', 'ni nini', 'imizi', 'imibu'],
    order: 5,
  },
} as const;

// Enums
export enum CharacterType {
  VOWEL = 'VOWEL',
  CONSONANT = 'CONSONANT',
  LIGATURE = 'LIGATURE',
  COMPOUND = 'COMPOUND',
  SPECIAL = 'SPECIAL',
}

export enum StrokeDirection {
  TOP_TO_BOTTOM = 'TOP_TO_BOTTOM',
  BOTTOM_TO_TOP = 'BOTTOM_TO_TOP',
  LEFT_TO_RIGHT = 'LEFT_TO_RIGHT',
  RIGHT_TO_LEFT = 'RIGHT_TO_LEFT',
  CLOCKWISE = 'CLOCKWISE',
  COUNTERCLOCKWISE = 'COUNTERCLOCKWISE',
  DIAGONAL = 'DIAGONAL',
}

export enum ContextType {
  ETYMOLOGY = 'ETYMOLOGY',
  CULTURAL_USE = 'CULTURAL_USE',
  PRESERVATION = 'PRESERVATION',
  MEANING = 'MEANING',
  HISTORY = 'HISTORY',
}

export enum LessonType {
  CHARACTER_INTRO = 'CHARACTER_INTRO',
  PRACTICE = 'PRACTICE',
  REVIEW = 'REVIEW',
  ASSESSMENT = 'ASSESSMENT',
  CULTURAL_DEEP_DIVE = 'CULTURAL_DEEP_DIVE',
}

export enum StepType {
  CHARACTER_OVERVIEW = 'CHARACTER_OVERVIEW',
  CULTURAL_CONTEXT = 'CULTURAL_CONTEXT',
  PRONUNCIATION_GUIDE = 'PRONUNCIATION_GUIDE',
  STROKE_ORDER = 'STROKE_ORDER',
  PRACTICE_CANVAS = 'PRACTICE_CANVAS',
  AI_COMPARISON = 'AI_COMPARISON',
  QUIZ = 'QUIZ',
  REVIEW = 'REVIEW',
  SUCCESS_CELEBRATION = 'SUCCESS_CELEBRATION',
}

export enum ProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  MASTERED = 'MASTERED',
}

export enum AttemptType {
  DRAWING = 'DRAWING',
  QUIZ = 'QUIZ',
  PRONUNCIATION = 'PRONUNCIATION',
  WRITING = 'WRITING',
}

export enum AchievementCategory {
  LESSON_COMPLETION = 'LESSON_COMPLETION',
  PRACTICE_MASTERY = 'PRACTICE_MASTERY',
  STREAK = 'STREAK',
  CULTURAL_KNOWLEDGE = 'CULTURAL_KNOWLEDGE',
  COMMUNITY = 'COMMUNITY',
}

// Component Props Interfaces
export interface StepComponentProps {
  step: LessonStep;
  lesson: Lesson;
  languageCode: string;
  onComplete?: (result: any) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  progress?: LessonProgress;
}

export interface CharacterOverviewStepConfig {
  displaySize: 'large' | 'medium' | 'small';
  showAudio: boolean;
  backgroundColor: string;
  decorativePattern?: 'imigongo' | 'none';
}

export interface CulturalContextStepConfig {
  contextType: ContextType;
  icon: string;
}

export interface StrokeOrderStepConfig {
  animationSpeed: 'slow' | 'normal' | 'fast';
  showDirectionArrows: boolean;
}

export interface PracticeCanvasStepConfig {
  guidanceLevel: 'full' | 'partial' | 'none';
  gridVisible: boolean;
  traceOpacity: number;
  realTimeFeedback: boolean;
  tools: {
    undo: boolean;
    clear: boolean;
    guideToggle: boolean;
  };
}

export interface ComparisonStepConfig {
  showSideBySide: boolean;
  showMetrics: boolean;
}

// Lesson Flow State
export interface LessonState {
  currentStepIndex: number;
  completedSteps: string[];
  userAttempts: Map<string, UserAttempt>;
  timeSpent: number;
  isPaused: boolean;
  startTime?: Date;
}

export type LessonAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'COMPLETE_STEP'; stepId: string; attempt: UserAttempt }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'JUMP_TO_STEP'; stepIndex: number };

// AI Evaluation Types
export interface DrawingMetrics {
  pixelCoverage: number;
  strokeCount: number;
  expectedStrokeCount: number;
  centeringScore: number;
  symmetryScore: number;
  strokeQuality: number;
}

export interface EvaluationResult {
  score: number;
  metrics: DrawingMetrics;
  feedback: string[];
}
