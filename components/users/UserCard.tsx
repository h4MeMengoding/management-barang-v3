import { motion } from 'framer-motion';
import { Edit2, Trash2, Shield, User as UserIcon } from 'lucide-react';

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

interface UserCardProps {
  user: User;
  currentUserId?: string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserCard({ user, currentUserId, onEdit, onDelete }: UserCardProps) {
  const isCurrentUser = user.id === currentUserId;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
      }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--surface-1)] rounded-xl p-4 lg:p-5 shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              user.role === 'admin' ? 'bg-purple-500/10' : 'bg-blue-500/10'
            }`}
          >
            {user.role === 'admin' ? (
              <Shield className="w-6 h-6 text-purple-600" />
            ) : (
              <UserIcon className="w-6 h-6 text-blue-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-[var(--text-primary)] truncate">
                {user.name || 'Tanpa Nama'}
              </h3>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                  user.role === 'admin'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}
              >
                {user.role === 'admin' ? 'Admin' : 'User'}
              </span>
              {isCurrentUser && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex-shrink-0">
                  Anda
                </span>
              )}
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-2 truncate">{user.email}</p>

            {user._count && (
              <div className="flex gap-4 text-xs text-[var(--text-tertiary)]">
                <span>{user._count.items} items</span>
                <span>{user._count.lockers} lockers</span>
                <span>{user._count.categories} categories</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>

          {!isCurrentUser && (
            <button
              onClick={() => onDelete(user)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Hapus"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
