import React from 'react';
import Card from './Card';
import MaintenanceItem from './MaintenanceItem';
import { Package } from 'lucide-react';

export default function MaintenanceRequests() {
  const lokers = [
    {
      icon: <Package size={20} className="text-blue-600" />,
      title: 'Lemari 1',
      subtitle: 'A-12-B',
      description: '12 Barang',
      personName: '',
      personImage: ''
    },
    {
      icon: <Package size={20} className="text-purple-600" />,
      title: 'Pounch',
      subtitle: 'C-45-D',
      description: '8 Barang',
      personName: '',
      personImage: ''
    },
    {
      icon: <Package size={20} className="text-green-600" />,
      title: 'Lemari 2',
      subtitle: 'E-23-F',
      description: '15 Barang',
      personName: '',
      personImage: ''
    }
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Loker</h3>
        <button className="text-xs lg:text-sm text-gray-600 hover:text-gray-900">
          See All
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {lokers.map((loker, index) => (
          <MaintenanceItem key={index} {...loker} />
        ))}
      </div>
    </Card>
  );
}
