'use client';

import { AlertTriangle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import useSettings from '@/lib/hooks/useSettings';
import ProfileSection from '@/components/settings/ProfileSection';
import DataManagementSection from '@/components/settings/DataManagementSection';
import DangerZoneSection from '@/components/settings/DangerZoneSection';
import ExportModal from '@/components/settings/ExportModal';
import ImportModal from '@/components/settings/ImportModal';
import ResetConfirmModal from '@/components/settings/ResetConfirmModal';
import DeleteAccountConfirmModal from '@/components/settings/DeleteAccountConfirmModal';

export default function Settings() {
  const {
    // State
    formData,
    profileImage,
    isLoading,
    isUploadingImage,
    isExporting,
    isImporting,
    showExportModal,
    showImportModal,
    showResetModal,
    showDeleteAccountModal,
    isDangerZoneOpen,
    error,
    success,
    importError,
    importSuccess,
    exportSelection,
    importSelection,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    fileInputRef,

    // Handlers
    handleFormChange,
    handleImageUpload,
    handleSubmit,
    handleExportData,
    handleImportData,
    handleResetData,
    handleDeleteAccount,
    setShowExportModal,
    setShowImportModal,
    setShowResetModal,
    setShowDeleteAccountModal,
    toggleDangerZone,
    toggleExportSelection,
    toggleImportSelection,
    togglePasswordVisibility,
    triggerFileInput,
  } = useSettings();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)] lg:pl-24">
        <Sidebar />

        <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">Pengaturan</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Kelola profil, keamanan akun, dan data Anda</p>
            </div>

            {/* Success/Error Messages for Profile */}
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">{success}</p>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Profile Section */}
            <div className="mb-6">
              <ProfileSection
                formData={formData}
                profileImage={profileImage}
                isLoading={isLoading}
                isUploadingImage={isUploadingImage}
                showCurrentPassword={showCurrentPassword}
                showNewPassword={showNewPassword}
                showConfirmPassword={showConfirmPassword}
                onFormChange={handleFormChange}
                onImageUpload={handleImageUpload}
                onSubmit={handleSubmit}
                onToggleCurrentPassword={() => togglePasswordVisibility('current')}
                onToggleNewPassword={() => togglePasswordVisibility('new')}
                onToggleConfirmPassword={() => togglePasswordVisibility('confirm')}
              />
            </div>

            {/* Data Management Section */}
            <div className="mb-6">
              <DataManagementSection
                isExporting={isExporting}
                isImporting={isImporting}
                importSuccess={importSuccess}
                importError={importError}
                fileInputRef={fileInputRef}
                onShowExportModal={() => setShowExportModal(true)}
                onShowImportModal={() => setShowImportModal(true)}
                onImportData={handleImportData}
              />
            </div>

            {/* Danger Zone Section */}
            <DangerZoneSection
              isDangerZoneOpen={isDangerZoneOpen}
              onToggleDangerZone={toggleDangerZone}
              onShowResetModal={() => setShowResetModal(true)}
              onShowDeleteModal={() => setShowDeleteAccountModal(true)}
            />
          </div>
        </main>

        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            exportSelection={exportSelection}
            isExporting={isExporting}
            onClose={() => setShowExportModal(false)}
            onToggle={toggleExportSelection}
            onConfirm={handleExportData}
          />
        )}

        {/* Import Modal */}
        {showImportModal && (
          <ImportModal
            importSelection={importSelection}
            isImporting={isImporting}
            fileInputRef={fileInputRef}
            onClose={() => setShowImportModal(false)}
            onToggle={toggleImportSelection}
            onChooseFile={triggerFileInput}
          />
        )}

        {/* Reset Confirm Modal */}
        {showResetModal && (
          <ResetConfirmModal onClose={() => setShowResetModal(false)} onConfirm={handleResetData} />
        )}

        {/* Delete Account Confirm Modal */}
        {showDeleteAccountModal && (
          <DeleteAccountConfirmModal
            onClose={() => setShowDeleteAccountModal(false)}
            onConfirm={handleDeleteAccount}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
