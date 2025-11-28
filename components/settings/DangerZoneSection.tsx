import { AlertTriangle, RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface DangerZoneSectionProps {
  isDangerZoneOpen: boolean;
  onToggleDangerZone: () => void;
  onShowResetModal: () => void;
  onShowDeleteModal: () => void;
}

export default function DangerZoneSection({
  isDangerZoneOpen,
  onToggleDangerZone,
  onShowResetModal,
  onShowDeleteModal,
}: DangerZoneSectionProps) {
  return (
    <div className="bg-[var(--surface-1)] rounded-2xl shadow-sm border border-red-200 dark:border-red-900/30 overflow-hidden">
      <button
        onClick={onToggleDangerZone}
        className="w-full p-6 border-b border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
              <AlertTriangle className="text-white" size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h2>
              <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                Pengaturan berbahaya yang dapat menghapus data
              </p>
            </div>
          </div>
          {isDangerZoneOpen ? (
            <ChevronUp className="text-red-600 dark:text-red-500" size={20} />
          ) : (
            <ChevronDown className="text-red-600 dark:text-red-500" size={20} />
          )}
        </div>
      </button>

      {isDangerZoneOpen && (
        <div className="p-6">
          <div className="space-y-5">
            <div className="rounded-xl border-2 border-amber-300 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <RefreshCw className="text-white" size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-amber-900 dark:text-amber-200 mb-1">
                      Reset Data
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed mb-3">
                      Hapus semua data loker, barang, dan kategori. Akun dan profil Anda tetap aman.
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-200 dark:bg-amber-800/40 text-xs font-semibold text-amber-800 dark:text-amber-300">
                        <AlertTriangle size={12} className="mr-1" />
                        Tidak dapat dibatalkan
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onShowResetModal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  <RefreshCw size={18} />
                  Reset Semua Data
                </button>
              </div>
            </div>

            <div className="rounded-xl border-2 border-red-300 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Trash2 className="text-white" size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-red-900 dark:text-red-200 mb-1">
                      Delete Account
                    </h3>
                    <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed mb-3">
                      Hapus akun dan semua data secara permanen. Anda tidak dapat login kembali dengan akun
                      ini.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-200 dark:bg-red-800/40 text-xs font-semibold text-red-800 dark:text-red-300">
                        <Trash2 size={12} className="mr-1" />
                        Permanen
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-200 dark:bg-red-800/40 text-xs font-semibold text-red-800 dark:text-red-300">
                        <AlertTriangle size={12} className="mr-1" />
                        Tidak dapat dipulihkan
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onShowDeleteModal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  <Trash2 size={18} />
                  Hapus Akun Saya
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-red-900 mb-2">Peringatan Keras</h4>
                <ul className="text-xs text-red-800 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>
                      <strong>Reset Data</strong> akan menghapus semua loker, barang, dan kategori milik
                      Anda
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>
                      <strong>Delete Account</strong> akan menghapus akun Anda beserta semua data secara
                      permanen
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>
                      Kedua aksi ini <strong>tidak dapat dibatalkan</strong> atau dipulihkan
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>Pastikan Anda sudah export data jika diperlukan sebelum melakukan aksi ini</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
