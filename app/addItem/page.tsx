'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { Plus, ChevronDown, ChevronUp, Package, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function AddItem() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    locker: '',
    description: ''
  });
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);

  // Dummy data for existing items
  const items = [
    { id: 1, name: 'Laptop Dell XFS', category: 'Elektronik', quantity: 2, locker: 'Lemari 1', date: '2024-01-15' },
    { id: 2, name: 'Mouse Wireless', category: 'Aksesoris', quantity: 5, locker: 'Lemari 1', date: '2024-01-16' },
    { id: 3, name: 'Keyboard Mechanical', category: 'Aksesoris', quantity: 3, locker: 'Pounch', date: '2024-01-18' },
    { id: 4, name: 'Monitor 24 inch', category: 'Elektronik', quantity: 2, locker: 'Lemari 2', date: '2024-01-20' },
    { id: 5, name: 'USB Hub 7 Port', category: 'Aksesoris', quantity: 4, locker: 'Lemari 1', date: '2024-01-22' },
    { id: 6, name: 'Webcam HD', category: 'Elektronik', quantity: 3, locker: 'Lemari 2', date: '2024-01-25' },
    { id: 7, name: 'Headset Gaming', category: 'Aksesoris', quantity: 6, locker: 'Pounch', date: '2024-01-28' },
    { id: 8, name: 'SSD External 1TB', category: 'Storage', quantity: 5, locker: 'Kabinet A', date: '2024-02-01' },
    { id: 9, name: 'Kabel HDMI 2m', category: 'Kabel', quantity: 10, locker: 'Rak Display', date: '2024-02-03' },
    { id: 10, name: 'Power Bank 20000mAh', category: 'Aksesoris', quantity: 8, locker: 'Lemari 1', date: '2024-02-05' },
    { id: 11, name: 'Speaker Bluetooth', category: 'Audio', quantity: 4, locker: 'Lemari 2', date: '2024-02-08' },
    { id: 12, name: 'Cooling Pad Laptop', category: 'Aksesoris', quantity: 3, locker: 'Pounch', date: '2024-02-12' },
    { id: 13, name: 'Flash Drive 64GB', category: 'Storage', quantity: 12, locker: 'Lemari 1', date: '2024-02-15' },
    { id: 14, name: 'Microphone USB', category: 'Audio', quantity: 2, locker: 'Kabinet A', date: '2024-02-18' },
    { id: 15, name: 'Mouse Pad Gaming', category: 'Aksesoris', quantity: 7, locker: 'Rak Display', date: '2024-02-10' },
    { id: 16, name: 'Webcam Ring Light', category: 'Elektronik', quantity: 4, locker: 'Lemari 2', date: '2024-02-22' },
    { id: 17, name: 'Adapter USB-C', category: 'Aksesoris', quantity: 9, locker: 'Lemari 1', date: '2024-02-25' },
    { id: 18, name: 'Portable SSD 500GB', category: 'Storage', quantity: 6, locker: 'Kabinet A', date: '2024-02-28' },
    { id: 19, name: 'Wireless Charger', category: 'Aksesoris', quantity: 5, locker: 'Pounch', date: '2024-03-01' },
    { id: 20, name: 'Kabel Lightning 1m', category: 'Kabel', quantity: 15, locker: 'Rak Display', date: '2024-03-05' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({ name: '', category: '', quantity: '', locker: '', description: '' });
    setIsFormOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleActions = (itemId: number) => {
    setActiveCardId(activeCardId === itemId ? null : itemId);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
      <Sidebar />
      
      <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form - Sticky on Desktop */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <Card>
                <button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="w-full flex items-center justify-between gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Plus size={24} className="text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-bold text-gray-900">Tambah Barang</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Buat barang baru</p>
                    </div>
                  </div>
                  {isFormOpen ? (
                    <ChevronUp size={24} className="text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={24} className="text-gray-600 flex-shrink-0" />
                  )}
                </button>

                {isFormOpen && (
                  <form onSubmit={handleSubmit} className="space-y-5 mt-5 pt-5 border-t border-gray-100">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Barang <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                        Kategori Barang <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                        Jumlah Barang <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="locker" className="block text-sm font-semibold text-gray-700 mb-2">
                        Loker <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="locker"
                        name="locker"
                        value={formData.locker}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
                      >
                        <option value="">Pilih Loker</option>
                        <option value="lemari-1">Lemari 1 (A-12-B)</option>
                        <option value="pounch">Pounch (C-45-D)</option>
                        <option value="lemari-2">Lemari 2 (E-23-F)</option>
                        <option value="kabinet-a">Kabinet A (G-01-H)</option>
                        <option value="rak-display">Rak Display (I-56-J)</option>
                        <option value="storage-box">Storage Box (K-78-L)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                        Deskripsi
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Plus size={20} />
                      Tambah Barang
                    </button>
                  </form>
                )}
              </Card>
            </div>
          </div>

          {/* Right Column: Items List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Daftar Barang</h2>
                  <p className="text-sm text-gray-500 mt-1">Kelola semua barang</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-emerald-100 rounded-full text-sm font-semibold text-emerald-700">
                    {items.length} Barang
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white relative"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                          </div>
                          <button
                            onClick={() => toggleActions(item.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                          >
                            <MoreVertical size={16} className="text-gray-600" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                          <span className="text-xs text-gray-400">{item.date}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{item.locker}</p>
                      </div>
                    </div>
                    {activeCardId === item.id && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
                        <div className="flex items-center gap-2">
                          <button className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                            <Edit2 size={14} />
                            Edit
                          </button>
                          <button className="flex-1 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
