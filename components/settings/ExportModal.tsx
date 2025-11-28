import { X, Package, FolderOpen, Tag, Loader2 } from 'lucide-react';

interface ExportModalProps {
  exportSelection: {
    lockers: boolean;
    categories: boolean;
    items: boolean;
  };
  isExporting: boolean;
  onClose: () => void;
  onToggle: (field: 'lockers' | 'categories' | 'items') => void;
  onConfirm: () => void;
}

export default function ExportModal({
  exportSelection,
  isExporting,
  onClose,
  onToggle,
  onConfirm,
}: ExportModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-1)] rounded-2xl shadow-2xl max-w-md w-full border border-[var(--border)] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--divider)] bg-[var(--color-primary)]/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Pilih Data untuk Export</h3>
            <button
              onClick={onClose}
              disabled={isExporting}
              className="w-8 h-8 rounded-lg bg-[var(--surface-2)] hover:bg-red-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Pilih data yang ingin Anda export. Data akan disimpan dalam format JSON.
          </p>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[var(--border)] hover:border-[var(--color-primary)]/50 transition-all cursor-pointer bg-[var(--surface-2)]">
              <input
                type="checkbox"
                checked={exportSelection.lockers}
                onChange={() => onToggle('lockers')}
                disabled={isExporting}
                className="w-5 h-5 rounded border-2 border-[var(--border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Package size={20} className="text-[var(--color-primary)]" />
              <span className="text-sm font-semibold text-[var(--text-primary)] flex-1">
                Data Loker
              </span>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[var(--border)] hover:border-[var(--color-primary)]/50 transition-all cursor-pointer bg-[var(--surface-2)]">
              <input
                type="checkbox"
                checked={exportSelection.categories}
                onChange={() => onToggle('categories')}
                disabled={isExporting}
                className="w-5 h-5 rounded border-2 border-[var(--border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <FolderOpen size={20} className="text-[var(--color-primary)]" />
              <span className="text-sm font-semibold text-[var(--text-primary)] flex-1">
                Data Kategori
              </span>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[var(--border)] hover:border-[var(--color-primary)]/50 transition-all cursor-pointer bg-[var(--surface-2)]">
              <input
                type="checkbox"
                checked={exportSelection.items}
                onChange={() => onToggle('items')}
                disabled={isExporting}
                className="w-5 h-5 rounded border-2 border-[var(--border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Tag size={20} className="text-[var(--color-primary)]" />
              <span className="text-sm font-semibold text-[var(--text-primary)] flex-1">
                Data Barang
              </span>
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="flex-1 px-4 py-3 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={
                isExporting ||
                (!exportSelection.lockers && !exportSelection.categories && !exportSelection.items)
              }
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Exporting...
                </>
              ) : (
                'Export Data'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
