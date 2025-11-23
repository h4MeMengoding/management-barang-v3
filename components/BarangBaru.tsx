import React, { useMemo } from 'react';
import Card from './Card';
import BarangBaruItem from './BarangBaruItem';
import { Package } from 'lucide-react';
import { useItems } from '@/lib/hooks/useQuery';

export default function BarangBaru() {
  const { data: items = [], isLoading } = useItems();

  // Get recent 5 items (already sorted by createdAt desc from API)
  const recentItems = useMemo(() => {
    return items.slice(0, 5);
  }, [items]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h3 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)]">Barang Baru</h3>
        <button className="text-xs lg:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          See All
        </button>
      </div>

      <div className="divide-y divide-[var(--divider)]">
        {isLoading ? (
          <div className="py-4 space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 bg-[var(--surface-2)] rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-[var(--surface-2)] rounded w-1/2 mb-2" />
                  <div className="h-3 bg-[var(--surface-2)] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="py-6 text-center text-[var(--text-secondary)]">Belum ada barang</div>
        ) : (
          recentItems.map((it) => (
            <BarangBaruItem
              key={it.id}
              icon={<Package size={20} className="text-[var(--color-primary)]" />}
              name={it.name}
              date={formatDate(it.createdAt)}
              quantity={`x${it.quantity}`}
              bgColor="bg-[var(--color-primary)]/10"
            />
          ))
        )}
      </div>
    </Card>
  );
}
