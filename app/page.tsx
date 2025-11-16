'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/signin');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
      {/* Loading handled by nprogress */}
    </div>
  );
}
