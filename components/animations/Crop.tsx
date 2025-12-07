'use client';

import { useEffect, useState } from 'react';

interface CropProps {
  type?: 'corn' | 'wheat' | 'carrot';
  growthStage?: number; // 0-3
  animate?: boolean;
}

export function Crop({
  type = 'corn',
  growthStage = 3,
  animate = true,
}: CropProps) {
  const [stage, setStage] = useState(growthStage);

  useEffect(() => {
    if (!animate) return;

    const interval = setInterval(() => {
      setStage(prev => (prev < 3 ? prev + 1 : prev));
    }, 2000);

    return () => clearInterval(interval);
  }, [animate]);

  const getEmoji = () => {
    if (type === 'corn') return stage >= 2 ? '🌽' : '🌱';
    if (type === 'wheat') return stage >= 2 ? '🌾' : '🌱';
    if (type === 'carrot') return stage >= 2 ? '🥕' : '🌱';
    return '🌱';
  };

  return (
    <div
      className="inline-block transition-all duration-500"
      style={{
        transform: `scale(${0.5 + stage * 0.17})`,
        opacity: 0.6 + stage * 0.1,
      }}
    >
      {getEmoji()}
    </div>
  );
}
