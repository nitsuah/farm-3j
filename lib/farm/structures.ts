import { Entity } from './types';
import { gridToPercent } from './isometric';

/**
 * Create a fence entity at the specified grid position
 */
export function createFence(
  gridX: number,
  gridY: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
): Entity {
  const { x, y } = gridToPercent(gridX, gridY);

  return {
    id: `fence-${gridX}-${gridY}-${Date.now()}`,
    type: 'fence',
    x,
    y,
    gridX,
    gridY,
    health: 100,
    orientation,
    width: orientation === 'horizontal' ? 60 : 10,
    height: orientation === 'horizontal' ? 10 : 60,
  };
}

/**
 * Create a trough (feeding station) entity
 */
export function createTrough(gridX: number, gridY: number): Entity {
  const { x, y } = gridToPercent(gridX, gridY);

  return {
    id: `trough-${gridX}-${gridY}-${Date.now()}`,
    type: 'trough',
    x,
    y,
    gridX,
    gridY,
    width: 40,
    height: 30,
  };
}

/**
 * Create initial fence perimeter around the farm
 */
export function createFencePerimeter(): Entity[] {
  const fences: Entity[] = [];

  // Top fence (horizontal)
  for (let x = 2; x <= 17; x++) {
    fences.push(createFence(x, 2, 'horizontal'));
  }

  // Bottom fence (horizontal)
  for (let x = 2; x <= 17; x++) {
    fences.push(createFence(x, 17, 'horizontal'));
  }

  // Left fence (vertical)
  for (let y = 3; y <= 16; y++) {
    fences.push(createFence(2, y, 'vertical'));
  }

  // Right fence (vertical)
  for (let y = 3; y <= 16; y++) {
    fences.push(createFence(17, y, 'vertical'));
  }

  return fences;
}
