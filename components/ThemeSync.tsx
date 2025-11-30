'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ThemeSync Component
 * Ensures theme stays consistent during client-side navigation
 * Prevents white flash by re-applying theme immediately on route changes
 */
export default function ThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    // Re-apply theme immediately on every route change
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    // Force background color to stay consistent
    if (isDark) {
      root.style.backgroundColor = '#081210';
      document.body.style.backgroundColor = '#081210';
    } else {
      root.style.backgroundColor = '#F5F1E8';
      document.body.style.backgroundColor = '#F5F1E8';
    }
    
    // Clean up inline styles after a short delay (let CSS take over)
    const timer = setTimeout(() => {
      root.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    }, 50);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
