'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Card from './Card';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCurrentUser } from '@/lib/auth';

export default function ReportBarang() {
  const [period, setPeriod] = useState('Monthly');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const emptyData = months.map(m => ({ name: m, value: 0 }));
  const [barangData, setBarangData] = useState<Array<{ name: string; value: number }>>(emptyData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMonthly = async () => {
      const user = getCurrentUser();
      if (!user) {
        console.error('User not found for monthly items');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`/api/stats?userId=${user.id}`);
        const json = await res.json();
        if (!res.ok) {
          console.error('Failed to load monthly items:', json.error || json);
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          setBarangData(months.map(m => ({ name: m, value: 0 })));
          return;
        }

        const itemsMonthly = json.itemsMonthly || [];
        // Ensure we have 12 months
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const final = months.map((m) => {
          const found = itemsMonthly.find((it: any) => it.name === m);
          return { name: m, value: found ? Number(found.value) : 0 };
        });
        setBarangData(final);
      } catch (err) {
        console.error('Error loading monthly items:', err);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        setBarangData(months.map(m => ({ name: m, value: 0 })));
      } finally {
        setIsLoading(false);
      }
    };

    loadMonthly();
  }, []);

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
        <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{payload[0].value.toLocaleString()} barang</p>
          <p className="text-xs text-gray-400">{monthNames[payload[0].payload.name]}, {new Date().getFullYear()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Report Barang</h3>
        <button className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 bg-gray-100 rounded-lg text-xs lg:text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
          <CalendarDays size={16} />
          {period}
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="w-full h-64">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : barangData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500 text-sm">Belum ada data barang</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barangData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                domain={[0, yDomainMax]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar 
                dataKey="value" 
                fill="#10B981"
                radius={[8, 8, 0, 0]}
                activeBar={{ fill: '#047857' }}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
