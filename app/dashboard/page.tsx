'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsCards from '@/components/dashboard/StatsCards';
import ReportsSection from '@/components/dashboard/ReportsSection';
import RecentItemsSection from '@/components/dashboard/RecentItemsSection';
import { useDashboard } from '@/lib/hooks/useDashboard';

export default function Dashboard() {
  const { lokerStats, barangStats, kategoriStats, isLoadingStats } = useDashboard();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--body-bg)] lg:pl-24">
        <Sidebar />

        <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Header />

            <StatsCards
              lokerStats={lokerStats}
              barangStats={barangStats}
              kategoriStats={kategoriStats}
              isLoading={isLoadingStats}
            />

            <ReportsSection />

            <RecentItemsSection />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
