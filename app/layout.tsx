import type React from 'react';
import '@/app/globals.css';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata = {
  title: 'Farm 3J - Fresh Local Produce',
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
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-green-50 dark:bg-black">
        <header className="bg-white shadow-sm dark:bg-green-900">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-green-900 dark:text-white">
                Farm 3J
              </h1>
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
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </header>
        {children}
        <footer className="mt-16 bg-green-900 py-8 text-white">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2025 Farm 3J. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
