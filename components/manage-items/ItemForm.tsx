'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/Card';
import { Plus, ChevronDown, Minus, Check, X, Edit2 } from 'lucide-react';
import type { Category, Locker, Item } from '@/lib/hooks/useManageItems';

interface ItemFormProps {
  categories: Category[];
  lockers: Locker[];
  isLoading: boolean;
  editingItem: Item | null;
  onSubmit: (formData: {
    name: string;
    categoryId: string;
    quantity: number;
    lockerId: string;
    description: string;
  }) => Promise<boolean>;
  onSubmitMultiple?: (
    itemNames: string[],
    itemQuantities: Record<string, number>,
    categoryId: string,
    lockerId: string,
    description: string
  ) => Promise<boolean>;
  onCancel: () => void;
  onCreateCategory: (name: string) => Promise<Category | null>;
}

export default function ItemForm({
  categories,
  lockers,
  isLoading,
  editingItem,
  onSubmit,
  onSubmitMultiple,
  onCancel,
  onCreateCategory,
}: ItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    categoryInput: '',
    categoryId: '',
    quantity: 1,
    lockerId: '',
    lockerName: '',
    description: '',
  });

  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLockerDropdown, setShowLockerDropdown] = useState(false);
  const [categorySearchInput, setCategorySearchInput] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const lockerDropdownRef = useRef<HTMLDivElement>(null);

  // Parse item names from comma-separated input
  const parsedItemNames = formData.name
    .split(',')
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  const isMultipleItems = parsedItemNames.length > 1;

  useEffect(() => {
    // Collapse the form by default on mobile
    if (typeof window !== 'undefined') {
      try {
        if (window.innerWidth < 1024) {
          setIsFormOpen(false);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    // Filter categories based on search input
    if (categorySearchInput) {
      const filtered = categories.filter((cat) =>
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
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
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
      if (
        lockerDropdownRef.current &&
        !lockerDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLockerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Populate form when editing
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        categoryInput: editingItem.category.name,
        categoryId: editingItem.categoryId,
        quantity: editingItem.quantity,
        lockerId: editingItem.lockerId,
        lockerName: `${editingItem.locker.name} (${editingItem.locker.code})`,
        description: editingItem.description || '',
      });
      setIsFormOpen(true);
    }
  }, [editingItem]);

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
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (existingCategory) {
      handleCategorySelect(existingCategory);
      return;
    }

    // Create new category
    try {
      setIsAddingNewCategory(true);
      const newCategory = await onCreateCategory(categoryName);

      if (newCategory) {
        handleCategorySelect(newCategory);
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
      setItemQuantities((prev) => ({ ...prev, [itemName]: value }));
    }
  };

  const incrementIndividualQuantity = (itemName: string) => {
    setItemQuantities((prev) => ({ ...prev, [itemName]: (prev[itemName] || 0) + 1 }));
  };

  const decrementIndividualQuantity = (itemName: string) => {
    setItemQuantities((prev) => {
      const current = prev[itemName] || 0;
      if (current > 0) {
        return { ...prev, [itemName]: current - 1 };
      }
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let success = false;

    if (editingItem) {
      // Update existing item
      success = await onSubmit({
        name: formData.name,
        categoryId: formData.categoryId,
        quantity: formData.quantity,
        lockerId: formData.lockerId,
        description: formData.description,
      });
    } else {
      // Create new item(s)
      if (isMultipleItems && onSubmitMultiple) {
        success = await onSubmitMultiple(
          parsedItemNames,
          itemQuantities,
          formData.categoryId,
          formData.lockerId,
          formData.description
        );
      } else {
        success = await onSubmit({
          name: formData.name,
          categoryId: formData.categoryId,
          quantity: formData.quantity,
          lockerId: formData.lockerId,
          description: formData.description,
        });
      }
    }

    if (success) {
      // Reset form
      setFormData({
        name: '',
        categoryInput: '',
        categoryId: '',
        quantity: 1,
        lockerId: '',
        lockerName: '',
        description: '',
      });
      setItemQuantities({});
      setIsFormOpen(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancelEdit = () => {
    onCancel();
    setFormData({
      name: '',
      categoryInput: '',
      categoryId: '',
      quantity: 1,
      lockerId: '',
      lockerName: '',
      description: '',
    });
  };

  return (
    <Card>
      <motion.button
        onClick={() => setIsFormOpen(!isFormOpen)}
        className="w-full flex items-center justify-between gap-3 hover:opacity-80 transition-opacity"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0"
            animate={
              editingItem
                ? {
                    backgroundColor: [
                      'rgba(var(--color-primary-rgb), 0.1)',
                      'rgba(var(--color-primary-rgb), 0.2)',
                      'rgba(var(--color-primary-rgb), 0.1)',
                    ],
                  }
                : {}
            }
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
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-[var(--text-primary)] mb-2"
              >
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
                  💡 <span className="font-medium">Tips:</span> Pisahkan dengan koma (,) untuk
                  menambahkan beberapa barang sekaligus
                </p>
              )}
              {isMultipleItems && !editingItem && (
                <p className="mt-1.5 text-xs text-[var(--color-success)] font-medium">
                  ✓ Terdeteksi {parsedItemNames.length} barang. Isi jumlah untuk setiap barang di
                  bawah.
                </p>
              )}
            </div>

            <div className="relative" ref={categoryDropdownRef}>
              <label
                htmlFor="categoryInput"
                className="block text-sm font-semibold text-[var(--text-primary)] mb-2"
              >
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
                <span
                  className={
                    formData.categoryInput
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-tertiary)]'
                  }
                >
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
                              Tambah &quot;{categorySearchInput}&quot;
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
                          <span className="font-medium text-[var(--text-primary)]">
                            {category.name}
                          </span>
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
                        onChange={(e) =>
                          handleIndividualQuantityChange(
                            itemName,
                            parseInt(e.target.value) || 0
                          )
                        }
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
                <label
                  htmlFor="quantity"
                  className="block text-sm font-semibold text-[var(--text-primary)] mb-2"
                >
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
              <label
                htmlFor="lockerId"
                className="block text-sm font-semibold text-[var(--text-primary)] mb-2"
              >
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
                <span
                  className={
                    formData.lockerName
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-tertiary)]'
                  }
                >
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
                          <div className="font-medium text-[var(--text-primary)]">
                            {locker.name}
                          </div>
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
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-[var(--text-primary)] mb-2"
              >
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

      {/* Edit Mode Indicator - Mobile */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            className="mt-4 lg:hidden p-3 bg-[var(--color-info)]/10 border border-[var(--color-info)]/30 rounded-lg flex items-center justify-between gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Edit2 size={16} className="text-[var(--color-info)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-info)]">Mode Edit</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Mengedit: {editingItem.name}
                </p>
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
    </Card>
  );
}
