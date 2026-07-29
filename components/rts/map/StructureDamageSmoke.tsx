import React from 'react';

interface StructureDamageSmokeProps {
  cx: number;
  cy: number;
  t: number;
  colors?: [string, string, string];
  opacities?: [number, number, number];
}

export const StructureDamageSmoke: React.FC<StructureDamageSmokeProps> = ({
  cx,
  cy,
  t,
  colors = ['#374151', '#4b5563', '#1f2937'],
  opacities = [0.55, 0.4, 0.25],
}) => (
  <g pointerEvents="none">
    <circle
      cx={cx - 8}
      cy={cy - 18 - Math.sin(t) * 4}
      r={6}
      fill={colors[0]}
      opacity={opacities[0]}
    />
    <circle
      cx={cx + 6}
      cy={cy - 28 - Math.sin(t + 1) * 5}
      r={5}
      fill={colors[1]}
      opacity={opacities[1]}
    />
    <circle
      cx={cx}
      cy={cy - 38 - Math.sin(t + 2) * 3}
      r={4}
      fill={colors[2]}
      opacity={opacities[2]}
    />
  </g>
);
