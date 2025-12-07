import { Cornfield } from '@/components/animations/Cornfield';
import { GrowingCropScene } from '@/components/animations/GrowingCropScene';
import { IsometricTownScene } from '@/components/animations/IsometricTownScene';
import { SustainableFarmScene } from '@/components/animations/SustainableFarmScene';

export default function Home() {
  return (
    <main className="h-[calc(100vh-4rem)] overflow-hidden">
      {/* Hero section with animated cornfield background */}
      <section className="relative h-1/2 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-green-200 dark:from-sky-950 dark:to-green-950">
          <Cornfield rows={5} cols={12} withTractor={true} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center bg-black/20 dark:bg-black/40">
          <div className="mb-4 text-6xl">🌾</div>
          <h1 className="mb-4 text-5xl font-bold text-white drop-shadow-lg">
            Pretty Good Farm
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white drop-shadow">
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
      <section className="grid h-1/2 grid-cols-3 gap-4 p-4">
        {/* Card 1 - Fresh Produce */}
        <div className="relative overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-900">
          <div className="h-40">
            <GrowingCropScene />
          </div>
          <div className="p-4">
            <h3 className="mb-2 text-xl font-bold text-green-900 dark:text-white">
              Fresh Produce
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Watch our crops grow! Seasonal vegetables and fruits grown with
              care.
            </p>
          </div>
        </div>

        {/* Card 2 - Local Community */}
        <div className="relative overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-900">
          <div className="h-40">
            <IsometricTownScene buildings={3} />
          </div>
          <div className="p-4">
            <h3 className="mb-2 text-xl font-bold text-green-900 dark:text-white">
              Local Community
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Supporting our local community with quality, farm-fresh products.
            </p>
          </div>
        </div>

        {/* Card 3 - Sustainable Farming */}
        <div className="relative overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-900">
          <div className="h-40">
            <SustainableFarmScene />
          </div>
          <div className="p-4">
            <h3 className="mb-2 text-xl font-bold text-green-900 dark:text-white">
              Sustainable Farming
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Solar, wind, and eco-friendly practices for a healthier future.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
