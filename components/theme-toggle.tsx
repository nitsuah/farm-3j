'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage on mount
    const stored = localStorage.getItem('theme');
    console.log('Initial theme from localStorage:', stored);
    const isDarkMode = stored === 'dark';
    setIsDark(isDarkMode);
    console.log('Setting isDark to:', isDarkMode);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      console.log('Added dark class to html');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Removed dark class from html');
    }
    console.log('HTML classes:', document.documentElement.className);
  }, []);

  const toggleTheme = () => {
    console.log('Toggle clicked! Current isDark:', isDark);
    const newTheme = !isDark;
    console.log('New theme will be:', newTheme ? 'dark' : 'light');
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    console.log('Saved to localStorage:', newTheme ? 'dark' : 'light');

    if (newTheme) {
      document.documentElement.classList.add('dark');
      console.log('Added dark class');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Removed dark class');
    }
    console.log(
      'HTML classes after toggle:',
      document.documentElement.className
    );

    // Check after a delay to see if styles applied
    setTimeout(() => {
      const body = document.body;
      const computedBg = window.getComputedStyle(body).backgroundColor;
      const bodyClasses = body.className;
      console.log('Body classes:', bodyClasses);
      console.log('Body computed background after 100ms:', computedBg);
      console.log(
        'HTML has dark class:',
        document.documentElement.classList.contains('dark')
      );

      // Check a specific card element
      const card = document.querySelector('.bg-white');
      if (card) {
        console.log(
          'Card computed background:',
          window.getComputedStyle(card as Element).backgroundColor
        );
      }
    }, 100);
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
