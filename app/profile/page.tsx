'use client';

import { useState, useEffect } from 'react';
import { Camera, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { getCurrentUser, saveUserSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { uploadProfilePicture, getProfilePictureUrl } from '@/lib/supabase-storage';

export default function ProfileSettings() {
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      const user = getCurrentUser();
      if (user) {
        setFormData(prev => ({
          ...prev,
          fullName: user.name || '',
          email: user.email
        }));

        // Load profile picture from Supabase Storage
        if (user.profilePicture) {
          setProfileImage(user.profilePicture);
        } else {
          const pictureUrl = await getProfilePictureUrl(user.id);
          if (pictureUrl) {
            setProfileImage(pictureUrl);
            
            // Update session with the fetched picture URL
            saveUserSession({ ...user, profilePicture: pictureUrl });
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const user = getCurrentUser();
    if (!user) {
      setError('User tidak ditemukan');
      return;
    }

    setIsUploadingImage(true);
    setError('');
    setSuccess('');

    try {
      // Upload to Supabase Storage
      const { url, error: uploadError } = await uploadProfilePicture(file, user.id);

      if (uploadError) {
        setError(uploadError);
        return;
      }

      // Update profile picture URL in database
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profilePicture: url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui foto profil');
      }

      // Update session first
      saveUserSession(data.user);
      
      // Then update local state
      setProfileImage(url);
      
      // Broadcast event to update other components (like Sidebar)
      window.dispatchEvent(new CustomEvent('profilePictureUpdated', { detail: url }));
      
      setSuccess('Foto profil berhasil diperbarui!');
      
      // Force full page reload to ensure all components update
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat upload foto');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate password change if attempting to update password
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setError('Masukkan password saat ini untuk mengubah password');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Password baru dan konfirmasi password tidak cocok!');
        return;
      }
      if (formData.newPassword.length < 8) {
        setError('Password baru minimal 8 karakter');
        return;
      }
    }
    
    setIsLoading(true);

    try {
      const user = getCurrentUser();
      if (!user) {
        setError('User tidak ditemukan');
        return;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          name: formData.fullName,
          email: formData.email,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui profile');
      }

      // Update session dengan data baru
      saveUserSession(data.user);
      
      setSuccess('Profile berhasil diperbarui!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Refresh untuk update sidebar
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
        <Sidebar />
        
        <div className="lg:pr-6 py-6 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-sm text-gray-600 mt-1">Kelola informasi profil dan keamanan akun Anda</p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Picture */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Foto Profil</h3>
              
              <div className="flex flex-col items-center">
                {/* Profile Image Circle */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 group cursor-pointer">
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
                        {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}
                  
                  {/* Camera Button Overlay */}
                  <label 
                    htmlFor="profile-upload"
                    className={`absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all ${isUploadingImage ? 'cursor-wait' : 'cursor-pointer'} flex items-center justify-center`}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="text-white animate-spin" size={28} />
                    ) : (
                      <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={28} />
                    )}
                    <input
                      type="file"
                      id="profile-upload"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  {isUploadingImage ? (
                    <span className="text-emerald-600 font-medium">Uploading...</span>
                  ) : (
                    <>
                      Upload foto profil Anda
                      <br />
                      Format: JPG, PNG, WebP (Max 2MB)
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Information Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Profil</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@mail.com"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                <h4 className="text-base font-semibold text-gray-900 mb-3">Ubah Password</h4>
                <p className="text-xs text-gray-500 mb-4">Kosongkan jika tidak ingin mengubah password</p>

                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      minLength={8}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter</p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:bg-emerald-400 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
