'use client';

import React, { useMemo } from 'react';
import Card from './Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useStats } from '@/lib/hooks/useQuery';

export default function ReportLoker() {
  const { data: stats, isLoading } = useStats();

  const lokerData = useMemo(() => {
    if (!stats?.lockerDistribution) return [];

    const dist = stats.lockerDistribution.map((d: any) => ({
      name: d.label || (d.code ? `${d.code} - ${d.name || ''}` : (d.name || d.lockerId)),
      value: Number(d.value) || 0,
    }));

    // Sort descending by value and take top 20
    dist.sort((a: any, b: any) => b.value - a.value);
    return dist.slice(0, 20);
  }, [stats]);

  const total = useMemo(() => {
    return lokerData.reduce((sum: number, item: any) => sum + item.value, 0);
  }, [lokerData]);

  const palette = [
    '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5',
    '#059669', '#047857', '#065F46', '#064E3B', '#022C22',
    '#86EFAC', '#5EEAD4', '#2DD4BF', '#14B8A6', '#0D9488',
    '#0F766E', '#115E59', '#134E4A', '#0E7490', '#0891B2'
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--surface-1)] border border-[var(--border)] px-3 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-[var(--text-primary)]">{payload[0].name}</p>
          <p className="text-xs text-[var(--text-secondary)]">{payload[0].value} items</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)]">Report Loker</h3>
        <button className="text-xs lg:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          See Details
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
        {isLoading ? (
          <div className="w-full py-6">
            <div className="flex items-center gap-6 w-full animate-pulse">
              <div className="w-40 h-40 bg-[var(--surface-2)] rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-3 bg-[var(--surface-2)] rounded w-[90%]" />
                ))}
              </div>
            </div>
          </div>
        ) : lokerData.length === 0 ? (
          <div className="w-full text-center py-12">
            <p className="text-[var(--text-secondary)] text-sm">Belum ada data distribusi loker</p>
          </div>
        ) : (
          <>
            <div className="relative w-40 h-40 lg:w-48 lg:h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">{total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Total</p>
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
                    {lokerData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 lg:gap-x-6 lg:gap-y-2.5 flex-1">
              {lokerData.map((entry: any, index: number) => (
                <div key={`legend-${index}`} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: palette[index % palette.length] }}
                  />
                  <span className="text-xs text-[var(--text-secondary)] truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
