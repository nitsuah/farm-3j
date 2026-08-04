'use client';

/**
 * AnimatedBackground — extracted from HeaderCropRow.tsx.
 * Renders the landscape backdrop: mountains, clouds, birds, stars, rain,
 * trees, bushes, and the ground strip.
 *
 * The parent (HeaderCropRow) retains the wrapping container, storm overlay,
 * theme toggle, crop rows, and tractor.
 */

import React from 'react';

export interface AnimatedBackgroundProps {
  showRain: boolean;
  isSecondRain: boolean;
  showBirds: boolean;
  cloudOpacity: number;
  cloudPosition: number;
  birdPosition: number;
  isDarkMode: boolean;
}

export function AnimatedBackground({
  showRain,
  isSecondRain,
  showBirds,
  cloudOpacity,
  cloudPosition,
  birdPosition,
  isDarkMode,
}: AnimatedBackgroundProps) {
  return (
    <>
      {/* Mountains - behind horizon with varied heights, TIGHT like Smoky Mountains */}
      <div
        className="absolute right-0 bottom-16 left-0 z-0 flex justify-around"
        style={{ gap: '0', padding: '0' }}
      >
        {[
          { size: 'text-5xl', opacity: 'opacity-20', ty: 35, ml: -30 },
          { size: 'text-6xl', opacity: 'opacity-22', ty: 32, ml: -33 },
          { size: 'text-7xl', opacity: 'opacity-25', ty: 28, ml: -36 },
          { size: 'text-5xl', opacity: 'opacity-21', ty: 34, ml: -30 },
          { size: 'text-6xl', opacity: 'opacity-23', ty: 32, ml: -33 },
          { size: 'text-8xl', opacity: 'opacity-30', ty: 20, ml: -38 },
          { size: 'text-7xl', opacity: 'opacity-28', ty: 25, ml: -36 },
          { size: 'text-6xl', opacity: 'opacity-24', ty: 30, ml: -33 },
          { size: 'text-9xl', opacity: 'opacity-40', ty: 15, ml: -40 },
          { size: 'text-8xl', opacity: 'opacity-35', ty: 18, ml: -38 },
          { size: 'text-6xl', opacity: 'opacity-25', ty: 30, ml: -33 },
          { size: 'text-7xl', opacity: 'opacity-27', ty: 26, ml: -36 },
          { size: 'text-8xl', opacity: 'opacity-35', ty: 18, ml: -38 },
          { size: 'text-5xl', opacity: 'opacity-20', ty: 35, ml: -30 },
          { size: 'text-7xl', opacity: 'opacity-30', ty: 22, ml: -36 },
          { size: 'text-6xl', opacity: 'opacity-25', ty: 28, ml: -33 },
          { size: 'text-8xl', opacity: 'opacity-32', ty: 20, ml: -38 },
          { size: 'text-5xl', opacity: 'opacity-20', ty: 33, ml: -30 },
          { size: 'text-7xl', opacity: 'opacity-28', ty: 24, ml: -36 },
          { size: 'text-6xl', opacity: 'opacity-23', ty: 31, ml: -33 },
          { size: 'text-8xl', opacity: 'opacity-33', ty: 19, ml: -38 },
          { size: 'text-7xl', opacity: 'opacity-29', ty: 23, ml: -36 },
          { size: 'text-5xl', opacity: 'opacity-21', ty: 34, ml: -30 },
          { size: 'text-6xl', opacity: 'opacity-24', ty: 30, ml: -33 },
          { size: 'text-9xl', opacity: 'opacity-38', ty: 16, ml: -40 },
          { size: 'text-8xl', opacity: 'opacity-34', ty: 19, ml: -38 },
          { size: 'text-7xl', opacity: 'opacity-26', ty: 27, ml: -36 },
          { size: 'text-6xl', opacity: 'opacity-22', ty: 32, ml: -33 },
          { size: 'text-5xl', opacity: 'opacity-20', ty: 35, ml: -30 },
        ].map((m, i) => (
          <div
            key={i}
            className={`${m.size} ${m.opacity}`}
            style={{
              transform: `translateY(${m.ty}px)`,
              marginLeft: `${m.ml}px`,
            }}
          >
            ⛰️
          </div>
        ))}
      </div>

      {/* Clouds - fade in/out and move slowly, hidden during storm and in dark mode */}
      {!showRain && !isDarkMode && (
        <>
          <div
            className="absolute top-1 z-0 text-5xl transition-opacity duration-3000"
            style={{
              opacity: cloudOpacity,
              left: `${cloudPosition}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ☁️
          </div>
          <div
            className="absolute top-0 z-0 text-4xl transition-opacity duration-3000"
            style={{
              opacity: cloudOpacity * 0.8,
              left: `${(cloudPosition + 25) % 110}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ☁️
          </div>
          <div
            className="absolute top-3 z-0 text-3xl transition-opacity duration-3000"
            style={{
              opacity: cloudOpacity * 0.6,
              left: `${(cloudPosition + 50) % 110}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ☁️
          </div>
          <div
            className="absolute top-1 z-0 flex transition-opacity duration-3000"
            style={{
              opacity: cloudOpacity * 0.7,
              left: `${(cloudPosition + 70) % 110}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="text-4xl" style={{ marginLeft: '-20px' }}>☁️</span>
            <span className="text-4xl" style={{ marginLeft: '-20px' }}>☁️</span>
            <span className="text-4xl" style={{ marginLeft: '-20px' }}>☁️</span>
          </div>
          <div
            className="absolute top-2 z-0 flex transition-opacity duration-3000"
            style={{
              opacity: cloudOpacity * 0.75,
              left: `${(cloudPosition + 90) % 110}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="text-6xl" style={{ marginLeft: '-30px' }}>☁️</span>
            <span className="text-6xl" style={{ marginLeft: '-30px' }}>☁️</span>
          </div>
          <div
            className="absolute top-2 z-0 text-4xl transition-opacity duration-3000"
            style={{
              opacity: cloudOpacity * 0.65,
              left: `${(cloudPosition + 40) % 110}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ☁️
          </div>
          <div
            className="absolute top-3 z-0 text-3xl transition-opacity duration-3000"
            style={{
              opacity: cloudOpacity * 0.55,
              left: `${(cloudPosition + 15) % 110}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ☁️
          </div>
        </>
      )}

      {/* Birds - move right to left at 2x cloud speed */}
      {showBirds && (
        <>
          <div
            className="absolute top-16 z-0 text-2xl"
            style={{
              left: `${birdPosition}%`,
              transform: 'translateX(-50%)',
              transition: 'left 0.1s linear',
              animation: 'birdFly 0.4s ease-in-out infinite',
            }}
          >
            🦅
          </div>
          <div
            className="absolute top-20 z-0 text-xl"
            style={{
              left: `${birdPosition + 5}%`,
              transform: 'translateX(-50%)',
              transition: 'left 0.1s linear',
              animation: 'birdFly 0.4s ease-in-out infinite',
              animationDelay: '0.2s',
            }}
          >
            🦅
          </div>
        </>
      )}

      {/* Stars - shown in dark mode only, twinkling effect */}
      {isDarkMode && (
        <div className="absolute inset-0 z-[2]">
          {Array.from({ length: 40 }).map((_, i) => {
            const leftPos =
              (i * 23 + Math.sin(i * 1.5) * 15 + Math.cos(i * 0.7) * 12) % 100;
            const topPos =
              (i * 7.3 + Math.cos(i * 2) * 4 + Math.sin(i * 1.2) * 3) % 12;
            const size =
              i % 4 === 0
                ? 'text-[3px]'
                : i % 4 === 1
                  ? 'text-[4px]'
                  : i % 4 === 2
                    ? 'text-[3.5px]'
                    : 'text-[3px]';
            const delay = (i * 0.4) % 2.5;
            return (
              <div
                key={i}
                className={`absolute ${size}`}
                style={{
                  left: `${leftPos}%`,
                  top: `${topPos}%`,
                  animation: 'twinkle 3s ease-in-out infinite',
                  animationDelay: `${delay}s`,
                }}
              >
                ⭐
              </div>
            );
          })}
          {[
            { left: 15, top: 4 },
            { left: 18, top: 5.5 },
            { left: 21, top: 6 },
            { left: 24, top: 5 },
            { left: 27, top: 3.5 },
            { left: 30, top: 5 },
            { left: 27, top: 6.5 },
          ].map((star, i) => (
            <div
              key={`dipper-${i}`}
              className="absolute text-[5px]"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animation: 'twinkle 4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      {/* Rain - shown at start of cycle in light mode only */}
      {showRain && !isDarkMode && (
        <>
          {/* Storm clouds */}
          <div className="absolute top-0 right-0 left-0 z-10 h-24 overflow-hidden">
            <div className="absolute inset-0 flex flex-wrap justify-around">
              {Array.from({ length: 40 }).map((_, i) => {
                const leftPos = (100 - cloudPosition + i * 2.5) % 110;
                return (
                  <div
                    key={i}
                    className="text-5xl opacity-90"
                    style={{
                      filter: 'brightness(0.5) contrast(1.3) blur(2px)',
                      marginLeft:
                        i % 3 === 0 ? '-30px' : i % 3 === 1 ? '-25px' : '-20px',
                      marginTop: i % 2 === 0 ? '-15px' : '-10px',
                      left: `${leftPos}%`,
                      position: 'absolute',
                    }}
                  >
                    ☁️
                  </div>
                );
              })}
            </div>
            <div className="absolute inset-0 flex flex-wrap justify-around">
              {Array.from({ length: 40 }).map((_, i) => {
                const leftPos = (100 - cloudPosition + i * 2.5 + 5) % 110;
                return (
                  <div
                    key={`second-${i}`}
                    className="text-5xl opacity-85"
                    style={{
                      filter: 'brightness(0.5) contrast(1.3) blur(2px)',
                      marginLeft:
                        i % 3 === 0 ? '-25px' : i % 3 === 1 ? '-20px' : '-15px',
                      marginTop: i % 2 === 0 ? '-8px' : '-5px',
                      transform: 'translateX(20px) translateY(10px)',
                      left: `${leftPos}%`,
                      position: 'absolute',
                    }}
                  >
                    ☁️
                  </div>
                );
              })}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800/80 via-gray-700/60 to-transparent dark:from-gray-950/80 dark:via-gray-900/60 dark:to-transparent" />
          </div>

          {/* Lightning flashes - ONLY ON SECOND RAIN */}
          {isSecondRain && (
            <>
              {Array.from({ length: 10 }).map((_, i) => {
                const leftPos = (i * 10 + 5) % 95;
                const delay = (i * 0.2) % 2;
                return (
                  <div
                    key={i}
                    className="absolute z-[15] flex items-start justify-center"
                    style={{
                      top: '6rem',
                      left: `${leftPos}%`,
                      height: 'calc(100% - 6rem)',
                      animation: 'lightning 2s ease-in-out infinite',
                      animationDelay: `${delay}s`,
                      opacity: 0,
                    }}
                  >
                    <div
                      className="text-6xl leading-none"
                      style={{ textShadow: '0 0 20px yellow, 0 0 40px yellow' }}
                    >
                      ⚡
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Rain drops */}
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            {Array.from({ length: 320 }).map((_, i) => {
              const leftPos =
                (i * 0.35 + Math.sin(i * 0.5) * 15 + Math.cos(i * 0.3) * 10) % 100;
              const topStart = 30 + Math.sin(i) * 5;
              const delay =
                (i * 0.003 + Math.sin(i * 0.7) * 0.4 + Math.cos(i * 1.3) * 0.3) % 1.2;
              const duration = 1.0 + Math.sin(i * 0.9) * 0.3;
              return (
                <div
                  key={i}
                  className="absolute text-blue-500 dark:text-blue-300"
                  style={{
                    left: `${leftPos}%`,
                    top: `${topStart}%`,
                    fontSize: '2px',
                    animation: `raindrop ${duration}s linear infinite`,
                    animationDelay: `${delay}s`,
                  }}
                >
                  💧
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Trees - solid forest in front of mountains */}
      <div
        className="absolute right-0 bottom-20 left-0 z-[2] flex justify-around px-0 transition-opacity duration-1000"
        style={{ opacity: showRain ? 0.25 : isDarkMode ? 0.25 : 0.6 }}
      >
        {Array.from({ length: 180 }).map((_, i) => {
          const sizes = ['text-3xl', 'text-4xl', 'text-5xl', 'text-4xl', 'text-3xl', 'text-5xl'];
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
        className="absolute right-0 bottom-18 left-0 z-[3] flex justify-around px-0 transition-opacity duration-1000"
        style={{ opacity: showRain ? 0.2 : isDarkMode ? 0.2 : 0.55 }}
      >
        {Array.from({ length: 90 }).map((_, i) => {
          const sizes = ['text-2xl', 'text-xl', 'text-2xl', 'text-3xl'];
          const size = sizes[i % sizes.length];
          const bottomOffset = Math.round((Math.sin(i * 1.5) * 3 + 2) * 100) / 100;
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

      {/* Ground/Soil with depth gradient */}
      <div className="absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-b from-amber-700 to-amber-900 dark:from-amber-900 dark:to-black" />
    </>
  );
}
