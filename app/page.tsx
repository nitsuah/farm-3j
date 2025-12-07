import { GrowingCropScene } from '@/components/animations/GrowingCropScene';
import { IsometricTownScene } from '@/components/animations/IsometricTownScene';
import { SustainableFarmScene } from '@/components/animations/SustainableFarmScene';

export default function Home() {
  return (
    <main className="h-[calc(100vh-13rem)] overflow-hidden">
      {/* Hero section with gradient background */}
      <section className="relative h-1/2 overflow-hidden">
        {/* Simple gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-green-200 dark:from-sky-950 dark:to-green-950" />

        {/* Hero content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center">
          <h1 className="mb-2 text-5xl font-bold text-green-900 drop-shadow-lg dark:text-white">
            Pretty Good Farm
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-xl text-green-800 drop-shadow dark:text-green-200">
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

      {/* Feature cards section */}
      <section className="grid h-1/2 grid-cols-3 gap-1">
        {/* Card 1 - Fresh Produce */}
        <div className="relative flex flex-col overflow-hidden bg-white dark:bg-gray-900">
          <div className="h-1/2">
            <GrowingCropScene />
          </div>
          <div className="flex-1 p-3">
            <h3 className="mb-1 text-lg font-bold text-green-900 dark:text-white">
              Fresh Produce
            </h3>
            <p className="text-xs text-green-700 dark:text-green-300">
              Watch our crops grow! Seasonal vegetables and fruits grown with
              care.
            </p>
          </div>
        </div>

        {/* Card 2 - Local Community */}
        <div className="relative flex flex-col overflow-hidden bg-white dark:bg-gray-900">
          <div className="h-1/2">
            <IsometricTownScene buildings={3} />
          </div>
          <div className="flex-1 p-3">
            <h3 className="mb-1 text-lg font-bold text-green-900 dark:text-white">
              Local Community
            </h3>
            <p className="text-xs text-green-700 dark:text-green-300">
              Supporting our local community with quality, farm-fresh products.
            </p>
          </div>
        </div>

        {/* Card 3 - Sustainable Farming */}
        <div className="relative flex flex-col overflow-hidden bg-white dark:bg-gray-900">
          <div className="h-1/2">
            <SustainableFarmScene />
          </div>
          <div className="flex-1 p-3">
            <h3 className="mb-1 text-lg font-bold text-green-900 dark:text-white">
              Sustainable Farming
            </h3>
            <p className="text-xs text-green-700 dark:text-green-300">
              Solar, wind, and eco-friendly practices for a healthier future.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
