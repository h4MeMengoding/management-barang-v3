import React, { useEffect, useState } from 'react';
import Card from './Card';
import BarangBaruItem from './BarangBaruItem';
import { Package } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export default function BarangBaru() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecent = async () => {
      const user = getCurrentUser();
      if (!user) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`/api/items?userId=${user.id}`);
        const json = await res.json();
        if (!res.ok) {
          console.error('Failed to load items', json);
          setItems([]);
          return;
        }

        const allItems = json.items || [];
        // Ensure items are sorted by createdAt desc (API already does this), take top 5
        const recent = allItems.slice(0, 5);
        setItems(recent);
      } catch (err) {
        console.error('Error loading recent items:', err);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecent();
  }, []);

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
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Barang Baru</h3>
        <button className="text-xs lg:text-sm text-gray-600 hover:text-gray-900">
          See All
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="py-6 text-center text-gray-500">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="py-6 text-center text-gray-500">Belum ada barang</div>
        ) : (
          items.map((it) => (
            <BarangBaruItem
              key={it.id}
              icon={<Package size={20} className="text-emerald-600" />}
              name={it.name}
              date={formatDate(it.createdAt)}
              quantity={`x${it.quantity}`}
              bgColor="bg-emerald-100"
            />
          ))
        )}
      </div>
    </Card>
  );
}
