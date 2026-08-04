'use client';

import { useEffect, useState } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { Crop } from './Crop';
import { Tractor } from './Tractor';

export function HeaderCropRow() {
  const [showTractor, setShowTractor] = useState(false);
  const [tractorPosition, setTractorPosition] = useState(-10);
  const [_harvestedCrops, setHarvestedCrops] = useState<Set<number>>(new Set());
  const [cycleKey, setCycleKey] = useState(0); // Force re-render on cycle
  const [showRain, setShowRain] = useState(false);
  const [isSecondRain, setIsSecondRain] = useState(false);
  const [showBirds, setShowBirds] = useState(false);
  const [cloudOpacity, setCloudOpacity] = useState(0.8);
  const [cloudPosition, setCloudPosition] = useState(0);
  const [birdPosition, setBirdPosition] = useState(115); // Start from right
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check initial theme on mount
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Apply initial styles
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.body.style.backgroundColor = 'rgb(0, 0, 0)';
      document
        .querySelectorAll('.bg-white:not([data-theme-button])')
        .forEach(el => {
          (el as HTMLElement).style.backgroundColor = 'rgb(0, 0, 0)';
        });
      const heroGradient = document.querySelector('.dark\\:bg-black');
      if (heroGradient) {
        (heroGradient as HTMLElement).style.background = 'rgb(0, 0, 0)';
        (heroGradient as HTMLElement).style.backgroundColor = 'rgb(0, 0, 0)';
      }
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.backgroundColor = 'rgb(20, 83, 45)';
        footer.style.color = 'white';
      }
      document.querySelectorAll('h1, h2, h3').forEach(el => {
        if (!(el as HTMLElement).closest('header')) {
          (el as HTMLElement).style.color = 'white';
        }
      });
      document.querySelectorAll('p').forEach(el => {
        (el as HTMLElement).style.color = 'rgb(134, 239, 172)';
      });
    } else {
      document.body.style.backgroundColor = 'rgb(240, 253, 244)';
      document
        .querySelectorAll('.bg-white:not([data-theme-button])')
        .forEach(el => {
          (el as HTMLElement).style.backgroundColor = 'white';
        });
      const heroGradient = document.querySelector('.dark\\:bg-black');
      if (heroGradient) {
        (heroGradient as HTMLElement).style.background = 'white';
      }
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.backgroundColor = 'white';
        footer.style.color = 'rgb(20, 83, 45)';
      }
      document.querySelectorAll('h1, h2, h3').forEach(el => {
        // Don't change header PG Farms text
        if (!(el as HTMLElement).closest('header')) {
          (el as HTMLElement).style.color = 'rgb(20, 83, 45)';
        }
      });
      document.querySelectorAll('p').forEach(el => {
        (el as HTMLElement).style.color = 'rgb(21, 128, 61)';
      });
      // Fix nav About link - remove any styles
      const navAboutLinks = document.querySelectorAll('nav a[href="/about"]');
      navAboutLinks.forEach(link => {
        (link as HTMLElement).style.backgroundColor = '';
        (link as HTMLElement).style.border = '';
      });
    }
  }, []);

  // Define 10 rows with different depths (scale and opacity for perspective)
  // Row 0 is farthest (top, small), Row 9 is closest (bottom, large)
  const rows = Array.from({ length: 10 }, (_, rowIdx) => {
    const normalizedDepth = rowIdx / 9; // 0 (far) to 1 (near)
    return {
      depth: rowIdx,
      bottom: 20 + (9 - rowIdx) * 6, // Slightly tighter spacing: 20-74px
      scale: 0.3 + normalizedDepth * 0.7, // 0.3 (far) to 1.0 (near)
      opacity: 0.4 + normalizedDepth * 0.6, // 0.4 (far) to 1.0 (near)
      offsetX: (9 - rowIdx) * 3, // Diagonal offset: far rows shifted right
      cropCount: 20,
    };
  });

  useEffect(() => {
    // Complete cycle: rain start (2s) → grow (8s with rain end overlay 2s) → harvest (10s) → reset

    // Show rain at start of cycle to indicate planting
    setShowRain(true);
    setIsSecondRain(false);
    const rainStartTimer = setTimeout(() => {
      setShowRain(false);
    }, 2000);

    // Rain again during late growth phase (watering the growing crops) - WITH LIGHTNING
    const rainMidTimer = setTimeout(() => {
      setShowRain(true);
      setIsSecondRain(true); // Second rain gets lightning
    }, 8000); // Start rain again at 8s

    const rainEndTimer = setTimeout(() => {
      setShowRain(false);
      setIsSecondRain(false);
    }, 10000); // End rain at 10s (2s duration)

    // Start harvest after growth complete
    const growTimer = setTimeout(() => {
      setShowTractor(true);
    }, 10000); // After rain cycle ends

    const harvestTimer = setTimeout(() => {
      setShowTractor(false);
      setHarvestedCrops(new Set());
      setTractorPosition(-10);
    }, 20000); // 10s grow (with rain) + 10s harvest

    // Loop: restart cycle after complete
    const loopTimer = setTimeout(() => {
      setCycleKey(prev => prev + 1); // Trigger new cycle
    }, 20500); // Small delay before restart

    return () => {
      clearTimeout(rainStartTimer);
      clearTimeout(rainMidTimer);
      clearTimeout(rainEndTimer);
      clearTimeout(growTimer);
      clearTimeout(harvestTimer);
      clearTimeout(loopTimer);
    };
  }, [cycleKey]); // Re-run when cycle restarts

  // Random events: birds and clouds
  useEffect(() => {
    const randomEvents = setInterval(
      () => {
        const random = Math.random();

        // Birds appear 30% of the time
        if (random < 0.3) {
          setShowBirds(true);
          setBirdPosition(-10); // Start from left
        }

        // Clouds fade in/out
        setCloudOpacity(Math.random() * 0.5 + 0.5); // 0.5-1.0
      },
      15000 + Math.random() * 5000
    ); // Every 15-20s

    return () => clearInterval(randomEvents);
  }, []);

  // Animate clouds slowly
  useEffect(() => {
    const cloudInterval = setInterval(() => {
      setCloudPosition(prev => (prev + 0.5) % 110); // Slow movement, reset at 110%
    }, 100);

    return () => clearInterval(cloudInterval);
  }, []);

  // Animate birds at 2x cloud speed - fly completely off screen
  useEffect(() => {
    if (!showBirds) return;

    const birdInterval = setInterval(() => {
      setBirdPosition(prev => {
        const newPos = prev - 1; // Move right to left
        if (newPos < -10) {
          // Wait until fully off screen
          setShowBirds(false);
          return 115; // Start from right
        }
        return newPos;
      });
    }, 100);

    return () => clearInterval(birdInterval);
  }, [showBirds]);

  const handleTractorPositionChange = (pos: number) => {
    setTractorPosition(pos);
  };

  const isCropHarvested = (rowIdx: number, cropIdx: number) => {
    // Calculate crop position as percentage
    const cropPosition = (cropIdx / 19) * 100; // 0-100%
    // Harvest crops that the tractor has passed (with a small buffer)
    return tractorPosition > cropPosition - 5;
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-sky-400 to-sky-200 dark:from-sky-900 dark:to-sky-800">
      {/* Grey storm overlay in light mode, dark night overlay in dark mode */}
      {showRain && !isDarkMode && (
        <div className="absolute inset-0 z-[1] bg-gray-600/40" />
      )}
      {isDarkMode && <div className="absolute inset-0 z-[1] bg-black/60" />}

      {/* Sun/Moon button - always visible */}
      <button
        onClick={() => {
          const html = document.documentElement;
          const isDark = html.classList.contains('dark');

          if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);

            // Manually apply light mode styles
            document.body.style.backgroundColor = 'rgb(240, 253, 244)'; // bg-green-50
            document
              .querySelectorAll('.bg-white:not([data-theme-button])')
              .forEach(el => {
                (el as HTMLElement).style.backgroundColor = 'white';
              });
            document.querySelectorAll('.dark\\:bg-gray-900').forEach(el => {
              (el as HTMLElement).style.backgroundColor = 'white';
            });
            // Hero section gradient
            const heroGradient = document.querySelector('.dark\\:bg-black');
            if (heroGradient) {
              (heroGradient as HTMLElement).style.background = 'white';
            }
            // Footer
            const footer = document.querySelector('footer');
            if (footer) {
              footer.style.backgroundColor = 'white';
              footer.style.color = 'rgb(20, 83, 45)';
            }
            // Fix text colors for light mode
            document.querySelectorAll('h1, h2, h3').forEach(el => {
              // Don't change header PG Farm text
              if (!(el as HTMLElement).closest('header')) {
                (el as HTMLElement).style.color = 'rgb(20, 83, 45)'; // green-900
              }
            });
            document.querySelectorAll('p').forEach(el => {
              (el as HTMLElement).style.color = 'rgb(21, 128, 61)'; // green-700
            });
            // Fix nav About link - remove any styles
            const navAboutLinks = document.querySelectorAll(
              'nav a[href="/about"]'
            );
            navAboutLinks.forEach(link => {
              (link as HTMLElement).style.backgroundColor = '';
              (link as HTMLElement).style.border = '';
            });
          } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);

            // Manually apply dark mode styles
            document.body.style.backgroundColor = 'rgb(0, 0, 0)'; // black
            document
              .querySelectorAll('.bg-white:not([data-theme-button])')
              .forEach(el => {
                (el as HTMLElement).style.backgroundColor = 'rgb(0, 0, 0)';
              });
            document.querySelectorAll('.dark\\:bg-gray-800').forEach(el => {
              (el as HTMLElement).style.backgroundColor = 'rgb(0, 0, 0)';
            });
            // Hero section solid black - force it
            const heroGradient = document.querySelector('.dark\\:bg-black');
            if (heroGradient) {
              (heroGradient as HTMLElement).style.background = 'rgb(0, 0, 0)';
              (heroGradient as HTMLElement).style.backgroundColor =
                'rgb(0, 0, 0)';
            }
            // Footer
            const footer = document.querySelector('footer');
            if (footer) {
              footer.style.backgroundColor = 'rgb(20, 83, 45)';
              footer.style.color = 'white';
            }
            // Fix text colors for dark mode (exclude header)
            document.querySelectorAll('h1, h2, h3').forEach(el => {
              if (!(el as HTMLElement).closest('header')) {
                (el as HTMLElement).style.color = 'white';
              }
            });
            document.querySelectorAll('p').forEach(el => {
              (el as HTMLElement).style.color = 'rgb(134, 239, 172)'; // green-300
            });
          }
        }}
        className="absolute top-2 right-4 z-[20] cursor-pointer text-4xl transition-transform hover:scale-110 active:scale-95"
        title="Toggle theme"
        aria-label="Toggle dark/light mode"
      >
        {isDarkMode ? '🌙' : '☀️'}
      </button>

      <AnimatedBackground
        showRain={showRain}
        isSecondRain={isSecondRain}
        showBirds={showBirds}
        cloudOpacity={cloudOpacity}
        cloudPosition={cloudPosition}
        birdPosition={birdPosition}
        isDarkMode={isDarkMode}
      />

      {/* Multiple rows of crops at different depths */}
      {rows.map(row => (
        <div
          key={row.depth}
          className="absolute right-0 left-0 flex justify-around px-4"
          style={{
            bottom: `${row.bottom}px`,
            opacity: row.opacity,
            transform: `translateX(${row.offsetX}%)`,
          }}
        >
          {Array.from({ length: row.cropCount }).map((_, cropIdx) => {
            const isHarvested =
              showTractor && isCropHarvested(row.depth, cropIdx);
            const cropKey = `${cycleKey}-${row.depth}-${cropIdx}`; // Include cycleKey to force remount

            return (
              <div
                key={cropKey}
                style={{
                  transform: `scale(${row.scale})`,
                  opacity: isHarvested ? 0 : 1,
                  transition: 'opacity 0.3s ease-out',
                }}
              >
                <Crop
                  type={
                    cropIdx % 3 === 0
                      ? 'corn'
                      : cropIdx % 3 === 1
                        ? 'wheat'
                        : 'corn'
                  }
                  growthStage={0}
                  animate={!isHarvested}
                />
              </div>
            );
          })}
        </div>
      ))}

      {/* Tractor */}
      {showTractor && (
        <>
          {/* Headlight beam in dark mode */}
          {isDarkMode && (
            <div
              className="absolute z-[11]"
              style={{
                left: `calc(${tractorPosition}% + 3em)`,
                bottom: '10%',
                width: '5em',
                height: '2.5em',
                background:
                  'linear-gradient(90deg, rgba(255, 255, 200, 0.6) 0%, rgba(255, 255, 200, 0) 100%)',
                clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)',
                filter: 'blur(4px)',
                pointerEvents: 'none',
                transform: 'translateY(20%)',
              }}
            />
          )}
          <Tractor
            speed={3}
            direction="right"
            onPositionChange={handleTractorPositionChange}
          />
        </>
      )}
    </div>
  );
}
