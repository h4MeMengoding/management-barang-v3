import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import Card from '@/components/Card';
import UserCard from '@/components/users/UserCard';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  _count?: {
    items: number;
    lockers: number;
    categories: number;
  };
}

interface UserListProps {
  users: User[];
  currentUserId?: string;
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserList({
  users,
  currentUserId,
  isLoading,
  onEdit,
  onDelete,
}: UserListProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Daftar User</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Kelola semua akun user</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-[var(--color-primary)]/10 rounded-full text-sm font-semibold text-[var(--color-primary)]">
            {users.length} User
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[var(--surface-1)] rounded-xl p-4 lg:p-5 shadow-sm border border-[var(--border)] animate-pulse"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-[var(--surface-2)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--surface-2)] rounded w-1/3"></div>
                    <div className="h-3 bg-[var(--surface-2)] rounded w-1/2"></div>
                    <div className="h-3 bg-[var(--surface-2)] rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Belum ada user lain</p>
        </div>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </motion.div>
      )}
    </Card>
  );
}
