'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import LockerCard from '@/components/LockerCard';
import { Plus, ChevronDown, ChevronUp, RefreshCw, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCurrentUser } from '@/lib/auth';
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
    loadLockers();
    generateCode(); // Auto generate code on mount
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

      const response = await fetch('/api/lockers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          description: formData.description,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat locker');
      }

      setSuccess('Locker berhasil dibuat!');
      
      // Reset form dan generate code baru
      setFormData({ name: '', code: '', description: '' });
      await generateCode();
      
      // Reload lockers
      await loadLockers();
      
      // Collapse form
      setTimeout(() => {
        setIsFormOpen(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat locker');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
        <Sidebar />
        
        <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
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
                        <h2 className="text-lg font-bold text-gray-900">Tambah Loker</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Buat loker baru</p>
                      </div>
                    </div>
                    {isFormOpen ? (
                      <ChevronUp size={24} className="text-gray-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={24} className="text-gray-600 flex-shrink-0" />
                    )}
                  </button>

                  {isFormOpen && (
                    <form onSubmit={handleSubmit} className="space-y-5 mt-5 pt-5 border-t border-gray-100">
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
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
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
                            readOnly
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm font-mono disabled:cursor-not-allowed"
                          />
                          <button
                            type="button"
                            onClick={generateCode}
                            disabled={isLoading || isGeneratingCode}
                            className="px-4 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Generate kode baru"
                          >
                            <RefreshCw size={18} className={isGeneratingCode ? 'animate-spin' : ''} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Kode otomatis di-generate (format: 1 huruf + 3 angka)</p>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
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
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-emerald-400 disabled:cursor-not-allowed"
                      >
                        <Plus size={20} />
                        {isLoading ? 'Membuat...' : 'Tambah Loker'}
                      </button>
                    </form>
                  )}
                </Card>
              </div>
            </div>

          {/* Right Column: Lockers List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Daftar Loker</h2>
                  <p className="text-sm text-gray-500 mt-1">Kelola semua loker penyimpanan</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-emerald-100 rounded-full text-sm font-semibold text-emerald-700">
                    {lockers.length} Loker
                  </span>
                </div>
              </div>

              {isLoadingLockers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : lockers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Belum ada loker. Tambahkan loker pertama Anda!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lockers.map((locker) => (
                    <LockerCard
                      key={locker.id}
                      id={locker.id}
                      name={locker.name}
                      code={locker.code}
                      itemCount={locker.itemCount}
                      status={locker.itemCount > 0 ? "terisi" : "kosong"}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
