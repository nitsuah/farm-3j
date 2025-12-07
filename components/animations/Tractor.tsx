'use client';

import { useEffect, useRef, useState } from 'react';

interface TractorProps {
  speed?: number;
  direction?: 'left' | 'right';
  onPositionChange?: (position: number) => void;
}

export function Tractor({
  speed = 5,
  direction = 'right',
  onPositionChange,
}: TractorProps) {
  const [position, setPosition] = useState(direction === 'right' ? -10 : 110);
  const onPositionChangeRef = useRef(onPositionChange);

  // Keep ref updated
  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        const newPos =
          direction === 'right'
            ? prev >= 110
              ? -10
              : prev + 1
            : prev <= -10
              ? 110
              : prev - 1;
        return newPos;
      });
    }, 100 / speed);

    return () => clearInterval(interval);
  }, [speed, direction]);

  // Report position changes in separate effect
  useEffect(() => {
    if (onPositionChangeRef.current) {
      onPositionChangeRef.current(position);
    }
  }, [position]);

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
