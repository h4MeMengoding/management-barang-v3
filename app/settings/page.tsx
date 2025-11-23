'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Eye, EyeOff, Save, Loader2, Download, Upload, FileJson, PlusSquare, Package, FolderTree, AlertTriangle, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { getCurrentUser, saveUserSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { getProfilePictureUrl } from '@/lib/supabase-storage';

export default function Settings() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  // Export/Import data selection
  const [exportSelection, setExportSelection] = useState({
    lockers: true,
    categories: true,
    items: true,
  });
  
  const [importSelection, setImportSelection] = useState({
    lockers: true,
    categories: true,
    items: true,
  });

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
      // Upload to API route (which uses service role key)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal upload foto profil');
      }

      // Update session with new user data
      saveUserSession(data.user);

      // Update local state
      setProfileImage(data.url);

      // Broadcast event to update other components (like Sidebar)
      window.dispatchEvent(new CustomEvent('profilePictureUpdated', { detail: data.url }));

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

  const handleExportData = async () => {
    setShowExportModal(false);
    
    // Check if at least one option is selected
    if (!exportSelection.lockers && !exportSelection.categories && !exportSelection.items) {
      setImportError('Pilih minimal satu jenis data untuk export');
      return;
    }

    setIsExporting(true);
    setImportError('');
    setImportSuccess('');

    try {
      const user = getCurrentUser();
      if (!user) {
        setImportError('User tidak ditemukan');
        return;
      }

      // Pass selection to API with smart dependencies
      const params = new URLSearchParams({
        userId: user.id,
        lockers: exportSelection.lockers.toString(),
        categories: exportSelection.categories.toString(),
        items: exportSelection.items.toString(),
      });

      const response = await fetch(`/api/data/export?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal export data');
      }

      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Format filename with date and selected data types
      const date = new Date().toISOString().split('T')[0];
      const types = [];
      if (exportSelection.lockers) types.push('lockers');
      if (exportSelection.categories) types.push('categories');
      if (exportSelection.items) types.push('items');
      link.download = `management-barang-${types.join('-')}-${date}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success with summary
      const summary = [];
      if (data.data.lockers?.length > 0) summary.push(`${data.data.lockers.length} loker`);
      if (data.data.categories?.length > 0) summary.push(`${data.data.categories.length} kategori`);
      if (data.data.items?.length > 0) summary.push(`${data.data.items.length} barang`);
      
      setImportSuccess(`Export berhasil! ${summary.join(' + ')}`);
      setTimeout(() => setImportSuccess(''), 5000);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Terjadi kesalahan saat export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowImportModal(false);
    
    // Check if at least one option is selected
    if (!importSelection.lockers && !importSelection.categories && !importSelection.items) {
      setImportError('Pilih minimal satu jenis data untuk import');
      e.target.value = '';
      return;
    }

    setIsImporting(true);
    setImportError('');
    setImportSuccess('');

    try {
      const user = getCurrentUser();
      if (!user) {
        setImportError('User tidak ditemukan');
        return;
      }

      // Read file content
      const text = await file.text();
      const importData = JSON.parse(text);

      // Validate data structure
      if (!importData.data) {
        throw new Error('Format file tidak valid. Pastikan menggunakan file export yang benar.');
      }

      // Filter data based on selection
      const filteredData = {
        lockers: importSelection.lockers ? (importData.data.lockers || []) : [],
        categories: importSelection.categories ? (importData.data.categories || []) : [],
        items: importSelection.items ? (importData.data.items || []) : [],
      };

      // Send import request
      const response = await fetch('/api/data/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          data: filteredData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal import data');
      }

      // Build success message
      const messages = [];
      if (result.summary.categoriesImported > 0) messages.push(`${result.summary.categoriesImported} kategori`);
      if (result.summary.lockersImported > 0) messages.push(`${result.summary.lockersImported} loker`);
      if (result.summary.itemsCreated > 0) messages.push(`${result.summary.itemsCreated} barang baru`);
      if (result.summary.itemsUpdated > 0) messages.push(`${result.summary.itemsUpdated} barang diupdate`);

      let successMessage = `Import Data Berhasil\n${messages.join(', ')}`;

      // Show code mapping if any codes were changed
      if (result.summary.codeMapping && result.summary.codeMapping.length > 0) {
        const mappings = result.summary.codeMapping
          .map((m: { original: string; new: string }) => `• ${m.original} → ${m.new}`)
          .join('\n');
        successMessage += `\n\nKode loker yang diganti:\n${mappings}`;
      }

      setImportSuccess(successMessage);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh page after 3 seconds
      setTimeout(() => {
        router.refresh();
      }, 3000);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Terjadi kesalahan saat import data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleResetData = async () => {
    setShowResetModal(false);
    setIsLoading(true);
    setImportError('');
    setImportSuccess('');

    try {
      const user = getCurrentUser();
      if (!user) {
        setImportError('User tidak ditemukan');
        return;
      }

      const response = await fetch('/api/data/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal reset data');
      }

      // Set flag in sessionStorage for reset success page
      sessionStorage.setItem('resetCompleted', 'true');
      
      // Redirect to reset success page
      router.push('/reset-success');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Terjadi kesalahan saat reset data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteAccountModal(false);
    setIsLoading(true);
    setError('');

    try {
      const user = getCurrentUser();
      if (!user) {
        setError('User tidak ditemukan');
        return;
      }

      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menghapus akun');
      }

      // Clear session and redirect to signin
      localStorage.removeItem('user');
      router.push('/signin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus akun');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
        <Sidebar />

        <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Pengaturan</h1>
              <p className="text-sm text-gray-600 mt-1">Kelola profil, keamanan akun, dan data Anda</p>
            </div>

            {/* Success/Error Messages for Profile */}
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-700">{success}</p>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Profile Section */}
            <div className="mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                      <Save className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Profil & Keamanan</h2>
                      <p className="text-xs text-gray-600 mt-0.5">Update informasi pribadi dan password Anda</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Picture */}
                    <div className="lg:col-span-1">
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">Foto Profil</h3>

                        <div className="flex flex-col items-center">
                          {/* Profile Image Circle */}
                          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 group cursor-pointer shadow-lg ring-4 ring-white">
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
                              <div className="w-full h-full flex items-center justify-center bg-emerald-600">
                                <span className="text-4xl font-bold text-white">
                                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                            )}

                            {/* Camera Button Overlay */}
                            <label
                              htmlFor="profile-upload"
                              className={`absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all ${isUploadingImage ? 'cursor-wait' : 'cursor-pointer'} flex items-center justify-center`}
                            >
                              {isUploadingImage ? (
                                <Loader2 className="text-white animate-spin" size={32} />
                              ) : (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                                  <Camera className="text-white" size={32} />
                                  <span className="text-xs text-white font-medium">Upload Foto</span>
                                </div>
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

                          <p className="text-xs text-gray-600 text-center">
                            {isUploadingImage ? (
                              <span className="text-emerald-600 font-semibold">Uploading...</span>
                            ) : (
                              <>
                                JPG, PNG, WebP (Max 2MB)
                                <br />
                                <span className="text-gray-500">Klik untuk upload</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="lg:col-span-2">
                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name & Email in Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="fullName" className="block text-xs font-semibold text-gray-700 mb-2">
                              Nama Lengkap
                            </label>
                            <input
                              type="text"
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              placeholder="Masukkan nama lengkap"
                              required
                              disabled={isLoading}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="email@example.com"
                              required
                              disabled={isLoading}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="relative py-3">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-4 bg-white text-xs font-semibold text-gray-500">Ubah Password (Opsional)</span>
                          </div>
                        </div>

                        {/* Password Fields */}
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="currentPassword" className="block text-xs font-semibold text-gray-700 mb-2">
                              Password Saat Ini
                            </label>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="Masukkan password saat ini"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all pr-12"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="newPassword" className="block text-xs font-semibold text-gray-700 mb-2">
                                Password Baru
                              </label>
                              <div className="relative">
                                <input
                                  type={showNewPassword ? 'text' : 'password'}
                                  id="newPassword"
                                  name="newPassword"
                                  value={formData.newPassword}
                                  onChange={handleChange}
                                  placeholder="Min. 8 karakter"
                                  minLength={8}
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all pr-12"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 mb-2">
                                Konfirmasi Password
                              </label>
                              <div className="relative">
                                <input
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  id="confirmPassword"
                                  name="confirmPassword"
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                  placeholder="Ulangi password baru"
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all pr-12"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="animate-spin" size={18} />
                                Menyimpan...
                              </>
                            ) : (
                              <>
                                <Save size={18} />
                                Simpan Perubahan
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Import/Export Section */}
            <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <FileJson className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Import & Export Data</h2>
                    <p className="text-xs text-gray-600 mt-0.5">Backup atau restore data loker, barang, dan kategori</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Import/Export Messages */}
                {importSuccess && (
                  <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-green-700">{importSuccess}</p>
                  </div>
                )}
                {importError && (
                  <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-red-700">{importError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Export Section */}
                  <div className="rounded-xl border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 bg-emerald-50 hover:shadow-md">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Download className="text-white" size={22} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-gray-900 mb-1">Export Data</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Download data loker, barang, dan kategori dalam format JSON
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowExportModal(true)}
                        disabled={isExporting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <FileJson size={18} />
                            Export Sekarang
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Import Section */}
                  <div className="rounded-xl border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 bg-emerald-50 hover:shadow-md">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Upload className="text-white" size={22} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-gray-900 mb-1">Import Data</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Upload JSON untuk menambahkan data loker, barang, dan kategori
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setShowImportModal(true)}
                        disabled={isImporting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Upload size={18} />
                            Pilih File JSON
                          </>
                        )}
                      </button>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="import-file"
                        accept="application/json,.json"
                        onChange={handleImportData}
                        disabled={isImporting}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-amber-900 mb-2">Catatan Penting</h4>
                      <ul className="text-xs text-amber-800 space-y-1.5 leading-relaxed">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">•</span>
                          <span>Data yang diimport akan <strong>ditambahkan</strong> ke data yang sudah ada, tidak menghapus data lama</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">•</span>
                          <span>Jika loker/kategori sudah ada akan diupdate. Jika barang sudah ada, jumlahnya akan ditambahkan</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">•</span>
                          <span>Pastikan file JSON adalah hasil export dari aplikasi ini</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">•</span>
                          <span>Simpan file export sebagai backup berkala untuk keamanan data</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
              <button
                onClick={() => setIsDangerZoneOpen(!isDangerZoneOpen)}
                className="w-full px-6 py-5 border-b border-red-200 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-red-500 flex items-center justify-center shadow-sm">
                      <AlertTriangle className="text-white" size={22} />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-gray-900">Danger Zone</h2>
                      <p className="text-sm text-red-600 mt-0.5">Tindakan permanen yang tidak dapat dibatalkan</p>
                    </div>
                  </div>
                  <div className="text-red-600">
                    {isDangerZoneOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>
              </button>

              {isDangerZoneOpen && (
                <div className="p-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Reset Configuration */}
                  <div className="group p-6 border border-red-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-red-50/30">
                    <div className="flex flex-col h-full">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                            <RefreshCw className="text-red-600" size={18} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Reset Konfigurasi</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed pl-11">
                          Menghapus semua data loker, kategori, dan barang. Akun Anda akan tetap ada tetapi semua data akan dikembalikan ke kondisi awal.
                        </p>
                        <div className="ml-11 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs font-semibold text-red-700 flex items-center gap-2">
                            <AlertTriangle size={14} className="flex-shrink-0" />
                            <span>Tindakan ini tidak dapat dibatalkan!</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowResetModal(true)}
                        className="mt-4 w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={16} />
                        Reset Data
                      </button>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="group p-6 border border-red-300 rounded-xl hover:border-red-400 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-red-100/40">
                    <div className="flex flex-col h-full">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-red-200 flex items-center justify-center group-hover:bg-red-300 transition-colors">
                            <Trash2 className="text-red-700" size={18} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Hapus Akun</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed pl-11">
                          Menghapus akun Anda secara permanen beserta semua data yang terkait. Anda tidak akan bisa login kembali dengan akun ini.
                        </p>
                        <div className="ml-11 p-3 bg-red-100 border border-red-300 rounded-lg">
                          <p className="text-xs font-bold text-red-800 flex items-center gap-2">
                            <AlertTriangle size={14} className="flex-shrink-0" />
                            <span>Semua data akan hilang selamanya!</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowDeleteAccountModal(true)}
                        className="mt-4 w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Hapus Akun
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </main>

        {/* Export Modal */}
        {showExportModal && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onClick={() => setShowExportModal(false)}
          >
            <div 
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 bg-emerald-50 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Download className="text-emerald-600" size={24} />
                      Pilih Data untuk Export
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Centang data yang ingin diexport</p>
                  </div>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-3">
                <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all duration-200 group">
                  <input
                    type="checkbox"
                    checked={exportSelection.lockers}
                    onChange={(e) => setExportSelection({ ...exportSelection, lockers: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-base font-semibold text-gray-900 block group-hover:text-emerald-700 transition-colors">Loker</span>
                    <span className="text-xs text-gray-500">Export semua data loker</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <PlusSquare className="text-emerald-600" size={20} />
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all duration-200 group">
                  <input
                    type="checkbox"
                    checked={exportSelection.categories}
                    onChange={(e) => setExportSelection({ ...exportSelection, categories: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-base font-semibold text-gray-900 block group-hover:text-emerald-700 transition-colors">Kategori</span>
                    <span className="text-xs text-gray-500">Export semua kategori barang</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <FolderTree className="text-emerald-600" size={20} />
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all duration-200 group">
                  <input
                    type="checkbox"
                    checked={exportSelection.items}
                    onChange={(e) => setExportSelection({ ...exportSelection, items: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-base font-semibold text-gray-900 block group-hover:text-emerald-700 transition-colors">Barang</span>
                    <span className="text-xs text-gray-500">Export semua data barang</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <Package className="text-emerald-600" size={20} />
                  </div>
                </label>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex gap-3 rounded-b-2xl">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 py-3 px-4 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all hover:shadow-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleExportData}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Download size={18} />
                    Export
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onClick={() => setShowImportModal(false)}
          >
            <div 
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 bg-emerald-50 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Upload className="text-emerald-600" size={24} />
                      Pilih Data untuk Import
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Centang data yang ingin diimport</p>
                  </div>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-3">
                <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all duration-200 group">
                  <input
                    type="checkbox"
                    checked={importSelection.lockers}
                    onChange={(e) => setImportSelection({ ...importSelection, lockers: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-base font-semibold text-gray-900 block group-hover:text-emerald-700 transition-colors">Loker</span>
                    <span className="text-xs text-gray-500">Import data loker dari file</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <PlusSquare className="text-emerald-600" size={20} />
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all duration-200 group">
                  <input
                    type="checkbox"
                    checked={importSelection.categories}
                    onChange={(e) => setImportSelection({ ...importSelection, categories: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-base font-semibold text-gray-900 block group-hover:text-emerald-700 transition-colors">Kategori</span>
                    <span className="text-xs text-gray-500">Import kategori barang dari file</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <FolderTree className="text-emerald-600" size={20} />
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all duration-200 group">
                  <input
                    type="checkbox"
                    checked={importSelection.items}
                    onChange={(e) => setImportSelection({ ...importSelection, items: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-base font-semibold text-gray-900 block group-hover:text-emerald-700 transition-colors">Barang</span>
                    <span className="text-xs text-gray-500">Import data barang dari file</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <Package className="text-emerald-600" size={20} />
                  </div>
                </label>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex gap-3 rounded-b-2xl">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-3 px-4 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all hover:shadow-sm"
                >
                  Batal
                </button>
                <label htmlFor="import-file" className="flex-1 cursor-pointer">
                  <div className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-center">
                    <span className="flex items-center justify-center gap-2">
                      <Upload size={18} />
                      Pilih File
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Reset Data Confirmation Modal */}
        {showResetModal && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onClick={() => setShowResetModal(false)}
          >
            <div 
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-red-200 bg-red-50 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                    <AlertTriangle className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Konfirmasi Reset Data</h3>
                    <p className="text-sm text-red-700 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Anda akan menghapus <strong className="text-red-600">semua data</strong> berikut:
                  </p>
                  
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      <PlusSquare className="text-red-600" size={16} />
                      <span>Semua loker dan QR code</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      <FolderTree className="text-red-600" size={16} />
                      <span>Semua kategori barang</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      <Package className="text-red-600" size={16} />
                      <span>Semua barang yang tersimpan</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                    <p className="text-sm text-amber-900 font-semibold flex items-center gap-2">
                      <AlertTriangle className="text-amber-600" size={16} />
                      Akun Anda tidak akan dihapus, hanya datanya saja
                    </p>
                  </div>

                  <p className="text-sm text-gray-600">
                    Pastikan Anda sudah melakukan <strong>backup/export data</strong> jika diperlukan.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex gap-3 rounded-b-2xl">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 px-4 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleResetData}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      Ya, Reset Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Confirmation Modal */}
        {showDeleteAccountModal && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onClick={() => setShowDeleteAccountModal(false)}
          >
            <div 
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-red-300 bg-red-100 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-700 flex items-center justify-center">
                    <Trash2 className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Hapus Akun Permanen</h3>
                    <p className="text-sm text-red-800 mt-0.5 font-semibold">Ini akan menghapus semuanya!</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed font-semibold">
                    Apakah Anda yakin ingin menghapus akun ini secara permanen?
                  </p>
                  
                  <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-bold text-red-900 flex items-center gap-2">
                      <AlertTriangle className="text-red-700" size={18} />
                      Yang akan hilang selamanya:
                    </p>
                    <div className="space-y-2 ml-6">
                      <div className="flex items-start gap-2 text-sm text-red-800">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span>Akun dan informasi profil Anda</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-red-800">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span>Semua loker, kategori, dan barang</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-red-800">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span>Riwayat transaksi dan aktivitas</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-red-800">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span>Foto profil dan semua file</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Tidak ada cara untuk memulihkan akun ini.</strong> Jika Anda ingin menggunakan aplikasi lagi, Anda harus membuat akun baru.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex gap-3 rounded-b-2xl">
                <button
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="flex-1 py-3 px-4 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Ya, Hapus Akun Saya
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
