import React from 'react';

import { TILE_SIZE } from '../game/constants';

/**
 * Render a 3-face isometric box (left wall, right wall, roof).
 * isoX/isoY are the tile's top-corner in SVG space (from tileToSvg).
 * h is the height of the box in pixels above the tile.
 */
export function isoBox(
  isoX: number,
  isoY: number,
  h: number,
  topFill: string,
  leftFill: string,
  rightFill: string,
  stroke: string,
  sw = 1.5
): React.ReactNode {
  const ts = TILE_SIZE;
  const lx = isoX,
    ly = isoY + ts / 2;
  const rx = isoX + 2 * ts,
    ry = isoY + ts / 2;
  const bx = isoX + ts,
    by = isoY + ts;
  const tx2 = isoX + ts,
    ty2 = isoY;
  return (
    <>
      <polygon
        points={`${lx},${ly - h} ${bx},${by - h} ${bx},${by} ${lx},${ly}`}
        fill={leftFill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <polygon
        points={`${bx},${by - h} ${rx},${ry - h} ${rx},${ry} ${bx},${by}`}
        fill={rightFill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <polygon
        points={`${lx},${ly - h} ${tx2},${ty2 - h} ${rx},${ry - h} ${bx},${by - h}`}
        fill={topFill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </>
  );
}
