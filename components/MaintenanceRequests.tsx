import React, { useEffect, useState } from 'react';
import Card from './Card';
import MaintenanceItem from './MaintenanceItem';
import { Package } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export default function MaintenanceRequests() {
  const [lokers, setLokers] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = getCurrentUser();
      if (!user) {
        setLokers([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`/api/lockers?userId=${user.id}`);
        const json = await res.json();
        if (!res.ok) {
          console.error('Failed to load lockers', json);
          setLokers([]);
          return;
        }

        // API returns lockers with itemCount field
        const data = json.lockers || [];
        setLokers(data.slice(0, 10));
      } catch (err) {
        console.error('Error loading lockers:', err);
        setLokers([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const colors = ['text-blue-600', 'text-purple-600', 'text-green-600', 'text-orange-600', 'text-cyan-600'];

  return (
    <Card>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Loker</h3>
        <button className="text-xs lg:text-sm text-gray-600 hover:text-gray-900">
          See All
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="py-6 text-center text-gray-500">Memuat...</div>
        ) : lokers.length === 0 ? (
          <div className="py-6 text-center text-gray-500">Belum ada loker</div>
        ) : (
          lokers.map((loker: any, index: number) => (
            <MaintenanceItem
              key={loker.id}
              icon={<Package size={20} className={colors[index % colors.length]} />}
              title={loker.name}
              subtitle={loker.code}
              description={`${loker.itemCount ?? 0} Barang`}
              personName={''}
              personImage={''}
            />
          ))
        )}
      </div>
    </Card>
  );
}
