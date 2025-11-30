'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2, MoveRight } from 'lucide-react';

interface Locker {
  id: string;
  name: string;
  code: string;
  itemCount: number;
}

interface DeleteLockerModalProps {
  isOpen: boolean;
  lockersToDelete: Locker[];
  allLockers: Locker[];
  onClose: () => void;
  onConfirm: (action: 'delete-all' | 'move', targetLockerId?: string) => Promise<void>;
}

export default function DeleteLockerModal({
  isOpen,
  lockersToDelete,
  allLockers,
  onClose,
  onConfirm,
}: DeleteLockerModalProps) {
  const [selectedAction, setSelectedAction] = useState<'delete-all' | 'move'>('move');
  const [targetLockerId, setTargetLockerId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const lockersWithItems = lockersToDelete.filter((l) => l.itemCount > 0);
  const totalItems = lockersWithItems.reduce((sum, l) => sum + l.itemCount, 0);
  
  // Available lockers for moving items (exclude lockers being deleted)
  const availableLockers = allLockers.filter(
    (l) => !lockersToDelete.find((del) => del.id === l.id)
  );

  useEffect(() => {
    if (availableLockers.length > 0 && !targetLockerId) {
      setTargetLockerId(availableLockers[0].id);
    }
  }, [availableLockers, targetLockerId]);

  const handleConfirm = async () => {
    if (selectedAction === 'move' && !targetLockerId) {
      alert('Silakan pilih loker tujuan');
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm(selectedAction, selectedAction === 'move' ? targetLockerId : undefined);
      onClose();
    } catch (error) {
      console.error('Error in delete confirmation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // If no lockers have items, simple confirmation
  if (lockersWithItems.length === 0) {
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
                    Hapus {lockersToDelete.length} Loker?
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Loker yang dipilih tidak memiliki barang. Tindakan ini tidak dapat dibatalkan.
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
                  Perhatian: Loker Berisi Barang
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {lockersWithItems.length} loker yang akan dihapus memiliki total {totalItems} barang
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

          {/* Locker List */}
          <div className="p-6 border-b border-[var(--divider)]">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Loker yang akan dihapus:
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {lockersWithItems.map((locker) => (
                <div
                  key={locker.id}
                  className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{locker.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Kode: {locker.code}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-semibold">
                    {locker.itemCount} barang
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Selection */}
          <div className="p-6">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
              Pilih tindakan untuk barang di dalam loker:
            </h4>

            <div className="space-y-3">
              {/* Option 1: Move to another locker */}
              {availableLockers.length > 0 && (
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
                          Pindahkan ke Loker Lain
                        </h5>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mb-3">
                        Semua barang akan dipindahkan ke loker yang dipilih
                      </p>

                      {selectedAction === 'move' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <select
                            value={targetLockerId}
                            onChange={(e) => setTargetLockerId(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none text-sm"
                          >
                            {availableLockers.map((locker) => (
                              <option key={locker.id} value={locker.id}>
                                {locker.name} ({locker.code}) - {locker.itemCount} barang
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
                        Hapus Semua (Loker + Barang)
                      </h5>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      <span className="text-red-500 font-semibold">Perhatian:</span> Semua barang di dalam loker akan dihapus permanen
                    </p>
                  </div>
                </div>
              </motion.div>

              {availableLockers.length === 0 && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    <strong>Info:</strong> Tidak ada loker lain yang tersedia. Semua barang akan dihapus.
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
                  Pindahkan & Hapus Loker
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
