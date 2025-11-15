'use client';

import { Search, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, clearUserSession } from '@/lib/auth';

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userInitial, setUserInitial] = useState('U');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.name) {
      setUserInitial(user.name.charAt(0).toUpperCase());
    } else if (user && user.email) {
      setUserInitial(user.email.charAt(0).toUpperCase());
    }
  }, []);

  const [userName, setUserName] = useState<string | null>(null);
  const [timeGreeting, setTimeGreeting] = useState('pagi');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserName(user.name || user.email || null);
    }

    const hour = new Date().getHours();
    let greeting = 'pagi';
    if (hour >= 4 && hour < 10) greeting = 'pagi';
    else if (hour >= 10 && hour < 15) greeting = 'siang';
    else if (hour >= 15 && hour < 18) greeting = 'sore';
    else greeting = 'malam';
    setTimeGreeting(greeting);
  }, []);

  const handleLogout = () => {
    clearUserSession();
    router.push('/signin');
  };

  // Get page title based on current route
  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/addLocker':
        return 'Kelola Loker';
      case '/addItem':
        return 'Kelola Barang';
      case '/manageCategories':
        return 'Kelola Kategori';
      case '/manageQRCode':
        return 'Kelola QR Code';
      case '/scanQRCode':
        return 'Scan QR Code';
      default:
        if (pathname.startsWith('/locker/')) {
          return 'Detail Loker';
        }
        return 'Dashboard';
    }
  };

  // Get page description based on current route
  const getPageDescription = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Explore information and activity about your property';
      case '/addLocker':
        return 'Kelola dan tambahkan loker penyimpanan baru';
      case '/addItem':
        return 'Kelola dan tambahkan barang ke dalam loker';
      case '/manageCategories':
        return 'Kelola kategori barang';
      case '/manageQRCode':
        return 'Kelola QR Code untuk loker';
      case '/scanQRCode':
        return 'Scan QR Code untuk mengakses loker';
      default:
        if (pathname.startsWith('/locker/')) {
          return 'Informasi detail loker dan daftar barang';
        }
        return 'Explore information and activity about your property';
    }
  };

  return (
    <>
      {/* Mobile Header - Page Title | Search Icon & Profile */}
      <div className="lg:hidden flex items-center justify-between mb-4 gap-3">
        {/* Left: Page Title */}
        <h1 className="text-xl font-bold text-gray-900 flex-1 min-w-0 truncate tracking-tight">
          {getPageTitle()}
        </h1>

        {/* Right: Search Icon & Profile */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Search size={20} className="text-gray-700" />
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-emerald-500 overflow-hidden hover:ring-2 hover:ring-emerald-400 transition-all"
            >
              <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
                {userInitial}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
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
      </div>

      {/* Mobile Search Bar (Expandable) */}
      {showSearch && (
        <div className="lg:hidden mb-4 animate-in slide-in-from-top duration-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Anything..."
              className="w-full pl-4 pr-12 py-3 rounded-full bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
              autoFocus
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors">
              <Search size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Header - Original Layout */}
      <div className="hidden lg:flex items-center justify-between mb-6 lg:mb-8 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {pathname === '/dashboard' ? `Halo, ${userName ?? 'User'}` : getPageTitle()}
          </h1>
          <p className="text-sm lg:text-base text-gray-500 mt-1">
            {pathname === '/dashboard'
              ? `Selamat ${timeGreeting}, berikut ringkasan barang Anda.`
              : getPageDescription()}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Anything..."
              className="w-64 xl:w-80 pl-4 pr-12 py-2.5 lg:py-3 rounded-full bg-white border border-gray-200 text-sm lg:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors">
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
