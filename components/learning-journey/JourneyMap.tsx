'use client';

import { JourneyPhaseState } from '@/lib/learning-journey';
import { PhaseNode } from './PhaseNode';

interface JourneyMapProps {
  phases: JourneyPhaseState[];
  selectedPhaseId: string;
  onSelectPhase: (phase: JourneyPhaseState) => void;
}

export function JourneyMap({ phases, selectedPhaseId, onSelectPhase }: JourneyMapProps) {
  if (phases.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
        <p className="text-sm font-medium text-slate-900">No journey phases are available yet.</p>
        <p className="mt-1 text-sm text-slate-600">The character loaded, but phase data was not returned.</p>
      </div>
    );
  }

  return (
    <nav aria-label="Learning journey phases">
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {phases.map((phase, index) => (
          <PhaseNode
            key={phase.id}
            phase={phase}
            index={index}
            isSelected={phase.id === selectedPhaseId}
            onSelect={onSelectPhase}
          />
        ))}
      </ol>
    </nav>
  );
}
