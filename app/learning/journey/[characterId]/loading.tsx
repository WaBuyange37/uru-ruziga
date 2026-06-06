export default function CharacterJourneyLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4">
        <div className="w-full rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700" />
          <p className="font-medium text-slate-950">Loading character journey...</p>
        </div>
      </div>
    </div>
  );
}
