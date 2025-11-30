'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import LockerForm from '@/components/lockers/LockerForm';
import LockerList from '@/components/lockers/LockerList';
import { useManageLockers } from '@/lib/hooks/useManageLockers';

export default function ManageLocker() {
  const {
    lockers,
    isLoading,
    isLoadingLockers,
    isGeneratingCode,
    error,
    success,
    generateCode,
    checkCodeAvailability,
    createLocker,
    bulkDeleteLockers,
  } = useManageLockers();

  const handleSubmit = async (data: { name: string; code: string; description: string }) => {
    return await createLocker(data);
  };

  const handleBulkDelete = async (lockerIds: string[], moveToLockerId?: string) => {
    return await bulkDeleteLockers(lockerIds, moveToLockerId);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--body-bg)] lg:pl-24">
        <Sidebar />
        
        <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Header />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form - Sticky on Desktop */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-6">
                  <LockerForm
                    isLoading={isLoading}
                    isGeneratingCode={isGeneratingCode}
                    error={error}
                    success={success}
                    onSubmit={handleSubmit}
                    onGenerateCode={generateCode}
                    onCheckCode={checkCodeAvailability}
                  />
                </div>
              </div>

              {/* Right Column: Lockers List */}
              <div className="lg:col-span-2">
                <LockerList 
                  lockers={lockers} 
                  isLoading={isLoadingLockers}
                  onBulkDelete={handleBulkDelete}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
