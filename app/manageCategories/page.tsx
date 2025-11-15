'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { Plus, ChevronDown, ChevronUp, FolderTree, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';

export default function ManageCategories() {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);

  // Dummy data for existing categories
  const categories = [
    { id: 1, name: 'Elektronik', description: 'Perangkat elektronik dan gadget', itemCount: 45, createdAt: '2024-01-10' },
    { id: 2, name: 'Aksesoris', description: 'Aksesoris komputer dan periferalnya', itemCount: 78, createdAt: '2024-01-12' },
    { id: 3, name: 'Storage', description: 'Perangkat penyimpanan data', itemCount: 32, createdAt: '2024-01-15' },
    { id: 4, name: 'Audio', description: 'Perangkat audio dan sound system', itemCount: 18, createdAt: '2024-01-18' },
    { id: 5, name: 'Kabel', description: 'Kabel dan connector berbagai jenis', itemCount: 56, createdAt: '2024-01-20' },
    { id: 6, name: 'Networking', description: 'Perangkat jaringan dan koneksi', itemCount: 24, createdAt: '2024-01-22' },
    { id: 7, name: 'Gaming', description: 'Perangkat gaming dan aksesori', itemCount: 15, createdAt: '2024-01-25' },
    { id: 8, name: 'Office', description: 'Perlengkapan kantor dan ATK', itemCount: 42, createdAt: '2024-01-28' },
    { id: 9, name: 'Furniture', description: 'Perabotan dan meja kantor', itemCount: 12, createdAt: '2024-02-01' },
    { id: 10, name: 'Tools', description: 'Peralatan dan toolkit maintenance', itemCount: 28, createdAt: '2024-02-05' },
    { id: 11, name: 'Charger', description: 'Charger dan adapter daya', itemCount: 38, createdAt: '2024-02-08' },
    { id: 12, name: 'Display', description: 'Monitor dan layar tampilan', itemCount: 19, createdAt: '2024-02-10' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({ name: '', description: '' });
    setIsFormOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleActions = (categoryId: number) => {
    setActiveCardId(activeCardId === categoryId ? null : categoryId);
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
                      <h2 className="text-lg font-bold text-gray-900">Tambah Kategori</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Buat kategori baru</p>
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
                        Nama Kategori <span className="text-red-500">*</span>
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
                      Tambah Kategori
                    </button>
                  </form>
                )}
              </Card>
            </div>
          </div>

          {/* Right Column: Categories List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Daftar Kategori</h2>
                  <p className="text-sm text-gray-500 mt-1">Kelola semua kategori barang</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-emerald-100 rounded-full text-sm font-semibold text-emerald-700">
                    {categories.length} Kategori
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white relative"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <FolderTree size={20} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                          </div>
                          <button
                            onClick={() => toggleActions(category.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                          >
                            <MoreVertical size={16} className="text-gray-600" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-600">{category.itemCount} items</span>
                          <span className="text-xs text-gray-400">{category.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    {activeCardId === category.id && (
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
