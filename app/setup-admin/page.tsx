'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { saveUserSession } from '@/lib/auth';

export default function SetupAdmin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  // Cek apakah admin sudah ada
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/check-admin');
        const data = await response.json();

        if (data.hasAdmin) {
          // Jika sudah ada admin, redirect ke signin
          router.push('/signin');
        }
      } catch (error) {
        console.error('Error checking admin:', error);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Semua field harus diisi');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat admin');
      }

      // Simpan user session
      saveUserSession(data.user);

      // Redirect ke dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-[var(--body-bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--body-bg)] text-[var(--text-primary)] flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-6xl bg-[var(--surface-1)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
        {/* Left Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[rgba(var(--color-primary-rgb),0.15)] to-[rgba(var(--color-primary-rgb),0.25)]">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Placeholder untuk gambar ilustrasi */}
            {/* Ukuran ideal: 800x1000px (portrait) atau sesuaikan dengan aspect ratio 4:5 */}
            <div className="relative w-full h-full">
              <Image
                src="/signin-illustration.png"
                alt="Setup Admin Illustration"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md space-y-6">
            {/* Header */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">
                Setup Administrator
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Buat akun administrator pertama untuk mengelola sistem manajemen barang Anda.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Yokowi Soso"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@mail.com"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors pr-12 disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed"
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
                <p className="text-xs text-[var(--text-tertiary)] mt-1.5">Minimal 6 karakter</p>
              </div>

              {/* Info Box */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Info:</strong> Akun ini akan memiliki akses penuh ke sistem termasuk manajemen user.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:bg-emerald-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Buat Admin'}
              </button>
            </form>

            {/* Footer Text */}
            <div className="text-center pt-4">
              <p className="text-xs text-[var(--text-tertiary)]">
                © 2025 Manajemen Barang. Made by Ilham with ❤️
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
