import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/components/Card';
import { Category } from '@/lib/hooks/useManageCategories';

interface CategoryFormProps {
  isLoading: boolean;
  editingCategory: Category | null;
  onSubmit: (formData: { name: string; description: string }) => Promise<void>;
  onCancel: () => void;
}

export default function CategoryForm({ 
  isLoading, 
  editingCategory, 
  onSubmit, 
  onCancel 
}: CategoryFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: editingCategory?.name || '',
    description: editingCategory?.description || ''
  });

  // Update form when editing category changes
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || ''
      });
      setIsFormOpen(true);
    }
  }, [editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ name: '', description: '' });
    setIsFormOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    onCancel();
  };

  return (
    <Card>
      <button
        onClick={() => setIsFormOpen(!isFormOpen)}
        className="w-full flex items-center justify-between gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
            <Plus size={24} className="text-[var(--color-primary)]" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {editingCategory ? 'Perbarui kategori' : 'Buat kategori baru'}
            </p>
          </div>
        </div>
        {isFormOpen ? (
          <ChevronUp size={24} className="text-[var(--text-secondary)] flex-shrink-0" />
        ) : (
          <ChevronDown size={24} className="text-[var(--text-secondary)] flex-shrink-0" />
        )}
      </button>

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
                Nama Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Contoh: Elektronik"
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
              />
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
                placeholder="Deskripsi kategori (opsional)"
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors resize-none text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {editingCategory ? 'Mengupdate...' : 'Menambah...'}
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    {editingCategory ? 'Update Kategori' : 'Tambah Kategori'}
                  </>
                )}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-3 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] font-semibold rounded-lg transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </Card>
  );
}
