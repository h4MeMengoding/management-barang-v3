import { Download, Upload, FileJson, Loader2 } from 'lucide-react';

interface DataManagementSectionProps {
  isExporting: boolean;
  isImporting: boolean;
  importSuccess: string;
  importError: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onShowExportModal: () => void;
  onShowImportModal: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DataManagementSection({
  isExporting,
  isImporting,
  importSuccess,
  importError,
  fileInputRef,
  onShowExportModal,
  onShowImportModal,
  onImportData,
}: DataManagementSectionProps) {
  return (
    <div className="bg-[var(--surface-1)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
      <div className="p-6 border-b border-[var(--divider)] bg-[var(--color-primary)]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
            <FileJson className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Import & Export Data</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Backup atau restore data loker, barang, dan kategori
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {importSuccess && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300 whitespace-pre-line">
              {importSuccess}
            </p>
          </div>
        )}
        {importError && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{importError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl border-2 border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]/60 transition-all duration-300 bg-[var(--color-primary)]/5 hover:shadow-md">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Download className="text-white" size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Export Data</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Download data loker, barang, dan kategori dalam format JSON
                  </p>
                </div>
              </div>

              <button
                onClick={onShowExportModal}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileJson size={18} />
                    Export Sekarang
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-xl border-2 border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]/60 transition-all duration-300 bg-[var(--color-primary)]/5 hover:shadow-md">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Upload className="text-white" size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Import Data</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Upload JSON untuk menambahkan data loker, barang, dan kategori
                  </p>
                </div>
              </div>

              <button
                onClick={onShowImportModal}
                disabled={isImporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Pilih File JSON
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                id="import-file"
                accept="application/json,.json"
                onChange={onImportData}
                disabled={isImporting}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900 mb-2">Catatan Penting</h4>
              <ul className="text-xs text-amber-800 space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>
                    Data yang diimport akan <strong>ditambahkan</strong> ke data yang sudah ada, tidak
                    menghapus data lama
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>
                    Jika loker/kategori sudah ada akan diupdate. Jika barang sudah ada, jumlahnya akan
                    ditambahkan
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Pastikan file JSON adalah hasil export dari aplikasi ini</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Simpan file export sebagai backup berkala untuk keamanan data</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
