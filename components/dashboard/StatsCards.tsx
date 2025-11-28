import { motion } from 'framer-motion';
import { Container, Package, FolderTree } from 'lucide-react';
import StatCard from '@/components/StatCard';

interface StatData {
  total: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  previous: string;
}

interface StatsCardsProps {
  lokerStats: StatData;
  barangStats: StatData;
  kategoriStats: StatData;
  isLoading: boolean;
}

export default function StatsCards({
  lokerStats,
  barangStats,
  kategoriStats,
  isLoading,
}: StatsCardsProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.4 }}
      >
        <StatCard
          icon={<Container size={24} className="text-[var(--color-primary)]" />}
          title="Total Loker"
          value={lokerStats.total}
          change={lokerStats.change}
          changeType={lokerStats.changeType}
          previousValue={lokerStats.previous}
          iconBgColor="bg-[var(--color-primary)]/10"
          loading={isLoading}
        />
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.4 }}
      >
        <StatCard
          icon={<Package size={24} className="text-[var(--color-primary)]" />}
          title="Total Barang"
          value={barangStats.total}
          change={barangStats.change}
          changeType={barangStats.changeType}
          previousValue={barangStats.previous}
          iconBgColor="bg-[var(--color-primary)]/10"
          loading={isLoading}
        />
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.4 }}
      >
        <StatCard
          icon={<FolderTree size={24} className="text-[var(--color-primary)]" />}
          title="Total Kategori Barang"
          value={kategoriStats.total}
          change={kategoriStats.change}
          changeType={kategoriStats.changeType}
          previousValue={kategoriStats.previous}
          iconBgColor="bg-[var(--color-primary)]/10"
          loading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}
