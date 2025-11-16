'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import ProtectedRoute from '@/components/ProtectedRoute';
import LockerDetailSkeleton from '@/components/LockerDetailSkeleton';
import ItemsListSkeleton from '@/components/ItemsListSkeleton';
import { getCurrentUser } from '@/lib/auth';
import { queryKeys } from '@/lib/hooks/useQuery';
import { Package, Edit2, Trash2, Download, ArrowLeft, QrCode } from 'lucide-react';

interface Locker {
  id: string;
  code: string;
  name: string;
  description: string | null;
  qrCodeUrl: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  quantity: number;
  description: string | null;
  categoryId: string;
  category: Category;
  createdAt: string;
}

export default function LockerDetail() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const lockerId = params.id as string;

  const [locker, setLocker] = useState<Locker | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLocker();
    loadItems();
  }, [lockerId]);

  const loadLocker = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/lockers?id=${lockerId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat data loker');
      }

      setLocker(data.locker);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading locker:', err);
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

      const response = await fetch(`/api/items?lockerId=${lockerId}&userId=${user.id}`);
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
    if (!locker) return;
    // Handle edit locker - TODO: implement edit modal
    console.log('Edit locker:', locker.id);
  };

  const handleDelete = async () => {
    if (!locker) return;
    if (!confirm('Apakah Anda yakin ingin menghapus loker ini?')) return;

    try {
      const response = await fetch(`/api/lockers?id=${locker.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus loker');
      }

      alert('Loker berhasil dihapus');
      router.push('/addLocker');
    } catch (err: any) {
      alert(err.message);
      console.error('Error deleting locker:', err);
    }
  };

  const handleDownloadQR = () => {
    if (!locker?.qrCodeUrl) return;
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = locker.qrCodeUrl;
    link.download = `QR-${locker.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
          <Sidebar />
          <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
            <Header />
            <LockerDetailSkeleton />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !locker) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
          <Sidebar />
          <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
            <Header />
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error || 'Loker tidak ditemukan'}</p>
              <button
                onClick={() => router.push('/addLocker')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Kembali ke Daftar Loker
              </button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const itemCount = items.length;
  const status = itemCount > 0 ? 'terisi' : 'kosong';


  return (
    <ProtectedRoute>
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
                    {locker.qrCodeUrl ? (
                      <img 
                        src={locker.qrCodeUrl} 
                        alt={`QR Code ${locker.code}`}
                        className="w-48 h-48 rounded-lg"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <QrCode size={120} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleDownloadQR}
                    disabled={!locker.qrCodeUrl}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <div className={`w-2 h-2 rounded-full ${status === 'terisi' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm font-semibold text-gray-900 capitalize">{status}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Barang:</span>
                      <span className="text-sm font-semibold text-gray-900">{itemCount}</span>
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

              {isLoadingItems ? (
                <ItemsListSkeleton />
              ) : items.length === 0 ? (
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
                          <p className="text-xs text-gray-500 mb-2">{item.category.name}</p>
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
      </main>
    </div>
    </ProtectedRoute>
  );
}
