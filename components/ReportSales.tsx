'use client';

import React, { useState } from 'react';
import Card from './Card';
import BarChart from './BarChart';
import { CalendarDays, ChevronDown } from 'lucide-react';

export default function ReportSales() {
  const [period, setPeriod] = useState('Weekday');

  const salesData = [
    { label: 'Mon', value: 3200 },
    { label: 'Tue', value: 3700 },
    { label: 'Wed', value: 3600 },
    { label: 'Thu', value: 4000 },
    { label: 'Fri', value: 3500 },
    { label: 'Sat', value: 3400 },
    { label: 'Sun', value: 3300 }
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Report Sales</h3>
        <button className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 bg-gray-100 rounded-lg text-xs lg:text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
          <CalendarDays size={16} />
          {period}
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>$4000</span>
          <span>$3000</span>
          <span>$2000</span>
          <span>$0</span>
        </div>
      </div>

      <BarChart data={salesData} />
    </Card>
  );
}
