'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'segmented';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className={`h-9 w-9 flex items-center justify-center opacity-0 ${className}`} />
    );
  }

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-bg-surface border border-border ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-accent text-white shadow-sm font-semibold'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
          }`}
        >
          <Sun size={14} className={theme === 'light' ? 'text-white' : 'text-amber-500'} />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-accent text-white shadow-sm font-semibold'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
          }`}
        >
          <Moon size={14} className={theme === 'dark' ? 'text-white' : 'text-indigo-400'} />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            theme === 'system'
              ? 'bg-accent text-white shadow-sm font-semibold'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
          }`}
        >
          <Laptop size={14} />
          <span>System</span>
        </button>
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-bg-surface hover:bg-bg-elevated text-text-primary border border-border hover:border-accent/40 transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer ${className}`}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <>
            <Sun size={15} className="text-amber-400 transition-transform hover:rotate-45" />
            <span className="font-medium">Light Mode</span>
          </>
        ) : (
          <>
            <Moon size={15} className="text-indigo-500 transition-transform hover:-rotate-12" />
            <span className="font-medium">Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`w-9 h-9 flex items-center justify-center rounded-xl text-text-secondary hover:text-text-primary bg-bg-surface hover:bg-bg-elevated transition-all duration-200 border border-border hover:border-accent/40 shadow-xs hover:shadow-sm cursor-pointer ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun size={17} className="transition-transform duration-300 hover:rotate-45 text-amber-400" />
      ) : (
        <Moon size={17} className="transition-transform duration-300 hover:-rotate-12 text-indigo-500" />
      )}
    </button>
  );
}
