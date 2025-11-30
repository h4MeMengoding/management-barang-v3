'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface AlertMessageProps {
  type: 'success' | 'error';
  message: string;
}

export default function AlertMessage({ type, message }: AlertMessageProps) {
  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`mb-6 p-4 rounded-lg border ${
            isSuccess
              ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/30'
              : 'bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <p
            className={`text-sm font-medium ${
              isSuccess ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
            }`}
          >
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
