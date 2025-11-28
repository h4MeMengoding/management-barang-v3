import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, ChevronDown, Check } from 'lucide-react';
import { Category } from '@/lib/hooks/useLockerDetail';

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
  const [formData, setFormData] = useState({
    name: '',
    categoryInput: '',
    categoryId: '',
    quantity: 1,
    description: ''
  });

  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchInput, setCategorySearchInput] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const parsedItemNames = formData.name
    .split(',')
    .map(n => n.trim())
    .filter(n => n.length > 0);
  
  const isMultipleItems = parsedItemNames.length > 1;

  useEffect(() => {
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

    try {
      setIsAddingNewCategory(true);
      const newCategory = await onCreateCategory(categoryName);
      handleCategorySelect(newCategory);
      setFormSuccess('Kategori baru berhasil ditambahkan!');
      setTimeout(() => setFormSuccess(''), 3000);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.categoryId) {
      setFormError('Silakan pilih kategori atau buat kategori baru dengan menekan Enter');
      return;
    }

    try {
      setIsSubmitting(true);

      const items = isMultipleItems
        ? parsedItemNames.map(name => ({
            name,
            quantity: itemQuantities[name] || 1,
          }))
        : [{ name: formData.name, quantity: formData.quantity }];

      await onSubmit({
        items,
        categoryId: formData.categoryId,
        description: formData.description,
      });

      setFormSuccess(`${items.length} barang berhasil ditambahkan!`);
      setFormData({
        name: '',
        categoryInput: '',
        categoryId: '',
        quantity: 1,
        description: ''
      });
      setItemQuantities({});

      setTimeout(() => setFormSuccess(''), 2000);
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
        {/* Name Input */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Nama Barang <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
            className="w-full px-4 py-2.5 border border-[var(--border)] bg-[var(--surface-1)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
            placeholder="Masukkan nama barang (wajib)"
          />
          <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
            💡 <span className="font-medium">Tips:</span> Pisahkan dengan koma (,) untuk menambahkan beberapa barang sekaligus
          </p>
          {isMultipleItems && (
            <p className="mt-1 text-xs text-[var(--color-primary)] font-medium">
              ✓ Terdeteksi {parsedItemNames.length} barang. Isi jumlah untuk setiap barang di bawah.
            </p>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="relative" ref={categoryDropdownRef}>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
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
              className="w-full px-4 py-2.5 pr-10 border border-[var(--border)] bg-[var(--surface-1)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
              placeholder="Cari atau buat kategori baru"
            />
            <ChevronDown 
              size={20} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
            />
          </div>

          {showCategoryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCategories.length > 0 ? (
                filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className="w-full px-4 py-2.5 text-left hover:bg-[var(--surface-2)] text-sm transition-colors flex items-center justify-between group"
                  >
                    <span className="text-[var(--text-primary)]">{cat.name}</span>
                    {formData.categoryId === cat.id && (
                      <Check size={16} className="text-[var(--color-primary)]" />
                    )}
                  </button>
                ))
              ) : null}
              
              {categorySearchInput && !filteredCategories.some(c => c.name.toLowerCase() === categorySearchInput.toLowerCase()) && (
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  disabled={isAddingNewCategory}
                  className="w-full px-4 py-2.5 text-left bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-semibold text-sm transition-colors border-t border-[var(--border)]"
                >
                  {isAddingNewCategory ? 'Menambahkan...' : `+ Buat kategori "${categorySearchInput}"`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quantity Input */}
        {isMultipleItems ? (
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
                    className="flex-1 px-4 py-2.5 border border-[var(--border)] bg-[var(--surface-1)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm text-center font-semibold text-[var(--text-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => incrementIndividualQuantity(itemName)}
                    className="w-10 h-10 flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Jumlah Barang <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrementQuantity}
                className="w-10 h-10 flex items-center justify-center bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg transition-colors"
              >
                <Minus size={18} className="text-[var(--text-primary)]" />
              </button>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleQuantityChange}
                min="0"
                required
                className="flex-1 px-4 py-2.5 border border-[var(--border)] bg-[var(--surface-1)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm text-center font-semibold text-[var(--text-primary)]"
              />
              <button
                type="button"
                onClick={incrementQuantity}
                className="w-10 h-10 flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Deskripsi (Opsional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            rows={3}
            className="w-full px-4 py-2.5 border border-[var(--border)] bg-[var(--surface-1)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm resize-none placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
            placeholder="Masukkan deskripsi barang (opsional)"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-[var(--text-tertiary)] text-white font-bold rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Menambahkan...' : 'Tambah Barang'}
        </button>
      </form>
    </div>
  );
}
