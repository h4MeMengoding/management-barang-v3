'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCurrentUser } from '@/lib/auth';
import { queryKeys } from '@/lib/hooks/useQuery';
import { Plus, ChevronDown, ChevronUp, FolderTree, Edit2, Trash2, MoreVertical } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  totalQuantity?: number;
}

export default function ManageCategories() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    // Collapse the form by default on mobile (width < 1024px)
    if (typeof window !== 'undefined') {
      try {
        if (window.innerWidth < 1024) {
          setIsFormOpen(false);
        }
      } catch (e) {
        // ignore
      }
    }

    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const user = getCurrentUser();
      if (!user) return;

      const response = await fetch(`/api/categories?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat kategori');
      }

      setCategories(data.categories);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setIsLoading(true);

      const user = getCurrentUser();
      if (!user) {
        setError('User tidak ditemukan');
        return;
      }

      if (editingCategory) {
        // Update existing category
        const response = await fetch(`/api/categories?id=${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || null,
            userId: user.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal mengupdate kategori');
        }

        setSuccess('Kategori berhasil diupdate!');
        setEditingCategory(null);
      } else {
        // Create new category
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || null,
            userId: user.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal membuat kategori');
        }

        setSuccess('Kategori berhasil ditambahkan!');
      }

      setFormData({ name: '', description: '' });
      setIsFormOpen(false);
      await loadCategories();

      // Invalidate queries
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.categories(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setIsFormOpen(true);
    setActiveCardId(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;

    const user = getCurrentUser();
    if (!user) return;

    try {
      const response = await fetch(`/api/categories?id=${categoryId}&userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus kategori');
      }

      setSuccess('Kategori berhasil dihapus!');
      await loadCategories();
      setActiveCardId(null);

      // Invalidate queries
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.categories(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleActions = (categoryId: string) => {
    setActiveCardId(activeCardId === categoryId ? null : categoryId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
      <Sidebar />
      
      <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
        <div className="max-w-7xl mx-auto">
        <Header />

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}
        
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
                      <h2 className="text-lg font-bold text-gray-900">
                        {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {editingCategory ? 'Perbarui kategori' : 'Buat kategori baru'}
                      </p>
                    </div>
                  </div>
                  {isFormOpen ? (
                    <ChevronUp size={24} className="text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={24} className="text-gray-600 flex-shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                {isFormOpen && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                    onSubmit={handleSubmit} 
                    className="space-y-5 mt-5 pt-5 border-t border-gray-100"
                  >
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
                        placeholder="Contoh: Elektronik"
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
                        placeholder="Deskripsi kategori (opsional)"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            {editingCategory ? 'Mengupdate...' : 'Menambah...'}
                          </>
                        ) : (
                          <>
                            <Plus size={20} />
                            {editingCategory ? 'Update Kategori' : 'Tambah Kategori'}
                          </>
                        )}
                      </button>
                      {editingCategory && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </motion.form>
                )}
                </AnimatePresence>
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

              {isLoadingCategories ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-lg border border-gray-100 bg-white animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                          <div className="mt-3 flex items-center justify-between">
                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                            <div className="h-4 bg-gray-200 rounded w-1/6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12">
                  <FolderTree size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">Belum ada kategori. Tambahkan kategori pertama Anda!</p>
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                      },
                    },
                  }}
                >
                  {categories.map((category) => (
                    <motion.div
                      key={category.id}
                      className="relative"
                      variants={{
                        hidden: { opacity: 0, scale: 0.95 },
                        visible: { opacity: 1, scale: 1 },
                      }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -4 }}
                    >
                      <Link href={`/category/${category.id}`}>
                        <div className="p-4 rounded-lg border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all bg-white cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <FolderTree size={20} className="text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {category.description || 'Tidak ada deskripsi'}
                                  </p>
                                </div>
                                <motion.button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleActions(category.id);
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0 z-10"
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <MoreVertical size={16} className="text-gray-600" />
                                </motion.button>
                              </div>
                              <div className="mt-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-400">{formatDate(category.createdAt)}</span>
                                  <span className="text-sm font-semibold text-gray-900">{category.totalQuantity ?? 0} Barang</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <AnimatePresence>
                        {activeCardId === category.id && (
                          <motion.div 
                            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleEdit(category)}
                                className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <Edit2 size={14} />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(category.id)}
                                className="flex-1 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <Trash2 size={14} />
                                Hapus
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </Card>
          </div>
        </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
