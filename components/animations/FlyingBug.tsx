'use client';

import { useEffect, useState } from 'react';

interface FlyingBugProps {
  type?: 'bee' | 'butterfly' | 'bird';
}

export function FlyingBug({ type = 'bee' }: FlyingBugProps) {
  const [position, setPosition] = useState({ x: 10, y: 30 });
  const [direction, setDirection] = useState({ x: 1, y: 0.5 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        let newX = prev.x + direction.x;
        let newY = prev.y + direction.y;
        let newDir = { ...direction };

        // Bounce off edges
        if (newX > 90 || newX < 10) {
          newDir.x = -direction.x;
        }
        if (newY > 70 || newY < 10) {
          newDir.y = -direction.y;
        }

        setDirection(newDir);

        return {
          x: Math.max(10, Math.min(90, newX)),
          y: Math.max(10, Math.min(70, newY)),
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [direction]);

  const getEmoji = () => {
    if (type === 'bee') return '🐝';
    if (type === 'butterfly') return '🦋';
    if (type === 'bird') return '🐦';
    return '🐝';
  };

  return (
    <div
      className="absolute text-2xl transition-all duration-100"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: direction.x > 0 ? 'scaleX(1)' : 'scaleX(-1)',
      }}
    >
      {getEmoji()}
    </div>
  );
}
