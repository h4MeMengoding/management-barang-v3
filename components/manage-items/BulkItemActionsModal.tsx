'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, MoveRight, FolderTree, Package } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  quantity: number;
  category: {
    id: string;
    name: string;
  };
  locker: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface Locker {
  id: string;
  name: string;
  code: string;
}

interface BulkItemActionsModalProps {
  isOpen: boolean;
  itemsToProcess: Item[];
  allCategories: Category[];
  allLockers: Locker[];
  onClose: () => void;
  onConfirm: (action: 'delete' | 'move-category' | 'move-locker', targetId?: string) => Promise<void>;
}

export default function BulkItemActionsModal({
  isOpen,
  itemsToProcess,
  allCategories,
  allLockers,
  onClose,
  onConfirm,
}: BulkItemActionsModalProps) {
  const [selectedAction, setSelectedAction] = useState<'delete' | 'move-category' | 'move-locker'>('move-category');
  const [targetId, setTargetId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (selectedAction === 'move-category' && allCategories.length > 0 && !targetId) {
      setTargetId(allCategories[0].id);
    } else if (selectedAction === 'move-locker' && allLockers.length > 0 && !targetId) {
      setTargetId(allLockers[0].id);
    }
  }, [selectedAction, allCategories, allLockers, targetId]);

  const handleConfirm = async () => {
    if ((selectedAction === 'move-category' || selectedAction === 'move-locker') && !targetId) {
      alert('Silakan pilih tujuan');
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm(selectedAction, selectedAction !== 'delete' ? targetId : undefined);
      onClose();
    } catch (error) {
      console.error('Error in bulk action:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const totalItems = itemsToProcess.reduce((sum, item) => sum + item.quantity, 0);

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
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Package size={24} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  Aksi Massal Barang
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {itemsToProcess.length} barang terpilih (Total: {totalItems} unit)
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

          {/* Item List */}
          <div className="p-6 border-b border-[var(--divider)]">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Barang yang akan diproses:
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {itemsToProcess.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {item.category.name} • {item.locker.name}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-semibold ml-2">
                    {item.quantity} unit
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Selection */}
          <div className="p-6">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
              Pilih aksi yang akan dilakukan:
            </h4>

            <div className="space-y-3">
              {/* Option 1: Move to another category */}
              <motion.div
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedAction === 'move-category'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--border)] hover:border-[var(--color-primary)]/50'
                }`}
                onClick={() => setSelectedAction('move-category')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={selectedAction === 'move-category'}
                    onChange={() => setSelectedAction('move-category')}
                    className="mt-1 w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FolderTree size={18} className="text-[var(--color-info)]" />
                      <h5 className="font-semibold text-[var(--text-primary)]">
                        Pindahkan ke Kategori Lain
                      </h5>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mb-3">
                      Semua barang terpilih akan dipindahkan ke kategori yang dipilih
                    </p>

                    {selectedAction === 'move-category' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <select
                          value={targetId}
                          onChange={(e) => setTargetId(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none text-sm"
                        >
                          {allCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Option 2: Move to another locker */}
              <motion.div
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedAction === 'move-locker'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--border)] hover:border-[var(--color-primary)]/50'
                }`}
                onClick={() => setSelectedAction('move-locker')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={selectedAction === 'move-locker'}
                    onChange={() => setSelectedAction('move-locker')}
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
                      Semua barang terpilih akan dipindahkan ke loker yang dipilih
                    </p>

                    {selectedAction === 'move-locker' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <select
                          value={targetId}
                          onChange={(e) => setTargetId(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none text-sm"
                        >
                          {allLockers.map((locker) => (
                            <option key={locker.id} value={locker.id}>
                              {locker.name} ({locker.code})
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Option 3: Delete all */}
              <motion.div
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedAction === 'delete'
                    ? 'border-red-500 bg-red-500/5'
                    : 'border-[var(--border)] hover:border-red-500/50'
                }`}
                onClick={() => setSelectedAction('delete')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={selectedAction === 'delete'}
                    onChange={() => setSelectedAction('delete')}
                    className="mt-1 w-4 h-4 text-red-500 focus:ring-red-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Trash2 size={18} className="text-red-500" />
                      <h5 className="font-semibold text-[var(--text-primary)]">
                        Hapus Semua Barang
                      </h5>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      <span className="text-red-500 font-semibold">Perhatian:</span> Semua barang terpilih akan dihapus permanen
                    </p>
                  </div>
                </div>
              </motion.div>
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
                selectedAction === 'delete'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
              } text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Memproses...
                </>
              ) : selectedAction === 'delete' ? (
                <>
                  <Trash2 size={18} />
                  Hapus Semua
                </>
              ) : (
                <>
                  <MoveRight size={18} />
                  Pindahkan
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
