'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if splash has been shown in this session
    const splashShown = sessionStorage.getItem('splashShown');
    
    if (splashShown) {
      setIsLoading(false);
      return;
    }

    // Minimum display time for splash screen
    const minDisplayTime = 1500; // 1.5 seconds
    const startTime = Date.now();

    // Wait for page to load
    const handleLoad = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setIsLoading(false);
          sessionStorage.setItem('splashShown', 'true');
        }, 300); // Match fade out duration
      }, remainingTime);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#F5F1E8] dark:bg-[#081210] transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ touchAction: 'none' }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo Container */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Logo Image */}
          <img 
            src="/splash/icon.png" 
            alt="Manajemen Barang Logo" 
            className="w-24 h-24 object-contain drop-shadow-2xl"
          />
          
          {/* Animated Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-green-500 opacity-20 animate-ping" />
        </div>

        {/* App Name */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Barang
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sistem manajemen penyimpanan barang
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
