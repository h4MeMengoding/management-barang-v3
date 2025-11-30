'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCurrentUser } from '@/lib/auth';
import { queryKeys } from '@/lib/hooks/useQuery';
import { Plus, ChevronDown, ChevronUp, Package, MoreVertical, Edit2, Trash2, Minus, Check, X } from 'lucide-react';

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
    quantity: 1,
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

  // Parse item names from comma-separated input
  const parsedItemNames = formData.name
    .split(',')
    .map(n => n.trim())
    .filter(n => n.length > 0);
  
  const isMultipleItems = parsedItemNames.length > 1;

  // Individual quantities for each item (when multiple items)
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

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
        // Update existing item (no batch support for edit)
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
        // Create new item(s) - support batch creation
        if (isMultipleItems) {
          // Batch creation for multiple items
          const createPromises = parsedItemNames.map(itemName => {
            const quantity = itemQuantities[itemName] || 1;
            return fetch('/api/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: itemName,
                categoryId: formData.categoryId,
                quantity: quantity,
                lockerId: formData.lockerId,
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

          setSuccess(`${parsedItemNames.length} barang berhasil ditambahkan!`);
        } else {
          // Single item creation
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
      }

      setFormData({
        name: '',
        categoryInput: '',
        categoryId: '',
        quantity: 1,
        lockerId: '',
        lockerName: '',
        description: ''
      });
      setItemQuantities({});
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
    
    // Smooth scroll to form on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      categoryInput: '',
      categoryId: '',
      quantity: 1,
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
    <div className="min-h-screen bg-[var(--body-bg)] lg:pl-24">
      <Sidebar />
      
      <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
        <div className="max-w-7xl mx-auto">
        <Header />

        {/* Success/Error Messages */}
        <AnimatePresence>
        {success && (
          <motion.div 
            className="mb-6 p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[var(--color-success)] text-sm font-medium">{success}</p>
          </motion.div>
        )}
        </AnimatePresence>
        <AnimatePresence>
        {error && (
          <motion.div 
            className="mb-6 p-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[var(--color-danger)] text-sm font-medium">{error}</p>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Edit Mode Indicator - Mobile */}
        <AnimatePresence>
        {editingItem && (
          <motion.div 
            className="mb-4 lg:hidden p-3 bg-[var(--color-info)]/10 border border-[var(--color-info)]/30 rounded-lg flex items-center justify-between gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Edit2 size={16} className="text-[var(--color-info)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-info)]">Mode Edit</p>
                <p className="text-xs text-[var(--text-secondary)]">Mengedit: {editingItem.name}</p>
              </div>
            </div>
            <motion.button
              onClick={handleCancelEdit}
              className="p-1.5 hover:bg-[var(--color-info)]/20 rounded-lg transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} className="text-[var(--color-info)]" />
            </motion.button>
          </motion.div>
        )}
        </AnimatePresence>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form - Sticky on Desktop */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <Card>
                <motion.button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="w-full flex items-center justify-between gap-3 hover:opacity-80 transition-opacity"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0"
                      animate={editingItem ? { 
                        backgroundColor: ['rgba(var(--color-primary-rgb), 0.1)', 'rgba(var(--color-primary-rgb), 0.2)', 'rgba(var(--color-primary-rgb), 0.1)']
                      } : {}}
                      transition={{ duration: 2, repeat: editingItem ? Infinity : 0 }}
                    >
                      <Plus size={24} className="text-[var(--color-primary)]" />
                    </motion.div>
                    <div className="text-left">
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">
                        {editingItem ? 'Edit Barang' : 'Tambah Barang'}
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {editingItem ? 'Perbarui barang' : 'Buat barang baru'}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isFormOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={24} className="text-[var(--text-tertiary)] flex-shrink-0" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                {isFormOpen && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                    onSubmit={handleSubmit} 
                    className="space-y-5 mt-5 pt-5 border-t border-[var(--divider)]"
                  >
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                        Nama Barang <span className="text-red-500">*</span>
                      </label>
                      <motion.input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Nama barang (wajib)"
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      />
                      {!editingItem && (
                        <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                          💡 <span className="font-medium">Tips:</span> Pisahkan dengan koma (,) untuk menambahkan beberapa barang sekaligus
                        </p>
                      )}
                      {isMultipleItems && !editingItem && (
                        <p className="mt-1.5 text-xs text-[var(--color-success)] font-medium">
                          ✓ Terdeteksi {parsedItemNames.length} barang. Isi jumlah untuk setiap barang di bawah.
                        </p>
                      )}
                    </div>

                    <div className="relative" ref={categoryDropdownRef}>
                      <label htmlFor="categoryInput" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                        Kategori Barang <span className="text-red-500">*</span>
                      </label>
                      <motion.button
                        type="button"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          formData.categoryId ? 'border-[var(--color-primary)]' : 'border-[var(--border)]'
                        } bg-[var(--surface-1)] text-left focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm flex items-center justify-between`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className={formData.categoryInput ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}>
                          {formData.categoryInput || 'Pilih Kategori'}
                        </span>
                        <motion.div
                          animate={{ rotate: showCategoryDropdown ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={18} className="text-[var(--text-tertiary)]" />
                        </motion.div>
                      </motion.button>
                      
                      {showCategoryDropdown && (
                        <motion.div 
                          className="absolute z-20 w-full mt-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-hidden"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Search input */}
                          <div className="p-3 border-b border-[var(--divider)]">
                            <input
                              type="text"
                              value={categorySearchInput}
                              onChange={(e) => setCategorySearchInput(e.target.value)}
                              onKeyDown={handleCategoryKeyDown}
                              placeholder="Cari atau tambah kategori baru..."
                              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                              autoFocus
                            />
                            <p className="text-xs text-[var(--text-secondary)] mt-1.5">
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
                                  className="w-full px-3 py-2 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {isAddingNewCategory ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-primary)]"></div>
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
                              <div className="px-4 py-3 text-sm text-[var(--text-secondary)] text-center">
                                Belum ada kategori
                              </div>
                            ) : (
                              filteredCategories.map((category) => (
                                <motion.button
                                  key={category.id}
                                  type="button"
                                  onClick={() => handleCategorySelect(category)}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--surface-2)] transition-colors flex items-center justify-between group"
                                  whileHover={{ x: 4 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <span className="font-medium text-[var(--text-primary)]">{category.name}</span>
                                  {formData.categoryId === category.id && (
                                    <Check size={16} className="text-[var(--color-primary)]" />
                                  )}
                                </motion.button>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Quantity Input - Conditional based on single vs multiple items */}
                    {!editingItem && isMultipleItems ? (
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-[var(--text-primary)]">
                          Jumlah Barang <span className="text-red-500">*</span>
                        </label>
                        {parsedItemNames.map((itemName, index) => (
                          <div key={index}>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                              {itemName}
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => decrementIndividualQuantity(itemName)}
                                className="w-10 h-10 flex items-center justify-center bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg transition-colors"
                              >
                                <Minus size={18} className="text-[var(--text-primary)]" />
                              </button>
                              <input
                                type="number"
                                value={itemQuantities[itemName] || 1}
                                onChange={(e) => handleIndividualQuantityChange(itemName, parseInt(e.target.value) || 0)}
                                required
                                min="0"
                                className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] text-center font-semibold focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => incrementIndividualQuantity(itemName)}
                                className="w-10 h-10 flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg transition-colors"
                              >
                                <Plus size={18} className="text-white" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                          Jumlah Barang <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <motion.button
                            type="button"
                            onClick={decrementQuantity}
                            className="w-10 h-10 flex items-center justify-center bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg transition-colors"
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Minus size={18} className="text-[var(--text-primary)]" />
                          </motion.button>
                          <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleQuantityChange}
                            required
                            min="0"
                            className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] text-center font-semibold focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                          />
                          <motion.button
                            type="button"
                            onClick={incrementQuantity}
                            className="w-10 h-10 flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg transition-colors"
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Plus size={18} className="text-white" />
                          </motion.button>
                        </div>
                      </div>
                    )}

                    <div className="relative" ref={lockerDropdownRef}>
                      <label htmlFor="lockerId" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                        Loker <span className="text-red-500">*</span>
                      </label>
                      <motion.button
                        type="button"
                        onClick={() => setShowLockerDropdown(!showLockerDropdown)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          formData.lockerId ? 'border-[var(--color-primary)]' : 'border-[var(--border)]'
                        } bg-[var(--surface-1)] text-left focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm flex items-center justify-between`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className={formData.lockerName ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}>
                          {formData.lockerName || 'Pilih Loker'}
                        </span>
                        <motion.div
                          animate={{ rotate: showLockerDropdown ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={18} className="text-gray-600" />
                        </motion.div>
                      </motion.button>
                      
                      {showLockerDropdown && (
                        <motion.div 
                          className="absolute z-20 w-full mt-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {lockers.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-[var(--color-warning)]">
                              Belum ada loker. Silakan buat loker terlebih dahulu.
                            </div>
                          ) : (
                            lockers.map((locker) => (
                              <motion.button
                                key={locker.id}
                                type="button"
                                onClick={() => handleLockerSelect(locker)}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--surface-2)] transition-colors flex items-center justify-between group"
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.15 }}
                              >
                                <div>
                                  <div className="font-medium text-[var(--text-primary)]">{locker.name}</div>
                                  <div className="text-xs text-[var(--text-secondary)]">{locker.code}</div>
                                </div>
                                {formData.lockerId === locker.id && (
                                  <Check size={16} className="text-[var(--color-primary)]" />
                                )}
                              </motion.button>
                            ))
                          )}
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                        Deskripsi
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Deskripsi barang (opsional)"
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors resize-none text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        type="submit"
                        disabled={isLoading || lockers.length === 0}
                        className="flex-1 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
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
                      </motion.button>
                      {editingItem && (
                        <motion.button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-3 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] font-semibold rounded-lg transition-colors"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Batal
                        </motion.button>
                      )}
                    </div>
                  </motion.form>
                )}
                </AnimatePresence>
              </Card>
            </div>
          </div>

          {/* Right Column: Items List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Daftar Barang</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Kelola semua barang</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-[var(--color-primary)]/10 rounded-full text-sm font-semibold text-[var(--color-primary)]">
                    {items.length} Barang
                  </span>
                </div>
              </div>

              {isLoadingItems ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-4 bg-[var(--surface-2)] rounded w-3/4" />
                          <div className="h-3 bg-[var(--surface-2)] rounded w-1/3" />
                          <div className="flex items-center justify-between mt-2">
                            <div className="h-3 bg-[var(--surface-2)] rounded w-1/4" />
                            <div className="h-3 bg-[var(--surface-2)] rounded w-1/4" />
                          </div>
                          <div className="h-3 bg-[var(--surface-2)] rounded w-1/2 mt-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
                  <p className="text-[var(--text-secondary)]">Belum ada barang. Tambahkan barang pertama Anda!</p>
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                >
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--color-primary)]/30 hover:shadow-sm transition-all bg-[var(--surface-1)] relative"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -2 }}
                      layout
                    >
                      <div className="flex items-start gap-3">
                        <motion.div 
                          className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0"
                          whileHover={{ rotate: 5, scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Package size={20} className="text-[var(--color-primary)]" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-[var(--text-primary)] text-sm truncate">{item.name}</h3>
                              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.category.name}</p>
                            </div>
                            <motion.button
                              onClick={() => toggleActions(item.id)}
                              className="p-1.5 hover:bg-[var(--surface-2)] rounded-lg transition-colors flex-shrink-0"
                              whileTap={{ scale: 0.9, rotate: 90 }}
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <MoreVertical size={16} className="text-[var(--text-tertiary)]" />
                            </motion.button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-[var(--text-secondary)]">Qty: {item.quantity}</span>
                            <span className="text-xs text-[var(--text-tertiary)]">{formatDate(item.createdAt)}</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">{item.locker.name} ({item.locker.code})</p>
                        </div>
                      </div>
                      <AnimatePresence>
                        {activeCardId === item.id && (
                          <motion.div 
                            className="absolute left-0 right-0 top-full mt-2 bg-[var(--surface-1)] rounded-lg shadow-lg border border-[var(--border)] overflow-hidden z-10"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                          >
                            <div className="flex items-center">
                              <motion.button 
                                onClick={() => handleEdit(item)}
                                className="flex-1 px-4 py-3 text-sm font-medium text-[var(--color-info)] hover:bg-[var(--color-info)]/10 transition-colors flex items-center justify-center gap-2"
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ backgroundColor: 'rgba(var(--color-info-rgb), 0.15)' }}
                              >
                                <Edit2 size={16} />
                                Edit
                              </motion.button>
                              <div className="w-px h-8 bg-[var(--divider)]" />
                              <motion.button 
                                onClick={() => handleDelete(item.id)}
                                className="flex-1 px-4 py-3 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors flex items-center justify-center gap-2"
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ backgroundColor: 'rgba(var(--color-danger-rgb), 0.15)' }}
                              >
                                <Trash2 size={16} />
                                Hapus
                              </motion.button>
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
