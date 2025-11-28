import { motion } from 'framer-motion';
import { FolderTree } from 'lucide-react';
import Card from '@/components/Card';
import CategoryCard from './CategoryCard';
import { Category } from '@/lib/hooks/useManageCategories';

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  activeCardId: string | null;
  onToggleActions: (categoryId: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export default function CategoryList({
  categories,
  isLoading,
  activeCardId,
  onToggleActions,
  onEdit,
  onDelete,
}: CategoryListProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Daftar Kategori</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Kelola semua kategori barang</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-[var(--color-primary)]/10 rounded-full text-sm font-semibold text-[var(--color-primary)]">
            {categories.length} Kategori
          </span>
        </div>
      </div>

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
            />
          ))}
        </motion.div>
      )}
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
