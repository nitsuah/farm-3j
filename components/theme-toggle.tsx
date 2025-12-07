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

    const html = document.documentElement;
    const body = document.body;
    const header = document.querySelector('header');
    const cards = document.querySelectorAll(
      '.rounded-lg.bg-white, .bg-white.p-6, .bg-white.p-8'
    );
    const headings = document.querySelectorAll('h1, h2, h3');
    const paragraphs = document.querySelectorAll('p');
    const labels = document.querySelectorAll('label');
    const inputs = document.querySelectorAll('input, textarea');
    const contactButton = document.querySelector('a[href="#contact"]');

    if (isDarkMode) {
      html.classList.add('dark');
      body.style.backgroundColor = 'black';
      if (header) header.style.backgroundColor = '#166534';
      cards.forEach(card => {
        (card as HTMLElement).style.backgroundColor = 'black';
        (card as HTMLElement).style.border = '1px solid #166534';
      });
      headings.forEach(h => {
        (h as HTMLElement).style.color = 'white';
      });
      paragraphs.forEach(p => {
        (p as HTMLElement).style.color = '#86efac';
      });
      labels.forEach(l => {
        (l as HTMLElement).style.color = '#86efac';
      });
      inputs.forEach(input => {
        (input as HTMLElement).style.backgroundColor = '#1f2937';
        (input as HTMLElement).style.color = 'white';
        (input as HTMLElement).style.borderColor = '#166534';
      });
      if (contactButton) {
        (contactButton as HTMLElement).style.backgroundColor = 'transparent';
        (contactButton as HTMLElement).style.color = '#86efac';
        (contactButton as HTMLElement).style.borderColor = '#86efac';
      }
    } else {
      html.classList.remove('dark');
      body.style.backgroundColor = 'rgb(240, 253, 244)';
      if (header) header.style.backgroundColor = '#166534';
      cards.forEach(card => {
        (card as HTMLElement).style.backgroundColor = 'white';
        (card as HTMLElement).style.border = 'none';
      });
      headings.forEach(h => {
        (h as HTMLElement).style.color = '#14532d';
      });
      paragraphs.forEach(p => {
        (p as HTMLElement).style.color = '#15803d';
      });
      labels.forEach(l => {
        (l as HTMLElement).style.color = '#14532d';
      });
      inputs.forEach(input => {
        (input as HTMLElement).style.backgroundColor = 'white';
        (input as HTMLElement).style.color = '#14532d';
        (input as HTMLElement).style.borderColor = '#16a34a';
      });
      if (contactButton) {
        (contactButton as HTMLElement).style.backgroundColor = 'white';
        (contactButton as HTMLElement).style.color = '#16a34a';
        (contactButton as HTMLElement).style.borderColor = '#16a34a';
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');

    const html = document.documentElement;
    const body = document.body;
    const header = document.querySelector('header');
    const cards = document.querySelectorAll(
      '.rounded-lg.bg-white, .bg-white.p-6, .bg-white.p-8'
    );
    const headings = document.querySelectorAll('h1, h2, h3');
    const paragraphs = document.querySelectorAll('p');
    const labels = document.querySelectorAll('label');
    const inputs = document.querySelectorAll('input, textarea');
    const contactButton = document.querySelector('a[href="#contact"]');

    if (newTheme) {
      html.classList.add('dark');
      body.style.backgroundColor = 'black';
      if (header) header.style.backgroundColor = '#166534'; // green-900
      cards.forEach(card => {
        (card as HTMLElement).style.backgroundColor = 'black';
        (card as HTMLElement).style.border = '1px solid #166534';
      });
      headings.forEach(h => {
        (h as HTMLElement).style.color = 'white';
      });
      paragraphs.forEach(p => {
        (p as HTMLElement).style.color = '#86efac'; // green-300
      });
      labels.forEach(l => {
        (l as HTMLElement).style.color = '#86efac'; // green-300
      });
      inputs.forEach(input => {
        (input as HTMLElement).style.backgroundColor = '#1f2937'; // gray-800
        (input as HTMLElement).style.color = 'white';
        (input as HTMLElement).style.borderColor = '#166534';
      });
      if (contactButton) {
        (contactButton as HTMLElement).style.backgroundColor = 'transparent';
        (contactButton as HTMLElement).style.color = '#86efac';
        (contactButton as HTMLElement).style.borderColor = '#86efac';
      }
    } else {
      html.classList.remove('dark');
      body.style.backgroundColor = 'rgb(240, 253, 244)'; // green-50
      if (header) header.style.backgroundColor = '#166534'; // green-900 for light mode too
      cards.forEach(card => {
        (card as HTMLElement).style.backgroundColor = 'white';
        (card as HTMLElement).style.border = 'none';
      });
      headings.forEach(h => {
        (h as HTMLElement).style.color = '#14532d'; // green-900
      });
      paragraphs.forEach(p => {
        (p as HTMLElement).style.color = '#15803d'; // green-700
      });
      labels.forEach(l => {
        (l as HTMLElement).style.color = '#14532d'; // green-900
      });
      inputs.forEach(input => {
        (input as HTMLElement).style.backgroundColor = 'white';
        (input as HTMLElement).style.color = '#14532d'; // green-900
        (input as HTMLElement).style.borderColor = '#16a34a'; // green-600
      });
      if (contactButton) {
        (contactButton as HTMLElement).style.backgroundColor = 'white';
        (contactButton as HTMLElement).style.color = '#16a34a';
        (contactButton as HTMLElement).style.borderColor = '#16a34a';
      }
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
      className="rounded-lg border-2 border-green-600 px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900"
      aria-label="Toggle dark mode"
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
