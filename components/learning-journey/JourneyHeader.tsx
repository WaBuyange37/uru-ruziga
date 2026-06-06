'use client';

import { ArrowLeft, Clock, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface JourneyHeaderProps {
  character: {
    latinEquivalent: string;
    umweroGlyph: string;
    name: string;
    type: string;
    pronunciation?: string | null;
  };
  progress: {
    overallProgress: number;
    currentStage: string;
    masteryScore: number;
    attempts: number;
    timeSpent: number;
  };
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

export function JourneyHeader({ character, progress }: JourneyHeaderProps) {
  const router = useRouter();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.push('/learn')}
              aria-label="Back to learn page"
              className="shrink-0 text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <span
                className="text-5xl leading-none text-slate-950"
                style={{ fontFamily: 'UMWEROalpha, Umwero, monospace' }}
              >
                {character.umweroGlyph}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                {character.type.toLowerCase()} character
              </p>
              <h1 className="truncate text-2xl font-semibold text-slate-950">{character.name}</h1>
              <p className="text-sm text-slate-600">
                Latin: {character.latinEquivalent}
                {character.pronunciation ? ` · ${character.pronunciation}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:min-w-[360px]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-600">Current Stage</p>
              <p className="truncate text-sm font-semibold text-slate-950">{progress.currentStage.replaceAll('_', ' ')}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="flex items-center gap-1 text-xs text-slate-600">
                <Target className="h-3.5 w-3.5" aria-hidden="true" />
                Mastery
              </p>
              <p className="text-sm font-semibold text-slate-950">{progress.masteryScore}%</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 col-span-2 sm:col-span-1">
              <p className="flex items-center gap-1 text-xs text-slate-600">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Practice
              </p>
              <p className="text-sm font-semibold text-slate-950">
                {progress.attempts} attempts · {formatTime(progress.timeSpent)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Journey Progress</span>
            <span>{progress.overallProgress}%</span>
          </div>
          <Progress value={progress.overallProgress} className="h-2 bg-slate-200" />
        </div>
      </div>
    </header>
  );
}
