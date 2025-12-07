'use client';

import { useEffect, useState } from 'react';
import { Crop } from './Crop';
import { Tractor } from './Tractor';

export function HeaderCropRow() {
  const [showTractor, setShowTractor] = useState(false);
  const [tractorPosition, setTractorPosition] = useState(-10);
  const [harvestedCrops, setHarvestedCrops] = useState<Set>(new Set());

  // Define 10 rows with different depths (scale and opacity for perspective)
  const rows = Array.from({ length: 10 }, (_, rowIdx) => ({
    depth: rowIdx,
    bottom: 8 + rowIdx * 6, // Stack rows vertically
    scale: 0.4 + rowIdx * 0.06, // Smaller in back, larger in front
    opacity: 0.3 + rowIdx * 0.07, // Dimmer in back, brighter in front
    cropCount: 20,
  }));

  useEffect(() => {
    // Show tractor after crops are fully grown (8 seconds)
    const tractorTimer = setTimeout(() => {
      setShowTractor(true);
    }, 8000);

    return () => clearTimeout(tractorTimer);
  }, []);

  useEffect(() => {
    if (showTractor) {
      // Reset after harvest complete (10 seconds for tractor to cross)
      const resetTimer = setTimeout(() => {
        setShowTractor(false);
        setHarvestedCrops(new Set());
        setTractorPosition(-10);
      }, 10000);

      return () => clearTimeout(resetTimer);
    }
  }, [showTractor]);

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
      {/* Ground/Soil */}
      <div className="absolute right-0 bottom-0 left-0 h-16 bg-amber-800 dark:bg-amber-950" />

      {/* Multiple rows of crops at different depths */}
      {rows.map(row => (
        <div
          key={row.depth}
          className="absolute right-0 left-0 flex justify-around px-4"
          style={{
            bottom: `${row.bottom}px`,
            opacity: row.opacity,
          }}
        >
          {Array.from({ length: row.cropCount }).map((_, cropIdx) => {
            const isHarvested =
              showTractor && isCropHarvested(row.depth, cropIdx);
            const cropKey = `${row.depth}-${cropIdx}`;

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
