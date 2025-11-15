'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { Package, Edit2, Trash2, Download, ArrowLeft, QrCode } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface Item {
  id: number;
  name: string;
  category: string;
  quantity: number;
  addedDate: string;
}

export default function LockerDetail() {
  const router = useRouter();
  const params = useParams();
  const lockerId = params.id as string;

  // Dummy locker data - in real app, fetch based on lockerId
  const locker = {
    id: lockerId,
    name: 'Lemari 1',
    code: 'A-12-B',
    description: 'Lemari penyimpanan utama untuk barang elektronik',
    itemCount: 12,
    status: 'terisi' as const
  };

  // Dummy items in this locker
  const items: Item[] = [
    { id: 1, name: 'Laptop Dell XPS', category: 'Elektronik', quantity: 2, addedDate: '2024-01-15' },
    { id: 2, name: 'Mouse Wireless', category: 'Aksesoris', quantity: 5, addedDate: '2024-01-16' },
    { id: 3, name: 'Keyboard Mechanical', category: 'Aksesoris', quantity: 3, addedDate: '2024-01-18' },
    { id: 4, name: 'Monitor 24 inch', category: 'Elektronik', quantity: 2, addedDate: '2024-01-20' },
    { id: 5, name: 'USB Hub 7 Port', category: 'Aksesoris', quantity: 4, addedDate: '2024-01-22' },
    { id: 6, name: 'Webcam HD', category: 'Elektronik', quantity: 3, addedDate: '2024-01-25' },
    { id: 7, name: 'Headset Gaming', category: 'Aksesoris', quantity: 6, addedDate: '2024-01-28' },
    { id: 8, name: 'SSD External 1TB', category: 'Storage', quantity: 5, addedDate: '2024-02-01' },
    { id: 9, name: 'Kabel HDMI 2m', category: 'Kabel', quantity: 10, addedDate: '2024-02-03' },
    { id: 10, name: 'Power Bank 20000mAh', category: 'Aksesoris', quantity: 8, addedDate: '2024-02-05' },
    { id: 11, name: 'Speaker Bluetooth', category: 'Audio', quantity: 4, addedDate: '2024-02-08' },
    { id: 12, name: 'Mouse Pad Gaming', category: 'Aksesoris', quantity: 7, addedDate: '2024-02-10' },
    { id: 13, name: 'Cooling Pad Laptop', category: 'Aksesoris', quantity: 3, addedDate: '2024-02-12' },
    { id: 14, name: 'Flash Drive 64GB', category: 'Storage', quantity: 12, addedDate: '2024-02-15' },
    { id: 15, name: 'Microphone USB', category: 'Audio', quantity: 2, addedDate: '2024-02-18' },
    { id: 16, name: 'Adapter USB-C', category: 'Aksesoris', quantity: 9, addedDate: '2024-02-20' },
    { id: 17, name: 'Docking Station', category: 'Elektronik', quantity: 2, addedDate: '2024-02-22' },
    { id: 18, name: 'Card Reader SD', category: 'Aksesoris', quantity: 5, addedDate: '2024-02-25' },
    { id: 19, name: 'LAN Cable 5m', category: 'Kabel', quantity: 8, addedDate: '2024-02-28' },
    { id: 20, name: 'Laptop Stand', category: 'Aksesoris', quantity: 4, addedDate: '2024-03-01' },
  ];

  const handleEdit = () => {
    // Handle edit locker
    console.log('Edit locker:', locker.id);
  };

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus loker ini?')) {
      console.log('Delete locker:', locker.id);
      router.push('/addLocker');
    }
  };

  const handleDownloadQR = () => {
    // Handle download QR code
    console.log('Download QR code for:', locker.code);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
      <Sidebar />
      
      <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
        <Header />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Kembali</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Locker Info - Sticky on Desktop */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <Card>
                {/* QR Code Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode size={120} className="text-gray-400" />
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadQR}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors shadow-sm text-sm"
                  >
                    <Download size={16} />
                    Download QR
                  </button>
                </div>

                {/* Locker Info */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{locker.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">Kode: <span className="font-semibold text-gray-700">{locker.code}</span></p>
                  </div>

                  {locker.description && (
                    <p className="text-sm text-gray-600 leading-relaxed pb-4 border-b border-gray-100">
                      {locker.description}
                    </p>
                  )}
                  
                  <div className="space-y-3 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-sm font-semibold text-gray-900 capitalize">{locker.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Barang:</span>
                      <span className="text-sm font-semibold text-gray-900">{locker.itemCount}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleEdit}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <Edit2 size={18} />
                      Edit Loker
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <Trash2 size={18} />
                      Hapus Loker
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column: Items List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Daftar Barang</h2>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">
                  {items.length} Barang
                </span>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Belum ada barang di loker ini</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Package size={24} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">{item.quantity}</span>
                            <span className="text-xs text-gray-400">{item.addedDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
