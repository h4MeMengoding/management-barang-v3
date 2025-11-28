'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import ProtectedRoute from '@/components/ProtectedRoute';
import CategoryDetailSkeleton from '@/components/categories/CategoryDetailSkeleton';
import ItemsListSkeleton from '@/components/ItemsListSkeleton';
import { getCurrentUser } from '@/lib/auth';
import { Package, Edit2, Trash2, ArrowLeft, FolderTree } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  totalQuantity?: number;
}

interface Locker {
  id: string;
  code: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  quantity: number;
  description: string | null;
  lockerId: string;
  locker: Locker;
  createdAt: string;
}

export default function CategoryDetail() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategory();
    loadItems();
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      setIsLoading(true);
      const user = getCurrentUser();
      if (!user) {
        setError('User tidak ditemukan');
        return;
      }

      const response = await fetch(`/api/categories?id=${categoryId}&userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat data kategori');
      }

      setCategory(data.category);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading category:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      setIsLoadingItems(true);
      const user = getCurrentUser();
      if (!user) {
        console.error('User not found');
        return;
      }

      const response = await fetch(`/api/items?categoryId=${categoryId}&userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setItems(data.items || []);
      } else {
        console.error('Error loading items:', data.error);
      }
    } catch (err: any) {
      console.error('Error loading items:', err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = () => {
    if (!category) return;
    // Redirect to manage categories page with edit mode
    router.push('/manage-categories');
  };

  const handleDelete = async () => {
    if (!category) return;
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;

    try {
      const user = getCurrentUser();
      if (!user) return;

      const response = await fetch(`/api/categories?id=${category.id}&userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus kategori');
      }

      alert('Kategori berhasil dihapus');
      router.push('/manage-categories');
    } catch (err: any) {
      alert(err.message);
      console.error('Error deleting category:', err);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
          <Sidebar />
          <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
            <Header />
            <CategoryDetailSkeleton />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !category) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
          <Sidebar />
          <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
            <Header />
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error || 'Kategori tidak ditemukan'}</p>
              <button
                onClick={() => router.push('/manage-categories')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Kembali ke Daftar Kategori
              </button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemTypeCount = items.length;

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
      <Sidebar />
      
      <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
        <div className="max-w-7xl mx-auto">
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
          {/* Left Column: Category Info - Sticky on Desktop */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <Card>
                {/* Category Icon */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-32 h-32 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <FolderTree size={64} className="text-emerald-600" />
                  </div>
                </div>

                {/* Category Info */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">Kategori Barang</p>
                  </div>

                  {category.description && (
                    <p className="text-sm text-gray-600 leading-relaxed pb-4 border-b border-gray-100">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="space-y-3 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Barang:</span>
                      <span className="text-sm font-semibold text-gray-900">{totalQuantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Jenis Barang:</span>
                      <span className="text-sm font-semibold text-gray-900">{itemTypeCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dibuat:</span>
                      <span className="text-sm font-semibold text-gray-900">{formatDate(category.createdAt)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleEdit}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <Edit2 size={18} />
                      Edit Kategori
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <Trash2 size={18} />
                      Hapus Kategori
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
                  {items.length} Jenis
                </span>
              </div>

              {isLoadingItems ? (
                <ItemsListSkeleton />
              ) : items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Belum ada barang di kategori ini</p>
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
                          <p className="text-xs text-gray-500 mb-2">{item.locker.code} - {item.locker.name}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">{item.quantity}</span>
                            <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
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
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
