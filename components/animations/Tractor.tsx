'use client';

import { useEffect, useState } from 'react';

interface TractorProps {
  speed?: number;
  direction?: 'left' | 'right';
}

export function Tractor({ speed = 5, direction = 'right' }: TractorProps) {
  const [position, setPosition] = useState(direction === 'right' ? -10 : 110);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        if (direction === 'right') {
          return prev >= 110 ? -10 : prev + 1;
        } else {
          return prev <= -10 ? 110 : prev - 1;
        }
      });
    }, 100 / speed);

    return () => clearInterval(interval);
  }, [speed, direction]);

  return (
    <div
      className="absolute text-4xl transition-transform"
      style={{
        left: `${position}%`,
        bottom: '10%',
        transform: direction === 'right' ? 'scaleX(-1)' : 'none',
      }}
    >
      🚜
    </div>
  );
}
