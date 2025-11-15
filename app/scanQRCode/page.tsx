'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { ScanLine, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import jsQR from 'jsqr';

export default function ScanQRCode() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      // Set state dulu
      setIsScanning(true);
      
      // Tunggu sebentar agar DOM ter-render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Tentukan id berdasarkan screen size
      const readerId = window.innerWidth < 1024 ? 'qr-reader-mobile' : 'qr-reader-desktop';
      
      // Pastikan element sudah ada di DOM
      const element = document.getElementById(readerId);
      if (!element) {
        console.error('QR reader element not found:', readerId);
        setIsScanning(false);
        return;
      }

      // Check if scanner already exists
      if (scannerRef.current) {
        await stopScanner();
      }

      const scanner = new Html5Qrcode(readerId);
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: window.innerWidth < 1024 ? window.innerHeight / window.innerWidth : 1.0
      };

      await scanner.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          // Success callback
          if (isMountedRef.current) {
            alert(`QR Code terdeteksi: ${decodedText}`);
            setScannedData(decodedText);
            stopScanner();
          }
        },
        (errorMessage) => {
          // Error callback (biarkan kosong, tidak perlu log setiap frame)
        }
      );

      if (isMountedRef.current) {
        setHasCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      if (isMountedRef.current) {
        setHasCamera(false);
        setIsScanning(false);
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      scannerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsScanning(false);
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
      // Read file as image
      const imageUrl = URL.createObjectURL(selectedFile);
      const img = new Image();
      
      img.onload = () => {
        // Create canvas to extract image data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          alert('Gagal memproses gambar');
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Scan QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (code) {
          alert(`QR Code terdeteksi: ${code.data}`);
          setScannedData(code.data);
        } else {
          alert('QR Code tidak terdeteksi. Pastikan gambar jelas dan mengandung QR code.');
        }
        
        // Cleanup
        URL.revokeObjectURL(imageUrl);
      };
      
      img.onerror = () => {
        alert('Gagal memuat gambar');
        URL.revokeObjectURL(imageUrl);
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Error scanning file:', error);
      alert('Gagal membaca QR Code. Pastikan file mengandung QR code yang valid.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
      <Sidebar />
      
      <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
        <div className="hidden lg:block">
          <Header />
        </div>
        
        {/* Mobile View - Full Screen Scanner */}
        <div className="lg:hidden">
          {!isScanning && !scannedData && hasCamera && (
            <div className="min-h-screen flex items-center justify-center p-4">
              <Card>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <ScanLine size={32} className="text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Scan QR Code</h2>
                  <p className="text-gray-600 mb-4">Scan QR code loker untuk melihat informasi</p>
                  <button
                    onClick={startScanner}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium"
                  >
                    Mulai Scan
                  </button>
                </div>
              </Card>
            </div>
          )}
          {isScanning ? (
            <div className="fixed inset-0 z-50 flex flex-col bg-black">
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-30 safe-area-top">
                <button
                  onClick={stopScanner}
                  className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 shadow-lg"
                >
                  <X size={24} />
                </button>
                <h1 className="text-white font-bold text-lg tracking-wider">SCAN QR CODE</h1>
                <div className="w-12"></div>
              </div>

              {/* Camera Full Screen - Hidden visually but active */}
              <div className="absolute inset-0 z-0">
                <div id="qr-reader-mobile" className="w-full h-full"></div>
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
                <p className="text-white text-base font-medium mb-6">Arahkan kamera ke QR Code loker</p>
                <div className="flex items-center justify-center">
                  <button className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                    <ScanLine size={32} />
                  </button>
                </div>
              </div>
            </div>
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
                  <p className="text-gray-600 mb-4">Izinkan akses kamera untuk melakukan scan</p>
                  <button
                    onClick={startScanner}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium"
                  >
                    Coba Lagi
                  </button>
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
  );
}
