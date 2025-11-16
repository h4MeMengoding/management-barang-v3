"use client";

import { useEffect, useState } from 'react';

export default function RegisterSW() {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service worker registered:', registration);

        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);

        // Detect waiting service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              setWaitingWorker(newWorker);
              setShowReload(true);
            }
          });
        });

        // Check if there's already a waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowReload(true);
        }
      }).catch((err) => {
        console.warn('Service worker registration failed:', err);
      });

      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }

    // Optional: listen for beforeinstallprompt to enable custom install UI later
    const beforeInstallHandler = (e: any) => {
      e.preventDefault();
      console.log('beforeinstallprompt fired');
    };

    window.addEventListener('beforeinstallprompt', beforeInstallHandler as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler as EventListener);
    };
  }, []);

  const reloadPage = () => {
    if (waitingWorker) {
      // Tell waiting worker to skip waiting and activate
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  // Update notification UI
  if (showReload) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-emerald-600 text-white p-4 rounded-lg shadow-lg animate-slideUp">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold mb-1">Update Tersedia!</p>
            <p className="text-sm text-emerald-100 mb-3">
              Versi baru aplikasi sudah siap. Reload untuk update.
            </p>
            <div className="flex gap-2">
              <button
                onClick={reloadPage}
                className="px-4 py-2 bg-white text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors"
              >
                Reload Sekarang
              </button>
              <button
                onClick={() => setShowReload(false)}
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors"
              >
                Nanti
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
