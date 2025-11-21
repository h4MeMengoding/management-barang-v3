'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCurrentUser } from '@/lib/auth';
import { Plus, ChevronDown, ChevronUp, Users, Edit2, Trash2, Eye, EyeOff, Shield, User as UserIcon } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
    lockers: number;
    categories: number;
  };
}

export default function ManageUsers() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

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

    // Collapse form on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsFormOpen(false);
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email) {
      setError('Nama dan email harus diisi');
      return;
    }

    if (!editingUser && !formData.password) {
      setError('Password harus diisi');
      return;
    }

    setIsLoading(true);

    try {
      const url = '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      const body: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (editingUser) {
        body.userId = editingUser.id;
        if (formData.password) {
          body.password = formData.password;
        }
      } else {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan user');
      }

      setSuccess(editingUser ? 'User berhasil diperbarui!' : 'User berhasil ditambahkan!');
      resetForm();
      loadUsers();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      password: '',
      role: user.role,
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${user.name || user.email}"?\n\nSemua data terkait (items, lockers, categories) akan ikut terhapus.`)) {
      return;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user'
    });
    setEditingUser(null);
    setShowPassword(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
        <Sidebar />
        
        <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Header />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form - Sticky on Desktop */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-6">
                  <Card>
                    <button
                      onClick={() => setIsFormOpen(!isFormOpen)}
                      className="w-full flex items-center justify-between gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Plus size={24} className="text-emerald-600" />
                        </div>
                        <div className="text-left">
                          <h2 className="text-lg font-bold text-gray-900">
                            {editingUser ? 'Edit User' : 'Tambah User'}
                          </h2>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {editingUser ? 'Perbarui data user' : 'Buat akun user baru'}
                          </p>
                        </div>
                      </div>
                      {isFormOpen ? (
                        <ChevronUp size={24} className="text-gray-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown size={24} className="text-gray-600 flex-shrink-0" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isFormOpen && (
                        <motion.form
                          onSubmit={handleSubmit}
                          className="space-y-5 mt-5 pt-5 border-t border-gray-100"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          style={{ overflow: 'hidden' }}
                        >
                          {/* Success/Error Messages */}
                          {success && (
                            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                              <p className="text-sm text-green-600">{success}</p>
                            </div>
                          )}
                          {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                              <p className="text-sm text-red-600">{error}</p>
                            </div>
                          )}

                          <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                              Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="John Doe"
                              required
                              disabled={isLoading}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="user@mail.com"
                              required
                              disabled={isLoading}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                              Password {editingUser ? '' : <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
                                required={!editingUser}
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm pr-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            {editingUser && (
                              <p className="text-xs text-gray-500 mt-1.5">Kosongkan jika tidak ingin mengubah password</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                              Role <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="role"
                              name="role"
                              value={formData.role}
                              onChange={handleChange}
                              required
                              disabled={isLoading}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-emerald-400 disabled:cursor-not-allowed"
                            >
                              <Plus size={20} />
                              {isLoading ? 'Menyimpan...' : editingUser ? 'Update User' : 'Tambah User'}
                            </button>

                            {editingUser && (
                              <button
                                type="button"
                                onClick={resetForm}
                                disabled={isLoading}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Batal
                              </button>
                            )}
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </Card>
                </div>
              </div>

              {/* Right Column: Users List */}
              <div className="lg:col-span-2">
                <Card>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Daftar User</h2>
                      <p className="text-sm text-gray-500 mt-1">Kelola semua akun user</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-emerald-100 rounded-full text-sm font-semibold text-emerald-700">
                        {users.length} User
                      </span>
                    </div>
                  </div>

                  {isLoadingUsers ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-100 animate-pulse">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-12 h-12 rounded-full bg-gray-200" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Belum ada user lain</p>
                    </div>
                  ) : (
                    <motion.div
                      className="space-y-3"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.08,
                          },
                        },
                      }}
                    >
                      {users.map((user) => (
                        <motion.div
                          key={user.id}
                          variants={{
                            hidden: { opacity: 0, scale: 0.95 },
                            visible: { opacity: 1, scale: 1 },
                          }}
                          transition={{ duration: 0.3 }}
                          className="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                              }`}>
                                {user.role === 'admin' ? (
                                  <Shield className="w-6 h-6 text-purple-600" />
                                ) : (
                                  <UserIcon className="w-6 h-6 text-blue-600" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {user.name || 'Tanpa Nama'}
                                  </h3>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                                    user.role === 'admin'
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {user.role === 'admin' ? 'Admin' : 'User'}
                                  </span>
                                  {user.id === currentUser?.id && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                                      Anda
                                    </span>
                                  )}
                                </div>

                                <p className="text-sm text-gray-600 mb-2 truncate">{user.email}</p>

                                {user._count && (
                                  <div className="flex gap-4 text-xs text-gray-500">
                                    <span>{user._count.items} items</span>
                                    <span>{user._count.lockers} lockers</span>
                                    <span>{user._count.categories} categories</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleEdit(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              
                              {user.id !== currentUser?.id && (
                                <button
                                  onClick={() => handleDelete(user)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
