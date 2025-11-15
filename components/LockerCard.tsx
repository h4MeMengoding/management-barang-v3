'use client';

import React from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';

interface LockerCardProps {
  id?: number;
  name: string;
  code: string;
  itemCount: number;
  status: 'terisi' | 'kosong';
}

export default function LockerCard({ id = 1, name, code, itemCount, status }: LockerCardProps) {
  const statusColor = status === 'terisi' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600';
  const statusText = status === 'terisi' ? 'Terisi' : 'Kosong';

  return (
    <Link href={`/locker/${id}`}>
      <div className="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Package size={24} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">Kode: {code}</p>
              <p className="text-sm text-gray-700 mt-1.5 font-medium">{itemCount} Barang</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColor}`}>
            {statusText}
          </span>
        </div>
      </div>
    </Link>
  );
}
