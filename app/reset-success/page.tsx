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
    <div className="min-h-screen bg-[var(--body-bg)] text-[var(--text-primary)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-[var(--surface-1)] rounded-2xl shadow-lg border border-[var(--border)]">
          {/* Header with Icon */}
          <div className="bg-emerald-600 px-4 py-6 text-center rounded-t-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-3">
              <CheckCircle className="text-emerald-500" size={36} />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Reset Berhasil!</h1>
            <p className="text-emerald-50 text-sm">
              Data telah dikembalikan ke kondisi awal
            </p>
          </div>

          {/* Content */}
          <div className="px-4 py-5 space-y-4">
            {/* Info Message */}
            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Semua data telah dihapus. Akun Anda masih aktif dan siap untuk memulai dari awal.
              </p>
            </div>

            {/* Deleted Items List */}
            <div className="bg-[var(--surface-2)] rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-[var(--text-primary)] mb-2 text-center">
                Data yang telah dihapus:
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 p-2 bg-[var(--surface-1)] rounded-lg border border-[var(--border)]">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <PlusSquare className="text-emerald-600" size={14} />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">Semua Loker</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-[var(--surface-1)] rounded-lg border border-[var(--border)]">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <FolderTree className="text-emerald-600" size={14} />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">Semua Kategori</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-[var(--surface-1)] rounded-lg border border-[var(--border)]">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Package className="text-emerald-600" size={14} />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">Semua Barang</span>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-blue-800 text-center leading-relaxed">
                <strong>Tip:</strong> Mulai dengan menambahkan loker baru, kemudian buat kategori, dan terakhir tambahkan barang.
              </p>
            </div>

            {/* Countdown Info */}
            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                Otomatis kembali dalam <span className="font-bold text-emerald-600 text-lg">{countdown}</span> detik
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleGoToDashboard}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
