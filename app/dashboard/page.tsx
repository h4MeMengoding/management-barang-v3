'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import ReportBarang from '@/components/ReportBarang';
import ReportLoker from '@/components/ReportLoker';
import BarangBaru from '@/components/BarangBaru';
import MaintenanceRequests from '@/components/MaintenanceRequests';
import { MapPin, Package, FolderTree } from 'lucide-react';

export default function Dashboard() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
          <StatCard
            icon={<MapPin size={24} className="text-blue-600" />}
            title="Total Loker"
            value="1.500"
            change="20%"
            changeType="increase"
            previousValue="1.050"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            icon={<Package size={24} className="text-purple-600" />}
            title="Total Barang"
            value="320"
            change="20%"
            changeType="increase"
            previousValue="950"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            icon={<FolderTree size={24} className="text-yellow-600" />}
            title="Total Kategori Barang"
            value="15"
            change="20%"
            changeType="increase"
            previousValue="12"
            iconBgColor="bg-yellow-100"
          />
        </div>

        {/* Report Barang & Report Loker */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 lg:gap-6 mb-6">
          <ReportBarang />
          <ReportLoker />
        </div>

        {/* Barang Baru & Maintenance Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <BarangBaru />
          <MaintenanceRequests />
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
