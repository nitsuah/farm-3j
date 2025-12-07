import { Entity } from './types';

// Grid system constants
export const GRID_SIZE = 20; // 20x20 grid
export const CELL_SIZE = 5; // Each cell is 5% of canvas

// Convert percentage coordinates to grid coordinates
export function toGridCoords(
  x: number,
  y: number
): { gridX: number; gridY: number } {
  return {
    gridX: Math.floor(x / CELL_SIZE),
    gridY: Math.floor(y / CELL_SIZE),
  };
}

// Convert grid coordinates to percentage coordinates
export function toPercentCoords(
  gridX: number,
  gridY: number
): { x: number; y: number } {
  return {
    x: gridX * CELL_SIZE + CELL_SIZE / 2,
    y: gridY * CELL_SIZE + CELL_SIZE / 2,
  };
}

// Check if position is within valid bounds
export function isInBounds(x: number, y: number): boolean {
  return x >= 5 && x <= 95 && y >= 5 && y <= 95;
}

// Calculate distance between two entities
export function getDistance(entity1: Entity, entity2: Entity): number {
  const dx = entity1.x - entity2.x;
  const dy = entity1.y - entity2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Check collision between two entities
export function checkCollision(
  entity1: Entity,
  entity2: Entity,
  threshold: number = 5
): boolean {
  return getDistance(entity1, entity2) < threshold;
}

// Simple pathfinding - move towards target
export function moveTowards(
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
  speed: number
): { x: number; y: number; direction: number } {
  const dx = targetX - currentX;
  const dy = targetY - currentY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < speed) {
    return { x: targetX, y: targetY, direction: Math.atan2(dy, dx) };
  }

  const direction = Math.atan2(dy, dx);
  return {
    x: currentX + (dx / distance) * speed,
    y: currentY + (dy / distance) * speed,
    direction,
  };
}

// Wander behavior - random movement with occasional direction changes
export function wander(
  x: number,
  y: number,
  direction: number,
  velocity: number,
  deltaTime: number
): { x: number; y: number; direction: number } {
  let newDirection = direction;

  // Random direction change (5% chance per frame)
  if (Math.random() < 0.05) {
    newDirection += (Math.random() - 0.5) * Math.PI * 0.5;
  }

  // Move in current direction
  let newX = x + Math.cos(newDirection) * velocity * deltaTime * 10;
  let newY = y + Math.sin(newDirection) * velocity * deltaTime * 10;

  // Bounce off boundaries
  if (newX < 5 || newX > 95) {
    newDirection = Math.PI - newDirection;
    newX = Math.max(5, Math.min(95, newX));
  }
  if (newY < 5 || newY > 95) {
    newDirection = -newDirection;
    newY = Math.max(5, Math.min(95, newY));
  }

  return {
    x: Number(newX.toFixed(2)),
    y: Number(newY.toFixed(2)),
    direction: newDirection,
  };
}

// Time progression
export function updateTime(currentTime: number, deltaTime: number): number {
  const timeSpeed = 0.1; // Game time moves 0.1 hours per second
  let newTime = currentTime + timeSpeed * deltaTime;
  if (newTime >= 24) {
    newTime = 0; // Reset to midnight
  }
  return Number(newTime.toFixed(2));
}

// Day progression
export function shouldAdvanceDay(oldTime: number, newTime: number): boolean {
  return oldTime > newTime; // Wrapped around midnight
}
