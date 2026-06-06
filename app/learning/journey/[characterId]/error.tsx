'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CharacterJourneyError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4">
        <div className="w-full rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-700" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-slate-950">Journey could not load</h1>
          <p className="mt-2 text-sm text-slate-600">{error.message}</p>
          <Button type="button" onClick={reset} className="mt-5 bg-blue-700 text-white hover:bg-blue-800">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
