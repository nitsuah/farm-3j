'use client';

import { useState } from 'react';

import { SiteLayout } from '@/components/SiteLayout';
import { GrowingCropScene } from '@/components/animations/GrowingCropScene';
import { IsometricTownScene } from '@/components/animations/IsometricTownScene';
import { SustainableFarmScene } from '@/components/animations/SustainableFarmScene';

function FeatureCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="relative flex cursor-pointer flex-col overflow-hidden border border-green-200 bg-white transition-all duration-300 dark:border-gray-600 dark:bg-black"
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex flex-col justify-center p-8 lg:p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-green-900 lg:text-base dark:text-green-400">
              {title}
            </h3>
            <p className="text-xs text-green-700 lg:text-sm dark:text-green-200">
              {description}
            </p>
          </div>
          <span className="mt-0.5 shrink-0 text-xs text-green-600 dark:text-green-500">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="h-64">{children}</div>
      </div>
    </div>
  );
}

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

        {/* Feature cards — click to expand animations */}
        <section className="grid flex-1 grid-cols-1 gap-1 md:grid-cols-3 lg:gap-1">
          <FeatureCard
            title="Fresh Produce"
            description="Watch our crops grow! Seasonal vegetables and fruits grown with care. Click to preview."
          >
            <GrowingCropScene />
          </FeatureCard>

          <FeatureCard
            title="Local Community"
            description="Supporting our local community with quality, farm-fresh products. Click to preview."
          >
            <IsometricTownScene buildings={3} />
          </FeatureCard>

          <FeatureCard
            title="Sustainable Farming"
            description="Solar, wind, and eco-friendly practices for a healthier future. Click to preview."
          >
            <SustainableFarmScene />
          </FeatureCard>
        </section>
      </main>
    </SiteLayout>
  );
}
