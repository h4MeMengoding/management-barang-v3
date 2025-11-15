'use client';

import React from 'react';

interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  total: string;
}

export default function DonutChart({ data, total }: DonutChartProps) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const segments = data.map((item) => {
    const percentage = (item.value / totalValue) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle
    };
  });

  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(100, 100, 80, endAngle);
    const end = polarToCartesian(100, 100, 80, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', 80, 80, 0, largeArcFlag, 0, end.x, end.y,
      'L', 100, 100,
      'Z'
    ].join(' ');
  };

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
      <div className="relative w-36 h-36 lg:w-48 lg:h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={createArc(segment.startAngle, segment.endAngle)}
              fill={segment.color}
            />
          ))}
          <circle cx="100" cy="100" r="50" fill="white" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl lg:text-2xl font-bold text-gray-900">{total}</span>
        </div>
      </div>

      <div className="flex flex-row lg:flex-col gap-3 lg:gap-3 flex-wrap justify-center lg:justify-start">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5 lg:gap-2">
            <div
              className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs lg:text-sm text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
