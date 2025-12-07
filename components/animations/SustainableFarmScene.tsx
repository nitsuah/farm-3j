'use client';

import { useEffect, useState } from 'react';

export function SustainableFarmScene() {
  const [windRotation, setWindRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWindRotation(prev => (prev + 10) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg">
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-200 to-green-100 dark:from-amber-950 dark:to-green-950" />

      {/* Ground */}
      <div className="absolute bottom-0 h-12 w-full bg-green-600 dark:bg-green-900" />

      {/* Solar panel */}
      <div className="absolute bottom-12 left-8">
        <div className="text-4xl">☀️</div>
        <div className="mt-1 h-8 w-12 rounded border-2 border-gray-700 bg-blue-600 dark:bg-blue-800" />
      </div>

      {/* Wind turbine */}
      <div className="absolute right-16 bottom-12">
        <div className="flex flex-col items-center">
          <div
            className="origin-center text-4xl"
            style={{
              transform: `rotate(${windRotation}deg)`,
              transition: 'transform 0.05s linear',
            }}
          >
            ❄️
          </div>
          <div className="h-16 w-2 bg-gray-400 dark:bg-gray-600" />
        </div>
      </div>

      {/* Pig */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce text-4xl">
        🐷
      </div>

      {/* Recycling bin */}
      <div className="absolute right-4 bottom-12 text-3xl">♻️</div>
    </div>
  );
}
