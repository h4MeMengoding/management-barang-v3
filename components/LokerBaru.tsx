import React, { useMemo } from 'react';
import Card from './Card';
import BarangBaruItem from './BarangBaruItem';
import { Container } from 'lucide-react';
import { useLockers } from '@/lib/hooks/useQuery';

export default function LokerBaru() {
  const { data: lockers = [], isLoading } = useLockers();

  // Get recent 5 lockers (already sorted by createdAt desc from API)
  const recentLockers = useMemo(() => {
    return lockers.slice(0, 5);
  }, [lockers]);

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
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Loker Baru</h3>
        <button className="text-xs lg:text-sm text-gray-600 hover:text-gray-900">
          See All
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="py-4 space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : recentLockers.length === 0 ? (
          <div className="py-6 text-center text-gray-500">Belum ada loker</div>
        ) : (
          recentLockers.map((locker) => (
            <BarangBaruItem
              key={locker.id}
              icon={<Container size={20} className="text-purple-600" />}
              name={locker.name}
              date={formatDate(locker.createdAt)}
              quantity={locker.code}
              bgColor="bg-purple-100"
            />
          ))
        )}
      </div>
    </Card>
  );
}
