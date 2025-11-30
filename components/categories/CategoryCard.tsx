import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FolderTree, Edit2, Trash2, MoreVertical, Check } from 'lucide-react';
import { Category } from '@/lib/hooks/useManageCategories';

interface CategoryCardProps {
  category: Category;
  isActive: boolean;
  onToggleActions: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export default function CategoryCard({
  category,
  isActive,
  onToggleActions,
  onEdit,
  onDelete,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
}: CategoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const cardContent = (
    <div 
      className={`bg-[var(--surface-1)] rounded-xl shadow-sm border transition-all ${
        isSelectionMode 
          ? `p-3 ${isSelected
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
            : 'border-[var(--border)] hover:border-[var(--color-primary)]/50'}`
          : 'p-4 border-[var(--border)] hover:shadow-md hover:border-[var(--color-primary)]/30 cursor-pointer'
      }`}
      onClick={(e) => {
        if (isSelectionMode) {
          e.preventDefault();
          onToggleSelect?.();
        }
      }}
    >
      {isSelectionMode ? (
        // Selection Mode Layout - More compact
        <div className="space-y-3">
          {/* Checkbox at top */}
          <div className="flex items-center justify-between">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
              isSelected 
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' 
                : 'border-[var(--border)] hover:border-[var(--color-primary)]'
            }`}>
              {isSelected && <Check size={14} className="text-white" />}
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {category.totalQuantity ?? 0} Barang
            </span>
          </div>
          
          {/* Content below */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
              <FolderTree size={20} className="text-[var(--color-primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{category.name}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{category.description || 'Tidak ada deskripsi'}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">{formatDate(category.createdAt)}</p>
            </div>
          </div>
        </div>
      ) : (
        // Normal Mode Layout
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
            <FolderTree size={20} className="text-[var(--color-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--text-primary)] text-sm">
                  {category.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                  {category.description || 'Tidak ada deskripsi'}
                </p>
              </div>
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleActions();
                }}
                className="p-1 hover:bg-[var(--surface-2)] rounded transition-colors flex-shrink-0 z-10"
                whileTap={{ scale: 0.9 }}
              >
                <MoreVertical size={16} className="text-[var(--text-secondary)]" />
              </motion.button>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-tertiary)]">
                  {formatDate(category.createdAt)}
                </span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {category.totalQuantity ?? 0} Barang
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isActive && !isSelectionMode && (
          <motion.div
            className="absolute left-0 right-0 top-full mt-2 bg-[var(--surface-1)] rounded-lg shadow-lg border border-[var(--border)] p-3 z-10"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Edit2 size={14} />
                Edit
              </button>
              <button
                onClick={onDelete}
                className="flex-1 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 size={14} />
                Hapus
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const cardWrapper = isSelectionMode ? (
    cardContent
  ) : (
    <Link href={`/category/${category.id}`}>
      {cardContent}
    </Link>
  );

  return (
    <motion.div
      className="relative"
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
      }}
      transition={{ duration: 0.3 }}
    >
      {cardWrapper}
    </motion.div>
  );
}
