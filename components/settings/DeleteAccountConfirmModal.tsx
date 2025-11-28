import { X, Trash2, AlertTriangle, Package, FolderOpen, Tag, User } from 'lucide-react';

interface DeleteAccountConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountConfirmModal({ onClose, onConfirm }: DeleteAccountConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-1)] rounded-2xl shadow-2xl max-w-md w-full border border-red-300 dark:border-red-800/50 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                <Trash2 className="text-white" size={22} />
              </div>
              <h3 className="text-xl font-bold text-red-700 dark:text-red-400">Hapus Akun</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[var(--surface-2)] hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
            Anda akan menghapus <strong>akun dan semua data</strong> berikut ini secara{' '}
            <strong className="text-red-600 dark:text-red-400">permanen</strong>:
          </p>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
              <User size={18} className="text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-300 font-medium">
                Akun & Profil Anda
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
              <Package size={18} className="text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-300 font-medium">
                Semua Data Loker
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
              <FolderOpen size={18} className="text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-300 font-medium">
                Semua Data Kategori
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
              <Tag size={18} className="text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-300 font-medium">
                Semua Data Barang
              </span>
            </div>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800/50 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-900 dark:text-red-200 mb-1.5">
                  Peringatan Keras:
                </p>
                <ul className="text-xs text-red-800 dark:text-red-300 space-y-1 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>
                      Aksi ini <strong>tidak dapat dibatalkan</strong> atau dipulihkan
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>
                      Anda <strong>tidak dapat login kembali</strong> dengan akun ini
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>
                      <strong>Semua data akan hilang permanen</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>Pastikan sudah backup data jika diperlukan</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] text-sm font-semibold rounded-lg transition-all"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Ya, Hapus Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
