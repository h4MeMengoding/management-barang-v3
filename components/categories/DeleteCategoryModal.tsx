'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2, MoveRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
  totalQuantity?: number;
}

interface DeleteCategoryModalProps {
  isOpen: boolean;
  categoriesToDelete: Category[];
  allCategories: Category[];
  onClose: () => void;
  onConfirm: (action: 'delete-all' | 'move', targetCategoryId?: string) => Promise<void>;
}

export default function DeleteCategoryModal({
  isOpen,
  categoriesToDelete,
  allCategories,
  onClose,
  onConfirm,
}: DeleteCategoryModalProps) {
  const [selectedAction, setSelectedAction] = useState<'delete-all' | 'move'>('move');
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const categoriesWithItems = categoriesToDelete.filter((c) => (c.totalQuantity ?? 0) > 0);
  const totalItems = categoriesWithItems.reduce((sum, c) => sum + (c.totalQuantity ?? 0), 0);
  
  // Available categories for moving items (exclude categories being deleted)
  const availableCategories = allCategories.filter(
    (c) => !categoriesToDelete.find((del) => del.id === c.id)
  );

  useEffect(() => {
    if (availableCategories.length > 0 && !targetCategoryId) {
      setTargetCategoryId(availableCategories[0].id);
    }
  }, [availableCategories, targetCategoryId]);

  const handleConfirm = async () => {
    if (selectedAction === 'move' && !targetCategoryId) {
      alert('Silakan pilih kategori tujuan');
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm(selectedAction, selectedAction === 'move' ? targetCategoryId : undefined);
      onClose();
    } catch (error) {
      console.error('Error in delete confirmation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // If no categories have items, simple confirmation
  if (categoriesWithItems.length === 0) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            className="bg-[var(--surface-1)] rounded-2xl shadow-2xl max-w-md w-full border border-[var(--border)]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                    Hapus {categoriesToDelete.length} Kategori?
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Kategori yang dipilih tidak memiliki barang. Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-[var(--surface-2)] rounded-lg transition-colors"
                >
                  <X size={20} className="text-[var(--text-tertiary)]" />
                </button>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Hapus
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
        <motion.div
          className="bg-[var(--surface-1)] rounded-2xl shadow-2xl max-w-2xl w-full border border-[var(--border)] my-8"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--divider)]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} className="text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  Perhatian: Kategori Berisi Barang
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {categoriesWithItems.length} kategori yang akan dihapus memiliki total {totalItems} barang
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="p-1 hover:bg-[var(--surface-2)] rounded-lg transition-colors"
              >
                <X size={20} className="text-[var(--text-tertiary)]" />
              </button>
            </div>
          </div>

          {/* Category List */}
          <div className="p-6 border-b border-[var(--divider)]">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Kategori yang akan dihapus:
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {categoriesWithItems.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-[var(--text-secondary)] truncate">{category.description}</p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-semibold">
                    {category.totalQuantity} barang
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Selection */}
          <div className="p-6">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
              Pilih tindakan untuk barang di dalam kategori:
            </h4>

            <div className="space-y-3">
              {/* Option 1: Move to another category */}
              {availableCategories.length > 0 && (
                <motion.div
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedAction === 'move'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--border)] hover:border-[var(--color-primary)]/50'
                  }`}
                  onClick={() => setSelectedAction('move')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedAction === 'move'}
                      onChange={() => setSelectedAction('move')}
                      className="mt-1 w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MoveRight size={18} className="text-[var(--color-info)]" />
                        <h5 className="font-semibold text-[var(--text-primary)]">
                          Pindahkan ke Kategori Lain
                        </h5>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mb-3">
                        Semua barang akan dipindahkan ke kategori yang dipilih
                      </p>

                      {selectedAction === 'move' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <select
                            value={targetCategoryId}
                            onChange={(e) => setTargetCategoryId(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none text-sm"
                          >
                            {availableCategories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name} - {category.totalQuantity ?? 0} barang
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Option 2: Delete all */}
              <motion.div
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedAction === 'delete-all'
                    ? 'border-red-500 bg-red-500/5'
                    : 'border-[var(--border)] hover:border-red-500/50'
                }`}
                onClick={() => setSelectedAction('delete-all')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={selectedAction === 'delete-all'}
                    onChange={() => setSelectedAction('delete-all')}
                    className="mt-1 w-4 h-4 text-red-500 focus:ring-red-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Trash2 size={18} className="text-red-500" />
                      <h5 className="font-semibold text-[var(--text-primary)]">
                        Hapus Semua (Kategori + Barang)
                      </h5>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      <span className="text-red-500 font-semibold">Perhatian:</span> Semua barang di dalam kategori akan dihapus permanen
                    </p>
                  </div>
                </div>
              </motion.div>

              {availableCategories.length === 0 && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    <strong>Info:</strong> Tidak ada kategori lain yang tersedia. Semua barang akan dihapus.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`flex-1 px-4 py-2.5 ${
                selectedAction === 'move'
                  ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                  : 'bg-red-500 hover:bg-red-600'
              } text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Memproses...
                </>
              ) : selectedAction === 'move' ? (
                <>
                  <MoveRight size={18} />
                  Pindahkan & Hapus Kategori
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Hapus Semua
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
