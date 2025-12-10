'use client';

import { Crop } from './Crop';
import { Tractor } from './Tractor';

interface CornfieldProps {
  rows?: number;
  cols?: number;
  withTractor?: boolean;
}

export function Cornfield({
  rows = 4,
  cols = 8,
  withTractor = true,
}: CornfieldProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Wind effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="animate-pulse">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex justify-around py-2">
              {Array.from({ length: cols }).map((_, colIdx) => (
                <Crop
                  key={colIdx}
                  type="corn"
                  growthStage={3}
                  animate={false}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Growing crops */}
      <div className="absolute inset-0">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex justify-around py-2">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <Crop
                key={colIdx}
                type={
                  colIdx % 3 === 0
                    ? 'corn'
                    : colIdx % 3 === 1
                      ? 'wheat'
                      : 'corn'
                }
                growthStage={Math.floor(Math.random() * 4)}
                animate={true}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tractor */}
      {withTractor && <Tractor speed={3} direction="right" />}
    </div>
  );
}
