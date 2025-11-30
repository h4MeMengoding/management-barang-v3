'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage or default to system
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    // Initialize resolved theme from html class
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Enable transitions only after initial mount to prevent blink
    setMounted(true);
    const timer = setTimeout(() => {
      document.documentElement.classList.add('transitions-enabled');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const updateTheme = useCallback((themeValue: Theme) => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    let effectiveTheme: 'light' | 'dark' = 'light';
    
    if (themeValue === 'system') {
      effectiveTheme = mediaQuery.matches ? 'dark' : 'light';
    } else {
      effectiveTheme = themeValue as 'light' | 'dark';
    }

    // Use requestAnimationFrame for smooth transition
    requestAnimationFrame(() => {
      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
      root.style.colorScheme = effectiveTheme;
      setResolvedTheme(effectiveTheme);

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          effectiveTheme === 'dark' ? '#081210' : '#F5F1E8'
        );
      }
    });
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        updateTheme(theme);
      }
    };

    updateTheme(theme);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, updateTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    updateTheme(newTheme);
  }, [updateTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
