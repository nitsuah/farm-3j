import { Entity } from './types';
import { GAME_CONFIG } from './constants';

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

// Update animal needs (hunger and happiness)
export function updateAnimalNeeds(
  entity: Entity,
  currentTime: number
): Partial | null {
  // Only update animals, not structures
  const animalTypes = ['cow', 'chicken', 'pig', 'sheep'];
  if (!animalTypes.includes(entity.type)) {
    return null;
  }

  // Initialize needs if not set
  const hunger = entity.hunger ?? 0;
  const happiness = entity.happiness ?? 100;
  const lastNeedUpdate = entity.lastNeedUpdate ?? currentTime;

  // Calculate time elapsed in game hours
  const hoursElapsed = currentTime - lastNeedUpdate;

  // Only update if enough time has passed (0.1 game hours = 1 second real time)
  if (hoursElapsed < 0.1) {
    return null;
  }

  // Update hunger (increases over time)
  let newHunger = Math.min(
    100,
    hunger + GAME_CONFIG.HUNGER_INCREASE_PER_HOUR * hoursElapsed
  );

  // Update happiness (decreases over time, more so if hungry)
  let happinessDecay = GAME_CONFIG.HAPPINESS_DECREASE_PER_HOUR * hoursElapsed;
  if (newHunger > GAME_CONFIG.HUNGER_UNHAPPY_THRESHOLD) {
    happinessDecay *= 2; // Unhappy animals lose happiness faster
  }
  let newHappiness = Math.max(0, happiness - happinessDecay);

  return {
    hunger: Number(newHunger.toFixed(1)),
    happiness: Number(newHappiness.toFixed(1)),
    lastNeedUpdate: currentTime,
  };
}

// Find nearest trough with food
export function findNearestTrough(
  animal: Entity,
  troughs: Entity[]
): Entity | null {
  const troughsWithFood = troughs.filter(
    t => t.type === 'trough' && (t.foodLevel ?? 0) > 0
  );

  if (troughsWithFood.length === 0) return null;

  let nearest: Entity | null = null;
  let minDistance = Infinity;

  for (const trough of troughsWithFood) {
    const distance = getDistance(animal, trough);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = trough;
    }
  }

  return nearest;
}

// Check if animal can feed from trough
export function canFeedFromTrough(animal: Entity, trough: Entity): boolean {
  const distance = getDistance(animal, trough);
  return distance < GAME_CONFIG.FEEDING_DISTANCE && (trough.foodLevel ?? 0) > 0;
}

// Feed animal from trough
export function feedAnimal(
  animal: Entity,
  trough: Entity
): { animal: Partial; trough: Partial } | null {
  if (!canFeedFromTrough(animal, trough)) return null;

  const currentHunger = animal.hunger ?? 0;
  const currentFood = trough.foodLevel ?? 0;

  // Reduce hunger
  const newHunger = Math.max(0, currentHunger - GAME_CONFIG.FEEDING_RATE);

  // Consume food from trough
  const foodConsumed = Math.min(GAME_CONFIG.FEEDING_RATE, currentFood);
  const newFoodLevel = currentFood - foodConsumed;

  // Increase happiness when feeding
  const currentHappiness = animal.happiness ?? 100;
  const newHappiness = Math.min(100, currentHappiness + 10);

  return {
    animal: {
      hunger: Number(newHunger.toFixed(1)),
      happiness: Number(newHappiness.toFixed(1)),
      isFeeding: true,
    },
    trough: {
      foodLevel: Number(newFoodLevel.toFixed(1)),
    },
  };
}
