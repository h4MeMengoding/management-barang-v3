// Example: Cara menggunakan ProtectedRoute di halaman dashboard
// Copy kode ini dan terapkan di halaman-halaman yang perlu proteksi

'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
// ... import components lainnya

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
        <Sidebar />
        <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
          <Header />
          {/* Content dashboard Anda di sini */}
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Terapkan pola ini di halaman:
// - /dashboard/page.tsx
// - /addItem/page.tsx
// - /addLocker/page.tsx
// - /manageCategories/page.tsx
// - /manageQRCode/page.tsx
// - /scanQRCode/page.tsx
// - /profile/page.tsx
// - /locker/[id]/page.tsx
