'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import LockerCard from '@/components/LockerCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, ChevronUp, RefreshCw, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCurrentUser } from '@/lib/auth';
import { queryKeys } from '@/lib/hooks/useQuery';
import { useRouter } from 'next/navigation';

interface Locker {
  id: string;
  code: string;
  name: string;
  description: string | null;
  qrCodeUrl: string | null;
  createdAt: string;
  itemCount: number;
}

export default function AddLocker() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLockers, setIsLoadingLockers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Load lockers
  useEffect(() => {
    // Collapse the form by default on mobile (width < 1024px)
    if (typeof window !== 'undefined') {
      try {
        if (window.innerWidth < 1024) {
          setIsFormOpen(false);
        }
      } catch (e) {
        // ignore
      }
    }

    loadLockers();
    // Do not auto-generate code on mount anymore; user will input code manually.
  }, []);

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

  const generateCode = async () => {
    setIsGeneratingCode(true);
    try {
      const response = await fetch('/api/lockers/generate-code');
      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({ ...prev, code: data.code }));
      }
    } catch (err) {
      console.error('Error generating code:', err);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = getCurrentUser();
      if (!user) {
        setError('User tidak ditemukan');
        return;
      }

      // Validate code format
      const code = formData.code?.trim().toUpperCase();
      const isValidFormat = /^[A-Z]\d{3}$/.test(code);
      if (!isValidFormat) {
        setError('Format kode tidak valid. Gunakan 1 huruf diikuti 3 angka, contoh: A001');
        setIsLoading(false);
        return;
      }

      // If availability hasn't been checked yet (null), check now
      if (codeStatus.available === null) {
        try {
          const res = await fetch(`/api/lockers?code=${encodeURIComponent(code)}`);
          if (res.ok) {
            setError('Kode sudah digunakan, silakan ganti');
            setIsLoading(false);
            return;
          } else if (res.status === 404) {
            // available -> continue
          } else {
            const d = await res.json().catch(() => ({}));
            setError(d?.error || 'Gagal memeriksa kode');
            setIsLoading(false);
            return;
          }
        } catch (err) {
          setError('Gagal memeriksa kode');
          setIsLoading(false);
          return;
        }
      }

      if (codeStatus.available === false) {
        setError('Kode sudah digunakan, silakan ganti');
        setIsLoading(false);
        return;
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
      
      // Reset form (tanpa generate code otomatis)
      setFormData({ name: '', code: '', description: '' });
      setCodeStatus({ checking: false, available: null, message: '' });
      
      // Reload lockers
      await loadLockers();

      // Invalidate queries
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.lockers(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats(user.id) });
      }
      
      // Clear success message setelah 2 detik (tanpa collapse form)
      setTimeout(() => {
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat locker');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // If editing code, normalize to uppercase and run validation/check when appropriate
    if (name === 'code') {
      // Normalize and filter input per-position:
      // - 1st character: letter A-Z only
      // - next 3 characters: digits only
      // - max length: 4
      const raw = value.toUpperCase();
      let filtered = '';
      for (let i = 0; i < raw.length && filtered.length < 4; i++) {
        const ch = raw[i];
        if (filtered.length === 0) {
          if (/^[A-Z]$/.test(ch)) filtered += ch;
        } else {
          if (/^\d$/.test(ch)) filtered += ch;
        }
      }

      setFormData({ ...formData, code: filtered });

      // Validate and check when exactly 4 chars
      const isValidFormat = /^[A-Z]\d{3}$/.test(filtered);
      if (filtered.length === 4) {
        checkCodeAvailability(filtered, isValidFormat);
      } else {
        setCodeStatus({ checking: false, available: null, message: '' });
      }

      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Code availability state
  const [codeStatus, setCodeStatus] = useState<{ checking: boolean; available: boolean | null; message: string }>({ checking: false, available: null, message: '' });

  const checkCodeAvailability = async (code: string, isValidFormat?: boolean) => {
    if (!isValidFormat) {
      setCodeStatus({ checking: false, available: null, message: 'Format kode tidak valid (contoh: A001)' });
      return;
    }

    setCodeStatus({ checking: true, available: null, message: '' });
    try {
      const res = await fetch(`/api/lockers?code=${encodeURIComponent(code)}`);

      if (res.ok) {
        // Found locker with same code -> taken
        setCodeStatus({ checking: false, available: false, message: 'Kode sudah digunakan, silakan ganti' });
      } else if (res.status === 404) {
        // Not found -> available
        setCodeStatus({ checking: false, available: true, message: 'Kode tersedia' });
      } else {
        const data = await res.json().catch(() => ({}));
        setCodeStatus({ checking: false, available: null, message: data?.error || 'Gagal memeriksa kode' });
      }
    } catch (err) {
      setCodeStatus({ checking: false, available: null, message: 'Gagal memeriksa kode' });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--body-bg)] lg:pl-24">
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
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                        <Plus size={24} className="text-[var(--color-primary)]" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Tambah Loker</h2>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Buat loker baru</p>
                      </div>
                    </div>
                    {isFormOpen ? (
                      <ChevronUp size={24} className="text-[var(--text-tertiary)] flex-shrink-0" />
                    ) : (
                      <ChevronDown size={24} className="text-[var(--text-tertiary)] flex-shrink-0" />
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
                      {/* Success/Error Messages */}
                      {success && (
                        <div className="p-3 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
                          <p className="text-sm text-[var(--color-success)]">{success}</p>
                        </div>
                      )}
                      {error && (
                        <div className="p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30">
                          <p className="text-sm text-[var(--color-danger)]">{error}</p>
                        </div>
                      )}

                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                          Label Loker <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Contoh: Lemari 1"
                          required
                          disabled={isLoading}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label htmlFor="code" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                          Kode Loker <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="A123"
                            required
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm font-mono disabled:cursor-not-allowed"
                          />
                          <button
                            type="button"
                            onClick={generateCode}
                            disabled={isLoading || isGeneratingCode}
                            className="px-4 py-3 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Generate kode baru"
                          >
                            <RefreshCw size={18} className={isGeneratingCode ? 'animate-spin' : ''} />
                          </button>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">Masukkan kode (format: 1 huruf + 3 angka, contoh: A001). Bisa juga generate menggunakan tombol.</p>
                        <div className="mt-2">
                          {codeStatus.checking && (
                            <p className="text-xs text-[var(--text-secondary)]">Memeriksa kode...</p>
                          )}
                          {!codeStatus.checking && codeStatus.message && (
                            <p className={`text-xs ${codeStatus.available === true ? 'text-[var(--color-success)]' : codeStatus.available === false ? 'text-[var(--color-danger)]' : 'text-[var(--text-secondary)]'}`}>{codeStatus.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                          Deskripsi
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Deskripsi loker (opsional)"
                          rows={4}
                          disabled={isLoading}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={20} />
                        {isLoading ? 'Membuat...' : 'Tambah Loker'}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
                </Card>
              </div>
            </div>

          {/* Right Column: Lockers List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Daftar Loker</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Kelola semua loker penyimpanan</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-[var(--color-primary)]/10 rounded-full text-sm font-semibold text-[var(--color-primary)]">
                    {lockers.length} Loker
                  </span>
                </div>
              </div>

              {isLoadingLockers ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-[var(--surface-1)] rounded-xl p-4 lg:p-5 shadow-sm border border-[var(--border)] animate-pulse">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] flex items-center justify-center flex-shrink-0" />
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-4 bg-[var(--surface-2)] rounded w-3/4"></div>
                            <div className="h-3 bg-[var(--surface-2)] rounded w-1/2"></div>
                            <div className="h-3 bg-[var(--surface-2)] rounded w-1/3"></div>
                          </div>
                        </div>
                        <div className="w-20 h-6 bg-[var(--surface-2)] rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : lockers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[var(--text-secondary)]">Belum ada loker. Tambahkan loker pertama Anda!</p>
                </div>
              ) : (
                <motion.div 
                  key={`lockers-${lockers.length}`}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
                  {lockers.map((locker, index) => (
                    <motion.div
                      key={locker.id}
                      variants={{
                        hidden: { opacity: 0, scale: 0.95 },
                        visible: { opacity: 1, scale: 1 },
                      }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -4 }}
                      initial="hidden"
                      animate="visible"
                    >
                      <LockerCard
                        id={locker.id}
                        name={locker.name}
                        code={locker.code}
                        itemCount={locker.itemCount}
                        status={locker.itemCount > 0 ? "terisi" : "kosong"}
                      />
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
