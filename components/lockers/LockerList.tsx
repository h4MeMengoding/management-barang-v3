import { motion } from 'framer-motion';
import { Trash2, FolderInput, X } from 'lucide-react';
import { useState } from 'react';
import Card from '@/components/Card';
import LockerCard from '@/components/lockers/LockerCard';
import DeleteLockerModal from '@/components/lockers/DeleteLockerModal';

interface Locker {
  id: string;
  name: string;
  code: string;
  itemCount: number;
}

interface LockerListProps {
  lockers: Locker[];
  isLoading: boolean;
  onBulkDelete?: (lockerIds: string[], moveToLockerId?: string) => Promise<void>;
}

export default function LockerList({ lockers, isLoading, onBulkDelete }: LockerListProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedLockers, setSelectedLockers] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleToggleSelection = (lockerId: string) => {
    setSelectedLockers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lockerId)) {
        newSet.delete(lockerId);
      } else {
        newSet.add(lockerId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedLockers.size === lockers.length) {
      setSelectedLockers(new Set());
    } else {
      setSelectedLockers(new Set(lockers.map((l) => l.id)));
    }
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedLockers(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedLockers.size === 0) return;
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (action: 'delete-all' | 'move', targetLockerId?: string) => {
    setIsDeleting(true);
    try {
      if (onBulkDelete) {
        await onBulkDelete(
          Array.from(selectedLockers),
          action === 'move' ? targetLockerId : undefined
        );
      }
      setSelectedLockers(new Set());
      setIsSelectionMode(false);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting lockers:', error);
      alert('Gagal menghapus loker. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedLockerObjects = lockers.filter((l) => selectedLockers.has(l.id));

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Daftar Loker</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Kelola semua loker penyimpanan</p>
        </div>
        <div className="flex items-center gap-2">
          {!isSelectionMode ? (
            <>
              <span className="px-3 py-1.5 bg-[var(--color-primary)]/10 rounded-full text-sm font-semibold text-[var(--color-primary)]">
                {lockers.length} Loker
              </span>
              {lockers.length > 0 && (
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
                {selectedLockers.size === lockers.length ? 'Batal Semua' : 'Pilih Semua'}
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

      {isSelectionMode && selectedLockers.size > 0 && (
        <div className="mb-4 p-3 bg-[var(--surface-2)] rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">
              {selectedLockers.size} loker dipilih
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[var(--surface-1)] rounded-xl p-4 lg:p-5 shadow-sm border border-[var(--border)] animate-pulse"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] flex items-center justify-center flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 bg-[var(--surface-2)] rounded w-3/4"></div>
                    <div className="h-3 bg-[var(--surface-2)] rounded w-1/2"></div>
                    <div className="h-3 bg-[var(--surface-2)] rounded w-1/3"></div>
                  </div>
                </div>
                <div className="w-20 h-6 bg-[var(--surface-2)] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : lockers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Belum ada loker. Tambahkan loker pertama Anda!</p>
        </div>
      ) : (
        <motion.div
          key={`lockers-${lockers.length}`}
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
          {lockers.map((locker) => (
            <motion.div
              key={locker.id}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.3 }}
              whileHover={!isSelectionMode ? { y: -4 } : {}}
              initial="hidden"
              animate="visible"
            >
              <LockerCard
                id={locker.id}
                name={locker.name}
                code={locker.code}
                itemCount={locker.itemCount}
                status={locker.itemCount > 0 ? 'terisi' : 'kosong'}
                isSelectionMode={isSelectionMode}
                isSelected={selectedLockers.has(locker.id)}
                onToggleSelect={() => handleToggleSelection(locker.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteLockerModal
        isOpen={showDeleteModal}
        lockersToDelete={selectedLockerObjects}
        allLockers={lockers}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  );
}
