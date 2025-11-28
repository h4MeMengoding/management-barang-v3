import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, saveUserSession } from '@/lib/auth';
import { getProfilePictureUrl } from '@/lib/supabase-storage';

export default function useSettings() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);

  // Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Message States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  // Data States
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      const user = getCurrentUser();
      if (user) {
        setFormData((prev) => ({
          ...prev,
          fullName: user.name || '',
          email: user.email,
        }));

        if (user.profilePicture) {
          setProfileImage(user.profilePicture);
        } else {
          const pictureUrl = await getProfilePictureUrl(user.id);
          if (pictureUrl) {
            setProfileImage(pictureUrl);
            saveUserSession({ ...user, profilePicture: pictureUrl });
          }
        }
      }
    };

    loadUserData();

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
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('userId', user.id);

      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal upload foto profil');
      }

      saveUserSession(data.user);
      setProfileImage(data.url);
      window.dispatchEvent(new CustomEvent('profilePictureUpdated', { detail: data.url }));
      setSuccess('Foto profil berhasil diperbarui!');

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat upload foto');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
        headers: { 'Content-Type': 'application/json' },
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

      saveUserSession(data.user);
      setSuccess('Profile berhasil diperbarui!');

      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

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

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

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

      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.data) {
        throw new Error('Format file tidak valid. Pastikan menggunakan file export yang benar.');
      }

      const filteredData = {
        lockers: importSelection.lockers ? importData.data.lockers || [] : [],
        categories: importSelection.categories ? importData.data.categories || [] : [],
        items: importSelection.items ? importData.data.items || [] : [],
      };

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

      const messages = [];
      if (result.summary.categoriesImported > 0)
        messages.push(`${result.summary.categoriesImported} kategori`);
      if (result.summary.lockersImported > 0) messages.push(`${result.summary.lockersImported} loker`);
      if (result.summary.itemsCreated > 0) messages.push(`${result.summary.itemsCreated} barang baru`);
      if (result.summary.itemsUpdated > 0) messages.push(`${result.summary.itemsUpdated} barang diupdate`);

      let successMessage = `Import Data Berhasil\n${messages.join(', ')}`;

      if (result.summary.codeMapping && result.summary.codeMapping.length > 0) {
        const mappings = result.summary.codeMapping
          .map((m: { original: string; new: string }) => `• ${m.original} → ${m.new}`)
          .join('\n');
        successMessage += `\n\nKode loker yang diganti:\n${mappings}`;
      }

      setImportSuccess(successMessage);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

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

      sessionStorage.setItem('resetCompleted', 'true');
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

      localStorage.removeItem('user');
      router.push('/signin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus akun');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Functions
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') setShowCurrentPassword(!showCurrentPassword);
    else if (field === 'new') setShowNewPassword(!showNewPassword);
    else setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleDangerZone = () => {
    setIsDangerZoneOpen(!isDangerZoneOpen);
  };

  const toggleExportSelection = (field: 'lockers' | 'categories' | 'items') => {
    setExportSelection({
      ...exportSelection,
      [field]: !exportSelection[field],
    });
  };

  const toggleImportSelection = (field: 'lockers' | 'categories' | 'items') => {
    setImportSelection({
      ...importSelection,
      [field]: !importSelection[field],
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    // States
    formData,
    setFormData,
    profileImage,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isDangerZoneOpen,
    setIsDangerZoneOpen,
    exportSelection,
    setExportSelection,
    importSelection,
    setImportSelection,

    // Loading States
    isLoading,
    isUploadingImage,
    isExporting,
    isImporting,

    // Message States
    error,
    success,
    importError,
    importSuccess,

    // Modal States
    showExportModal,
    setShowExportModal,
    showImportModal,
    setShowImportModal,
    showResetModal,
    setShowResetModal,
    showDeleteAccountModal,
    setShowDeleteAccountModal,

    // Refs
    fileInputRef,

    // Handlers
    handleFormChange,
    handleImageUpload,
    handleSubmit: handleProfileUpdate,
    handleExportData,
    handleImportData,
    handleResetData,
    handleDeleteAccount,
    togglePasswordVisibility,
    toggleDangerZone,
    toggleExportSelection,
    toggleImportSelection,
    triggerFileInput,
  };
}
