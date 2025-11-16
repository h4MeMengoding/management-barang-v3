'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import QrScanner from 'qr-scanner';
import { getCurrentUser } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ScanQRCode() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isSearchingLocker, setIsSearchingLocker] = useState(false);
  const [scanCount, setScanCount] = useState(0); // Track scan attempts
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const isMountedRef = useRef(true);
  const lastScanTimeRef = useRef<number>(0);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, []);

  const findLockerByCode = async (code: string) => {
    try {
      setIsSearchingLocker(true);
      const user = getCurrentUser();
      if (!user) {
        alert('User tidak ditemukan. Silakan login kembali.');
        return null;
      }

      // Search locker by code
      const response = await fetch(`/api/lockers?userId=${user.id}`);
      const data = await response.json();

      if (response.ok && data.lockers) {
        // Find locker with matching code (case-insensitive)
        const locker = data.lockers.find((l: any) => 
          l.code.toLowerCase() === code.toLowerCase()
        );
        return locker;
      }
      return null;
    } catch (error) {
      console.error('Error finding locker:', error);
      return null;
    } finally {
      setIsSearchingLocker(false);
    }
  };

  const handleQRCodeDetected = async (decodedText: string) => {
    if (isMountedRef.current) {
      setScannedData(decodedText);
      
      // Search for locker with this code
      const locker = await findLockerByCode(decodedText);
      
      if (locker) {
        // Navigate to locker detail page
        router.push(`/locker/${locker.id}`);
      } else {
        alert(`QR Code terdeteksi: ${decodedText}\nLoker dengan kode ini tidak ditemukan.`);
      }
      
      stopScanner();
    }
  };

  const startScanner = async () => {
    try {
      // Reset error message and scan count
      setErrorMessage('');
      setScanCount(0);
      lastScanTimeRef.current = 0;
      
      // Set state dulu
      setIsScanning(true);
      
      // Tunggu sebentar agar DOM ter-render
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get video element
      const videoElement = videoRef.current;
      if (!videoElement) {
        console.error('Video element not found');
        setErrorMessage('Video element tidak ditemukan');
        setIsScanning(false);
        return;
      }

      // Check if scanner already exists
      if (scannerRef.current) {
        await stopScanner();
      }

      // Detect if iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      const isIOSPWA = isIOS && isStandalone;
      
      console.log('Device info:', { isIOS, isStandalone, isIOSPWA });

      // Create QrScanner instance
      const scanner = new QrScanner(
        videoElement,
        (result) => {
          // Success callback
          console.log('✅ QR Code detected:', result.data);
          
          // Prevent multiple rapid scans
          const now = Date.now();
          if (now - lastScanTimeRef.current < 2000) {
            console.log('⏭️ Skipping duplicate scan');
            return;
          }
          lastScanTimeRef.current = now;
          
          handleQRCodeDetected(result.data);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: false,
          highlightCodeOutline: false,
          maxScansPerSecond: isIOSPWA ? 2 : (isIOS ? 5 : 10),
          preferredCamera: 'environment',
        }
      );

      scannerRef.current = scanner;

      // Start scanning
      await scanner.start();
      
      console.log('✅ Scanner started successfully');

      if (isMountedRef.current) {
        setHasCamera(true);
      }
      
      // Visual feedback - update scan count periodically
      const scanCountInterval = setInterval(() => {
        if (scannerRef.current && isMountedRef.current) {
          setScanCount(prev => prev + 1);
        } else {
          clearInterval(scanCountInterval);
        }
      }, 200);

    } catch (error: any) {
      console.error('Error accessing camera:', error);
      const errorMsg = error?.message || 'Unknown error';
      setErrorMessage(`Camera error: ${errorMsg}`);
      
      if (isMountedRef.current) {
        setHasCamera(false);
        setIsScanning(false);
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      scannerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsScanning(false);
      setScanCount(0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);
      // Reset previous scan result
      setScannedData(null);
    }
  };

  const handleScanFromFile = async () => {
    if (!selectedFile) return;

    try {
      setIsSearchingLocker(true);
      
      console.log('Scanning QR from file...');
      
      // Use QrScanner to scan from file
      const result = await QrScanner.scanImage(selectedFile, {
        returnDetailedScanResult: true,
      });
      
      setIsSearchingLocker(false);
      
      if (result) {
        console.log('✅ QR Code detected:', result.data);
        setScannedData(result.data);
        
        setIsSearchingLocker(true);
        // Search for locker with this code
        const locker = await findLockerByCode(result.data);
        
        if (locker) {
          // Navigate to locker detail page
          router.push(`/locker/${locker.id}`);
        } else {
          alert(`QR Code terdeteksi: ${result.data}\nLoker dengan kode ini tidak ditemukan.`);
        }
      }
    } catch (error) {
      console.error('❌ QR Code not detected:', error);
      setIsSearchingLocker(false);
      alert('QR Code tidak terdeteksi. Coba:\n1. Pastikan QR code terlihat jelas\n2. Cahaya cukup terang\n3. QR code tidak terpotong\n4. Ambil foto lebih dekat');
    }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
      <Sidebar />
      
      <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
        <div className="hidden lg:block">
          <Header />
        </div>
        
        {/* Loading Overlay when searching for locker */}
        <AnimatePresence>
          {isSearchingLocker && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <p className="text-gray-900 font-medium ml-2">Mencari loker...</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile View - Full Screen Scanner */}
        <div className="lg:hidden">
          {!isScanning && !scannedData && hasCamera && (
            <motion.div 
              className="min-h-screen flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <div className="text-center">
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ScanLine size={32} className="text-emerald-600" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Scan QR Code</h2>
                  <p className="text-gray-600 mb-4">Scan QR code loker untuk melihat informasi</p>
                  
                  <div className="space-y-3">
                    <motion.button
                      onClick={startScanner}
                      className="w-full px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Scan dengan Kamera
                    </motion.button>
                    
                    {/* Alternative: Upload from Gallery (iOS Fallback) */}
                    <div className="text-sm text-gray-500">atau</div>
                    
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          handleFileUpload(e);
                          if (e.target.files?.[0]) {
                            setTimeout(() => handleScanFromFile(), 100);
                          }
                        }}
                        className="hidden"
                        id="mobile-qr-upload"
                      />
                      <motion.div
                        onClick={() => document.getElementById('mobile-qr-upload')?.click()}
                        className="w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Upload Foto QR
                      </motion.div>
                    </label>
                    
                    <p className="text-xs text-gray-500 mt-3">
                      💡 Jika kamera tidak berfungsi, gunakan opsi upload
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
          {isScanning ? (
            <motion.div 
              className="fixed inset-0 z-50 flex flex-col bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-30 safe-area-top">
                <button
                  onClick={stopScanner}
                  className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 shadow-lg"
                >
                  <X size={24} />
                </button>
                <h1 className="text-white font-bold text-lg tracking-wider">SCAN QR CODE</h1>
                
                {/* iOS Native Camera Button */}
                <label className="w-12 h-12 rounded-xl bg-emerald-600/90 backdrop-blur-sm flex items-center justify-center text-white shadow-lg cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      stopScanner();
                      handleFileUpload(e);
                      if (e.target.files?.[0]) {
                        setTimeout(() => handleScanFromFile(), 100);
                      }
                    }}
                    className="hidden"
                    id="scanner-native-camera"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </label>
              </div>

              {/* Camera Full Screen - Video Element */}
              <div className="absolute inset-0 z-0">
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                ></video>
              </div>

              {/* Overlay dengan scan area */}
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                {/* Top overlay */}
                <div className="absolute top-0 left-0 right-0 bg-black/70 backdrop-blur-sm" style={{ height: 'calc(50% - 140px)' }}></div>
                
                {/* Bottom overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm" style={{ height: 'calc(50% - 140px)' }}></div>
                
                {/* Left overlay */}
                <div className="absolute left-0 bg-black/70 backdrop-blur-sm" style={{ top: 'calc(50% - 140px)', bottom: 'calc(50% - 140px)', width: 'calc(50% - 140px)' }}></div>
                
                {/* Right overlay */}
                <div className="absolute right-0 bg-black/70 backdrop-blur-sm" style={{ top: 'calc(50% - 140px)', bottom: 'calc(50% - 140px)', width: 'calc(50% - 140px)' }}></div>
                
                {/* Scan box di tengah */}
                <div className="relative w-72 h-72 z-10">
                  {/* Corner borders */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl"></div>
                  
                  {/* Scanning line */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-lg shadow-emerald-500/50 animate-scan-line" style={{ top: '30%' }}></div>
                </div>
              </div>

              {/* Bottom Instructions */}
              <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 text-center z-30 safe-area-bottom">
                <p className="text-white text-base font-medium mb-2">Arahkan kamera ke QR Code loker</p>
                
                {/* Scanning indicator */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${scanCount > 0 ? 'bg-emerald-400' : 'bg-gray-400'} animate-pulse`}></div>
                  <p className="text-xs text-gray-300">
                    {scanCount > 0 ? `Scanning... (${scanCount} frames)` : 'Memulai...'}
                  </p>
                </div>
                
                {/* iOS PWA Hint */}
                <p className="text-xs text-gray-400 mb-4">
                  💡 iOS: Tidak terdeteksi? Tap icon kamera di kanan atas
                </p>
                
                <div className="flex items-center justify-center">
                  <button className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                    <ScanLine size={32} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : scannedData ? (
            <div className="min-h-screen flex items-center justify-center p-4">
              <Card>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <ScanLine size={32} className="text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">QR Code Terdeteksi</h2>
                  <p className="text-gray-600 mb-4">Kode: {scannedData}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setScannedData(null);
                        startScanner();
                      }}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium"
                    >
                      Scan Lagi
                    </button>
                    <button
                      onClick={() => setScannedData(null)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          ) : !hasCamera ? (
            <div className="min-h-screen flex items-center justify-center p-4">
              <Card>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <X size={32} className="text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Kamera Tidak Tersedia</h2>
                  <p className="text-gray-600 mb-4">
                    {errorMessage || 'Izinkan akses kamera untuk melakukan scan'}
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={startScanner}
                      className="w-full px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium"
                    >
                      Coba Lagi
                    </button>
                    
                    {/* Alternative Upload */}
                    <div className="text-sm text-gray-500">atau</div>
                    
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          handleFileUpload(e);
                          if (e.target.files?.[0]) {
                            setHasCamera(true);
                            setTimeout(() => handleScanFromFile(), 100);
                          }
                        }}
                        className="hidden"
                        id="error-qr-upload"
                      />
                      <motion.div
                        onClick={() => document.getElementById('error-qr-upload')?.click()}
                        className="w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Upload Foto QR Sebagai Gantinya
                      </motion.div>
                    </label>
                    
                    {/* iOS PWA Help */}
                    <div className="p-4 bg-gray-50 rounded-lg text-left">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Tips untuk iOS:</p>
                      <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Pastikan Safari memiliki akses kamera di Settings</li>
                        <li>Buka kembali app dari home screen</li>
                        <li>Izinkan akses kamera saat diminta</li>
                        <li>Atau gunakan opsi Upload Foto di atas</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </div>

        {/* Desktop View - File Upload */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Upload Form - Sticky on Desktop */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6">
                <Card>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <ScanLine size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Upload QR Code</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Upload gambar QR code</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pilih File QR Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                      <p className="text-xs text-gray-500 mt-2">Format: JPG, PNG, atau JPEG</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Cara Upload:</h3>
                      <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Pilih gambar QR code dari perangkat</li>
                        <li>Klik tombol "Upload & Scan"</li>
                        <li>Hasil scan akan muncul di sebelah kanan</li>
                      </ol>
                    </div>

                    <button
                      onClick={handleScanFromFile}
                      disabled={!selectedFile}
                      className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <ScanLine size={20} />
                      Upload & Scan
                    </button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column: Result */}
            <div className="lg:col-span-2">
              {/* Hidden element for file scanning */}
              <div id="qr-file-reader-temp" className="hidden"></div>
              
              <Card>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Hasil Scan</h2>
                    <p className="text-sm text-gray-500 mt-1">Informasi QR code yang di-upload</p>
                  </div>
                </div>

                {scannedData ? (
                  <div className="space-y-6">
                    {/* Preview Image */}
                    {uploadedImageUrl && (
                      <div className="flex justify-center">
                        <div className="relative w-64 h-64 rounded-lg overflow-hidden border-2 border-emerald-200">
                          <img
                            src={uploadedImageUrl}
                            alt="QR Code"
                            className="w-full h-full object-contain bg-gray-50"
                          />
                        </div>
                      </div>
                    )}

                    {/* Result */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <ScanLine size={24} className="text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">QR Code Terdeteksi!</h3>
                          <div className="bg-white rounded-lg p-4 border border-emerald-200">
                            <p className="text-sm text-gray-600 mb-1">Kode:</p>
                            <p className="text-base font-mono font-semibold text-gray-900 break-all">{scannedData}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setScannedData(null);
                          setSelectedFile(null);
                          setUploadedImageUrl(null);
                        }}
                        className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Scan Lagi
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scannedData);
                          alert('Kode berhasil disalin!');
                        }}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Salin Kode
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <ScanLine size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Hasil</h3>
                    <p className="text-gray-600">Upload gambar QR code untuk melihat hasil scan</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
