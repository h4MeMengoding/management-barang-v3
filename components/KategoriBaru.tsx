import React, { useMemo } from 'react';
import Card from './Card';
import BarangBaruItem from './BarangBaruItem';
import { FolderTree } from 'lucide-react';
import { useCategories } from '@/lib/hooks/useQuery';

export default function KategoriBaru() {
  const { data: categories = [], isLoading } = useCategories();

  // Get recent 5 categories (already sorted by createdAt desc from API)
  const recentCategories = useMemo(() => {
    return categories.slice(0, 5);
  }, [categories]);

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
        <h3 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)]">Kategori Baru</h3>
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
        ) : recentCategories.length === 0 ? (
          <div className="py-6 text-center text-[var(--text-secondary)]">Belum ada kategori</div>
        ) : (
          recentCategories.map((cat) => (
            <BarangBaruItem
              key={cat.id}
              icon={<FolderTree size={20} className="text-[var(--color-info)]" />}
              name={cat.name}
              date={formatDate(cat.createdAt)}
              quantity={`${cat.totalQuantity || 0} items`}
              bgColor="bg-[var(--color-info)]/10"
            />
          ))
        )}
      </div>
    </Card>
  );
}
