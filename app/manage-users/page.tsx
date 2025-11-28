'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserForm from '@/components/users/UserForm';
import UserList from '@/components/users/UserList';
import { useManageUsers } from '@/lib/hooks/useManageUsers';

export default function ManageUsers() {
  const {
    currentUser,
    users,
    isLoading,
    isLoadingUsers,
    error,
    success,
    editingUser,
    createUser,
    updateUser,
    deleteUser,
    startEdit,
    cancelEdit,
  } = useManageUsers();

  const handleSubmit = async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    if (editingUser) {
      return await updateUser(editingUser.id, data);
    } else {
      return await createUser(data);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)] lg:pl-24">
        <Sidebar />

        <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Header />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form - Sticky on Desktop */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-6">
                  <UserForm
                    isLoading={isLoading}
                    error={error}
                    success={success}
                    editingUser={editingUser}
                    onSubmit={handleSubmit}
                    onCancel={cancelEdit}
                  />
                </div>
              </div>

              {/* Right Column: Users List */}
              <div className="lg:col-span-2">
                <UserList
                  users={users}
                  currentUserId={currentUser?.id}
                  isLoading={isLoadingUsers}
                  onEdit={startEdit}
                  onDelete={deleteUser}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
