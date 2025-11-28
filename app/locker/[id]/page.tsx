'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, QrCode, Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import ProtectedRoute from '@/components/ProtectedRoute';
import LockerDetailSkeleton from '@/components/lockers/LockerDetailSkeleton';
import LockerInfo from '@/components/lockers/LockerInfo';
import AddItemForm from '@/components/lockers/AddItemForm';
import LockerItemList from '@/components/lockers/LockerItemList';
import { useLockerDetail } from '@/lib/hooks/useLockerDetail';

export default function LockerDetail() {
  const router = useRouter();
  const params = useParams();
  const lockerId = params.id as string;

  const {
    locker,
    items,
    categories,
    isLoading,
    isLoadingItems,
    error,
    deleteLocker,
    addItem,
    addMultipleItems,
    createCategory,
  } = useLockerDetail(lockerId);

  const [viewMode, setViewMode] = useState<'qr' | 'form'>('qr');

  const handleEdit = () => {
    if (!locker) return;
    console.log('Edit locker:', locker.id);
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus loker ini?')) return;

    try {
      await deleteLocker();
      alert('Loker berhasil dihapus');
      router.push('/manage-locker');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDownloadQR = () => {
    if (!locker?.qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = locker.qrCodeUrl;
    link.download = `QR-${locker.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddItems = async (data: {
    items: Array<{ name: string; quantity: number; }>;
    categoryId: string;
    description: string;
  }) => {
    if (data.items.length === 1) {
      await addItem({
        name: data.items[0].name,
        quantity: data.items[0].quantity,
        categoryId: data.categoryId,
        description: data.description || undefined,
      });
    } else {
      const itemsData = data.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        categoryId: data.categoryId,
        description: data.description || undefined,
      }));
      await addMultipleItems(itemsData);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[var(--background)] lg:pl-24">
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
        <div className="min-h-screen bg-[var(--background)] lg:pl-24">
          <Sidebar />
          <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
            <Header />
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Loker tidak ditemukan'}</p>
              <button
                onClick={() => router.push('/manage-locker')}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)]"
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
  const totalQuantity = items.reduce((s, it) => s + (it.quantity || 0), 0);


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)] lg:pl-24">
        <Sidebar />
        
        <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Header />

            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Kembali</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: QR Code / Add Item Form - Sticky on Desktop */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-6">
                  <Card>
                    {/* Toggle Buttons */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setViewMode('qr')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                          viewMode === 'qr'
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                        }`}
                      >
                        <QrCode size={16} className="inline mr-2" />
                        QR Code
                      </button>
                      <button
                        onClick={() => setViewMode('form')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                          viewMode === 'form'
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                        }`}
                      >
                        <Plus size={16} className="inline mr-2" />
                        Tambah Barang
                      </button>
                    </div>

                    {viewMode === 'qr' ? (
                      <LockerInfo
                        locker={locker}
                        itemCount={itemCount}
                        status={status}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDownloadQR={handleDownloadQR}
                      />
                    ) : (
                      <AddItemForm
                        lockerName={locker.name}
                        categories={categories}
                        onSubmit={handleAddItems}
                        onCreateCategory={createCategory}
                      />
                    )}
                  </Card>
                </div>
              </div>

              {/* Right Column: Items List */}
              <div className="lg:col-span-2">
                <LockerItemList
                  items={items}
                  isLoading={isLoadingItems}
                  totalQuantity={totalQuantity}
                  typesCount={items.length}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
