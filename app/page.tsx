'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        // Cek apakah sudah ada admin
        const response = await fetch('/api/auth/check-admin');
        const data = await response.json();

        if (!data.hasAdmin) {
          // Jika belum ada admin, redirect ke setup admin
          router.push('/setup-admin');
          return;
        }

        // Jika sudah ada admin, cek apakah user sudah login
        if (isAuthenticated()) {
          router.push('/dashboard');
        } else {
          router.push('/signin');
        }
      } catch (error) {
        console.error('Error checking admin:', error);
        // Jika error, asumsikan belum ada admin
        router.push('/setup-admin');
      } finally {
        setChecking(false);
      }
    };

    checkAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--body-bg)]">
      {checking && (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      )}
    </div>
  );
}
