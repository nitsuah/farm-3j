import type React from 'react';
import '@/app/globals.css';
import { ThemeToggle } from '@/components/theme-toggle';
import { HeaderCropRow } from '@/components/animations/HeaderCropRow';

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
        <header className="relative h-24 shadow-sm">
          {/* Animated crop header background */}
          <HeaderCropRow />

          {/* Navigation overlay */}
          <nav className="absolute inset-0 z-10 container mx-auto flex h-full items-center justify-between px-4">
            <div className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-1 backdrop-blur-sm">
              <span className="text-2xl">🌾</span>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                PG Farm
              </h1>
            </div>
            <div className="flex items-center gap-6 rounded-lg bg-black/30 px-4 py-2 backdrop-blur-sm">
              <a
                href="/"
                className="font-medium text-white drop-shadow hover:text-green-200"
              >
                Home
              </a>
              <a
                href="/about"
                className="font-medium text-white drop-shadow hover:text-green-200"
              >
                About
              </a>
              <a
                href="/farm"
                className="font-medium text-white drop-shadow hover:text-green-200"
              >
                Farm Game
              </a>
              <ThemeToggle />
            </div>
          </nav>
        </header>
        {children}
        <footer className="h-24 bg-green-900 text-white">
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
