'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--body-bg)] flex items-center justify-center p-4 text-[var(--text-primary)]">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <h1 className="text-8xl md:text-9xl font-bold text-[var(--color-primary)] mb-4">
          404
        </h1>

        {/* Text Content */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-[var(--surface-1)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold rounded-lg hover:bg-[rgba(var(--color-primary-rgb),0.08)] transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-[var(--color-primary)] text-[var(--text-inverse)] font-semibold rounded-lg hover:bg-[rgba(var(--color-primary-rgb),0.9)] transition-colors flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
