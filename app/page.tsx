import { SiteLayout } from '@/components/SiteLayout';
import { GrowingCropScene } from '@/components/animations/GrowingCropScene';
import { IsometricTownScene } from '@/components/animations/IsometricTownScene';
import { SustainableFarmScene } from '@/components/animations/SustainableFarmScene';

export default function Home() {
  return (
    <SiteLayout>
      <main className="flex flex-1 flex-col">
        {/* Hero section with gradient background - 50% of space */}
        <section className="relative flex-[0.5] overflow-hidden">
          {/* Simple gradient background */}
          <div className="absolute inset-0 bg-white dark:bg-black" />

          {/* Hero content */}
          <div className="relative top-4 z-10 flex h-full flex-col items-center justify-center gap-4 px-6 py-6 md:px-4 md:py-0">
            <h1 className="text-4xl font-bold mb-8">Farm 3J RTS Prototype</h1>
            <a href="/rtsfarm" className="px-6 py-3 bg-yellow-700 text-white rounded-lg text-xl hover:bg-yellow-800 transition">Play the new RTS Farm Game</a>
            <p className="mt-8 text-gray-400">(The old farm game has been removed. All new development is focused on the RTS version.)</p>
          </div>
        </section>

        {/* Feature cards section - 25% of space */}
        <section className="grid flex-1 grid-cols-1 gap-1 md:grid-cols-3 lg:gap-1">
          {/* Card 1 - Fresh Produce */}
          <div className="relative flex overflow-hidden border border-green-200 bg-white md:flex-col dark:border-gray-600 dark:bg-black">
            {/* Mobile: text on left (w-1/2), Desktop: text on top (h-2/5) */}
            <div className="flex w-1/2 flex-col justify-center p-8 md:h-1/4 md:w-full lg:p-4">
              <h3 className="text-sm font-bold text-green-900 lg:text-base dark:text-green-400">
                Fresh Produce
              </h3>
              <p className="text-xs text-green-700 lg:text-sm dark:text-green-200">
                Watch our crops grow! Seasonal vegetables and fruits grown with
                care.
              </p>
            </div>
            {/* Mobile: animation on right (w-1/2), Desktop: animation on bottom (h-3/5) */}
            <div className="w-1/2 md:h-3/4 md:w-full">
              <GrowingCropScene />
            </div>
          </div>

          {/* Card 2 - Local Community */}
          <div className="relative flex overflow-hidden border border-green-200 bg-white md:flex-col dark:border-gray-600 dark:bg-black">
            <div className="flex w-1/2 flex-col justify-center p-8 md:h-1/4 md:w-full lg:p-6">
              <h3 className="text-sm font-bold text-green-900 lg:text-base dark:text-green-400">
                Local Community
              </h3>
              <p className="text-xs text-green-700 lg:text-sm dark:text-green-200">
                Supporting our local community with quality, farm-fresh
                products.
              </p>
            </div>
            <div className="w-1/2 md:h-3/4 md:w-full">
              <IsometricTownScene buildings={3} />
            </div>
          </div>

          {/* Card 3 - Sustainable Farming */}
          <div className="relative flex overflow-hidden border border-green-200 bg-white md:flex-col dark:border-gray-600 dark:bg-black">
            <div className="flex w-1/2 flex-col justify-center p-8 md:h-1/4 md:w-full lg:p-6">
              <h3 className="text-sm font-bold text-green-900 lg:text-base dark:text-green-400">
                Sustainable Farming
              </h3>
              <p className="text-xs text-green-700 lg:text-sm dark:text-green-200">
                Solar, wind, and eco-friendly practices for a healthier future.
              </p>
            </div>
            <div className="w-1/2 md:h-3/4 md:w-full">
              <SustainableFarmScene />
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
