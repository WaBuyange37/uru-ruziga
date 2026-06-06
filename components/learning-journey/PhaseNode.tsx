'use client';

import { CheckCircle, Circle, Lock, PlayCircle } from 'lucide-react';
import { JourneyPhaseState } from '@/lib/learning-journey';
import { cn } from '@/lib/utils';

interface PhaseNodeProps {
  phase: JourneyPhaseState;
  index: number;
  isSelected: boolean;
  onSelect: (phase: JourneyPhaseState) => void;
}

const statusLabels: Record<JourneyPhaseState['status'], string> = {
  completed: 'Completed',
  current: 'Current',
  unlocked: 'Unlocked',
  locked: 'Locked'
};

function StatusIcon({ status }: { status: JourneyPhaseState['status'] }) {
  if (status === 'completed') return <CheckCircle className="h-5 w-5 text-emerald-700" aria-hidden="true" />;
  if (status === 'current') return <PlayCircle className="h-5 w-5 text-blue-700" aria-hidden="true" />;
  if (status === 'locked') return <Lock className="h-5 w-5 text-slate-500" aria-hidden="true" />;
  return <Circle className="h-5 w-5 text-cyan-700" aria-hidden="true" />;
}

export function PhaseNode({ phase, index, isSelected, onSelect }: PhaseNodeProps) {
  const isLocked = phase.status === 'locked';

  return (
    <li className="min-w-0">
      <button
        type="button"
        disabled={isLocked}
        aria-disabled={isLocked}
        aria-current={phase.status === 'current' ? 'step' : undefined}
        onClick={() => {
          if (!isLocked) onSelect(phase);
        }}
        className={cn(
          'group flex h-full w-full flex-col gap-3 rounded-lg border bg-white p-4 text-left shadow-sm transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
          isSelected && 'border-blue-700 ring-2 ring-blue-100',
          phase.status === 'completed' && 'border-emerald-300 bg-emerald-50',
          phase.status === 'current' && 'border-blue-300 bg-blue-50',
          phase.status === 'unlocked' && 'border-cyan-200 hover:border-cyan-500 hover:bg-cyan-50',
          isLocked && 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-75'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                phase.status === 'completed' && 'bg-emerald-700 text-white',
                phase.status === 'current' && 'bg-blue-700 text-white',
                phase.status === 'unlocked' && 'bg-cyan-700 text-white',
                isLocked && 'bg-slate-300 text-slate-700'
              )}
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-950">{phase.shortTitle}</h3>
              <p className="text-xs text-slate-600">{statusLabels[phase.status]}</p>
            </div>
          </div>
          <StatusIcon status={phase.status} />
        </div>

        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                phase.status === 'completed' && 'bg-emerald-700',
                phase.status === 'current' && 'bg-blue-700',
                phase.status === 'unlocked' && 'bg-cyan-700',
                isLocked && 'bg-slate-400'
              )}
              style={{ width: `${phase.progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-600">{phase.progress}%</p>
        </div>
      </button>
    </li>
  );
}
