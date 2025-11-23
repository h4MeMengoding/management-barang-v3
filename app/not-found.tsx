'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <h1 className="text-8xl md:text-9xl font-bold text-emerald-600 mb-4">
          404
        </h1>

        {/* Text Content */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-white border-2 border-emerald-600 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
