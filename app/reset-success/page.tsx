'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, Home, Package, FolderTree, PlusSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ResetSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    // Check if accessed properly
    const resetFlag = sessionStorage.getItem('resetCompleted');
    if (!resetFlag) {
      router.push('/dashboard');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [router]);

  // Separate effect for redirect
  useEffect(() => {
    if (countdown === 0) {
      sessionStorage.removeItem('resetCompleted');
      router.push('/dashboard');
    }
  }, [countdown, router]);

  const handleGoToDashboard = () => {
    sessionStorage.removeItem('resetCompleted');
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-3">
              <CheckCircle className="text-emerald-500" size={40} />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Reset Berhasil!</h1>
            <p className="text-emerald-50 text-xs">
              Konfigurasi Anda telah dikembalikan ke kondisi awal
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-5">
            {/* Info Message */}
            <div className="text-center">
              <p className="text-sm text-gray-700 leading-relaxed">
                Semua data Anda telah berhasil dihapus. Akun Anda masih aktif dan siap untuk memulai dari awal.
              </p>
            </div>

            {/* Deleted Items List */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
              <p className="text-xs font-semibold text-gray-800 mb-2 text-center">
                Data yang telah dihapus:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-gray-200">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <PlusSquare className="text-emerald-600" size={16} />
                  </div>
                  <span className="text-xs text-gray-700">Semua Loker</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-gray-200">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <FolderTree className="text-emerald-600" size={16} />
                  </div>
                  <span className="text-xs text-gray-700">Semua Kategori</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-gray-200">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Package className="text-emerald-600" size={16} />
                  </div>
                  <span className="text-xs text-gray-700">Semua Barang</span>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-800 text-center leading-relaxed">
                <strong>Tip:</strong> Mulai dengan menambahkan loker baru, kemudian buat kategori, dan terakhir tambahkan barang.
              </p>
            </div>

            {/* Countdown Info */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Otomatis kembali dalam <span className="font-bold text-emerald-600">{countdown}</span> detik
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleGoToDashboard}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Kembali ke Dashboard
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Siap untuk memulai perjalanan baru?
        </p>
      </div>
    </div>
  );
}
