export default function CategoryDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--surface-1)] rounded-xl shadow-sm border border-[var(--border)] p-6">
            {/* Icon placeholder */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-2xl bg-[var(--surface-2)]"></div>
            </div>

            {/* Category info skeleton */}
            <div className="space-y-4">
              <div>
                <div className="h-8 w-3/4 bg-[var(--surface-2)] rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-[var(--surface-2)] rounded"></div>
              </div>

              <div className="h-16 w-full bg-[var(--surface-2)] rounded pb-4 border-b border-[var(--divider)]"></div>

              <div className="space-y-3 pb-4 border-b border-[var(--divider)]">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-[var(--surface-2)] rounded"></div>
                  <div className="h-4 w-12 bg-[var(--surface-2)] rounded"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-[var(--surface-2)] rounded"></div>
                  <div className="h-4 w-12 bg-[var(--surface-2)] rounded"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-[var(--surface-2)] rounded"></div>
                  <div className="h-4 w-20 bg-[var(--surface-2)] rounded"></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full h-10 bg-[var(--surface-2)] rounded-lg"></div>
                <div className="w-full h-10 bg-[var(--surface-2)] rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--surface-1)] rounded-xl shadow-sm border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="h-7 w-32 bg-[var(--surface-2)] rounded"></div>
              <div className="h-7 w-20 bg-[var(--surface-2)] rounded-full"></div>
            </div>

            {/* Items grid skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[var(--surface-3)] flex-shrink-0"></div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-4 w-full bg-[var(--surface-3)] rounded"></div>
                      <div className="h-3 w-2/3 bg-[var(--surface-3)] rounded"></div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="h-4 w-8 bg-[var(--surface-3)] rounded"></div>
                        <div className="h-3 w-16 bg-[var(--surface-3)] rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
