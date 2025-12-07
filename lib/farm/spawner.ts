import { Entity, EntityType } from './types';

let entityCounter = 0;

function generateId(type: EntityType): string {
  return `${type}-${Date.now()}-${entityCounter++}`;
}

// Random spawn position within safe bounds (avoiding edges and barn)
function getRandomSpawnPosition(): { x: number; y: number } {
  const x = 15 + Math.random() * 70; // 15-85% range
  const y = 20 + Math.random() * 60; // 20-80% range
  return { x, y };
}

export function spawnAnimal(type: 'cow' | 'chicken' | 'pig' | 'sheep'): Entity {
  const { x, y } = getRandomSpawnPosition();

  const velocities = {
    cow: 0.5,
    chicken: 1.2,
    pig: 0.7,
    sheep: 0.8,
  };

  return {
    id: generateId(type),
    type,
    x,
    y,
    velocity: velocities[type],
    direction: Math.random() * Math.PI * 2, // Random initial direction
    lastUpdate: Date.now(),
    lastProduced: Date.now(),
    inventory: 0,
    hunger: 0, // Start with no hunger
    happiness: 100, // Start fully happy
    lastNeedUpdate: Date.now(),
  };
}

export function spawnStatic(
  type: 'barn' | 'fence' | 'pond',
  x: number,
  y: number
): Entity {
  return {
    id: generateId(type),
    type,
    x,
    y,
    width: type === 'barn' ? 200 : type === 'pond' ? 150 : 100,
    height: type === 'barn' ? 180 : type === 'pond' ? 100 : 20,
  };
}
