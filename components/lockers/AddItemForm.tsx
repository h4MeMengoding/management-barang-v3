import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, ChevronDown, Check, Trash2 } from 'lucide-react';
import { Category } from '@/lib/hooks/useLockerDetail';

interface ItemField {
  id: string;
  name: string;
  categoryId: string;
  quantity: number;
  description: string;
  isExpanded: boolean;
}

interface AddItemFormProps {
  lockerName: string;
  categories: Category[];
  onSubmit: (data: {
    items: Array<{ name: string; quantity: number; }>;
    categoryId: string;
    description: string;
  }) => Promise<void>;
  onCreateCategory: (name: string) => Promise<Category>;
}

export default function AddItemForm({
  lockerName,
  categories,
  onSubmit,
  onCreateCategory,
}: AddItemFormProps) {
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
  });

  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState<string | null>(null);
  const [categorySearchInputs, setCategorySearchInputs] = useState<Record<string, string>>({});
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const categoryDropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
        setFormSuccess('Kategori baru berhasil ditambahkan!');
        setTimeout(() => setFormSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error creating category:', err);
    } finally {
      setIsAddingNewCategory(false);
    }
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const validItems = itemFields.filter((field) => field.name.trim() !== '');
    
    if (validItems.length === 0) {
      setFormError('Silakan masukkan minimal satu nama barang');
      return;
    }

    // Check if we have category
    const hasCategorySet = validItems.some(item => item.categoryId) || globalFields.categoryId;
    if (!hasCategorySet) {
      setFormError('Silakan pilih kategori atau buat kategori baru dengan menekan Enter');
      return;
    }

    try {
      setIsSubmitting(true);

      // Group items by their final category ID
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

      // Submit each category group separately
      const submissionPromises = Object.entries(itemsByCategory).map(([categoryId, items]) => {
        return onSubmit({
          items: items.map(item => ({ name: item.name, quantity: item.quantity })),
          categoryId,
          description: items[0].description, // Use first item's description for the batch
        });
      });

      await Promise.all(submissionPromises);

      const totalItems = validItems.length;
      setFormSuccess(`${totalItems} barang berhasil ditambahkan!`);
      
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
      });

      setTimeout(() => setFormSuccess(''), 2000);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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
            className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${
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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Tambah Barang Baru</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Ke loker: <span className="font-semibold text-[var(--color-primary)]">{lockerName}</span>
        </p>
      </div>

      {formError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
          {formSuccess}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Item Fields */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Nama Barang <span className="text-red-500">*</span>
            </label>
            {itemFields.length < 10 && (
              <button
                type="button"
                onClick={addItemField}
                className="px-3 py-1.5 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5"
              >
                <Plus size={14} />
                Tambah Barang
              </button>
            )}
          </div>

          {itemFields.map((field, index) => (
            <div
              key={field.id}
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
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                  />
                </div>
                {itemFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemField(field.id)}
                    className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Collapsible Individual Settings */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => toggleItemExpansion(field.id)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[var(--surface-1)] hover:bg-[var(--surface-3)] rounded-lg transition-colors"
                >
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    Pengaturan Individual {field.isExpanded ? '(Collapse)' : '(Expand)'}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`text-[var(--text-tertiary)] transition-transform ${field.isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {field.isExpanded && (
                  <div className="space-y-3 mt-3">
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
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Global Settings Divider */}
        {itemFields.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--divider)]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 py-1 bg-white dark:bg-[var(--surface-1)] text-xs font-medium text-[var(--text-secondary)]">
                Pengaturan Global (Berlaku untuk semua barang)
              </span>
            </div>
          </div>
        )}

        {/* Global Category */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Kategori Global {globalFields.categoryId && <span className="text-red-500">*</span>}
          </label>
          <CategoryDropdown categoryId={globalFields.categoryId} />
          {globalFields.categoryId && (
            <p className="mt-1.5 text-xs text-[var(--color-info)]">
              Kategori ini akan diterapkan ke semua barang yang tidak memiliki kategori individual
            </p>
          )}
        </div>

        {/* Global Quantity */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Jumlah Global
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (globalFields.quantity > 0) {
                  setGlobalFields({ ...globalFields, quantity: globalFields.quantity - 1 });
                }
              }}
              className="w-10 h-10 flex items-center justify-center bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg transition-colors"
            >
              <Minus size={18} className="text-[var(--text-primary)]" />
            </button>
            <input
              type="number"
              value={globalFields.quantity}
              onChange={(e) =>
                setGlobalFields({ ...globalFields, quantity: parseInt(e.target.value) || 0 })
              }
              min="0"
              className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] text-center font-semibold focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => setGlobalFields({ ...globalFields, quantity: globalFields.quantity + 1 })}
              className="w-10 h-10 flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg transition-colors"
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
          {globalFields.categoryId && (
            <p className="mt-1.5 text-xs text-[var(--color-info)]">
              Jumlah ini akan diterapkan ke barang yang menggunakan kategori global
            </p>
          )}
        </div>

        {/* Global Description */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Deskripsi Global
          </label>
          <textarea
            value={globalFields.description}
            onChange={(e) => setGlobalFields({ ...globalFields, description: e.target.value })}
            rows={3}
            placeholder="Deskripsi yang akan diterapkan ke semua barang..."
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors resize-none text-sm"
          />
          {globalFields.description && (
            <p className="mt-1.5 text-xs text-[var(--color-info)]">
              Deskripsi ini akan diterapkan ke barang yang tidak memiliki deskripsi individual
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-[var(--text-tertiary)] text-white font-bold rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Menambahkan...
            </>
          ) : (
            <>
              <Plus size={20} />
              Tambah {itemFields.filter(f => f.name.trim()).length > 1 ? `${itemFields.filter(f => f.name.trim()).length} Barang` : 'Barang'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
