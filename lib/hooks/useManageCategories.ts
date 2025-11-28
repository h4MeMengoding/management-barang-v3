import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/auth';
import { queryKeys } from './useQuery';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  totalQuantity?: number;
}

interface CategoryFormData {
  name: string;
  description: string;
}

export function useManageCategories() {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const user = getCurrentUser();
      if (!user) return;

      const response = await fetch(`/api/categories?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat kategori');
      }

      setCategories(data.categories);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const createCategory = async (formData: CategoryFormData) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error('User tidak ditemukan');
      }

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat kategori');
      }

      setSuccess('Kategori berhasil ditambahkan!');
      await loadCategories();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.categories(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (categoryId: string, formData: CategoryFormData) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error('User tidak ditemukan');
      }

      const response = await fetch(`/api/categories?id=${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupdate kategori');
      }

      setSuccess('Kategori berhasil diupdate!');
      await loadCategories();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.categories(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    const user = getCurrentUser();
    if (!user) return false;

    try {
      const response = await fetch(`/api/categories?id=${categoryId}&userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus kategori');
      }

      setSuccess('Kategori berhasil dihapus!');
      await loadCategories();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.categories(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const clearMessages = () => {
    setSuccess('');
    setError('');
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return {
    categories,
    isLoading,
    isLoadingCategories,
    error,
    success,
    createCategory,
    updateCategory,
    deleteCategory,
    clearMessages,
  };
}
