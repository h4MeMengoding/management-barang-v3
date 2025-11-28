import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/auth';
import { queryKeys } from './useQuery';

export interface Locker {
  id: string;
  code: string;
  name: string;
  description: string | null;
  qrCodeUrl: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  description: string | null;
  categoryId: string;
  category: Category;
  createdAt: string;
}

export function useLockerDetail(lockerId: string) {
  const queryClient = useQueryClient();
  const [locker, setLocker] = useState<Locker | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState('');

  const loadLocker = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/lockers?id=${lockerId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat data loker');
      }

      setLocker(data.locker);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading locker:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      setIsLoadingItems(true);
      const user = getCurrentUser();
      if (!user) {
        console.error('User not found');
        return;
      }

      const response = await fetch(`/api/items?lockerId=${lockerId}&userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setItems(data.items || []);
      } else {
        console.error('Error loading items:', data.error);
      }
    } catch (err: any) {
      console.error('Error loading items:', err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const loadCategories = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      const response = await fetch(`/api/categories?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const deleteLocker = async () => {
    if (!locker) return false;

    try {
      const response = await fetch(`/api/lockers?id=${locker.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus loker');
      }

      return true;
    } catch (err: any) {
      console.error('Error deleting locker:', err);
      throw err;
    }
  };

  const addItem = async (itemData: {
    name: string;
    categoryId: string;
    quantity: number;
    description?: string;
  }) => {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...itemData,
        lockerId: lockerId,
        userId: user.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Gagal menambahkan barang');
    }

    await loadItems();

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: queryKeys.items(user.id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.locker(lockerId) });

    return data;
  };

  const addMultipleItems = async (itemsData: Array<{
    name: string;
    categoryId: string;
    quantity: number;
    description?: string;
  }>) => {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    const createPromises = itemsData.map(item =>
      fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          lockerId: lockerId,
          userId: user.id,
        }),
      })
    );

    const responses = await Promise.all(createPromises);
    const failedItems = responses.filter(r => !r.ok);

    if (failedItems.length > 0) {
      throw new Error(`Gagal menambahkan ${failedItems.length} dari ${itemsData.length} barang`);
    }

    await loadItems();

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: queryKeys.items(user.id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.locker(lockerId) });
  };

  const createCategory = async (categoryName: string) => {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: categoryName,
        userId: user.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Gagal membuat kategori');
    }

    setCategories([...categories, data.category]);
    return data.category;
  };

  useEffect(() => {
    loadLocker();
    loadItems();
    loadCategories();
  }, [lockerId]);

  return {
    locker,
    items,
    categories,
    isLoading,
    isLoadingItems,
    error,
    deleteLocker,
    addItem,
    addMultipleItems,
    createCategory,
    refreshItems: loadItems,
  };
}
