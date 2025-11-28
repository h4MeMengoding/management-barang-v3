import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import Card from '@/components/Card';

interface LockerFormProps {
  isLoading: boolean;
  isGeneratingCode: boolean;
  error: string;
  success: string;
  onSubmit: (data: { name: string; code: string; description: string }) => Promise<boolean>;
  onGenerateCode: () => Promise<string>;
  onCheckCode: (code: string) => Promise<{ available: boolean | null; message: string }>;
}

export default function LockerForm({
  isLoading,
  isGeneratingCode,
  error,
  success,
  onSubmit,
  onGenerateCode,
  onCheckCode,
}: LockerFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [codeStatus, setCodeStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (window.innerWidth < 1024) {
          setIsFormOpen(false);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSubmit(formData);
    if (result) {
      setFormData({ name: '', code: '', description: '' });
      setCodeStatus({ checking: false, available: null, message: '' });
    }
  };

  const handleGenerateCode = async () => {
    const code = await onGenerateCode();
    if (code) {
      setFormData(prev => ({ ...prev, code }));
      checkCodeAvailability(code, true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'code') {
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

  const checkCodeAvailability = async (code: string, isValidFormat?: boolean) => {
    if (!isValidFormat) {
      setCodeStatus({
        checking: false,
        available: null,
        message: 'Format kode tidak valid (contoh: A001)'
      });
      return;
    }

    setCodeStatus({ checking: true, available: null, message: '' });
    const result = await onCheckCode(code);
    setCodeStatus({ checking: false, ...result });
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
                  onClick={handleGenerateCode}
                  disabled={isLoading || isGeneratingCode}
                  className="px-4 py-3 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate kode baru"
                >
                  <RefreshCw size={18} className={isGeneratingCode ? 'animate-spin' : ''} />
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Masukkan kode (format: 1 huruf + 3 angka, contoh: A001). Bisa juga generate menggunakan tombol.
              </p>
              <div className="mt-2">
                {codeStatus.checking && (
                  <p className="text-xs text-[var(--text-secondary)]">Memeriksa kode...</p>
                )}
                {!codeStatus.checking && codeStatus.message && (
                  <p
                    className={`text-xs ${
                      codeStatus.available === true
                        ? 'text-[var(--color-success)]'
                        : codeStatus.available === false
                        ? 'text-[var(--color-danger)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {codeStatus.message}
                  </p>
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
  );
}
