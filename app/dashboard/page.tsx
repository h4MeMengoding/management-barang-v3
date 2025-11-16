'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import ReportBarang from '@/components/ReportBarang';
import ReportLoker from '@/components/ReportLoker';
import BarangBaru from '@/components/BarangBaru';
import MaintenanceRequests from '@/components/MaintenanceRequests';
import { motion } from 'framer-motion';
import { Container, Package, FolderTree } from 'lucide-react';
import { useMemo } from 'react';
import { useStats } from '@/lib/hooks/useQuery';

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useStats();

  // Calculate locker stats
  const lokerStats = useMemo(() => {
    if (!stats) return { total: '0', change: '0%', changeType: 'neutral' as const, previous: '0' };
    
    const totalNow = stats.totalNow || 0;
    const totalYesterday = stats.totalYesterday || 0;
    const formatter = new Intl.NumberFormat('id-ID');
    
    let percent = 0;
    if (totalYesterday === 0) {
      percent = totalNow > 0 ? 100 : 0;
    } else {
      percent = Math.round(((totalNow - totalYesterday) / totalYesterday) * 100);
    }

    let changeType: 'increase' | 'decrease' | 'neutral' = 'neutral';
    if (totalNow > totalYesterday) changeType = 'increase';
    else if (totalNow < totalYesterday) changeType = 'decrease';

    return {
      total: formatter.format(totalNow),
      change: `${Math.abs(percent)}%`,
      changeType,
      previous: formatter.format(totalYesterday)
    };
  }, [stats]);

  // Calculate item stats
  const barangStats = useMemo(() => {
    if (!stats) return { total: '0', change: '0%', changeType: 'neutral' as const, previous: '0' };
    
    const itemsNow = stats.totalItemsNow || 0;
    const itemsYesterday = stats.totalItemsYesterday || 0;
    const formatter = new Intl.NumberFormat('id-ID');
    
    let percent = 0;
    if (itemsYesterday === 0) {
      percent = itemsNow > 0 ? 100 : 0;
    } else {
      percent = Math.round(((itemsNow - itemsYesterday) / itemsYesterday) * 100);
    }

    let changeType: 'increase' | 'decrease' | 'neutral' = 'neutral';
    if (itemsNow > itemsYesterday) changeType = 'increase';
    else if (itemsNow < itemsYesterday) changeType = 'decrease';

    return {
      total: formatter.format(itemsNow),
      change: `${Math.abs(percent)}%`,
      changeType,
      previous: formatter.format(itemsYesterday)
    };
  }, [stats]);

  // Calculate category stats
  const kategoriStats = useMemo(() => {
    if (!stats) return { total: '0', change: '0%', changeType: 'neutral' as const, previous: '0' };
    
    const catsNow = stats.totalCategoriesNow || 0;
    const catsYesterday = stats.totalCategoriesYesterday || 0;
    const formatter = new Intl.NumberFormat('id-ID');
    
    let percent = 0;
    if (catsYesterday === 0) {
      percent = catsNow > 0 ? 100 : 0;
    } else {
      percent = Math.round(((catsNow - catsYesterday) / catsYesterday) * 100);
    }

    let changeType: 'increase' | 'decrease' | 'neutral' = 'neutral';
    if (catsNow > catsYesterday) changeType = 'increase';
    else if (catsNow < catsYesterday) changeType = 'decrease';

    return {
      total: formatter.format(catsNow),
      change: `${Math.abs(percent)}%`,
      changeType,
      previous: formatter.format(catsYesterday)
    };
  }, [stats]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
        {/* Sidebar */}
        <Sidebar />

      {/* Main Content */}
      <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
        {/* Header */}
        <Header />

        {/* Stats Cards */}
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
              icon={<Container size={24} className="text-emerald-600" />}
              title="Total Loker"
              value={lokerStats.total}
              change={lokerStats.change}
              changeType={lokerStats.changeType}
              previousValue={lokerStats.previous}
              iconBgColor="bg-emerald-100"
              loading={isLoadingStats}
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
              icon={<Package size={24} className="text-emerald-600" />}
              title="Total Barang"
              value={barangStats.total}
              change={barangStats.change}
              changeType={barangStats.changeType}
              previousValue={barangStats.previous}
              iconBgColor="bg-emerald-100"
              loading={isLoadingStats}
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
              icon={<FolderTree size={24} className="text-emerald-600" />}
              title="Total Kategori Barang"
              value={kategoriStats.total}
              change={kategoriStats.change}
              changeType={kategoriStats.changeType}
              previousValue={kategoriStats.previous}
              iconBgColor="bg-emerald-100"
              loading={isLoadingStats}
            />
          </motion.div>
        </motion.div>

        {/* Report Barang & Report Loker */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 lg:gap-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <ReportBarang />
          <ReportLoker />
        </motion.div>

        {/* Barang Baru & Maintenance Requests */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <BarangBaru />
          <MaintenanceRequests />
        </motion.div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
