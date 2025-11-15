'use client';

import { Search, User, LogOut, Package, FolderTree, Archive } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, clearUserSession } from '@/lib/auth';

interface SearchResult {
  items: Array<{
    id: string;
    name: string;
    locker: {
      id: string;
      code: string;
      name: string;
    };
    category: {
      id: string;
      name: string;
    };
  }>;
  lockers: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
  }>;
}

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userInitial, setUserInitial] = useState('U');
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.name) {
      setUserInitial(user.name.charAt(0).toUpperCase());
    } else if (user && user.email) {
      setUserInitial(user.email.charAt(0).toUpperCase());
    }
  }, []);

  useEffect(() => {
    // Close search results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setSearchResults(null);
      setShowResults(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const user = getCurrentUser();
        if (!user) return;

        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&userId=${user.id}`);
        const data = await response.json();

        if (response.ok) {
          setSearchResults(data);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleResultClick = (type: 'item' | 'locker' | 'category', id: string) => {
    setShowResults(false);
    setSearchQuery('');
    setSearchResults(null);
    setShowSearch(false);

    if (type === 'locker') {
      router.push(`/locker/${id}`);
    } else if (type === 'category') {
      router.push(`/category/${id}`);
    }
    // Items don't have detail page, so we don't navigate for them
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
        if (pathname.startsWith('/category/')) {
          return 'Detail Kategori';
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
        if (pathname.startsWith('/category/')) {
          return 'Informasi detail kategori dan daftar barang';
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
        <div className="lg:hidden mb-4 animate-in slide-in-from-top duration-200" ref={mobileSearchRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari barang, loker, atau kategori..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-4 pr-12 py-3 rounded-full bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              autoFocus
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors">
              <Search size={16} />
            </button>

            {/* Mobile Search Results Dropdown */}
            {showResults && searchResults && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                {searchResults.items.length === 0 && searchResults.lockers.length === 0 && searchResults.categories.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    Tidak ada hasil ditemukan
                  </div>
                ) : (
                  <>
                    {/* Items Section */}
                    {searchResults.items.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Barang</div>
                        {searchResults.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-default"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Package size={16} className="text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.locker.code} - {item.locker.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lockers Section */}
                    {searchResults.lockers.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Loker</div>
                        {searchResults.lockers.map((locker: any) => (
                          <button
                            key={locker.id}
                            onClick={() => handleResultClick('locker', locker.id)}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Archive size={16} className="text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{locker.name}</p>
                                <p className="text-xs text-gray-500">Kode: {locker.code}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Categories Section */}
                    {searchResults.categories.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Kategori</div>
                        {searchResults.categories.map((category: any) => (
                          <button
                            key={category.id}
                            onClick={() => handleResultClick('category', category.id)}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <FolderTree size={16} className="text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{category.name}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
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
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              placeholder="Cari barang, loker, atau kategori..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-64 xl:w-80 pl-4 pr-12 py-2.5 lg:py-3 rounded-full bg-white border border-gray-200 text-sm lg:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors">
              <Search size={18} />
            </button>

            {/* Desktop Search Results Dropdown */}
            {showResults && searchResults && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                {searchResults.items.length === 0 && searchResults.lockers.length === 0 && searchResults.categories.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    Tidak ada hasil ditemukan
                  </div>
                ) : (
                  <>
                    {/* Items Section */}
                    {searchResults.items.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Barang</div>
                        {searchResults.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-default"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Package size={16} className="text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.locker.code} - {item.locker.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lockers Section */}
                    {searchResults.lockers.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Loker</div>
                        {searchResults.lockers.map((locker: any) => (
                          <button
                            key={locker.id}
                            onClick={() => handleResultClick('locker', locker.id)}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Archive size={16} className="text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{locker.name}</p>
                                <p className="text-xs text-gray-500">Kode: {locker.code}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Categories Section */}
                    {searchResults.categories.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Kategori</div>
                        {searchResults.categories.map((category: any) => (
                          <button
                            key={category.id}
                            onClick={() => handleResultClick('category', category.id)}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <FolderTree size={16} className="text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{category.name}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
