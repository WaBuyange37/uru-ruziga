export default function GalleryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-12 w-64 bg-neutral-200 animate-pulse rounded-lg mx-auto mb-8" />
      
      {/* Search Bar Skeleton */}
      <div className="mb-8 max-w-md mx-auto">
        <div className="h-10 bg-neutral-200 animate-pulse rounded-lg" />
      </div>

      {/* Free Resources Skeleton */}
      <section className="mb-12">
        <div className="h-8 w-48 bg-neutral-200 animate-pulse rounded-lg mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-shrink-0 w-1/6">
              <div className="aspect-square bg-neutral-200 animate-pulse rounded-lg mb-2" />
              <div className="h-4 bg-neutral-200 animate-pulse rounded mb-2" />
              <div className="h-8 bg-neutral-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Products Skeleton */}
      <section>
        <div className="h-8 w-48 bg-neutral-200 animate-pulse rounded-lg mb-4" />
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-neutral-200 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="border rounded-lg p-3">
              <div className="aspect-square bg-neutral-200 animate-pulse rounded-lg mb-3" />
              <div className="h-5 bg-neutral-200 animate-pulse rounded mb-2" />
              <div className="h-4 bg-neutral-200 animate-pulse rounded w-20 mb-3" />
              <div className="h-10 bg-neutral-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
