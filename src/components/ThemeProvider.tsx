'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTheme, setTheme as setThemeLib, getResolvedTheme, onSystemThemeChange, Theme, ResolvedTheme } from '@/lib/theme';

interface ThemeContextType {
  theme: Theme; // User preference: 'light' | 'dark' | 'system'
  resolvedTheme: ResolvedTheme; // Actual applied theme: 'light' | 'dark'
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean; // Whether the component has mounted (for hydration)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize theme on mount
    const currentTheme = getTheme();
    const currentResolved = getResolvedTheme();
    setThemeState(currentTheme);
    setResolvedTheme(currentResolved);
    setThemeLib(currentTheme); // Apply to DOM
    setMounted(true);

    // Listen for system theme changes
    const unsubscribe = onSystemThemeChange((newResolved) => {
      setResolvedTheme(newResolved);
    });

    return unsubscribe;
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeLib(newTheme);
    setThemeState(newTheme);
    setResolvedTheme(getResolvedTheme());
  };

  const toggleTheme = () => {
    const newTheme: Theme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
