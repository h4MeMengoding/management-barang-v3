'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import CategoryForm from '@/components/categories/CategoryForm';
import CategoryList from '@/components/categories/CategoryList';
import AlertMessage from '@/components/AlertMessage';
import { useManageCategories, Category } from '@/lib/hooks/useManageCategories';

export default function ManageCategories() {
  const {
    categories,
    isLoading,
    isLoadingCategories,
    error,
    success,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useManageCategories();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const handleSubmit = async (formData: { name: string; description: string }) => {
    const result = editingCategory
      ? await updateCategory(editingCategory.id, formData)
      : await createCategory(formData);

    if (result) {
      setEditingCategory(null);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setActiveCardId(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    
    await deleteCategory(categoryId);
    setActiveCardId(null);
  };

  const toggleActions = (categoryId: string) => {
    setActiveCardId(activeCardId === categoryId ? null : categoryId);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)] lg:pl-24">
        <Sidebar />

        <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Header />

            {success && <AlertMessage type="success" message={success} />}
            {error && <AlertMessage type="error" message={error} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form - Sticky on Desktop */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-6">
                  <CategoryForm
                    isLoading={isLoading}
                    editingCategory={editingCategory}
                    onSubmit={handleSubmit}
                    onCancel={handleCancelEdit}
                  />
                </div>
              </div>

              {/* Right Column: Categories List */}
              <div className="lg:col-span-2">
                <CategoryList
                  categories={categories}
                  isLoading={isLoadingCategories}
                  activeCardId={activeCardId}
                  onToggleActions={toggleActions}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
