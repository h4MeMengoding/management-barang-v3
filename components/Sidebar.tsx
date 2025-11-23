'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutGrid, PlusSquare, Package, FolderTree, QrCode, ScanLine, Settings, HelpCircle, LogOut, User, Users } from 'lucide-react';
import { clearUserSession, getCurrentUser } from '@/lib/auth';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userInitial, setUserInitial] = useState('U');
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [animateMobileNav, setAnimateMobileNav] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.name) {
      setUserInitial(user.name.charAt(0).toUpperCase());
      setUserName(user.name);
    } else if (user && user.email) {
      setUserInitial(user.email.charAt(0).toUpperCase());
    }
    
    if (user && user.email) {
      setUserEmail(user.email);
    }
    
    // Check if user is admin
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    }
    
    // Load profile picture
    if (user && user.profilePicture) {
      setProfilePicture(user.profilePicture);
    }
    
    // Listen for profile picture updates
    const handleProfileUpdate = (event: any) => {
      setProfilePicture(event.detail);
    };
    
    window.addEventListener('profilePictureUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
    };
  }, []);

  // Only animate mobile bottom nav on the very first visit in this session.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const flag = sessionStorage.getItem('mobileBottomAnimated');
      if (!flag) {
        setAnimateMobileNav(true);
        // mark as shown so subsequent mounts (navigations) don't animate
        sessionStorage.setItem('mobileBottomAnimated', '1');
      } else {
        setAnimateMobileNav(false);
      }
    } catch (e) {
      setAnimateMobileNav(false);
    }
  }, []);

  // Handle scroll to show/hide mobile nav
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // Scrolling down
        setShowMobileNav(false);
      } else {
        // Scrolling up
        setShowMobileNav(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    clearUserSession();
    router.push('/signin');
  };

  const menuItems = [
    {
      icon: LayoutGrid,
      href: '/dashboard',
      label: 'Dashboard'
    },
    {
      icon: PlusSquare,
      href: '/manage-locker',
      label: 'Kelola Loker'
    },
    {
      icon: Package,
      href: '/manage-items',
      label: 'Kelola Barang'
    },
    {
      icon: FolderTree,
      href: '/manage-categories',
      label: 'Kelola Kategori'
    },
    {
      icon: ScanLine,
      href: '/scan-qr',
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

  // mobile indicator handled via Framer Motion shared layout (layoutId)

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
          <motion.div 
            key={index} 
            className="relative group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              href={item.href}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                pathname === item.href
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon size={20} />
              </motion.div>
            </Link>

            {/* Floating tooltip for desktop */}
            <div className="hidden lg:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none">
              <div className="relative">
                <div className="bg-white text-gray-900 text-sm font-medium px-3 py-2 rounded-lg shadow-lg border border-gray-200 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out whitespace-nowrap z-50">
                  {item.label}
                </div>
                {/* small diamond arrow */}
                <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45 opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Settings & Help at bottom */}
      <div className="mt-auto flex flex-col gap-2">
        {isAdmin && (
          <div className="relative group">
            <Link
              href="/manage-users"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                pathname === '/manage-users'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Users size={20} />
            </Link>
            <div className="hidden lg:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none">
              <div className="relative">
                <div className="bg-white text-gray-900 text-sm font-medium px-3 py-2 rounded-lg shadow-lg border border-gray-200 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out whitespace-nowrap z-50">
                  Kelola User
                </div>
                <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45 opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out" />
              </div>
            </div>
          </div>
        )}
        
        <div className="relative group">
          <Link
            href="/settings"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              pathname === '/settings'
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            <Settings size={20} />
          </Link>
          <div className="hidden lg:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none">
            <div className="relative">
              <div className="bg-white text-gray-900 text-sm font-medium px-3 py-2 rounded-lg shadow-lg border border-gray-200 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out whitespace-nowrap z-50">
                Settings
              </div>
              <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45 opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out" />
            </div>
          </div>
        </div>

        <div className="relative group">
          <button className="w-11 h-11 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <HelpCircle size={20} />
          </button>
          <div className="hidden lg:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none">
            <div className="relative">
              <div className="bg-white text-gray-900 text-sm font-medium px-3 py-2 rounded-lg shadow-lg border border-gray-200 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out whitespace-nowrap z-50">
                Help
              </div>
              <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45 opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out" />
            </div>
          </div>
        </div>
      </div>

      {/* User Avatar at bottom */}
      <div className="relative group">
        <button 
          className="w-11 h-11 rounded-full bg-emerald-500 overflow-hidden hover:ring-2 hover:ring-emerald-400 transition-all"
        >
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt="Profile"
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
              {userInitial}
            </div>
          )}
        </button>

        {/* Profile Dropdown Menu - Shows on Hover */}
        <div className="absolute bottom-0 left-16 ml-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-3 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600 mt-1"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
      </div>

      {/* Mobile Bottom Navigation (FAB Style) */}
      <motion.div 
        className="lg:hidden fixed bottom-4 left-0 right-0 z-50 px-8"
        initial={animateMobileNav ? { y: 100, opacity: 0 } : false}
        animate={{ 
          y: showMobileNav ? 0 : 120,
          opacity: showMobileNav ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="relative bg-white rounded-full shadow-2xl border border-gray-200 px-2 py-2.5 max-w-[280px] mx-auto">
          <div className="flex items-center justify-between gap-1 relative">
            {/* Left Menu Items */}
            {mobileMenuLeft.map((item, index) => (
              <Link key={index} href={item.href}>
                <div className="relative">
                  {pathname === item.href && (
                    <motion.span
                      layoutId="mobile-indicator"
                      initial={false}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none bg-emerald-600"
                      style={{ width: 44, height: 44, zIndex: 10 }}
                    />
                  )}

                  <div className={`p-2.5 rounded-full relative z-20 transition-all ${
                    pathname === item.href ? 'text-white' : 'text-gray-400'
                  }`}>
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.1 }}
                    >
                      <item.icon size={22} />
                    </motion.div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Center QR Scanner Button (Elevated) */}
            <Link href="/scan-qr">
              <div className="relative">
                {pathname === '/scan-qr' && (
                  <motion.span
                    layoutId="mobile-indicator"
                    initial={false}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none bg-emerald-600"
                    style={{ width: 60, height: 60, zIndex: 10 }}
                  />
                )}

                <div
                  className={`p-4 rounded-full transition-all shadow-lg -mt-8 relative z-20 ${
                    pathname === '/scan-qr'
                      ? 'bg-emerald-600 text-white scale-110'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.1 }}
                  >
                    <ScanLine size={26} />
                  </motion.div>
                </div>
              </div>
            </Link>

            {/* Right Menu Items */}
            {mobileMenuRight.map((item, idx) => (
              <Link key={idx} href={item.href}>
                <div className="relative">
                  {pathname === item.href && (
                    <motion.span
                      layoutId="mobile-indicator"
                      initial={false}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none bg-emerald-600"
                      style={{ width: 44, height: 44, zIndex: 10 }}
                    />
                  )}

                  <div className={`p-2.5 rounded-full relative z-20 transition-all ${
                    pathname === item.href ? 'text-white' : 'text-gray-400'
                  }`}>
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.1 }}
                    >
                      <item.icon size={22} />
                    </motion.div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tooltip when menu is hidden */}
      <motion.div
        className="lg:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: !showMobileNav ? 1 : 0,
          y: !showMobileNav ? 0 : 20
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ pointerEvents: 'none' }}
      >
        <div className="bg-gray-900/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
            <path d="M6 2L6 10M6 2L3 5M6 2L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Scroll Keatas Membuka Menu</span>
        </div>
      </motion.div>
    </>
  );
}
