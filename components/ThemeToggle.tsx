'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-11 h-11 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
        aria-label="Toggle theme"
      >
        <Icon size={20} />
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <motion.div
              className="absolute right-0 top-12 w-40 bg-[var(--surface-1)] rounded-xl shadow-lg border border-[var(--border)] py-2 z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {themes.map((t) => {
                const ThemeIcon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => {
                      setTheme(t.value);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-2)] transition-colors ${
                      theme === t.value ? 'text-[var(--color-primary)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    <ThemeIcon size={18} />
                    <span className="text-sm font-medium">{t.label}</span>
                    {theme === t.value && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
