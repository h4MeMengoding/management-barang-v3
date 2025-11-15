import React from 'react';
import Card from './Card';
import DonutChart from './DonutChart';

export default function CostBreakdown() {
  const costData = [
    { label: 'Maintenance', value: 40, color: '#86EFAC' },
    { label: 'Repair', value: 20, color: '#FDE047' },
    { label: 'Taxes', value: 15, color: '#BAE6FD' },
    { label: 'Saving', value: 25, color: '#C7D2FE' }
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Cost Breakdown</h3>
        <button className="text-xs lg:text-sm text-gray-600 hover:text-gray-900">
          See Details
        </button>
      </div>

      <DonutChart data={costData} total="$ 4,750" />
    </Card>
  );
}
