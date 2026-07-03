// Shared entity/state types for the RTS mode, split out of RTSMap.tsx.

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  createdAt: number;
}
export type TileType = 'grass' | 'dirt' | 'water' | 'tree' | 'rock';

export interface WorkerState {
  id: number;
  x: number;
  y: number;
  selected: boolean;
  movingTo: null | { x: number; y: number };
  path: { x: number; y: number }[];
  gathering: null | { type: 'tree' | 'gold' | 'stone'; idx: number };
  attacking:
    | null
    | { targetType: 'enemyBarn' }
    | { targetType: 'grunt'; gruntId: number }
    | { targetType: 'creep'; creepId: number }
    | { targetType: 'enemyTower'; towerId: number }
    | { targetType: 'enemyWall'; wallId: number }
    | { targetType: 'siege'; siegeId: number }
    | { targetType: 'shaman'; shamanId: number }
    | { targetType: 'troll'; trollId: number }
    | { targetType: 'sapper'; sapperId: number }
    | { targetType: 'necromancer'; necromancerId: number }
    | { targetType: 'witchDoctor'; witchDoctorId: number }
    | { targetType: 'warchief'; warchiefId: number };
  stunUntil?: number;
  assistBuildId?: number;
  repairing: null | { buildingId: number };
  chargeCooldown: number;
  sprintCooldown: number;
  sprinting: boolean;
  waypoints: { x: number; y: number }[];
  attackMove: boolean;
  attackMoveTarget: { x: number; y: number } | null;
  carrying: { gold: number; lumber: number; stone: number };
  state:
    | 'idle'
    | 'moving'
    | 'gathering'
    | 'returning'
    | 'attacking'
    | 'repairing';
  group: number | null;
  hp: number;
  maxHp: number;
  patrol: {
    a: { x: number; y: number };
    b: { x: number; y: number };
    heading: 'a' | 'b';
  } | null;
  holdPosition: boolean;
  unitType:
    | 'farmer'
    | 'swordsman'
    | 'hero'
    | 'catapult'
    | 'cavalry'
    | 'trebuchet';
  xp: number;
  level: number;
}

export interface Upgrades {
  sharperTools: number;
  swiftHarvest: number;
  ironWill: number;
}

export type UnitType =
  | 'farmer'
  | 'swordsman'
  | 'hero'
  | 'catapult'
  | 'cavalry'
  | 'trebuchet';

export type HeroItemId =
  | 'boots_speed'
  | 'battle_sword'
  | 'shield_pendant'
  | 'healing_potion'
  | 'tome_xp';
export interface HeroItem {
  id: number;
  itemId: HeroItemId;
}
export interface DroppedItem {
  id: number;
  itemId: HeroItemId;
  x: number;
  y: number;
}

export type BuildingType =
  | 'farmhouse'
  | 'lumberShed'
  | 'watchtower'
  | 'wall'
  | 'windmill'
  | 'barracks'
  | 'siegeWorkshop'
  | 'market'
  | 'blacksmith'
  | 'granary'
  | 'stable'
  | 'spikeTrap'
  | 'frostTower'
  | 'ballista'
  | 'poisonTower'
  | 'supplyStore'
  | 'miningCamp';

export interface ResourceNode {
  x: number;
  y: number;
  amount: number;
}
export interface Resources {
  gold: number;
  lumber: number;
  stone: number;
  food: number;
  foodCap: number;
}
export interface PlacedBuilding {
  id: number;
  type: BuildingType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  upgraded?: boolean;
  constructing?: boolean;
  constructedAt?: number;
}

export interface EnemyGrunt {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movingTo: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  state: 'moving' | 'attacking';
  isBoss?: boolean;
  isSkeleton?: boolean;
  frozenUntil?: number;
  enragedUntil?: number;
  poisonedUntil?: number;
  poisonDps?: number;
}

export interface EnemyTower {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
}

export interface EnemySiege {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movingTo: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  state: 'moving' | 'attacking';
  targetBuildingId: number | null;
  siegeType?: 'ram' | 'demolisher';
}

export interface LootCrate {
  id: number;
  x: number;
  y: number;
  gold: number;
  lumber: number;
  stone: number;
}

export interface EnemyShaman {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movingTo: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  state: 'moving' | 'healing';
}

export interface EnemyNecromancer {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movingTo: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  state: 'moving' | 'raising';
}
export interface EnemyWitchDoctor {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movingTo: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  state: 'moving' | 'casting';
}

export interface EnemyTroll {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movingTo: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  state: 'moving' | 'attacking' | 'kiting';
  targetType: 'worker' | 'building' | 'barn';
  targetId: number | null;
}

export interface EnemySapper {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movingTo: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  targetX: number;
  targetY: number;
  exploded: boolean;
}

export interface EnemyWarchief {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movingTo: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  state: 'moving' | 'attacking' | 'stomping';
  lastStompAt: number;
}

export interface NeutralCreep {
  id: number;
  campId: number;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  hp: number;
  maxHp: number;
  state: 'idle' | 'chasing' | 'returning';
  targetWorkerId: number | null;
}

// Projectile system — flying arrows/rocks/ice bolts (SVG-space coordinates)
export interface Projectile {
  id: number;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
  type: 'arrow' | 'bolt' | 'rock' | 'ice' | 'poison';
  createdAt: number;
  duration: number;
}

// ---------- Save / Load ----------
export interface HighScoreEntry {
  wave: number;
  kills: number;
  result: 'victory' | 'defeat';
  gold: number;
  time: number;
  date: string;
}

export interface SaveWorker {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  unitType: UnitType;
  group: number | null;
  xp?: number;
  level?: number;
  gathering?: { type: 'tree' | 'gold' | 'stone'; idx: number } | null;
  state?: string;
}
export interface SaveData {
  version: 1 | 2;
  resources: Resources;
  workers: SaveWorker[];
  trees: ResourceNode[];
  goldMines: ResourceNode[];
  goldMine?: ResourceNode; // legacy — migrated to goldMines on load
  stoneNodes: ResourceNode[];
  placedBuildings: PlacedBuilding[];
  buildingNextId: number;
  farmhouse: { built: boolean; level: number };
  upgrades: Upgrades;
  wave: number;
  killCount: number;
  totalGold: number;
  totalLumber: number;
  totalStone: number;
  playerBarnHp: number;
  enemyBarnHp: number;
  rallyPoint: { x: number; y: number } | null;
  fogExplored: boolean[][];
  guardTowerResearched?: boolean;
  barracksTech?: { veteranTraining: boolean; warDrums: boolean };
  blacksmithUpgrades?: { steelEdge: number; ironHide: number };
}
