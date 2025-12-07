// Core entity types for Farm Tycoon simulation

export type EntityType = 'cow' | 'chicken' | 'pig' | 'sheep' | 'barn' | 'fence' | 'pond';

export interface Entity {
  id: string;
  type: EntityType;
  x: number; // Position in pixels or percentage
  y: number;
  width?: number;
  height?: number;
  velocity?: number; // Movement speed for animated entities
  direction?: number; // Angle in radians for movement
  lastUpdate?: number; // Timestamp for animation frame tracking
}

export interface FarmState {
  entities: Entity[];
  money: number;
  day: number;
  time: number; // Time of day (0-24)
  fenceHealth: number;
  animalHealth: number;
  isPaused: boolean;
}

export type FarmAction =
  | { type: 'SPAWN_ANIMAL'; payload: Entity }
  | { type: 'SPAWN_STATIC'; payload: Entity }
  | { type: 'UPDATE_POSITION'; payload: { id: string; x: number; y: number; direction?: number } }
  | { type: 'REMOVE_ENTITY'; payload: string }
  | { type: 'UPDATE_STATS'; payload: Partial<FarmState> }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'BATCH_UPDATE_POSITIONS'; payload: Array<{ id: string; x: number; y: number; direction?: number }> };
