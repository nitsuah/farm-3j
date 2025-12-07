'use client';

import { useEffect, useState } from 'react';
import { Crop } from './Crop';
import { Tractor } from './Tractor';

export function HeaderCropRow() {
  const [showTractor, setShowTractor] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState(false);

  useEffect(() => {
    // Show tractor after crops are fully grown (8 seconds)
    const tractorTimer = setTimeout(() => {
      setShowTractor(true);
    }, 8000);

    return () => clearTimeout(tractorTimer);
  }, []);

  useEffect(() => {
    if (showTractor) {
      // Start harvesting animation when tractor appears
      setIsHarvesting(true);

      // Reset after harvest complete (10 seconds for tractor to cross)
      const resetTimer = setTimeout(() => {
        setShowTractor(false);
        setIsHarvesting(false);
      }, 10000);

      return () => clearTimeout(resetTimer);
    }
  }, [showTractor]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-sky-400 to-sky-200 dark:from-sky-900 dark:to-sky-800">
      {/* Ground/Soil */}
      <div className="absolute right-0 bottom-0 left-0 h-8 bg-amber-800 dark:bg-amber-950" />

      {/* Single row of crops */}
      <div className="absolute right-0 bottom-6 left-0 flex justify-around px-4">
        {Array.from({ length: 20 }).map((_, idx) => (
          <div
            key={idx}
            style={{
              opacity: isHarvesting ? 0 : 1,
              transition: 'opacity 0.5s ease-out',
            }}
          >
            <Crop
              type={idx % 3 === 0 ? 'corn' : idx % 3 === 1 ? 'wheat' : 'corn'}
              growthStage={0}
              animate={!isHarvesting}
            />
          </div>
        ))}
      </div>

      {/* Tractor */}
      {showTractor && <Tractor speed={3} direction="right" />}
    </div>
  );
}
