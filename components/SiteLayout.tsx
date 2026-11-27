import React from 'react';
import { HeaderCropRow } from '@/components/animations/HeaderCropRow';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="relative h-[212px] shadow-sm md:h-48">
        <HeaderCropRow />
        <nav className="absolute top-0 right-0 left-0 z-10">
          {/* Right padding keeps the links clear of the theme toggle. */}
          <div className="container mx-auto px-4 py-3 pr-16">
            {/* Desktop */}
            <div className="hidden items-center justify-between md:flex">
              <a
                href="/"
                className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-1 backdrop-blur-sm transition-colors hover:bg-black/40"
              >
                <span className="text-2xl">🌾</span>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  PG Farms
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
                  href="/rtsfarm"
                  className="font-medium text-white drop-shadow hover:text-green-200"
                >
                  RTS Game
                </a>
                <a
                  href="/privacy"
                  className="font-medium text-white drop-shadow hover:text-green-200"
                >
                  Privacy
                </a>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-2 md:hidden">
              <a
                href="/"
                className="flex w-fit items-center gap-2 rounded-lg bg-black/30 px-3 py-1 backdrop-blur-sm transition-colors hover:bg-black/40"
              >
                <span className="text-2xl">🌾</span>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  PG Farms
                </h1>
              </a>
              <div className="flex w-fit gap-2">
                <a
                  href="/about"
                  className="flex items-center gap-1 rounded-lg bg-black/30 px-2 py-1 text-sm font-medium text-white drop-shadow backdrop-blur-sm"
                >
                  <span aria-hidden="true">ℹ️</span> About
                </a>
                <a
                  href="/rtsfarm"
                  className="flex items-center gap-1 rounded-lg bg-black/30 px-2 py-1 text-sm font-medium text-white drop-shadow backdrop-blur-sm"
                >
                  <span aria-hidden="true">▶️</span> Play
                </a>
                <a
                  href="/privacy"
                  className="flex items-center gap-1 rounded-lg bg-black/30 px-2 py-1 text-sm font-medium text-white drop-shadow backdrop-blur-sm"
                >
                  <span aria-hidden="true">🔒</span> Privacy
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>
      {children}
      <footer className="bg-white py-3 text-green-900 dark:bg-black dark:text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Pretty Good Farms. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
