import { motion } from 'framer-motion';
import ReportBarang from '@/components/ReportBarang';
import ReportLoker from '@/components/ReportLoker';

export default function ReportsSection() {
  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 lg:gap-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <ReportBarang />
      <ReportLoker />
    </motion.div>
  );
}
