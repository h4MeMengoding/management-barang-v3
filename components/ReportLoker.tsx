'use client';

import React, { useEffect, useState } from 'react';
import Card from './Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCurrentUser } from '@/lib/auth';

export default function ReportLoker() {
  const [lokerData, setLokerData] = useState<Array<{ name: string; value: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = getCurrentUser();
      if (!user) {
        console.error('User not found for locker distribution');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await fetch(`/api/stats?userId=${user.id}`);
        const json = await res.json();
        if (!res.ok) {
          console.error('Failed to load locker distribution:', json.error || json);
          setLokerData([]);
          return;
        }

        const dist = (json.lockerDistribution || []).map((d: any) => ({
          // Prefer label ("CODE - NAME"), fallback to code or name
          name: d.label || (d.code ? `${d.code} - ${d.name || ''}` : (d.name || d.lockerId)),
          value: Number(d.value) || 0,
        }));

        // Sort descending by value and take top 20 for display (to match previous dummy length)
        dist.sort((a: any, b: any) => b.value - a.value);
        const top = dist.slice(0, 20);
        setLokerData(top);
      } catch (err) {
        console.error('Error loading locker distribution:', err);
        setLokerData([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const total = lokerData.reduce((sum, item) => sum + item.value, 0);

  const palette = [
    '#86EFAC', '#FDE047', '#BAE6FD', '#C7D2FE', '#FCA5A5', '#FDBA74', '#A7F3D0', '#DDD6FE',
    '#FED7AA', '#BFDBFE', '#D1FAE5', '#FEF3C7', '#E9D5FF', '#FBCFE8', '#CCFBF1', '#FCE7F3',
    '#FEF9C3', '#E0E7FF', '#FECACA', '#BAE6FD'
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-xs text-gray-600">{payload[0].value} items</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Report Loker</h3>
        <button className="text-xs lg:text-sm text-gray-600 hover:text-gray-900">
          See Details
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
        {isLoading ? (
          <div className="w-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : lokerData.length === 0 ? (
          <div className="w-full text-center py-12">
            <p className="text-gray-500 text-sm">Belum ada data distribusi loker</p>
          </div>
        ) : (
          <>
            <div className="relative w-40 h-40 lg:w-48 lg:h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
                <PieChart>
                  <Pie
                    data={lokerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {lokerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 lg:gap-x-6 lg:gap-y-2.5 flex-1">
              {lokerData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: palette[index % palette.length] }}
                  />
                  <span className="text-xs text-gray-600 truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
