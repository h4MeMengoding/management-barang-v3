import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  confirmButtonClass = 'bg-red-500 hover:bg-red-600',
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          className="bg-[var(--surface-1)] rounded-2xl shadow-2xl max-w-md w-full border border-[var(--border)]"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  {title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-1 hover:bg-[var(--surface-2)] rounded-lg transition-colors"
              >
                <X size={20} className="text-[var(--text-tertiary)]" />
              </button>
            </div>
          </div>

          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 ${confirmButtonClass} text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
