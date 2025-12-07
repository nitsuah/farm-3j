import { GrowingCropScene } from '@/components/animations/GrowingCropScene';
import { IsometricTownScene } from '@/components/animations/IsometricTownScene';
import { SustainableFarmScene } from '@/components/animations/SustainableFarmScene';

export default function Home() {
  return (
    <main className="flex h-[calc(100vh-13rem)] flex-col overflow-hidden">
      {/* Hero section with gradient background - 50% of space */}
      <section className="relative flex-[1] overflow-hidden">
        {/* Simple gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-green-200 dark:from-sky-950 dark:to-green-950" />

        {/* Hero content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
          <h1 className="text-5xl font-bold text-green-900 drop-shadow-lg dark:text-white">
            Pretty Good Farm
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-green-800 drop-shadow dark:text-green-200">
            Fresh, locally-grown produce and sustainable farming practices.
          </p>
          <div className="flex gap-4">
            <a
              href="/farm"
              className="rounded-lg bg-green-600 px-6 py-3 text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl"
            >
              🎮 Play Farm Game
            </a>
            <a
              href="/about"
              className="rounded-lg bg-white px-6 py-3 text-green-700 shadow-lg transition-all hover:bg-green-50 hover:shadow-xl dark:bg-green-900 dark:text-white dark:hover:bg-green-800"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Feature cards section - 25% of space */}
      <section className="grid flex-1 grid-cols-1 gap-1 md:grid-cols-3">
        {/* Card 1 - Fresh Produce */}
        <div className="relative flex overflow-hidden border border-green-200 bg-white md:flex-col dark:border-gray-700 dark:bg-gray-800">
          {/* Mobile: text on left (w-1/2), Desktop: text on top (h-2/5) */}
          <div className="flex w-1/2 flex-col justify-center p-2 md:h-2/5 md:w-full">
            <h3 className="text-sm font-bold text-green-900 dark:text-green-400">
              Fresh Produce
            </h3>
            <p className="text-xs text-green-700 dark:text-green-200">
              Watch our crops grow! Seasonal vegetables and fruits grown with
              care.
            </p>
          </div>
          {/* Mobile: animation on right (w-1/2), Desktop: animation on bottom (h-3/5) */}
          <div className="w-1/2 md:h-3/5 md:w-full">
            <GrowingCropScene />
          </div>
        </div>

        {/* Card 2 - Local Community */}
        <div className="relative flex overflow-hidden border border-green-200 bg-white md:flex-col dark:border-gray-700 dark:bg-gray-800">
          <div className="flex w-1/2 flex-col justify-center p-2 md:h-2/5 md:w-full">
            <h3 className="text-sm font-bold text-green-900 dark:text-green-400">
              Local Community
            </h3>
            <p className="text-xs text-green-700 dark:text-green-200">
              Supporting our local community with quality, farm-fresh products.
            </p>
          </div>
          <div className="w-1/2 md:h-3/5 md:w-full">
            <IsometricTownScene buildings={3} />
          </div>
        </div>

        {/* Card 3 - Sustainable Farming */}
        <div className="relative flex overflow-hidden border border-green-200 bg-white md:flex-col dark:border-gray-700 dark:bg-gray-800">
          <div className="flex w-1/2 flex-col justify-center p-2 md:h-2/5 md:w-full">
            <h3 className="text-sm font-bold text-green-900 dark:text-green-400">
              Sustainable Farming
            </h3>
            <p className="text-xs text-green-700 dark:text-green-200">
              Solar, wind, and eco-friendly practices for a healthier future.
            </p>
          </div>
          <div className="w-1/2 md:h-3/5 md:w-full">
            <SustainableFarmScene />
          </div>
        </div>
      </section>
    </main>
  );
}
