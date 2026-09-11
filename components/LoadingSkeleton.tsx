export function ListingCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-gray-200 bg-white">
      <div className="h-44 bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded-full bg-gray-200" />
        <div className="h-4 w-1/2 rounded-full bg-gray-200" />
        <div className="mt-2 flex justify-between">
          <div className="h-3 w-1/3 rounded-full bg-gray-200" />
          <div className="h-3 w-1/4 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function WantedCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-2xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded-full bg-gray-200" />
          <div className="h-3 w-1/2 rounded-full bg-gray-200" />
          <div className="h-3 w-2/3 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded-full bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
