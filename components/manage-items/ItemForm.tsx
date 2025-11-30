'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/Card';
import { Plus, ChevronDown, Minus, Check, X, Edit2, Trash2 } from 'lucide-react';
import type { Category, Locker, Item } from '@/lib/hooks/useManageItems';

interface ItemField {
  id: string;
  name: string;
  categoryId: string;
  quantity: number;
  description: string;
  isExpanded: boolean;
}

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
  // Item fields for multiple items
  const [itemFields, setItemFields] = useState<ItemField[]>([
    {
      id: '1',
      name: '',
      categoryId: '',
      quantity: 1,
      description: '',
      isExpanded: false,
    },
  ]);

  // Global fields that override all items
  const [globalFields, setGlobalFields] = useState({
    categoryId: '',
    quantity: 1,
    description: '',
    lockerId: '',
    lockerName: '',
  });

  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState<string | null>(null);
  const [showLockerDropdown, setShowLockerDropdown] = useState(false);
  const [categorySearchInputs, setCategorySearchInputs] = useState<Record<string, string>>({});
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);

  const categoryDropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lockerDropdownRef = useRef<HTMLDivElement>(null);

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
    const activeSearchInput = activeCategoryDropdown ? (categorySearchInputs[activeCategoryDropdown] || '') : '';
    if (activeSearchInput) {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(activeSearchInput.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categorySearchInputs, categories, activeCategoryDropdown]);

  useEffect(() => {
    // Close category dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutsideAll = Object.values(categoryDropdownRefs.current).every(
        (ref) => !ref || !ref.contains(event.target as Node)
      );
      
      if (clickedOutsideAll) {
        setActiveCategoryDropdown(null);
        setCategorySearchInputs({});
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
      setItemFields([
        {
          id: '1',
          name: editingItem.name,
          categoryId: editingItem.categoryId,
          quantity: editingItem.quantity,
          description: editingItem.description || '',
          isExpanded: false,
        },
      ]);
      setGlobalFields({
        categoryId: '',
        quantity: 1,
        description: '',
        lockerId: editingItem.lockerId,
        lockerName: `${editingItem.locker.name} (${editingItem.locker.code})`,
      });
      setIsFormOpen(true);
    }
  }, [editingItem]);

  // Add new item field
  const addItemField = () => {
    const newId = (Math.max(...itemFields.map((f) => parseInt(f.id))) + 1).toString();
    setItemFields([
      ...itemFields,
      {
        id: newId,
        name: '',
        categoryId: '',
        quantity: 1,
        description: '',
        isExpanded: false,
      },
    ]);
  };

  // Remove item field
  const removeItemField = (id: string) => {
    if (itemFields.length > 1) {
      setItemFields(itemFields.filter((field) => field.id !== id));
    }
  };

  // Update item field
  const updateItemField = (id: string, updates: Partial<ItemField>) => {
    setItemFields(
      itemFields.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  // Toggle item field expansion
  const toggleItemExpansion = (id: string) => {
    setItemFields(
      itemFields.map((field) =>
        field.id === id ? { ...field, isExpanded: !field.isExpanded } : field
      )
    );
  };

  const handleCategorySelect = (category: Category, fieldId?: string) => {
    if (fieldId) {
      // Update individual item field
      updateItemField(fieldId, { categoryId: category.id });
    } else {
      // Update global category
      setGlobalFields({
        ...globalFields,
        categoryId: category.id,
      });
    }
    setActiveCategoryDropdown(null);
    setCategorySearchInputs({});
    setIsAddingNewCategory(false);
  };

  const handleAddNewCategory = async (fieldId?: string) => {
    const dropdownId = fieldId || 'global';
    const categoryName = (categorySearchInputs[dropdownId] || '').trim();
    if (!categoryName) return;

    // Check if category already exists
    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (existingCategory) {
      handleCategorySelect(existingCategory, fieldId);
      return;
    }

    // Create new category
    try {
      setIsAddingNewCategory(true);
      const newCategory = await onCreateCategory(categoryName);

      if (newCategory) {
        handleCategorySelect(newCategory, fieldId);
      }
    } catch (err) {
      console.error('Error creating category:', err);
    } finally {
      setIsAddingNewCategory(false);
    }
  };

  const handleLockerSelect = (locker: Locker) => {
    setGlobalFields({
      ...globalFields,
      lockerId: locker.id,
      lockerName: `${locker.name} (${locker.code})`,
    });
    setShowLockerDropdown(false);
  };

  const handleCategoryKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, fieldId?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleAddNewCategory(fieldId);
    }
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let success = false;

    if (editingItem) {
      // Update existing item (single item only)
      const field = itemFields[0];
      success = await onSubmit({
        name: field.name,
        categoryId: field.categoryId || globalFields.categoryId,
        quantity: field.quantity,
        lockerId: globalFields.lockerId,
        description: field.description || globalFields.description,
      });
    } else {
      // Create new item(s)
      const validItems = itemFields.filter((field) => field.name.trim() !== '');
      
      if (validItems.length === 0) {
        return;
      }

      if (validItems.length === 1) {
        // Single item
        const field = validItems[0];
        const finalCategoryId = field.categoryId || globalFields.categoryId;
        const finalQuantity = field.categoryId ? field.quantity : globalFields.quantity;
        const finalDescription = field.description || globalFields.description;

        success = await onSubmit({
          name: field.name,
          categoryId: finalCategoryId,
          quantity: finalQuantity,
          lockerId: globalFields.lockerId,
          description: finalDescription,
        });
      } else {
        // Multiple items - group by category and submit each group
        const itemsByCategory: Record<string, Array<{ 
          name: string; 
          quantity: number;
          description: string;
        }>> = {};

        validItems.forEach((field) => {
          const finalCategoryId = field.categoryId || globalFields.categoryId;
          const finalQuantity = field.categoryId ? field.quantity : globalFields.quantity;
          const finalDescription = field.description || globalFields.description;

          if (!itemsByCategory[finalCategoryId]) {
            itemsByCategory[finalCategoryId] = [];
          }

          itemsByCategory[finalCategoryId].push({
            name: field.name,
            quantity: finalQuantity,
            description: finalDescription,
          });
        });

        // Submit each category group
        const submissionPromises = Object.entries(itemsByCategory).map(async ([categoryId, items]) => {
          if (items.length === 1 && onSubmitMultiple) {
            // Single item in this category
            return await onSubmit({
              name: items[0].name,
              categoryId,
              quantity: items[0].quantity,
              lockerId: globalFields.lockerId,
              description: items[0].description,
            });
          } else if (onSubmitMultiple) {
            // Multiple items in this category
            const itemNames = items.map(item => item.name);
            const itemQuantities: Record<string, number> = {};
            items.forEach(item => {
              itemQuantities[item.name] = item.quantity;
            });

            return await onSubmitMultiple(
              itemNames,
              itemQuantities,
              categoryId,
              globalFields.lockerId,
              items[0].description,
            );
          }
          return false;
        });

        const results = await Promise.all(submissionPromises);
        success = results.every(result => result === true);
      }
    }

    if (success) {
      // Reset form
      setItemFields([
        {
          id: '1',
          name: '',
          categoryId: '',
          quantity: 1,
          description: '',
          isExpanded: false,
        },
      ]);
      setGlobalFields({
        categoryId: '',
        quantity: 1,
        description: '',
        lockerId: '',
        lockerName: '',
      });
      setIsFormOpen(false);
    }
  };

  const handleCancelEdit = () => {
    onCancel();
    setItemFields([
      {
        id: '1',
        name: '',
        categoryId: '',
        quantity: 1,
        description: '',
        isExpanded: false,
      },
    ]);
    setGlobalFields({
      categoryId: '',
      quantity: 1,
      description: '',
      lockerId: '',
      lockerName: '',
    });
  };

  // Category Dropdown Component
  const CategoryDropdown = ({ fieldId, categoryId }: { fieldId?: string; categoryId: string }) => {
    const dropdownId = fieldId || 'global';
    const isActive = activeCategoryDropdown === dropdownId;
    const categoryName = getCategoryName(categoryId);
    const searchInput = categorySearchInputs[dropdownId] || '';
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto focus when dropdown becomes active
    useEffect(() => {
      if (isActive && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isActive]);
    
    return (
      <div className="relative" ref={(el) => { categoryDropdownRefs.current[dropdownId] = el; }}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={isActive ? searchInput : categoryName}
            onChange={(e) => {
              setCategorySearchInputs(prev => ({ ...prev, [dropdownId]: e.target.value }));
              if (!isActive) {
                setActiveCategoryDropdown(dropdownId);
              }
            }}
            onFocus={() => {
              setActiveCategoryDropdown(dropdownId);
            }}
            onClick={() => {
              setActiveCategoryDropdown(dropdownId);
            }}
            onKeyDown={(e) => handleCategoryKeyDown(e, fieldId)}
            className={`w-full px-4 py-3 pr-10 rounded-lg border ${
              categoryId ? 'border-[var(--color-primary)]' : 'border-[var(--border)]'
            } bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm`}
            placeholder="Cari atau buat kategori baru"
          />
          <ChevronDown 
            size={18} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
          />
        </div>

        {isActive && (
          <div className="absolute z-20 w-full mt-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category, fieldId)}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--surface-2)] transition-colors flex items-center justify-between group"
                >
                  <span className="font-medium text-[var(--text-primary)]">
                    {category.name}
                  </span>
                  {categoryId === category.id && (
                    <Check size={16} className="text-[var(--color-primary)]" />
                  )}
                </button>
              ))
            ) : null}
            
            {searchInput && !filteredCategories.some(c => c.name.toLowerCase() === searchInput.toLowerCase()) && (
              <button
                type="button"
                onClick={() => handleAddNewCategory(fieldId)}
                disabled={isAddingNewCategory}
                className="w-full px-4 py-2.5 text-left bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-semibold text-sm transition-colors border-t border-[var(--border)]"
              >
                {isAddingNewCategory ? 'Menambahkan...' : `+ Buat kategori "${searchInput}"`}
              </button>
            )}
          </div>
        )}
      </div>
    );
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
            {/* Item Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Nama Barang <span className="text-red-500">*</span>
                </label>
                {!editingItem && itemFields.length < 10 && (
                  <motion.button
                    type="button"
                    onClick={addItemField}
                    className="px-3 py-1.5 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={14} />
                    Tambah Barang
                  </motion.button>
                )}
              </div>

              {itemFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-[var(--surface-2)] rounded-lg border border-[var(--border)]"
                >
                  {/* Item Name */}
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateItemField(field.id, { name: e.target.value })}
                        required
                        placeholder={`Nama barang ${index + 1}`}
                        className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                      />
                    </div>
                    {!editingItem && itemFields.length > 1 && (
                      <motion.button
                        type="button"
                        onClick={() => removeItemField(field.id)}
                        className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors flex-shrink-0 mt-0.5"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    )}
                  </div>

                  {/* Collapsible Individual Settings */}
                  {!editingItem && (
                    <div className="mt-3">
                      <motion.button
                        type="button"
                        onClick={() => toggleItemExpansion(field.id)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-[var(--surface-1)] hover:bg-[var(--surface-3)] rounded-lg transition-colors"
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                          Pengaturan Individual
                        </span>
                        <motion.div
                          animate={{ rotate: field.isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={16} className="text-[var(--text-tertiary)]" />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {field.isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3 mt-3"
                          >
                            {/* Individual Category */}
                            <div>
                              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                                Kategori
                              </label>
                              <CategoryDropdown fieldId={field.id} categoryId={field.categoryId} />
                              {field.categoryId && (
                                <p className="mt-1 text-xs text-[var(--color-success)]">
                                  Menggunakan kategori: {getCategoryName(field.categoryId)}
                                </p>
                              )}
                            </div>

                            {/* Individual Quantity */}
                            <div>
                              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                                Jumlah
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (field.quantity > 0) {
                                      updateItemField(field.id, { quantity: field.quantity - 1 });
                                    }
                                  }}
                                  className="w-8 h-8 flex items-center justify-center bg-[var(--surface-1)] hover:bg-[var(--surface-3)] rounded-lg transition-colors"
                                >
                                  <Minus size={16} className="text-[var(--text-primary)]" />
                                </button>
                                <input
                                  type="number"
                                  value={field.quantity}
                                  onChange={(e) =>
                                    updateItemField(field.id, { quantity: parseInt(e.target.value) || 0 })
                                  }
                                  min="0"
                                  className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] text-center font-semibold focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateItemField(field.id, { quantity: field.quantity + 1 })}
                                  className="w-8 h-8 flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg transition-colors"
                                >
                                  <Plus size={16} className="text-white" />
                                </button>
                              </div>
                            </div>

                            {/* Individual Description */}
                            <div>
                              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                                Deskripsi
                              </label>
                              <textarea
                                value={field.description}
                                onChange={(e) => updateItemField(field.id, { description: e.target.value })}
                                rows={2}
                                placeholder="Deskripsi khusus untuk barang ini..."
                                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors resize-none text-sm"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Global Settings Divider */}
            {!editingItem && itemFields.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--divider)]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 py-1 bg-[var(--surface-1)] text-xs font-medium text-[var(--text-secondary)]">
                    Pengaturan Global (Berlaku untuk semua barang)
                  </span>
                </div>
              </div>
            )}

            {/* Global Category */}
            {!editingItem && (
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Kategori Global {globalFields.categoryId && <span className="text-red-500">*</span>}
                </label>
                <CategoryDropdown categoryId={globalFields.categoryId} />
                {globalFields.categoryId && (
                  <p className="mt-1.5 text-xs text-[var(--color-info)]">
                    Kategori ini akan diterapkan ke  semua barang yang tidak memiliki kategori individual
                  </p>
                )}
              </div>
            )}

            {/* Global Quantity */}
            {!editingItem && (
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Jumlah Global
                </label>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => {
                      if (globalFields.quantity > 0) {
                        setGlobalFields({ ...globalFields, quantity: globalFields.quantity - 1 });
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg transition-colors"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Minus size={18} className="text-[var(--text-primary)]" />
                  </motion.button>
                  <input
                    type="number"
                    value={globalFields.quantity}
                    onChange={(e) =>
                      setGlobalFields({ ...globalFields, quantity: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                    className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] text-center font-semibold focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setGlobalFields({ ...globalFields, quantity: globalFields.quantity + 1 })}
                    className="w-10 h-10 flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg transition-colors"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Plus size={18} className="text-white" />
                  </motion.button>
                </div>
                {globalFields.categoryId && (
                  <p className="mt-1.5 text-xs text-[var(--color-info)]">
                    Jumlah ini akan diterapkan ke barang yang menggunakan kategori global
                  </p>
                )}
              </div>
            )}

            {/* Locker Selection */}
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
                  globalFields.lockerId ? 'border-[var(--color-primary)]' : 'border-[var(--border)]'
                } bg-[var(--surface-1)] text-left focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm flex items-center justify-between`}
                whileTap={{ scale: 0.98 }}
              >
                <span
                  className={
                    globalFields.lockerName
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-tertiary)]'
                  }
                >
                  {globalFields.lockerName || 'Pilih Loker'}
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
                        {globalFields.lockerId === locker.id && (
                          <Check size={16} className="text-[var(--color-primary)]" />
                        )}
                      </motion.button>
                    ))
                  )}
                </motion.div>
              )}
            </div>

            {/* Global Description */}
            {!editingItem && (
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-[var(--text-primary)] mb-2"
                >
                  Deskripsi Global
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={globalFields.description}
                  onChange={(e) => setGlobalFields({ ...globalFields, description: e.target.value })}
                  rows={4}
                  placeholder="Deskripsi yang akan diterapkan ke semua barang..."
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors resize-none text-sm"
                />
                {globalFields.description && (
                  <p className="mt-1.5 text-xs text-[var(--color-info)]">
                    Deskripsi ini akan diterapkan ke barang yang tidak memiliki deskripsi individual
                  </p>
                )}
              </div>
            )}

            {/* Submit Buttons */}
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
                    {editingItem ? 'Update Barang' : `Tambah ${itemFields.length > 1 ? `${itemFields.filter(f => f.name.trim()).length} Barang` : 'Barang'}`}
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
