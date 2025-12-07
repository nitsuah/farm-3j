import type React from 'react';
import '@/app/globals.css';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata = {
  title: 'Pretty Good Farm - Fresh Local Produce',
  description:
    'Sustainable farming with a focus on community and quality produce.',
  generator: 'Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-green-50 dark:bg-black">
        <header className="h-16 bg-white shadow-sm dark:bg-green-900">
          <nav className="container mx-auto flex h-full items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                PG Farm
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="/"
                className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-white"
              >
                Home
              </a>
              <a
                href="/about"
                className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-white"
              >
                About
              </a>
              <a
                href="/farm"
                className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-white"
              >
                Farm Game
              </a>
              <ThemeToggle />
            </div>
          </nav>
        </header>
        {children}
        <footer className="h-16 bg-green-900 text-white">
          <div className="container mx-auto flex h-full items-center justify-center px-4">
            <p className="text-sm">
              &copy; 2025 Pretty Good Farm. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
