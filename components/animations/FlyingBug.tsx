'use client';

import { useEffect, useState } from 'react';

interface FlyingBugProps {
  type?: 'bee' | 'butterfly' | 'bird';
  startX?: number;
  startY?: number;
}

export function FlyingBug({
  type = 'bee',
  startX = 50,
  startY = 30,
}: FlyingBugProps) {
  const [position, setPosition] = useState({
    x: startX,
    y: startY,
  });
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        let newAngle = angle;

        // Different movement patterns based on type
        if (type === 'butterfly') {
          // Erratic zigzag pattern
          newAngle += (Math.random() - 0.5) * 0.5;
        } else if (type === 'bee') {
          // Figure-8 pattern
          newAngle += 0.1;
        } else {
          // Smooth curved flight
          newAngle += 0.05;
        }

        const speed = type === 'butterfly' ? 1.5 : type === 'bee' ? 2 : 1;
        let newX = prev.x + Math.cos(newAngle) * speed;
        let newY = prev.y + Math.sin(newAngle) * speed * 0.5; // Less vertical movement

        // Bounce off edges with angle change
        if (newX > 90 || newX < 10) {
          newAngle = Math.PI - newAngle;
          newX = Math.max(10, Math.min(90, newX));
        }
        if (newY > 80 || newY < 50) {
          newAngle = -newAngle;
          newY = Math.max(50, Math.min(80, newY));
        }

        setAngle(newAngle);

        return {
          x: newX,
          y: newY,
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [angle, type]);

  const getEmoji = () => {
    if (type === 'bee') return '🐝';
    if (type === 'butterfly') return '🦋';
    if (type === 'bird') return '🐦';
    return '🐝';
  };

  return (
    <div
      className="absolute text-sm transition-all duration-100"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: Math.cos(angle) > 0 ? 'scaleX(1)' : 'scaleX(-1)',
      }}
    >
      {getEmoji()}
    </div>
  );
}
