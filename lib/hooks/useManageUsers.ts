import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  profilePicture?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    items: number;
    lockers: number;
    categories: number;
  };
}

export function useManageUsers() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/signin');
      return;
    }

    // Cek apakah user adalah admin
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setCurrentUser(user);
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch('/api/users');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Gagal memuat data user');
      }
    } catch (error) {
      console.error('Load users error:', error);
      setError('Terjadi kesalahan saat memuat data user');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const createUser = async (formData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<boolean> => {
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email) {
      setError('Nama dan email harus diisi');
      return false;
    }

    if (!formData.password) {
      setError('Password harus diisi');
      return false;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menambahkan user');
      }

      setSuccess('User berhasil ditambahkan!');
      loadUsers();

      setTimeout(() => setSuccess(''), 3000);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (
    userId: string,
    formData: {
      name: string;
      email: string;
      password?: string;
      role: string;
    }
  ): Promise<boolean> => {
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email) {
      setError('Nama dan email harus diisi');
      return false;
    }

    setIsLoading(true);

    try {
      const body: any = {
        userId,
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui user');
      }

      setSuccess('User berhasil diperbarui!');
      setEditingUser(null);
      loadUsers();

      setTimeout(() => setSuccess(''), 3000);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (user: User): Promise<boolean> => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus user "${user.name || user.email}"?\n\nSemua data terkait (items, lockers, categories) akan ikut terhapus.`
      )
    ) {
      return false;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/users?userId=${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus user');
      }

      setSuccess('User berhasil dihapus!');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return false;
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  return {
    currentUser,
    users,
    isLoading,
    isLoadingUsers,
    error,
    success,
    editingUser,
    createUser,
    updateUser,
    deleteUser,
    startEdit,
    cancelEdit,
  };
}
