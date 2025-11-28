import { Package } from 'lucide-react';
import { Item } from '@/lib/hooks/useLockerDetail';

interface LockerItemCardProps {
  item: Item;
}

export default function LockerItemCard({ item }: LockerItemCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--color-primary)]/30 hover:shadow-sm transition-all bg-[var(--surface-2)]">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
          <Package size={24} className="text-[var(--color-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 mb-1">
            <span className="inline">{item.name}</span>
            <span className="ml-2 text-sm font-medium text-[var(--color-primary)]">×{item.quantity}</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-2">{item.category.name}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-tertiary)]">{formatDate(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
