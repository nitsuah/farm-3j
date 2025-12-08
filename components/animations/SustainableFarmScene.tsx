'use client';

import { useEffect, useState } from 'react';

export function SustainableFarmScene() {
  const [windRotation, setWindRotation] = useState(0);
  const [pigRotation, setPigRotation] = useState(0);
  const [pigJumpOffset, setPigJumpOffset] = useState(0);
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

  // Wind turbine rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setWindRotation(prev => (prev + 10) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Pig rolling animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPigRotation(prev => {
        const newRotation = (prev + 5) % 360;
        return newRotation;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Pig jumping animation
  useEffect(() => {
    let direction = 1;
    const interval = setInterval(() => {
      setPigJumpOffset(prev => {
        const newOffset = prev + direction * 2;
        if (newOffset >= 20 || newOffset <= 0) {
          direction *= -1;
        }
        return Math.max(0, Math.min(20, newOffset));
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Sky background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-amber-200 to-green-200 dark:from-sky-900 dark:via-amber-950 dark:to-green-950" />

      {/* Renewable energy icon watermark in background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-[12rem]"
          style={{
            opacity: isDarkMode ? 0.08 : 0.12,
            transform: 'rotate(-15deg)',
            userSelect: 'none',
          }}
        >
          ♻️
        </div>
      </div>

      {/* Ground - green grass */}
      <div className="absolute bottom-0 z-[5] h-20 w-full bg-gradient-to-b from-green-600 to-green-700 dark:from-green-900 dark:to-green-950" />

      {/* Red barn in background */}
      <div className="absolute bottom-20 left-[12%] z-[3]">
        <div className="flex flex-col items-center">
          {/* Barn roof */}
          <div className="h-0 w-0 border-r-[30px] border-b-[20px] border-l-[30px] border-r-transparent border-b-red-700 border-l-transparent dark:border-b-red-900" />
          {/* Barn body */}
          <div className="relative h-[45px] w-[60px] bg-red-600 dark:bg-red-800">
            <div className="absolute top-[18px] left-1/2 h-[24px] w-[16px] -translate-x-1/2 bg-amber-900 dark:bg-amber-950" />
          </div>
        </div>
      </div>

      {/* Improved Solar panel array - repositioned */}
      <div className="absolute bottom-16 left-[5%] z-[6] flex flex-col items-center gap-1">
        <div className="text-3xl">☀️</div>
        <div className="flex gap-1">
          <div
            className="h-7 w-9 rounded border border-gray-700 bg-blue-500 shadow-md dark:bg-blue-700"
            style={{ transform: 'perspective(100px) rotateX(20deg)' }}
          />
          <div
            className="h-7 w-9 rounded border border-gray-700 bg-blue-500 shadow-md dark:bg-blue-700"
            style={{ transform: 'perspective(100px) rotateX(20deg)' }}
          />
        </div>
      </div>

      {/* Improved Wind turbine - repositioned to right */}
      <div className="absolute right-[8%] bottom-16 z-[6]">
        <div className="flex flex-col items-center">
          {/* Spinning blades */}
          <div
            className="relative h-10 w-10"
            style={{
              transform: `rotate(${windRotation}deg)`,
              transition: 'transform 0.05s linear',
            }}
          >
            <div className="absolute top-1/2 left-1/2 h-1.5 w-10 -translate-x-1/2 -translate-y-1/2 bg-white shadow-sm" />
            <div className="absolute top-1/2 left-1/2 h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-white shadow-sm" />
            <div
              className="absolute top-1/2 left-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white shadow-sm"
              style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)' }}
            />
          </div>
          {/* Turbine pole - taller */}
          <div className="h-24 w-2 bg-gray-400 dark:bg-gray-600" />
          <div className="h-2 w-4 bg-gray-500 dark:bg-gray-700" />
        </div>
      </div>

      {/* Mud puddle - larger */}
      <div className="absolute bottom-16 left-[42%] z-[4] -translate-x-1/2">
        <div className="h-10 w-20 rounded-full bg-amber-900 opacity-60 dark:bg-amber-950" />
      </div>

      {/* Pig #1 - rolling in mud */}
      <div
        className="absolute right-[15%] bottom-17 z-[7] -translate-x-1/2 text-3xl"
        style={{
          transform: `translateX(-50%) rotate(${pigRotation}deg)`,
          transition: 'transform 0.1s linear',
        }}
      >
        🐷
      </div>

      {/* Pig #2 - jumping near barn */}
      <div
        className="absolute right-[30%] z-[7] text-3xl"
        style={{
          bottom: `${64 + pigJumpOffset}px`,
          transition: 'bottom 0.05s linear',
        }}
      >
        🐷
      </div>

      {/* Pig #3 - stationary near hay */}
      <div className="absolute right-[50%] bottom-16 z-[7] text-3xl">🐷</div>

      {/* Hay bale - repositioned */}
      <div className="absolute right-[20%] bottom-16 z-[6] flex flex-col items-center">
        <div className="text-3xl">🌾</div>
        <div className="h-5 w-10 rounded bg-yellow-600 dark:bg-yellow-800" />
      </div>

      {/* Recycling bin - moved left slightly */}
      <div className="absolute right-[35%] bottom-16 z-[6] text-3xl">♻️</div>
    </div>
  );
}
