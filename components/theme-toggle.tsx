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

    const html = document.documentElement;
    if (newTheme) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Force a re-render check
    console.log('After toggle:', {
      newTheme,
      htmlClasses: html.classList.toString(),
      htmlHasDark: html.classList.contains('dark'),
      bodyClasses: document.body.className,
      bodyBgColor: window.getComputedStyle(document.body).backgroundColor,
    });
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
      className="rounded-lg border-2 border-green-600 px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900"
      aria-label="Toggle dark mode"
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
