'use client';

import { useState, useEffect } from 'react';
import { LogOut, Mail, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { getCurrentUser, clearUserSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { getProfilePictureUrl } from '@/lib/supabase-storage';

export default function Profile() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      const user = getCurrentUser();
      if (user) {
        setUserName(user.name || '');
        setUserEmail(user.email);
        setUserRole(user.role || 'user');

        // Load profile picture from Supabase Storage
        if (user.profilePicture) {
          setProfileImage(user.profilePicture);
        } else {
          const pictureUrl = await getProfilePictureUrl(user.id);
          if (pictureUrl) {
            setProfileImage(pictureUrl);
          }
        }
      }
    };

    loadUserData();
    
    // Listen for profile picture updates from other components
    const handleProfileUpdate = (event: any) => {
      setProfileImage(event.detail);
    };
    
    window.addEventListener('profilePictureUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    clearUserSession();
    router.push('/signin');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
        <Sidebar />
        
        <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-600 mt-1">Informasi akun Anda</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="flex flex-col items-center mb-8">
                {/* Profile Image */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      fill
                      sizes="128px"
                      priority
                      className="object-cover"
                      onError={(e) => {
                        console.error('Image load error:', profileImage);
                        setProfileImage(null);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <span className="text-4xl font-bold text-white">
                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {userName || 'User'}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  userRole === 'admin' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {userRole === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <UserIcon size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Nama Lengkap</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userName || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userEmail || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
