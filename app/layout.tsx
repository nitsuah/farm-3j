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
        <header className="relative h-48 shadow-sm">
          {/* Animated crop header background */}
          <HeaderCropRow />

          {/* Navigation overlay - positioned in sky portion */}
          <nav className="absolute top-0 right-0 left-0 z-10">
            <div className="container mx-auto px-4 py-3">
              {/* Desktop: horizontal layout */}
              <div className="hidden items-center justify-between md:flex">
                <a
                  href="/"
                  className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-1 backdrop-blur-sm transition-colors hover:bg-black/40"
                >
                  <span className="text-2xl">🌾</span>
                  <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                    PG Farm
                  </h1>
                </a>
                <div className="flex items-center gap-6 rounded-lg bg-black/30 px-4 py-2 backdrop-blur-sm">
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
                </div>
              </div>

              {/* Mobile: vertical layout stacked on left */}
              <div className="flex flex-col gap-2 md:hidden">
                {/* PG Farm title - acts as home button */}
                <a
                  href="/"
                  className="flex w-fit items-center gap-2 rounded-lg bg-black/30 px-3 py-1 backdrop-blur-sm transition-colors hover:bg-black/40"
                >
                  <span className="text-2xl">🌾</span>
                  <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                    PG Farm
                  </h1>
                </a>

                {/* Mobile nav buttons stacked vertically */}
                <div className="flex w-fit flex-col gap-1">
                  {/* About - question mark icon */}
                  <a
                    href="/about"
                    className="flex items-center justify-center rounded-lg bg-black/30 p-2 backdrop-blur-sm transition-colors hover:bg-black/40"
                    title="About"
                  >
                    <span className="text-xl text-white drop-shadow">❓</span>
                  </a>

                  {/* Farm Game - play icon */}
                  <a
                    href="/farm"
                    className="flex items-center justify-center rounded-lg bg-black/30 p-2 backdrop-blur-sm transition-colors hover:bg-black/40"
                    title="Play Farm Game"
                  >
                    <span className="text-xl text-white drop-shadow">▶️</span>
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </header>
        {children}
        <footer className="bg-green-900 py-3 text-white">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              &copy; 2025 Pretty Good Farm. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
