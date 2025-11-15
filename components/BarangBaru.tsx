import React from 'react';
import Card from './Card';
import BarangBaruItem from './BarangBaruItem';
import { Cable, Plug, Usb, HardDrive, Monitor, Keyboard, Mouse, Smartphone } from 'lucide-react';

export default function BarangBaru() {
  const barangList = [
    {
      icon: <Cable size={20} className="text-blue-600" />,
      name: 'Kabel HDMI',
      date: '12 Nov 2024, 9:29',
      quantity: 'x1',
      bgColor: 'bg-blue-100'
    },
    {
      icon: <Plug size={20} className="text-purple-600" />,
      name: 'Adaptor DC',
      date: '10 Nov 2024, 9:29',
      quantity: 'x2',
      bgColor: 'bg-purple-100'
    },
    {
      icon: <Usb size={20} className="text-green-600" />,
      name: 'USB Hub 4 Port',
      date: '8 Nov 2024, 9:29',
      quantity: 'x3',
      bgColor: 'bg-green-100'
    },
    {
      icon: <HardDrive size={20} className="text-orange-600" />,
      name: 'External Hard Drive',
      date: '7 Nov 2024, 10:15',
      quantity: 'x1',
      bgColor: 'bg-orange-100'
    },
    {
      icon: <Monitor size={20} className="text-cyan-600" />,
      name: 'Monitor LED 24 inch',
      date: '6 Nov 2024, 14:30',
      quantity: 'x2',
      bgColor: 'bg-cyan-100'
    }
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Barang Baru</h3>
        <button className="text-xs lg:text-sm text-gray-600 hover:text-gray-900">
          See All
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {barangList.map((barang, index) => (
          <BarangBaruItem key={index} {...barang} />
        ))}
      </div>
    </Card>
  );
}
