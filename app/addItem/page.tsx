'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCurrentUser } from '@/lib/auth';
import { queryKeys } from '@/lib/hooks/useQuery';
import { Plus, ChevronDown, ChevronUp, Package, MoreVertical, Edit2, Trash2, Minus, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Locker {
  id: string;
  name: string;
  code: string;
}

interface Item {
  id: string;
  name: string;
  quantity: number;
  description: string | null;
  categoryId: string;
  lockerId: string;
  category: Category;
  locker: Locker;
  createdAt: string;
}

export default function AddItem() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    categoryInput: '',
    categoryId: '',
    quantity: 0,
    lockerId: '',
    lockerName: '',
    description: ''
  });
  
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLockerDropdown, setShowLockerDropdown] = useState(false);
  const [categorySearchInput, setCategorySearchInput] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const lockerDropdownRef = useRef<HTMLDivElement>(null);

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

    loadData();
  }, []);

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

  useEffect(() => {
    // Close locker dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (lockerDropdownRef.current && !lockerDropdownRef.current.contains(event.target as Node)) {
        setShowLockerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      setIsLoadingItems(true);
      
      // Load items, categories, and lockers in parallel
      const [itemsRes, categoriesRes, lockersRes] = await Promise.all([
        fetch(`/api/items?userId=${user.id}`),
        fetch(`/api/categories?userId=${user.id}`),
        fetch(`/api/lockers?userId=${user.id}`)
      ]);

      const [itemsData, categoriesData, lockersData] = await Promise.all([
        itemsRes.json(),
        categoriesRes.json(),
        lockersRes.json()
      ]);

      if (itemsRes.ok) setItems(itemsData.items);
      if (categoriesRes.ok) {
        setCategories(categoriesData.categories);
        setFilteredCategories(categoriesData.categories);
      }
      if (lockersRes.ok) setLockers(lockersData.lockers);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoadingItems(false);
    }
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

    // Check if category already exists
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (existingCategory) {
      handleCategorySelect(existingCategory);
      return;
    }

    // Create new category
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
        setSuccess('Kategori baru berhasil ditambahkan!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error creating category:', err);
    } finally {
      setIsAddingNewCategory(false);
    }
  };

  const handleLockerSelect = (locker: Locker) => {
    setFormData({
      ...formData,
      lockerId: locker.id,
      lockerName: `${locker.name} (${locker.code})`,
    });
    setShowLockerDropdown(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.categoryId) {
      setError('Silakan pilih kategori atau buat kategori baru dengan menekan Enter');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      setError('User tidak ditemukan');
      return;
    }

    try {
      setIsLoading(true);

      if (editingItem) {
        // Update existing item
        const response = await fetch(`/api/items?id=${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            categoryId: formData.categoryId,
            quantity: formData.quantity,
            lockerId: formData.lockerId,
            description: formData.description || null,
            userId: user.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal mengupdate barang');
        }

        setSuccess('Barang berhasil diupdate!');
        setEditingItem(null);
      } else {
        // Create new item
        const response = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            categoryId: formData.categoryId,
            quantity: formData.quantity,
            lockerId: formData.lockerId,
            description: formData.description || null,
            userId: user.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal menambahkan barang');
        }

        setSuccess('Barang berhasil ditambahkan!');
      }

      setFormData({
        name: '',
        categoryInput: '',
        categoryId: '',
        quantity: 0,
        lockerId: '',
        lockerName: '',
        description: ''
      });
      setIsFormOpen(false);
      await loadData();

      // Invalidate all related queries to update cache
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.items(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryInput: item.category.name,
      categoryId: item.categoryId,
      quantity: item.quantity,
      lockerId: item.lockerId,
      lockerName: `${item.locker.name} (${item.locker.code})`,
      description: item.description || '',
    });
    setIsFormOpen(true);
    setActiveCardId(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      categoryInput: '',
      categoryId: '',
      quantity: 0,
      lockerId: '',
      lockerName: '',
      description: ''
    });
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus barang ini?')) return;

    const user = getCurrentUser();
    if (!user) return;

    try {
      const response = await fetch(`/api/items?id=${itemId}&userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus barang');
      }

      setSuccess('Barang berhasil dihapus!');
      await loadData();
      setActiveCardId(null);

      // Invalidate queries to update cache
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.items(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleActions = (itemId: string) => {
    setActiveCardId(activeCardId === itemId ? null : itemId);
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
                        {editingItem ? 'Edit Barang' : 'Tambah Barang'}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {editingItem ? 'Perbarui barang' : 'Buat barang baru'}
                      </p>
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
                        placeholder="Contoh: Laptop Dell XPS"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
                      />
                    </div>

                    <div className="relative" ref={categoryDropdownRef}>
                      <label htmlFor="categoryInput" className="block text-sm font-semibold text-gray-700 mb-2">
                        Kategori Barang <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          formData.categoryId ? 'border-emerald-500' : 'border-gray-300'
                        } bg-white text-left focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm flex items-center justify-between`}
                      >
                        <span className={formData.categoryInput ? 'text-gray-900' : 'text-gray-400'}>
                          {formData.categoryInput || 'Pilih Kategori'}
                        </span>
                        <ChevronDown 
                          size={18} 
                          className={`text-gray-600 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      
                      {showCategoryDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                          {/* Search input */}
                          <div className="p-3 border-b border-gray-200">
                            <input
                              type="text"
                              value={categorySearchInput}
                              onChange={(e) => setCategorySearchInput(e.target.value)}
                              onKeyDown={handleCategoryKeyDown}
                              placeholder="Cari atau tambah kategori baru..."
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
                              autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-1.5">
                              Tekan Enter untuk menambah kategori baru
                            </p>
                          </div>

                          {/* Categories list */}
                          <div className="max-h-48 overflow-y-auto">
                            {filteredCategories.length === 0 && categorySearchInput ? (
                              <div className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={handleAddNewCategory}
                                  disabled={isAddingNewCategory}
                                  className="w-full px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {isAddingNewCategory ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                                      Menambahkan...
                                    </>
                                  ) : (
                                    <>
                                      <Plus size={16} />
                                      Tambah "{categorySearchInput}"
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : filteredCategories.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                Belum ada kategori
                              </div>
                            ) : (
                              filteredCategories.map((category) => (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={() => handleCategorySelect(category)}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between group"
                                >
                                  <span className="font-medium text-gray-900">{category.name}</span>
                                  {formData.categoryId === category.id && (
                                    <Check size={16} className="text-emerald-600" />
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                        Jumlah Barang <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={decrementQuantity}
                          className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        >
                          <Minus size={18} className="text-gray-700" />
                        </button>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleQuantityChange}
                          required
                          min="0"
                          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-center font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
                        />
                        <button
                          type="button"
                          onClick={incrementQuantity}
                          className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                        >
                          <Plus size={18} className="text-white" />
                        </button>
                      </div>
                    </div>

                    <div className="relative" ref={lockerDropdownRef}>
                      <label htmlFor="lockerId" className="block text-sm font-semibold text-gray-700 mb-2">
                        Loker <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowLockerDropdown(!showLockerDropdown)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          formData.lockerId ? 'border-emerald-500' : 'border-gray-300'
                        } bg-white text-left focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm flex items-center justify-between`}
                      >
                        <span className={formData.lockerName ? 'text-gray-900' : 'text-gray-400'}>
                          {formData.lockerName || 'Pilih Loker'}
                        </span>
                        <ChevronDown 
                          size={18} 
                          className={`text-gray-600 transition-transform ${showLockerDropdown ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      
                      {showLockerDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {lockers.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-amber-600">
                              Belum ada loker. Silakan buat loker terlebih dahulu.
                            </div>
                          ) : (
                            lockers.map((locker) => (
                              <button
                                key={locker.id}
                                type="button"
                                onClick={() => handleLockerSelect(locker)}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between group"
                              >
                                <div>
                                  <div className="font-medium text-gray-900">{locker.name}</div>
                                  <div className="text-xs text-gray-500">{locker.code}</div>
                                </div>
                                {formData.lockerId === locker.id && (
                                  <Check size={16} className="text-emerald-600" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
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
                        placeholder="Deskripsi barang (opsional)"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isLoading || lockers.length === 0}
                        className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            {editingItem ? 'Mengupdate...' : 'Menambah...'}
                          </>
                        ) : (
                          <>
                            <Plus size={20} />
                            {editingItem ? 'Update Barang' : 'Tambah Barang'}
                          </>
                        )}
                      </button>
                      {editingItem && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                        >
                          Batal
                        </button>
                      )}
                    </div>
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

              {isLoadingItems ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-lg border border-gray-100 bg-white animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                          <div className="flex items-center justify-between mt-2">
                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">Belum ada barang. Tambahkan barang pertama Anda!</p>
                </div>
              ) : (
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
                              <p className="text-xs text-gray-500 mt-0.5">{item.category.name}</p>
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
                            <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">{item.locker.name} ({item.locker.code})</p>
                        </div>
                      </div>
                      {activeCardId === item.id && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEdit(item)}
                              className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="flex-1 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <Trash2 size={14} />
                              Hapus
                            </button>
                          </div>
                        </div>
                      )}
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
