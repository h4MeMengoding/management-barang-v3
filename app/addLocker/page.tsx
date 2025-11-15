'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import LockerCard from '@/components/LockerCard';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function AddLocker() {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [isFormOpen, setIsFormOpen] = useState(true);

  // Dummy data for existing lockers
  const lockers = [
    { id: 1, name: 'Lemari 1', code: 'A-12-B', itemCount: 12, status: 'terisi' as const },
    { id: 2, name: 'Pounch', code: 'C-45-D', itemCount: 8, status: 'terisi' as const },
    { id: 3, name: 'Lemari 2', code: 'E-23-F', itemCount: 15, status: 'terisi' as const },
    { id: 4, name: 'Kabinet A', code: 'G-01-H', itemCount: 0, status: 'kosong' as const },
    { id: 5, name: 'Rak Display', code: 'I-56-J', itemCount: 22, status: 'terisi' as const },
    { id: 6, name: 'Storage Box', code: 'K-78-L', itemCount: 0, status: 'kosong' as const },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', code: '', description: '' });
    // Collapse form after submit
    setIsFormOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
                      <h2 className="text-lg font-bold text-gray-900">Tambah Loker</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Buat loker baru</p>
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
                        Label Loker <span className="text-red-500">*</span>
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
                      <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                        Kode Loker <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
                      />
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
                      Tambah Loker
                    </button>
                  </form>
                )}
              </Card>
            </div>
          </div>

          {/* Right Column: Lockers List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Daftar Loker</h2>
                  <p className="text-sm text-gray-500 mt-1">Kelola semua loker penyimpanan</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-emerald-100 rounded-full text-sm font-semibold text-emerald-700">
                    {lockers.length} Loker
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockers.map((locker) => (
                  <LockerCard
                    key={locker.id}
                    id={locker.id}
                    name={locker.name}
                    code={locker.code}
                    itemCount={locker.itemCount}
                    status={locker.status}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
