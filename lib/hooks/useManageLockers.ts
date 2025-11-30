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
  itemCount: number;
}

interface LockerFormData {
  name: string;
  code: string;
  description: string;
}

export function useManageLockers() {
  const queryClient = useQueryClient();
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLockers, setIsLoadingLockers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const loadLockers = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      const response = await fetch(`/api/lockers?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setLockers(data.lockers);
      }
    } catch (err) {
      console.error('Error loading lockers:', err);
    } finally {
      setIsLoadingLockers(false);
    }
  };

  const generateCode = async (): Promise<string> => {
    setIsGeneratingCode(true);
    try {
      const response = await fetch('/api/lockers/generate-code');
      const data = await response.json();

      if (response.ok) {
        return data.code;
      }
      return '';
    } catch (err) {
      console.error('Error generating code:', err);
      return '';
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const checkCodeAvailability = async (code: string): Promise<{
    available: boolean | null;
    message: string;
  }> => {
    try {
      const res = await fetch(`/api/lockers?code=${encodeURIComponent(code)}`);

      if (res.ok) {
        return { available: false, message: 'Kode sudah digunakan, silakan ganti' };
      } else if (res.status === 404) {
        return { available: true, message: 'Kode tersedia' };
      } else {
        const data = await res.json().catch(() => ({}));
        return { available: null, message: data?.error || 'Gagal memeriksa kode' };
      }
    } catch (err) {
      return { available: null, message: 'Gagal memeriksa kode' };
    }
  };

  const createLocker = async (formData: LockerFormData): Promise<boolean> => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = getCurrentUser();
      if (!user) {
        setError('User tidak ditemukan');
        return false;
      }

      const code = formData.code.trim().toUpperCase();
      const isValidFormat = /^[A-Z]\d{3}$/.test(code);
      if (!isValidFormat) {
        setError('Format kode tidak valid. Gunakan 1 huruf diikuti 3 angka, contoh: A001');
        return false;
      }

      // Check availability one last time
      const availability = await checkCodeAvailability(code);
      if (availability.available === false) {
        setError('Kode sudah digunakan, silakan ganti');
        return false;
      }

      const response = await fetch('/api/lockers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          code,
          description: formData.description,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat locker');
      }

      setSuccess('Locker berhasil dibuat!');
      await loadLockers();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.lockers(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat locker');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setSuccess('');
    setError('');
  };

  const bulkDeleteLockers = async (lockerIds: string[], moveToLockerId?: string): Promise<void> => {
    setError('');
    setSuccess('');

    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error('User tidak ditemukan');
      }

      // If moveToLockerId is provided, move all items first
      if (moveToLockerId) {
        const moveResponse = await fetch('/api/items?bulkMove=true', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fromLockerIds: lockerIds,
            toLockerId: moveToLockerId,
            userId: user.id,
          }),
        });

        if (!moveResponse.ok) {
          const moveData = await moveResponse.json();
          throw new Error(moveData.error || 'Gagal memindahkan items');
        }

        const moveData = await moveResponse.json();
        console.log(`Moved ${moveData.count} items`);
      }

      // Then delete the lockers
      const response = await fetch(`/api/lockers?ids=${lockerIds.join(',')}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus locker');
      }

      setSuccess(data.message || 'Locker berhasil dihapus!');
      await loadLockers();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.lockers(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.items(user.id) });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus locker';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    loadLockers();
  }, []);

  // Auto-clear success message after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return {
    lockers,
    isLoading,
    isLoadingLockers,
    error,
    success,
    isGeneratingCode,
    generateCode,
    checkCodeAvailability,
    createLocker,
    clearMessages,
    bulkDeleteLockers,
  };
}
