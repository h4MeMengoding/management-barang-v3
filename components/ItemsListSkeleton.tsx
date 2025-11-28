export default function ItemsListSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--surface-3)] flex-shrink-0"></div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 w-full bg-[var(--surface-3)] rounded"></div>
              <div className="h-3 w-2/3 bg-[var(--surface-3)] rounded"></div>
              <div className="h-3 w-1/2 bg-[var(--surface-3)] rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
