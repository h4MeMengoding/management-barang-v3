import { motion } from 'framer-motion';
import BarangBaru from '@/components/BarangBaru';
import LokerBaru from '@/components/LokerBaru';
import KategoriBaru from '@/components/KategoriBaru';

export default function RecentItemsSection() {
  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <BarangBaru />
      <LokerBaru />
      <KategoriBaru />
    </motion.div>
  );
}
