import React from 'react';

interface StructureFireEffectProps {
  cx: number;
  cy: number;
  labelText?: string;
  labelColor?: string;
  labelY?: number;
}

export const StructureFireEffect: React.FC<StructureFireEffectProps> = ({
  cx,
  cy,
  labelText,
  labelColor = '#ef4444',
  labelY,
}) => (
  <g pointerEvents="none">
    <ellipse cx={cx} cy={cy - 4} rx={9} ry={6} fill="#f97316" opacity={0.85} />
    <ellipse cx={cx - 5} cy={cy - 2} rx={5} ry={4} fill="#dc2626" opacity={0.75} />
    <ellipse cx={cx + 5} cy={cy - 2} rx={5} ry={4} fill="#ef4444" opacity={0.7} />
    <ellipse cx={cx} cy={cy - 14} rx={5} ry={10} fill="#fbbf24" opacity={0.9} />
    <ellipse cx={cx} cy={cy - 18} rx={3} ry={6} fill="#fef08a" opacity={0.8} />
    {labelText && labelY !== undefined && (
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        fontSize="11"
        fill={labelColor}
        fontWeight="bold"
      >
        {labelText}
      </text>
    )}
  </g>
);
