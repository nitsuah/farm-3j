'use client';

import { useEffect, useState } from 'react';
import { Crop } from './Crop';
import { Tractor } from './Tractor';

export function HeaderCropRow() {
  const [showTractor, setShowTractor] = useState(false);
  const [tractorPosition, setTractorPosition] = useState(-10);
  const [harvestedCrops, setHarvestedCrops] = useState<Set>(new Set());
  const [cycleKey, setCycleKey] = useState(0); // Force re-render on cycle
  const [showRain, setShowRain] = useState(false);
  const [isSecondRain, setIsSecondRain] = useState(false);
  const [showBirds, setShowBirds] = useState(false);
  const [showClouds, setShowClouds] = useState(true);
  const [cloudOpacity, setCloudOpacity] = useState(0.8);
  const [cloudPosition, setCloudPosition] = useState(0);
  const [birdPosition, setBirdPosition] = useState(115); // Start from right
  const [forceUpdate, setForceUpdate] = useState(0); // For theme toggle re-render
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check initial theme on mount
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Apply initial styles
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.body.style.backgroundColor = 'rgb(0, 0, 0)';
      document.querySelectorAll('.bg-white').forEach(el => {
        (el as HTMLElement).style.backgroundColor = 'rgb(17, 24, 39)';
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
      const learnMoreBtn = document.querySelector('a[href="/about"]');
      if (learnMoreBtn && !(learnMoreBtn as HTMLElement).closest('nav')) {
        (learnMoreBtn as HTMLElement).style.color = 'white';
        (learnMoreBtn as HTMLElement).style.border = '2px solid white';
        (learnMoreBtn as HTMLElement).style.backgroundColor = 'rgb(20, 83, 45)';
      }
    } else {
      document.body.style.backgroundColor = 'rgb(240, 253, 244)';
      document.querySelectorAll('.bg-white').forEach(el => {
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
        // Don't change header PG Farm text
        if (!(el as HTMLElement).closest('header')) {
          (el as HTMLElement).style.color = 'rgb(20, 83, 45)';
        }
      });
      document.querySelectorAll('p').forEach(el => {
        (el as HTMLElement).style.color = 'rgb(21, 128, 61)';
      });
      const learnMoreBtn = document.querySelector('a[href="/about"]');
      if (learnMoreBtn && !(learnMoreBtn as HTMLElement).closest('nav')) {
        (learnMoreBtn as HTMLElement).style.color = 'black';
        (learnMoreBtn as HTMLElement).style.border = '2px solid black';
        (learnMoreBtn as HTMLElement).style.backgroundColor = 'white';
      }
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
      {/* Grey storm overlay - covers entire header during rain */}
      {showRain && (
        <div className="absolute inset-0 z-[1] bg-gray-600/40 dark:bg-gray-900/50" />
      )}

      {/* Sun - top right corner, hidden during rain, acts as theme toggle */}
      {!showRain && (
        <button
          onClick={() => {
            const html = document.documentElement;
            const isDark = html.classList.contains('dark');
            console.log('Sun clicked! Current isDark:', isDark);

            if (isDark) {
              html.classList.remove('dark');
              localStorage.setItem('theme', 'light');
              console.log('Switched to light mode');
              setIsDarkMode(false);

              // Manually apply light mode styles
              document.body.style.backgroundColor = 'rgb(240, 253, 244)'; // bg-green-50
              document.querySelectorAll('.bg-white').forEach(el => {
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
              // Fix Learn More button text and border
              const learnMoreBtn = document.querySelector('a[href="/about"]');
              if (
                learnMoreBtn &&
                !(learnMoreBtn as HTMLElement).closest('nav')
              ) {
                (learnMoreBtn as HTMLElement).style.color = 'black';
                (learnMoreBtn as HTMLElement).style.border = '2px solid black';
                (learnMoreBtn as HTMLElement).style.backgroundColor = 'white';
              }
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
              console.log('Switched to dark mode');
              setIsDarkMode(true);

              // Manually apply dark mode styles
              document.body.style.backgroundColor = 'rgb(0, 0, 0)'; // black
              document.querySelectorAll('.bg-white').forEach(el => {
                (el as HTMLElement).style.backgroundColor = 'rgb(17, 24, 39)'; // gray-900
              });
              document.querySelectorAll('.dark\\:bg-gray-900').forEach(el => {
                (el as HTMLElement).style.backgroundColor = 'rgb(17, 24, 39)';
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
              // Fix Learn More button
              const learnMoreBtn = document.querySelector('a[href="/about"]');
              if (
                learnMoreBtn &&
                !(learnMoreBtn as HTMLElement).closest('nav')
              ) {
                (learnMoreBtn as HTMLElement).style.color = 'white';
                (learnMoreBtn as HTMLElement).style.border = '2px solid white';
                (learnMoreBtn as HTMLElement).style.backgroundColor =
                  'rgb(20, 83, 45)';
              }
            }
            console.log('HTML classes:', html.className);

            // Log computed styles to verify
            setTimeout(() => {
              const body = document.body;
              const card = document.querySelector('.bg-white');
              console.log(
                'Body bg:',
                window.getComputedStyle(body).backgroundColor
              );
              if (card) {
                console.log(
                  'Card bg:',
                  window.getComputedStyle(card).backgroundColor
                );
              }
            }, 100);
          }}
          className="absolute top-2 right-4 z-[20] cursor-pointer text-4xl transition-transform hover:scale-110 active:scale-95"
          title="Toggle theme"
          aria-label="Toggle dark/light mode"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>
      )}

      {/* Mountains - behind horizon with varied heights, TIGHT like Smoky Mountains */}
      <div
        className="absolute right-0 bottom-16 left-0 z-0 flex justify-around"
        style={{ gap: '0', padding: '0' }}
      >
        <div
          className="text-5xl opacity-20"
          style={{ transform: 'translateY(35px)', marginLeft: '-30px' }}
        >
          ⛰️
        </div>
        <div
          className="text-6xl opacity-22"
          style={{ transform: 'translateY(32px)', marginLeft: '-33px' }}
        >
          ⛰️
        </div>
        <div
          className="text-7xl opacity-25"
          style={{ transform: 'translateY(28px)', marginLeft: '-36px' }}
        >
          ⛰️
        </div>
        <div
          className="text-5xl opacity-21"
          style={{ transform: 'translateY(34px)', marginLeft: '-30px' }}
        >
          ⛰️
        </div>
        <div
          className="text-6xl opacity-23"
          style={{ transform: 'translateY(32px)', marginLeft: '-33px' }}
        >
          ⛰️
        </div>
        <div
          className="text-8xl opacity-30"
          style={{ transform: 'translateY(20px)', marginLeft: '-38px' }}
        >
          ⛰️
        </div>
        <div
          className="text-7xl opacity-28"
          style={{ transform: 'translateY(25px)', marginLeft: '-36px' }}
        >
          ⛰️
        </div>
        <div
          className="text-6xl opacity-24"
          style={{ transform: 'translateY(30px)', marginLeft: '-33px' }}
        >
          ⛰️
        </div>
        <div
          className="text-9xl opacity-40"
          style={{ transform: 'translateY(15px)', marginLeft: '-40px' }}
        >
          ⛰️
        </div>
        <div
          className="text-8xl opacity-35"
          style={{ transform: 'translateY(18px)', marginLeft: '-38px' }}
        >
          ⛰️
        </div>
        <div
          className="text-6xl opacity-25"
          style={{ transform: 'translateY(30px)', marginLeft: '-33px' }}
        >
          ⛰️
        </div>
        <div
          className="text-7xl opacity-27"
          style={{ transform: 'translateY(26px)', marginLeft: '-36px' }}
        >
          ⛰️
        </div>
        <div
          className="text-8xl opacity-35"
          style={{ transform: 'translateY(18px)', marginLeft: '-38px' }}
        >
          ⛰️
        </div>
        <div
          className="text-5xl opacity-20"
          style={{ transform: 'translateY(35px)', marginLeft: '-30px' }}
        >
          ⛰️
        </div>
        <div
          className="text-7xl opacity-30"
          style={{ transform: 'translateY(22px)', marginLeft: '-36px' }}
        >
          ⛰️
        </div>
        <div
          className="text-6xl opacity-25"
          style={{ transform: 'translateY(28px)', marginLeft: '-33px' }}
        >
          ⛰️
        </div>
        <div
          className="text-8xl opacity-32"
          style={{ transform: 'translateY(20px)', marginLeft: '-38px' }}
        >
          ⛰️
        </div>
        <div
          className="text-5xl opacity-20"
          style={{ transform: 'translateY(33px)', marginLeft: '-30px' }}
        >
          ⛰️
        </div>
        <div
          className="text-7xl opacity-28"
          style={{ transform: 'translateY(24px)', marginLeft: '-36px' }}
        >
          ⛰️
        </div>
        <div
          className="text-6xl opacity-23"
          style={{ transform: 'translateY(31px)', marginLeft: '-33px' }}
        >
          ⛰️
        </div>
        <div
          className="text-8xl opacity-33"
          style={{ transform: 'translateY(19px)', marginLeft: '-38px' }}
        >
          ⛰️
        </div>
        <div
          className="text-7xl opacity-29"
          style={{ transform: 'translateY(23px)', marginLeft: '-36px' }}
        >
          ⛰️
        </div>
        <div
          className="text-5xl opacity-21"
          style={{ transform: 'translateY(34px)', marginLeft: '-30px' }}
        >
          ⛰️
        </div>
        <div
          className="text-6xl opacity-24"
          style={{ transform: 'translateY(30px)', marginLeft: '-33px' }}
        >
          ⛰️
        </div>
        <div
          className="text-9xl opacity-38"
          style={{ transform: 'translateY(16px)', marginLeft: '-40px' }}
        >
          ⛰️
        </div>
        <div
          className="text-8xl opacity-34"
          style={{ transform: 'translateY(19px)', marginLeft: '-38px' }}
        >
          ⛰️
        </div>
        <div
          className="text-7xl opacity-26"
          style={{ transform: 'translateY(27px)', marginLeft: '-36px' }}
        >
          ⛰️
        </div>
        <div
          className="text-6xl opacity-22"
          style={{ transform: 'translateY(32px)', marginLeft: '-33px' }}
        >
          ⛰️
        </div>
        <div
          className="text-5xl opacity-20"
          style={{ transform: 'translateY(35px)', marginLeft: '-30px' }}
        >
          ⛰️
        </div>
      </div>

      {/* Clouds - fade in/out and move slowly, hidden during storm */}
      {!showRain && (
        <>
          {/* Basic single clouds */}
          <div
            className="absolute top-1 z-0 text-5xl transition-opacity duration-3000"
            style={{
              opacity: showClouds ? cloudOpacity : 0,
              left: `${cloudPosition}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ☁️
          </div>
          <div
            className="absolute top-0 z-0 text-4xl transition-opacity duration-3000"
            style={{
              opacity: showClouds ? cloudOpacity * 0.8 : 0,
              left: `${(cloudPosition + 25) % 110}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ☁️
          </div>
          <div
            className="absolute top-3 z-0 text-3xl transition-opacity duration-3000"
            style={{
              opacity: showClouds ? cloudOpacity * 0.6 : 0,
              left: `${(cloudPosition + 50) % 110}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ☁️
          </div>

          {/* Blanket cloud - chain of 3 overlapping */}
          <div
            className="absolute top-1 z-0 flex transition-opacity duration-3000"
            style={{
              opacity: showClouds ? cloudOpacity * 0.7 : 0,
              left: `${(cloudPosition + 70) % 110}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="text-4xl" style={{ marginLeft: '-20px' }}>
              ☁️
            </span>
            <span className="text-4xl" style={{ marginLeft: '-20px' }}>
              ☁️
            </span>
            <span className="text-4xl" style={{ marginLeft: '-20px' }}>
              ☁️
            </span>
          </div>

          {/* Double large clouds overlapping */}
          <div
            className="absolute top-2 z-0 flex transition-opacity duration-3000"
            style={{
              opacity: showClouds ? cloudOpacity * 0.75 : 0,
              left: `${(cloudPosition + 90) % 110}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="text-6xl" style={{ marginLeft: '-30px' }}>
              ☁️
            </span>
            <span className="text-6xl" style={{ marginLeft: '-30px' }}>
              ☁️
            </span>
          </div>

          {/* More basic clouds for variety */}
          <div
            className="absolute top-2 z-0 text-4xl transition-opacity duration-3000"
            style={{
              opacity: showClouds ? cloudOpacity * 0.65 : 0,
              left: `${(cloudPosition + 40) % 110}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ☁️
          </div>
          <div
            className="absolute top-3 z-0 text-3xl transition-opacity duration-3000"
            style={{
              opacity: showClouds ? cloudOpacity * 0.55 : 0,
              left: `${(cloudPosition + 15) % 110}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ☁️
          </div>
        </>
      )}

      {/* Birds - random fade in/out and move at 2x cloud speed with jitter */}
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

      {/* Rain - shown at start of cycle, trickling down like our crops */}
      {showRain && (
        <>
          {/* Storm clouds - THICK FOG-LIKE LAYER, moving right to left */}
          <div className="absolute top-0 right-0 left-0 z-10 h-24 overflow-hidden">
            {/* First row of dense overlapping clouds */}
            <div className="absolute inset-0 flex flex-wrap justify-around">
              {Array.from({ length: 40 }).map((_, i) => {
                const leftPos = (100 - cloudPosition + i * 2.5) % 110; // Move right to left
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
            {/* Second row of clouds - offset right and down */}
            <div className="absolute inset-0 flex flex-wrap justify-around">
              {Array.from({ length: 40 }).map((_, i) => {
                const leftPos = (100 - cloudPosition + i * 2.5 + 5) % 110; // Slight offset
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
            {/* Additional fog layer for density */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800/80 via-gray-700/60 to-transparent dark:from-gray-950/80 dark:via-gray-900/60 dark:to-transparent" />
          </div>

          {/* Lightning flashes - ONLY ON SECOND RAIN, thin bolts starting below clouds */}
          {isSecondRain && (
            <>
              {Array.from({ length: 10 }).map((_, i) => {
                const leftPos = (i * 10 + 5) % 95; // Spread across width
                const delay = (i * 0.2) % 2; // Stagger timing
                return (
                  <div
                    key={i}
                    className="absolute z-[15] flex items-start justify-center"
                    style={{
                      top: '6rem', // Start below storm clouds (h-24 = 6rem)
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

          {/* Rain drops - waterfall effect, starts below clouds and fades in */}
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            {Array.from({ length: 320 }).map((_, i) => {
              // More dynamic positioning across width, varied vertical start
              const leftPos =
                (i * 0.35 + Math.sin(i * 0.5) * 15 + Math.cos(i * 0.3) * 10) %
                100;
              const topStart = 30 + Math.sin(i) * 5; // Start lower (30-35%)
              // Much more varied timing to break up the sheet effect
              const delay =
                (i * 0.003 +
                  Math.sin(i * 0.7) * 0.4 +
                  Math.cos(i * 1.3) * 0.3) %
                1.2;
              // Vary animation duration for more natural rain
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

      {/* Trees - varied heights and natural spread, IN FRONT of mountains/horizon - SOLID FOREST */}
      <div
        className="absolute right-0 bottom-20 left-0 z-[2] flex justify-around px-0 transition-opacity duration-1000"
        style={{ opacity: showRain ? 0.25 : 0.6 }}
      >
        {Array.from({ length: 180 }).map((_, i) => {
          // Varied tree sizes for natural look
          const sizes = [
            'text-3xl',
            'text-4xl',
            'text-5xl',
            'text-4xl',
            'text-3xl',
            'text-5xl',
          ];
          const size = sizes[i % sizes.length];
          // Round to 2 decimal places to ensure consistent SSR/client rendering
          const bottomOffset = Math.round((Math.sin(i) * 5 + 4) * 100) / 100;

          return (
            <div
              key={i}
              className={size}
              style={{
                transform: `translateY(${bottomOffset}px)`,
                marginLeft: '-28px', // Ultra tight overlap for dense forest
              }}
            >
              🌲
            </div>
          );
        })}
      </div>

      {/* Bushes - overlapping lower part of trees for dense forest floor */}
      <div
        className="absolute right-0 bottom-18 left-0 z-[3] flex justify-around px-0 transition-opacity duration-1000"
        style={{ opacity: showRain ? 0.2 : 0.55 }}
      >
        {Array.from({ length: 90 }).map((_, i) => {
          // Varied bush sizes
          const sizes = ['text-2xl', 'text-xl', 'text-2xl', 'text-3xl'];
          const size = sizes[i % sizes.length];
          // Round to 2 decimal places to ensure consistent SSR/client rendering
          const bottomOffset =
            Math.round((Math.sin(i * 1.5) * 3 + 2) * 100) / 100;

          return (
            <div
              key={i}
              className={size}
              style={{
                transform: `translateY(${bottomOffset}px)`,
                marginLeft: '-22px', // Tighter overlap to match tree density
              }}
            >
              🌳
            </div>
          );
        })}
      </div>

      {/* Ground/Soil with depth gradient */}
      <div className="absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-b from-amber-700 to-amber-900 dark:from-amber-900 dark:to-black" />

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
        <Tractor
          speed={3}
          direction="right"
          onPositionChange={handleTractorPositionChange}
        />
      )}
    </div>
  );
}
