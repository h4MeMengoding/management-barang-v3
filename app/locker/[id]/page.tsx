'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Package, Edit2, Trash2, Download, ArrowLeft, QrCode, Plus, ChevronDown, Minus, Check } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'qr' | 'form'>('qr');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    categoryInput: '',
    categoryId: '',
    quantity: 1,
    description: ''
  });

  // Parse item names from comma-separated input
  const parsedItemNames = formData.name
    .split(',')
    .map(n => n.trim())
    .filter(n => n.length > 0);
  
  const isMultipleItems = parsedItemNames.length > 1;

  // Individual quantities for each item (when multiple items)
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchInput, setCategorySearchInput] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLocker();
    loadItems();
    loadCategories();
  }, [lockerId]);

  useEffect(() => {
    // Filter categories based on search input
    if (categorySearchInput) {
      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(categorySearchInput.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categorySearchInput, categories]);

  useEffect(() => {
    // Close category dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
        setCategorySearchInput('');
        setIsAddingNewCategory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const loadCategories = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      const response = await fetch(`/api/categories?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories || []);
        setFilteredCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
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
      router.push('/manage-locker');
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

  const handleCategorySelect = (category: Category) => {
    setFormData({
      ...formData,
      categoryInput: category.name,
      categoryId: category.id,
    });
    setShowCategoryDropdown(false);
    setCategorySearchInput('');
    setIsAddingNewCategory(false);
  };

  const handleAddNewCategory = async () => {
    const categoryName = categorySearchInput.trim();
    if (!categoryName) return;

    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (existingCategory) {
      handleCategorySelect(existingCategory);
      return;
    }

    const user = getCurrentUser();
    if (!user) return;

    try {
      setIsAddingNewCategory(true);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryName,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCategories([...categories, data.category]);
        handleCategorySelect(data.category);
        setFormSuccess('Kategori baru berhasil ditambahkan!');
        setTimeout(() => setFormSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error creating category:', err);
    } finally {
      setIsAddingNewCategory(false);
    }
  };

  const handleCategoryKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleAddNewCategory();
    }
  };

  const incrementQuantity = () => {
    setFormData({ ...formData, quantity: formData.quantity + 1 });
  };

  const decrementQuantity = () => {
    if (formData.quantity > 0) {
      setFormData({ ...formData, quantity: formData.quantity - 1 });
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 0) {
      setFormData({ ...formData, quantity: value });
    }
  };

  const handleIndividualQuantityChange = (itemName: string, value: number) => {
    if (value >= 0) {
      setItemQuantities(prev => ({ ...prev, [itemName]: value }));
    }
  };

  const incrementIndividualQuantity = (itemName: string) => {
    setItemQuantities(prev => ({ ...prev, [itemName]: (prev[itemName] || 0) + 1 }));
  };

  const decrementIndividualQuantity = (itemName: string) => {
    setItemQuantities(prev => {
      const current = prev[itemName] || 0;
      if (current > 0) {
        return { ...prev, [itemName]: current - 1 };
      }
      return prev;
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.categoryId) {
      setFormError('Silakan pilih kategori atau buat kategori baru dengan menekan Enter');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      setFormError('User tidak ditemukan');
      return;
    }

    try {
      setIsSubmitting(true);

      // Support batch creation for multiple items
      if (isMultipleItems) {
        const createPromises = parsedItemNames.map(itemName => {
          const quantity = itemQuantities[itemName] || 0;
          return fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: itemName,
              categoryId: formData.categoryId,
              quantity: quantity,
              lockerId: lockerId,
              description: formData.description || null,
              userId: user.id,
            }),
          });
        });

        const responses = await Promise.all(createPromises);
        const failedItems = responses.filter(r => !r.ok);

        if (failedItems.length > 0) {
          throw new Error(`Gagal menambahkan ${failedItems.length} dari ${parsedItemNames.length} barang`);
        }

        setFormSuccess(`${parsedItemNames.length} barang berhasil ditambahkan!`);
      } else {
        // Single item creation
        const response = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            categoryId: formData.categoryId,
            quantity: formData.quantity,
            lockerId: lockerId,
            description: formData.description || null,
            userId: user.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal menambahkan barang');
        }

        setFormSuccess('Barang berhasil ditambahkan!');
      }
      setFormData({
        name: '',
        categoryInput: '',
        categoryId: '',
        quantity: 1,
        description: ''
      });
      setItemQuantities({});
      
      await loadItems();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.items(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.locker(lockerId) });

      setTimeout(() => {
        setFormSuccess('');
        setViewMode('qr');
      }, 2000);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
                onClick={() => router.push('/manage-locker')}
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
  const typesCount = items.length;
  const totalQuantity = items.reduce((s, it) => s + (it.quantity || 0), 0);
  const nf = new Intl.NumberFormat('id-ID');


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
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <QrCode size={16} className="inline mr-2" />
                    QR Code
                  </button>
                  <button
                    onClick={() => setViewMode('form')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                      viewMode === 'form'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Tambah Barang
                  </button>
                </div>

                {viewMode === 'qr' ? (
                  <>
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
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                        >
                          <Edit2 size={18} />
                          Edit Loker
                        </button>
                        <button
                          onClick={handleDelete}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-400 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors shadow-sm"
                        >
                          <Trash2 size={18} />
                          Hapus Loker
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Add Item Form */}
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Tambah Barang Baru</h2>
                        <p className="text-sm text-gray-500">Ke loker: <span className="font-semibold text-emerald-600">{locker.name}</span></p>
                      </div>

                      {formError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                          {formError}
                        </div>
                      )}

                      {formSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                          {formSuccess}
                        </div>
                      )}

                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Name Input */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nama Barang <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder:text-gray-400 text-gray-900"
                            placeholder="Masukkan nama barang (wajib)"
                          />
                          <p className="mt-1.5 text-xs text-gray-500">
                            💡 <span className="font-medium">Tips:</span> Pisahkan dengan koma (,) untuk menambahkan beberapa barang sekaligus
                          </p>
                          {isMultipleItems && (
                            <p className="mt-1 text-xs text-emerald-600 font-medium">
                              ✓ Terdeteksi {parsedItemNames.length} barang. Isi jumlah untuk setiap barang di bawah.
                            </p>
                          )}
                        </div>

                        {/* Category Dropdown */}
                        <div className="relative" ref={categoryDropdownRef}>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Kategori <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={showCategoryDropdown ? categorySearchInput : formData.categoryInput}
                              onChange={(e) => {
                                setCategorySearchInput(e.target.value);
                                setShowCategoryDropdown(true);
                              }}
                              onFocus={() => setShowCategoryDropdown(true)}
                              onKeyDown={handleCategoryKeyDown}
                              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder:text-gray-400 text-gray-900"
                              placeholder="Cari atau buat kategori baru"
                            />
                            <ChevronDown 
                              size={20} 
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                          </div>

                          {showCategoryDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {filteredCategories.length > 0 ? (
                                filteredCategories.map(cat => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategorySelect(cat)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-sm transition-colors flex items-center justify-between group plac"
                                  >
                                    <span className="text-gray-900">{cat.name}</span>
                                    {formData.categoryId === cat.id && (
                                      <Check size={16} className="text-emerald-600" />
                                    )}
                                  </button>
                                ))
                              ) : null}
                              
                              {categorySearchInput && !filteredCategories.some(c => c.name.toLowerCase() === categorySearchInput.toLowerCase()) && (
                                <button
                                  type="button"
                                  onClick={handleAddNewCategory}
                                  disabled={isAddingNewCategory}
                                  className="w-full px-4 py-2.5 text-left bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm transition-colors border-t border-emerald-200"
                                >
                                  {isAddingNewCategory ? 'Menambahkan...' : `+ Buat kategori "${categorySearchInput}"`}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quantity Input - Conditional based on single vs multiple items */}
                        {isMultipleItems ? (
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">
                              Jumlah Barang <span className="text-red-500">*</span>
                            </label>
                            {parsedItemNames.map((itemName, index) => (
                              <div key={index}>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                  {itemName}
                                </label>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => decrementIndividualQuantity(itemName)}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                  >
                                    <Minus size={18} className="text-gray-700" />
                                  </button>
                                  <input
                                    type="number"
                                    value={itemQuantities[itemName] || 0}
                                    onChange={(e) => handleIndividualQuantityChange(itemName, parseInt(e.target.value) || 0)}
                                    required
                                    min="0"
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-center font-semibold text-gray-900"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => incrementIndividualQuantity(itemName)}
                                    className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                  >
                                    <Plus size={18} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Jumlah Barang <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={decrementQuantity}
                                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <Minus size={18} className="text-gray-700" />
                              </button>
                              <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleQuantityChange}
                                min="0"
                                required
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-center font-semibold text-gray-900"
                              />
                              <button
                                type="button"
                                onClick={incrementQuantity}
                                className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Deskripsi (Opsional)
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleFormChange}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none placeholder:text-gray-400 text-gray-900"
                            placeholder="Masukkan deskripsi barang (opsional)"
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Menambahkan...' : 'Tambah Barang'}
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>

          {/* Right Column: Items List */}
          <div className="lg:col-span-2">
            <Card>
                <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Daftar Barang</h2>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">
                  {nf.format(totalQuantity)} Barang • {typesCount} Jenis
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
                            <span className="inline">{item.name}</span>
                            <span className="ml-2 text-sm font-medium text-emerald-600">×{item.quantity}</span>
                          </h3>
                          <p className="text-xs text-gray-500 mb-2">{item.category.name}</p>
                          <div className="flex items-center justify-between">
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
