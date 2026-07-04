import React from 'react';

interface HpBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  hpPct: number;
  fill: string;
  rx?: number;
}

export const HpBar: React.FC<HpBarProps> = ({ x, y, width, height, hpPct, fill, rx = 2 }) => (
  <>
    <rect x={x} y={y} width={width} height={height} fill="#1e293b" rx={rx} />
    <rect x={x} y={y} width={width * hpPct} height={height} fill={fill} rx={rx} />
  </>
);
