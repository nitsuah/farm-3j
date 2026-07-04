// Tile map generation, isometric coordinate conversion, and visibility helpers.

import { GRID_SIZE, TILE_SIZE } from './constants';
import type { TileType } from './types';

export function makeTiles(): TileType[][] {
  return Array.from({ length: GRID_SIZE }, (_, i) =>
    Array.from({ length: GRID_SIZE }, (_, j) => {
      // Water lakes — player corner, enemy corner, two flanks
      if (i >= 0 && i <= 2 && j >= 6 && j <= 9) return 'water';
      if (i >= 6 && i <= 9 && j >= 0 && j <= 2) return 'water';
      if (i >= 22 && i <= 24 && j >= 14 && j <= 17) return 'water';
      if (i >= 14 && i <= 17 && j >= 22 && j <= 24) return 'water';
      // Mid-map lakes (two flanks)
      if (i >= 10 && i <= 12 && j >= 10 && j <= 12) return 'water';
      if (i >= 18 && i <= 20 && j >= 5 && j <= 7) return 'water';
      if (i >= 5 && i <= 7 && j >= 18 && j <= 20) return 'water';
      // Tree clusters (decorative / harvestable backdrop)
      if ((i === 7 || i === 8) && (j === 13 || j === 14)) return 'tree';
      if ((i === 13 || i === 14) && (j === 7 || j === 8)) return 'tree';
      if ((i === 4 || i === 5) && (j === 19 || j === 20)) return 'tree';
      if ((i === 19 || i === 20) && (j === 4 || j === 5)) return 'tree';
      if ((i === 15 || i === 16) && (j === 15 || j === 16)) return 'tree';
      if ((i === 21 || i === 22) && (j === 9 || j === 10)) return 'tree';
      if ((i === 9 || i === 10) && (j === 21 || j === 22)) return 'tree';
      // Rock clusters (decorative)
      if ((i === 11 || i === 12) && (j === 6 || j === 7)) return 'rock';
      if ((i === 6 || i === 7) && (j === 11 || j === 12)) return 'rock';
      if ((i === 17 || i === 18) && (j === 13 || j === 14)) return 'rock';
      if ((i === 13 || i === 14) && (j === 17 || j === 18)) return 'rock';
      if ((i === 21 || i === 22) && (j === 17 || j === 18)) return 'rock';
      if ((i === 17 || i === 18) && (j === 21 || j === 22)) return 'rock';
      // Dirt paths crossing the map (two axes + diagonal)
      if (j === 8 || i === 12 || (i === j && i >= 4 && i <= 20)) return 'dirt';
      return 'grass';
    })
  );
}

export function tileToSvg(tx: number, ty: number) {
  const isoX = (tx - ty) * TILE_SIZE + (GRID_SIZE * TILE_SIZE) / 2 + TILE_SIZE;
  const isoY = ((tx + ty) * TILE_SIZE) / 2 + TILE_SIZE / 2;
  return { isoX, isoY };
}

export function svgToTile(svgX: number, svgY: number) {
  const A = (svgX - ((GRID_SIZE * TILE_SIZE) / 2 + TILE_SIZE)) / TILE_SIZE;
  const B = ((svgY - TILE_SIZE / 2) * 2) / TILE_SIZE;
  return { tx: Math.round((A + B) / 2), ty: Math.round((B - A) / 2) };
}

export function tileDist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

export function computeVisible(
  sources: { x: number; y: number; r: number }[]
): boolean[][] {
  const grid = Array.from(
    { length: GRID_SIZE },
    () => Array(GRID_SIZE).fill(false) as boolean[]
  );
  for (const src of sources) {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (tileDist(src.x, src.y, i, j) <= src.r) grid[i]![j] = true;
      }
    }
  }
  return grid;
}

export const INITIAL_TILES = makeTiles();
