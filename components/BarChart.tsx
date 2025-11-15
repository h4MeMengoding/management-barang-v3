'use client';

import React, { useState } from 'react';

interface BarChartProps {
  data: {
    label: string;
    value: number;
  }[];
}

export default function BarChart({ data }: BarChartProps) {
  const [activeBar, setActiveBar] = useState<number | null>(3);
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="relative h-48 lg:h-64 flex items-end justify-between gap-2 lg:gap-4">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 100;
        const isActive = activeBar === index;
        
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full flex justify-center">
              {isActive && (
                <div className="absolute -top-14 lg:-top-16 bg-gray-800 text-white px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm whitespace-nowrap">
                  $ {item.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.00
                  <div className="text-[10px] lg:text-xs text-gray-400 mt-0.5 lg:mt-1">{item.label}, 12 Jul</div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              )}
              <div
                className={`w-full rounded-t-lg cursor-pointer transition-all ${
                  isActive ? 'bg-emerald-700' : 'bg-emerald-200'
                }`}
                style={{ height: `${height * 2}px` }}
                onMouseEnter={() => setActiveBar(index)}
                onMouseLeave={() => setActiveBar(3)}
              />
            </div>
            <span className="text-xs lg:text-sm text-gray-500">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
