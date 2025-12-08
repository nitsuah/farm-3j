'use client';

import { useEffect, useState } from 'react';
import { Crop } from './Crop';
import { FlyingBug } from './FlyingBug';

export function GrowingCropScene() {
  const [cycleStage, setCycleStage] = useState(0);
  const [rollyPollyPosition, setRollyPollyPosition] = useState(-10);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cloudPosition, setCloudPosition] = useState(0);

  // Check theme on mount and watch for changes
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Growth cycle - smoothly transition through growth stages
  useEffect(() => {
    const interval = setInterval(() => {
      setCycleStage(prev => (prev + 1) % 100);
    }, 150); // Smooth 15 second full cycle

    return () => clearInterval(interval);
  }, []);

  // Animate clouds
  useEffect(() => {
    const cloudInterval = setInterval(() => {
      setCloudPosition(prev => (prev + 0.5) % 110);
    }, 100);

    return () => clearInterval(cloudInterval);
  }, []);

  // Roly poly crawling animation - near bottom row only
  useEffect(() => {
    const interval = setInterval(() => {
      setRollyPollyPosition(prev => {
        if (prev > 110) return -10;
        return prev + 0.3; // Slower movement
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Calculate growth stages based on cycle (0.0 to 1.0)
  const getGrowthProgress = (offset: number = 0) => {
    const progress = ((cycleStage + offset) % 100) / 100;
    return progress;
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Gradient background - blue sky to green ground */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-200 to-green-200 dark:from-sky-900 dark:via-blue-950 dark:to-green-950" />

      {/* Dark overlay for night */}
      {isDarkMode && <div className="absolute inset-0 z-[1] bg-black/40" />}

      {/* Stars at night */}
      {isDarkMode && (
        <div className="absolute inset-0 z-[2]">
          {Array.from({ length: 25 }, (_, i) => {
            const x = 5 + ((i * 17 + Math.sin(i) * 20) % 90);
            const y = 3 + ((i * 7 + Math.cos(i) * 15) % 12);
            const size = Math.sin(i) > 0 ? 'text-[4px]' : 'text-[3px]';
            const delay = `${(i % 5) * 0.3}s`;
            return (
              <div
                key={`star-${i}`}
                className={`absolute ${size} animate-twinkle`}
                style={{ left: `${x}%`, top: `${y}%`, animationDelay: delay }}
              >
                ⭐
              </div>
            );
          })}
        </div>
      )}

      {/* Clouds in day mode */}
      {!isDarkMode && (
        <>
          <div
            className="absolute top-[0.5%] z-[2] text-4xl opacity-70 transition-all"
            style={{ left: `${cloudPosition}%` }}
          >
            ☁️
          </div>
          <div
            className="absolute top-[2%] z-[2] text-3xl opacity-60 transition-all"
            style={{ left: `${(cloudPosition + 40) % 110}%` }}
          >
            ☁️
          </div>
        </>
      )}

      {/* Mountains in background - reduced count */}
      <div
        className="absolute bottom-14 left-[8%] z-[3] text-5xl"
        style={{ opacity: isDarkMode ? 0.3 : 0.5 }}
      >
        ⛰️
      </div>
      <div
        className="absolute right-[20%] bottom-14 z-[3] text-6xl"
        style={{ opacity: isDarkMode ? 0.35 : 0.55 }}
      >
        ⛰️
      </div>

      {/* Trees - natural spread pattern from header */}
      <div
        className="absolute right-0 bottom-[4rem] left-0 z-[6] flex justify-around px-0 transition-opacity duration-1000"
        style={{ opacity: isDarkMode ? 0.25 : 0.6 }}
      >
        {Array.from({ length: 30 }).map((_, i) => {
          const sizes = ['text-3xl', 'text-4xl', 'text-3xl', 'text-4xl'];
          const size = sizes[i % sizes.length];
          const bottomOffset = Math.round((Math.sin(i) * 5 + 4) * 100) / 100;

          return (
            <div
              key={i}
              className={size}
              style={{
                transform: `translateY(${bottomOffset}px)`,
                marginLeft: '-28px',
              }}
            >
              🌲
            </div>
          );
        })}
      </div>

      {/* Bushes - overlapping lower part of trees */}
      <div
        className="absolute right-0 bottom-[3.5rem] left-0 z-[6] flex justify-around px-0 transition-opacity duration-1000"
        style={{ opacity: isDarkMode ? 0.2 : 0.55 }}
      >
        {Array.from({ length: 15 }).map((_, i) => {
          const sizes = ['text-2xl', 'text-xl', 'text-2xl'];
          const size = sizes[i % sizes.length];
          const bottomOffset =
            Math.round((Math.sin(i * 1.5) * 3 + 2) * 100) / 100;

          return (
            <div
              key={i}
              className={size}
              style={{
                transform: `translateY(${bottomOffset}px)`,
                marginLeft: '-22px',
              }}
            >
              🌳
            </div>
          );
        })}
      </div>

      {/* Ground with texture */}
      <div className="absolute bottom-0 z-[5] h-16 w-full bg-gradient-to-b from-amber-700 to-amber-900 dark:from-amber-950 dark:to-black" />

      {/* Crops with cycling growth - 5 columns × 3 rows */}
      {/* Back row */}
      <div
        className="absolute right-0 bottom-12 left-0 z-[7] flex justify-around px-2"
        style={{
          opacity: 0.7,
          transform: 'scale(0.7) rotateX(45deg) rotateZ(-2deg)',
        }}
      >
        {[
          { offset: 0, type: 'tomato' as const },
          { offset: 20, type: 'carrot' as const },
          { offset: 40, type: 'lettuce' as const },
          { offset: 60, type: 'potato' as const },
          { offset: 80, type: 'corn' as const },
        ].map(({ offset, type }, idx) => {
          const progress = getGrowthProgress(offset);
          const growthStage = Math.floor(progress * 3);

          return (
            <div
              key={`back-${idx}`}
              style={{
                transform: `scale(${0.5 + progress * 0.5})`,
                opacity: 0.7 + progress * 0.3,
                transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
              }}
            >
              <Crop type={type} growthStage={growthStage} animate={true} />
            </div>
          );
        })}
      </div>

      {/* Middle row */}
      <div
        className="absolute right-0 bottom-8 left-0 z-7 flex justify-around px-2"
        style={{
          opacity: 0.85,
          transform: 'scale(0.85) rotateX(45deg) rotateZ(-2deg)',
        }}
      >
        {[
          { offset: 10, type: 'tomato' as const },
          { offset: 30, type: 'carrot' as const },
          { offset: 50, type: 'lettuce' as const },
          { offset: 70, type: 'potato' as const },
          { offset: 90, type: 'corn' as const },
        ].map(({ offset, type }, idx) => {
          const progress = getGrowthProgress(offset);
          const growthStage = Math.floor(progress * 3);

          return (
            <div
              key={`middle-${idx}`}
              style={{
                transform: `scale(${0.5 + progress * 0.5})`,
                opacity: 0.7 + progress * 0.3,
                transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
              }}
            >
              <Crop type={type} growthStage={growthStage} animate={true} />
            </div>
          );
        })}
      </div>

      {/* Front row */}
      <div
        className="absolute right-0 bottom-4 left-0 z-8 flex justify-around px-2"
        style={{ transform: 'rotateX(45deg) rotateZ(-2deg)' }}
      >
        {[
          { offset: 0, type: 'tomato' as const },
          { offset: 20, type: 'carrot' as const },
          { offset: 40, type: 'lettuce' as const },
          { offset: 60, type: 'potato' as const },
          { offset: 80, type: 'corn' as const },
        ].map(({ offset, type }, idx) => {
          const progress = getGrowthProgress(offset);
          const growthStage = Math.floor(progress * 3);

          return (
            <div
              key={`front-${idx}`}
              style={{
                transform: `scale(${0.5 + progress * 0.5})`,
                opacity: 0.7 + progress * 0.3,
                transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
              }}
            >
              <Crop type={type} growthStage={growthStage} animate={true} />
            </div>
          );
        })}
      </div>

      {/* Flying bugs with different paths */}
      <div className="z-[9]">
        <FlyingBug type="bee" startX={20} startY={65} />
        <FlyingBug type="butterfly" startX={70} startY={60} />
      </div>

      {/* Crawling roly poly - smaller and near bottom row */}
      <div
        className="absolute bottom-6 z-[9] text-sm transition-all duration-100"
        style={{
          left: `${rollyPollyPosition}%`,
          transform: 'rotate(90deg)',
        }}
      >
        🪲
      </div>
    </div>
  );
}
