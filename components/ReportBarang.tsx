'use client';

import React, { useState, useMemo } from 'react';
import Card from './Card';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStats } from '@/lib/hooks/useQuery';

export default function ReportBarang() {
  const [period, setPeriod] = useState('Monthly');
  const { data: stats, isLoading } = useStats();

  const barangData = useMemo(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    
    if (!stats?.itemsMonthly) {
      return months.map(m => ({ name: m, value: 0 }));
    }

    return months.map((m) => {
      const found = stats.itemsMonthly.find((it: any) => it.name === m);
      return { name: m, value: found ? Number(found.value) : 0 };
    });
  }, [stats]);

  const maxValue = useMemo(() => {
    if (!barangData || barangData.length === 0) return 0;
    return Math.max(...barangData.map((d) => d.value));
  }, [barangData]);

  const yDomainMax = useMemo(() => {
    if (!maxValue || maxValue <= 0) return 100;
    // Add 10% padding
    const padded = Math.ceil(maxValue * 1.1);
    // Round to a nice magnitude (1,10,100,1000...)
    const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
    return Math.ceil(padded / magnitude) * magnitude;
  }, [maxValue]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const monthNames: { [key: string]: string } = {
        'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
        'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
        'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
      };
      return (
        <div className="bg-[var(--surface-3)] text-[var(--text-primary)] px-3 py-2 rounded-lg shadow-lg border border-[var(--border)]">
          <p className="text-sm font-medium">{payload[0].value.toLocaleString()} barang</p>
          <p className="text-xs text-[var(--text-tertiary)]">{monthNames[payload[0].payload.name]}, {new Date().getFullYear()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)]">Report Barang</h3>
        <button className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 bg-[var(--surface-2)] rounded-lg text-xs lg:text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors">
          <CalendarDays size={16} />
          {period}
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="w-full h-64">
        {isLoading ? (
          <div className="w-full h-full animate-pulse p-4">
            <div className="h-4 bg-[var(--surface-2)] rounded w-40 mb-4"></div>
            <div className="flex items-end gap-3 h-44">
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, idx) => (
                <div key={idx} className="flex-1 h-20 bg-[var(--surface-2)] rounded" />
              ))}
            </div>
          </div>
        ) : barangData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-[var(--text-secondary)] text-sm">Belum ada data barang</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barangData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                domain={[0, yDomainMax]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar 
                dataKey="value" 
                fill="var(--color-primary)"
                radius={[8, 8, 0, 0]}
                activeBar={{ fill: 'var(--color-primary-dark)' }}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
