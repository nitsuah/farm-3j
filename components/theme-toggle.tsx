'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage on mount
    const stored = localStorage.getItem('theme');
    const isDarkMode = stored === 'dark';
    setIsDark(isDarkMode);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');

    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Prevent flash during SSR
  if (!mounted) {
    return (
      <button
        className="rounded-lg border-2 border-green-600 px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900"
        aria-label="Toggle dark mode"
      >
        🌙 Dark
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center rounded-full bg-white/20 p-2 text-2xl backdrop-blur-sm transition-all hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30"
      aria-label="Toggle dark mode"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
