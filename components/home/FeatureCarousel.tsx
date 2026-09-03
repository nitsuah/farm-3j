'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { GrowingCropScene } from '@/components/animations/GrowingCropScene';
import { IsometricTownScene } from '@/components/animations/IsometricTownScene';
import { SustainableFarmScene } from '@/components/animations/SustainableFarmScene';

interface Slide {
  id: string;
  icon: string;
  title: string;
  description: string;
  render: () => React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    id: 'produce',
    icon: '🍅',
    title: 'Fresh Produce',
    description:
      'Watch our crops grow! Seasonal vegetables and fruits grown with care.',
    render: () => <GrowingCropScene />,
  },
  {
    id: 'community',
    icon: '🏘️',
    title: 'Local Community',
    description:
      'Supporting our local community with quality, farm-fresh products.',
    render: () => <IsometricTownScene buildings={3} />,
  },
  {
    id: 'sustainable',
    icon: '🌞',
    title: 'Sustainable Farming',
    description:
      'Solar, wind, and eco-friendly practices for a healthier future.',
    render: () => <SustainableFarmScene />,
  },
];

const AUTO_ADVANCE_MS = 6000;
/** Minimum horizontal swipe distance (px) before a touch gesture counts as a slide change. */
const SWIPE_THRESHOLD = 40;

/**
 * Compact, auto-rotating feature showcase for the home page.
 *
 * Replaces the old click-to-expand accordion (three independently-expanding
 * cards that could stack to 3x the height on mobile) with a single shared
 * preview stage: one fixed-height region that swaps content, plus a tab
 * strip with a live auto-advance progress indicator, prev/next arrows, dot
 * navigation, and touch-swipe support. Net effect: same three features,
 * a fraction of the vertical footprint, and continuous motion instead of a
 * static wall of collapsed cards.
 */
export function FeatureCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((idx: number) => {
    setActive(((idx % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-advance; paused on hover/focus so users can linger on a slide.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive(a => (a + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      goTo(active + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  const current = SLIDES[active]!;

  return (
    <section
      aria-label="Farm features"
      className="mx-auto w-full max-w-3xl px-4 py-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Tab strip */}
      <div className="mb-2 flex gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(i)}
            aria-current={i === active}
            className={`relative flex-1 overflow-hidden rounded-lg border px-2 py-1.5 text-left transition-colors sm:px-3 sm:py-2 ${
              i === active
                ? 'border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-950'
                : 'border-green-100 hover:border-green-300 dark:border-gray-700 dark:hover:border-gray-500'
            }`}
          >
            <span className="flex items-center gap-1 text-[11px] font-bold text-green-900 sm:gap-1.5 sm:text-sm dark:text-green-300">
              <span aria-hidden="true">{slide.icon}</span>
              <span className="truncate">{slide.title}</span>
            </span>
            {i === active && (
              <span
                key={`progress-${slide.id}-${paused}`}
                className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-green-600 dark:bg-green-400"
                style={{
                  animation: paused
                    ? 'none'
                    : `carousel-progress ${AUTO_ADVANCE_MS}ms linear forwards`,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Stage */}
      <div
        className="relative h-40 w-full touch-pan-y overflow-hidden rounded-xl border border-green-200 sm:h-52 dark:border-gray-700"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div key={current.id} className="animate-fade-in absolute inset-0">
          {current.render()}
        </div>

        <button
          type="button"
          onClick={() => goTo(active - 1)}
          aria-label="Previous feature"
          className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-black/30 px-2 py-1 text-white backdrop-blur-sm transition hover:bg-black/50"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          aria-label="Next feature"
          className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-black/30 px-2 py-1 text-white backdrop-blur-sm transition hover:bg-black/50"
        >
          ›
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-3 pt-4 pb-1.5">
          <p className="text-[11px] text-white sm:text-xs">
            {current.description}
          </p>
        </div>
      </div>

      {/* Dots */}
      <div className="mt-2 flex justify-center gap-1.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to ${slide.title}`}
            className={`h-1.5 rounded-full transition-all ${
              i === active
                ? 'w-5 bg-green-600 dark:bg-green-400'
                : 'w-1.5 bg-green-200 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
