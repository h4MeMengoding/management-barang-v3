export default function LockerDetailSkeleton() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="h-14 w-full bg-[var(--surface-1)] rounded-xl border border-[var(--border)]"></div>
      </div>

      {/* Back Button Skeleton */}
      <div className="mb-6">
        <div className="h-5 w-24 bg-[var(--surface-2)] rounded"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: QR/Form Card Skeleton */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <div className="bg-[var(--surface-1)] rounded-xl shadow-sm border border-[var(--border)] p-6">
              {/* Toggle Buttons Skeleton */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 h-10 bg-[var(--surface-2)] rounded-lg"></div>
                <div className="flex-1 h-10 bg-[var(--surface-2)] rounded-lg"></div>
              </div>

              {/* QR Code Skeleton */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-[var(--surface-2)] border-2 border-[var(--border)] rounded-xl p-5">
                  <div className="w-48 h-48 bg-[var(--surface-3)] rounded-lg"></div>
                </div>
                <div className="mt-3 w-full h-10 bg-[var(--surface-2)] rounded-lg"></div>
              </div>

              {/* Locker Info Skeleton */}
              <div className="space-y-4">
                <div>
                  <div className="h-8 w-3/4 bg-[var(--surface-2)] rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-[var(--surface-2)] rounded"></div>
                </div>

                <div className="h-16 w-full bg-[var(--surface-2)] rounded pb-4 border-b border-[var(--divider)]"></div>
                
                <div className="space-y-3 pb-4 border-b border-[var(--divider)]">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 bg-[var(--surface-2)] rounded"></div>
                    <div className="h-4 w-20 bg-[var(--surface-2)] rounded"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-[var(--surface-2)] rounded"></div>
                    <div className="h-4 w-12 bg-[var(--surface-2)] rounded"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-full h-10 bg-[var(--surface-2)] rounded-lg"></div>
                  <div className="w-full h-10 bg-[var(--surface-2)] rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Items List Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--surface-1)] rounded-xl shadow-sm border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="h-7 w-32 bg-[var(--surface-2)] rounded"></div>
              <div className="h-7 w-36 bg-[var(--surface-2)] rounded-full"></div>
            </div>

            {/* Items akan menggunakan ItemsListSkeleton component terpisah */}
            <div className="h-64 bg-[var(--surface-2)] rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
