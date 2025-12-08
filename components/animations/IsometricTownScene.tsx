'use client';

import { useEffect, useState } from 'react';

interface IsometricTownProps {
  buildings?: number;
}

export function IsometricTownScene({ buildings = 3 }: IsometricTownProps) {
  const [carPosition, setCarPosition] = useState(-20);
  const [peoplePositions, setPeoplePositions] = useState([20, 50, 75]);

  // Car animation - drives past
  useEffect(() => {
    const interval = setInterval(() => {
      setCarPosition(prev => {
        if (prev > 120) return -20;
        return prev + 0.8;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // People animation - walk around
  useEffect(() => {
    const interval = setInterval(() => {
      setPeoplePositions(prev =>
        prev.map(pos => {
          const newPos = pos + (Math.random() - 0.5) * 2;
          return Math.max(15, Math.min(85, newPos));
        })
      );
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Sky background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-200 dark:from-blue-950 dark:to-blue-900" />

      {/* Ground */}
      <div className="absolute bottom-0 h-24 w-full bg-gray-400 dark:bg-gray-800" />

      {/* Market stand/storefront */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center">
          {/* Awning */}
          <div className="mb-1 h-4 w-32 rounded-t-lg bg-red-500 dark:bg-red-700" />
          <div
            className="h-4 w-32 bg-red-400 dark:bg-red-600"
            style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}
          />

          {/* Stand table */}
          <div className="mt-1 flex h-12 w-36 items-center justify-around rounded bg-amber-700 px-2 dark:bg-amber-900">
            {/* Produce for sale */}
            <span className="text-2xl">🍎</span>
            <span className="text-2xl">🥕</span>
            <span className="text-2xl">🌽</span>
            <span className="text-2xl">🥬</span>
          </div>

          {/* Vendor */}
          <div className="mt-1 text-3xl">🧑‍🌾</div>
        </div>
      </div>

      {/* Shopping cart */}
      <div className="absolute bottom-24 left-12 text-3xl">🛒</div>

      {/* Customers walking around */}
      {peoplePositions.map((pos, idx) => (
        <div
          key={idx}
          className="absolute bottom-20 text-2xl transition-all duration-200"
          style={{ left: `${pos}%` }}
        >
          {idx % 3 === 0 ? '🚶' : idx % 3 === 1 ? '🚶‍♀️' : '👨‍👩‍👧'}
        </div>
      ))}

      {/* Car driving by */}
      <div
        className="absolute bottom-12 text-4xl transition-all duration-100"
        style={{
          left: `${carPosition}%`,
          transform: 'scaleX(-1)',
        }}
      >
        🚗
      </div>

      {/* Decorative trees */}
      <div className="absolute bottom-24 left-2 text-3xl">🌳</div>
      <div className="absolute right-2 bottom-24 text-3xl">🌲</div>
    </div>
  );
}
