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
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';

interface Stats {
  totalNow: number;
  totalYesterday: number;
  totalItemsNow?: number;
  totalItemsYesterday?: number;
  totalCategoriesNow?: number;
  totalCategoriesYesterday?: number;
}

export default function Dashboard() {
  const [totalLoker, setTotalLoker] = useState<string>('0');
  const [lokerChange, setLokerChange] = useState<string>('0%');
  const [lokerChangeType, setLokerChangeType] = useState<'increase' | 'decrease' | 'neutral'>('neutral');
  const [lokerPrevious, setLokerPrevious] = useState<string>('0');
  const [totalBarang, setTotalBarang] = useState<string>('0');
  const [barangChange, setBarangChange] = useState<string>('0%');
  const [barangChangeType, setBarangChangeType] = useState<'increase' | 'decrease' | 'neutral'>('neutral');
  const [barangPrevious, setBarangPrevious] = useState<string>('0');
  const [totalKategori, setTotalKategori] = useState<string>('0');
  const [kategoriChange, setKategoriChange] = useState<string>('0%');
  const [kategoriChangeType, setKategoriChangeType] = useState<'increase' | 'decrease' | 'neutral'>('neutral');
  const [kategoriPrevious, setKategoriPrevious] = useState<string>('0');

  useEffect(() => {
    const loadStats = async () => {
      const user = getCurrentUser();
      if (!user) return;

      try {
        const res = await fetch(`/api/stats?userId=${user.id}`);
        const data: Stats | { error?: string } = await res.json();
        if (!res.ok) {
          console.error('Failed to load stats', data);
          return;
        }

        const { totalNow, totalYesterday, totalItemsNow, totalItemsYesterday, totalCategoriesNow, totalCategoriesYesterday } = data as Stats;
        const formatter = new Intl.NumberFormat('id-ID');
        setTotalLoker(formatter.format(totalNow));
        setLokerPrevious(formatter.format(totalYesterday));

        let percent = 0;
        if (totalYesterday === 0) {
          percent = totalNow > 0 ? 100 : 0;
        } else {
          percent = Math.round(((totalNow - totalYesterday) / totalYesterday) * 100);
        }

        setLokerChange(`${Math.abs(percent)}%`);
        if (totalNow > totalYesterday) setLokerChangeType('increase');
        else if (totalNow < totalYesterday) setLokerChangeType('decrease');
        else setLokerChangeType('neutral');

        // Items (Total Barang)
        const itemsNow = totalItemsNow ?? 0;
        const itemsYesterday = totalItemsYesterday ?? 0;
        setTotalBarang(formatter.format(itemsNow));
        setBarangPrevious(formatter.format(itemsYesterday));

        let percentItems = 0;
        if (itemsYesterday === 0) {
          percentItems = itemsNow > 0 ? 100 : 0;
        } else {
          percentItems = Math.round(((itemsNow - itemsYesterday) / itemsYesterday) * 100);
        }

        setBarangChange(`${Math.abs(percentItems)}%`);
        if (itemsNow > itemsYesterday) setBarangChangeType('increase');
        else if (itemsNow < itemsYesterday) setBarangChangeType('decrease');
        else setBarangChangeType('neutral');

        // Categories (Total Kategori Barang)
        const catsNow = totalCategoriesNow ?? 0;
        const catsYesterday = totalCategoriesYesterday ?? 0;
        setTotalKategori(formatter.format(catsNow));
        setKategoriPrevious(formatter.format(catsYesterday));

        let percentCats = 0;
        if (catsYesterday === 0) {
          percentCats = catsNow > 0 ? 100 : 0;
        } else {
          percentCats = Math.round(((catsNow - catsYesterday) / catsYesterday) * 100);
        }

        setKategoriChange(`${Math.abs(percentCats)}%`);
        if (catsNow > catsYesterday) setKategoriChangeType('increase');
        else if (catsNow < catsYesterday) setKategoriChangeType('decrease');
        else setKategoriChangeType('neutral');
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      }
    };

    loadStats();
  }, []);

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
            value={totalLoker}
            change={lokerChange}
            changeType={lokerChangeType}
            previousValue={lokerPrevious}
            iconBgColor="bg-blue-100"
          />
          <StatCard
            icon={<Package size={24} className="text-purple-600" />}
            title="Total Barang"
            value={totalBarang}
            change={barangChange}
            changeType={barangChangeType}
            previousValue={barangPrevious}
            iconBgColor="bg-purple-100"
          />
          <StatCard
            icon={<FolderTree size={24} className="text-yellow-600" />}
            title="Total Kategori Barang"
            value={totalKategori}
            change={kategoriChange}
            changeType={kategoriChangeType}
            previousValue={kategoriPrevious}
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
