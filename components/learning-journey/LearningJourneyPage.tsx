'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Lock, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JourneyPhaseState } from '@/lib/learning-journey';
import { JourneyHeader } from './JourneyHeader';
import { JourneyMap } from './JourneyMap';

interface LearningJourneyPageProps {
  characterId: string;
}

interface JourneyData {
  character: {
    id: string;
    latinEquivalent: string;
    umweroGlyph: string;
    type: string;
    name: string;
    pronunciation?: string | null;
    meaning?: string | null;
    description?: string | null;
  };
  lesson: {
    id: string;
    title: string;
    description: string | null;
    duration: number;
  } | null;
  progress: {
    status: string;
    masteryScore: number;
    accuracyRate: number;
    confidenceScore: number;
    attempts: number;
    timeSpent: number;
    currentStage: string;
    currentPhase: string;
    completedStages: string[];
    completedPhases: string[];
    overallProgress: number;
  };
  phases: JourneyPhaseState[];
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4">
        <div className="w-full rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700" />
          <p className="font-medium text-slate-950">Loading character journey...</p>
          <p className="mt-1 text-sm text-slate-600">Preparing the phase map and current progress.</p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4">
        <div className="w-full rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-700" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-slate-950">Journey could not load</h1>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
          <Button type="button" onClick={onRetry} className="mt-5 bg-blue-700 text-white hover:bg-blue-800">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

function PhaseDetail({ phase }: { phase: JourneyPhaseState }) {
  const isLocked = phase.status === 'locked';

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-live="polite">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Selected Phase</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{phase.title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{phase.description}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {phase.estimatedMinutes} min
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_220px]">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Learning stages</h3>
          {phase.learningStages.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {phase.learningStages.map((stage) => (
                <li key={stage} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {stage.replaceAll('_', ' ')}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">This phase orients the learner before stage scoring begins.</p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            {phase.status === 'completed' && <CheckCircle className="h-5 w-5 text-emerald-700" aria-hidden="true" />}
            {phase.status === 'current' && <PlayCircle className="h-5 w-5 text-blue-700" aria-hidden="true" />}
            {phase.status === 'unlocked' && <PlayCircle className="h-5 w-5 text-cyan-700" aria-hidden="true" />}
            {isLocked && <Lock className="h-5 w-5 text-slate-500" aria-hidden="true" />}
            <p className="font-semibold capitalize text-slate-950">{phase.status}</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">{isLocked ? phase.unlockText : 'You can open or revisit this phase.'}</p>
        </div>
      </div>
    </section>
  );
}

export function LearningJourneyPage({ characterId }: LearningJourneyPageProps) {
  const [data, setData] = useState<JourneyData | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJourney() {
      try {
        setLoading(true);
        setError(null);

        const token = getStoredToken();
        const response = await fetch(`/api/learning/journey/${encodeURIComponent(characterId)}`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? `Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as JourneyData;
        setData(payload);
        setSelectedPhaseId(
          payload.phases.find((phase) => phase.status === 'current')?.id ??
            payload.phases.find((phase) => phase.status !== 'locked')?.id ??
            null
        );
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return;
        setError(loadError instanceof Error ? loadError.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadJourney();

    return () => controller.abort();
  }, [characterId, reloadKey]);

  const selectedPhase = useMemo(() => {
    if (!data || !selectedPhaseId) return null;
    return data.phases.find((phase) => phase.id === selectedPhaseId) ?? null;
  }, [data, selectedPhaseId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />;

  if (!data) {
    return (
      <ErrorState
        message="No journey data was returned for this character."
        onRetry={() => setReloadKey((key) => key + 1)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <JourneyHeader character={data.character} progress={data.progress} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-700">{data.lesson?.title ?? 'Character Journey'}</p>
          {data.character.description && <p className="max-w-3xl text-sm text-slate-600">{data.character.description}</p>}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <JourneyMap
            phases={data.phases}
            selectedPhaseId={selectedPhaseId ?? ''}
            onSelectPhase={(phase) => {
              if (phase.status !== 'locked') setSelectedPhaseId(phase.id);
            }}
          />

          <div className="xl:sticky xl:top-6 xl:self-start">
            {selectedPhase ? (
              <PhaseDetail phase={selectedPhase} />
            ) : (
              <section className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
                <p className="text-sm font-medium text-slate-950">Select an available phase to begin.</p>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
