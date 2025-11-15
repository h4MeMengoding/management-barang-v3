'use client';

import React from 'react';
import Card from './Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ReportLoker() {
  const lokerData = [
    { name: 'Loker A123A', value: 450, color: '#86EFAC' },
    { name: 'Loker B456B', value: 380, color: '#FDE047' },
    { name: 'Loker C789C', value: 320, color: '#BAE6FD' },
    { name: 'Loker D234D', value: 290, color: '#C7D2FE' },
    { name: 'Loker E567E', value: 410, color: '#FCA5A5' },
    { name: 'Loker F890F', value: 350, color: '#FDBA74' },
    { name: 'Loker G123G', value: 275, color: '#A7F3D0' },
    { name: 'Loker H456H', value: 395, color: '#DDD6FE' },
    { name: 'Loker I789I', value: 330, color: '#FED7AA' },
    { name: 'Loker J234J', value: 285, color: '#BFDBFE' },
    { name: 'Loker K567K', value: 420, color: '#D1FAE5' },
    { name: 'Loker L890L', value: 310, color: '#FEF3C7' },
    { name: 'Loker M123M', value: 365, color: '#E9D5FF' },
    { name: 'Loker N456N', value: 340, color: '#FBCFE8' },
    { name: 'Loker O789O', value: 375, color: '#CCFBF1' },
    { name: 'Loker P234P', value: 295, color: '#FCE7F3' },
    { name: 'Loker Q567Q', value: 385, color: '#FEF9C3' },
    { name: 'Loker R890R', value: 315, color: '#E0E7FF' },
    { name: 'Loker S123S', value: 355, color: '#FECACA' },
    { name: 'Loker T456T', value: 405, color: '#BAE6FD' }
  ];

  const total = lokerData.reduce((sum, item) => sum + item.value, 0);

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
        <div className="relative w-40 h-40 lg:w-48 lg:h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 lg:gap-x-6 lg:gap-y-2.5 flex-1">
          {lokerData.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600 truncate">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
