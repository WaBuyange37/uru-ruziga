export type JourneyPhaseId =
  | 'INTRODUCTION'
  | 'OBSERVE'
  | 'RECOGNIZE'
  | 'TRACE'
  | 'PRACTICE'
  | 'MASTER'
  | 'APPLY'
  | 'REFLECT'
  | 'REVIEW';

export type JourneyPhaseStatus = 'completed' | 'current' | 'unlocked' | 'locked';

export interface JourneyPhaseDefinition {
  id: JourneyPhaseId;
  title: string;
  shortTitle: string;
  description: string;
  estimatedMinutes: number;
  learningStages: string[];
}

export interface JourneyProgressSnapshot {
  currentPhase?: string | null;
  completedPhases?: string[] | null;
  currentStage?: string | null;
  completedStages?: string[] | null;
  masteryScore?: number | null;
}

export interface JourneyPhaseState extends JourneyPhaseDefinition {
  status: JourneyPhaseStatus;
  progress: number;
  unlockText: string;
}

export const JOURNEY_PHASES: JourneyPhaseDefinition[] = [
  {
    id: 'INTRODUCTION',
    title: 'Meet the Character',
    shortTitle: 'Intro',
    description: 'Start with the character shape, meaning, and cultural role.',
    estimatedMinutes: 2,
    learningStages: []
  },
  {
    id: 'OBSERVE',
    title: 'Observe and Listen',
    shortTitle: 'Observe',
    description: 'Study how the character looks and how it is pronounced.',
    estimatedMinutes: 2,
    learningStages: []
  },
  {
    id: 'RECOGNIZE',
    title: 'Recognize',
    shortTitle: 'Recognize',
    description: 'Identify the character among related Umwero forms.',
    estimatedMinutes: 3,
    learningStages: ['RECOGNITION', 'IDENTIFICATION']
  },
  {
    id: 'TRACE',
    title: 'Trace',
    shortTitle: 'Trace',
    description: 'Trace the reference form to learn stroke order.',
    estimatedMinutes: 4,
    learningStages: ['TRACING']
  },
  {
    id: 'PRACTICE',
    title: 'Practice',
    shortTitle: 'Practice',
    description: 'Write with guidance, then begin writing independently.',
    estimatedMinutes: 6,
    learningStages: ['GUIDED_WRITING', 'INDEPENDENT_WRITING']
  },
  {
    id: 'MASTER',
    title: 'Master',
    shortTitle: 'Master',
    description: 'Show consistent independent writing performance.',
    estimatedMinutes: 5,
    learningStages: ['INDEPENDENT_WRITING']
  },
  {
    id: 'APPLY',
    title: 'Apply',
    shortTitle: 'Apply',
    description: 'Use the character in words and sentences.',
    estimatedMinutes: 5,
    learningStages: ['WORD_FORMATION', 'SENTENCE_FORMATION']
  },
  {
    id: 'REFLECT',
    title: 'Reflect',
    shortTitle: 'Reflect',
    description: 'Connect the character to cultural context and meaning.',
    estimatedMinutes: 3,
    learningStages: ['CULTURAL_APPLICATION']
  },
  {
    id: 'REVIEW',
    title: 'Review',
    shortTitle: 'Review',
    description: 'Review progress, mastery, and next steps.',
    estimatedMinutes: 2,
    learningStages: []
  }
];

function getPhaseIndex(phaseId: string | null | undefined): number {
  return JOURNEY_PHASES.findIndex((phase) => phase.id === phaseId);
}

function getFirstOpenPhase(progress: JourneyProgressSnapshot): JourneyPhaseId {
  const completedPhases = new Set(progress.completedPhases ?? []);
  const currentPhase = progress.currentPhase;

  if (currentPhase && getPhaseIndex(currentPhase) >= 0) {
    return currentPhase as JourneyPhaseId;
  }

  const firstIncomplete = JOURNEY_PHASES.find((phase) => !completedPhases.has(phase.id));
  return firstIncomplete?.id ?? 'REVIEW';
}

export function buildJourneyPhaseStates(progress: JourneyProgressSnapshot): JourneyPhaseState[] {
  const completedPhases = new Set(progress.completedPhases ?? []);
  const completedStages = new Set(progress.completedStages ?? []);
  const currentPhase = getFirstOpenPhase(progress);
  const currentIndex = getPhaseIndex(currentPhase);

  return JOURNEY_PHASES.map((phase, index) => {
    const stageProgress =
      phase.learningStages.length === 0
        ? 0
        : Math.round(
            (phase.learningStages.filter((stage) => completedStages.has(stage)).length /
              phase.learningStages.length) *
              100
          );
    const isCompleted =
      completedPhases.has(phase.id) ||
      (phase.learningStages.length > 0 && stageProgress === 100) ||
      (phase.id === 'REVIEW' && (progress.masteryScore ?? 0) >= 90);
    const isCurrent = phase.id === currentPhase && !isCompleted;
    const isUnlocked = index === 0 || index <= currentIndex || completedPhases.has(JOURNEY_PHASES[index - 1]?.id);
    const status: JourneyPhaseStatus = isCompleted
      ? 'completed'
      : isCurrent
        ? 'current'
        : isUnlocked
          ? 'unlocked'
          : 'locked';

    return {
      ...phase,
      status,
      progress: isCompleted ? 100 : isCurrent ? Math.max(stageProgress, 15) : stageProgress,
      unlockText:
        status === 'locked'
          ? `Complete ${JOURNEY_PHASES[index - 1]?.shortTitle ?? 'the previous phase'} to unlock`
          : 'Available'
    };
  });
}

export function getOverallJourneyProgress(phases: JourneyPhaseState[]): number {
  if (phases.length === 0) return 0;

  const total = phases.reduce((sum, phase) => sum + phase.progress, 0);
  return Math.round(total / phases.length);
}
