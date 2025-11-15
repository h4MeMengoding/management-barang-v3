'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, PlusSquare, Package, FolderTree, QrCode, ScanLine, Settings, HelpCircle, LogOut, User } from 'lucide-react';
import NProgress from 'nprogress';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
    router.push('/signin');
  };

  const menuItems = [
    {
      icon: <LayoutGrid size={20} />,
      href: '/dashboard',
      label: 'Dashboard'
    },
    {
      icon: <PlusSquare size={20} />,
      href: '/addLocker',
      label: 'Kelola Loker'
    },
    {
      icon: <Package size={20} />,
      href: '/addItem',
      label: 'Kelola Barang'
    },
    {
      icon: <FolderTree size={20} />,
      href: '/manageCategories',
      label: 'Kelola Kategori'
    },
    {
      icon: <QrCode size={20} />,
      href: '/manageQRCode',
      label: 'Kelola QR Code'
    },
    {
      icon: <ScanLine size={20} />,
      href: '/scanQRCode',
      label: 'Scan QR Code'
    }
  ];

  // Split menu items for mobile bottom nav
  const mobileMenuLeft = [
    menuItems[0], // Dashboard
    menuItems[1], // Kelola Loker
  ];
  
  const mobileMenuRight = [
    menuItems[2], // Kelola Barang
    menuItems[3], // Kelola Kategori
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-3 lg:left-6 top-3 lg:top-6 bottom-3 lg:bottom-6 w-16 lg:w-[72px] bg-white rounded-2xl lg:rounded-3xl shadow-lg flex-col items-center py-4 lg:py-5 gap-2 lg:gap-3 z-50">
      {/* Logo */}
      <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-3">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="3" fill="white"/>
          <circle cx="16" cy="8" r="2" fill="white"/>
          <circle cx="16" cy="24" r="2" fill="white"/>
          <circle cx="24" cy="12" r="2" fill="white"/>
          <circle cx="8" cy="12" r="2" fill="white"/>
          <circle cx="24" cy="20" r="2" fill="white"/>
          <circle cx="8" cy="20" r="2" fill="white"/>
        </svg>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            onClick={() => NProgress.start()}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              pathname === item.href
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={item.label}
          >
            {item.icon}
          </Link>
        ))}
      </div>

      {/* Settings & Help at bottom */}
      <div className="mt-auto flex flex-col gap-2">
        <button className="w-11 h-11 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100">
          <Settings size={20} />
        </button>
        <button className="w-11 h-11 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100">
          <HelpCircle size={20} />
        </button>
      </div>

      {/* User Avatar at bottom */}
      <div className="relative">
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-11 h-11 rounded-full bg-emerald-500 overflow-hidden hover:ring-2 hover:ring-emerald-400 transition-all"
        >
          <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
            JD
          </div>
        </button>
        
        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-0 left-16 ml-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            <Link
              href="/profile"
              onClick={() => setShowProfileMenu(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-gray-700"
            >
              <User size={18} />
              <span className="text-sm font-medium">Profile Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-red-600"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
      </div>

      {/* Mobile Bottom Navigation (FAB Style) */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 z-50 px-4">
        <div className="bg-white rounded-full shadow-2xl border border-gray-200 px-3 py-2 max-w-sm mx-auto">
          <div className="flex items-center justify-between gap-2">
            {/* Left Menu Items */}
            {mobileMenuLeft.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => NProgress.start()}
                className={`p-2.5 rounded-full transition-all ${
                  pathname === item.href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {item.icon}
              </Link>
            ))}
            
            {/* Center QR Scanner Button (Elevated) */}
            <Link
              href="/scanQRCode"
              onClick={() => NProgress.start()}
              className={`p-3.5 rounded-full transition-all shadow-lg -mt-8 ${
                pathname === '/scanQRCode'
                  ? 'bg-emerald-600 text-white scale-110'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              <ScanLine size={24} />
            </Link>
            
            {/* Right Menu Items */}
            {mobileMenuRight.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => NProgress.start()}
                className={`p-2.5 rounded-full transition-all ${
                  pathname === item.href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {item.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
