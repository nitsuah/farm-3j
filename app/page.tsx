'use client';

import Link from 'next/link';
import { SiteLayout } from '@/components/SiteLayout';
import { FeatureCarousel } from '@/components/home/FeatureCarousel';

export default function Home() {
  return (
    <SiteLayout>
      <main className="flex flex-1 flex-col">
        {/* Hero section */}
        <section className="relative flex-[0.5]">
          <div className="absolute inset-0 bg-white dark:bg-black" />
          <div className="relative top-4 z-10 flex h-full flex-col items-center justify-center gap-4 px-6 py-6 md:px-4 md:py-0">
            <h1 className="text-4xl font-bold text-green-900 dark:text-white">
              PG Farms
            </h1>
            <p className="max-w-md text-center text-gray-800 dark:text-gray-200">
              A free browser real-time strategy (RTS) game: gather, build and
              defend your farm against raiding waves.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/rtsfarm"
                className="rounded-lg bg-yellow-700 px-6 py-3 text-xl text-white transition hover:bg-yellow-800"
              >
                Play RTS
              </Link>
              <Link
                href="/rtsfarm/play?demo=1"
                className="rounded-lg border-2 border-yellow-700 px-6 py-3 text-xl text-yellow-800 transition hover:bg-yellow-50 dark:text-yellow-300 dark:hover:bg-yellow-950"
              >
                Watch a demo
              </Link>
            </div>
          </div>
        </section>

        {/* Feature showcase — auto-rotating carousel, swipe/tap/arrow navigable */}
        <FeatureCarousel />
      </main>
    </SiteLayout>
  );
}
