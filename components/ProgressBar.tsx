'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
  speed: 300,
  easing: 'ease'
});

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    // Complete progress when route changes
    if (prevPathnameRef.current !== pathname) {
      NProgress.done();
      prevPathnameRef.current = pathname;
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept link clicks to start progress
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href && !anchor.target && !anchor.download) {
        const url = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);
        
        // Only show progress for same-origin navigation
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          NProgress.start();
          
          // CRITICAL: Lock background color during navigation to prevent flash
          const root = document.documentElement;
          const isDark = root.classList.contains('dark');
          const bgColor = isDark ? '#081210' : '#F5F1E8';
          root.style.backgroundColor = bgColor;
          document.body.style.backgroundColor = bgColor;
        }
      }
    };

    // Handle browser back/forward
    const handlePopState = () => {
      NProgress.start();
      
      // CRITICAL: Lock background color during back/forward navigation
      const root = document.documentElement;
      const isDark = root.classList.contains('dark');
      const bgColor = isDark ? '#081210' : '#F5F1E8';
      root.style.backgroundColor = bgColor;
      document.body.style.backgroundColor = bgColor;
    };

    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null;
}
