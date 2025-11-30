'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import AlertMessage from '@/components/AlertMessage';
import ItemForm from '@/components/manage-items/ItemForm';
import ItemList from '@/components/manage-items/ItemList';
import { useManageItems, type Item } from '@/lib/hooks/useManageItems';

export default function ManageItems() {
  const {
    items,
    categories,
    lockers,
    isLoading,
    isLoadingItems,
    error,
    success,
    createCategory,
    createItem,
    createMultipleItems,
    updateItem,
    deleteItem,
  } = useManageItems();

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const handleSubmit = async (formData: {
    name: string;
    categoryId: string;
    quantity: number;
    lockerId: string;
    description: string;
  }) => {
    if (editingItem) {
      const result = await updateItem(editingItem.id, formData);
      if (result) {
        setEditingItem(null);
      }
      return result;
    } else {
      return await createItem(formData);
    }
  };

  const handleSubmitMultiple = async (
    itemNames: string[],
    itemQuantities: Record<string, number>,
    categoryId: string,
    lockerId: string,
    description: string
  ) => {
    return await createMultipleItems(itemNames, itemQuantities, categoryId, lockerId, description);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
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
  };

  const handleDelete = async (itemId: string) => {
    await deleteItem(itemId);
    setActiveCardId(null);
  };

  const toggleActions = (itemId: string) => {
    setActiveCardId(activeCardId === itemId ? null : itemId);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--body-bg)] lg:pl-24">
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
                  <ItemForm
                    categories={categories}
                    lockers={lockers}
                    isLoading={isLoading}
                    editingItem={editingItem}
                    onSubmit={handleSubmit}
                    onSubmitMultiple={handleSubmitMultiple}
                    onCancel={handleCancelEdit}
                    onCreateCategory={createCategory}
                  />
                </div>
              </div>

              {/* Right Column: Items List */}
              <div className="lg:col-span-2">
                <ItemList
                  items={items}
                  isLoading={isLoadingItems}
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
