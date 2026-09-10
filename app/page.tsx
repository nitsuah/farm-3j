'use client';

import { SiteLayout } from '@/components/SiteLayout';
import { FeatureCarousel } from '@/components/home/FeatureCarousel';

export default function Home() {
  return (
    <SiteLayout>
      <main className="flex flex-1 flex-col">
        {/* Hero section */}
        <section className="relative flex-[0.5] overflow-hidden">
          <div className="absolute inset-0 bg-white dark:bg-black" />
          <div className="relative top-4 z-10 flex h-full flex-col items-center justify-center gap-4 px-6 py-6 md:px-4 md:py-0">
            <h1 className="mb-8 text-4xl font-bold">PG Farms</h1>
            <a
              href="/rtsfarm"
              className="rounded-lg bg-yellow-700 px-6 py-3 text-xl text-white transition hover:bg-yellow-800"
            >
              Play RTS
            </a>
          </div>
        </section>

        {/* Feature showcase — auto-rotating carousel, swipe/tap/arrow navigable */}
        <FeatureCarousel />
      </main>
    </SiteLayout>
  );
}
