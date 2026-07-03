// A* pathfinding on the isometric tile grid.

import { GRID_SIZE } from './constants';
import type { TileType } from './types';

/** A* pathfinding on isometric tile grid. Returns waypoints excluding start, including goal. */
export function aStar(
  tiles: TileType[][],
  start: { x: number; y: number },
  goal: { x: number; y: number },
  allowPassThroughGoal = true,
  extraBlocked?: Set<string>
): { x: number; y: number }[] {
  const isPassable = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return false;
    if (x === goal.x && y === goal.y && allowPassThroughGoal) return true;
    if (extraBlocked?.has(`${x},${y}`)) return false;
    return tiles[x]?.[y] !== 'water';
  };

  type Node = {
    x: number;
    y: number;
    g: number;
    f: number;
    parent: Node | null;
  };
  const key = (x: number, y: number) => `${x},${y}`;
  const h = (x: number, y: number) =>
    Math.abs(x - goal.x) + Math.abs(y - goal.y);

  const open = new Map<string, Node>();
  const closed = new Set<string>();
  open.set(key(start.x, start.y), {
    x: start.x,
    y: start.y,
    g: 0,
    f: h(start.x, start.y),
    parent: null,
  });

  while (open.size > 0) {
    let current: Node | null = null;
    for (const n of open.values()) {
      if (!current || n.f < current.f) current = n;
    }
    if (!current) break;
    if (current.x === goal.x && current.y === goal.y) {
      const path: { x: number; y: number }[] = [];
      let n: Node | null = current;
      while (n) {
        path.unshift({ x: n.x, y: n.y });
        n = n.parent;
      }
      return path.slice(1);
    }
    open.delete(key(current.x, current.y));
    closed.add(key(current.x, current.y));
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: -1 },
    ];
    for (const { dx, dy } of dirs) {
      const nx = current.x + dx,
        ny = current.y + dy;
      if (!isPassable(nx, ny) || closed.has(key(nx, ny))) continue;
      const g = current.g + (dx !== 0 && dy !== 0 ? 1.414 : 1);
      const ex = open.get(key(nx, ny));
      if (!ex || g < ex.g)
        open.set(key(nx, ny), {
          x: nx,
          y: ny,
          g,
          f: g + h(nx, ny),
          parent: current,
        });
    }
  }
  return [goal]; // no path: go direct
}
