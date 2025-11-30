'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/Card';
import { Package, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { Item } from '@/lib/hooks/useManageItems';

interface ItemListProps {
  items: Item[];
  isLoading: boolean;
  activeCardId: string | null;
  onToggleActions: (itemId: string) => void;
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => Promise<void>;
}

export default function ItemList({
  items,
  isLoading,
  activeCardId,
  onToggleActions,
  onEdit,
  onDelete,
}: ItemListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus barang ini?')) return;
    await onDelete(itemId);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Daftar Barang</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Kelola semua barang</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-[var(--color-primary)]/10 rounded-full text-sm font-semibold text-[var(--color-primary)]">
            {items.length} Barang
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 bg-[var(--surface-2)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--surface-2)] rounded w-1/3" />
                  <div className="flex items-center justify-between mt-2">
                    <div className="h-3 bg-[var(--surface-2)] rounded w-1/4" />
                    <div className="h-3 bg-[var(--surface-2)] rounded w-1/4" />
                  </div>
                  <div className="h-3 bg-[var(--surface-2)] rounded w-1/2 mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p className="text-[var(--text-secondary)]">
            Belum ada barang. Tambahkan barang pertama Anda!
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--color-primary)]/30 hover:shadow-sm transition-all bg-[var(--surface-1)] relative"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -2 }}
              layout
            >
              <div className="flex items-start gap-3">
                <motion.div
                  className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Package size={20} className="text-[var(--color-primary)]" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)] text-sm truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {item.category.name}
                      </p>
                    </div>
                    <motion.button
                      onClick={() => onToggleActions(item.id)}
                      className="p-1.5 hover:bg-[var(--surface-2)] rounded-lg transition-colors flex-shrink-0"
                      whileTap={{ scale: 0.9, rotate: 90 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MoreVertical size={16} className="text-[var(--text-tertiary)]" />
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[var(--text-secondary)]">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">
                    {item.locker.name} ({item.locker.code})
                  </p>
                </div>
              </div>
              <AnimatePresence>
                {activeCardId === item.id && (
                  <motion.div
                    className="absolute left-0 right-0 top-full mt-2 bg-[var(--surface-1)] rounded-lg shadow-lg border border-[var(--border)] overflow-hidden z-10"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <div className="flex items-center">
                      <motion.button
                        onClick={() => onEdit(item)}
                        className="flex-1 px-4 py-3 text-sm font-medium text-[var(--color-info)] hover:bg-[var(--color-info)]/10 transition-colors flex items-center justify-center gap-2"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ backgroundColor: 'rgba(var(--color-info-rgb), 0.15)' }}
                      >
                        <Edit2 size={16} />
                        Edit
                      </motion.button>
                      <div className="w-px h-8 bg-[var(--divider)]" />
                      <motion.button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 px-4 py-3 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors flex items-center justify-center gap-2"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ backgroundColor: 'rgba(var(--color-danger-rgb), 0.15)' }}
                      >
                        <Trash2 size={16} />
                        Hapus
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}
    </Card>
  );
}
