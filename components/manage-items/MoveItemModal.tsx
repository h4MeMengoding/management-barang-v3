'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Package } from 'lucide-react';
import type { Item, Locker } from '@/lib/hooks/useManageItems';

interface MoveItemModalProps {
  isOpen: boolean;
  item: Item | null;
  lockers: Locker[];
  onClose: () => void;
  onConfirm: (itemId: string, newLockerId: string) => Promise<void>;
}

export default function MoveItemModal({
  isOpen,
  item,
  lockers,
  onClose,
  onConfirm,
}: MoveItemModalProps) {
  const [selectedLockerId, setSelectedLockerId] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);

  if (!item) return null;

  // Filter out current locker
  const availableLockers = lockers.filter((locker) => locker.id !== item.lockerId);

  const handleConfirm = async () => {
    if (!selectedLockerId) return;

    setIsMoving(true);
    try {
      await onConfirm(item.id, selectedLockerId);
      setSelectedLockerId('');
      onClose();
    } catch (error) {
      console.error('Error moving item:', error);
    } finally {
      setIsMoving(false);
    }
  };

  const handleClose = () => {
    setSelectedLockerId('');
    onClose();
  };

  const selectedLocker = lockers.find((l) => l.id === selectedLockerId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-[var(--surface-1)] rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--divider)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-info)]/10 flex items-center justify-center">
                  <ArrowRight size={20} className="text-[var(--color-info)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Pindahkan Barang
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Pilih loker tujuan untuk memindahkan barang
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors"
              >
                <X size={20} className="text-[var(--text-tertiary)]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              {/* Item Info */}
              <div className="bg-[var(--surface-2)] rounded-xl p-4 border border-[var(--border)]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--text-primary)] text-sm">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Kategori: {item.category.name}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[var(--text-secondary)]">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">•</span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        Loker saat ini: {item.locker.name} ({item.locker.code})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Move Direction */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                  <div className="h-px bg-[var(--divider)] w-12"></div>
                  <ArrowRight size={20} className="text-[var(--color-info)]" />
                  <div className="h-px bg-[var(--divider)] w-12"></div>
                </div>
              </div>

              {/* Select Destination Locker */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Pilih Loker Tujuan <span className="text-red-500">*</span>
                </label>

                {availableLockers.length === 0 ? (
                  <div className="text-center py-8 bg-[var(--surface-2)] rounded-lg border border-[var(--border)]">
                    <p className="text-sm text-[var(--text-secondary)]">
                      Tidak ada loker lain yang tersedia
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      Buat loker baru terlebih dahulu
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableLockers.map((locker) => (
                      <motion.button
                        key={locker.id}
                        type="button"
                        onClick={() => setSelectedLockerId(locker.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedLockerId === locker.id
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                            : 'border-[var(--border)] hover:border-[var(--color-primary)]/30 bg-[var(--surface-2)]'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-semibold text-[var(--text-primary)] text-sm">
                              {locker.name}
                            </h5>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                              Kode: {locker.code}
                            </p>
                          </div>
                          {selectedLockerId === locker.id && (
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary if locker selected */}
              {selectedLocker && (
                <motion.div
                  className="bg-[var(--color-info)]/10 border border-[var(--color-info)]/30 rounded-lg p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                    <span className="font-semibold">{item.locker.name}</span>
                    <ArrowRight size={16} className="text-[var(--color-info)]" />
                    <span className="font-semibold">{selectedLocker.name}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Barang akan dipindahkan dari{' '}
                    <span className="font-medium">{item.locker.code}</span> ke{' '}
                    <span className="font-medium">{selectedLocker.code}</span>
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 border-t border-[var(--divider)] bg-[var(--surface-2)]">
              <button
                onClick={handleClose}
                disabled={isMoving}
                className="flex-1 px-4 py-3 bg-[var(--surface-1)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedLockerId || isMoving || availableLockers.length === 0}
                className="flex-1 px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isMoving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Memindahkan...
                  </>
                ) : (
                  <>
                    <ArrowRight size={18} />
                    Pindahkan
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
