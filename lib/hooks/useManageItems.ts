import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/auth';
import { queryKeys } from './useQuery';

export interface Category {
  id: string;
  name: string;
}

export interface Locker {
  id: string;
  name: string;
  code: string;
}

export interface Item {
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

interface ItemFormData {
  name: string;
  categoryId: string;
  quantity: number;
  lockerId: string;
  description: string;
}

export function useManageItems() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadItems = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const response = await fetch(`/api/items?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Error loading items:', err);
    }
  };

  const loadCategories = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const response = await fetch(`/api/categories?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadLockers = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const response = await fetch(`/api/lockers?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setLockers(data.lockers);
      }
    } catch (err) {
      console.error('Error loading lockers:', err);
    }
  };

  const loadData = async () => {
    try {
      setIsLoadingItems(true);
      await Promise.all([loadItems(), loadCategories(), loadLockers()]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const createCategory = async (name: string): Promise<Category | null> => {
    const user = getCurrentUser();
    if (!user) return null;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCategories([...categories, data.category]);
        setSuccess('Kategori baru berhasil ditambahkan!');
        return data.category;
      }
      return null;
    } catch (err) {
      console.error('Error creating category:', err);
      return null;
    }
  };

  const createItem = async (formData: ItemFormData): Promise<boolean> => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = getCurrentUser();
      if (!user) {
        setError('User tidak ditemukan');
        return false;
      }

      if (!formData.categoryId) {
        setError('Silakan pilih kategori atau buat kategori baru dengan menekan Enter');
        return false;
      }

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
      await loadItems();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.items(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createMultipleItems = async (
    itemNames: string[],
    itemQuantities: Record<string, number>,
    categoryId: string,
    lockerId: string,
    description: string
  ): Promise<boolean> => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = getCurrentUser();
      if (!user) {
        setError('User tidak ditemukan');
        return false;
      }

      if (!categoryId) {
        setError('Silakan pilih kategori atau buat kategori baru dengan menekan Enter');
        return false;
      }

      const createPromises = itemNames.map((itemName) => {
        const quantity = itemQuantities[itemName] || 1;
        return fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: itemName,
            categoryId: categoryId,
            quantity: quantity,
            lockerId: lockerId,
            description: description || null,
            userId: user.id,
          }),
        });
      });

      const responses = await Promise.all(createPromises);
      const failedItems = responses.filter((r) => !r.ok);

      if (failedItems.length > 0) {
        throw new Error(
          `Gagal menambahkan ${failedItems.length} dari ${itemNames.length} barang`
        );
      }

      setSuccess(`${itemNames.length} barang berhasil ditambahkan!`);
      await loadItems();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.items(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (itemId: string, formData: ItemFormData): Promise<boolean> => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = getCurrentUser();
      if (!user) {
        setError('User tidak ditemukan');
        return false;
      }

      const response = await fetch(`/api/items?id=${itemId}`, {
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
      await loadItems();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.items(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (itemId: string): Promise<boolean> => {
    setError('');
    setSuccess('');

    try {
      const user = getCurrentUser();
      if (!user) {
        setError('User tidak ditemukan');
        return false;
      }

      const response = await fetch(`/api/items?id=${itemId}&userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus barang');
      }

      setSuccess('Barang berhasil dihapus!');
      await loadItems();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.items(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const moveItem = async (itemId: string, newLockerId: string): Promise<boolean> => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = getCurrentUser();
      if (!user) {
        setError('User tidak ditemukan');
        return false;
      }

      // Get current item data
      const currentItem = items.find(item => item.id === itemId);
      if (!currentItem) {
        setError('Barang tidak ditemukan');
        return false;
      }

      const response = await fetch(`/api/items?id=${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentItem.name,
          categoryId: currentItem.categoryId,
          quantity: currentItem.quantity,
          lockerId: newLockerId,
          description: currentItem.description || null,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memindahkan barang');
      }

      setSuccess('Barang berhasil dipindahkan!');
      await loadItems();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.items(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setSuccess('');
    setError('');
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return {
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
    moveItem,
    clearMessages,
  };
}
