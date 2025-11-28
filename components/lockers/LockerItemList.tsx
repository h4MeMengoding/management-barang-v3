import { Package } from 'lucide-react';
import Card from '@/components/Card';
import ItemsListSkeleton from '@/components/ItemsListSkeleton';
import LockerItemCard from './LockerItemCard';
import { Item } from '@/lib/hooks/useLockerDetail';

interface LockerItemListProps {
  items: Item[];
  isLoading: boolean;
  totalQuantity: number;
  typesCount: number;
}

export default function LockerItemList({
  items,
  isLoading,
  totalQuantity,
  typesCount,
}: LockerItemListProps) {
  const nf = new Intl.NumberFormat('id-ID');

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Daftar Barang</h2>
        <span className="px-3 py-1 bg-[var(--surface-2)] rounded-full text-sm font-semibold text-[var(--text-primary)]">
          {nf.format(totalQuantity)} Barang • {typesCount} Jenis
        </span>
      </div>

      {isLoading ? (
        <ItemsListSkeleton />
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <Package size={48} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p>Belum ada barang di loker ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <LockerItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </Card>
  );
}
