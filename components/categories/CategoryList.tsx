import { motion } from 'framer-motion';
import { FolderTree, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Card from '@/components/Card';
import CategoryCard from './CategoryCard';
import DeleteCategoryModal from './DeleteCategoryModal';
import { Category } from '@/lib/hooks/useManageCategories';

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  activeCardId: string | null;
  onToggleActions: (categoryId: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onBulkDelete?: (categoryIds: string[], moveToCategoryId?: string) => Promise<void>;
}

export default function CategoryList({
  categories,
  isLoading,
  activeCardId,
  onToggleActions,
  onEdit,
  onDelete,
  onBulkDelete,
}: CategoryListProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleToggleSelection = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories.map((c) => c.id)));
    }
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedCategories(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.size === 0) return;
    
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async (action: 'delete-all' | 'move', targetCategoryId?: string) => {
    setIsDeleting(true);
    try {
      if (onBulkDelete) {
        await onBulkDelete(
          Array.from(selectedCategories),
          action === 'move' ? targetCategoryId : undefined
        );
      }
      setSelectedCategories(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error deleting categories:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Daftar Kategori</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Kelola semua kategori barang</p>
        </div>
        <div className="flex items-center gap-2">
          {!isSelectionMode ? (
            <>
              <span className="px-3 py-1.5 bg-[var(--color-primary)]/10 rounded-full text-sm font-semibold text-[var(--color-primary)]">
                {categories.length} Kategori
              </span>
              {categories.length > 0 && (
                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="px-3 py-1.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg text-sm font-medium text-[var(--text-primary)] transition-colors"
                >
                  Pilih
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg text-sm font-medium text-[var(--text-primary)] transition-colors"
              >
                {selectedCategories.size === categories.length ? 'Batal Semua' : 'Pilih Semua'}
              </button>
              <button
                onClick={handleCancelSelection}
                className="p-1.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg text-[var(--text-secondary)] transition-colors"
                title="Batal"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {isSelectionMode && selectedCategories.size > 0 && (
        <div className="mb-4 p-3 bg-[var(--surface-2)] rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">
              {selectedCategories.size} kategori dipilih
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton />
      ) : categories.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isActive={activeCardId === category.id}
              onToggleActions={() => onToggleActions(category.id)}
              onEdit={() => onEdit(category)}
              onDelete={() => onDelete(category.id)}
              isSelectionMode={isSelectionMode}
              isSelected={selectedCategories.has(category.id)}
              onToggleSelect={() => handleToggleSelection(category.id)}
            />
          ))}
        </motion.div>
      )}

      <DeleteCategoryModal
        isOpen={showDeleteDialog}
        categoriesToDelete={categories.filter((c) => selectedCategories.has(c.id))}
        allCategories={categories}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  );
}

function LoadingSkeleton() {
  return (
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
              <div className="h-3 bg-[var(--surface-2)] rounded w-1/2" />
              <div className="mt-3 flex items-center justify-between">
                <div className="h-3 bg-[var(--surface-2)] rounded w-1/4" />
                <div className="h-4 bg-[var(--surface-2)] rounded w-1/6" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <FolderTree size={48} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
      <p className="text-[var(--text-secondary)]">
        Belum ada kategori. Tambahkan kategori pertama Anda!
      </p>
    </div>
  );
}
