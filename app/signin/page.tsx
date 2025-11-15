'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign in:', formData);
    // Handle sign in logic
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
        {/* Left Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-amber-100 to-emerald-100">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Placeholder untuk gambar ilustrasi */}
            {/* Ukuran ideal: 800x1000px (portrait) atau sesuaikan dengan aspect ratio 4:5 */}
            <div className="relative w-full h-full">
              <Image
                src="/signin-illustration.png"
                alt="Sign In Illustration"
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
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Masuk ke Sistem Manajemen Barang
              </h1>
              <p className="text-sm text-gray-600">
                Pantau, catat, dan temukan barang dengan cepat melalui sistem manajemen penyimpanan yang terorganisir.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                  placeholder="amelia@mail.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors pr-12"
                  />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="rememberMe" className="ml-2 text-xs text-gray-700">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                Login
              </button>
            </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            Belum ada akun?{' '}
            <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Buat Akun
            </Link>
          </p>

          {/* Footer Text */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              © 2025 Manajemen Barang. Made by Ilham with ❤️
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
