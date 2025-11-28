import { motion } from 'framer-motion';
import Card from '@/components/Card';
import LockerCard from '@/components/lockers/LockerCard';

interface Locker {
  id: string;
  name: string;
  code: string;
  itemCount: number;
}

interface LockerListProps {
  lockers: Locker[];
  isLoading: boolean;
}

export default function LockerList({ lockers, isLoading }: LockerListProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Daftar Loker</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Kelola semua loker penyimpanan</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-[var(--color-primary)]/10 rounded-full text-sm font-semibold text-[var(--color-primary)]">
            {lockers.length} Loker
          </span>
        </div>
      </div>

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
              whileHover={{ y: -4 }}
              initial="hidden"
              animate="visible"
            >
              <LockerCard
                id={locker.id}
                name={locker.name}
                code={locker.code}
                itemCount={locker.itemCount}
                status={locker.itemCount > 0 ? 'terisi' : 'kosong'}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </Card>
  );
}
