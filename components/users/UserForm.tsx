import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import Card from '@/components/Card';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface UserFormProps {
  isLoading: boolean;
  error: string;
  success: string;
  editingUser: User | null;
  onSubmit: (data: { name: string; email: string; password: string; role: string }) => Promise<boolean>;
  onCancel: () => void;
}

export default function UserForm({
  isLoading,
  error,
  success,
  editingUser,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsFormOpen(false);
    }
  }, []);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || '',
        email: editingUser.email,
        password: '',
        role: editingUser.role,
      });
      setIsFormOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
      });
    }
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSubmit(formData);
    if (result) {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
      });
      setShowPassword(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
    });
    setShowPassword(false);
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
              {editingUser ? 'Edit User' : 'Tambah User'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {editingUser ? 'Perbarui data user' : 'Buat akun user baru'}
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
            onSubmit={handleSubmit}
            className="space-y-5 mt-5 pt-5 border-t border-[var(--divider)]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {success && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30">
                <p className="text-sm text-green-600 dark:text-green-300">{success}</p>
              </div>
            )}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
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
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
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
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
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
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm pr-12 disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {editingUser && (
                <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                  Kosongkan jika tidak ingin mengubah password
                </p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                {isLoading ? 'Menyimpan...' : editingUser ? 'Update User' : 'Tambah User'}
              </button>

              {editingUser && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-6 py-3 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
