'use client';

import { useEffect, useState } from 'react';

interface IsometricTownProps {
  buildings?: number;
}

export function IsometricTownScene({ buildings = 3 }: IsometricTownProps) {
  const [passingCarPosition, setPassingCarPosition] = useState(-20);
  const [peoplePositions, setPeoplePositions] = useState([35, 55]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check theme on mount and watch for changes
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Passing car animation - drives by continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setPassingCarPosition(prev => {
        if (prev > 120) return -20;
        return prev + 0.8;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // People animation - walk around near the stand (2 people browsing)
  useEffect(() => {
    const interval = setInterval(() => {
      setPeoplePositions(prev =>
        prev.map(pos => {
          const newPos = pos + (Math.random() - 0.5) * 1.5;
          return Math.max(30, Math.min(60, newPos));
        })
      );
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Sky background */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-400 to-blue-200 dark:from-blue-950 dark:to-blue-900" />

      {/* Grass/shoulder - green */}
      <div className="absolute bottom-0 h-28 w-full bg-linear-to-b from-green-600 to-green-700 dark:from-green-900 dark:to-green-950" />

      {/* Road - darker gray strip (static, no theme change) */}
      <div className="absolute bottom-0 h-8 w-full bg-gray-900" />

      {/* Oil slicks on road */}
      <div className="absolute bottom-2 left-[15%] h-3 w-8 rounded-full bg-black opacity-60" />
      <div className="absolute bottom-4 left-[40%] h-2 w-6 rounded-full bg-gray-900 opacity-50" />
      <div className="absolute right-[30%] bottom-3 h-3 w-7 rounded-full bg-black opacity-55" />
      <div className="absolute right-[55%] bottom-5 h-4 w-10 rounded-full bg-gray-900 opacity-60" />

      {/* Roadside stand */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-end gap-3">
        {/* Basket, SALE/CLOSED sign and farmer on the left */}
        <div className="flex items-end gap-2">
          {!isDarkMode && <div className="mb-1 text-xl">🧺</div>}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`rounded px-2 py-1 text-xs font-bold shadow-lg ${
                isDarkMode
                  ? 'bg-gray-600 text-white dark:bg-gray-700'
                  : 'bg-yellow-400 text-red-600 dark:bg-yellow-500'
              }`}
            >
              {isDarkMode ? '' : 'SALE!'}
            </div>
            {!isDarkMode && <div className="text-2xl">🧑‍🌾</div>}
          </div>
        </div>

        {/* Stand structure */}
        <div className="flex flex-col items-center">
          {/* Awning - sits right above the stand */}
          <div className="h-2 w-32 rounded-t-lg bg-red-500 dark:bg-red-700" />
          <div
            className="h-3 w-32 bg-red-400 dark:bg-red-600"
            style={{ clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)' }}
          />

          {/* Stand table with produce clustered in piles */}
          <div className="relative flex h-12 w-32 items-end justify-center rounded bg-amber-700 px-2 pb-2 dark:bg-amber-900">
            {!isDarkMode ? (
              <>
                {/* Left pile */}
                <div className="relative mr-2 flex flex-col items-center">
                  <span className="text-lg">🍎</span>
                  <span className="-mt-2 text-lg">🍎</span>
                </div>
                {/* Center pile */}
                <div className="relative mx-1 flex flex-col items-center">
                  <span className="text-lg">🥕</span>
                  <span className="-mt-2 text-lg">🌽</span>
                </div>
                {/* Right pile */}
                <div className="relative ml-2 flex flex-col items-center">
                  <span className="text-lg">🍅</span>
                  <span className="-mt-2 text-lg">🥬</span>
                </div>
              </>
            ) : (
              /* "FRESH IN AM" sign in dark mode */
              <div className="flex h-full items-center justify-center">
                <div className="rounded bg-green-700 px-3 py-1 text-[10px] font-semibold text-white shadow-md">
                  FRESH IN AM
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parked cars (parallel parked between road and stand) */}
      {!isDarkMode && (
        <>
          <div className="absolute right-[1%] bottom-9 hidden text-3xl md:block">
            🚙
          </div>
          <div className="absolute right-[2%] bottom-15 hidden text-3xl md:block">
            🚗
          </div>
        </>
      )}

      {/* Customers/shoppers - 2 browsing in front, family at farmer */}
      {!isDarkMode && (
        <>
          {peoplePositions.map((pos, idx) => (
            <div
              key={idx}
              className="absolute bottom-10 hidden text-xl transition-all duration-200"
              style={{ left: `${40 + pos * 0.2}%` }}
            >
              {idx === 0 ? '🚶' : '🚶‍♀️'}
            </div>
          ))}

          {/* Family talking to farmer - stationary */}
          <div className="absolute bottom-11 left-[calc(50%-3rem)] text-xl">
            👨‍👩‍👧
          </div>
        </>
      )}

      {/* Passing car driving by on road */}
      <div
        className="absolute bottom-3 text-3xl transition-all duration-100"
        style={{
          left: `${passingCarPosition}%`,
          transform: 'scaleX(-1)',
        }}
      >
        🚗
      </div>

      {/* Decorative trees */}
      <div className="absolute bottom-25 left-1 text-2xl opacity-70">🌳</div>
      <div className="absolute right-1 bottom-25 hidden text-2xl opacity-70">
        🌲
      </div>
    </div>
  );
}
