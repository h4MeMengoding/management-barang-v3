"use client";

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('Service worker registered:', reg);
      }).catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }

    // Optional: listen for beforeinstallprompt to enable custom install UI later
    const beforeInstallHandler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // You may store the event and show an install button later
      // window.deferredPrompt = e; // (not recommended to attach to window in TS)
      console.log('beforeinstallprompt fired');
    };

    window.addEventListener('beforeinstallprompt', beforeInstallHandler as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler as EventListener);
    };
  }, []);

  return null;
}
