'use client';

import React, { useState } from 'react';
import Card from './Card';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportBarang() {
  const [period, setPeriod] = useState('Monthly');

  const barangData = [
    { name: 'Jan', value: 3200 },
    { name: 'Feb', value: 3700 },
    { name: 'Mar', value: 3600 },
    { name: 'Apr', value: 4000 },
    { name: 'May', value: 3500 },
    { name: 'Jun', value: 3400 },
    { name: 'Jul', value: 3800 },
    { name: 'Aug', value: 3900 },
    { name: 'Sep', value: 3300 },
    { name: 'Oct', value: 3600 },
    { name: 'Nov', value: 4100 },
    { name: 'Dec', value: 3700 }
  ];

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
          <p className="text-xs text-gray-400">{monthNames[payload[0].payload.name]}, 2025</p>
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
              ticks={[0, 2000, 3000, 4000]}
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
      </div>
    </Card>
  );
}
