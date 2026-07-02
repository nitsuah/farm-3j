'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { RTSUI, WorkerState, Upgrades, UPGRADE_COSTS, UPGRADE_MAX } from './RTSUI';

const GRID_SIZE = 17;
const TILE_SIZE = 64;
const WORKER_SPEED = 1.5;
const GRUNT_SPEED = 0.8;
const GATHER_INTERVAL_MS = 900;
const CARRY_CAP = 10;
const FOOD_CAP_BASE = 5;
const FOOD_CAP_PER_LEVEL = 5;
const WORKER_VISION = 3.5;
const BARN_VISION = 5;
const WATCHTOWER_VISION = 7;
const WATCHTOWER_ATTACK_RANGE = 5;
const WATCHTOWER_DAMAGE = 8;
const WATCHTOWER_ATTACK_MS = 2000;
const ENEMY_BARN_POS = { x: 14, y: 14 };
const ENEMY_BARN_MAX_HP = 200;
const PLAYER_BARN_MAX_HP = 300;
const ATTACK_DAMAGE = 15;
const ATTACK_INTERVAL_MS = 1200;
const ENEMY_COUNTER_DAMAGE = 8;
const WORKER_MAX_HP = 50;
const GRUNT_MAX_HP = 60;
const GRUNT_DAMAGE = 12;
const GRUNT_ATTACK_MS = 1500;
const BOSS_HP_MULTIPLIER = 3;
const BOSS_DAMAGE = 25;
const BOSS_GOLD_REWARD = 20;
const BOSS_XP_REWARD = 80;
const GRUNT_SPAWN_MS = 40000;
const REPAIR_INTERVAL_MS = 2000;
const REPAIR_AMOUNT = 2;
const REPAIR_RADIUS = 3;
const GARRISON_CAP = 5;
const GARRISON_HEAL_MS = 1000;
const GARRISON_HEAL_AMOUNT = 5;
const GARRISON_ARMOR_PER_UNIT = 2;
const HERO_MAX_HP = 150;
const HERO_DAMAGE_BONUS = 20;
const HERO_ABILITY_RADIUS = 3.5;
const HERO_ABILITY_DAMAGE = 30;
const HERO_ABILITY_COOLDOWN_S = 25;
const HERO_SHOUT_RADIUS = 4.0;
const HERO_SHOUT_DURATION_MS = 8000;
const HERO_SHOUT_COOLDOWN_S = 30;
const HERO_SHOUT_ATK_MULT = 0.6; // 40% faster attack (0.6× interval)
const CATAPULT_MAX_HP = 60;
const CATAPULT_SPEED = 0.45;
const CATAPULT_RANGE = 6;
const CATAPULT_DAMAGE = 22;
const CATAPULT_SPLASH_RANGE = 1.5;
const CATAPULT_SPLASH_DAMAGE = 11;
const CATAPULT_FIRE_MS = 3500;
const XP_PER_KILL = 40;
const XP_TO_LEVEL_1 = 40;
const XP_TO_LEVEL_2 = 120;
const VETERAN_HP_BONUS = 10;
const VETERAN_ATK_BONUS = 5;
const ARCHER_TOWER_POS = { x: 12, y: 13 };
const ARCHER_TOWER_RANGE = 4;
const ARCHER_TOWER_DAMAGE = 10;
const ENEMY_TOWER_SPAWN_WAVES = [5, 10, 15] as const;
const ENEMY_TOWER_POSITIONS = [{ x: 13, y: 11 }, { x: 11, y: 13 }, { x: 15, y: 13 }];
const ENEMY_TOWER_MAX_HP = 60;
const ENEMY_TOWER_DAMAGE = 9;
const ENEMY_TOWER_RANGE = 4.5;
const ENEMY_TOWER_ATTACK_MS = 2500;
const ARCHER_TOWER_ATTACK_MS = 2500;
const WAR_RAM_MAX_HP = 200;
const WAR_RAM_SPEED = 0.3;
const WAR_RAM_DAMAGE = 40;
const WAR_RAM_ATTACK_MS = 3000;
const WAR_RAM_GOLD_REWARD = 25;
const WAR_RAM_XP_REWARD = 50;
const WAR_RAM_FIRST_WAVE = 6;
const DEMOLISHER_MAX_HP = 120;
const DEMOLISHER_SPEED = 0.22;
const DEMOLISHER_DAMAGE = 35;
const DEMOLISHER_SPLASH_RANGE = 1.5;
const DEMOLISHER_FIRE_RANGE = 4.0;
const DEMOLISHER_ATTACK_MS = 4500;
const DEMOLISHER_GOLD_REWARD = 30;
const DEMOLISHER_XP_REWARD = 60;
const DEMOLISHER_FIRST_WAVE = 14;
const NECROMANCER_MAX_HP = 35;
const NECROMANCER_SPEED = 0.5;
const NECROMANCER_RAISE_RADIUS = 3.0;
const NECROMANCER_RAISE_MS = 4000;
const NECROMANCER_FIRST_WAVE = 16;
const NECROMANCER_GOLD_REWARD = 20;
const NECROMANCER_XP_REWARD = 45;
const WITCH_DOCTOR_MAX_HP = 40;
const WITCH_DOCTOR_SPEED = 0.45;
const WITCH_DOCTOR_BUFF_RADIUS = 3.0;
const WITCH_DOCTOR_BUFF_MS = 7000;
const WITCH_DOCTOR_BUFF_DURATION = 6000;
const WITCH_DOCTOR_FIRST_WAVE = 12;
const WITCH_DOCTOR_GOLD_REWARD = 18;
const WITCH_DOCTOR_XP_REWARD = 40;
const WITCH_DOCTOR_ENRAGE_DMG_BONUS = 8;
const LOOT_CRATE_SPAWN_MS = 45000;
const SHAMAN_MAX_HP = 45;
const SHAMAN_SPEED = 0.6;
const SHAMAN_HEAL_AMOUNT = 5;
const SHAMAN_HEAL_RADIUS = 2.5;
const SHAMAN_HEAL_MS = 2000;
const SHAMAN_FIRST_WAVE = 8;
const SHAMAN_GOLD_REWARD = 15;
const SHAMAN_XP_REWARD = 35;
const TROLL_MAX_HP = 30;
const TROLL_SPEED = 0.9;
const TROLL_ATTACK_RANGE = 4.0;
const TROLL_KITE_RANGE = 3.0;
const TROLL_DAMAGE = 8;
const TROLL_ATTACK_MS = 2500;
const TROLL_FIRST_WAVE = 10;
const TROLL_GOLD_REWARD = 12;
const TROLL_XP_REWARD = 30;

const SAPPER_MAX_HP = 25;
const SAPPER_SPEED = 1.3;
const SAPPER_EXPLODE_RADIUS = 1.5;
const SAPPER_EXPLODE_DAMAGE = 80;
const SAPPER_FIRST_WAVE = 12;
const SAPPER_GOLD_REWARD = 20;
const SAPPER_XP_REWARD = 45;
const LUMBER_SHED_BONUS_MS = 200;
const TREBUCHET_MAX_HP = 45;
const TREBUCHET_SPEED = 0.28;
const TREBUCHET_RANGE = 9;
const TREBUCHET_MIN_RANGE = 2.5;
const TREBUCHET_DAMAGE = 40;
const TREBUCHET_FIRE_MS = 6000;

const FROST_TOWER_RANGE = 4.5;
const FROST_TOWER_DAMAGE = 5;
const FROST_TOWER_ATTACK_MS = 2500;
const FROST_TOWER_SLOW_DURATION = 3000;
const FROST_TOWER_SLOW_FACTOR = 0.5;
const FROST_TOWER_HP = 160;
const FROST_TOWER_GOLD_COST = 80;
const FROST_TOWER_LUMBER_COST = 40;
const FROST_TOWER_STONE_COST = 60;

const BALLISTA_RANGE = 6.5;
const BALLISTA_DAMAGE = 18;
const BALLISTA_PIERCE_RANGE = 1.5;
const BALLISTA_PIERCE_DAMAGE = 9;
const BALLISTA_ATTACK_MS = 4000;
const BALLISTA_HP = 150;

const LOOT_CRATE_POSITIONS = [
  { x: 3, y: 10 }, { x: 10, y: 3 }, { x: 5, y: 15 }, { x: 15, y: 5 }, { x: 1, y: 1 }, { x: 7, y: 8 }, { x: 8, y: 7 }, { x: 13, y: 13 },
];

interface FloatingText { id: number; x: number; y: number; text: string; color: string; createdAt: number }
type TileType = 'grass' | 'dirt' | 'water' | 'tree' | 'rock';
type BuildingType = 'farmhouse' | 'lumberShed' | 'watchtower' | 'wall' | 'windmill' | 'barracks' | 'siegeWorkshop' | 'market' | 'blacksmith' | 'granary' | 'stable' | 'spikeTrap' | 'frostTower' | 'ballista';

interface ResourceNode { x: number; y: number; amount: number }
interface Resources { gold: number; lumber: number; stone: number; food: number; foodCap: number }
interface PlacedBuilding { id: number; type: BuildingType; x: number; y: number; hp: number; maxHp: number; upgraded?: boolean }

interface EnemyGrunt {
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
}

interface EnemyTower {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
}

interface EnemySiege {
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

interface LootCrate {
  id: number;
  x: number;
  y: number;
  gold: number;
  lumber: number;
  stone: number;
}

interface EnemyShaman {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movingTo: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  state: 'moving' | 'healing';
}

interface EnemyNecromancer {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movingTo: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  state: 'moving' | 'raising';
}
interface EnemyWitchDoctor {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movingTo: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  state: 'moving' | 'casting';
}

interface EnemyTroll {
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

interface EnemySapper {
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

interface NeutralCreep {
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

const CREEP_MAX_HP = 45;
const CREEP_DAMAGE = 9;
const CREEP_SPEED = 1.2;
const CREEP_AGGRO_RANGE = 3.5;
const CREEP_ATTACK_MS = 1400;
const CREEP_LEASH_RANGE = 5;
const CAMP_GOLD_REWARD = 60;

const CREEP_CAMPS: { id: number; x: number; y: number; goldReward: number }[] = [
  { id: 1, x: 2,  y: 12, goldReward: CAMP_GOLD_REWARD },
  { id: 2, x: 9,  y: 2,  goldReward: CAMP_GOLD_REWARD },
  { id: 3, x: 13, y: 8,  goldReward: CAMP_GOLD_REWARD },
  { id: 4, x: 6,  y: 6,  goldReward: CAMP_GOLD_REWARD },
];

const BARN_POS = { x: 2, y: 2 };

const SHRINES: { id: number; x: number; y: number; type: 'war' | 'plenty'; label: string; captureMs: number }[] = [
  { id: 1, x: 4,  y: 8, type: 'war',    label: 'Shrine of War',    captureMs: 6000 },
  { id: 2, x: 12, y: 8, type: 'plenty', label: 'Shrine of Plenty', captureMs: 6000 },
];

const BUILDING_COSTS: Record<BuildingType, { gold: number; lumber: number; stone: number; label: string; foodCapBonus: number }> = {
  farmhouse: { gold: 60, lumber: 30, stone: 0, label: 'Farmhouse', foodCapBonus: 5 },
  lumberShed: { gold: 40, lumber: 60, stone: 0, label: 'Lumber Shed', foodCapBonus: 0 },
  watchtower: { gold: 80, lumber: 0, stone: 60, label: 'Watchtower', foodCapBonus: 0 },
  wall:       { gold: 15, lumber: 25, stone: 0, label: 'Palisade Wall', foodCapBonus: 0 },
  windmill:   { gold: 60, lumber: 40, stone: 0, label: 'Windmill', foodCapBonus: 0 },
  barracks:      { gold: 80, lumber: 60, stone: 40, label: 'Barracks', foodCapBonus: 0 },
  siegeWorkshop: { gold: 100, lumber: 80, stone: 60, label: 'Siege Workshop', foodCapBonus: 0 },
  market:        { gold: 80,  lumber: 60, stone: 20, label: 'Market',         foodCapBonus: 0 },
  blacksmith:    { gold: 100, lumber: 60, stone: 80, label: 'Blacksmith',     foodCapBonus: 0 },
  granary:       { gold: 50,  lumber: 80, stone: 20, label: 'Granary',        foodCapBonus: 8 },
  stable:        { gold: 80,  lumber: 60, stone: 30, label: 'Stable',         foodCapBonus: 0 },
  spikeTrap:     { gold: 30,  lumber: 20, stone: 10, label: 'Spike Trap',     foodCapBonus: 0 },
  frostTower:    { gold: FROST_TOWER_GOLD_COST, lumber: FROST_TOWER_LUMBER_COST, stone: FROST_TOWER_STONE_COST, label: 'Frost Tower', foodCapBonus: 0 },
  ballista:      { gold: 100, lumber: 60, stone: 80, label: 'Ballista Tower', foodCapBonus: 0 },
};

const BUILDING_EMOJI: Record<BuildingType, string> = {
  farmhouse: '🏠', lumberShed: '🪵', watchtower: '🗼', wall: '🧱', windmill: '💨', barracks: '🏯', siegeWorkshop: '⚙️', market: '🏪', blacksmith: '🔨', granary: '🌾', stable: '🐴', spikeTrap: '🪤', frostTower: '❄️', ballista: '🏹',
};

const BUILDING_MAX_HP: Record<BuildingType, number> = {
  farmhouse: 200, lumberShed: 150, watchtower: 180, wall: 120, windmill: 100,
  barracks: 250, siegeWorkshop: 220, market: 160, blacksmith: 200, granary: 140, stable: 200, spikeTrap: 60, frostTower: FROST_TOWER_HP, ballista: BALLISTA_HP,
};
const BUILDING_GRUNT_DAMAGE = 8; // damage per hit from grunt to building

const SWORDSMAN_MAX_HP = 80;
const SWORDSMAN_DAMAGE_BONUS = 10;
const SWORDSMAN_CHARGE_COOLDOWN_S = 12;
const SWORDSMAN_CHARGE_DAMAGE_MULT = 2;
const CAVALRY_MAX_HP = 65;
const CAVALRY_SPEED = 3.0;
const CAVALRY_DAMAGE_BONUS = 8;
const CAVALRY_TRAMPLE_RADIUS = 0.8;
const CAVALRY_TRAMPLE_DAMAGE = 6;
const CAVALRY_SPRINT_COOLDOWN_S = 20;
const CAVALRY_SPRINT_DURATION_MS = 5000;
const CAVALRY_SPRINT_SPEED_MULT = 2;

function makeTiles(): TileType[][] {
  return Array.from({ length: GRID_SIZE }, (_, i) =>
    Array.from({ length: GRID_SIZE }, (_, j) => {
      // Water: player-side lake and enemy-side lake
      if (i >= 0 && i <= 2 && j >= 5 && j <= 7) return 'water';
      if (i >= 5 && i <= 7 && j >= 0 && j <= 2) return 'water';
      if (i >= 14 && i <= 16 && j >= 9 && j <= 11) return 'water';
      if (i >= 9 && i <= 11 && j >= 14 && j <= 16) return 'water';
      // Tree clusters (decorative backdrop)
      if ((i === 5 || i === 6) && (j === 9 || j === 10)) return 'tree';
      if ((i === 10 || i === 11) && (j === 6 || j === 7)) return 'tree';
      if ((i === 3 || i === 4) && (j === 13 || j === 14)) return 'tree';
      if ((i === 13 || i === 14) && (j === 3 || j === 4)) return 'tree';
      // Rock clusters (decorative)
      if ((i === 7 || i === 8) && (j === 4 || j === 5)) return 'rock';
      if ((i === 8 || i === 9) && (j === 11 || j === 12)) return 'rock';
      // Dirt paths crossing the map
      if (j === 6 || i === 8) return 'dirt';
      return 'grass';
    })
  );
}

function tileToSvg(tx: number, ty: number) {
  const isoX = (tx - ty) * TILE_SIZE + (GRID_SIZE * TILE_SIZE) / 2 + TILE_SIZE;
  const isoY = ((tx + ty) * TILE_SIZE) / 2 + TILE_SIZE / 2;
  return { isoX, isoY };
}

function svgToTile(svgX: number, svgY: number) {
  const A = (svgX - (GRID_SIZE * TILE_SIZE / 2 + TILE_SIZE)) / TILE_SIZE;
  const B = (svgY - TILE_SIZE / 2) * 2 / TILE_SIZE;
  return { tx: Math.round((A + B) / 2), ty: Math.round((B - A) / 2) };
}

function tileDist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

/** A* pathfinding on isometric tile grid. Returns waypoints excluding start, including goal. */
function aStar(
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

  type Node = { x: number; y: number; g: number; f: number; parent: Node | null };
  const key = (x: number, y: number) => `${x},${y}`;
  const h = (x: number, y: number) => Math.abs(x - goal.x) + Math.abs(y - goal.y);

  const open = new Map<string, Node>();
  const closed = new Set<string>();
  open.set(key(start.x, start.y), { x: start.x, y: start.y, g: 0, f: h(start.x, start.y), parent: null });

  while (open.size > 0) {
    let current: Node | null = null;
    for (const n of open.values()) { if (!current || n.f < current.f) current = n; }
    if (!current) break;
    if (current.x === goal.x && current.y === goal.y) {
      const path: { x: number; y: number }[] = [];
      let n: Node | null = current;
      while (n) { path.unshift({ x: n.x, y: n.y }); n = n.parent; }
      return path.slice(1);
    }
    open.delete(key(current.x, current.y));
    closed.add(key(current.x, current.y));
    const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }];
    for (const { dx, dy } of dirs) {
      const nx = current.x + dx, ny = current.y + dy;
      if (!isPassable(nx, ny) || closed.has(key(nx, ny))) continue;
      const g = current.g + (dx !== 0 && dy !== 0 ? 1.414 : 1);
      const ex = open.get(key(nx, ny));
      if (!ex || g < ex.g) open.set(key(nx, ny), { x: nx, y: ny, g, f: g + h(nx, ny), parent: current });
    }
  }
  return [goal]; // no path: go direct
}

function computeVisible(sources: { x: number; y: number; r: number }[]): boolean[][] {
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false) as boolean[]);
  for (const src of sources) {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (tileDist(src.x, src.y, i, j) <= src.r) grid[i]![j] = true;
      }
    }
  }
  return grid;
}

const INITIAL_TILES = makeTiles();

// ---------- Save / Load ----------
const SAVE_KEY = 'farm3j_rts_v1';

interface SaveWorker { id: number; x: number; y: number; hp: number; maxHp: number; unitType: 'farmer' | 'swordsman' | 'hero' | 'catapult' | 'cavalry' | 'trebuchet'; group: number | null; xp?: number; level?: number }
interface SaveData {
  version: 1;
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
  playerBarnHp: number;
  enemyBarnHp: number;
  rallyPoint: { x: number; y: number } | null;
  fogExplored: boolean[][];
}

function loadSave(): SaveData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as SaveData;
    return d?.version === 1 ? d : null;
  } catch { return null; }
}

// Blocked when a New Game reset is in progress — prevents auto-save from re-writing state
// after clearSave() but before the new component finishes mounting.
let _saveLocked = false;

function writeSave(data: SaveData): void {
  if (_saveLocked) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch {}
}

function clearSave(): void {
  _saveLocked = true;
  try { localStorage.removeItem(SAVE_KEY); } catch {}
  // Unlock after a tick — by then the new component has mounted and taken over
  setTimeout(() => { _saveLocked = false; }, 500);
}

function makeUnit(id: number, x: number, y: number, unitType: 'farmer' | 'swordsman' | 'hero' | 'catapult' | 'cavalry' | 'trebuchet'): WorkerState {
  const maxHp = unitType === 'hero' ? HERO_MAX_HP : unitType === 'swordsman' ? SWORDSMAN_MAX_HP : unitType === 'catapult' ? CATAPULT_MAX_HP : unitType === 'cavalry' ? CAVALRY_MAX_HP : unitType === 'trebuchet' ? TREBUCHET_MAX_HP : WORKER_MAX_HP;
  return { id, x, y, selected: false, movingTo: null, path: [], gathering: null, attacking: null, repairing: null, chargeCooldown: 0, sprintCooldown: 0, sprinting: false, waypoints: [], attackMove: false, attackMoveTarget: null, carrying: { gold: 0, lumber: 0, stone: 0 }, state: 'idle', group: null, hp: maxHp, maxHp, patrol: null, holdPosition: false, unitType, xp: 0, level: 0 };
}
// ---------------------------------

const Stat: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div>
    <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
    <div style={{ color, fontSize: 22, fontWeight: 700 }}>{value}</div>
  </div>
);

const RTSMap: React.FC<{ onNewGame?: () => void }> = ({ onNewGame }) => {
  // Load save once per mount (module-level caching caused stale data after New Game)
  const saveRef = useRef<SaveData | null | undefined>(undefined);
  if (saveRef.current === undefined) saveRef.current = loadSave();
  const INITIAL_SAVE = saveRef.current;

  const [zoom, setZoom] = useState(1);
  const tiles = useMemo(() => INITIAL_TILES, []);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const [fogExplored, setFogExplored] = useState<boolean[][]>(() => INITIAL_SAVE?.fogExplored ?? computeVisible([{ x: BARN_POS.x, y: BARN_POS.y, r: BARN_VISION }]));
  const [dragBox, setDragBox] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const isDraggingRef = useRef(false);
  const [buildMode, setBuildMode] = useState<BuildingType | null>(null);
  const [ghostTile, setGhostTile] = useState<{ x: number; y: number } | null>(null);
  const [placedBuildings, setPlacedBuildings] = useState<PlacedBuilding[]>(() => (INITIAL_SAVE?.placedBuildings ?? []).map((b: PlacedBuilding) => b.hp != null ? b : { ...b, hp: BUILDING_MAX_HP[b.type] ?? 100, maxHp: BUILDING_MAX_HP[b.type] ?? 100 }));
  const buildingIdRef = useRef(INITIAL_SAVE?.buildingNextId ?? 1);
  const placedBuildingsRef = useRef(placedBuildings);
  useEffect(() => { placedBuildingsRef.current = placedBuildings; }, [placedBuildings]);
  const [controlGroups, setControlGroups] = useState<Record<number, number[]>>({});
  const [resources, setResources] = useState<Resources>(() => INITIAL_SAVE?.resources ?? { gold: 150, lumber: 80, stone: 30, food: 6, foodCap: FOOD_CAP_BASE });

  const DEFAULT_TREES: ResourceNode[] = [
    // Starting cluster — close to barn (2,2) for immediate economy
    { x: 4, y: 2, amount: 60 }, { x: 5, y: 2, amount: 60 }, { x: 4, y: 3, amount: 60 },
    // Player-side mid cluster
    { x: 2, y: 8, amount: 60 }, { x: 3, y: 8, amount: 60 }, { x: 2, y: 9, amount: 60 },
    // Mid-west cluster
    { x: 7, y: 4, amount: 60 }, { x: 8, y: 4, amount: 60 }, { x: 7, y: 5, amount: 60 },
    // Center cluster
    { x: 5, y: 11, amount: 60 }, { x: 6, y: 11, amount: 60 },
    // Mid-east cluster
    { x: 10, y: 8, amount: 60 }, { x: 11, y: 8, amount: 60 },
    // Enemy-side cluster
    { x: 13, y: 8, amount: 60 }, { x: 14, y: 8, amount: 60 },
    { x: 12, y: 2, amount: 60 }, { x: 13, y: 2, amount: 60 },
  ];
  const DEFAULT_GOLD_MINES: ResourceNode[] = [
    { x: 4, y: 5, amount: 200 },   // starting mine — close to barn for early economy
    { x: 1, y: 8, amount: 250 },   // secondary player-side mine
    { x: 8, y: 8, amount: 300 },   // contested center — high value, risky
    { x: 15, y: 8, amount: 250 },  // deep enemy side
  ];
  const [trees, setTrees] = useState<ResourceNode[]>(() => INITIAL_SAVE?.trees ?? DEFAULT_TREES);
  const [goldMines, setGoldMines] = useState<ResourceNode[]>(() =>
    INITIAL_SAVE?.goldMines ?? (INITIAL_SAVE?.goldMine ? [INITIAL_SAVE.goldMine] : DEFAULT_GOLD_MINES)
  );
  const [stoneNodes, setStoneNodes] = useState<ResourceNode[]>(() => INITIAL_SAVE?.stoneNodes ?? [
    { x: 4, y: 1, amount: 150 }, { x: 1, y: 4, amount: 150 },   // player corner
    { x: 9, y: 9, amount: 150 },                                  // center
    { x: 6, y: 13, amount: 150 }, { x: 13, y: 5, amount: 150 }, // mid flanks
    { x: 15, y: 12, amount: 150 }, { x: 12, y: 15, amount: 150 }, // enemy corner
  ]);
  const treesRef = useRef(trees);
  const goldMinesRef = useRef(goldMines);
  const stoneNodesRef = useRef(stoneNodes);
  useEffect(() => { treesRef.current = trees; }, [trees]);
  useEffect(() => { goldMinesRef.current = goldMines; }, [goldMines]);
  useEffect(() => { stoneNodesRef.current = stoneNodes; }, [stoneNodes]);

  const makeWorker = (id: number, x: number, y: number) => makeUnit(id, x, y, 'farmer');
  const makeSwordsman = (id: number, x: number, y: number) => makeUnit(id, x, y, 'swordsman');

  const [workers, setWorkers] = useState<WorkerState[]>(() =>
    INITIAL_SAVE?.workers?.length
      ? INITIAL_SAVE.workers.map(w => ({ ...makeUnit(w.id, w.x, w.y, w.unitType), hp: w.hp, maxHp: w.maxHp, group: w.group, xp: w.xp ?? 0, level: w.level ?? 0 }))
      : [
          { ...makeUnit(1, 3, 3, 'farmer'), selected: true },
          makeUnit(2, 4, 3, 'farmer'),
          makeUnit(3, 3, 4, 'farmer'),
          makeUnit(4, 4, 4, 'farmer'),
          makeUnit(5, 5, 3, 'farmer'),
          makeUnit(6, 3, 5, 'swordsman'),
        ]
  );
  const workersRef = useRef(workers);
  useEffect(() => { workersRef.current = workers; }, [workers]);

  const [enemyGrunts, setEnemyGrunts] = useState<EnemyGrunt[]>([]);
  const enemyGruntsRef = useRef(enemyGrunts);
  useEffect(() => { enemyGruntsRef.current = enemyGrunts; }, [enemyGrunts]);
  const gruntIdRef = useRef(1);
  const gruntAttackTimeoutsRef = useRef<Record<number, number>>({});

  const makeCreeps = () => {
    let id = 1;
    return CREEP_CAMPS.flatMap(camp => [
      { id: id++, campId: camp.id, x: camp.x, y: camp.y, homeX: camp.x, homeY: camp.y, hp: CREEP_MAX_HP, maxHp: CREEP_MAX_HP, state: 'idle' as const, targetWorkerId: null },
      { id: id++, campId: camp.id, x: camp.x + 1, y: camp.y, homeX: camp.x + 1, homeY: camp.y, hp: CREEP_MAX_HP, maxHp: CREEP_MAX_HP, state: 'idle' as const, targetWorkerId: null },
    ]);
  };
  const [neutralCreeps, setNeutralCreeps] = useState<NeutralCreep[]>(() => makeCreeps());
  const neutralCreepsRef = useRef(neutralCreeps);
  useEffect(() => { neutralCreepsRef.current = neutralCreeps; }, [neutralCreeps]);
  const [clearedCamps, setClearedCamps] = useState<Set<number>>(() => new Set());
  const creepAttackTimeoutsRef = useRef<Record<number, number>>({});

  const [wave, setWave] = useState(() => INITIAL_SAVE?.wave ?? 0);
  const waveRef = useRef(INITIAL_SAVE?.wave ?? 0);
  const [, setTick] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(id); }, []);
  const [enemyTowers, setEnemyTowers] = useState<EnemyTower[]>([]);
  const enemyTowersRef = useRef<EnemyTower[]>([]);
  useEffect(() => { enemyTowersRef.current = enemyTowers; }, [enemyTowers]);
  const enemyTowerTimersRef = useRef<Record<number, number>>({});
  const [enemySiege, setEnemySiege] = useState<EnemySiege[]>([]);
  const enemySiegeRef = useRef<EnemySiege[]>([]);
  useEffect(() => { enemySiegeRef.current = enemySiege; }, [enemySiege]);
  const siegeIdRef = useRef(1000);
  const [enemyShamans, setEnemyShamans] = useState<EnemyShaman[]>([]);
  const enemyShamansRef = useRef<EnemyShaman[]>([]);
  useEffect(() => { enemyShamansRef.current = enemyShamans; }, [enemyShamans]);
  const shamanIdRef = useRef(2000);
  const shamanHealTimersRef = useRef<Record<number, number>>({});
  const [enemyNecromancers, setEnemyNecromancers] = useState<EnemyNecromancer[]>([]);
  const enemyNecromancersRef = useRef<EnemyNecromancer[]>([]);
  useEffect(() => { enemyNecromancersRef.current = enemyNecromancers; }, [enemyNecromancers]);
  const necromancerIdRef = useRef(7000);
  const necromancerRaiseTimersRef = useRef<Record<number, number>>({});
  const [enemyWitchDoctors, setEnemyWitchDoctors] = useState<EnemyWitchDoctor[]>([]);
  const enemyWitchDoctorsRef = useRef<EnemyWitchDoctor[]>([]);
  useEffect(() => { enemyWitchDoctorsRef.current = enemyWitchDoctors; }, [enemyWitchDoctors]);
  const witchDoctorIdRef = useRef(8000);
  const witchDoctorBuffTimersRef = useRef<Record<number, number>>({});
  const [deadGruntPositions, setDeadGruntPositions] = useState<{ x: number; y: number; t: number }[]>([]);
  const deadGruntPositionsRef = useRef<{ x: number; y: number; t: number }[]>([]);
  useEffect(() => { deadGruntPositionsRef.current = deadGruntPositions; }, [deadGruntPositions]);
  const [enemyTrolls, setEnemyTrolls] = useState<EnemyTroll[]>([]);
  const enemyTrollsRef = useRef<EnemyTroll[]>([]);
  useEffect(() => { enemyTrollsRef.current = enemyTrolls; }, [enemyTrolls]);
  const trollIdRef = useRef(3000);
  const trollAttackTimersRef = useRef<Record<number, number>>({});
  const [enemySappers, setEnemySappers] = useState<EnemySapper[]>([]);
  const enemySappersRef = useRef<EnemySapper[]>([]);
  useEffect(() => { enemySappersRef.current = enemySappers; }, [enemySappers]);
  const sapperIdRef = useRef(4000);
  const [lootCrates, setLootCrates] = useState<LootCrate[]>([]);
  const lootCratesRef = useRef<LootCrate[]>([]);
  useEffect(() => { lootCratesRef.current = lootCrates; }, [lootCrates]);
  const lootCrateIdRef = useRef(5000);
  const [waveAnnouncement, setWaveAnnouncement] = useState<string | null>(null);
  const [wavePreview, setWavePreview] = useState<string | null>(null);
  const previewTimerRef = useRef<number | null>(null);
  const gameOverRef = useRef<'victory' | 'defeat' | null>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const [nextWaveAt, setNextWaveAt] = useState<number | null>(null);
  const idleWorkerIndexRef = useRef(0);
  const [capturedShrines, setCapturedShrines] = useState<Set<number>>(new Set());
  const capturedShrinesRef = useRef<Set<number>>(new Set());
  useEffect(() => { capturedShrinesRef.current = capturedShrines; }, [capturedShrines]);
  // shrineCapturing: which shrine a worker is channeling and since when
  const [shrineCapturing, setShrineCapturing] = useState<{ shrineId: number; workerId: number; startedAt: number } | null>(null);
  const shrineCapturingRef = useRef<{ shrineId: number; workerId: number; startedAt: number } | null>(null);
  useEffect(() => { shrineCapturingRef.current = shrineCapturing; }, [shrineCapturing]);
  const [shrineWarBuff, setShrineWarBuff] = useState(false);
  const shrineWarBuffRef = useRef(false);
  useEffect(() => { shrineWarBuffRef.current = shrineWarBuff; }, [shrineWarBuff]);
  const [shrinePlentyBuff, setShrinePlentyBuff] = useState(false);
  const shrinePlentyBuffRef = useRef(false);
  useEffect(() => { shrinePlentyBuffRef.current = shrinePlentyBuff; }, [shrinePlentyBuff]);
  const [gameSpeed, setGameSpeed] = useState(1);
  const gameSpeedRef = useRef(1);
  useEffect(() => { gameSpeedRef.current = gameSpeed; }, [gameSpeed]);

  const [enemyBarnHp, setEnemyBarnHp] = useState(() => INITIAL_SAVE?.enemyBarnHp ?? ENEMY_BARN_MAX_HP);
  const enemyBarnHpRef = useRef(INITIAL_SAVE?.enemyBarnHp ?? ENEMY_BARN_MAX_HP);
  useEffect(() => { enemyBarnHpRef.current = enemyBarnHp; }, [enemyBarnHp]);
  const [playerBarnHp, setPlayerBarnHp] = useState(() => INITIAL_SAVE?.playerBarnHp ?? PLAYER_BARN_MAX_HP);
  const playerBarnHpRef = useRef(INITIAL_SAVE?.playerBarnHp ?? PLAYER_BARN_MAX_HP);
  useEffect(() => { playerBarnHpRef.current = playerBarnHp; }, [playerBarnHp]);
  const [gameOver, setGameOver] = useState<'victory' | 'defeat' | null>(null);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  const [garrisoned, setGarrisoned] = useState<WorkerState[]>([]);
  const garrisonedRef = useRef(garrisoned);
  useEffect(() => { garrisonedRef.current = garrisoned; }, [garrisoned]);

  // Tower garrison: maps tower building id → garrisoned units (max 3)
  const [towerGarrison, setTowerGarrison] = useState<Record<number, WorkerState[]>>({});
  const towerGarrisonRef = useRef(towerGarrison);
  useEffect(() => { towerGarrisonRef.current = towerGarrison; }, [towerGarrison]);

  const [heroRecruited, setHeroRecruited] = useState(false);
  const [heroAbilityCooldown, setHeroAbilityCooldown] = useState(0);
  useEffect(() => {
    if (heroAbilityCooldown <= 0) return;
    const id = setInterval(() => setHeroAbilityCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [heroAbilityCooldown > 0]); // eslint-disable-line react-hooks/exhaustive-deps
  const [heroShoutCooldown, setHeroShoutCooldown] = useState(0);
  useEffect(() => {
    if (heroShoutCooldown <= 0) return;
    const id = setInterval(() => setHeroShoutCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [heroShoutCooldown > 0]); // eslint-disable-line react-hooks/exhaustive-deps
  const [battleShoutUntil, setBattleShoutUntil] = useState(0);
  const battleShoutUntilRef = useRef(0);
  useEffect(() => { battleShoutUntilRef.current = battleShoutUntil; }, [battleShoutUntil]);
  // Tick down per-unit cooldowns every second
  useEffect(() => {
    const id = setInterval(() => {
      setWorkers(ws => {
        const hasCooldown = ws.some(w => w.chargeCooldown > 0 || w.sprintCooldown > 0);
        if (!hasCooldown) return ws;
        return ws.map(w => (w.chargeCooldown > 0 || w.sprintCooldown > 0) ? { ...w, chargeCooldown: Math.max(0, w.chargeCooldown - 1), sprintCooldown: Math.max(0, w.sprintCooldown - 1) } : w);
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const [harvestBoonCooldown, setHarvestBoonCooldown] = useState(0);
  const [harvestBoonActive, setHarvestBoonActive] = useState(false);
  const harvestBoonRef = useRef(false);
  useEffect(() => { harvestBoonRef.current = harvestBoonActive; }, [harvestBoonActive]);
  useEffect(() => {
    if (harvestBoonCooldown <= 0) return;
    const id = setInterval(() => setHarvestBoonCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [harvestBoonCooldown > 0]); // eslint-disable-line react-hooks/exhaustive-deps
  const [killCount, setKillCount] = useState(() => INITIAL_SAVE?.killCount ?? 0);
  const [totalGold, setTotalGold] = useState(() => INITIAL_SAVE?.totalGold ?? 0);
  const [totalLumber, setTotalLumber] = useState(() => INITIAL_SAVE?.totalLumber ?? 0);
  const startTimeRef = useRef(Date.now());
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  useEffect(() => { if (gameOver && !gameEndTime) setGameEndTime(Date.now()); }, [gameOver, gameEndTime]);

  const [farmhouse, setFarmhouse] = useState<{ built: boolean; level: number }>(() => INITIAL_SAVE?.farmhouse ?? { built: false, level: 0 });
  const farmhouseUpgradeCosts = [{ gold: 50, lumber: 50 }, { gold: 100, lumber: 100 }, { gold: 200, lumber: 200 }];
  const farmhouseStorage = [{ gold: 100, lumber: 100 }, { gold: 200, lumber: 200 }, { gold: 400, lumber: 400 }];
  const maxFarmhouseLevel = farmhouseUpgradeCosts.length - 1;
  const [selectedType, setSelectedType] = useState<'worker' | 'farmhouse' | null>('worker');
  const [rallyPoint, setRallyPoint] = useState<{ x: number; y: number } | null>(() => INITIAL_SAVE?.rallyPoint ?? null);
  const rallyPointRef = useRef(rallyPoint);
  useEffect(() => { rallyPointRef.current = rallyPoint; }, [rallyPoint]);
  const [patrolMode, setPatrolMode] = useState(false);
  const patrolModeRef = useRef(false);
  useEffect(() => { patrolModeRef.current = patrolMode; }, [patrolMode]);
  const [attackMoveMode, setAttackMoveMode] = useState(false);
  const attackMoveModeRef = useRef(false);
  useEffect(() => { attackMoveModeRef.current = attackMoveMode; }, [attackMoveMode]);
  const [stance, setStance] = useState<'aggressive' | 'passive'>('aggressive');
  const stanceRef = useRef<'aggressive' | 'passive'>('aggressive');
  useEffect(() => { stanceRef.current = stance; }, [stance]);
  const [upgrades, setUpgrades] = useState<Upgrades>(() => INITIAL_SAVE?.upgrades ?? { sharperTools: 0, swiftHarvest: 0, ironWill: 0 });
  const upgradesRef = useRef(upgrades);
  useEffect(() => { upgradesRef.current = upgrades; }, [upgrades]);

  const [blacksmithUpgrades, setBlacksmithUpgrades] = useState({ steelEdge: 0, ironHide: 0 });
  const blacksmithUpgradesRef = useRef(blacksmithUpgrades);
  useEffect(() => { blacksmithUpgradesRef.current = blacksmithUpgrades; }, [blacksmithUpgrades]);
  const [guardTowerResearched, setGuardTowerResearched] = useState(false);
  const guardTowerRef = useRef(false);
  useEffect(() => { guardTowerRef.current = guardTowerResearched; }, [guardTowerResearched]);

  // Unit training queue (barracks + stable)
  const TRAIN_TIME_MS = 8000;
  const [trainingQueue, setTrainingQueue] = useState<{type: 'swordsman' | 'cavalry'}[]>([]);
  const [trainingProgress, setTrainingProgress] = useState(0); // 0-1 for first item
  const trainingQueueRef = useRef<{type: 'swordsman' | 'cavalry'}[]>([]);
  const trainingElapsedRef = useRef(0);
  useEffect(() => { trainingQueueRef.current = trainingQueue; }, [trainingQueue]);

  // Day/Night cycle
  const DAY_DURATION_MS = 60000;
  const NIGHT_DURATION_MS = 45000;
  const NIGHT_SPEED_MULT = 1.3;
  const [dayPhase, setDayPhase] = useState<'day' | 'night'>('day');
  const [dayProgress, setDayProgress] = useState(0); // 0-1 through current phase
  const [phaseAnnouncement, setPhaseAnnouncement] = useState<string | null>(null);
  const isNightRef = useRef(false);
  useEffect(() => { isNightRef.current = dayPhase === 'night'; }, [dayPhase]);

  useEffect(() => {
    if (gameOver) return;
    let phaseStart = Date.now();
    let currentPhase: 'day' | 'night' = 'day';
    const tick = setInterval(() => {
      if (gameOverRef.current) return;
      const elapsed = Date.now() - phaseStart;
      const duration = currentPhase === 'day' ? DAY_DURATION_MS : NIGHT_DURATION_MS;
      setDayProgress(Math.min(1, elapsed / duration));
      if (elapsed >= duration) {
        currentPhase = currentPhase === 'day' ? 'night' : 'day';
        setDayPhase(currentPhase);
        phaseStart = Date.now();
        const msg = currentPhase === 'night' ? '🌙 Night Falls! Grunts grow stronger…' : '☀️ Dawn Breaks!';
        setPhaseAnnouncement(msg);
        setTimeout(() => setPhaseAnnouncement(null), 2500);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [gameOver]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [incomeRate, setIncomeRate] = useState({ gold: 0, lumber: 0, stone: 0 });
  const incomeAccRef = useRef({ gold: 0, lumber: 0, stone: 0 });
  const [underAttack, setUnderAttack] = useState(false);
  const underAttackTimerRef = useRef<number | null>(null);
  const triggerUnderAttack = useCallback(() => {
    setUnderAttack(true);
    if (underAttackTimerRef.current) clearTimeout(underAttackTimerRef.current);
    underAttackTimerRef.current = window.setTimeout(() => setUnderAttack(false), 4000);
  }, []);
  const triggerUnderAttackRef = useRef(triggerUnderAttack);
  useEffect(() => { triggerUnderAttackRef.current = triggerUnderAttack; }, [triggerUnderAttack]);

  const doSave = useCallback(() => {
    writeSave({
      version: 1,
      resources,
      workers: workersRef.current.map(w => ({ id: w.id, x: Math.round(w.x), y: Math.round(w.y), hp: w.hp, maxHp: w.maxHp, unitType: w.unitType, group: w.group, xp: w.xp, level: w.level })),
      trees: treesRef.current,
      goldMines: goldMinesRef.current,
      stoneNodes: stoneNodesRef.current,
      placedBuildings: placedBuildingsRef.current,
      buildingNextId: buildingIdRef.current,
      farmhouse,
      upgrades: upgradesRef.current,
      wave: waveRef.current,
      killCount,
      totalGold,
      totalLumber,
      playerBarnHp: playerBarnHpRef.current,
      enemyBarnHp,
      rallyPoint,
      fogExplored,
    });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [resources, farmhouse, killCount, totalGold, totalLumber, enemyBarnHp, rallyPoint, fogExplored]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(doSave, 30000);
    return () => clearInterval(id);
  }, [gameOver, doSave]);

  // Income rate: snapshot every 30s, publish as per-minute rate
  useEffect(() => {
    const id = setInterval(() => {
      const acc = incomeAccRef.current;
      setIncomeRate({ gold: acc.gold * 2, lumber: acc.lumber * 2, stone: acc.stone * 2 });
      incomeAccRef.current = { gold: 0, lumber: 0, stone: 0 };
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Save on tab close
  useEffect(() => {
    const handler = () => { if (!gameOverRef.current) doSave(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [doSave]);

  const gatherTimeoutsRef = useRef<Record<number, number>>({});
  const attackTimeoutsRef = useRef<Record<number, number>>({});
  const repairTimeoutsRef = useRef<Record<number, number>>({});
  const archerTowerTimerRef = useRef<number | null>(null);
  const watchtowerTimersRef = useRef<Record<number, number>>({});
  const trapTriggeredRef = useRef<Record<number, number>>({});
  const buildingAttackTimeoutsRef = useRef<Record<number, number>>({});
  const siegeAttackTimeoutsRef = useRef<Record<number, number>>({});
  const buildingRepairTimeoutsRef = useRef<Record<number, number>>({});
  const animationRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const floatingTextIdRef = useRef(1);
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setFloatingTexts(ts => ts.filter(t => now - t.createdAt < 1200));
    }, 100);
    return () => clearInterval(id);
  }, []);

  const addFloatingText = useCallback((tileX: number, tileY: number, text: string, color: string) => {
    const { isoX, isoY } = tileToSvg(tileX, tileY);
    setFloatingTexts(ts => [...ts, { id: floatingTextIdRef.current++, x: isoX + TILE_SIZE / 2 + (Math.random() * 20 - 10), y: isoY + 10, text, color, createdAt: Date.now() }]);
  }, []);

  // Fog of war
  const fogVisible = useMemo(() => computeVisible([
    { x: BARN_POS.x, y: BARN_POS.y, r: BARN_VISION },
    ...workers.map(w => ({ x: w.x, y: w.y, r: WORKER_VISION })),
    ...placedBuildings.map(b => ({ x: b.x, y: b.y, r: b.type === 'watchtower' ? WATCHTOWER_VISION : 2 })),
  ]), [workers, placedBuildings]);

  useEffect(() => {
    setFogExplored(exp => {
      let changed = false;
      const next = exp.map((row, i) => row.map((v, j) => { if (!v && fogVisible[i]?.[j]) { changed = true; return true; } return v; }));
      return changed ? next : exp;
    });
  }, [fogVisible]);

  // Wave-based grunt spawner
  const doSpawnWave = useCallback(() => {
    if (gameOverRef.current) return;
    const newWave = waveRef.current + 1;
    waveRef.current = newWave;
    setWave(newWave);
    const towerIdx = ENEMY_TOWER_SPAWN_WAVES.indexOf(newWave as typeof ENEMY_TOWER_SPAWN_WAVES[number]);
    const isBossWave = newWave % 10 === 0;
    if (towerIdx >= 0 && !isBossWave) {
      const pos = ENEMY_TOWER_POSITIONS[towerIdx];
      if (!pos) return;
      setEnemyTowers(ts => [...ts, { id: newWave, x: pos.x, y: pos.y, hp: ENEMY_TOWER_MAX_HP, maxHp: ENEMY_TOWER_MAX_HP }]);
      setWaveAnnouncement(`⚔️ Wave ${newWave} — ENEMY TOWER BUILT!`);
    } else if (isBossWave) {
      setWaveAnnouncement(`💀 Wave ${newWave} — WAR BULL INCOMING!`);
    } else {
      setWaveAnnouncement(`⚔️ Wave ${newWave}${newWave % 3 === 0 ? ' — DOUBLE ASSAULT!' : '!'}`);
    }
    window.setTimeout(() => setWaveAnnouncement(null), 3000);

    const gruntHp = GRUNT_MAX_HP + (newWave - 1) * 10;
    const wallSet = new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`));

    // Boss spawn on multiples of 10
    if (isBossWave) {
      const bossHp = gruntHp * BOSS_HP_MULTIPLIER;
      const cx = Math.max(0, ENEMY_BARN_POS.x - 1);
      const cy = ENEMY_BARN_POS.y;
      const bossPath = aStar(INITIAL_TILES, { x: cx, y: cy }, BARN_POS, true, wallSet);
      const boss: EnemyGrunt = { id: gruntIdRef.current++, x: cx, y: cy, hp: bossHp, maxHp: bossHp, movingTo: bossPath[0] ?? BARN_POS, path: bossPath.slice(1), state: 'moving', isBoss: true };
      setEnemyGrunts(gs => [...gs, boss]);
    }

    const count = newWave % 3 === 0 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const ox = i === 0 ? 1 : -1;
      const cx = Math.max(0, Math.min(GRID_SIZE - 1, ENEMY_BARN_POS.x + ox));
      const cy = Math.max(0, Math.min(GRID_SIZE - 1, ENEMY_BARN_POS.y + (Math.random() > 0.5 ? 1 : -1)));
      const path = aStar(INITIAL_TILES, { x: cx, y: cy }, BARN_POS, true, wallSet);
      const grunt: EnemyGrunt = { id: gruntIdRef.current++, x: cx, y: cy, hp: gruntHp, maxHp: gruntHp, movingTo: path[0] ?? BARN_POS, path: path.slice(1), state: 'moving' };
      setEnemyGrunts(gs => [...gs, grunt]);
    }

    // War Ram spawn: wave 6+ every 3 waves
    if (newWave >= WAR_RAM_FIRST_WAVE && newWave % 3 === 0) {
      const rx = Math.max(0, ENEMY_BARN_POS.x - 2);
      const ry = ENEMY_BARN_POS.y;
      const nearestBuilding = placedBuildingsRef.current.filter(b => b.hp > 0).reduce<PlacedBuilding | null>((best, b) => !best || tileDist(rx, ry, b.x, b.y) < tileDist(rx, ry, best.x, best.y) ? b : best, null);
      const ramDest = nearestBuilding ?? BARN_POS;
      const ramPath = aStar(INITIAL_TILES, { x: rx, y: ry }, { x: ramDest.x, y: ramDest.y }, true, wallSet);
      const ram: EnemySiege = { id: siegeIdRef.current++, x: rx, y: ry, hp: WAR_RAM_MAX_HP, maxHp: WAR_RAM_MAX_HP, movingTo: ramPath[0] ?? { x: ramDest.x, y: ramDest.y }, path: ramPath.slice(1), state: 'moving', targetBuildingId: nearestBuilding?.id ?? -1 };
      setEnemySiege(prev => [...prev, ram]);
      setWaveAnnouncement(`🪵 Wave ${newWave} — WAR RAM INCOMING!`);
      window.setTimeout(() => setWaveAnnouncement(null), 3000);
    }

    // Demolisher spawn: wave 14+ every 4 waves
    if (newWave >= DEMOLISHER_FIRST_WAVE && newWave % 4 === 0) {
      const dx = Math.max(0, ENEMY_BARN_POS.x - 2);
      const dy = ENEMY_BARN_POS.y + 1;
      const nearestBuilding2 = placedBuildingsRef.current.filter(b => b.hp > 0).reduce<PlacedBuilding | null>((best, b) => !best || tileDist(dx, dy, b.x, b.y) < tileDist(dx, dy, best.x, best.y) ? b : best, null);
      const dDest = nearestBuilding2 ?? BARN_POS;
      const dPath = aStar(INITIAL_TILES, { x: dx, y: dy }, { x: dDest.x, y: dDest.y }, true, wallSet);
      const demolisher: EnemySiege = { id: siegeIdRef.current++, x: dx, y: dy, hp: DEMOLISHER_MAX_HP, maxHp: DEMOLISHER_MAX_HP, movingTo: dPath[0] ?? { x: dDest.x, y: dDest.y }, path: dPath.slice(1), state: 'moving', targetBuildingId: nearestBuilding2?.id ?? -1, siegeType: 'demolisher' };
      setEnemySiege(prev => [...prev, demolisher]);
      setWaveAnnouncement(`💣 Wave ${newWave} — DEMOLISHER! Protect your buildings!`);
      window.setTimeout(() => setWaveAnnouncement(null), 3500);
    }

    // Shaman spawn: wave 8+ every 4 waves
    if (newWave >= SHAMAN_FIRST_WAVE && newWave % 4 === 0) {
      const sx = Math.max(0, ENEMY_BARN_POS.x - 1);
      const sy = Math.max(0, ENEMY_BARN_POS.y - 1);
      const shamanPath = aStar(INITIAL_TILES, { x: sx, y: sy }, BARN_POS, true, wallSet);
      const shaman: EnemyShaman = { id: shamanIdRef.current++, x: sx, y: sy, hp: SHAMAN_MAX_HP, maxHp: SHAMAN_MAX_HP, movingTo: shamanPath[0] ?? BARN_POS, path: shamanPath.slice(1), state: 'moving' };
      setEnemyShamans(ss => [...ss, shaman]);
      setWaveAnnouncement(`🧙 Wave ${newWave} — SHAMAN SPAWNS! Kill the healer!`);
      window.setTimeout(() => setWaveAnnouncement(null), 3000);
    }

    // Troll spawn: wave 10+ every 5 waves
    if (newWave >= TROLL_FIRST_WAVE && newWave % 5 === 0) {
      const tx2 = Math.max(0, ENEMY_BARN_POS.x - 1);
      const ty2 = Math.max(0, ENEMY_BARN_POS.y + 1);
      const troll: EnemyTroll = { id: trollIdRef.current++, x: tx2, y: ty2, hp: TROLL_MAX_HP, maxHp: TROLL_MAX_HP, movingTo: null, path: [], state: 'moving', targetType: 'barn', targetId: null };
      setEnemyTrolls(ts => [...ts, troll]);
      setWaveAnnouncement(`🏹 Wave ${newWave} — TROLL ARCHER! Flank with cavalry!`);
      window.setTimeout(() => setWaveAnnouncement(null), 3000);
    }

    // Sapper spawn: wave 12+ every 6 waves
    if (newWave >= SAPPER_FIRST_WAVE && newWave % 6 === 0) {
      const sx2 = Math.max(0, ENEMY_BARN_POS.x - 2);
      const sy2 = ENEMY_BARN_POS.y;
      // Target: nearest wall, or barn if no walls
      const wallSet2 = new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`));
      const nearestWall = placedBuildingsRef.current.filter(b => b.type === 'wall' && b.hp > 0).sort((a, b2) => tileDist(sx2, sy2, a.x, a.y) - tileDist(sx2, sy2, b2.x, b2.y))[0];
      const sapperTarget = nearestWall ?? BARN_POS;
      const sapperPath = aStar(INITIAL_TILES, { x: sx2, y: sy2 }, { x: sapperTarget.x, y: sapperTarget.y }, true, wallSet2);
      const sapper: EnemySapper = { id: sapperIdRef.current++, x: sx2, y: sy2, hp: SAPPER_MAX_HP, maxHp: SAPPER_MAX_HP, movingTo: sapperPath[0] ?? { x: sapperTarget.x, y: sapperTarget.y }, path: sapperPath.slice(1), targetX: sapperTarget.x, targetY: sapperTarget.y, exploded: false };
      setEnemySappers(ss => [...ss, sapper]);
      setWaveAnnouncement(`💥 Wave ${newWave} — GOBLIN SAPPER! Kill it before it reaches your walls!`);
      window.setTimeout(() => setWaveAnnouncement(null), 4000);
    }

    // Necromancer spawn: wave 16+ every 5 waves
    if (newWave >= NECROMANCER_FIRST_WAVE && newWave % 5 === 0) {
      const nx = Math.max(0, ENEMY_BARN_POS.x - 2);
      const ny = ENEMY_BARN_POS.y - 1;
      const nPath = aStar(INITIAL_TILES, { x: nx, y: ny }, BARN_POS, true, wallSet);
      const necro: EnemyNecromancer = { id: necromancerIdRef.current++, x: nx, y: ny, hp: NECROMANCER_MAX_HP, maxHp: NECROMANCER_MAX_HP, movingTo: nPath[0] ?? BARN_POS, path: nPath.slice(1), state: 'moving' };
      setEnemyNecromancers(ns => [...ns, necro]);
      setWaveAnnouncement(`💀 Wave ${newWave} — NECROMANCER! Kill it before it raises the dead!`);
      window.setTimeout(() => setWaveAnnouncement(null), 4000);
    }

    // Witch Doctor spawn: wave 12+ every 3 waves
    if (newWave >= WITCH_DOCTOR_FIRST_WAVE && newWave % 3 === 2) {
      const wdx = Math.max(0, ENEMY_BARN_POS.x - 1);
      const wdy = Math.max(0, ENEMY_BARN_POS.y - 2);
      const wdPath = aStar(INITIAL_TILES, { x: wdx, y: wdy }, BARN_POS, true, wallSet);
      const wd: EnemyWitchDoctor = { id: witchDoctorIdRef.current++, x: wdx, y: wdy, hp: WITCH_DOCTOR_MAX_HP, maxHp: WITCH_DOCTOR_MAX_HP, movingTo: wdPath[0] ?? BARN_POS, path: wdPath.slice(1), state: 'moving' };
      setEnemyWitchDoctors(prev => [...prev, wd]);
      setWaveAnnouncement(`🔮 Wave ${newWave} — WITCH DOCTOR! Kill it or grunts go berserk!`);
      window.setTimeout(() => setWaveAnnouncement(null), 4000);
    }

    const nextDelay = Math.max(20000, GRUNT_SPAWN_MS - (newWave - 1) * 800);
    setNextWaveAt(Date.now() + nextDelay);
    spawnTimerRef.current = window.setTimeout(doSpawnWave, nextDelay);

    // Wave preview: show composition ~6s before next wave
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    const previewWave = newWave + 1;
    const previewDelay = Math.max(0, nextDelay - 6000);
    previewTimerRef.current = window.setTimeout(() => {
      if (gameOverRef.current) return;
      const gruntCount = previewWave + 2 + (previewWave % 3 === 0 ? previewWave + 2 : 0);
      const parts: string[] = [`${gruntCount} Grunts`];
      if (previewWave % 10 === 0) parts.push('1 WAR BULL 🐂');
      if (previewWave >= 8 && previewWave % 4 === 0) parts.push('1 Shaman 🧙');
      if (previewWave >= 12 && previewWave % 3 === 2) parts.push('1 Witch Doctor 🔮');
      if (previewWave >= 10 && previewWave % 5 === 0) parts.push('1 Troll 🏹');
      if (previewWave >= 12 && previewWave % 6 === 0) parts.push('1 Sapper 💥');
      if (previewWave >= 14 && previewWave % 4 === 0) parts.push('1 Demolisher 💣');
      if (previewWave >= 16 && previewWave % 5 === 0) parts.push('1 Necromancer 💀');
      if (previewWave >= 6 && previewWave % 3 === 0) parts.push('1 War Ram 🪵');
      setWavePreview(`⚠ INCOMING Wave ${previewWave}: ${parts.join(', ')}`);
      window.setTimeout(() => setWavePreview(null), 5500);
    }, previewDelay);
  }, []);

  useEffect(() => {
    if (gameOver) { if (spawnTimerRef.current) { clearTimeout(spawnTimerRef.current); spawnTimerRef.current = null; } return; }
    setNextWaveAt(Date.now() + GRUNT_SPAWN_MS);
    spawnTimerRef.current = window.setTimeout(doSpawnWave, GRUNT_SPAWN_MS);
    return () => { if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current); };
  }, [gameOver, doSpawnWave]);

  // Loot crate spawner — a random crate appears every 45s on a safe tile
  useEffect(() => {
    if (gameOver) return;
    const spawnCrate = () => {
      if (gameOverRef.current) return;
      const RESOURCES = [
        { gold: 30, lumber: 0, stone: 0 }, { gold: 0, lumber: 25, stone: 0 }, { gold: 0, lumber: 0, stone: 20 },
        { gold: 15, lumber: 10, stone: 0 }, { gold: 20, lumber: 0, stone: 15 },
      ];
      const res = RESOURCES[Math.floor(Math.random() * RESOURCES.length)] ?? { gold: 30, lumber: 0, stone: 0 };
      const candidates = LOOT_CRATE_POSITIONS.filter(p => {
        const occupied = lootCrates.some(c => c.x === p.x && c.y === p.y);
        return !occupied;
      });
      if (candidates.length === 0) { window.setTimeout(spawnCrate, LOOT_CRATE_SPAWN_MS); return; }
      const pos = candidates[Math.floor(Math.random() * candidates.length)];
      if (!pos) { window.setTimeout(spawnCrate, LOOT_CRATE_SPAWN_MS); return; }
      setLootCrates(cs => [...cs, { id: lootCrateIdRef.current++, x: pos.x, y: pos.y, gold: res.gold, lumber: res.lumber, stone: res.stone }]);
      window.setTimeout(spawnCrate, LOOT_CRATE_SPAWN_MS);
    };
    const t = window.setTimeout(spawnCrate, LOOT_CRATE_SPAWN_MS);
    return () => clearTimeout(t);
  }, [gameOver]);

  // Shrine capture polling — check every 200ms if channeling worker is still on shrine tile
  useEffect(() => {
    if (gameOver) return;
    const interval = window.setInterval(() => {
      if (gameOverRef.current) return;
      const cap = shrineCapturingRef.current;
      if (!cap) return;
      const shrine = SHRINES.find(s => s.id === cap.shrineId);
      if (!shrine || capturedShrinesRef.current.has(shrine.id)) { setShrineCapturing(null); return; }
      const worker = workersRef.current.find(w => w.id === cap.workerId && w.hp > 0);
      if (!worker || Math.round(worker.x) !== shrine.x || Math.round(worker.y) !== shrine.y || worker.movingTo !== null) {
        setShrineCapturing(null);
        return;
      }
      if (Date.now() - cap.startedAt >= shrine.captureMs) {
        setCapturedShrines(s => { const ns = new Set(s); ns.add(shrine.id); return ns; });
        setShrineCapturing(null);
        if (shrine.type === 'war') { setShrineWarBuff(true); addFloatingText(shrine.x, shrine.y, '⚔️ WAR SHRINE!', '#f97316'); }
        else { setShrinePlentyBuff(true); addFloatingText(shrine.x, shrine.y, '🌾 PLENTY SHRINE!', '#4ade80'); }
      }
    }, 200);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Archer tower attack loop
  useEffect(() => {
    if (gameOver) {
      if (archerTowerTimerRef.current) { clearTimeout(archerTowerTimerRef.current); archerTowerTimerRef.current = null; }
      return;
    }
    const fireArrow = () => {
      if (gameOverRef.current) return;
      const inRange = workersRef.current.filter(w => w.hp > 0 && tileDist(w.x, w.y, ARCHER_TOWER_POS.x, ARCHER_TOWER_POS.y) <= ARCHER_TOWER_RANGE);
      if (inRange.length > 0) {
        const target = inRange.reduce((a, b) => tileDist(a.x, a.y, ARCHER_TOWER_POS.x, ARCHER_TOWER_POS.y) < tileDist(b.x, b.y, ARCHER_TOWER_POS.x, ARCHER_TOWER_POS.y) ? a : b);
        setWorkers(prev => prev.map(w => w.id === target.id ? { ...w, hp: Math.max(0, w.hp - ARCHER_TOWER_DAMAGE) } : w));
        addFloatingText(Math.round(target.x), Math.round(target.y), `🏹-${ARCHER_TOWER_DAMAGE}`, '#fb923c');
      }
      archerTowerTimerRef.current = window.setTimeout(fireArrow, ARCHER_TOWER_ATTACK_MS);
    };
    archerTowerTimerRef.current = window.setTimeout(fireArrow, ARCHER_TOWER_ATTACK_MS);
    return () => { if (archerTowerTimerRef.current) { clearTimeout(archerTowerTimerRef.current); archerTowerTimerRef.current = null; } };
  }, [gameOver, addFloatingText]);

  // Enemy fortress towers fire at workers in range
  useEffect(() => {
    if (gameOver || enemyTowers.length === 0) return;
    const scheduleShot = (towerId: number, tx: number, ty: number) => {
      enemyTowerTimersRef.current[towerId] = window.setTimeout(() => {
        delete enemyTowerTimersRef.current[towerId];
        if (gameOverRef.current) return;
        if (!enemyTowersRef.current.find(t => t.id === towerId && t.hp > 0)) return;
        const dmg = Math.max(1, ENEMY_TOWER_DAMAGE - blacksmithUpgradesRef.current.ironHide * 2);
        const inRange = workersRef.current.filter(w => w.hp > 0 && tileDist(w.x, w.y, tx, ty) <= ENEMY_TOWER_RANGE);
        if (inRange.length > 0) {
          const target = inRange.reduce((a, b) => tileDist(a.x, a.y, tx, ty) < tileDist(b.x, b.y, tx, ty) ? a : b);
          setWorkers(prev => prev.map(w => w.id === target.id ? { ...w, hp: Math.max(0, w.hp - dmg) } : w));
          addFloatingText(Math.round(target.x), Math.round(target.y), `🏹-${dmg}`, '#dc2626');
        }
        scheduleShot(towerId, tx, ty);
      }, ENEMY_TOWER_ATTACK_MS);
    };
    enemyTowers.filter(t => t.hp > 0).forEach(t => { if (!enemyTowerTimersRef.current[t.id]) scheduleShot(t.id, t.x, t.y); });
    return () => { Object.values(enemyTowerTimersRef.current).forEach(clearTimeout); enemyTowerTimersRef.current = {}; };
  }, [enemyTowers, gameOver, addFloatingText]);

  // Player watchtowers fire arrows at enemy grunts in range
  useEffect(() => {
    const towers = placedBuildings.filter(b => b.type === 'watchtower');
    if (gameOver || towers.length === 0) return;
    const scheduleShot = (towerId: number, tx: number, ty: number) => {
      watchtowerTimersRef.current[towerId] = window.setTimeout(() => {
        delete watchtowerTimersRef.current[towerId];
        if (gameOverRef.current) return;
        const grunts = enemyGruntsRef.current;
        const isGuard = guardTowerRef.current;
        const garrisonCount = (towerGarrisonRef.current[towerId] ?? []).length;
        const dmgT = (isGuard ? WATCHTOWER_DAMAGE + 7 : WATCHTOWER_DAMAGE) + garrisonCount * 4;
        const rangeT = (isGuard ? WATCHTOWER_ATTACK_RANGE + 1 : WATCHTOWER_ATTACK_RANGE) + garrisonCount * 0.5;
        const inRangeT = grunts.filter(g => tileDist(g.x, g.y, tx, ty) <= rangeT);
        const targetT = inRangeT.reduce<EnemyGrunt | null>((best, g) => (!best || tileDist(g.x, g.y, tx, ty) < tileDist(best.x, best.y, tx, ty) ? g : best), null);
        if (targetT) {
          setEnemyGrunts(gs => gs.map(g => g.id === targetT.id ? { ...g, hp: Math.max(0, g.hp - dmgT) } : g));
          addFloatingText(Math.round(targetT.x), Math.round(targetT.y), `${isGuard ? '🏰' : '🏹'}-${dmgT}`, '#22d3ee');
        }
        scheduleShot(towerId, tx, ty);
      }, WATCHTOWER_ATTACK_MS);
    };
    towers.forEach(t => { if (!watchtowerTimersRef.current[t.id]) scheduleShot(t.id, t.x, t.y); });
    return () => { Object.values(watchtowerTimersRef.current).forEach(clearTimeout); watchtowerTimersRef.current = {}; };
  }, [placedBuildings, gameOver, addFloatingText]);

  // Frost Tower auto-fire — slows + chips grunts in range
  const frostTowerTimersRef = useRef<Record<number, number>>({});
  useEffect(() => {
    if (gameOver) return;
    const frostTowers = placedBuildings.filter(b => b.type === 'frostTower' && b.hp > 0);
    const scheduleFrost = (towerId: number, tx: number, ty: number) => {
      frostTowerTimersRef.current[towerId] = window.setTimeout(() => {
        delete frostTowerTimersRef.current[towerId];
        if (gameOverRef.current) return;
        const grunts = enemyGruntsRef.current.filter(g => g.hp > 0);
        const target = grunts.reduce<EnemyGrunt | null>((best, g) => (!best || tileDist(g.x, g.y, tx, ty) < tileDist(best.x, best.y, tx, ty) ? g : best), null);
        if (target && tileDist(target.x, target.y, tx, ty) <= FROST_TOWER_RANGE) {
          const freezeUntil = Date.now() + FROST_TOWER_SLOW_DURATION;
          setEnemyGrunts(gs => gs.map(g => g.id === target.id ? { ...g, hp: Math.max(0, g.hp - FROST_TOWER_DAMAGE), frozenUntil: freezeUntil } : g));
          addFloatingText(Math.round(target.x), Math.round(target.y), `❄️-${FROST_TOWER_DAMAGE}`, '#93c5fd');
        }
        scheduleFrost(towerId, tx, ty);
      }, FROST_TOWER_ATTACK_MS);
    };
    frostTowers.forEach(t => { if (!frostTowerTimersRef.current[t.id]) scheduleFrost(t.id, t.x, t.y); });
    return () => { Object.values(frostTowerTimersRef.current).forEach(clearTimeout); frostTowerTimersRef.current = {}; };
  }, [placedBuildings, gameOver, addFloatingText]);

  // Ballista Tower auto-fire — piercing bolt hits primary target + nearby grunts
  const ballistaTimersRef = useRef<Record<number, number>>({});
  useEffect(() => {
    if (gameOver) return;
    const ballistaTowers = placedBuildings.filter(b => b.type === 'ballista' && b.hp > 0);
    const scheduleBallista = (towerId: number, tx: number, ty: number) => {
      ballistaTimersRef.current[towerId] = window.setTimeout(() => {
        delete ballistaTimersRef.current[towerId];
        if (gameOverRef.current) return;
        const grunts = enemyGruntsRef.current.filter(g => g.hp > 0 && tileDist(g.x, g.y, tx, ty) <= BALLISTA_RANGE);
        const primary = grunts.reduce<EnemyGrunt | null>((best, g) => (!best || tileDist(g.x, g.y, tx, ty) < tileDist(best.x, best.y, tx, ty) ? g : best), null);
        if (primary) {
          const px = primary.x, py = primary.y;
          setEnemyGrunts(gs => gs.map(g => {
            if (g.id === primary.id) { addFloatingText(Math.round(px), Math.round(py), `🏹-${BALLISTA_DAMAGE}`, '#f59e0b'); return { ...g, hp: Math.max(0, g.hp - BALLISTA_DAMAGE) }; }
            if (tileDist(g.x, g.y, px, py) <= BALLISTA_PIERCE_RANGE) { addFloatingText(Math.round(g.x), Math.round(g.y), `-${BALLISTA_PIERCE_DAMAGE}`, '#fbbf24'); return { ...g, hp: Math.max(0, g.hp - BALLISTA_PIERCE_DAMAGE) }; }
            return g;
          }));
        }
        scheduleBallista(towerId, tx, ty);
      }, BALLISTA_ATTACK_MS);
    };
    ballistaTowers.forEach(t => { if (!ballistaTimersRef.current[t.id]) scheduleBallista(t.id, t.x, t.y); });
    return () => { Object.values(ballistaTimersRef.current).forEach(clearTimeout); ballistaTimersRef.current = {}; };
  }, [placedBuildings, gameOver, addFloatingText]);

  // Player barn defense fire — scales with wave and garrison count; Last Stand at <25% HP
  const barnArrowTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (gameOver) return;
    const BARN_DEFENSE_RANGE = 5;
    const BARN_DEFENSE_MS = 2500;
    const fireBarnArrow = () => {
      if (gameOverRef.current) return;
      // Damage: 10 base + 1 per 3 waves + 3 per garrisoned unit
      const waveDmgBonus = Math.floor(waveRef.current / 3);
      const garrisonDmgBonus = garrisonedRef.current.length * 3;
      const lastStand = playerBarnHpRef.current / PLAYER_BARN_MAX_HP < 0.25;
      const dmg = (10 + waveDmgBonus + garrisonDmgBonus) * (lastStand ? 2 : 1);
      const target = enemyGruntsRef.current.reduce<EnemyGrunt | null>((best, g) => {
        if (tileDist(g.x, g.y, BARN_POS.x, BARN_POS.y) > BARN_DEFENSE_RANGE) return best;
        if (!best || tileDist(g.x, g.y, BARN_POS.x, BARN_POS.y) < tileDist(best.x, best.y, BARN_POS.x, BARN_POS.y)) return g;
        return best;
      }, null);
      if (target) {
        setEnemyGrunts(gs => gs.map(g => g.id === target.id ? { ...g, hp: Math.max(0, g.hp - dmg) } : g));
        addFloatingText(Math.round(target.x), Math.round(target.y), `🏰-${dmg}`, '#fbbf24');
      }
      const fireDelay = playerBarnHpRef.current / PLAYER_BARN_MAX_HP < 0.25 ? BARN_DEFENSE_MS / 2 : BARN_DEFENSE_MS;
      barnArrowTimerRef.current = window.setTimeout(fireBarnArrow, fireDelay);
    };
    barnArrowTimerRef.current = window.setTimeout(fireBarnArrow, BARN_DEFENSE_MS);
    return () => { if (barnArrowTimerRef.current) clearTimeout(barnArrowTimerRef.current); };
  }, [gameOver, addFloatingText]);

  // Barn HP regen from garrison: +2 HP/s per garrisoned unit, capped at max HP
  useEffect(() => {
    if (gameOver || garrisoned.length === 0) return;
    const id = setInterval(() => {
      if (gameOverRef.current) return;
      const count = garrisonedRef.current.length;
      if (count === 0) return;
      const regen = count * 2;
      setPlayerBarnHp(hp => {
        const next = Math.min(PLAYER_BARN_MAX_HP, hp + regen);
        if (next > hp) addFloatingText(BARN_POS.x, BARN_POS.y, `+${regen}🏰`, '#4ade80');
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gameOver, garrisoned.length, addFloatingText]);

  // Training queue drain — tick every 100ms; spawn unit when elapsed >= TRAIN_TIME_MS
  useEffect(() => {
    if (gameOver) return;
    const tick = () => {
      if (gameOverRef.current) return;
      const queue = trainingQueueRef.current;
      if (queue.length === 0) { trainingElapsedRef.current = 0; setTrainingProgress(0); return; }
      trainingElapsedRef.current += 100;
      const pct = Math.min(1, trainingElapsedRef.current / TRAIN_TIME_MS);
      setTrainingProgress(pct);
      if (trainingElapsedRef.current < TRAIN_TIME_MS) return;
      trainingElapsedRef.current = 0;
      const first = queue[0];
      if (!first) return;
      const type = first.type;
      setTrainingQueue(q => q.slice(1));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const rp = rallyPointRef.current;
        const unit = makeUnit(newId, BARN_POS.x, BARN_POS.y, type);
        if (rp) { const path = aStar(INITIAL_TILES, BARN_POS, rp); return [...ws, { ...unit, movingTo: path[0] ?? rp, path: path.slice(1), state: 'moving' as const }]; }
        return [...ws, unit];
      });
      addFloatingText(BARN_POS.x, BARN_POS.y, type === 'swordsman' ? '⚔️ Ready!' : '🐴 Ready!', '#4ade80');
    };
    const id = window.setInterval(tick, 100);
    return () => clearInterval(id);
  }, [gameOver, addFloatingText]);

  // Spike Trap — deal 20 dmg to any grunt that steps within 0.5 tiles; 30s cooldown per trap
  useEffect(() => {
    if (gameOver) return;
    const TRAP_DAMAGE = 20;
    const TRAP_COOLDOWN_MS = 30000;
    const TRAP_RADIUS = 0.8;
    const checkTraps = () => {
      if (gameOverRef.current) return;
      const traps = placedBuildingsRef.current.filter(b => b.type === 'spikeTrap');
      const now = Date.now();
      const grunts = enemyGruntsRef.current;
      traps.forEach(trap => {
        const lastTrigger = trapTriggeredRef.current[trap.id] ?? 0;
        if (now - lastTrigger < TRAP_COOLDOWN_MS) return; // still on cooldown
        const victim = grunts.find(g => g.hp > 0 && tileDist(g.x, g.y, trap.x, trap.y) <= TRAP_RADIUS);
        if (!victim) return;
        trapTriggeredRef.current[trap.id] = now;
        setEnemyGrunts(gs => gs.map(g => g.id === victim.id ? { ...g, hp: Math.max(0, g.hp - TRAP_DAMAGE) } : g));
        addFloatingText(trap.x, trap.y, `🪤-${TRAP_DAMAGE}`, '#fbbf24');
      });
    };
    const id = window.setInterval(checkTraps, 250);
    return () => clearInterval(id);
  }, [gameOver, addFloatingText]);

  // Windmill passive gold income
  useEffect(() => {
    if (gameOver) return;
    const mills = placedBuildings.filter(b => b.type === 'windmill');
    if (mills.length === 0) return;
    const id = setInterval(() => {
      if (gameOverRef.current) return;
      const income = mills.length * 2;
      setResources(r => ({ ...r, gold: r.gold + income }));
      mills.forEach(m => addFloatingText(m.x, m.y, `+${income / mills.length}🪙`, '#fde68a'));
    }, 5000);
    return () => clearInterval(id);
  }, [placedBuildings, gameOver, addFloatingText]);

  // Garrison heal
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => {
      if (gameOverRef.current) return;
      setGarrisoned(gs => {
        const healed = gs.map(u => u.hp < u.maxHp ? { ...u, hp: Math.min(u.maxHp, u.hp + GARRISON_HEAL_AMOUNT) } : u);
        return healed;
      });
    }, GARRISON_HEAL_MS);
    return () => clearInterval(id);
  }, [gameOver]);

  const handleTowerGarrison = useCallback((towerId: number, tx: number, ty: number) => {
    const TOWER_CAP = 3;
    setWorkers(ws => {
      const current = towerGarrisonRef.current[towerId] ?? [];
      const slots = TOWER_CAP - current.length;
      if (slots <= 0) return ws;
      const selected = ws.filter(w => w.selected && w.unitType !== 'catapult' && w.unitType !== 'trebuchet').slice(0, slots);
      if (selected.length === 0) return ws;
      const ids = new Set(selected.map(w => w.id));
      setTowerGarrison(tg => ({ ...tg, [towerId]: [...(tg[towerId] ?? []), ...selected.map(w => ({ ...w, selected: false, state: 'idle' as const, movingTo: null, path: [], gathering: null, attacking: null, repairing: null, patrol: null, attackMove: false, attackMoveTarget: null }))] }));
      setResources(r => ({ ...r, food: r.food - selected.length }));
      addFloatingText(tx, ty, `+${selected.length} 🏰`, '#22d3ee');
      return ws.filter(w => !ids.has(w.id));
    });
  }, [addFloatingText]);

  const handleTowerDeploy = useCallback((towerId: number, tx: number, ty: number) => {
    const units = towerGarrisonRef.current[towerId] ?? [];
    if (units.length === 0) return;
    setTowerGarrison(tg => { const next = { ...tg }; delete next[towerId]; return next; });
    setWorkers(ws => [...ws, ...units.map((u, i) => ({ ...u, x: tx + (i % 2 === 0 ? -1 : 1), y: ty + Math.floor(i / 2), selected: false }))]);
    setResources(r => ({ ...r, food: r.food + units.length }));
  }, []);

  const handleGarrison = useCallback(() => {
    setWorkers(ws => {
      const slots = GARRISON_CAP - garrisonedRef.current.length;
      if (slots <= 0) return ws;
      const toGarrison = ws.filter(w => w.selected).slice(0, slots);
      if (toGarrison.length === 0) return ws;
      const ids = new Set(toGarrison.map(w => w.id));
      setGarrisoned(g => [...g, ...toGarrison.map(w => ({ ...w, selected: false, state: 'idle' as const, movingTo: null, path: [], gathering: null, attacking: null, repairing: null, patrol: null }))]);
      setResources(r => ({ ...r, food: r.food - toGarrison.length }));
      return ws.filter(w => !ids.has(w.id));
    });
  }, []);

  const handleUngarrison = useCallback(() => {
    const units = garrisonedRef.current;
    if (units.length === 0) return;
    setGarrisoned([]);
    setWorkers(ws => {
      const newId = Math.max(...ws.map(w => w.id), ...units.map(u => u.id), 0);
      void newId;
      const deployed = units.map((u, i) => ({ ...u, x: BARN_POS.x + (i % 3) - 1, y: BARN_POS.y + Math.floor(i / 3) + 1 }));
      setResources(r => ({ ...r, food: r.food + units.length }));
      return [...ws, ...deployed];
    });
  }, []);

  const handleHeroAbility = useCallback(() => {
    if (heroAbilityCooldown > 0) return;
    const hero = workersRef.current.find(w => w.unitType === 'hero');
    if (!hero) return;
    const hx = Math.round(hero.x), hy = Math.round(hero.y);
    setEnemyGrunts(gs => gs.map(g => {
      if (tileDist(g.x, g.y, hx, hy) <= HERO_ABILITY_RADIUS) {
        addFloatingText(Math.round(g.x), Math.round(g.y), `-${HERO_ABILITY_DAMAGE}🗡️`, '#f59e0b');
        return { ...g, hp: Math.max(0, g.hp - HERO_ABILITY_DAMAGE) };
      }
      return g;
    }));
    addFloatingText(hx, hy, '⚡ Rallying Cry!', '#fbbf24');
    setHeroAbilityCooldown(HERO_ABILITY_COOLDOWN_S);
  }, [heroAbilityCooldown, addFloatingText]);

  const handleBattleShout = useCallback(() => {
    if (heroShoutCooldown > 0) return;
    const hero = workersRef.current.find(w => w.unitType === 'hero' && w.hp > 0 && w.level >= 2);
    if (!hero) return;
    const until = Date.now() + HERO_SHOUT_DURATION_MS;
    setBattleShoutUntil(until);
    addFloatingText(Math.round(hero.x), Math.round(hero.y), '📯 Battle Shout!', '#fb923c');
    workersRef.current.filter(w => w.hp > 0 && w.id !== hero.id && tileDist(w.x, w.y, hero.x, hero.y) <= HERO_SHOUT_RADIUS).forEach(w => {
      addFloatingText(Math.round(w.x), Math.round(w.y), '⚡ HASTED!', '#fbbf24');
    });
    setHeroShoutCooldown(HERO_SHOUT_COOLDOWN_S);
  }, [heroShoutCooldown, addFloatingText]);

  const handleHarvestBoon = useCallback(() => {
    if (harvestBoonCooldown > 0 || harvestBoonActive) return;
    const hero = workersRef.current.find(w => w.unitType === 'hero');
    if (!hero) return;
    setHarvestBoonActive(true);
    harvestBoonRef.current = true;
    addFloatingText(Math.round(hero.x), Math.round(hero.y), '🌾 Harvest Boon!', '#86efac');
    workers.forEach(w => { if (w.unitType === 'farmer') addFloatingText(Math.round(w.x), Math.round(w.y), '⚡', '#86efac'); });
    setHarvestBoonCooldown(40);
    window.setTimeout(() => {
      setHarvestBoonActive(false);
      harvestBoonRef.current = false;
    }, 10000);
  }, [harvestBoonCooldown, harvestBoonActive, addFloatingText, workers]);

  const handleSwordsmanCharge = useCallback(() => {
    const swords = workersRef.current.filter(w => w.selected && w.unitType === 'swordsman' && w.chargeCooldown <= 0);
    if (swords.length === 0) return;
    const allGrunts = enemyGruntsRef.current.filter(g => g.hp > 0);
    if (allGrunts.length === 0) return;
    swords.forEach(sw => {
      const nearest = allGrunts.reduce<EnemyGrunt | null>((best, g) => (!best || tileDist(sw.x, sw.y, g.x, g.y) < tileDist(best.x, best.y, sw.x, sw.y) ? g : best), null);
      if (!nearest) return;
      const dmg = (ATTACK_DAMAGE + SWORDSMAN_DAMAGE_BONUS + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + (shrineWarBuffRef.current ? 5 : 0)) * SWORDSMAN_CHARGE_DAMAGE_MULT;
      addFloatingText(Math.round(nearest.x), Math.round(nearest.y), `⚔️-${dmg}`, '#ef4444');
      addFloatingText(Math.round(sw.x), Math.round(sw.y), '⚡ Charge!', '#fbbf24');
      setEnemyGrunts(gs => gs.map(g => g.id === nearest.id ? { ...g, hp: Math.max(0, g.hp - dmg) } : g));
    });
    setWorkers(ws => ws.map(w => swords.some(s => s.id === w.id) ? { ...w, chargeCooldown: SWORDSMAN_CHARGE_COOLDOWN_S } : w));
  }, [addFloatingText]);

  const handleCavalrySprint = useCallback(() => {
    const cav = workersRef.current.filter(w => w.selected && w.unitType === 'cavalry' && w.sprintCooldown <= 0);
    if (cav.length === 0) return;
    const ids = new Set(cav.map(w => w.id));
    setWorkers(ws => ws.map(w => ids.has(w.id) ? { ...w, sprinting: true, sprintCooldown: CAVALRY_SPRINT_COOLDOWN_S } : w));
    cav.forEach(c => addFloatingText(Math.round(c.x), Math.round(c.y), '🐴 Sprint!', '#f59e0b'));
    window.setTimeout(() => {
      setWorkers(ws => ws.map(w => ids.has(w.id) ? { ...w, sprinting: false } : w));
    }, CAVALRY_SPRINT_DURATION_MS);
  }, [addFloatingText]);

  const isTileOccupied = useCallback((x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return true;
    if (tiles[x]?.[y] === 'water') return true;
    if (x === BARN_POS.x && y === BARN_POS.y) return true;
    if (x === ENEMY_BARN_POS.x && y === ENEMY_BARN_POS.y) return true;
    if (trees.some(t => t.x === x && t.y === y && t.amount > 0)) return true;
    if (goldMines.some(m => m.x === x && m.y === y && m.amount > 0)) return true;
    if (stoneNodes.some(s => s.x === x && s.y === y && s.amount > 0)) return true;
    if (placedBuildings.some(b => b.x === x && b.y === y)) return true;
    return false;
  }, [tiles, trees, goldMines, stoneNodes, placedBuildings]);

  const clientToSvg = useCallback((cx: number, cy: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = cx; pt.y = cy;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }, []);

  const FORMATION_OFFSETS = [
    { dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
    { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 },
  ];

  /** Issue a move command to selected workers using A*; spreads into formation when pure move */
  const commandMove = useCallback((targetX: number, targetY: number, gathering?: WorkerState['gathering'], attacking?: WorkerState['attacking']) => {
    setWorkers(ws => {
      const selected = ws.filter(w => w.selected);
      let idx = 0;
      return ws.map(w => {
        if (!w.selected) return w;
        if (gathering && (w.unitType === 'swordsman' || w.unitType === 'catapult' || w.unitType === 'trebuchet' || w.unitType === 'hero' || w.unitType === 'cavalry')) return w;
        const isFormation = !gathering && !attacking;
        const offset = isFormation ? (FORMATION_OFFSETS[idx++] ?? { dx: 0, dy: 0 }) : { dx: 0, dy: 0 };
        const tx = Math.max(0, Math.min(GRID_SIZE - 1, targetX + offset.dx));
        const ty = Math.max(0, Math.min(GRID_SIZE - 1, targetY + offset.dy));
        const dest = INITIAL_TILES[tx]?.[ty] === 'water' ? { x: targetX, y: targetY } : { x: tx, y: ty };
        const startTile = { x: Math.round(w.x), y: Math.round(w.y) };
        const rawPath = aStar(INITIAL_TILES, startTile, dest);
        const first = rawPath[0] ?? dest;
        return { ...w, movingTo: first, path: rawPath.slice(1), gathering: gathering ?? null, attacking: attacking ?? null, repairing: null, attackMove: false, attackMoveTarget: null, patrol: null, holdPosition: false, waypoints: [], state: 'moving' };
      });
    });
  }, []);

  // Shift+right-click: append waypoint to queue
  const commandQueueMove = useCallback((targetX: number, targetY: number) => {
    setWorkers(ws => {
      const selected = ws.filter(w => w.selected);
      let idx = 0;
      return ws.map(w => {
        if (!w.selected) return w;
        const offset = FORMATION_OFFSETS[idx++] ?? { dx: 0, dy: 0 };
        const tx = Math.max(0, Math.min(GRID_SIZE - 1, targetX + offset.dx));
        const ty = Math.max(0, Math.min(GRID_SIZE - 1, targetY + offset.dy));
        const dest = INITIAL_TILES[tx]?.[ty] === 'water' ? { x: targetX, y: targetY } : { x: tx, y: ty };
        // If unit is idle or has no movingTo, start moving immediately; otherwise append waypoint
        if (!w.movingTo && w.state !== 'moving') {
          const startTile = { x: Math.round(w.x), y: Math.round(w.y) };
          const rawPath = aStar(INITIAL_TILES, startTile, dest);
          return { ...w, movingTo: rawPath[0] ?? dest, path: rawPath.slice(1), gathering: null, attacking: null, repairing: null, patrol: null, waypoints: [], state: 'moving' as const };
        }
        return { ...w, waypoints: [...(w.waypoints ?? []), dest] };
      });
    });
  }, []);

  // Mouse handlers
  const handleSvgMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0 || buildMode) return;
    const coords = clientToSvg(e.clientX, e.clientY);
    if (!coords) return;
    isDraggingRef.current = true;
    setDragBox({ start: { x: coords.x, y: coords.y }, end: { x: coords.x, y: coords.y } });
  }, [clientToSvg, buildMode]);

  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (buildMode) {
      const coords = clientToSvg(e.clientX, e.clientY);
      if (coords) { const { tx, ty } = svgToTile(coords.x, coords.y); setGhostTile({ x: tx, y: ty }); }
      return;
    }
    if (!isDraggingRef.current) return;
    const coords = clientToSvg(e.clientX, e.clientY);
    if (coords) setDragBox(db => db ? { ...db, end: { x: coords.x, y: coords.y } } : null);
  }, [clientToSvg, buildMode]);

  const handleSvgMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (buildMode && e.button === 0) {
      const coords = clientToSvg(e.clientX, e.clientY);
      if (coords) {
        const { tx, ty } = svgToTile(coords.x, coords.y);
        if (!isTileOccupied(tx, ty)) {
          const cost = BUILDING_COSTS[buildMode];
          setResources(r => {
            if (r.gold < cost.gold || r.lumber < cost.lumber || r.stone < cost.stone) return r;
            setPlacedBuildings(bs => { const maxHp = BUILDING_MAX_HP[buildMode]; return [...bs, { id: buildingIdRef.current++, type: buildMode, x: tx, y: ty, hp: maxHp, maxHp }]; });
            return { ...r, gold: r.gold - cost.gold, lumber: r.lumber - cost.lumber, stone: r.stone - cost.stone, foodCap: cost.foodCapBonus > 0 ? r.foodCap + cost.foodCapBonus : r.foodCap };
          });
          setBuildMode(null); setGhostTile(null);
        }
      }
      return;
    }
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setDragBox(db => {
      if (!db) return null;
      const coords = clientToSvg(e.clientX, e.clientY);
      const end = coords ?? db.end;
      if (Math.abs(end.x - db.start.x) > 8 || Math.abs(end.y - db.start.y) > 8) {
        const minX = Math.min(db.start.x, end.x), maxX = Math.max(db.start.x, end.x);
        const minY = Math.min(db.start.y, end.y), maxY = Math.max(db.start.y, end.y);
        setWorkers(ws => {
          const hit = ws.filter(w => { const { isoX, isoY } = tileToSvg(w.x, w.y); const wx = isoX + TILE_SIZE / 2, wy = isoY + 18; return wx >= minX && wx <= maxX && wy >= minY && wy <= maxY; });
          if (hit.length === 0) return ws;
          setSelectedType('worker');
          const hitIds = new Set(hit.map(w => w.id));
          return ws.map(w => ({ ...w, selected: hitIds.has(w.id) }));
        });
      }
      return null;
    });
  }, [clientToSvg, buildMode, isTileOccupied]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setBuildMode(null); setGhostTile(null); setPatrolMode(false); setAttackMoveMode(false); }
      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
        setWorkers(ws => { if (ws.some(w => w.selected)) { setPatrolMode(m => !m); } return ws; });
      }
      if ((e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.metaKey) {
        setWorkers(ws => { if (ws.some(w => w.selected && w.unitType !== 'farmer' && w.unitType !== 'catapult' && w.unitType !== 'trebuchet')) { setAttackMoveMode(m => !m); } return ws; });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Ctrl+A: select all living units
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setWorkers(ws => ws.map(w => w.hp > 0 ? { ...w, selected: true } : w));
        setSelectedType('worker');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Command hotkeys: F=train farmer, Q=train swordsman, R=cavalry, Delete=stop, G=garrison
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); handleFarmhouseAction('train'); }
      if (e.key === 'q' || e.key === 'Q') { e.preventDefault(); handleFarmhouseAction('trainSwordsman'); }
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); handleFarmhouseAction('trainCavalry'); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        setWorkers(ws => ws.map(w => w.selected ? { ...w, movingTo: null, path: [], gathering: null, attacking: null, repairing: null, attackMove: false, attackMoveTarget: null, patrol: null, holdPosition: false, waypoints: [], state: 'idle' as const } : w));
      }
      if (e.key === 'g' || e.key === 'G') { e.preventDefault(); handleGarrison(); }
      if (e.key === 'c' || e.key === 'C') { e.preventDefault(); handleSwordsmanCharge(); }
      if (e.key === 's' || e.key === 'S') { e.preventDefault(); handleCavalrySprint(); }
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setWorkers(ws => ws.map(w => w.selected ? { ...w, holdPosition: true, movingTo: null, path: [], patrol: null, attackMove: false, attackMoveTarget: null, waypoints: [], state: 'idle' as const } : w));
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        setWorkers(ws => {
          const idleWorkers = ws.filter(w => w.hp > 0 && w.state === 'idle' && !w.gathering && !w.attacking && !w.repairing);
          if (idleWorkers.length === 0) return ws;
          const idx = idleWorkerIndexRef.current % idleWorkers.length;
          idleWorkerIndexRef.current = (idx + 1) % idleWorkers.length;
          const target = idleWorkers[idx] ?? idleWorkers[0];
          if (!target) return ws;
          // Pan camera to center on this worker
          const { isoX, isoY } = tileToSvg(target.x, target.y);
          const svgEl = svgRef.current;
          if (svgEl) {
            const rect = svgEl.getBoundingClientRect();
            setCamera({ x: rect.width / 2 - isoX - TILE_SIZE / 2, y: rect.height / 2 - isoY - 18 });
          }
          setSelectedType('worker');
          return ws.map(w => ({ ...w, selected: w.id === target.id }));
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (isNaN(num) || num < 1 || num > 9) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const ids = workers.filter(w => w.selected).map(w => w.id);
        if (!ids.length) return;
        setControlGroups(cg => ({ ...cg, [num]: ids }));
        setWorkers(ws => ws.map(w => w.selected ? { ...w, group: num } : (w.group === num ? { ...w, group: null } : w)));
      } else {
        setControlGroups(cg => {
          const ids = cg[num];
          if (!ids?.length) return cg;
          setSelectedType('worker');
          setWorkers(ws => ws.map(w => ({ ...w, selected: ids.includes(w.id) })));
          return cg;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [workers]);

  // Animation loop
  useEffect(() => {
    function animate(timestamp: number) {
      const deltaTime = prevTimeRef.current !== null ? (timestamp - prevTimeRef.current) / 1000 : 1 / 60;
      const dt = Math.min(deltaTime, 0.1) * gameSpeedRef.current;
      prevTimeRef.current = timestamp;

      const curTrees = treesRef.current;
      const curGoldMines = goldMinesRef.current;
      const curStone = stoneNodesRef.current;
      const gatherT = gatherTimeoutsRef.current;
      const attackT = attackTimeoutsRef.current;

      // Morale aura: hero within 3 tiles speeds up attack interval by 30%
      // Battle Shout (level 2 hero ability): all units within 4 tiles get 40% faster attacks for 8s
      const heroUnit = workersRef.current.find(w => w.unitType === 'hero' && w.hp > 0);
      const shouting = battleShoutUntilRef.current > Date.now();
      const getMoraleMs = (wx: number, wy: number) => {
        if (!heroUnit) return ATTACK_INTERVAL_MS;
        const moraleMult = tileDist(wx, wy, heroUnit.x, heroUnit.y) <= 3 ? 0.7 : 1;
        const shoutMult = shouting && tileDist(wx, wy, heroUnit.x, heroUnit.y) <= HERO_SHOUT_RADIUS ? HERO_SHOUT_ATK_MULT : 1;
        return Math.round(ATTACK_INTERVAL_MS * moraleMult * shoutMult);
      };

      // Update workers
      setWorkers(ws => {
        const alive = ws.filter(w => w.hp > 0);
        if (alive.length < ws.length) setResources(r => ({ ...r, food: Math.max(0, r.food - (ws.length - alive.length)) }));

        return alive.map(w => {
          // Attack-move: scan for nearby enemies while marching
          if (w.attackMove && w.state === 'moving' && !w.attacking) {
            const AM_SCAN = 2.5;
            const nearGrunt = enemyGruntsRef.current.find(g => g.hp > 0 && tileDist(w.x, w.y, g.x, g.y) <= AM_SCAN);
            if (nearGrunt) return { ...w, attacking: { targetType: 'grunt' as const, gruntId: nearGrunt.id }, state: 'attacking' as const, movingTo: null, path: [] };
            const nearCreep = neutralCreepsRef.current.find(c => c.hp > 0 && tileDist(w.x, w.y, c.x, c.y) <= AM_SCAN);
            if (nearCreep) return { ...w, attacking: { targetType: 'creep' as const, creepId: nearCreep.id }, state: 'attacking' as const, movingTo: null, path: [] };
            const nearRam = enemySiegeRef.current.find(r => r.hp > 0 && tileDist(w.x, w.y, r.x, r.y) <= AM_SCAN);
            if (nearRam) return { ...w, attacking: { targetType: 'siege' as const, siegeId: nearRam.id }, state: 'attacking' as const, movingTo: null, path: [] };
            const nearShaman = enemyShamansRef.current.find(s => s.hp > 0 && tileDist(w.x, w.y, s.x, s.y) <= AM_SCAN);
            if (nearShaman) return { ...w, attacking: { targetType: 'shaman' as const, shamanId: nearShaman.id }, state: 'attacking' as const, movingTo: null, path: [] };
            const nearTroll = enemyTrollsRef.current.find(t => t.hp > 0 && tileDist(w.x, w.y, t.x, t.y) <= AM_SCAN);
            if (nearTroll) return { ...w, attacking: { targetType: 'troll' as const, trollId: nearTroll.id }, state: 'attacking' as const, movingTo: null, path: [] };
            const nearSapper = enemySappersRef.current.find(s => s.hp > 0 && !s.exploded && tileDist(w.x, w.y, s.x, s.y) <= AM_SCAN);
            if (nearSapper) return { ...w, attacking: { targetType: 'sapper' as const, sapperId: nearSapper.id }, state: 'attacking' as const, movingTo: null, path: [] };
            const nearNecro = enemyNecromancersRef.current.find(n => n.hp > 0 && tileDist(w.x, w.y, n.x, n.y) <= AM_SCAN);
            if (nearNecro) return { ...w, attacking: { targetType: 'necromancer' as const, necromancerId: nearNecro.id }, state: 'attacking' as const, movingTo: null, path: [] };
            const nearWD = enemyWitchDoctorsRef.current.find(d => d.hp > 0 && tileDist(w.x, w.y, d.x, d.y) <= AM_SCAN);
            if (nearWD) return { ...w, attacking: { targetType: 'witchDoctor' as const, witchDoctorId: nearWD.id }, state: 'attacking' as const, movingTo: null, path: [] };
          }
          // Hold position: stay put, auto-attack nearby enemies without chasing
          if (w.holdPosition) {
            if (w.state === 'idle' && !w.attacking && w.unitType !== 'farmer' && w.unitType !== 'catapult' && w.unitType !== 'trebuchet') {
              const HP_RANGE = 1.8;
              const nearGruntH = enemyGruntsRef.current.find(g => g.hp > 0 && tileDist(w.x, w.y, g.x, g.y) <= HP_RANGE);
              if (nearGruntH) return { ...w, attacking: { targetType: 'grunt' as const, gruntId: nearGruntH.id }, state: 'attacking' as const };
              const nearRamH = enemySiegeRef.current.find(r => r.hp > 0 && tileDist(w.x, w.y, r.x, r.y) <= HP_RANGE);
              if (nearRamH) return { ...w, attacking: { targetType: 'siege' as const, siegeId: nearRamH.id }, state: 'attacking' as const };
              const nearShamanH = enemyShamansRef.current.find(s => s.hp > 0 && tileDist(w.x, w.y, s.x, s.y) <= HP_RANGE);
              if (nearShamanH) return { ...w, attacking: { targetType: 'shaman' as const, shamanId: nearShamanH.id }, state: 'attacking' as const };
              const nearTrollH = enemyTrollsRef.current.find(t => t.hp > 0 && tileDist(w.x, w.y, t.x, t.y) <= HP_RANGE);
              if (nearTrollH) return { ...w, attacking: { targetType: 'troll' as const, trollId: nearTrollH.id }, state: 'attacking' as const };
              const nearSapperH = enemySappersRef.current.find(s => s.hp > 0 && !s.exploded && tileDist(w.x, w.y, s.x, s.y) <= HP_RANGE);
              if (nearSapperH) return { ...w, attacking: { targetType: 'sapper' as const, sapperId: nearSapperH.id }, state: 'attacking' as const };
              const nearNecroH = enemyNecromancersRef.current.find(n => n.hp > 0 && tileDist(w.x, w.y, n.x, n.y) <= HP_RANGE);
              if (nearNecroH) return { ...w, attacking: { targetType: 'necromancer' as const, necromancerId: nearNecroH.id }, state: 'attacking' as const };
              const nearWDH = enemyWitchDoctorsRef.current.find(d => d.hp > 0 && tileDist(w.x, w.y, d.x, d.y) <= HP_RANGE);
              if (nearWDH) return { ...w, attacking: { targetType: 'witchDoctor' as const, witchDoctorId: nearWDH.id }, state: 'attacking' as const };
            }
            // After killing target, go back to idle (don't chase)
            if (w.state === 'attacking' && w.attacking) {
              const isGruntDead = w.attacking.targetType === 'grunt' && !enemyGruntsRef.current.find(g => g.id === (w.attacking as { targetType: 'grunt'; gruntId: number }).gruntId && g.hp > 0);
              const isRamDead = w.attacking.targetType === 'siege' && !enemySiegeRef.current.find(r => r.id === (w.attacking as { targetType: 'siege'; siegeId: number }).siegeId && r.hp > 0);
              if (isGruntDead || isRamDead) return { ...w, attacking: null, state: 'idle' };
            }
            // Block movement while holding position
            if (w.state === 'moving') return { ...w, movingTo: null, path: [], state: 'idle' };
            return w;
          }
          // Aggressive stance: idle combat units auto-engage nearby enemies within 3 tiles
          if (stanceRef.current === 'aggressive' && w.state === 'idle' && !w.attacking && !w.holdPosition && !w.patrol
            && w.unitType !== 'farmer' && w.unitType !== 'catapult' && w.unitType !== 'trebuchet') {
            const AGG_RANGE = 3;
            const nearGruntA = enemyGruntsRef.current.find(g => g.hp > 0 && tileDist(w.x, w.y, g.x, g.y) <= AGG_RANGE);
            if (nearGruntA) return { ...w, attacking: { targetType: 'grunt' as const, gruntId: nearGruntA.id }, state: 'attacking' as const };
            const nearRamA = enemySiegeRef.current.find(r => r.hp > 0 && tileDist(w.x, w.y, r.x, r.y) <= AGG_RANGE);
            if (nearRamA) return { ...w, attacking: { targetType: 'siege' as const, siegeId: nearRamA.id }, state: 'attacking' as const };
            const nearSapperA = enemySappersRef.current.find(s => s.hp > 0 && !s.exploded && tileDist(w.x, w.y, s.x, s.y) <= AGG_RANGE);
            if (nearSapperA) return { ...w, attacking: { targetType: 'sapper' as const, sapperId: nearSapperA.id }, state: 'attacking' as const };
            const nearNecroA = enemyNecromancersRef.current.find(n => n.hp > 0 && tileDist(w.x, w.y, n.x, n.y) <= AGG_RANGE);
            if (nearNecroA) return { ...w, attacking: { targetType: 'necromancer' as const, necromancerId: nearNecroA.id }, state: 'attacking' as const };
            const nearWDA = enemyWitchDoctorsRef.current.find(d => d.hp > 0 && tileDist(w.x, w.y, d.x, d.y) <= AGG_RANGE);
            if (nearWDA) return { ...w, attacking: { targetType: 'witchDoctor' as const, witchDoctorId: nearWDA.id }, state: 'attacking' as const };
          }
          // When attack-move unit finishes its target, resume march to original destination
          if (w.attackMove && w.state === 'idle' && w.attackMoveTarget) {
            const dest = w.attackMoveTarget;
            const atDest = tileDist(w.x, w.y, dest.x, dest.y) < 0.5;
            if (!atDest) {
              const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, dest);
              return { ...w, movingTo: p[0] ?? dest, path: p.slice(1), state: 'moving' as const };
            }
            return { ...w, attackMove: false, attackMoveTarget: null };
          }

          if (w.movingTo) {
            const dx = w.movingTo.x - w.x, dy = w.movingTo.y - w.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const epsilon = 0.12;
            if (d < epsilon) {
              // Advance along A* path
              if (w.path.length > 0) {
                const [next, ...rest] = w.path;
                return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: next ?? null, path: rest };
              }
              // Arrived at final destination
              if (w.gathering && w.state !== 'returning') return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: null, path: [], state: 'gathering' };
              if (w.attacking && w.state !== 'returning') return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: null, path: [], state: 'attacking' };
              if (w.repairing && w.state !== 'returning') return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: null, path: [], state: 'repairing' };
              if (w.state === 'returning') {
                const movDest = w.movingTo!;
                const atBarn = tileDist(movDest.x, movDest.y, BARN_POS.x, BARN_POS.y) < epsilon;
                const atLumberShed = !atBarn && w.carrying.lumber > 0 && placedBuildingsRef.current.some(b => b.type === 'lumberShed' && b.hp > 0 && tileDist(movDest.x, movDest.y, b.x, b.y) < epsilon);
                if (atBarn || atLumberShed) {
                  setResources(r => ({ ...r, gold: r.gold + w.carrying.gold, lumber: r.lumber + w.carrying.lumber, stone: r.stone + w.carrying.stone }));
                  incomeAccRef.current.gold += w.carrying.gold;
                  incomeAccRef.current.lumber += w.carrying.lumber;
                  incomeAccRef.current.stone += w.carrying.stone;
                  if (w.carrying.gold > 0) setTotalGold(g => g + w.carrying.gold);
                  if (w.carrying.lumber > 0) setTotalLumber(l => l + w.carrying.lumber);
                  if (w.gathering) {
                    if (w.gathering.type === 'tree') {
                      const t = curTrees[w.gathering.idx];
                      if (t && t.amount > 0) {
                        const p = aStar(INITIAL_TILES, { x: Math.round(w.movingTo.x), y: Math.round(w.movingTo.y) }, { x: t.x, y: t.y });
                        return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: p[0] ?? { x: t.x, y: t.y }, path: p.slice(1), carrying: { gold: 0, lumber: 0, stone: 0 }, state: 'moving' };
                      }
                    } else if (w.gathering.type === 'gold') {
                      const mineIdx = w.gathering.idx;
                      const mine = curGoldMines[mineIdx];
                      if (mine && mine.amount > 0) {
                        const p = aStar(INITIAL_TILES, { x: Math.round(w.movingTo.x), y: Math.round(w.movingTo.y) }, { x: mine.x, y: mine.y });
                        return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: p[0] ?? mine, path: p.slice(1), carrying: { gold: 0, lumber: 0, stone: 0 }, state: 'moving' };
                      }
                      // mine depleted — auto-find nearest non-empty mine
                      const wx3 = Math.round(w.movingTo.x), wy3 = Math.round(w.movingTo.y);
                      const altMine = curGoldMines.reduce<{ node: ResourceNode; idx: number; d: number } | null>((best, m, i) => {
                        if (m.amount <= 0) return best;
                        const d = tileDist(wx3, wy3, m.x, m.y);
                        return !best || d < best.d ? { node: m, idx: i, d } : best;
                      }, null);
                      if (altMine) {
                        const p = aStar(INITIAL_TILES, { x: wx3, y: wy3 }, { x: altMine.node.x, y: altMine.node.y });
                        return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: p[0] ?? altMine.node, path: p.slice(1), carrying: { gold: 0, lumber: 0, stone: 0 }, state: 'moving', gathering: { type: 'gold', idx: altMine.idx } };
                      }
                    } else if (w.gathering.type === 'stone') {
                      const n = curStone[w.gathering.idx];
                      if (n && n.amount > 0) {
                        const p = aStar(INITIAL_TILES, { x: Math.round(w.movingTo.x), y: Math.round(w.movingTo.y) }, { x: n.x, y: n.y });
                        return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: p[0] ?? n, path: p.slice(1), carrying: { gold: 0, lumber: 0, stone: 0 }, state: 'moving' };
                      }
                    }
                  }
                  // Auto-gather: find nearest non-empty node of same type
                  if (w.unitType === 'farmer' && w.gathering) {
                    const gType2 = w.gathering.type;
                    const wx2 = Math.round(w.movingTo.x), wy2 = Math.round(w.movingTo.y);
                    if (gType2 === 'tree') {
                      const alt = curTrees.reduce<{ node: typeof curTrees[0]; idx: number; d: number } | null>((best, t, i) => {
                        if (t.amount <= 0) return best;
                        const d = tileDist(wx2, wy2, t.x, t.y);
                        return !best || d < best.d ? { node: t, idx: i, d } : best;
                      }, null);
                      if (alt) { const p = aStar(INITIAL_TILES, { x: wx2, y: wy2 }, { x: alt.node.x, y: alt.node.y }); return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: p[0] ?? alt.node, path: p.slice(1), carrying: { gold: 0, lumber: 0, stone: 0 }, state: 'moving', gathering: { type: 'tree', idx: alt.idx } }; }
                    } else if (gType2 === 'gold') {
                      // gold is a single node; if depleted, go idle
                    } else if (gType2 === 'stone') {
                      const alt = curStone.reduce<{ node: typeof curStone[0]; idx: number; d: number } | null>((best, n, i) => {
                        if (n.amount <= 0) return best;
                        const d = tileDist(wx2, wy2, n.x, n.y);
                        return !best || d < best.d ? { node: n, idx: i, d } : best;
                      }, null);
                      if (alt) { const p = aStar(INITIAL_TILES, { x: wx2, y: wy2 }, { x: alt.node.x, y: alt.node.y }); return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: p[0] ?? alt.node, path: p.slice(1), carrying: { gold: 0, lumber: 0, stone: 0 }, state: 'moving', gathering: { type: 'stone', idx: alt.idx } }; }
                    }
                  }
                  return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: null, path: [], carrying: { gold: 0, lumber: 0, stone: 0 }, state: 'idle', gathering: null };
                }
              }
              // Consume next queued waypoint instead of going idle
              if (w.waypoints && w.waypoints.length > 0) {
                const [nextWP, ...restWPs] = w.waypoints;
                if (nextWP) {
                  const p = aStar(INITIAL_TILES, { x: w.movingTo.x, y: w.movingTo.y }, nextWP);
                  return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: p[0] ?? nextWP, path: p.slice(1), waypoints: restWPs, state: 'moving' as const };
                }
              }
              // Loot crate pickup: if unit steps onto a crate tile, collect it
              const arrivedAt = w.movingTo;
              const crateHere = arrivedAt ? lootCratesRef.current.find(c => Math.round(c.x) === Math.round(arrivedAt.x) && Math.round(c.y) === Math.round(arrivedAt.y)) : undefined;
              if (crateHere && w.unitType === 'farmer') {
                setLootCrates(cs => cs.filter(c => c.id !== crateHere.id));
                setResources(r => ({ ...r, gold: r.gold + crateHere.gold, lumber: r.lumber + crateHere.lumber, stone: r.stone + crateHere.stone }));
                const label = [crateHere.gold > 0 && `+${crateHere.gold}🪙`, crateHere.lumber > 0 && `+${crateHere.lumber}🌲`, crateHere.stone > 0 && `+${crateHere.stone}🪨`].filter(Boolean).join(' ');
                addFloatingText(Math.round(w.movingTo.x), Math.round(w.movingTo.y), label, '#fbbf24');
              }
              return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: null, path: [], state: 'idle' };
            }
            // Cavalry trample: deal passive damage to grunts within radius while moving
            if (w.unitType === 'cavalry') {
              enemyGruntsRef.current.forEach(g => {
                if (g.hp > 0 && tileDist(w.x, w.y, g.x, g.y) <= CAVALRY_TRAMPLE_RADIUS) {
                  setEnemyGrunts(gs => gs.map(eg => eg.id === g.id ? { ...eg, hp: Math.max(0, eg.hp - CAVALRY_TRAMPLE_DAMAGE * dt) } : eg));
                }
              });
            }
            const sprintMult = w.sprinting ? CAVALRY_SPRINT_SPEED_MULT : 1;
            const moveSpeed = (w.unitType === 'catapult' ? CATAPULT_SPEED : w.unitType === 'trebuchet' ? TREBUCHET_SPEED : w.unitType === 'cavalry' ? CAVALRY_SPEED : WORKER_SPEED) * sprintMult;
            return { ...w, x: w.x + (dx / d) * Math.min(moveSpeed * dt, d), y: w.y + (dy / d) * Math.min(moveSpeed * dt, d) };
          }

          if (w.state === 'gathering' && w.gathering) {
            const gType = w.gathering.type;
            if (gType === 'tree') {
              if (w.carrying.lumber >= CARRY_CAP) {
                const sheds = placedBuildingsRef.current.filter(b => b.type === 'lumberShed' && b.hp > 0);
                const dropSite = sheds.reduce<{ x: number; y: number } | null>((best, s) => {
                  const d = tileDist(w.x, w.y, s.x, s.y);
                  return !best || d < tileDist(w.x, w.y, best.x, best.y) ? { x: s.x, y: s.y } : best;
                }, null) ?? BARN_POS;
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, dropSite);
                return { ...w, state: 'returning', movingTo: p[0] ?? dropSite, path: p.slice(1) };
              }
              if (!gatherT[w.id]) {
                const lumberShedCount = placedBuildingsRef.current.filter(b => b.type === 'lumberShed').length;
                const boonDiv = harvestBoonRef.current ? 2 : 1;
                const plentyDiv = shrinePlentyBuffRef.current ? 1.15 : 1;
                const gatherMs = Math.max(400, (GATHER_INTERVAL_MS - upgradesRef.current.swiftHarvest * 200 - lumberShedCount * LUMBER_SHED_BONUS_MS) / boonDiv / plentyDiv);
                gatherT[w.id] = window.setTimeout(() => {
                  delete gatherTimeoutsRef.current[w.id];
                  const idx = w.gathering!.idx;
                  setWorkers(ws2 => ws2.map(w2 => {
                    if (w2.id !== w.id || w2.state !== 'gathering' || !w2.gathering) return w2;
                    if ((treesRef.current[idx]?.amount ?? 0) > 0 && w2.carrying.lumber < CARRY_CAP) {
                      setTrees(ts => ts.map((t, i) => i === idx ? { ...t, amount: Math.max(0, t.amount - CARRY_CAP) } : t));
                      const sheds2 = placedBuildingsRef.current.filter(b => b.type === 'lumberShed' && b.hp > 0);
                      const dropSite2 = sheds2.reduce<{ x: number; y: number } | null>((best, s) => {
                        const d = tileDist(w2.x, w2.y, s.x, s.y);
                        return !best || d < tileDist(w2.x, w2.y, best.x, best.y) ? { x: s.x, y: s.y } : best;
                      }, null) ?? BARN_POS;
                      const p = aStar(INITIAL_TILES, { x: Math.round(w2.x), y: Math.round(w2.y) }, dropSite2);
                      return { ...w2, carrying: { gold: 0, lumber: w2.carrying.lumber + CARRY_CAP, stone: 0 }, state: 'returning', movingTo: p[0] ?? dropSite2, path: p.slice(1) };
                    }
                    return w2;
                  }));
                }, gatherMs);
              }
            } else if (gType === 'gold') {
              if (w.carrying.gold >= CARRY_CAP) {
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, BARN_POS);
                return { ...w, state: 'returning', movingTo: p[0] ?? BARN_POS, path: p.slice(1) };
              }
              if (!gatherT[w.id]) {
                const gatherMs = Math.max(400, (GATHER_INTERVAL_MS - upgradesRef.current.swiftHarvest * 200) / (harvestBoonRef.current ? 2 : 1) / (shrinePlentyBuffRef.current ? 1.15 : 1));
                const mineIdx = w.gathering.idx;
                gatherT[w.id] = window.setTimeout(() => {
                  delete gatherTimeoutsRef.current[w.id];
                  setWorkers(ws2 => ws2.map(w2 => {
                    if (w2.id !== w.id || w2.state !== 'gathering' || !w2.gathering) return w2;
                    const mine = goldMinesRef.current[mineIdx];
                    if (mine && mine.amount > 0 && w2.carrying.gold < CARRY_CAP) {
                      setGoldMines(gms => gms.map((gm, i) => i === mineIdx ? { ...gm, amount: Math.max(0, gm.amount - CARRY_CAP) } : gm));
                      const p = aStar(INITIAL_TILES, { x: Math.round(w2.x), y: Math.round(w2.y) }, BARN_POS);
                      return { ...w2, carrying: { gold: w2.carrying.gold + CARRY_CAP, lumber: 0, stone: 0 }, state: 'returning', movingTo: p[0] ?? BARN_POS, path: p.slice(1) };
                    }
                    return w2;
                  }));
                }, gatherMs);
              }
            } else if (gType === 'stone') {
              if (w.carrying.stone >= CARRY_CAP) {
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, BARN_POS);
                return { ...w, state: 'returning', movingTo: p[0] ?? BARN_POS, path: p.slice(1) };
              }
              if (!gatherT[w.id]) {
                const idx = w.gathering.idx;
                const gatherMs = Math.max(400, (GATHER_INTERVAL_MS - upgradesRef.current.swiftHarvest * 200) / (harvestBoonRef.current ? 2 : 1) / (shrinePlentyBuffRef.current ? 1.15 : 1));
                gatherT[w.id] = window.setTimeout(() => {
                  delete gatherTimeoutsRef.current[w.id];
                  setWorkers(ws2 => ws2.map(w2 => {
                    if (w2.id !== w.id || w2.state !== 'gathering' || !w2.gathering) return w2;
                    if ((stoneNodesRef.current[idx]?.amount ?? 0) > 0 && w2.carrying.stone < CARRY_CAP) {
                      setStoneNodes(ns => ns.map((n, i) => i === idx ? { ...n, amount: Math.max(0, n.amount - CARRY_CAP) } : n));
                      const p = aStar(INITIAL_TILES, { x: Math.round(w2.x), y: Math.round(w2.y) }, BARN_POS);
                      return { ...w2, carrying: { gold: 0, lumber: 0, stone: w2.carrying.stone + CARRY_CAP }, state: 'returning', movingTo: p[0] ?? BARN_POS, path: p.slice(1) };
                    }
                    return w2;
                  }));
                }, gatherMs);
              }
            }
          }

          if (w.state === 'attacking' && w.attacking) {
            if (w.attacking.targetType === 'creep') {
              const creepId = (w.attacking as { targetType: 'creep'; creepId: number }).creepId;
              const creepTarget = neutralCreepsRef.current.find(c => c.id === creepId);
              if (!creepTarget) return { ...w, attacking: null, state: 'idle' };
              const distToCreep = tileDist(w.x, w.y, creepTarget.x, creepTarget.y);
              if (distToCreep > 1.8) {
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: Math.round(creepTarget.x), y: Math.round(creepTarget.y) });
                return { ...w, movingTo: p[0] ?? { x: creepTarget.x, y: creepTarget.y }, path: p.slice(1), state: 'moving' };
              }
              if (!attackT[w.id]) {
                const capturedCX = Math.round(creepTarget.x), capturedCY = Math.round(creepTarget.y);
                const capturedWX3 = Math.round(w.x), capturedWY3 = Math.round(w.y);
                const unitBonusC = w.unitType === 'hero' ? HERO_DAMAGE_BONUS : w.unitType === 'swordsman' ? SWORDSMAN_DAMAGE_BONUS : w.unitType === 'cavalry' ? CAVALRY_DAMAGE_BONUS : 0;
                const capturedVetC = w.level;
                const moraleMs1 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmgC = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + (shrineWarBuffRef.current ? 5 : 0) + unitBonusC + capturedVetC * VETERAN_ATK_BONUS;
                  addFloatingText(capturedCX, capturedCY, `-${dmgC}`, '#a855f7');
                  addFloatingText(capturedWX3, capturedWY3, `⚔️`, '#fbbf24');
                  // Award XP if creep dies
                  setNeutralCreeps(cs => cs.map(c => {
                    if (c.id !== creepId) return c;
                    const newHp = Math.max(0, c.hp - dmgC);
                    if (newHp <= 0 && c.hp > 0) {
                      setWorkers(ws3 => ws3.map(u => {
                        if (u.id !== w.id) return u;
                        const newXp = u.xp + XP_PER_KILL;
                        const newLevel = newXp >= XP_TO_LEVEL_2 ? 2 : newXp >= XP_TO_LEVEL_1 ? 1 : 0;
                        if (newLevel > u.level) {
                          addFloatingText(capturedWX3, capturedWY3, `⭐ Level ${newLevel}!`, '#fbbf24');
                          return { ...u, xp: newXp, level: newLevel, maxHp: u.maxHp + VETERAN_HP_BONUS, hp: Math.min(u.hp + VETERAN_HP_BONUS, u.maxHp + VETERAN_HP_BONUS) };
                        }
                        return { ...u, xp: newXp };
                      }));
                    }
                    return { ...c, hp: newHp };
                  }));
                }, moraleMs1);
              }
            } else if (w.attacking.targetType === 'grunt') {
              const target = enemyGruntsRef.current.find(g => g.id === (w.attacking as { targetType: 'grunt'; gruntId: number }).gruntId);
              if (!target) return { ...w, attacking: null, state: 'idle' };
              const distToGrunt = tileDist(w.x, w.y, target.x, target.y);
              if (distToGrunt > 1.8) {
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: Math.round(target.x), y: Math.round(target.y) });
                return { ...w, movingTo: p[0] ?? { x: target.x, y: target.y }, path: p.slice(1), state: 'moving' };
              }
              if (!attackT[w.id]) {
                const gruntId = w.attacking.gruntId;
                const capturedGX = Math.round(target.x), capturedGY = Math.round(target.y);
                const capturedWX = Math.round(w.x), capturedWY = Math.round(w.y);
                const capturedWorkerId = w.id;
                const unitBonus = w.unitType === 'hero' ? HERO_DAMAGE_BONUS : w.unitType === 'swordsman' ? SWORDSMAN_DAMAGE_BONUS : w.unitType === 'cavalry' ? CAVALRY_DAMAGE_BONUS : 0;
                const moraleMs2 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[capturedWorkerId];
                  setWorkers(ws2 => {
                    const attacker = ws2.find(u => u.id === capturedWorkerId);
                    const veteranBonus = attacker ? attacker.level * VETERAN_ATK_BONUS : 0;
                    const dmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + (shrineWarBuffRef.current ? 5 : 0) + unitBonus + veteranBonus;
                    addFloatingText(capturedGX, capturedGY, `-${dmg}`, '#f97316');
                    addFloatingText(capturedWX, capturedWY, `⚔️`, '#fbbf24');
                    setEnemyGrunts(gs => gs.map(g => {
                      if (g.id !== gruntId) return g;
                      const newHp = Math.max(0, g.hp - dmg);
                      if (newHp <= 0 && g.hp > 0) {
                        // Award XP to attacker
                        return { ...g, hp: 0 };
                      }
                      return { ...g, hp: newHp };
                    }));
                    // Award XP to attacker + 25% shared XP to nearby allies within 3 tiles
                    return ws2.map(u => {
                      const gruntCurrent = enemyGruntsRef.current.find(g => g.id === gruntId);
                      const veteranDmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + (shrineWarBuffRef.current ? 5 : 0) + unitBonus + u.level * VETERAN_ATK_BONUS;
                      const gruntDies = gruntCurrent && gruntCurrent.hp - veteranDmg <= 0;
                      if (!gruntDies) return u;
                      const isAttacker = u.id === capturedWorkerId;
                      const isNearby = !isAttacker && u.hp > 0 && tileDist(u.x, u.y, capturedWX, capturedWY) <= 3;
                      const baseXp = gruntCurrent.isBoss ? BOSS_XP_REWARD : XP_PER_KILL;
                      const xpGain = isAttacker ? baseXp : isNearby ? Math.round(baseXp * 0.25) : 0;
                      if (xpGain === 0) return u;
                      const newXp = u.xp + xpGain;
                      const newLevel = newXp >= XP_TO_LEVEL_2 ? 2 : newXp >= XP_TO_LEVEL_1 ? 1 : 0;
                      if (newLevel > u.level) {
                        addFloatingText(Math.round(u.x), Math.round(u.y), `⭐ Level ${newLevel}!`, '#fbbf24');
                        const hpGain = VETERAN_HP_BONUS;
                        return { ...u, xp: newXp, level: newLevel, maxHp: u.maxHp + hpGain, hp: Math.min(u.hp + hpGain, u.maxHp + hpGain) };
                      }
                      return { ...u, xp: newXp };
                    });
                  });
                }, moraleMs2);
              }
            } else if (w.attacking.targetType === 'enemyTower') {
              const towerId = (w.attacking as { targetType: 'enemyTower'; towerId: number }).towerId;
              const towerTarget = enemyTowersRef.current.find(t => t.id === towerId && t.hp > 0);
              if (!towerTarget) return { ...w, attacking: null, state: 'idle' };
              const distToTower = tileDist(w.x, w.y, towerTarget.x, towerTarget.y);
              if (distToTower > 1.8) {
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: Math.max(0, towerTarget.x - 1), y: towerTarget.y });
                return { ...w, movingTo: p[0] ?? { x: towerTarget.x - 1, y: towerTarget.y }, path: p.slice(1), state: 'moving' };
              }
              if (!attackT[w.id]) {
                const capturedTX = towerTarget.x, capturedTY = towerTarget.y;
                const capturedTId = towerId;
                const unitBonusT = w.unitType === 'hero' ? HERO_DAMAGE_BONUS : w.unitType === 'swordsman' ? SWORDSMAN_DAMAGE_BONUS : w.unitType === 'cavalry' ? CAVALRY_DAMAGE_BONUS : 0;
                const capturedVetT = w.level;
                const moraleMs3 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + (shrineWarBuffRef.current ? 5 : 0) + unitBonusT + capturedVetT * VETERAN_ATK_BONUS;
                  setEnemyTowers(ts => ts.map(t => t.id === capturedTId ? { ...t, hp: Math.max(0, t.hp - dmg) } : t));
                  addFloatingText(capturedTX, capturedTY, `-${dmg}`, '#ef4444');
                }, moraleMs3);
              }
            } else if (w.attacking.targetType === 'siege') {
              const siegeId = (w.attacking as { targetType: 'siege'; siegeId: number }).siegeId;
              const siegeTarget = enemySiegeRef.current.find(r => r.id === siegeId && r.hp > 0);
              if (!siegeTarget) return { ...w, attacking: null, state: 'idle' };
              const distToSiege = tileDist(w.x, w.y, siegeTarget.x, siegeTarget.y);
              if (distToSiege > 1.8) {
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: Math.round(siegeTarget.x), y: Math.round(siegeTarget.y) });
                return { ...w, movingTo: p[0] ?? { x: siegeTarget.x, y: siegeTarget.y }, path: p.slice(1), state: 'moving' };
              }
              if (!attackT[w.id]) {
                const capturedSX = Math.round(siegeTarget.x), capturedSY = Math.round(siegeTarget.y);
                const capturedSiegeId = siegeId;
                const unitBonusS = w.unitType === 'hero' ? HERO_DAMAGE_BONUS : w.unitType === 'swordsman' ? SWORDSMAN_DAMAGE_BONUS : w.unitType === 'cavalry' ? CAVALRY_DAMAGE_BONUS : 0;
                const capturedVetS = w.level;
                const moraleMs5 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + (shrineWarBuffRef.current ? 5 : 0) + unitBonusS + capturedVetS * VETERAN_ATK_BONUS;
                  setEnemySiege(rs => rs.map(r => r.id === capturedSiegeId ? { ...r, hp: Math.max(0, r.hp - dmg) } : r));
                  addFloatingText(capturedSX, capturedSY, `-${dmg}`, '#ef4444');
                  // XP for killing a ram/demolisher
                  const ramCurrent = enemySiegeRef.current.find(r => r.id === capturedSiegeId);
                  if (ramCurrent && ramCurrent.hp - dmg <= 0) {
                    const siegeXp = ramCurrent.siegeType === 'demolisher' ? DEMOLISHER_XP_REWARD : WAR_RAM_XP_REWARD;
                    setWorkers(ws2 => ws2.map(u => {
                      const isAttacker = u.id === w.id;
                      const isNearby = !isAttacker && u.hp > 0 && tileDist(u.x, u.y, capturedSX, capturedSY) <= 3;
                      const xpGain = isAttacker ? siegeXp : isNearby ? Math.round(siegeXp * 0.25) : 0;
                      if (xpGain === 0) return u;
                      const newXp = u.xp + xpGain;
                      const newLevel = newXp >= XP_TO_LEVEL_2 ? 2 : newXp >= XP_TO_LEVEL_1 ? 1 : 0;
                      if (newLevel > u.level) {
                        addFloatingText(Math.round(u.x), Math.round(u.y), `⭐ Level ${newLevel}!`, '#fbbf24');
                        return { ...u, xp: newXp, level: newLevel, maxHp: u.maxHp + VETERAN_HP_BONUS, hp: Math.min(u.hp + VETERAN_HP_BONUS, u.maxHp + VETERAN_HP_BONUS) };
                      }
                      return { ...u, xp: newXp };
                    }));
                  }
                }, moraleMs5);
              }
            } else if (w.attacking.targetType === 'shaman') {
              const shamanId = (w.attacking as { targetType: 'shaman'; shamanId: number }).shamanId;
              const shamanTarget = enemyShamansRef.current.find(s => s.id === shamanId && s.hp > 0);
              if (!shamanTarget) return { ...w, attacking: null, state: 'idle' };
              const distToShaman = tileDist(w.x, w.y, shamanTarget.x, shamanTarget.y);
              if (distToShaman > 1.8) {
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: Math.round(shamanTarget.x), y: Math.round(shamanTarget.y) });
                return { ...w, movingTo: p[0] ?? { x: shamanTarget.x, y: shamanTarget.y }, path: p.slice(1), state: 'moving' };
              }
              if (!attackT[w.id]) {
                const capturedShX = Math.round(shamanTarget.x), capturedShY = Math.round(shamanTarget.y);
                const capturedShamanId = shamanId;
                const unitBonusSh = w.unitType === 'hero' ? HERO_DAMAGE_BONUS : w.unitType === 'swordsman' ? SWORDSMAN_DAMAGE_BONUS : w.unitType === 'cavalry' ? CAVALRY_DAMAGE_BONUS : 0;
                const capturedVetSh = w.level;
                const moraleMs6 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + (shrineWarBuffRef.current ? 5 : 0) + unitBonusSh + capturedVetSh * VETERAN_ATK_BONUS;
                  setEnemyShamans(ss => ss.map(s => s.id === capturedShamanId ? { ...s, hp: Math.max(0, s.hp - dmg) } : s));
                  addFloatingText(capturedShX, capturedShY, `-${dmg}`, '#ef4444');
                  const shamCurrent = enemyShamansRef.current.find(s => s.id === capturedShamanId);
                  if (shamCurrent && shamCurrent.hp - dmg <= 0) {
                    setResources(r => ({ ...r, gold: r.gold + SHAMAN_GOLD_REWARD }));
                    addFloatingText(capturedShX, capturedShY, `+${SHAMAN_GOLD_REWARD}g`, '#fbbf24');
                    setWorkers(ws2 => ws2.map(u => {
                      const isAttacker = u.id === w.id;
                      const isNearby = !isAttacker && u.hp > 0 && tileDist(u.x, u.y, capturedShX, capturedShY) <= 3;
                      const xpGain = isAttacker ? SHAMAN_XP_REWARD : isNearby ? Math.round(SHAMAN_XP_REWARD * 0.25) : 0;
                      if (xpGain === 0) return u;
                      const newXp = u.xp + xpGain;
                      const newLevel = newXp >= XP_TO_LEVEL_2 ? 2 : newXp >= XP_TO_LEVEL_1 ? 1 : 0;
                      if (newLevel > u.level) {
                        addFloatingText(Math.round(u.x), Math.round(u.y), `⭐ Level ${newLevel}!`, '#fbbf24');
                        return { ...u, xp: newXp, level: newLevel, maxHp: u.maxHp + VETERAN_HP_BONUS, hp: Math.min(u.hp + VETERAN_HP_BONUS, u.maxHp + VETERAN_HP_BONUS) };
                      }
                      return { ...u, xp: newXp };
                    }));
                  }
                }, moraleMs6);
              }
            } else if (w.attacking.targetType === 'troll') {
              const trollId = (w.attacking as { targetType: 'troll'; trollId: number }).trollId;
              const trollTarget = enemyTrollsRef.current.find(t => t.id === trollId && t.hp > 0);
              if (!trollTarget) return { ...w, attacking: null, state: 'idle' };
              const distToTroll = tileDist(w.x, w.y, trollTarget.x, trollTarget.y);
              if (distToTroll > 1.8) {
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: Math.round(trollTarget.x), y: Math.round(trollTarget.y) });
                return { ...w, movingTo: p[0] ?? { x: trollTarget.x, y: trollTarget.y }, path: p.slice(1), state: 'moving' };
              }
              if (!attackT[w.id]) {
                const capturedTrX = Math.round(trollTarget.x), capturedTrY = Math.round(trollTarget.y);
                const capturedTrollId = trollId;
                const unitBonusTr = w.unitType === 'hero' ? HERO_DAMAGE_BONUS : w.unitType === 'swordsman' ? SWORDSMAN_DAMAGE_BONUS : w.unitType === 'cavalry' ? CAVALRY_DAMAGE_BONUS : 0;
                const capturedVetTr = w.level;
                const moraleMs7 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + (shrineWarBuffRef.current ? 5 : 0) + unitBonusTr + capturedVetTr * VETERAN_ATK_BONUS;
                  setEnemyTrolls(ts => ts.map(t => t.id === capturedTrollId ? { ...t, hp: Math.max(0, t.hp - dmg) } : t));
                  addFloatingText(capturedTrX, capturedTrY, `-${dmg}`, '#ef4444');
                  const trCurrent = enemyTrollsRef.current.find(t => t.id === capturedTrollId);
                  if (trCurrent && trCurrent.hp - dmg <= 0) {
                    setWorkers(ws2 => ws2.map(u => {
                      const isAttacker = u.id === w.id;
                      const isNearby = !isAttacker && u.hp > 0 && tileDist(u.x, u.y, capturedTrX, capturedTrY) <= 3;
                      const xpGain = isAttacker ? TROLL_XP_REWARD : isNearby ? Math.round(TROLL_XP_REWARD * 0.25) : 0;
                      if (xpGain === 0) return u;
                      const newXp = u.xp + xpGain;
                      const newLevel = newXp >= XP_TO_LEVEL_2 ? 2 : newXp >= XP_TO_LEVEL_1 ? 1 : 0;
                      if (newLevel > u.level) {
                        addFloatingText(Math.round(u.x), Math.round(u.y), `⭐ Level ${newLevel}!`, '#fbbf24');
                        return { ...u, xp: newXp, level: newLevel, maxHp: u.maxHp + VETERAN_HP_BONUS, hp: Math.min(u.hp + VETERAN_HP_BONUS, u.maxHp + VETERAN_HP_BONUS) };
                      }
                      return { ...u, xp: newXp };
                    }));
                  }
                }, moraleMs7);
              }
            } else if (w.attacking.targetType === 'sapper') {
              const sapperId = (w.attacking as { targetType: 'sapper'; sapperId: number }).sapperId;
              const sapperTarget = enemySappersRef.current.find(s => s.id === sapperId && s.hp > 0 && !s.exploded);
              if (!sapperTarget) return { ...w, attacking: null, state: 'idle' };
              const distToSapper = tileDist(w.x, w.y, sapperTarget.x, sapperTarget.y);
              if (distToSapper > 1.8) {
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: Math.round(sapperTarget.x), y: Math.round(sapperTarget.y) });
                return { ...w, movingTo: p[0] ?? { x: sapperTarget.x, y: sapperTarget.y }, path: p.slice(1), state: 'moving' };
              }
              if (!attackT[w.id]) {
                const capturedSpX = Math.round(sapperTarget.x), capturedSpY = Math.round(sapperTarget.y);
                const capturedSapperId = sapperId;
                const unitBonusSp = w.unitType === 'hero' ? HERO_DAMAGE_BONUS : w.unitType === 'swordsman' ? SWORDSMAN_DAMAGE_BONUS : w.unitType === 'cavalry' ? CAVALRY_DAMAGE_BONUS : 0;
                const capturedVetSp = w.level;
                const moraleMs8 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + (shrineWarBuffRef.current ? 5 : 0) + unitBonusSp + capturedVetSp * VETERAN_ATK_BONUS;
                  setEnemySappers(ss => ss.map(s => s.id === capturedSapperId ? { ...s, hp: Math.max(0, s.hp - dmg) } : s));
                  addFloatingText(capturedSpX, capturedSpY, `-${dmg}`, '#ef4444');
                }, moraleMs8);
              }
            } else if (w.attacking.targetType === 'necromancer') {
              const necroId = (w.attacking as { targetType: 'necromancer'; necromancerId: number }).necromancerId;
              const necroTarget = enemyNecromancersRef.current.find(n => n.id === necroId && n.hp > 0);
              if (!necroTarget) return { ...w, attacking: null, state: 'idle' };
              const distToNecro = tileDist(w.x, w.y, necroTarget.x, necroTarget.y);
              if (distToNecro > 1.8) {
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: Math.round(necroTarget.x), y: Math.round(necroTarget.y) });
                return { ...w, movingTo: p[0] ?? { x: necroTarget.x, y: necroTarget.y }, path: p.slice(1), state: 'moving' };
              }
              if (!attackT[w.id]) {
                const capturedNcX = Math.round(necroTarget.x), capturedNcY = Math.round(necroTarget.y);
                const capturedNecroId = necroId;
                const unitBonusNc = w.unitType === 'hero' ? HERO_DAMAGE_BONUS : w.unitType === 'swordsman' ? SWORDSMAN_DAMAGE_BONUS : w.unitType === 'cavalry' ? CAVALRY_DAMAGE_BONUS : 0;
                const capturedVetNc = w.level;
                const moraleMs9 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + (shrineWarBuffRef.current ? 5 : 0) + unitBonusNc + capturedVetNc * VETERAN_ATK_BONUS;
                  setEnemyNecromancers(ns => ns.map(n => n.id === capturedNecroId ? { ...n, hp: Math.max(0, n.hp - dmg) } : n));
                  addFloatingText(capturedNcX, capturedNcY, `-${dmg}`, '#ef4444');
                  const necroCurrent = enemyNecromancersRef.current.find(n => n.id === capturedNecroId);
                  if (necroCurrent && necroCurrent.hp - dmg <= 0) {
                    setWorkers(ws2 => ws2.map(u => {
                      const isAttacker = u.id === w.id;
                      const isNearby = !isAttacker && u.hp > 0 && tileDist(u.x, u.y, capturedNcX, capturedNcY) <= 3;
                      const xpGain = isAttacker ? NECROMANCER_XP_REWARD : isNearby ? Math.round(NECROMANCER_XP_REWARD * 0.25) : 0;
                      if (xpGain === 0) return u;
                      const newXp = u.xp + xpGain;
                      const newLevel = newXp >= XP_TO_LEVEL_2 ? 2 : newXp >= XP_TO_LEVEL_1 ? 1 : 0;
                      if (newLevel > u.level) {
                        addFloatingText(Math.round(u.x), Math.round(u.y), `⭐ Level ${newLevel}!`, '#fbbf24');
                        return { ...u, xp: newXp, level: newLevel, maxHp: u.maxHp + VETERAN_HP_BONUS, hp: Math.min(u.hp + VETERAN_HP_BONUS, u.maxHp + VETERAN_HP_BONUS) };
                      }
                      return { ...u, xp: newXp };
                    }));
                  }
                }, moraleMs9);
              }
            } else if (w.attacking.targetType === 'witchDoctor') {
              const wdId = (w.attacking as { targetType: 'witchDoctor'; witchDoctorId: number }).witchDoctorId;
              const wdTarget = enemyWitchDoctorsRef.current.find(d => d.id === wdId && d.hp > 0);
              if (!wdTarget) return { ...w, attacking: null, state: 'idle' };
              const distToWD = tileDist(w.x, w.y, wdTarget.x, wdTarget.y);
              if (distToWD > 1.8) {
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: Math.round(wdTarget.x), y: Math.round(wdTarget.y) });
                return { ...w, movingTo: p[0] ?? { x: wdTarget.x, y: wdTarget.y }, path: p.slice(1), state: 'moving' };
              }
              if (!attackT[w.id]) {
                const capturedWDX = Math.round(wdTarget.x), capturedWDY = Math.round(wdTarget.y);
                const capturedWDId = wdId;
                const unitBonusWD = w.unitType === 'hero' ? HERO_DAMAGE_BONUS : w.unitType === 'swordsman' ? SWORDSMAN_DAMAGE_BONUS : w.unitType === 'cavalry' ? CAVALRY_DAMAGE_BONUS : 0;
                const capturedVetWD = w.level;
                const moraleWD = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + (shrineWarBuffRef.current ? 5 : 0) + unitBonusWD + capturedVetWD * VETERAN_ATK_BONUS;
                  setEnemyWitchDoctors(ds => ds.map(d => d.id === capturedWDId ? { ...d, hp: Math.max(0, d.hp - dmg) } : d));
                  addFloatingText(capturedWDX, capturedWDY, `-${dmg}`, '#ef4444');
                  const wdCurrent = enemyWitchDoctorsRef.current.find(d => d.id === capturedWDId);
                  if (wdCurrent && wdCurrent.hp - dmg <= 0) {
                    setResources(r => ({ ...r, gold: r.gold + WITCH_DOCTOR_GOLD_REWARD }));
                    addFloatingText(capturedWDX, capturedWDY, `+${WITCH_DOCTOR_GOLD_REWARD}🪙`, '#fbbf24');
                    setWorkers(ws2 => ws2.map(u => {
                      const isAttacker = u.id === w.id;
                      const isNearby = !isAttacker && u.hp > 0 && tileDist(u.x, u.y, capturedWDX, capturedWDY) <= 3;
                      const xpGain = isAttacker ? WITCH_DOCTOR_XP_REWARD : isNearby ? Math.round(WITCH_DOCTOR_XP_REWARD * 0.25) : 0;
                      if (xpGain === 0) return u;
                      const newXp = u.xp + xpGain;
                      const newLevel = newXp >= XP_TO_LEVEL_2 ? 2 : newXp >= XP_TO_LEVEL_1 ? 1 : 0;
                      if (newLevel > u.level) {
                        addFloatingText(Math.round(u.x), Math.round(u.y), `⭐ Level ${newLevel}!`, '#fbbf24');
                        return { ...u, xp: newXp, level: newLevel, maxHp: u.maxHp + VETERAN_HP_BONUS, hp: Math.min(u.hp + VETERAN_HP_BONUS, u.maxHp + VETERAN_HP_BONUS) };
                      }
                      return { ...u, xp: newXp };
                    }));
                  }
                }, moraleWD);
              }
            } else {
              if (!attackT[w.id]) {
                const capturedWX = Math.round(w.x), capturedWY = Math.round(w.y);
                const unitBonus2 = w.unitType === 'hero' ? HERO_DAMAGE_BONUS : w.unitType === 'swordsman' ? SWORDSMAN_DAMAGE_BONUS : w.unitType === 'cavalry' ? CAVALRY_DAMAGE_BONUS : 0;
                const capturedVetLevel = w.level;
                const moraleMs4 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + (shrineWarBuffRef.current ? 5 : 0) + unitBonus2 + capturedVetLevel * VETERAN_ATK_BONUS;
                  setWorkers(ws2 => ws2.map(w2 => {
                    if (w2.id !== w.id || w2.state !== 'attacking' || !w2.attacking) return w2;
                    setEnemyBarnHp(hp => { const nHp = Math.max(0, hp - dmg); if (nHp <= 0) setGameOver('victory'); return nHp; });
                    addFloatingText(ENEMY_BARN_POS.x, ENEMY_BARN_POS.y, `-${dmg}`, '#ef4444');
                    const counterDmg = Math.max(1, ENEMY_COUNTER_DAMAGE - blacksmithUpgradesRef.current.ironHide * 2);
                    addFloatingText(capturedWX, capturedWY, `-${counterDmg}`, '#fca5a5');
                    return { ...w2, hp: Math.max(0, w2.hp - counterDmg) };
                  }));
                }, moraleMs4);
              }
            }
          }

          // Catapult auto-fire: idle catapult fires AoE splash at nearest grunt in range
          if (w.unitType === 'catapult' && w.state === 'idle' && !attackT[w.id]) {
            const nearestGrunt = enemyGruntsRef.current.reduce<EnemyGrunt | null>((best, g) => {
              const d = tileDist(w.x, w.y, g.x, g.y);
              if (d > CATAPULT_RANGE) return best;
              if (!best || d < tileDist(w.x, w.y, best.x, best.y)) return g;
              return best;
            }, null);
            if (nearestGrunt) {
              const cx = nearestGrunt.x, cy = nearestGrunt.y;
              const capturedWX = Math.round(w.x), capturedWY = Math.round(w.y);
              attackT[w.id] = window.setTimeout(() => {
                delete attackTimeoutsRef.current[w.id];
                addFloatingText(capturedWX, capturedWY, '🪨 Fire!', '#f97316');
                setEnemyGrunts(gs => gs.map(g => {
                  const d = tileDist(g.x, g.y, cx, cy);
                  if (d <= CATAPULT_SPLASH_RANGE) {
                    const dmg = d === 0 ? CATAPULT_DAMAGE : CATAPULT_SPLASH_DAMAGE;
                    addFloatingText(Math.round(g.x), Math.round(g.y), `-${dmg}`, '#f97316');
                    return { ...g, hp: Math.max(0, g.hp - dmg) };
                  }
                  return g;
                }));
              }, CATAPULT_FIRE_MS);
            }
          }

          // Trebuchet auto-fire: idle trebuchet fires at enemy barn or enemy towers in range (min range enforced)
          if (w.unitType === 'trebuchet' && w.state === 'idle' && !attackT[w.id]) {
            const barnDist = tileDist(w.x, w.y, ENEMY_BARN_POS.x, ENEMY_BARN_POS.y);
            const barnAlive = enemyBarnHpRef.current > 0;
            const towerTarget = enemyTowersRef.current.find(t => t.hp > 0 && tileDist(w.x, w.y, t.x, t.y) <= TREBUCHET_RANGE && tileDist(w.x, w.y, t.x, t.y) >= TREBUCHET_MIN_RANGE);
            const shootBarn = barnAlive && barnDist <= TREBUCHET_RANGE && barnDist >= TREBUCHET_MIN_RANGE;
            if (shootBarn || towerTarget) {
              const capturedWX = Math.round(w.x), capturedWY = Math.round(w.y);
              const targetPos = towerTarget ? { x: towerTarget.x, y: towerTarget.y, isTower: true, towerId: towerTarget.id } : { x: ENEMY_BARN_POS.x, y: ENEMY_BARN_POS.y, isTower: false, towerId: -1 };
              attackT[w.id] = window.setTimeout(() => {
                delete attackTimeoutsRef.current[w.id];
                addFloatingText(capturedWX, capturedWY, '🪨 FIRE!', '#b45309');
                if (targetPos.isTower) {
                  addFloatingText(targetPos.x, targetPos.y, `-${TREBUCHET_DAMAGE}`, '#b45309');
                  setEnemyTowers(ts => ts.map(t => t.id === targetPos.towerId ? { ...t, hp: Math.max(0, t.hp - TREBUCHET_DAMAGE) } : t));
                } else {
                  addFloatingText(ENEMY_BARN_POS.x, ENEMY_BARN_POS.y, `-${TREBUCHET_DAMAGE}`, '#b45309');
                  setEnemyBarnHp(hp => { const nHp = Math.max(0, hp - TREBUCHET_DAMAGE); if (nHp <= 0) setGameOver('victory'); return nHp; });
                }
              }, TREBUCHET_FIRE_MS);
            }
          }

          // Building repair: worker in 'repairing' state ticks HP up on the target building
          if (w.state === 'repairing' && w.repairing) {
            const bid = w.repairing.buildingId;
            if (!buildingRepairTimeoutsRef.current[w.id]) {
              const capturedWId = w.id;
              buildingRepairTimeoutsRef.current[capturedWId] = window.setTimeout(() => {
                delete buildingRepairTimeoutsRef.current[capturedWId];
                let stillDamaged = false;
                setPlacedBuildings(bs => bs.map(b => {
                  if (b.id !== bid) return b;
                  const newHp = Math.min(b.maxHp, b.hp + 5);
                  stillDamaged = newHp < b.maxHp;
                  addFloatingText(b.x, b.y, '+5🔧', '#34d399');
                  return { ...b, hp: newHp };
                }));
                // If building is fully repaired, go idle
                if (!stillDamaged) {
                  setWorkers(ws2 => ws2.map(w2 => w2.id === capturedWId ? { ...w2, repairing: null, state: 'idle' as const } : w2));
                }
              }, REPAIR_INTERVAL_MS);
            }
          } else if (buildingRepairTimeoutsRef.current[w.id] && w.state !== 'repairing') {
            clearTimeout(buildingRepairTimeoutsRef.current[w.id]);
            delete buildingRepairTimeoutsRef.current[w.id];
          }

          // Auto-repair: idle workers near barn slowly regenerate HP
          if (w.state === 'idle' && w.hp < w.maxHp && tileDist(w.x, w.y, BARN_POS.x, BARN_POS.y) <= REPAIR_RADIUS) {
            if (!repairTimeoutsRef.current[w.id]) {
              const capturedId = w.id;
              repairTimeoutsRef.current[capturedId] = window.setTimeout(() => {
                delete repairTimeoutsRef.current[capturedId];
                setWorkers(ws2 => ws2.map(w2 => {
                  if (w2.id !== capturedId || w2.state !== 'idle' || w2.hp >= w2.maxHp) return w2;
                  addFloatingText(Math.round(w2.x), Math.round(w2.y), `+${REPAIR_AMOUNT}`, '#4ade80');
                  return { ...w2, hp: Math.min(w2.maxHp, w2.hp + REPAIR_AMOUNT) };
                }));
              }, REPAIR_INTERVAL_MS);
            }
          } else if (repairTimeoutsRef.current[w.id] && w.state !== 'idle') {
            clearTimeout(repairTimeoutsRef.current[w.id]);
            delete repairTimeoutsRef.current[w.id];
          }

          // Auto-repair burning buildings: idle farmers near a burning building automatically start repairing it
          if (w.state === 'idle' && w.unitType === 'farmer' && !w.gathering && !w.attacking) {
            const burningBuilding = placedBuildingsRef.current.find(b => b.hp > 0 && b.hp / b.maxHp < 0.25 && tileDist(w.x, w.y, b.x, b.y) <= 3);
            if (burningBuilding) {
              const dest = { x: burningBuilding.x, y: burningBuilding.y };
              const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, dest);
              return { ...w, repairing: { buildingId: burningBuilding.id }, state: 'moving' as const, movingTo: p[0] ?? dest, path: p.slice(1) };
            }
          }

          // Patrol: when idle at endpoint, flip heading and march to other point
          if (w.patrol && w.state === 'idle' && !w.movingTo) {
            const nextTarget = w.patrol.heading === 'b' ? w.patrol.a : w.patrol.b;
            const newHeading = w.patrol.heading === 'b' ? 'a' as const : 'b' as const;
            const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, nextTarget);
            return { ...w, patrol: { ...w.patrol, heading: newHeading }, movingTo: p[0] ?? nextTarget, path: p.slice(1), state: 'moving' };
          }

          return w;
        });
      });

      // Update enemy grunts
      const currentWorkers = workersRef.current;
      setEnemyGrunts(gs => {
        const survived = gs.filter(g => g.hp > 0);
        const killed = gs.filter(g => g.hp <= 0);
        if (killed.length > 0) {
          setKillCount(k => k + killed.length);
          const goldDrop = killed.reduce((sum, g) => sum + (g.isBoss ? BOSS_GOLD_REWARD : 5), 0);
          setResources(r => ({ ...r, gold: r.gold + goldDrop }));
          killed.forEach(g => addFloatingText(Math.round(g.x), Math.round(g.y), g.isBoss ? `💀+${BOSS_GOLD_REWARD}🪙` : `+5🪙`, '#fbbf24'));
          // Record positions for necromancer to raise
          const now = Date.now();
          setDeadGruntPositions(prev => [...prev.filter(p => now - p.t < 20000), ...killed.map(g => ({ x: Math.round(g.x), y: Math.round(g.y), t: now }))]);
        }
        return survived;
      });
      // Remove destroyed buildings and spawn loot drops (partial resource refund)
      setPlacedBuildings(bs => {
        const destroyed = bs.filter(b => b.hp <= 0);
        destroyed.forEach(b => {
          const cost = BUILDING_COSTS[b.type];
          if (!cost) return;
          const gold = Math.round((cost.gold ?? 0) * 0.3);
          const lumber = Math.round((cost.lumber ?? 0) * 0.3);
          const stone = Math.round((cost.stone ?? 0) * 0.3);
          if (gold > 0 || lumber > 0 || stone > 0) {
            const newId = lootCrateIdRef.current++;
            setLootCrates(lcs => [...lcs, { id: newId, x: b.x, y: b.y, gold, lumber, stone }]);
            addFloatingText(b.x, b.y, '💥 DESTROYED!', '#f97316');
          }
        });
        return bs.filter(b => b.hp > 0);
      });

      // Burn damage: buildings below 25% HP take 1 HP/s unless a worker is actively repairing
      const repairingBuildingIds = new Set(workersRef.current.filter(w => w.state === 'repairing' && w.repairing).map(w => w.repairing!.buildingId));
      setPlacedBuildings(bs => bs.map(b => {
        if (b.hp <= 0 || b.hp / b.maxHp >= 0.25) return b;
        if (repairingBuildingIds.has(b.id)) return b;
        return { ...b, hp: Math.max(1, b.hp - dt) };
      }));

      const gruntSpeedMult = isNightRef.current ? NIGHT_SPEED_MULT : 1;
      setEnemyGrunts(gs => gs.map(g => {
        const frostMult = g.frozenUntil && Date.now() < g.frozenUntil ? FROST_TOWER_SLOW_FACTOR : 1;
        // Proximity aggro: switch to attack nearest worker within 2 tiles
        const nearWorker = currentWorkers.find(w => w.hp > 0 && tileDist(g.x, g.y, w.x, w.y) <= 2);
        if (nearWorker) {
          const distToWorker = tileDist(g.x, g.y, nearWorker.x, nearWorker.y);
          if (distToWorker <= 1.4) {
            // Attack worker
            if (!gruntAttackTimeoutsRef.current[g.id]) {
              const wid = nearWorker.id;
              const capturedGruntId = g.id;
              const capturedWX = Math.round(nearWorker.x), capturedWY = Math.round(nearWorker.y);
              gruntAttackTimeoutsRef.current[g.id] = window.setTimeout(() => {
                delete gruntAttackTimeoutsRef.current[g.id];
                const gruntEnraged = (enemyGruntsRef.current.find(gg => gg.id === capturedGruntId)?.enragedUntil ?? 0) > Date.now();
                const gruntDmg = Math.max(1, GRUNT_DAMAGE + (gruntEnraged ? WITCH_DOCTOR_ENRAGE_DMG_BONUS : 0) - blacksmithUpgradesRef.current.ironHide * 2);
                setWorkers(ws2 => ws2.map(w2 => {
                  if (w2.id !== wid) return w2;
                  const newHp = Math.max(0, w2.hp - gruntDmg);
                  // Auto-retaliate: if idle and capable of fighting, attack the grunt back
                  if (w2.state === 'idle' && !w2.attacking && w2.unitType !== 'catapult' && w2.unitType !== 'trebuchet') {
                    const attacker = enemyGruntsRef.current.find(gg => gg.id === capturedGruntId && gg.hp > 0);
                    if (attacker) return { ...w2, hp: newHp, attacking: { targetType: 'grunt' as const, gruntId: capturedGruntId }, state: 'attacking' as const };
                  }
                  return { ...w2, hp: newHp };
                }));
                addFloatingText(capturedWX, capturedWY, `-${gruntDmg}`, '#ef4444');
                triggerUnderAttackRef.current();
              }, GRUNT_ATTACK_MS);
            }
            return { ...g, movingTo: null, path: [], state: 'attacking' };
          }
          // Move toward worker
          const p = aStar(INITIAL_TILES, { x: Math.round(g.x), y: Math.round(g.y) }, { x: Math.round(nearWorker.x), y: Math.round(nearWorker.y) }, true, new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`)));
          const dx = nearWorker.x - g.x, dy = nearWorker.y - g.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          return { ...g, movingTo: p[0] ?? { x: nearWorker.x, y: nearWorker.y }, path: p.slice(1), state: 'moving', x: g.x + (dx / d) * Math.min(GRUNT_SPEED * gruntSpeedMult * frostMult * dt, d), y: g.y + (dy / d) * Math.min(GRUNT_SPEED * gruntSpeedMult * frostMult * dt, d) };
        }

        // Building aggro: prioritize military buildings over economic ones (AoE-style target AI)
        const BUILDING_PRIORITY: Partial<Record<BuildingType, number>> = { barracks: 5, siegeWorkshop: 4, stable: 4, watchtower: 3, blacksmith: 2, farmhouse: 1 };
        const nearBuildingCandidates = placedBuildingsRef.current.filter(b => b.type !== 'wall' && b.hp > 0 && tileDist(g.x, g.y, b.x, b.y) <= 1.2);
        const nearBuilding = nearBuildingCandidates.sort((a, b2) => (BUILDING_PRIORITY[b2.type] ?? 0) - (BUILDING_PRIORITY[a.type] ?? 0))[0] ?? null;
        if (nearBuilding) {
          if (!buildingAttackTimeoutsRef.current[g.id]) {
            const bid = nearBuilding.id; const bx = nearBuilding.x; const by = nearBuilding.y;
            buildingAttackTimeoutsRef.current[g.id] = window.setTimeout(() => {
              delete buildingAttackTimeoutsRef.current[g.id];
              setPlacedBuildings(bs => bs.map(b => b.id === bid ? { ...b, hp: Math.max(0, b.hp - BUILDING_GRUNT_DAMAGE) } : b));
              addFloatingText(bx, by, `-${BUILDING_GRUNT_DAMAGE}`, '#f97316');
            }, GRUNT_ATTACK_MS);
          }
          return { ...g, movingTo: null, path: [], state: 'attacking' };
        }

        if (g.movingTo) {
          const dx = g.movingTo.x - g.x, dy = g.movingTo.y - g.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const epsilon = 0.12;
          if (d < epsilon) {
            if (g.path.length > 0) {
              const [next, ...rest] = g.path;
              return { ...g, x: g.movingTo.x, y: g.movingTo.y, movingTo: next ?? null, path: rest };
            }
            return { ...g, x: g.movingTo.x, y: g.movingTo.y, movingTo: null, path: [], state: 'attacking' };
          }
          return { ...g, x: g.x + (dx / d) * Math.min(GRUNT_SPEED * gruntSpeedMult * frostMult * dt, d), y: g.y + (dy / d) * Math.min(GRUNT_SPEED * gruntSpeedMult * frostMult * dt, d) };
        }
        if (g.state === 'attacking') {
          if (!gruntAttackTimeoutsRef.current[g.id]) {
            gruntAttackTimeoutsRef.current[g.id] = window.setTimeout(() => {
              delete gruntAttackTimeoutsRef.current[g.id];
              const barnArmor = Math.min(8, garrisonedRef.current.length * GARRISON_ARMOR_PER_UNIT);
              const rawBarnDmg = g.isBoss ? BOSS_DAMAGE : GRUNT_DAMAGE;
              const barnDmg = Math.max(1, rawBarnDmg - barnArmor);
              setPlayerBarnHp(hp => { const nHp = Math.max(0, hp - barnDmg); if (nHp <= 0) setGameOver('defeat'); return nHp; });
              addFloatingText(BARN_POS.x, BARN_POS.y, `-${barnDmg}`, g.isBoss ? '#dc2626' : '#ef4444');
              triggerUnderAttackRef.current();
            }, GRUNT_ATTACK_MS);
          }
        }
        // If grunt has no path and isn't attacking anything, re-path to highest-priority building in range or barn
        if (!g.movingTo && g.state !== 'attacking') {
          const PRIORITY: Partial<Record<BuildingType, number>> = { barracks: 5, siegeWorkshop: 4, stable: 4, watchtower: 3, blacksmith: 2, farmhouse: 1 };
          const buildings = placedBuildingsRef.current.filter(b => b.type !== 'wall' && b.hp > 0);
          const target = buildings.sort((a, b2) => (PRIORITY[b2.type] ?? 0) - (PRIORITY[a.type] ?? 0))[0];
          const dest = target ? { x: target.x, y: target.y } : BARN_POS;
          const wallSet2 = new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`));
          const p2 = aStar(INITIAL_TILES, { x: Math.round(g.x), y: Math.round(g.y) }, dest, true, wallSet2);
          return { ...g, movingTo: p2[0] ?? dest, path: p2.slice(1), state: 'moving' };
        }
        return g;
      }));

      // Update War Rams (enemy siege units)
      setEnemySiege(rams => {
        const survived = rams.filter(r => r.hp > 0);
        const killed = rams.filter(r => r.hp <= 0);
        if (killed.length > 0) {
          killed.forEach(r => {
            const reward = r.siegeType === 'demolisher' ? DEMOLISHER_GOLD_REWARD : WAR_RAM_GOLD_REWARD;
            setResources(res => ({ ...res, gold: res.gold + reward }));
            addFloatingText(Math.round(r.x), Math.round(r.y), `+${reward}🪙`, '#fbbf24');
          });
        }
        return survived.map(r => {
          const speed = r.siegeType === 'demolisher' ? DEMOLISHER_SPEED : WAR_RAM_SPEED;
          // Move toward target building/barn
          if (r.movingTo) {
            const dx = r.movingTo.x - r.x, dy = r.movingTo.y - r.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            // Demolisher stops when in fire range; ram stops at melee
            const stopRange = r.siegeType === 'demolisher' ? DEMOLISHER_FIRE_RANGE - 0.5 : 0.1;
            if (d < stopRange) {
              const next = r.path[0] ?? null;
              if (r.siegeType === 'demolisher') return { ...r, x: r.x, y: r.y, movingTo: null, path: [], state: 'attacking' as const };
              return { ...r, x: r.movingTo.x, y: r.movingTo.y, movingTo: next, path: r.path.slice(1), state: next ? 'moving' as const : 'attacking' as const };
            }
            return { ...r, x: r.x + (dx / d) * Math.min(speed * dt, d), y: r.y + (dy / d) * Math.min(speed * dt, d) };
          }
          const nearBuilding = placedBuildingsRef.current.filter(b => b.hp > 0).sort((a, b2) => tileDist(r.x, r.y, a.x, a.y) - tileDist(r.x, r.y, b2.x, b2.y))[0];
          const barnDist = tileDist(r.x, r.y, BARN_POS.x, BARN_POS.y);
          const buildingDist = nearBuilding ? tileDist(r.x, r.y, nearBuilding.x, nearBuilding.y) : Infinity;
          // Demolisher: ranged AoE attack
          if (r.siegeType === 'demolisher') {
            const atkRange = DEMOLISHER_FIRE_RANGE;
            const target = nearBuilding && buildingDist <= atkRange ? nearBuilding : barnDist <= atkRange ? null : null;
            const inRange = (nearBuilding && buildingDist <= atkRange) || barnDist <= atkRange;
            if (inRange) {
              if (!siegeAttackTimeoutsRef.current[r.id]) {
                const tx = nearBuilding && buildingDist <= atkRange ? nearBuilding.x : BARN_POS.x;
                const ty = nearBuilding && buildingDist <= atkRange ? nearBuilding.y : BARN_POS.y;
                siegeAttackTimeoutsRef.current[r.id] = window.setTimeout(() => {
                  delete siegeAttackTimeoutsRef.current[r.id];
                  // AoE splash on buildings
                  setPlacedBuildings(bs => bs.map(b => tileDist(tx, ty, b.x, b.y) <= DEMOLISHER_SPLASH_RANGE ? { ...b, hp: Math.max(0, b.hp - DEMOLISHER_DAMAGE) } : b));
                  // Direct barn hit
                  if (tileDist(tx, ty, BARN_POS.x, BARN_POS.y) <= DEMOLISHER_SPLASH_RANGE) {
                    setPlayerBarnHp(hp => { const nHp = Math.max(0, hp - DEMOLISHER_DAMAGE); if (nHp <= 0) setGameOver('defeat'); return nHp; });
                    triggerUnderAttackRef.current();
                  }
                  addFloatingText(tx, ty, `💣-${DEMOLISHER_DAMAGE}`, '#f97316');
                }, DEMOLISHER_ATTACK_MS);
              }
              return { ...r, state: 'attacking' as const };
            }
            // Move closer
            const wallSetD = new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`));
            const dDest2 = (nearBuilding && buildingDist < barnDist) ? { x: nearBuilding.x, y: nearBuilding.y } : BARN_POS;
            const dPath2 = aStar(INITIAL_TILES, { x: Math.round(r.x), y: Math.round(r.y) }, dDest2, true, wallSetD);
            return { ...r, movingTo: dPath2[0] ?? dDest2, path: dPath2.slice(1), state: 'moving' as const };
          }
          // War Ram: melee attack
          if (buildingDist <= 1.2 && nearBuilding) {
            if (!siegeAttackTimeoutsRef.current[r.id]) {
              const bid = nearBuilding.id; const bx = nearBuilding.x; const by = nearBuilding.y;
              siegeAttackTimeoutsRef.current[r.id] = window.setTimeout(() => {
                delete siegeAttackTimeoutsRef.current[r.id];
                setPlacedBuildings(bs => bs.map(b => b.id === bid ? { ...b, hp: Math.max(0, b.hp - WAR_RAM_DAMAGE) } : b));
                addFloatingText(bx, by, `🪵-${WAR_RAM_DAMAGE}`, '#dc2626');
              }, WAR_RAM_ATTACK_MS);
            }
            return { ...r, state: 'attacking' as const };
          }
          if (barnDist <= 1.2) {
            if (!siegeAttackTimeoutsRef.current[r.id]) {
              siegeAttackTimeoutsRef.current[r.id] = window.setTimeout(() => {
                delete siegeAttackTimeoutsRef.current[r.id];
                setPlayerBarnHp(hp => { const nHp = Math.max(0, hp - WAR_RAM_DAMAGE); if (nHp <= 0) setGameOver('defeat'); return nHp; });
                addFloatingText(BARN_POS.x, BARN_POS.y, `🪵-${WAR_RAM_DAMAGE}`, '#dc2626');
              }, WAR_RAM_ATTACK_MS);
            }
            return { ...r, state: 'attacking' as const };
          }
          // Re-path to nearest building or barn
          const wallSetR = new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`));
          const dest = (nearBuilding && buildingDist < barnDist) ? { x: nearBuilding.x, y: nearBuilding.y } : BARN_POS;
          const p = aStar(INITIAL_TILES, { x: Math.round(r.x), y: Math.round(r.y) }, dest, true, wallSetR);
          return { ...r, movingTo: p[0] ?? dest, path: p.slice(1), state: 'moving' as const };
        });
      });

      // Update Shamans
      setEnemyShamans(ss => {
        const alive = ss.filter(s => s.hp > 0);
        const killed = ss.filter(s => s.hp <= 0);
        if (killed.length > 0) {
          killed.forEach(s => {
            setResources(res => ({ ...res, gold: res.gold + SHAMAN_GOLD_REWARD }));
            addFloatingText(Math.round(s.x), Math.round(s.y), `+${SHAMAN_GOLD_REWARD}🪙`, '#fbbf24');
          });
        }
        return alive.map(s => {
          // Find nearest injured grunt within heal radius to follow
          const injuredGrunts = enemyGruntsRef.current.filter(g => g.hp > 0 && g.hp < g.maxHp);
          const nearInjured = injuredGrunts.sort((a, b2) => tileDist(s.x, s.y, a.x, a.y) - tileDist(s.x, s.y, b2.x, b2.y))[0];
          if (nearInjured) {
            const d = tileDist(s.x, s.y, nearInjured.x, nearInjured.y);
            if (d <= SHAMAN_HEAL_RADIUS) {
              // In range — heal nearby grunts
              if (!shamanHealTimersRef.current[s.id]) {
                const sid = s.id;
                shamanHealTimersRef.current[sid] = window.setTimeout(() => {
                  delete shamanHealTimersRef.current[sid];
                  setEnemyGrunts(gs => gs.map(g => {
                    if (g.hp <= 0 || tileDist(s.x, s.y, g.x, g.y) > SHAMAN_HEAL_RADIUS) return g;
                    const newHp = Math.min(g.maxHp, g.hp + SHAMAN_HEAL_AMOUNT);
                    if (newHp > g.hp) addFloatingText(Math.round(g.x), Math.round(g.y), `🧙+${SHAMAN_HEAL_AMOUNT}`, '#86efac');
                    return { ...g, hp: newHp };
                  }));
                }, SHAMAN_HEAL_MS);
              }
              return { ...s, state: 'healing' as const };
            }
            // Move toward injured grunt
            const dx = nearInjured.x - s.x, dy = nearInjured.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return { ...s, x: s.x + (dx / dist) * Math.min(SHAMAN_SPEED * dt, dist), y: s.y + (dy / dist) * Math.min(SHAMAN_SPEED * dt, dist), state: 'moving' as const };
          }
          // No injured grunts — follow nearest grunt toward barn
          if (s.movingTo) {
            const dx = s.movingTo.x - s.x, dy = s.movingTo.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.1) {
              const next = s.path[0] ?? null;
              return { ...s, x: s.movingTo.x, y: s.movingTo.y, movingTo: next, path: s.path.slice(1), state: 'moving' as const };
            }
            return { ...s, x: s.x + (dx / dist) * Math.min(SHAMAN_SPEED * dt, dist), y: s.y + (dy / dist) * Math.min(SHAMAN_SPEED * dt, dist) };
          }
          const wallSetS = new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`));
          const p = aStar(INITIAL_TILES, { x: Math.round(s.x), y: Math.round(s.y) }, BARN_POS, true, wallSetS);
          return { ...s, movingTo: p[0] ?? BARN_POS, path: p.slice(1) };
        });
      });

      // Update Necromancers
      setEnemyNecromancers(ns => {
        const alive = ns.filter(n => n.hp > 0);
        const killed = ns.filter(n => n.hp <= 0);
        if (killed.length > 0) {
          killed.forEach(n => {
            setResources(r => ({ ...r, gold: r.gold + NECROMANCER_GOLD_REWARD }));
            addFloatingText(Math.round(n.x), Math.round(n.y), `+${NECROMANCER_GOLD_REWARD}🪙`, '#fbbf24');
          });
        }
        return alive.map(n => {
          // Look for a recent dead grunt position within raise radius
          const now = Date.now();
          const nearCorpse = deadGruntPositionsRef.current.find(p => now - p.t < 20000 && tileDist(n.x, n.y, p.x, p.y) <= NECROMANCER_RAISE_RADIUS);
          if (nearCorpse) {
            if (!necromancerRaiseTimersRef.current[n.id]) {
              const nid = n.id; const cx2 = nearCorpse.x; const cy2 = nearCorpse.y;
              necromancerRaiseTimersRef.current[nid] = window.setTimeout(() => {
                delete necromancerRaiseTimersRef.current[nid];
                // Consume the corpse and spawn a skeleton grunt (half HP)
                setDeadGruntPositions(prev => prev.filter(p => !(p.x === cx2 && p.y === cy2)));
                const skeletonHp = Math.round(GRUNT_MAX_HP * 0.5);
                const wallSetN = new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`));
                const skPath = aStar(INITIAL_TILES, { x: cx2, y: cy2 }, BARN_POS, true, wallSetN);
                const skeleton: EnemyGrunt = { id: gruntIdRef.current++, x: cx2, y: cy2, hp: skeletonHp, maxHp: skeletonHp, movingTo: skPath[0] ?? BARN_POS, path: skPath.slice(1), state: 'moving', isSkeleton: true };
                setEnemyGrunts(gs => [...gs, skeleton]);
                addFloatingText(cx2, cy2, '💀 RAISED!', '#a855f7');
              }, NECROMANCER_RAISE_MS);
            }
            return { ...n, state: 'raising' as const };
          }
          // Move toward nearest corpse or follow grunts toward barn
          const nearestCorpse = deadGruntPositionsRef.current.filter(p => now - p.t < 20000).sort((a, b2) => tileDist(n.x, n.y, a.x, a.y) - tileDist(n.x, n.y, b2.x, b2.y))[0];
          const moveDest = nearestCorpse ? { x: nearestCorpse.x, y: nearestCorpse.y } : BARN_POS;
          if (n.movingTo) {
            const dx2 = n.movingTo.x - n.x, dy2 = n.movingTo.y - n.y;
            const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            if (d2 < 0.1) {
              const next2 = n.path[0] ?? null;
              return { ...n, x: n.movingTo.x, y: n.movingTo.y, movingTo: next2, path: n.path.slice(1), state: 'moving' as const };
            }
            return { ...n, x: n.x + (dx2 / d2) * Math.min(NECROMANCER_SPEED * dt, d2), y: n.y + (dy2 / d2) * Math.min(NECROMANCER_SPEED * dt, d2) };
          }
          const wallSetN2 = new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`));
          const p2 = aStar(INITIAL_TILES, { x: Math.round(n.x), y: Math.round(n.y) }, moveDest, true, wallSetN2);
          return { ...n, movingTo: p2[0] ?? moveDest, path: p2.slice(1) };
        });
      });

      // Update Witch Doctors
      setEnemyWitchDoctors(wds => {
        const alive = wds.filter(d => d.hp > 0);
        alive.forEach(d => {
          if (!alive.find(dd => dd.id === d.id)) {
            setResources(r => ({ ...r, gold: r.gold + WITCH_DOCTOR_GOLD_REWARD }));
          }
        });
        return alive.map(wd => {
          const nearGrunts = enemyGruntsRef.current.filter(g => g.hp > 0 && tileDist(wd.x, wd.y, g.x, g.y) <= WITCH_DOCTOR_BUFF_RADIUS);
          if (nearGrunts.length > 0) {
            if (!witchDoctorBuffTimersRef.current[wd.id]) {
              const wdid = wd.id; const capturedWDX2 = Math.round(wd.x); const capturedWDY2 = Math.round(wd.y);
              witchDoctorBuffTimersRef.current[wdid] = window.setTimeout(() => {
                delete witchDoctorBuffTimersRef.current[wdid];
                const buffUntil = Date.now() + WITCH_DOCTOR_BUFF_DURATION;
                setEnemyGrunts(gs => gs.map(g => {
                  if (g.hp <= 0 || tileDist(capturedWDX2, capturedWDY2, g.x, g.y) > WITCH_DOCTOR_BUFF_RADIUS) return g;
                  addFloatingText(Math.round(g.x), Math.round(g.y), '🔴BERSERK!', '#dc2626');
                  return { ...g, enragedUntil: buffUntil };
                }));
              }, WITCH_DOCTOR_BUFF_MS);
            }
            return { ...wd, state: 'casting' as const };
          }
          if (wd.movingTo) {
            const dx = wd.movingTo.x - wd.x, dy = wd.movingTo.y - wd.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.1) {
              const next = wd.path[0] ?? null;
              return { ...wd, x: wd.movingTo.x, y: wd.movingTo.y, movingTo: next, path: wd.path.slice(1), state: 'moving' as const };
            }
            return { ...wd, x: wd.x + (dx / dist) * Math.min(WITCH_DOCTOR_SPEED * dt, dist), y: wd.y + (dy / dist) * Math.min(WITCH_DOCTOR_SPEED * dt, dist), state: 'moving' as const };
          }
          const wallSetWD2 = new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`));
          const pWD = aStar(INITIAL_TILES, { x: Math.round(wd.x), y: Math.round(wd.y) }, BARN_POS, true, wallSetWD2);
          return { ...wd, movingTo: pWD[0] ?? BARN_POS, path: pWD.slice(1) };
        });
      });

      // Update enemy Troll Archers
      setEnemyTrolls(ts => {
        const alive = ts.filter(t => t.hp > 0);
        const killed = ts.filter(t => t.hp <= 0);
        killed.forEach(t => {
          setResources(r => ({ ...r, gold: r.gold + TROLL_GOLD_REWARD }));
          addFloatingText(Math.round(t.x), Math.round(t.y), `+${TROLL_GOLD_REWARD}🪙`, '#fbbf24');
        });
        return alive.map(t => {
          // Find nearest player unit within attack range
          const nearestWorker = workersRef.current.filter(w => w.hp > 0).sort((a, b2) => tileDist(t.x, t.y, a.x, a.y) - tileDist(t.x, t.y, b2.x, b2.y))[0];
          const distToWorker = nearestWorker ? tileDist(t.x, t.y, nearestWorker.x, nearestWorker.y) : 999;

          if (distToWorker <= TROLL_ATTACK_RANGE) {
            // Fire arrows at nearest worker
            if (!trollAttackTimersRef.current[t.id]) {
              const tid = t.id, twx = Math.round(nearestWorker!.x), twy = Math.round(nearestWorker!.y), wid = nearestWorker!.id;
              const capturedTX = Math.round(t.x), capturedTY = Math.round(t.y);
              trollAttackTimersRef.current[tid] = window.setTimeout(() => {
                delete trollAttackTimersRef.current[tid];
                addFloatingText(capturedTX, capturedTY, '🏹', '#f97316');
                setWorkers(ws => ws.map(w => {
                  if (w.id !== wid || w.hp <= 0) return w;
                  addFloatingText(twx, twy, `-${TROLL_DAMAGE}`, '#fca5a5');
                  return { ...w, hp: Math.max(0, w.hp - TROLL_DAMAGE) };
                }));
              }, TROLL_ATTACK_MS);
            }
            // Kite: if worker is getting close, back away
            if (distToWorker < TROLL_KITE_RANGE) {
              const dx = t.x - nearestWorker!.x, dy = t.y - nearestWorker!.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const nx = Math.max(0, Math.min(GRID_SIZE - 1, t.x + (dx / dist) * TROLL_SPEED * dt));
              const ny = Math.max(0, Math.min(GRID_SIZE - 1, t.y + (dy / dist) * TROLL_SPEED * dt));
              return { ...t, x: nx, y: ny, movingTo: null, path: [], state: 'kiting' as const };
            }
            return { ...t, state: 'attacking' as const };
          }

          // March toward barn but stop at attack range
          const distToBarn = tileDist(t.x, t.y, BARN_POS.x, BARN_POS.y);
          if (distToBarn <= TROLL_ATTACK_RANGE) {
            // Fire at barn if no worker target
            if (!trollAttackTimersRef.current[t.id]) {
              const tid = t.id;
              trollAttackTimersRef.current[tid] = window.setTimeout(() => {
                delete trollAttackTimersRef.current[tid];
                addFloatingText(BARN_POS.x, BARN_POS.y, `🏹-${TROLL_DAMAGE}`, '#fca5a5');
                setPlayerBarnHp(hp => { const nHp = Math.max(0, hp - TROLL_DAMAGE); if (nHp <= 0) setGameOver('defeat'); return nHp; });
              }, TROLL_ATTACK_MS);
            }
            return { ...t, state: 'attacking' as const };
          }

          if (t.movingTo) {
            const dx = t.movingTo.x - t.x, dy = t.movingTo.y - t.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.1) {
              const next = t.path[0] ?? null;
              return { ...t, x: t.movingTo.x, y: t.movingTo.y, movingTo: next, path: t.path.slice(1), state: 'moving' as const };
            }
            return { ...t, x: t.x + (dx / dist) * Math.min(TROLL_SPEED * dt, dist), y: t.y + (dy / dist) * Math.min(TROLL_SPEED * dt, dist) };
          }
          const wallSetT = new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`));
          const p = aStar(INITIAL_TILES, { x: Math.round(t.x), y: Math.round(t.y) }, BARN_POS, true, wallSetT);
          return { ...t, movingTo: p[0] ?? BARN_POS, path: p.slice(1), state: 'moving' as const };
        });
      });

      // Update Goblin Sappers
      setEnemySappers(ss => {
        const alive = ss.filter(s => !s.exploded && s.hp > 0);
        const killed = ss.filter(s => !s.exploded && s.hp <= 0);
        killed.forEach(s => {
          setResources(r => ({ ...r, gold: r.gold + SAPPER_GOLD_REWARD }));
          addFloatingText(Math.round(s.x), Math.round(s.y), `+${SAPPER_GOLD_REWARD}🪙 💥Defused!`, '#fbbf24');
        });
        return alive.map(s => {
          const distToTarget = tileDist(s.x, s.y, s.targetX, s.targetY);
          // Explode on reaching target
          if (distToTarget < 0.8) {
            addFloatingText(Math.round(s.x), Math.round(s.y), '💥 BOOM!', '#f97316');
            // Damage all buildings in radius
            setPlacedBuildings(bs => bs.map(b => {
              const d = tileDist(b.x, b.y, s.x, s.y);
              if (d > SAPPER_EXPLODE_RADIUS) return b;
              const newHp = Math.max(0, b.hp - SAPPER_EXPLODE_DAMAGE);
              addFloatingText(b.x, b.y, `-${SAPPER_EXPLODE_DAMAGE}`, '#ef4444');
              return { ...b, hp: newHp };
            }));
            // Damage player barn if in range
            if (tileDist(s.x, s.y, BARN_POS.x, BARN_POS.y) <= SAPPER_EXPLODE_RADIUS) {
              setPlayerBarnHp(hp => { const nHp = Math.max(0, hp - SAPPER_EXPLODE_DAMAGE); if (nHp <= 0) setGameOver('defeat'); return nHp; });
              addFloatingText(BARN_POS.x, BARN_POS.y, `-${SAPPER_EXPLODE_DAMAGE}`, '#ef4444');
            }
            // Damage workers in radius
            setWorkers(ws => ws.map(w => {
              if (tileDist(w.x, w.y, s.x, s.y) > SAPPER_EXPLODE_RADIUS) return w;
              addFloatingText(Math.round(w.x), Math.round(w.y), `-${SAPPER_EXPLODE_DAMAGE}`, '#fca5a5');
              return { ...w, hp: Math.max(0, w.hp - SAPPER_EXPLODE_DAMAGE) };
            }));
            // XP reward to nearby attackers
            setWorkers(ws2 => ws2.map(u => {
              if (!u.attacking || u.attacking.targetType !== 'sapper') return u;
              const xpGain = SAPPER_XP_REWARD;
              const newXp = u.xp + xpGain;
              const newLevel = newXp >= XP_TO_LEVEL_2 ? 2 : newXp >= XP_TO_LEVEL_1 ? 1 : 0;
              if (newLevel > u.level) {
                addFloatingText(Math.round(u.x), Math.round(u.y), `⭐ Level ${newLevel}!`, '#fbbf24');
                return { ...u, xp: newXp, level: newLevel, maxHp: u.maxHp + VETERAN_HP_BONUS, hp: Math.min(u.hp + VETERAN_HP_BONUS, u.maxHp + VETERAN_HP_BONUS), attacking: null, state: 'idle' as const };
              }
              return { ...u, xp: newXp, attacking: null, state: 'idle' as const };
            }));
            return { ...s, exploded: true };
          }
          // Move toward target
          if (s.movingTo) {
            const dx = s.movingTo.x - s.x, dy = s.movingTo.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.1) {
              const next = s.path[0] ?? null;
              if (!next) return { ...s, x: s.movingTo.x, y: s.movingTo.y, movingTo: null, path: [] };
              return { ...s, x: s.movingTo.x, y: s.movingTo.y, movingTo: next, path: s.path.slice(1) };
            }
            return { ...s, x: s.x + (dx / dist) * Math.min(SAPPER_SPEED * dt, dist), y: s.y + (dy / dist) * Math.min(SAPPER_SPEED * dt, dist) };
          }
          const wallSetSp = new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`));
          const p = aStar(INITIAL_TILES, { x: Math.round(s.x), y: Math.round(s.y) }, { x: s.targetX, y: s.targetY }, true, wallSetSp);
          return { ...s, movingTo: p[0] ?? { x: s.targetX, y: s.targetY }, path: p.slice(1) };
        }).filter(s => !s.exploded);
      });

      // Update neutral creeps
      setNeutralCreeps(creeps => {
        const alive = creeps.filter(c => c.hp > 0);
        const killed = creeps.filter(c => c.hp <= 0);
        if (killed.length > 0) {
          // Check if any camp is now fully cleared
          CREEP_CAMPS.forEach(camp => {
            const campAlive = alive.filter(c => c.campId === camp.id);
            if (campAlive.length === 0 && killed.some(c => c.campId === camp.id)) {
              setClearedCamps(s => { if (s.has(camp.id)) return s; const n = new Set(s); n.add(camp.id); return n; });
              setResources(r => ({ ...r, gold: r.gold + camp.goldReward }));
              addFloatingText(camp.x, camp.y, `+${camp.goldReward}🪙 Camp!`, '#fbbf24');
            }
          });
          killed.forEach(c => { if (creepAttackTimeoutsRef.current[c.id]) { clearTimeout(creepAttackTimeoutsRef.current[c.id]); delete creepAttackTimeoutsRef.current[c.id]; } });
        }
        return alive.map(c => {
          const workers2 = workersRef.current;
          // Leash: if too far from home, return
          const distHome = tileDist(c.x, c.y, c.homeX, c.homeY);
          if (distHome > CREEP_LEASH_RANGE) {
            return { ...c, state: 'returning' as const, targetWorkerId: null,
              x: c.x + ((c.homeX - c.x) / distHome) * Math.min(CREEP_SPEED * dt, distHome),
              y: c.y + ((c.homeY - c.y) / distHome) * Math.min(CREEP_SPEED * dt, distHome) };
          }
          // Aggro nearest worker in range
          const aggro = workers2.reduce<WorkerState | null>((best, w) => {
            const d = tileDist(c.x, c.y, w.x, w.y);
            if (d > CREEP_AGGRO_RANGE) return best;
            if (!best || d < tileDist(c.x, c.y, best.x, best.y)) return w;
            return best;
          }, null);
          if (aggro) {
            const distW = tileDist(c.x, c.y, aggro.x, aggro.y);
            if (distW <= 1.4) {
              if (!creepAttackTimeoutsRef.current[c.id]) {
                const wid = aggro.id;
                const capturedX = Math.round(aggro.x), capturedY = Math.round(aggro.y);
                creepAttackTimeoutsRef.current[c.id] = window.setTimeout(() => {
                  delete creepAttackTimeoutsRef.current[c.id];
                  const creepDmg = Math.max(1, CREEP_DAMAGE - blacksmithUpgradesRef.current.ironHide * 2);
                  setWorkers(ws2 => ws2.map(w2 => w2.id === wid ? { ...w2, hp: Math.max(0, w2.hp - creepDmg) } : w2));
                  addFloatingText(capturedX, capturedY, `-${creepDmg}`, '#a855f7');
                }, CREEP_ATTACK_MS);
              }
              return { ...c, state: 'chasing' as const, targetWorkerId: aggro.id };
            }
            const dx2 = aggro.x - c.x, dy2 = aggro.y - c.y;
            const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            return { ...c, state: 'chasing' as const, targetWorkerId: aggro.id,
              x: c.x + (dx2 / d2) * Math.min(CREEP_SPEED * dt, d2),
              y: c.y + (dy2 / d2) * Math.min(CREEP_SPEED * dt, d2) };
          }
          // Return home if no aggro
          if (c.state === 'chasing' || c.state === 'returning') {
            if (distHome < 0.15) return { ...c, state: 'idle' as const, targetWorkerId: null, x: c.homeX, y: c.homeY };
            const dx3 = c.homeX - c.x, dy3 = c.homeY - c.y;
            const d3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
            return { ...c, state: 'returning' as const, targetWorkerId: null,
              x: c.x + (dx3 / d3) * Math.min(CREEP_SPEED * dt, d3),
              y: c.y + (dy3 / d3) * Math.min(CREEP_SPEED * dt, d3) };
          }
          return c;
        });
      });

      // Workers can also attack creeps (already tracked via attackTimeoutsRef for grunt targets)
      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      Object.values(gatherTimeoutsRef.current).forEach(clearTimeout);
      Object.values(attackTimeoutsRef.current).forEach(clearTimeout);
      Object.values(gruntAttackTimeoutsRef.current).forEach(clearTimeout);
      Object.values(repairTimeoutsRef.current).forEach(clearTimeout);
      Object.values(creepAttackTimeoutsRef.current).forEach(clearTimeout);
      Object.values(buildingRepairTimeoutsRef.current).forEach(clearTimeout);
      gatherTimeoutsRef.current = {};
      attackTimeoutsRef.current = {};
      gruntAttackTimeoutsRef.current = {};
      repairTimeoutsRef.current = {};
      creepAttackTimeoutsRef.current = {};
      buildingRepairTimeoutsRef.current = {};
    };
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => { e.preventDefault(); setZoom(z => Math.max(0.5, Math.min(2, z + (e.deltaY < 0 ? 0.25 : -0.25)))); };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const bounds = { minX: -((GRID_SIZE * TILE_SIZE) / 2), maxX: (GRID_SIZE * TILE_SIZE) / 2, minY: -100, maxY: (GRID_SIZE * TILE_SIZE) / 2 };
    const mvKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
    const onKey = (e: KeyboardEvent) => {
      if (!mvKeys.includes(e.key)) return;
      e.preventDefault();
      setCamera(c => {
        let { x, y } = c;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') y += 32;
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') y -= 32;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') x += 32;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') x -= 32;
        return { x: Math.max(bounds.minX, Math.min(bounds.maxX, x)), y: Math.max(bounds.minY, Math.min(bounds.maxY, y)) };
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const selectedWorkers = workers.filter(w => w.selected);
  const anySelected = selectedWorkers.length > 0;
  const viewBoxW = GRID_SIZE * TILE_SIZE * 2 + 200;
  const viewBoxH = GRID_SIZE * TILE_SIZE + 200;

  const handleFarmhouseAction = (action: string) => {
    if (action === 'build' || action === 'upgrade') {
      const level = farmhouse.built ? farmhouse.level : 0;
      const cost = farmhouseUpgradeCosts[level];
      if (!cost || (farmhouse.built && farmhouse.level >= maxFarmhouseLevel)) return;
      if (resources.gold < cost.gold || resources.lumber < cost.lumber) return;
      setResources(r => ({ ...r, gold: r.gold - cost.gold, lumber: r.lumber - cost.lumber }));
      setFarmhouse(fh => fh.built ? { built: true, level: fh.level + 1 } : { built: true, level: 1 });
      setResources(r => ({ ...r, foodCap: FOOD_CAP_BASE + (farmhouse.level + 1) * FOOD_CAP_PER_LEVEL }));
    } else if (action === 'train') {
      if (resources.gold < 30 || resources.food >= resources.foodCap) return;
      setResources(r => ({ ...r, gold: r.gold - 30, food: r.food + 1 }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [...ws, { ...makeWorker(newId, BARN_POS.x, BARN_POS.y), movingTo: path[0] ?? rp, path: path.slice(1), state: 'moving' as const }];
        }
        return [...ws, makeWorker(newId, BARN_POS.x, BARN_POS.y)];
      });
    } else if (action === 'recruitHero') {
      if (heroRecruited || resources.gold < 150 || resources.food >= resources.foodCap) return;
      setHeroRecruited(true);
      setResources(r => ({ ...r, gold: r.gold - 150, food: r.food + 1 }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const hero = makeUnit(newId, BARN_POS.x, BARN_POS.y, 'hero');
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [...ws, { ...hero, movingTo: path[0] ?? rp, path: path.slice(1), state: 'moving' }];
        }
        return [...ws, hero];
      });
    } else if (action === 'trainSwordsman') {
      if (resources.gold < 50 || resources.food >= resources.foodCap || trainingQueue.length >= 5) return;
      setResources(r => ({ ...r, gold: r.gold - 50, food: r.food + 1 }));
      setTrainingQueue(q => [...q, { type: 'swordsman' }]);
    } else if (action === 'trainCavalry') {
      if (resources.gold < 60 || resources.food >= resources.foodCap || trainingQueue.length >= 5) return;
      setResources(r => ({ ...r, gold: r.gold - 60, food: r.food + 1 }));
      setTrainingQueue(q => [...q, { type: 'cavalry' }]);
    } else if (action === 'trainCatapult') {
      if (resources.gold < 150 || resources.lumber < 80 || resources.food >= resources.foodCap) return;
      setResources(r => ({ ...r, gold: r.gold - 150, lumber: r.lumber - 80, food: r.food + 1 }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [...ws, { ...makeUnit(newId, BARN_POS.x, BARN_POS.y, 'catapult'), movingTo: path[0] ?? rp, path: path.slice(1), state: 'moving' as const }];
        }
        return [...ws, makeUnit(newId, BARN_POS.x, BARN_POS.y, 'catapult')];
      });
    } else if (action === 'trainTrebuchet') {
      if (resources.gold < 200 || resources.lumber < 80 || resources.stone < 60 || resources.food >= resources.foodCap) return;
      setResources(r => ({ ...r, gold: r.gold - 200, lumber: r.lumber - 80, stone: r.stone - 60, food: r.food + 1 }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [...ws, { ...makeUnit(newId, BARN_POS.x, BARN_POS.y, 'trebuchet'), movingTo: path[0] ?? rp, path: path.slice(1), state: 'moving' as const }];
        }
        return [...ws, makeUnit(newId, BARN_POS.x, BARN_POS.y, 'trebuchet')];
      });
    } else if (action === 'trade:lumberToGold') {
      if (resources.lumber < 50) return;
      setResources(r => ({ ...r, lumber: r.lumber - 50, gold: r.gold + 30 }));
      addFloatingText(BARN_POS.x, BARN_POS.y, '+30🪙', '#fbbf24');
    } else if (action === 'trade:stoneToGold') {
      if (resources.stone < 30) return;
      setResources(r => ({ ...r, stone: r.stone - 30, gold: r.gold + 20 }));
      addFloatingText(BARN_POS.x, BARN_POS.y, '+20🪙', '#fbbf24');
    } else if (action === 'trade:stoneToLumber') {
      if (resources.stone < 40) return;
      setResources(r => ({ ...r, stone: r.stone - 40, lumber: r.lumber + 25 }));
      addFloatingText(BARN_POS.x, BARN_POS.y, '+25🌲', '#4ade80');
    } else if (action === 'blacksmith:steelEdge') {
      const level = blacksmithUpgrades.steelEdge;
      if (level >= 2) return;
      const cost = level === 0 ? { gold: 80, stone: 60 } : { gold: 160, stone: 120 };
      if (resources.gold < cost.gold || resources.stone < cost.stone) return;
      setResources(r => ({ ...r, gold: r.gold - cost.gold, stone: r.stone - cost.stone }));
      setBlacksmithUpgrades(u => ({ ...u, steelEdge: u.steelEdge + 1 }));
      addFloatingText(BARN_POS.x, BARN_POS.y, `⚔️ Steel Edge ${level + 1}!`, '#f59e0b');
    } else if (action === 'blacksmith:ironHide') {
      const level = blacksmithUpgrades.ironHide;
      if (level >= 2) return;
      const cost = level === 0 ? { gold: 80, lumber: 50 } : { gold: 160, lumber: 100 };
      if (resources.gold < cost.gold || resources.lumber < cost.lumber) return;
      setResources(r => ({ ...r, gold: r.gold - cost.gold, lumber: r.lumber - cost.lumber }));
      setBlacksmithUpgrades(u => ({ ...u, ironHide: u.ironHide + 1 }));
      addFloatingText(BARN_POS.x, BARN_POS.y, `🛡️ Iron Hide ${level + 1}!`, '#38bdf8');
    } else if (action === 'guardTower') {
      if (guardTowerResearched || resources.gold < 120 || resources.stone < 80) return;
      setResources(r => ({ ...r, gold: r.gold - 120, stone: r.stone - 80 }));
      setGuardTowerResearched(true);
      addFloatingText(BARN_POS.x, BARN_POS.y, '🏰 Guard Tower!', '#22d3ee');
    } else if (action.startsWith('upgradeWall:')) {
      const bid = parseInt(action.split(':')[1] ?? '0');
      const wall = placedBuildings.find(b => b.id === bid && b.type === 'wall' && !b.upgraded);
      if (!wall || resources.gold < 50 || resources.stone < 20) return;
      setResources(r => ({ ...r, gold: r.gold - 50, stone: r.stone - 20 }));
      setPlacedBuildings(bs => bs.map(b => b.id === bid ? { ...b, upgraded: true, maxHp: 350, hp: Math.min(b.hp + 230, 350) } : b));
      addFloatingText(wall.x, wall.y, '🪨 Stone Wall!', '#94a3b8');
    } else if (action.startsWith('build:')) {
      const btype = action.split(':')[1] as BuildingType;
      if (BUILDING_COSTS[btype]) setBuildMode(btype);
    }
  };

  const handleWorkerCommand = (cmd: 'stop' | 'gather' | 'attack') => {
    if (cmd === 'stop') {
      Object.values(gatherTimeoutsRef.current).forEach(clearTimeout);
      Object.values(attackTimeoutsRef.current).forEach(clearTimeout);
      gatherTimeoutsRef.current = {};
      attackTimeoutsRef.current = {};
      setPatrolMode(false);
      setWorkers(ws => ws.map(w => w.selected ? { ...w, movingTo: null, path: [], gathering: null, attacking: null, repairing: null, attackMove: false, attackMoveTarget: null, patrol: null, holdPosition: false, waypoints: [], state: 'idle' } : w));
    }
  };

  const handleResearch = (type: keyof Upgrades) => {
    const currentLevel = upgrades[type];
    if (currentLevel >= UPGRADE_MAX) return;
    const cost = UPGRADE_COSTS[type][currentLevel];
    if (!cost) return;
    if (resources.gold < cost.gold || resources.lumber < cost.lumber || resources.stone < cost.stone) return;
    setResources(r => ({ ...r, gold: r.gold - cost.gold, lumber: r.lumber - cost.lumber, stone: r.stone - cost.stone }));
    setUpgrades(u => ({ ...u, [type]: u[type] + 1 }));
    if (type === 'ironWill') {
      const hpBonus = 25;
      setWorkers(ws => ws.map(w => ({ ...w, maxHp: w.maxHp + hpBonus, hp: Math.min(w.hp + hpBonus, w.maxHp + hpBonus) })));
    }
  };

  const handleRepairBuilding = useCallback((buildingId: number, bx: number, by: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!anySelected) return;
    const target = { x: bx, y: by };
    setWorkers(ws => ws.map(w => {
      if (!w.selected || w.unitType === 'catapult' || w.unitType === 'trebuchet') return w;
      const start = { x: Math.round(w.x), y: Math.round(w.y) };
      const path = aStar(INITIAL_TILES, start, target);
      return { ...w, movingTo: path[0] ?? target, path: path.slice(1), gathering: null, attacking: null, repairing: { buildingId }, patrol: null, state: 'moving' as const };
    }));
  }, [anySelected]);

  const handleAttackEnemyBarn = (e: React.MouseEvent) => {
    e.preventDefault();
    if (enemyBarnHp <= 0 || !anySelected) return;
    const adjTile = { x: ENEMY_BARN_POS.x - 1, y: ENEMY_BARN_POS.y };
    commandMove(adjTile.x, adjTile.y, null, { targetType: 'enemyBarn' });
  };

  const handleAttackEnemyTower = (towerId: number, tx: number, ty: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!anySelected) return;
    const adj = { x: Math.max(0, tx - 1), y: ty };
    commandMove(adj.x, adj.y, null, { targetType: 'enemyTower', towerId });
  };

  const handleAttackGrunt = useCallback((gruntId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!anySelected) return;
    const grunt = enemyGruntsRef.current.find(g => g.id === gruntId);
    if (!grunt) return;
    const tx = Math.round(grunt.x), ty = Math.round(grunt.y);
    setWorkers(ws => ws.map(w => {
      if (!w.selected) return w;
      const path = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: tx, y: ty });
      const first = path[0] ?? { x: tx, y: ty };
      return { ...w, movingTo: first, path: path.slice(1), gathering: null, attacking: { targetType: 'grunt' as const, gruntId }, state: 'moving' };
    }));
  }, [anySelected]);

  const handleAttackSiege = useCallback((siegeId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!anySelected) return;
    const ram = enemySiegeRef.current.find(r => r.id === siegeId);
    if (!ram) return;
    const tx = Math.round(ram.x), ty = Math.round(ram.y);
    setWorkers(ws => ws.map(w => {
      if (!w.selected) return w;
      const path = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: tx, y: ty });
      const first = path[0] ?? { x: tx, y: ty };
      return { ...w, movingTo: first, path: path.slice(1), gathering: null, attacking: { targetType: 'siege' as const, siegeId }, state: 'moving' };
    }));
  }, [anySelected]);

  const handleAttackShaman = useCallback((shamanId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!anySelected) return;
    const shaman = enemyShamansRef.current.find(s => s.id === shamanId);
    if (!shaman) return;
    const tx = Math.round(shaman.x), ty = Math.round(shaman.y);
    setWorkers(ws => ws.map(w => {
      if (!w.selected) return w;
      const path = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: tx, y: ty });
      const first = path[0] ?? { x: tx, y: ty };
      return { ...w, movingTo: first, path: path.slice(1), gathering: null, attacking: { targetType: 'shaman' as const, shamanId }, state: 'moving' };
    }));
  }, [anySelected]);

  const handleAttackNecromancer = useCallback((necroId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!anySelected) return;
    const necro = enemyNecromancersRef.current.find(n => n.id === necroId);
    if (!necro) return;
    const tx = Math.round(necro.x), ty = Math.round(necro.y);
    setWorkers(ws => ws.map(w => {
      if (!w.selected) return w;
      const path = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: tx, y: ty });
      const first = path[0] ?? { x: tx, y: ty };
      return { ...w, movingTo: first, path: path.slice(1), gathering: null, attacking: { targetType: 'necromancer' as const, necromancerId: necroId }, state: 'moving' };
    }));
  }, [anySelected]);

  const handleAttackWitchDoctor = useCallback((wdId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!anySelected) return;
    const wd = enemyWitchDoctorsRef.current.find(d => d.id === wdId);
    if (!wd) return;
    const tx = Math.round(wd.x), ty = Math.round(wd.y);
    setWorkers(ws => ws.map(w => {
      if (!w.selected) return w;
      const path = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: tx, y: ty });
      const first = path[0] ?? { x: tx, y: ty };
      return { ...w, movingTo: first, path: path.slice(1), gathering: null, attacking: { targetType: 'witchDoctor' as const, witchDoctorId: wdId }, state: 'moving' };
    }));
  }, [anySelected]);

  const handleAttackTroll = useCallback((trollId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!anySelected) return;
    const troll = enemyTrollsRef.current.find(t => t.id === trollId);
    if (!troll) return;
    const tx = Math.round(troll.x), ty = Math.round(troll.y);
    setWorkers(ws => ws.map(w => {
      if (!w.selected) return w;
      const path = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: tx, y: ty });
      const first = path[0] ?? { x: tx, y: ty };
      return { ...w, movingTo: first, path: path.slice(1), gathering: null, attacking: { targetType: 'troll' as const, trollId }, state: 'moving' };
    }));
  }, [anySelected]);

  const handleAttackSapper = useCallback((sapperId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!anySelected) return;
    const sapper = enemySappersRef.current.find(s => s.id === sapperId);
    if (!sapper) return;
    const tx = Math.round(sapper.x), ty = Math.round(sapper.y);
    setWorkers(ws => ws.map(w => {
      if (!w.selected) return w;
      const path = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: tx, y: ty });
      const first = path[0] ?? { x: tx, y: ty };
      return { ...w, movingTo: first, path: path.slice(1), gathering: null, attacking: { targetType: 'sapper' as const, sapperId }, state: 'moving' };
    }));
  }, [anySelected]);

  const handleAttackCreep = useCallback((creepId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!anySelected) return;
    const creep = neutralCreepsRef.current.find(c => c.id === creepId);
    if (!creep) return;
    const tx = Math.round(creep.x), ty = Math.round(creep.y);
    setWorkers(ws => ws.map(w => {
      if (!w.selected) return w;
      const path = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, { x: tx, y: ty });
      const first = path[0] ?? { x: tx, y: ty };
      // Reuse grunt attack state but target creep — we handle damage via attackTimeoutsRef with a creep target type
      return { ...w, movingTo: first, path: path.slice(1), gathering: null, attacking: { targetType: 'creep' as const, creepId }, state: 'moving' };
    }));
  }, [anySelected]);

  const minimapData = useMemo(() => ({
    workers: workers.map(w => ({ x: w.x, y: w.y, selected: w.selected })),
    grunts: enemyGrunts.map(g => ({ x: g.x, y: g.y })),
    enemyBarnAlive: enemyBarnHp > 0,
    buildings: placedBuildings.map(b => ({ x: b.x, y: b.y, type: b.type })),
    creepCamps: CREEP_CAMPS.map(c => ({ x: c.x, y: c.y, cleared: clearedCamps.has(c.id) })),
    enemyTowers: enemyTowers.filter(t => t.hp > 0).map(t => ({ x: t.x, y: t.y })),
    goldNodes: goldMines.filter(m => m.amount > 0).map(m => ({ x: m.x, y: m.y })),
    stoneNodes: stoneNodes.filter(n => n.amount > 0).map(n => ({ x: n.x, y: n.y })),
    treeNodes: trees.filter(t => t.amount > 0).map(t => ({ x: t.x, y: t.y })),
    warRams: enemySiege.filter(r => r.hp > 0).map(r => ({ x: r.x, y: r.y })),
    shamans: enemyShamans.filter(s => s.hp > 0).map(s => ({ x: s.x, y: s.y })),
    trolls: enemyTrolls.filter(t => t.hp > 0).map(t => ({ x: t.x, y: t.y })),
    sappers: enemySappers.filter(s => s.hp > 0 && !s.exploded).map(s => ({ x: s.x, y: s.y })),
    witchDoctors: enemyWitchDoctors.filter(d => d.hp > 0).map(d => ({ x: d.x, y: d.y })),
  }), [workers, enemyGrunts, enemyBarnHp, placedBuildings, clearedCamps, goldMines, stoneNodes, trees, enemyTowers, enemySiege, enemyShamans, enemyTrolls, enemySappers, enemyWitchDoctors]);

  return (
    <div className="absolute inset-0 bg-black" onContextMenu={e => { if (buildMode) { e.preventDefault(); setBuildMode(null); setGhostTile(null); } }}>
      {/* Victory / Defeat overlay */}
      {gameOver && (() => {
        const elapsed = Math.floor(((gameEndTime ?? Date.now()) - startTimeRef.current) / 1000);
        const mins = Math.floor(elapsed / 60), secs = elapsed % 60;
        const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
        const accentColor = gameOver === 'victory' ? '#fbbf24' : '#ef4444';
        return (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.88)' }}>
            <div className="text-7xl mb-3">{gameOver === 'victory' ? '🏆' : '💀'}</div>
            <div className="text-4xl font-bold mb-1" style={{ color: accentColor }}>
              {gameOver === 'victory' ? 'Victory!' : 'Defeat!'}
            </div>
            <div className="text-slate-400 mb-6 text-base">
              {gameOver === 'victory' ? 'The enemy farm has fallen.' : 'Your barn was destroyed by enemy forces.'}
            </div>
            {/* Score card */}
            <div style={{ background: 'rgba(15,23,42,0.9)', border: `2px solid ${accentColor}30`, borderRadius: 16, padding: '20px 40px', marginBottom: 28, minWidth: 300 }}>
              <div style={{ color: accentColor, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, textAlign: 'center' }}>Battle Report</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 32px' }}>
                <Stat label="Waves Survived" value={wave} color="#f97316" />
                <Stat label="Grunts Killed" value={killCount} color="#4ade80" />
                <Stat label="Gold Mined" value={`${totalGold}🪙`} color="#fde68a" />
                <Stat label="Lumber Cut" value={`${totalLumber}🌲`} color="#bbf7d0" />
                <Stat label="Workers" value={workers.filter(w => w.hp > 0).length} color="#38bdf8" />
                <Stat label="Time" value={timeStr} color="#94a3b8" />
              </div>
            </div>
            <button className="rounded-lg border-2 border-amber-500 bg-amber-500/20 px-8 py-3 text-lg text-amber-200 hover:bg-amber-500/40" onClick={() => { clearSave(); if (onNewGame) onNewGame(); else window.location.reload(); }}>
              Play Again
            </button>
          </div>
        );
      })()}

      {/* Wave announcement */}
      {wavePreview && (
        <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(120,53,15,0.92)', color: '#fde68a', fontSize: 13, fontWeight: 700, padding: '6px 20px', borderRadius: 8, zIndex: 24, pointerEvents: 'none', border: '2px solid #f59e0b', letterSpacing: 0.5, maxWidth: '80vw', textAlign: 'center' }}>
          {wavePreview}
        </div>
      )}
      {waveAnnouncement && (
        <div style={{ position: 'absolute', top: '22%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(127,29,29,0.92)', color: '#fca5a5', fontSize: 28, fontWeight: 800, padding: '10px 32px', borderRadius: 12, zIndex: 25, pointerEvents: 'none', border: '2px solid #ef4444', letterSpacing: 1 }}>
          {waveAnnouncement}
        </div>
      )}

      {underAttack && (
        <div style={{ position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)', background: 'rgba(185,28,28,0.92)', color: '#fecaca', fontSize: 15, fontWeight: 800, padding: '6px 28px', borderRadius: 8, zIndex: 26, pointerEvents: 'none', border: '2px solid #ef4444', letterSpacing: 1, animation: 'pulse 0.6s infinite' }}>
          ⚠ UNDER ATTACK ⚠
        </div>
      )}

      {/* Shrine buff indicators */}
      {(shrineWarBuff || shrinePlentyBuff) && (
        <div style={{ position: 'absolute', top: 56, right: 12, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 22, pointerEvents: 'none' }}>
          {shrineWarBuff && <div style={{ background: 'rgba(124,58,237,0.85)', color: '#fef3c7', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, border: '1px solid #f97316' }}>⚔️ War Shrine: +5 ATK</div>}
          {shrinePlentyBuff && <div style={{ background: 'rgba(6,78,59,0.85)', color: '#d1fae5', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, border: '1px solid #4ade80' }}>🌾 Plenty Shrine: +15% Gather</div>}
        </div>
      )}

      {phaseAnnouncement && (
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', background: dayPhase === 'night' ? 'rgba(15,10,40,0.95)' : 'rgba(120,80,0,0.92)', color: dayPhase === 'night' ? '#a5b4fc' : '#fde68a', fontSize: 24, fontWeight: 800, padding: '10px 28px', borderRadius: 12, zIndex: 24, pointerEvents: 'none', border: `2px solid ${dayPhase === 'night' ? '#6366f1' : '#fbbf24'}`, letterSpacing: 1 }}>
          {phaseAnnouncement}
        </div>
      )}

      {/* Resource bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 48, background: dayPhase === 'night' ? 'rgba(10,8,30,0.97)' : 'rgba(15,23,42,0.97)', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', fontSize: 17, zIndex: 20, borderBottom: `3px solid ${dayPhase === 'night' ? '#6366f1' : '#d97706'}`, fontWeight: 700, gap: 24 }}>
        <span style={{ color: dayPhase === 'night' ? '#a5b4fc' : '#fde68a', background: dayPhase === 'night' ? 'rgba(30,20,80,0.7)' : 'transparent', padding: '1px 8px', borderRadius: 6, fontSize: 14 }}>
          {dayPhase === 'night' ? '🌙' : '☀️'}
          <span style={{ display: 'inline-block', width: 36, height: 4, background: '#1e293b', borderRadius: 2, verticalAlign: 'middle', marginLeft: 4 }}>
            <span style={{ display: 'block', width: `${(1 - dayProgress) * 100}%`, height: '100%', background: dayPhase === 'night' ? '#6366f1' : '#fbbf24', borderRadius: 2 }} />
          </span>
        </span>
        <span style={{ color: resources.gold < 30 ? '#ef4444' : '#fde68a', fontWeight: resources.gold < 30 ? 700 : 400, animation: resources.gold < 30 ? 'pulse 1s infinite' : 'none' }}>🪙 {resources.gold}{incomeRate.gold > 0 && <span style={{ fontSize: 11, color: '#a3e635', marginLeft: 2 }}>+{incomeRate.gold}/m</span>}</span>
        <span style={{ color: resources.lumber < 20 ? '#ef4444' : '#bbf7d0', fontWeight: resources.lumber < 20 ? 700 : 400, animation: resources.lumber < 20 ? 'pulse 1s infinite' : 'none' }}>🌲 {resources.lumber}{incomeRate.lumber > 0 && <span style={{ fontSize: 11, color: '#a3e635', marginLeft: 2 }}>+{incomeRate.lumber}/m</span>}</span>
        <span style={{ color: resources.stone < 10 ? '#ef4444' : '#cbd5e1', fontWeight: resources.stone < 10 ? 700 : 400, animation: resources.stone < 10 ? 'pulse 1s infinite' : 'none' }}>🪨 {resources.stone}{incomeRate.stone > 0 && <span style={{ fontSize: 11, color: '#a3e635', marginLeft: 2 }}>+{incomeRate.stone}/m</span>}</span>
        {wave > 0 && <span style={{ color: '#f97316', background: 'rgba(249,115,22,0.15)', padding: '1px 10px', borderRadius: 6, fontSize: 14 }}>Wave {wave}</span>}
        {!gameOver && nextWaveAt && (() => { const secsLeft = Math.max(0, Math.ceil((nextWaveAt - Date.now()) / 1000)); const urgent = secsLeft <= 5; return <span style={{ color: urgent ? '#ef4444' : '#94a3b8', fontSize: 13, fontWeight: urgent ? 700 : 400, animation: urgent ? 'pulse 0.6s infinite' : 'none' }}>⏱ {secsLeft}s</span>; })()}
        {killCount > 0 && <span style={{ color: '#4ade80', fontSize: 14 }}>☠ {killCount}</span>}
        <span style={{ color: resources.food >= resources.foodCap ? '#ef4444' : '#fca5a5', fontWeight: resources.food >= resources.foodCap ? 700 : 400, marginLeft: 'auto', animation: resources.food >= resources.foodCap ? 'pulse 1s infinite' : 'none' }}>👥 {resources.food}/{resources.foodCap}{resources.food >= resources.foodCap ? ' ⚠' : ''}</span>
        {enemyGrunts.length > 0 && <span style={{ color: '#f97316', fontSize: 13 }}>⚠ {enemyGrunts.length} grunt{enemyGrunts.length > 1 ? 's' : ''}</span>}
        <button onClick={() => setGameSpeed(s => s === 1 ? 2 : 1)} style={{ background: gameSpeed === 2 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fde68a', padding: '2px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
          {gameSpeed === 1 ? '▶ 1×' : '▶▶ 2×'}
        </button>
        {buildMode ? (
          <span style={{ color: '#fcd34d', background: 'rgba(217,119,6,0.3)', padding: '2px 12px', borderRadius: 6, fontSize: 13 }}>
            Placing {BUILDING_COSTS[buildMode].label} · Click to place · Esc to cancel
          </span>
        ) : patrolMode ? (
          <span style={{ color: '#22d3ee', background: 'rgba(6,182,212,0.2)', padding: '2px 12px', borderRadius: 6, fontSize: 13 }}>
            🔄 Patrol Mode · Right-click destination · Esc to cancel
          </span>
        ) : attackMoveMode ? (
          <span style={{ color: '#f87171', background: 'rgba(239,68,68,0.2)', padding: '2px 12px', borderRadius: 6, fontSize: 13 }}>
            ⚔️ Attack-Move · Right-click destination · Esc to cancel
          </span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 400 }}>WASD pan · scroll zoom · Ctrl+A all · Tab idle · Ctrl+1-9 groups · P patrol · A atk-move · H hold · C charge · S sprint · F farmer · Q sword · R cavalry · Del stop · G garrison</span>
        )}
        <button onClick={doSave} style={{ background: saveStatus === 'saved' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: saveStatus === 'saved' ? '#4ade80' : '#94a3b8', padding: '2px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
          {saveStatus === 'saved' ? '✓ Saved' : '💾 Save'}
        </button>
        <button onClick={() => { clearSave(); if (onNewGame) onNewGame(); else window.location.reload(); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '2px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
          🗑 New Game
        </button>
      </div>

      {/* Control group chips */}
      {Object.keys(controlGroups).length > 0 && (
        <div style={{ position: 'absolute', top: 56, left: 8, zIndex: 15, display: 'flex', gap: 6 }}>
          {Object.entries(controlGroups).map(([num, ids]) => ids.length > 0 && (
            <div key={num} style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid #d97706', color: '#fde68a', padding: '2px 10px', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}
              onClick={() => { setSelectedType('worker'); setWorkers(ws => ws.map(w => ({ ...w, selected: ids.includes(w.id) }))); }}>
              [{num}] ×{ids.length}
            </div>
          ))}
        </div>
      )}

      {/* SVG map */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, pointerEvents: 'none' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
          width="100%" height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block', pointerEvents: 'auto', transform: `translate(${camera.x}px,${camera.y}px) scale(${zoom})`, userSelect: 'none', cursor: buildMode ? 'crosshair' : 'default' }}
          onMouseDown={handleSvgMouseDown}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={() => { isDraggingRef.current = false; setDragBox(null); setGhostTile(null); }}
        >
          {/* Tiles */}
          {[...Array(GRID_SIZE)].map((_, i) =>
            [...Array(GRID_SIZE)].map((_, j) => {
              const { isoX, isoY } = tileToSvg(i, j);
              let fill = '#14532d';
              if (tiles[i]?.[j] === 'dirt') fill = '#92400e';
              if (tiles[i]?.[j] === 'water') fill = '#1d4ed8';
              if (tiles[i]?.[j] === 'rock') fill = '#475569';
              if (tiles[i]?.[j] === 'tree') fill = '#166534';
              const pts = [[isoX, isoY + TILE_SIZE / 2], [isoX + TILE_SIZE, isoY], [isoX + TILE_SIZE * 2, isoY + TILE_SIZE / 2], [isoX + TILE_SIZE, isoY + TILE_SIZE]].map(p => p.join(',')).join(' ');
              return (
                <polygon key={`tile-${i}-${j}`} points={pts} fill={fill} stroke="#1e293b" strokeWidth={1.5}
                  onContextMenu={e => {
                    e.preventDefault();
                    if (buildMode) return;
                    if (selectedType === 'farmhouse') { setRallyPoint({ x: i, y: j }); return; }
                    if (!anySelected) return;
                    if (patrolModeRef.current) {
                      const dest = { x: i, y: j };
                      setWorkers(ws => ws.map(w => {
                        if (!w.selected) return w;
                        const a = { x: Math.round(w.x), y: Math.round(w.y) };
                        const p = aStar(INITIAL_TILES, a, dest);
                        return { ...w, patrol: { a, b: dest, heading: 'b' }, movingTo: p[0] ?? dest, path: p.slice(1), gathering: null, attacking: null, repairing: null, state: 'moving' };
                      }));
                      setPatrolMode(false);
                      return;
                    }
                    if (attackMoveModeRef.current) {
                      const dest = { x: i, y: j };
                      setWorkers(ws => ws.map(w => {
                        if (!w.selected || w.unitType === 'farmer' || w.unitType === 'catapult' || w.unitType === 'trebuchet') return w;
                        const a = { x: Math.round(w.x), y: Math.round(w.y) };
                        const p = aStar(INITIAL_TILES, a, dest);
                        return { ...w, attackMove: true, attackMoveTarget: dest, movingTo: p[0] ?? dest, path: p.slice(1), gathering: null, attacking: null, repairing: null, patrol: null, state: 'moving' };
                      }));
                      setAttackMoveMode(false);
                      return;
                    }
                    if (e.shiftKey && anySelected) { commandQueueMove(i, j); return; }
                    // Loot crate: right-click to send farmers to collect
                    const crateOnTile = lootCrates.find(c => Math.round(c.x) === i && Math.round(c.y) === j);
                    if (crateOnTile && anySelected) { commandMove(i, j); return; }
                    // Shrine: right-click to send one worker to channel
                    const shrineOnTile = SHRINES.find(s => s.x === i && s.y === j && !capturedShrines.has(s.id));
                    if (shrineOnTile && anySelected) {
                      const selectedWorkers = workers.filter(w => w.selected && w.hp > 0 && (w.unitType === 'farmer' || w.unitType === 'swordsman' || w.unitType === 'hero'));
                      if (selectedWorkers.length > 0) {
                        const channeler = selectedWorkers[0]!;
                        commandMove(i, j);
                        setShrineCapturing({ shrineId: shrineOnTile.id, workerId: channeler.id, startedAt: Date.now() });
                        addFloatingText(i, j, '⏳ Capturing...', '#a78bfa');
                      }
                      return;
                    }
                    commandMove(i, j);
                  }}
                  style={{ cursor: buildMode ? 'crosshair' : patrolMode ? 'crosshair' : attackMoveMode ? 'crosshair' : (anySelected || selectedType === 'farmhouse' ? 'pointer' : undefined) }}
                />
              );
            })
          )}

          {/* Build ghost */}
          {buildMode && ghostTile && ghostTile.x >= 0 && ghostTile.y >= 0 && ghostTile.x < GRID_SIZE && ghostTile.y < GRID_SIZE && (() => {
            const valid = !isTileOccupied(ghostTile.x, ghostTile.y);
            const { isoX, isoY } = tileToSvg(ghostTile.x, ghostTile.y);
            const pts = [[isoX, isoY + TILE_SIZE / 2], [isoX + TILE_SIZE, isoY], [isoX + TILE_SIZE * 2, isoY + TILE_SIZE / 2], [isoX + TILE_SIZE, isoY + TILE_SIZE]].map(p => p.join(',')).join(' ');
            return (
              <g pointerEvents="none">
                <polygon points={pts} fill={valid ? 'rgba(74,222,128,0.35)' : 'rgba(239,68,68,0.35)'} stroke={valid ? '#4ade80' : '#ef4444'} strokeWidth={3} strokeDasharray="8 4" />
                <text x={isoX + TILE_SIZE} y={isoY + TILE_SIZE / 2 + 10} textAnchor="middle" fontSize="28" opacity={0.85}>{BUILDING_EMOJI[buildMode]}</text>
              </g>
            );
          })()}

          {/* Stone nodes */}
          {stoneNodes.map(({ x, y, amount }, idx) => { if (!amount) return null;
            const { isoX, isoY } = tileToSvg(x, y);
            return <g key={`stone-${idx}`} style={{ cursor: 'pointer' }} onContextMenu={e => { e.preventDefault(); if (buildMode) return; commandMove(x, y, { type: 'stone', idx }); }}>
              <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 28} rx={22} ry={16} fill="#94a3b8" stroke="#475569" strokeWidth={3} />
              <ellipse cx={isoX + TILE_SIZE / 2 - 10} cy={isoY + 22} rx={14} ry={10} fill="#cbd5e1" stroke="#64748b" strokeWidth={2} />
              <text x={isoX + TILE_SIZE / 2} y={isoY + 46} textAnchor="middle" fontSize="13">🪨</text>
              <rect x={isoX + TILE_SIZE / 2 - 20} y={isoY + 4} width={40} height={5} fill="#1e293b" />
              <rect x={isoX + TILE_SIZE / 2 - 20} y={isoY + 4} width={40 * (amount / 100)} height={5} fill="#94a3b8" />
            </g>; })}

          {/* Trees */}
          {trees.map(({ x, y, amount }, idx) => { if (!amount) return null;
            const { isoX, isoY } = tileToSvg(x, y);
            return <g key={`tree-${idx}`} style={{ cursor: 'pointer', opacity: amount < 20 ? 0.5 : 1 }} onContextMenu={e => { e.preventDefault(); if (buildMode) return; commandMove(x, y, { type: 'tree', idx }); }}>
              <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 10} rx={18} ry={28} fill="#166534" stroke="#052e16" strokeWidth={3} />
              <rect x={isoX + TILE_SIZE / 2 - 6} y={isoY + 28} width={12} height={18} fill="#78350f" />
              <rect x={isoX + TILE_SIZE / 2 - 18} y={isoY - 16} width={36} height={5} fill="#052e16" />
              <rect x={isoX + TILE_SIZE / 2 - 18} y={isoY - 16} width={36 * (amount / 50)} height={5} fill="#bbf7d0" />
            </g>; })}

          {/* Gold mines */}
          {goldMines.map((mine, mineIdx) => { if (!mine.amount) return null; const { x, y, amount } = mine; const { isoX, isoY } = tileToSvg(x, y);
            return <g key={`gold-mine-${mineIdx}`} style={{ cursor: 'pointer' }} onContextMenu={e => { e.preventDefault(); if (buildMode) return; commandMove(x, y, { type: 'gold', idx: mineIdx }); }}>
              <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 24} rx={28} ry={20} fill="#fde68a" stroke="#b45309" strokeWidth={4} />
              <text x={isoX + TILE_SIZE / 2} y={isoY + 32} textAnchor="middle" fontSize="16">⛏️</text>
              <rect x={isoX + TILE_SIZE / 2 - 28} y={isoY + 8} width={56} height={5} fill="#a16207" />
              <rect x={isoX + TILE_SIZE / 2 - 28} y={isoY + 8} width={56 * (amount / 250)} height={5} fill="#fde68a" />
            </g>; })}

          {/* Placed buildings */}
          {placedBuildings.map(b => { const { isoX, isoY } = tileToSvg(b.x, b.y);
            if (b.type === 'wall') {
              const wallIsDamaged = b.hp < b.maxHp;
              const canUpgradeThisWall = !b.upgraded && resources.gold >= 50 && resources.stone >= 20;
              const wallCtxMenu = wallIsDamaged && anySelected
                ? (e: React.MouseEvent) => handleRepairBuilding(b.id, b.x, b.y, e)
                : canUpgradeThisWall
                ? (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); handleFarmhouseAction(`upgradeWall:${b.id}`); }
                : undefined;
              return <g key={`building-${b.id}`} style={{ cursor: wallCtxMenu ? 'pointer' : 'default' }} onContextMenu={wallCtxMenu}>
                {b.upgraded ? <>
                  {/* Stone wall look */}
                  <rect x={isoX + TILE_SIZE / 6} y={isoY + TILE_SIZE * 0.1} width={TILE_SIZE * 1.7} height={TILE_SIZE * 0.6} fill="#64748b" stroke={wallIsDamaged ? '#f97316' : '#1e293b'} strokeWidth={wallIsDamaged ? 3 : 2} rx={2} />
                  <line x1={isoX + TILE_SIZE / 6} y1={isoY + TILE_SIZE * 0.37} x2={isoX + TILE_SIZE * 1.83} y2={isoY + TILE_SIZE * 0.37} stroke="#374151" strokeWidth={1} />
                  <line x1={isoX + TILE_SIZE * 0.7} y1={isoY + TILE_SIZE * 0.1} x2={isoX + TILE_SIZE * 0.7} y2={isoY + TILE_SIZE * 0.37} stroke="#374151" strokeWidth={1} />
                  <line x1={isoX + TILE_SIZE * 1.3} y1={isoY + TILE_SIZE * 0.37} x2={isoX + TILE_SIZE * 1.3} y2={isoY + TILE_SIZE * 0.7} stroke="#374151" strokeWidth={1} />
                  {canUpgradeThisWall && <text x={isoX + TILE_SIZE} y={isoY - 5} textAnchor="middle" fontSize="7" fill="#94a3b8">🪨 Upgrade 50🪙20🪨</text>}
                  <text x={isoX + TILE_SIZE} y={isoY + TILE_SIZE * 0.85} textAnchor="middle" fontSize="7" fill="#94a3b8">STONE</text>
                </> : <>
                  {[0.15, 0.5, 0.85].map(f => (
                    <rect key={f} x={isoX + TILE_SIZE * 2 * f - 5} y={isoY + TILE_SIZE * 0.05} width={10} height={TILE_SIZE * 0.55} fill="#78350f" stroke="#451a03" strokeWidth={2} rx={2} />
                  ))}
                  <rect x={isoX + TILE_SIZE / 6} y={isoY + TILE_SIZE * 0.18} width={TILE_SIZE * 1.7} height={10} fill="#a16207" stroke={wallIsDamaged ? '#f97316' : '#451a03'} strokeWidth={wallIsDamaged ? 3 : 2} rx={3} />
                  <rect x={isoX + TILE_SIZE / 6} y={isoY + TILE_SIZE * 0.33} width={TILE_SIZE * 1.7} height={10} fill="#92400e" stroke="#451a03" strokeWidth={2} rx={3} />
                  {canUpgradeThisWall && <text x={isoX + TILE_SIZE} y={isoY - 5} textAnchor="middle" fontSize="7" fill="#a16207">🪨 Upgrade 50🪙20🪨</text>}
                </>}
              </g>;
            }
            if (b.type === 'windmill') {
              return <g key={`building-${b.id}`} pointerEvents="none">
                <rect x={isoX + TILE_SIZE * 0.3} y={isoY} width={TILE_SIZE * 1.4} height={TILE_SIZE * 0.75} fill="#fef9c3" stroke="#b45309" strokeWidth={3} rx={8} />
                <line x1={isoX + TILE_SIZE} y1={isoY - 6} x2={isoX + TILE_SIZE} y2={isoY - 30} stroke="#6b7280" strokeWidth={4} />
                <line x1={isoX + TILE_SIZE - 14} y1={isoY - 18} x2={isoX + TILE_SIZE + 14} y2={isoY - 18} stroke="#6b7280" strokeWidth={4} />
                <circle cx={isoX + TILE_SIZE} cy={isoY - 18} r={5} fill="#374151" />
                <text x={isoX + TILE_SIZE} y={isoY + TILE_SIZE * 0.52} textAnchor="middle" fontSize="20">💨</text>
                <text x={isoX + TILE_SIZE} y={isoY - 34} textAnchor="middle" fontSize="9" fill="#fde68a" fontWeight="bold">+2🪙/5s</text>
              </g>;
            }
            if (b.type === 'market') {
              return <g key={`building-${b.id}`} pointerEvents="none">
                <rect x={isoX + TILE_SIZE * 0.1} y={isoY - 2} width={TILE_SIZE * 1.8} height={TILE_SIZE * 0.82} fill="#fef3c7" stroke="#d97706" strokeWidth={3} rx={5} />
                {/* Awning */}
                <rect x={isoX + TILE_SIZE * 0.1} y={isoY - 2} width={TILE_SIZE * 1.8} height={12} fill="#d97706" stroke="none" rx={3} />
                <text x={isoX + TILE_SIZE} y={isoY + TILE_SIZE * 0.5} textAnchor="middle" fontSize="20">🏪</text>
                <text x={isoX + TILE_SIZE} y={isoY - 6} textAnchor="middle" fontSize="9" fill="#78350f" fontWeight="bold">MARKET</text>
              </g>;
            }
            if (b.type === 'siegeWorkshop') {
              return <g key={`building-${b.id}`} pointerEvents="none">
                <rect x={isoX + TILE_SIZE * 0.15} y={isoY} width={TILE_SIZE * 1.7} height={TILE_SIZE * 0.8} fill="#292524" stroke="#ea580c" strokeWidth={3} rx={5} />
                <rect x={isoX + TILE_SIZE * 0.15} y={isoY} width={TILE_SIZE * 1.7} height={9} fill="#1c1917" stroke="none" />
                {/* Gear decoration */}
                <circle cx={isoX + TILE_SIZE * 0.55} cy={isoY + TILE_SIZE * 0.42} r={12} fill="none" stroke="#ea580c" strokeWidth={3} />
                <circle cx={isoX + TILE_SIZE * 0.55} cy={isoY + TILE_SIZE * 0.42} r={5} fill="#ea580c" />
                <text x={isoX + TILE_SIZE} y={isoY + TILE_SIZE * 0.52} textAnchor="middle" fontSize="22">⚙️</text>
                <text x={isoX + TILE_SIZE} y={isoY - 4} textAnchor="middle" fontSize="9" fill="#fed7aa" fontWeight="bold">SIEGE WORKSHOP</text>
              </g>;
            }
            if (b.type === 'barracks') {
              return <g key={`building-${b.id}`} pointerEvents="none">
                <rect x={isoX + TILE_SIZE * 0.2} y={isoY - 4} width={TILE_SIZE * 1.6} height={TILE_SIZE * 0.85} fill="#1c1917" stroke="#dc2626" strokeWidth={3} rx={6} />
                <rect x={isoX + TILE_SIZE * 0.2} y={isoY - 4} width={TILE_SIZE * 1.6} height={8} fill="#292524" stroke="none" />
                <text x={isoX + TILE_SIZE} y={isoY + TILE_SIZE * 0.5} textAnchor="middle" fontSize="22">⚔️</text>
                <text x={isoX + TILE_SIZE} y={isoY - 8} textAnchor="middle" fontSize="9" fill="#fca5a5" fontWeight="bold">BARRACKS</text>
              </g>;
            }
            if (b.type === 'stable') {
              return <g key={`building-${b.id}`} pointerEvents="none">
                {/* Stable body - brown barn with dark roof */}
                <rect x={isoX + TILE_SIZE * 0.1} y={isoY} width={TILE_SIZE * 1.8} height={TILE_SIZE * 0.8} fill="#92400e" stroke="#78350f" strokeWidth={3} rx={4} />
                {/* Roof ridge */}
                <rect x={isoX + TILE_SIZE * 0.1} y={isoY} width={TILE_SIZE * 1.8} height={10} fill="#451a03" stroke="none" rx={3} />
                {/* Door */}
                <rect x={isoX + TILE_SIZE * 0.8} y={isoY + TILE_SIZE * 0.35} width={18} height={28} fill="#1c1917" stroke="#78350f" strokeWidth={1.5} rx={2} />
                <text x={isoX + TILE_SIZE} y={isoY + TILE_SIZE * 0.52} textAnchor="middle" fontSize="20">🐴</text>
                <text x={isoX + TILE_SIZE} y={isoY - 4} textAnchor="middle" fontSize="9" fill="#fde68a" fontWeight="bold">STABLE</text>
              </g>;
            }
            if (b.type === 'granary') {
              return <g key={`building-${b.id}`} pointerEvents="none">
                {/* Round silo body */}
                <ellipse cx={isoX + TILE_SIZE * 0.55} cy={isoY + TILE_SIZE * 0.42} rx={22} ry={28} fill="#fef9c3" stroke="#b45309" strokeWidth={3} />
                <ellipse cx={isoX + TILE_SIZE * 0.55} cy={isoY + TILE_SIZE * 0.12} rx={22} ry={8} fill="#fde68a" stroke="#b45309" strokeWidth={2} />
                {/* Roof cap */}
                <ellipse cx={isoX + TILE_SIZE * 0.55} cy={isoY + TILE_SIZE * 0.12 - 7} rx={22} ry={7} fill="#b45309" />
                {/* Second silo */}
                <ellipse cx={isoX + TILE_SIZE * 1.1} cy={isoY + TILE_SIZE * 0.48} rx={16} ry={22} fill="#fef3c7" stroke="#b45309" strokeWidth={2} />
                <ellipse cx={isoX + TILE_SIZE * 1.1} cy={isoY + TILE_SIZE * 0.26} rx={16} ry={6} fill="#fbbf24" stroke="#b45309" strokeWidth={1.5} />
                <text x={isoX + TILE_SIZE} y={isoY - 6} textAnchor="middle" fontSize="9" fill="#78350f" fontWeight="bold">GRANARY</text>
                <text x={isoX + TILE_SIZE} y={isoY + 4} textAnchor="middle" fontSize="8" fill="#92400e">+8 pop</text>
              </g>;
            }
            if (b.type === 'blacksmith') {
              return <g key={`building-${b.id}`} pointerEvents="none">
                {/* Stone base */}
                <rect x={isoX + TILE_SIZE * 0.15} y={isoY + 4} width={TILE_SIZE * 1.7} height={TILE_SIZE * 0.76} fill="#374151" stroke="#dc2626" strokeWidth={3} rx={4} />
                {/* Chimney */}
                <rect x={isoX + TILE_SIZE * 0.35} y={isoY - 18} width={14} height={24} fill="#1f2937" stroke="#4b5563" strokeWidth={2} rx={2} />
                {/* Smoke puff */}
                <circle cx={isoX + TILE_SIZE * 0.35 + 7} cy={isoY - 22} r={5} fill="#6b7280" opacity={0.7} />
                <circle cx={isoX + TILE_SIZE * 0.35 + 2} cy={isoY - 28} r={4} fill="#4b5563" opacity={0.5} />
                <text x={isoX + TILE_SIZE} y={isoY + TILE_SIZE * 0.52} textAnchor="middle" fontSize="22">🔨</text>
                <text x={isoX + TILE_SIZE} y={isoY + 2} textAnchor="middle" fontSize="9" fill="#fca5a5" fontWeight="bold">BLACKSMITH</text>
              </g>;
            }
            if (b.type === 'spikeTrap') {
              const lastTrigger = trapTriggeredRef.current[b.id] ?? 0;
              const isArmed = lastTrigger === 0 || Date.now() - lastTrigger >= 30000;
              const cx2 = isoX + TILE_SIZE / 2; const cy2 = isoY + TILE_SIZE * 0.5;
              return <g key={`building-${b.id}`} pointerEvents="none">
                {/* Base stone plate */}
                <ellipse cx={cx2} cy={cy2 + 4} rx={28} ry={12} fill={isArmed ? '#78350f' : '#44403c'} stroke={isArmed ? '#451a03' : '#292524'} strokeWidth={2} />
                {isArmed ? (<>
                  {/* Spike tips */}
                  {[-14,-7,0,7,14].map((dx, i) => (
                    <polygon key={i} points={`${cx2+dx},${cy2-16} ${cx2+dx-5},${cy2+4} ${cx2+dx+5},${cy2+4}`} fill="#fbbf24" stroke="#b45309" strokeWidth={1.5} />
                  ))}
                  <text x={cx2} y={cy2 - 20} textAnchor="middle" fontSize="8" fill="#fde68a" fontWeight="bold">ARMED</text>
                </>) : (<>
                  {/* Flat exhausted look */}
                  {[-14,-7,0,7,14].map((dx, i) => (
                    <polygon key={i} points={`${cx2+dx},${cy2-4} ${cx2+dx-5},${cy2+4} ${cx2+dx+5},${cy2+4}`} fill="#6b7280" stroke="#4b5563" strokeWidth={1} />
                  ))}
                  <text x={cx2} y={cy2 - 8} textAnchor="middle" fontSize="8" fill="#9ca3af">REARM</text>
                </>)}
              </g>;
            }
            if (b.type === 'ballista') {
              const cx2 = isoX + TILE_SIZE / 2; const cy2 = isoY + TILE_SIZE * 0.4;
              return <g key={`building-${b.id}`} pointerEvents="none">
                {/* Stone platform */}
                <rect x={isoX + TILE_SIZE * 0.2} y={cy2 + 2} width={TILE_SIZE * 1.6} height={14} fill="#475569" stroke="#1e293b" strokeWidth={2} rx={3} />
                {/* Ballista frame */}
                <rect x={cx2 - 18} y={cy2 - 10} width={36} height={14} fill="#44231a" stroke="#6b3d2e" strokeWidth={2} rx={2} />
                {/* Bow arms */}
                <path d={`M${cx2 - 18},${cy2 - 4} Q${cx2 - 32},${cy2 - 22} ${cx2 - 18},${cy2 - 10}`} fill="none" stroke="#92400e" strokeWidth={3} strokeLinecap="round" />
                <path d={`M${cx2 + 18},${cy2 - 4} Q${cx2 + 32},${cy2 - 22} ${cx2 + 18},${cy2 - 10}`} fill="none" stroke="#92400e" strokeWidth={3} strokeLinecap="round" />
                {/* Bolt */}
                <line x1={cx2 - 16} y1={cy2 - 3} x2={cx2 + 24} y2={cy2 - 3} stroke="#6b7280" strokeWidth={2.5} strokeLinecap="round" />
                <polygon points={`${cx2 + 24},${cy2 - 6} ${cx2 + 32},${cy2 - 3} ${cx2 + 24},${cy2}`} fill="#9ca3af" />
                <text x={cx2} y={isoY - 4} textAnchor="middle" fontSize="9" fill="#fbbf24" fontWeight="bold">BALLISTA</text>
                <text x={cx2} y={isoY + 4} textAnchor="middle" fontSize="7" fill="#94a3b8">{BALLISTA_RANGE}🎯 pierce</text>
              </g>;
            }
            const colors: Record<string, { fill: string; stroke: string }> = { farmhouse: { fill: '#fef3c7', stroke: '#92400e' }, lumberShed: { fill: '#a16207', stroke: '#78350f' }, watchtower: { fill: '#64748b', stroke: '#1e293b' } };
            const c = colors[b.type] ?? { fill: '#374151', stroke: '#1f2937' };
            const isDamaged = b.hp < b.maxHp;
            const isTower = b.type === 'watchtower';
            const tgCount = isTower ? (towerGarrison[b.id] ?? []).length : 0;
            const canGarrisonTower = isTower && anySelected && tgCount < 3;
            const onCtxMenu = isDamaged && anySelected ? (e: React.MouseEvent) => handleRepairBuilding(b.id, b.x, b.y, e)
              : canGarrisonTower ? (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); handleTowerGarrison(b.id, b.x, b.y); }
              : undefined;
            return <g key={`building-${b.id}`} style={{ cursor: ((isDamaged || canGarrisonTower) && anySelected) ? 'pointer' : 'default' }}
              onContextMenu={onCtxMenu}>
              <rect x={isoX + TILE_SIZE / 4} y={isoY} width={TILE_SIZE * 1.5} height={TILE_SIZE * 0.8} fill={c.fill} stroke={isDamaged ? '#f97316' : tgCount > 0 ? '#22d3ee' : c.stroke} strokeWidth={isDamaged ? 4 : 3} rx={8} />
              <text x={isoX + TILE_SIZE} y={isoY + TILE_SIZE / 2} textAnchor="middle" fontSize="22">{BUILDING_EMOJI[b.type]}</text>
              {isDamaged && <text x={isoX + TILE_SIZE} y={isoY - 18} textAnchor="middle" fontSize="9" fill="#f97316" fontWeight="bold">🔧 REPAIR</text>}
              {isTower && tgCount > 0 && <text x={isoX + TILE_SIZE} y={isoY - 18} textAnchor="middle" fontSize="9" fill="#22d3ee" fontWeight="bold">👥×{tgCount}</text>}
            </g>; })}

          {/* Building HP bars — only shown when damaged */}
          {placedBuildings.filter(b => b.hp < b.maxHp && b.hp > 0).map(b => {
            const { isoX, isoY } = tileToSvg(b.x, b.y);
            const pct = b.hp / b.maxHp;
            return <g key={`bhp-${b.id}`} pointerEvents="none">
              <rect x={isoX + TILE_SIZE * 0.1} y={isoY - 14} width={TILE_SIZE * 1.8} height={6} fill="#1e293b" rx={3} />
              <rect x={isoX + TILE_SIZE * 0.1} y={isoY - 14} width={TILE_SIZE * 1.8 * pct} height={6} fill={pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#fbbf24' : '#ef4444'} rx={3} />
            </g>;
          })}

          {/* Fire effects on critically damaged buildings (<25% HP) */}
          {placedBuildings.filter(b => b.hp > 0 && b.hp / b.maxHp < 0.25).map(b => {
            const { isoX, isoY } = tileToSvg(b.x, b.y);
            const cx = isoX + TILE_SIZE;
            const cy = isoY + TILE_SIZE * 0.3;
            const t = (Date.now() / 600) % (2 * Math.PI);
            return <g key={`fire-${b.id}`} pointerEvents="none">
              {/* Smoke puffs */}
              <circle cx={cx - 6} cy={cy - 18 - Math.sin(t) * 4} r={6} fill="#374151" opacity={0.55} />
              <circle cx={cx + 4} cy={cy - 28 - Math.sin(t + 1) * 5} r={5} fill="#4b5563" opacity={0.4} />
              <circle cx={cx - 2} cy={cy - 38 - Math.sin(t + 2) * 3} r={4} fill="#1f2937" opacity={0.25} />
              {/* Flame base */}
              <ellipse cx={cx} cy={cy - 4} rx={9} ry={6} fill="#f97316" opacity={0.85} />
              <ellipse cx={cx - 5} cy={cy - 2} rx={5} ry={4} fill="#dc2626" opacity={0.75} />
              <ellipse cx={cx + 5} cy={cy - 2} rx={5} ry={4} fill="#ef4444" opacity={0.7} />
              {/* Flame tip */}
              <ellipse cx={cx} cy={cy - 14} rx={5} ry={10} fill="#fbbf24" opacity={0.9} />
              <ellipse cx={cx} cy={cy - 18} rx={3} ry={6} fill="#fef08a" opacity={0.8} />
            </g>;
          })}

          {/* Enemy barn */}
          {enemyBarnHp > 0 && (() => { const { isoX, isoY } = tileToSvg(ENEMY_BARN_POS.x, ENEMY_BARN_POS.y); const hpPct = enemyBarnHp / ENEMY_BARN_MAX_HP;
            return <g style={{ cursor: 'crosshair' }} onContextMenu={handleAttackEnemyBarn}>
              <rect x={isoX} y={isoY} width={TILE_SIZE} height={TILE_SIZE} fill="#7f1d1d" stroke="#ef4444" strokeWidth={6} rx={12} />
              <polygon points={[[isoX, isoY], [isoX + TILE_SIZE / 2, isoY - 32], [isoX + TILE_SIZE, isoY]].map(p => p.join(',')).join(' ')} fill="#991b1b" stroke="#dc2626" strokeWidth={4} />
              <text x={isoX + TILE_SIZE / 2} y={isoY + 44} textAnchor="middle" fontSize="22">🏴‍☠️</text>
              <rect x={isoX - 8} y={isoY - 14} width={TILE_SIZE + 16} height={8} fill="#1e293b" rx={4} />
              <rect x={isoX - 8} y={isoY - 14} width={(TILE_SIZE + 16) * hpPct} height={8} fill={hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#fbbf24' : '#ef4444'} rx={4} />
              <text x={isoX + TILE_SIZE / 2} y={isoY - 18} textAnchor="middle" fontSize="11" fill="#fca5a5" fontWeight="bold">ENEMY</text>
            </g>; })()}

          {/* Archer Tower (enemy defensive structure) */}
          {enemyBarnHp > 0 && (() => {
            const { isoX, isoY } = tileToSvg(ARCHER_TOWER_POS.x, ARCHER_TOWER_POS.y);
            return (
              <g pointerEvents="none">
                <rect x={isoX + TILE_SIZE / 4} y={isoY - 8} width={TILE_SIZE * 1.5} height={TILE_SIZE * 0.85} fill="#3b0764" stroke="#a21caf" strokeWidth={3} rx={5} />
                <rect x={isoX + TILE_SIZE / 2 - 5} y={isoY - 34} width={10} height={30} fill="#581c87" stroke="#a855f7" strokeWidth={2} />
                <rect x={isoX + TILE_SIZE / 2 - 14} y={isoY - 42} width={10} height={14} fill="#7c3aed" stroke="#a855f7" strokeWidth={2} />
                <rect x={isoX + TILE_SIZE / 2 + 4} y={isoY - 42} width={10} height={14} fill="#7c3aed" stroke="#a855f7" strokeWidth={2} />
                <text x={isoX + TILE_SIZE} y={isoY + 36} textAnchor="middle" fontSize="20">🏹</text>
                <text x={isoX + TILE_SIZE} y={isoY - 46} textAnchor="middle" fontSize="10" fill="#e879f9" fontWeight="bold">ARCHER</text>
              </g>
            );
          })()}

          {/* Enemy fortress towers (wave 5/10/15) */}
          {enemyTowers.filter(t => t.hp > 0 && fogVisible[t.x]?.[t.y]).map(t => {
            const { isoX, isoY } = tileToSvg(t.x, t.y);
            const hpPct = t.hp / t.maxHp;
            return (
              <g key={`etower-${t.id}`} style={{ cursor: 'crosshair' }} onContextMenu={e => handleAttackEnemyTower(t.id, t.x, t.y, e)}>
                <rect x={isoX + TILE_SIZE / 4} y={isoY} width={TILE_SIZE / 2} height={TILE_SIZE * 0.8} fill="#7f1d1d" stroke="#dc2626" strokeWidth={3} rx={4} />
                <rect x={isoX + TILE_SIZE / 4 - 6} y={isoY - 8} width={TILE_SIZE / 2 + 12} height={16} fill="#991b1b" stroke="#ef4444" strokeWidth={2} rx={3} />
                <rect x={isoX + TILE_SIZE / 4 + 2} y={isoY - 20} width={8} height={14} fill="#b91c1c" stroke="#ef4444" strokeWidth={1.5} />
                <rect x={isoX + TILE_SIZE / 2 + 2} y={isoY - 20} width={8} height={14} fill="#b91c1c" stroke="#ef4444" strokeWidth={1.5} />
                <text x={isoX + TILE_SIZE / 2} y={isoY + 38} textAnchor="middle" fontSize="16">🏹</text>
                <text x={isoX + TILE_SIZE / 2} y={isoY - 26} textAnchor="middle" fontSize="8" fill="#fca5a5" fontWeight="bold">TOWER</text>
                <rect x={isoX + TILE_SIZE / 4} y={isoY - 38} width={TILE_SIZE / 2} height={5} fill="#1e293b" rx={2} />
                <rect x={isoX + TILE_SIZE / 4} y={isoY - 38} width={(TILE_SIZE / 2) * hpPct} height={5} fill="#ef4444" rx={2} />
              </g>
            );
          })}

          {/* Rally point flag */}
          {rallyPoint && fogVisible[rallyPoint.x]?.[rallyPoint.y] && (() => {
            const { isoX, isoY } = tileToSvg(rallyPoint.x, rallyPoint.y);
            return <g pointerEvents="none">
              <line x1={isoX + TILE_SIZE / 2} y1={isoY + TILE_SIZE / 2} x2={isoX + TILE_SIZE / 2} y2={isoY - 20} stroke="#38bdf8" strokeWidth={2} />
              <polygon points={`${isoX + TILE_SIZE / 2},${isoY - 20} ${isoX + TILE_SIZE / 2 + 14},${isoY - 12} ${isoX + TILE_SIZE / 2},${isoY - 4}`} fill="#38bdf8" />
            </g>;
          })()}

          {/* Player barn */}
          {(() => { const { isoX, isoY } = tileToSvg(BARN_POS.x, BARN_POS.y); const hpPct = playerBarnHp / PLAYER_BARN_MAX_HP;
            const hasGarrison = garrisoned.length > 0;
            const barnUnderFire = enemyGrunts.some(g => tileDist(g.x, g.y, BARN_POS.x, BARN_POS.y) <= 4);
            const lastStand = hpPct < 0.25;
            return <g style={{ cursor: 'pointer' }}
              onClick={() => { if (!buildMode) { setSelectedType('farmhouse'); setWorkers(ws => ws.map(w => ({ ...w, selected: false }))); } }}
              onContextMenu={e => {
                e.preventDefault();
                if (anySelected && selectedType === 'worker') { handleGarrison(); return; }
                if (selectedType === 'farmhouse') { const coords = clientToSvg(e.clientX, e.clientY); if (coords) { const { tx, ty } = svgToTile(coords.x, coords.y); setRallyPoint({ x: tx, y: ty }); } }
              }}>
              {lastStand && <circle cx={isoX + TILE_SIZE / 2} cy={isoY + TILE_SIZE / 2} r={TILE_SIZE * 0.9} fill="none" stroke="#ef4444" strokeWidth={3} strokeDasharray="6 3" opacity={0.7} />}
              {barnUnderFire && <circle cx={isoX + TILE_SIZE / 2} cy={isoY + TILE_SIZE / 2} r={TILE_SIZE * 0.7} fill="none" stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 3" opacity={0.5} />}
              <rect x={isoX} y={isoY} width={TILE_SIZE} height={TILE_SIZE} fill="#fde68a" stroke={lastStand ? '#ef4444' : hasGarrison ? '#22d3ee' : '#b45309'} strokeWidth={lastStand ? 7 : hasGarrison ? 5 : 6} rx={12} />
              <polygon points={[[isoX, isoY], [isoX + TILE_SIZE / 2, isoY - 32], [isoX + TILE_SIZE, isoY]].map(p => p.join(',')).join(' ')} fill="#b91c1c" stroke="#7f1d1d" strokeWidth={4} />
              <text x={isoX + TILE_SIZE / 2} y={isoY + 44} textAnchor="middle" fontSize="22">🏚️</text>
              {lastStand && <text x={isoX + TILE_SIZE / 2} y={isoY - 20} textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="bold">⚔ LAST STAND!</text>}
              <rect x={isoX - 8} y={isoY - 14} width={TILE_SIZE + 16} height={8} fill="#1e293b" rx={4} />
              <rect x={isoX - 8} y={isoY - 14} width={(TILE_SIZE + 16) * hpPct} height={8} fill={hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#fbbf24' : '#ef4444'} rx={4} />
              {hasGarrison && <>
                <circle cx={isoX + TILE_SIZE - 6} cy={isoY + 10} r={10} fill="#0c4a6e" stroke="#22d3ee" strokeWidth={2} />
                <text x={isoX + TILE_SIZE - 6} y={isoY + 14} textAnchor="middle" fontSize="10" fill="#7dd3fc" fontWeight="bold">{garrisoned.length}</text>
              </>}
            </g>; })()}

          {/* Neutral shrines */}
          {SHRINES.map(shrine => {
            const { isoX, isoY } = tileToSvg(shrine.x, shrine.y);
            const captured = capturedShrines.has(shrine.id);
            const channeling = shrineCapturing?.shrineId === shrine.id;
            const progress = channeling ? Math.min(1, (Date.now() - (shrineCapturing?.startedAt ?? 0)) / shrine.captureMs) : 0;
            const isWar = shrine.type === 'war';
            const color = isWar ? '#f97316' : '#4ade80';
            const glow = captured ? (isWar ? '#7c3aed' : '#065f46') : '#1e293b';
            return <g key={`shrine-${shrine.id}`} pointerEvents="none">
              {/* Base platform */}
              <polygon points={`${isoX + TILE_SIZE},${isoY + 4} ${isoX + TILE_SIZE * 1.7},${isoY + TILE_SIZE * 0.4} ${isoX + TILE_SIZE},${isoY + TILE_SIZE * 0.75} ${isoX + TILE_SIZE * 0.3},${isoY + TILE_SIZE * 0.4}`} fill={captured ? glow : '#334155'} stroke={color} strokeWidth={captured ? 3 : 1.5} opacity={0.9} />
              {/* Pillar */}
              <rect x={isoX + TILE_SIZE - 8} y={isoY + 2} width={16} height={28} fill={captured ? color : '#64748b'} stroke={captured ? '#fef3c7' : '#1e293b'} strokeWidth={1.5} rx={2} />
              {/* Flame / glow */}
              <circle cx={isoX + TILE_SIZE} cy={isoY - 2} r={captured ? 10 : 7} fill={captured ? color : '#94a3b8'} opacity={captured ? 0.9 : 0.5} />
              {/* Icon */}
              <text x={isoX + TILE_SIZE} y={isoY + 3} textAnchor="middle" fontSize="12">{isWar ? '⚔️' : '🌾'}</text>
              {/* Label */}
              <text x={isoX + TILE_SIZE} y={isoY - 14} textAnchor="middle" fontSize="8" fill={captured ? color : '#94a3b8'} fontWeight="bold">{captured ? '✓ ' : ''}{shrine.label}</text>
              {/* Channel progress bar */}
              {channeling && <>
                <rect x={isoX + TILE_SIZE * 0.3} y={isoY + TILE_SIZE * 0.8} width={TILE_SIZE * 1.4} height={6} fill="#0f172a" stroke="#334155" strokeWidth={1} rx={3} />
                <rect x={isoX + TILE_SIZE * 0.3} y={isoY + TILE_SIZE * 0.8} width={TILE_SIZE * 1.4 * progress} height={6} fill={color} rx={3} />
              </>}
            </g>;
          })}

          {/* Neutral creep camps */}
          {CREEP_CAMPS.filter(camp => !clearedCamps.has(camp.id)).map(camp => {
            const { isoX, isoY } = tileToSvg(camp.x, camp.y);
            return <g key={`camp-${camp.id}`} pointerEvents="none">
              <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 28} rx={28} ry={12} fill="rgba(88,28,135,0.3)" />
              <text x={isoX + TILE_SIZE / 2} y={isoY - 4} textAnchor="middle" fontSize="9" fill="#c084fc" fontWeight="bold">⚠ CAMP +{camp.goldReward}🪙</text>
            </g>;
          })}
          {/* Neutral creeps */}
          {neutralCreeps.map(c => { const { isoX, isoY } = tileToSvg(c.x, c.y); const hp = c.hp / c.maxHp;
            return <g key={`creep-${c.id}`} style={{ cursor: anySelected ? 'crosshair' : 'default' }} onContextMenu={e => handleAttackCreep(c.id, e)}>
              <circle cx={isoX + TILE_SIZE / 2} cy={isoY + 18} r={15} fill={c.state === 'chasing' ? '#7c3aed' : '#581c87'} stroke="#3b0764" strokeWidth={3} />
              <text x={isoX + TILE_SIZE / 2} y={isoY + 26} textAnchor="middle" fontSize="13">🐗</text>
              <rect x={isoX + TILE_SIZE / 2 - 13} y={isoY - 3} width={26} height={4} fill="#1e293b" />
              <rect x={isoX + TILE_SIZE / 2 - 13} y={isoY - 3} width={26 * hp} height={4} fill="#a855f7" />
            </g>; })}

          {/* Enemy grunts */}
          {enemyGrunts.map(g => { if (!fogVisible[Math.round(g.x)]?.[Math.round(g.y)]) return null; const { isoX, isoY } = tileToSvg(g.x, g.y); const hp = g.hp / g.maxHp;
            return <g key={`grunt-${g.id}`} style={{ cursor: anySelected ? 'crosshair' : 'default' }} onContextMenu={e => handleAttackGrunt(g.id, e)}>
              {g.isBoss ? (<>
                {/* Boss War Bull — larger, darker, horns */}
                <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 22} rx={26} ry={18} fill={g.state === 'attacking' ? '#7f1d1d' : '#991b1b'} stroke="#450a0a" strokeWidth={4} />
                {/* Horns */}
                <path d={`M${isoX + TILE_SIZE / 2 - 18},${isoY + 8} Q${isoX + TILE_SIZE / 2 - 28},${isoY - 10} ${isoX + TILE_SIZE / 2 - 14},${isoY + 2}`} fill="none" stroke="#1c1917" strokeWidth={5} strokeLinecap="round" />
                <path d={`M${isoX + TILE_SIZE / 2 + 18},${isoY + 8} Q${isoX + TILE_SIZE / 2 + 28},${isoY - 10} ${isoX + TILE_SIZE / 2 + 14},${isoY + 2}`} fill="none" stroke="#1c1917" strokeWidth={5} strokeLinecap="round" />
                {/* Eyes */}
                <circle cx={isoX + TILE_SIZE / 2 - 8} cy={isoY + 16} r={4} fill="#dc2626" />
                <circle cx={isoX + TILE_SIZE / 2 + 8} cy={isoY + 16} r={4} fill="#dc2626" />
                <text x={isoX + TILE_SIZE / 2} y={isoY + 32} textAnchor="middle" fontSize="16">🐂</text>
                <text x={isoX + TILE_SIZE / 2} y={isoY - 10} textAnchor="middle" fontSize="9" fill="#fca5a5" fontWeight="bold">WAR BULL</text>
                <rect x={isoX + TILE_SIZE / 2 - 20} y={isoY - 5} width={40} height={5} fill="#1e293b" rx={2} />
                <rect x={isoX + TILE_SIZE / 2 - 20} y={isoY - 5} width={40 * hp} height={5} fill="#dc2626" rx={2} />
              </>) : g.isSkeleton ? (<>
                {/* Skeleton grunt — purple-tinted risen dead */}
                <circle cx={isoX + TILE_SIZE / 2} cy={isoY + 18} r={14} fill={g.state === 'attacking' ? '#4c1d95' : '#6d28d9'} stroke="#2e1065" strokeWidth={2} />
                <text x={isoX + TILE_SIZE / 2} y={isoY + 26} textAnchor="middle" fontSize="14">💀</text>
                <text x={isoX + TILE_SIZE / 2} y={isoY - 5} textAnchor="middle" fontSize="7" fill="#c4b5fd" fontWeight="bold">SKELETON</text>
                <rect x={isoX + TILE_SIZE / 2 - 12} y={isoY - 10} width={24} height={4} fill="#1e293b" />
                <rect x={isoX + TILE_SIZE / 2 - 12} y={isoY - 10} width={24 * hp} height={4} fill="#a855f7" />
              </>) : (<>
                {(g.enragedUntil ?? 0) > Date.now() && <circle cx={isoX + TILE_SIZE / 2} cy={isoY + 18} r={20} fill="none" stroke="#dc2626" strokeWidth={3} opacity={0.7} />}
                <circle cx={isoX + TILE_SIZE / 2} cy={isoY + 18} r={16} fill={(g.enragedUntil ?? 0) > Date.now() ? '#dc2626' : g.state === 'attacking' ? '#dc2626' : '#f97316'} stroke="#7f1d1d" strokeWidth={3} />
                <text x={isoX + TILE_SIZE / 2} y={isoY + 26} textAnchor="middle" fontSize="14">👹</text>
                {(g.enragedUntil ?? 0) > Date.now() && <text x={isoX + TILE_SIZE / 2} y={isoY - 5} textAnchor="middle" fontSize="7" fill="#fca5a5" fontWeight="bold">BERSERK!</text>}
                <rect x={isoX + TILE_SIZE / 2 - 14} y={isoY - 4} width={28} height={4} fill="#1e293b" />
                <rect x={isoX + TILE_SIZE / 2 - 14} y={isoY - 4} width={28 * hp} height={4} fill="#ef4444" />
              </>)}
            </g>; })}

          {/* Loot Crates */}
          {lootCrates.map(crate => {
            const { isoX, isoY } = tileToSvg(crate.x, crate.y);
            const label = [crate.gold > 0 && `${crate.gold}🪙`, crate.lumber > 0 && `${crate.lumber}🌲`, crate.stone > 0 && `${crate.stone}🪨`].filter(Boolean).join(' ');
            return <g key={`crate-${crate.id}`} style={{ cursor: anySelected ? 'pointer' : 'default' }} onContextMenu={e => { e.preventDefault(); commandMove(crate.x, crate.y); }}>
              {/* Crate body */}
              <rect x={isoX + TILE_SIZE / 2 - 12} y={isoY + 8} width={24} height={18} fill="#92400e" stroke="#fbbf24" strokeWidth={2} rx={2} />
              {/* Cross lines */}
              <line x1={isoX + TILE_SIZE / 2 - 12} y1={isoY + 17} x2={isoX + TILE_SIZE / 2 + 12} y2={isoY + 17} stroke="#fbbf24" strokeWidth={1} />
              <line x1={isoX + TILE_SIZE / 2} y1={isoY + 8} x2={isoX + TILE_SIZE / 2} y2={isoY + 26} stroke="#fbbf24" strokeWidth={1} />
              {/* Glow pulse */}
              <rect x={isoX + TILE_SIZE / 2 - 14} y={isoY + 6} width={28} height={22} fill="none" stroke="#fbbf24" strokeWidth={1.5} rx={3} opacity={0.5} />
              {/* Label */}
              <text x={isoX + TILE_SIZE / 2} y={isoY + 4} textAnchor="middle" fontSize="9" fill="#fde68a" fontWeight="bold">{label}</text>
            </g>;
          })}

          {/* War Rams & Demolishers (enemy siege units) */}
          {enemySiege.filter(r => r.hp > 0 && fogVisible[Math.round(r.x)]?.[Math.round(r.y)]).map(r => {
            const { isoX, isoY } = tileToSvg(r.x, r.y);
            const hp = r.hp / r.maxHp;
            const cx = isoX + TILE_SIZE / 2;
            const cy = isoY + 18;
            if (r.siegeType === 'demolisher') {
              return <g key={`ram-${r.id}`} style={{ cursor: anySelected ? 'crosshair' : 'default' }} onContextMenu={e => handleAttackSiege(r.id, e)}>
                {/* Orange fire range ring when attacking */}
                {r.state === 'attacking' && <circle cx={cx} cy={cy} r={DEMOLISHER_FIRE_RANGE * TILE_SIZE * 0.5} fill="none" stroke="#f97316" strokeWidth={1} strokeDasharray="6 4" opacity={0.4} />}
                {/* Catapult body */}
                <rect x={cx - 20} y={cy - 12} width={40} height={20} fill="#7f1d1d" stroke="#450a0a" strokeWidth={2} rx={3} />
                {/* Arm */}
                <line x1={cx - 4} y1={cy - 12} x2={cx + 12} y2={cy - 28} stroke="#451a03" strokeWidth={4} strokeLinecap="round" />
                {/* Boulder */}
                <circle cx={cx + 12} cy={cy - 30} r={5} fill="#374151" stroke="#6b7280" strokeWidth={1.5} />
                {/* Wheels */}
                <circle cx={cx - 14} cy={cy + 10} r={6} fill="#292524" stroke="#78716c" strokeWidth={2} />
                <circle cx={cx + 14} cy={cy + 10} r={6} fill="#292524" stroke="#78716c" strokeWidth={2} />
                <text x={cx} y={isoY - 4} textAnchor="middle" fontSize="8" fill="#fb923c" fontWeight="bold">DEMOLISHER</text>
                <rect x={cx - 20} y={isoY - 10} width={40} height={4} fill="#1e293b" rx={2} />
                <rect x={cx - 20} y={isoY - 10} width={40 * hp} height={4} fill="#f97316" rx={2} />
              </g>;
            }
            return <g key={`ram-${r.id}`} style={{ cursor: anySelected ? 'crosshair' : 'default' }} onContextMenu={e => handleAttackSiege(r.id, e)}>
              {/* Ram body — thick wooden log frame */}
              <rect x={cx - 26} y={isoY + 4} width={52} height={22} fill={r.state === 'attacking' ? '#7c2d12' : '#92400e'} stroke="#451a03" strokeWidth={3} rx={4} />
              {/* Battering ram log */}
              <rect x={cx - 20} y={isoY + 10} width={40} height={10} fill="#1c1917" stroke="#44403c" strokeWidth={2} rx={5} />
              {/* Ram head metal tip */}
              <polygon points={`${cx + 20},${isoY + 12} ${cx + 30},${isoY + 15} ${cx + 20},${isoY + 18}`} fill="#6b7280" stroke="#374151" strokeWidth={1.5} />
              {/* Wheels */}
              <circle cx={cx - 16} cy={isoY + 30} r={6} fill="#292524" stroke="#78716c" strokeWidth={2} />
              <circle cx={cx + 16} cy={isoY + 30} r={6} fill="#292524" stroke="#78716c" strokeWidth={2} />
              <text x={cx} y={isoY - 4} textAnchor="middle" fontSize="8" fill="#fca5a5" fontWeight="bold">WAR RAM</text>
              <rect x={cx - 20} y={isoY - 10} width={40} height={4} fill="#1e293b" rx={2} />
              <rect x={cx - 20} y={isoY - 10} width={40 * hp} height={4} fill="#dc2626" rx={2} />
            </g>;
          })}

          {/* Enemy Shamans */}
          {enemyShamans.filter(s => s.hp > 0 && fogVisible[Math.round(s.x)]?.[Math.round(s.y)]).map(s => {
            const { isoX, isoY } = tileToSvg(s.x, s.y);
            const hp = s.hp / s.maxHp;
            return <g key={`shaman-${s.id}`} style={{ cursor: anySelected ? 'crosshair' : 'default' }} onContextMenu={e => handleAttackShaman(s.id, e)}>
              {/* Robe */}
              <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 26} rx={10} ry={14} fill={s.state === 'healing' ? '#4ade80' : '#166534'} stroke="#14532d" strokeWidth={2} />
              {/* Head */}
              <circle cx={isoX + TILE_SIZE / 2} cy={isoY + 10} r={8} fill="#fde68a" stroke="#78350f" strokeWidth={1.5} />
              {/* Staff */}
              <line x1={isoX + TILE_SIZE / 2 + 12} y1={isoY + 6} x2={isoX + TILE_SIZE / 2 + 12} y2={isoY + 38} stroke="#92400e" strokeWidth={3} strokeLinecap="round" />
              <circle cx={isoX + TILE_SIZE / 2 + 12} cy={isoY + 5} r={4} fill={s.state === 'healing' ? '#4ade80' : '#a855f7'} />
              {/* Heal pulse ring */}
              {s.state === 'healing' && <circle cx={isoX + TILE_SIZE / 2} cy={isoY + 20} r={22} fill="none" stroke="#4ade80" strokeWidth={1.5} opacity={0.5} />}
              {/* Label */}
              <text x={isoX + TILE_SIZE / 2} y={isoY - 4} textAnchor="middle" fontSize="8" fill="#86efac" fontWeight="bold">SHAMAN</text>
              {/* HP bar */}
              <rect x={isoX + TILE_SIZE / 2 - 16} y={isoY - 10} width={32} height={4} fill="#1e293b" rx={2} />
              <rect x={isoX + TILE_SIZE / 2 - 16} y={isoY - 10} width={32 * hp} height={4} fill="#22c55e" rx={2} />
            </g>;
          })}

          {/* Necromancers */}
          {enemyNecromancers.filter(n => n.hp > 0 && fogVisible[Math.round(n.x)]?.[Math.round(n.y)]).map(n => {
            const { isoX, isoY } = tileToSvg(n.x, n.y);
            const hp = n.hp / n.maxHp;
            const cx = isoX + TILE_SIZE / 2;
            return <g key={`necro-${n.id}`} style={{ cursor: anySelected ? 'crosshair' : 'default' }} onContextMenu={e => handleAttackNecromancer(n.id, e)}>
              {/* Dark robe */}
              <ellipse cx={cx} cy={isoY + 26} rx={10} ry={14} fill={n.state === 'raising' ? '#7c3aed' : '#1e1b4b'} stroke="#0f0a2a" strokeWidth={2} />
              {/* Skull head */}
              <circle cx={cx} cy={isoY + 10} r={8} fill="#e2e8f0" stroke="#475569" strokeWidth={1.5} />
              <circle cx={cx - 2} cy={isoY + 9} r={1.5} fill="#1e293b" />
              <circle cx={cx + 2} cy={isoY + 9} r={1.5} fill="#1e293b" />
              {/* Staff with orb */}
              <line x1={cx + 12} y1={isoY + 6} x2={cx + 12} y2={isoY + 38} stroke="#4c1d95" strokeWidth={3} strokeLinecap="round" />
              <circle cx={cx + 12} cy={isoY + 4} r={5} fill={n.state === 'raising' ? '#a855f7' : '#4c1d95'} stroke="#7c3aed" strokeWidth={1} />
              {/* Raise pulse when channeling */}
              {n.state === 'raising' && <circle cx={cx} cy={isoY + 20} r={NECROMANCER_RAISE_RADIUS * TILE_SIZE * 0.5} fill="none" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.5} />}
              <text x={cx} y={isoY - 4} textAnchor="middle" fontSize="8" fill="#c4b5fd" fontWeight="bold">NECROMANCER</text>
              <rect x={cx - 18} y={isoY - 10} width={36} height={4} fill="#1e293b" rx={2} />
              <rect x={cx - 18} y={isoY - 10} width={36 * hp} height={4} fill="#a855f7" rx={2} />
            </g>;
          })}

          {/* Witch Doctors */}
          {enemyWitchDoctors.filter(d => d.hp > 0 && fogVisible[Math.round(d.x)]?.[Math.round(d.y)]).map(wd => {
            const { isoX, isoY } = tileToSvg(wd.x, wd.y);
            const hp = wd.hp / wd.maxHp;
            const cx = isoX + TILE_SIZE / 2;
            return <g key={`wd-${wd.id}`} style={{ cursor: anySelected ? 'crosshair' : 'default' }} onContextMenu={e => handleAttackWitchDoctor(wd.id, e)}>
              {/* Dark purple robe */}
              <ellipse cx={cx} cy={isoY + 26} rx={11} ry={14} fill={wd.state === 'casting' ? '#7e22ce' : '#4c1d95'} stroke="#2e1065" strokeWidth={2} />
              {/* Head with mask */}
              <circle cx={cx} cy={isoY + 10} r={7} fill="#fde68a" stroke="#78350f" strokeWidth={1} />
              {/* Bone mask markings */}
              <line x1={cx - 4} y1={isoY + 10} x2={cx + 4} y2={isoY + 10} stroke="#1e293b" strokeWidth={1} />
              {/* Voodoo staff */}
              <line x1={cx + 11} y1={isoY + 5} x2={cx + 11} y2={isoY + 38} stroke="#7c3aed" strokeWidth={3} strokeLinecap="round" />
              {/* Skull on staff */}
              <circle cx={cx + 11} cy={isoY + 3} r={4} fill="#e2e8f0" stroke="#475569" strokeWidth={1} />
              <circle cx={cx + 9} cy={isoY + 2} r={1} fill="#1e293b" />
              <circle cx={cx + 13} cy={isoY + 2} r={1} fill="#1e293b" />
              {/* Casting ring when buffing */}
              {wd.state === 'casting' && <circle cx={cx} cy={isoY + 20} r={WITCH_DOCTOR_BUFF_RADIUS * TILE_SIZE * 0.5} fill="none" stroke="#dc2626" strokeWidth={2} strokeDasharray="6 3" opacity={0.6} />}
              <text x={cx} y={isoY - 4} textAnchor="middle" fontSize="7" fill="#e879f9" fontWeight="bold">WITCH DOCTOR</text>
              <rect x={cx - 18} y={isoY - 10} width={36} height={4} fill="#1e293b" rx={2} />
              <rect x={cx - 18} y={isoY - 10} width={36 * hp} height={4} fill="#e879f9" rx={2} />
            </g>;
          })}

          {/* Goblin Sappers */}
          {enemySappers.filter(s => s.hp > 0 && !s.exploded && fogVisible[Math.round(s.x)]?.[Math.round(s.y)]).map(s => {
            const { isoX, isoY } = tileToSvg(s.x, s.y);
            const hp = s.hp / s.maxHp;
            const urgency = tileDist(s.x, s.y, s.targetX, s.targetY) < 3;
            return <g key={`sapper-${s.id}`} style={{ cursor: anySelected ? 'crosshair' : 'default' }} onContextMenu={e => handleAttackSapper(s.id, e)}>
              {/* Body */}
              <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 22} rx={8} ry={10} fill={urgency ? '#dc2626' : '#b91c1c'} stroke="#7f1d1d" strokeWidth={2} />
              {/* Head */}
              <circle cx={isoX + TILE_SIZE / 2} cy={isoY + 10} r={8} fill={urgency ? '#fbbf24' : '#f59e0b'} stroke="#78350f" strokeWidth={1.5} />
              {/* Eyes (beady goblin) */}
              <circle cx={isoX + TILE_SIZE / 2 - 3} cy={isoY + 9} r={2} fill="#1c1917" />
              <circle cx={isoX + TILE_SIZE / 2 + 3} cy={isoY + 9} r={2} fill="#1c1917" />
              {/* TNT barrel */}
              <rect x={isoX + TILE_SIZE / 2 - 6} y={isoY + 28} width={12} height={10} fill="#292524" stroke="#78716c" strokeWidth={1.5} rx={2} />
              <line x1={isoX + TILE_SIZE / 2 - 4} y1={isoY + 30} x2={isoX + TILE_SIZE / 2 + 4} y2={isoY + 30} stroke="#78716c" strokeWidth={1} />
              <line x1={isoX + TILE_SIZE / 2 - 4} y1={isoY + 33} x2={isoX + TILE_SIZE / 2 + 4} y2={isoY + 33} stroke="#78716c" strokeWidth={1} />
              {/* Fuse spark */}
              <text x={isoX + TILE_SIZE / 2 + 6} y={isoY + 28} fontSize="10">✨</text>
              {/* Urgency pulse */}
              {urgency && <circle cx={isoX + TILE_SIZE / 2} cy={isoY + 20} r={22} fill="none" stroke="#dc2626" strokeWidth={2} opacity={0.6} />}
              {/* Label */}
              <text x={isoX + TILE_SIZE / 2} y={isoY - 4} textAnchor="middle" fontSize="8" fill="#fca5a5" fontWeight="bold">SAPPER</text>
              {/* HP bar */}
              <rect x={isoX + TILE_SIZE / 2 - 14} y={isoY - 10} width={28} height={4} fill="#1e293b" rx={2} />
              <rect x={isoX + TILE_SIZE / 2 - 14} y={isoY - 10} width={28 * hp} height={4} fill="#dc2626" rx={2} />
            </g>;
          })}

          {/* Enemy Troll Archers */}
          {enemyTrolls.filter(t => t.hp > 0 && fogVisible[Math.round(t.x)]?.[Math.round(t.y)]).map(t => {
            const { isoX, isoY } = tileToSvg(t.x, t.y);
            const hp = t.hp / t.maxHp;
            return <g key={`troll-${t.id}`} style={{ cursor: anySelected ? 'crosshair' : 'default' }} onContextMenu={e => handleAttackTroll(t.id, e)}>
              {/* Body */}
              <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 24} rx={9} ry={12} fill={t.state === 'attacking' ? '#16a34a' : '#15803d'} stroke="#14532d" strokeWidth={2} />
              {/* Head — big troll head */}
              <circle cx={isoX + TILE_SIZE / 2} cy={isoY + 10} r={9} fill="#4ade80" stroke="#14532d" strokeWidth={1.5} />
              {/* Tusks */}
              <line x1={isoX + TILE_SIZE / 2 - 5} y1={isoY + 16} x2={isoX + TILE_SIZE / 2 - 7} y2={isoY + 20} stroke="#fde68a" strokeWidth={2} strokeLinecap="round" />
              <line x1={isoX + TILE_SIZE / 2 + 5} y1={isoY + 16} x2={isoX + TILE_SIZE / 2 + 7} y2={isoY + 20} stroke="#fde68a" strokeWidth={2} strokeLinecap="round" />
              {/* Bow */}
              <path d={`M${isoX + TILE_SIZE / 2 + 12},${isoY + 8} Q${isoX + TILE_SIZE / 2 + 22},${isoY + 15} ${isoX + TILE_SIZE / 2 + 12},${isoY + 22}`} fill="none" stroke="#92400e" strokeWidth={2.5} />
              {/* Arrow */}
              <line x1={isoX + TILE_SIZE / 2 + 12} y1={isoY + 15} x2={isoX + TILE_SIZE / 2 - 2} y2={isoY + 15} stroke="#d97706" strokeWidth={1.5} />
              {/* Attack range ring when attacking */}
              {t.state === 'attacking' && <circle cx={isoX + TILE_SIZE / 2} cy={isoY + 20} r={30} fill="none" stroke="#f97316" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />}
              {/* Label */}
              <text x={isoX + TILE_SIZE / 2} y={isoY - 4} textAnchor="middle" fontSize="8" fill="#86efac" fontWeight="bold">TROLL</text>
              {/* HP bar */}
              <rect x={isoX + TILE_SIZE / 2 - 16} y={isoY - 10} width={32} height={4} fill="#1e293b" rx={2} />
              <rect x={isoX + TILE_SIZE / 2 - 16} y={isoY - 10} width={32 * hp} height={4} fill="#22c55e" rx={2} />
            </g>;
          })}

          {/* Workers */}
          {workers.map(worker => { const { isoX, isoY } = tileToSvg(worker.x, worker.y); const hp = worker.hp / worker.maxHp;
            const heroAlive = workers.find(w => w.unitType === 'hero' && w.hp > 0);
            const hasMoraleAura = heroAlive && worker.unitType !== 'hero' && tileDist(worker.x, worker.y, heroAlive.x, heroAlive.y) <= 3;
            return <g key={`worker-${worker.id}`}
              onClick={e => { e.stopPropagation(); if (!isDraggingRef.current && !buildMode) { setSelectedType('worker'); setWorkers(ws => ws.map(w => ({ ...w, selected: w.id === worker.id }))); } }}
              style={{ cursor: 'pointer' }}>
              {hasMoraleAura && <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 32} rx={26} ry={12} fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.6} />}
              {battleShoutUntil > Date.now() && heroAlive && tileDist(worker.x, worker.y, heroAlive.x, heroAlive.y) <= HERO_SHOUT_RADIUS && <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 32} rx={30} ry={14} fill="none" stroke="#fb923c" strokeWidth={2} strokeDasharray="5 3" opacity={0.85} />}
              {worker.selected && <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 32} rx={worker.unitType === 'hero' ? 26 : worker.unitType === 'catapult' || worker.unitType === 'trebuchet' ? 28 : 22} ry={10} fill="none" stroke={worker.unitType === 'hero' ? '#fbbf24' : worker.unitType === 'catapult' ? '#ea580c' : worker.unitType === 'trebuchet' ? '#92400e' : worker.unitType === 'swordsman' ? '#f87171' : '#38bdf8'} strokeWidth={3} />}
              {worker.holdPosition && <text x={isoX + TILE_SIZE / 2 + 14} y={isoY - 2} textAnchor="middle" fontSize="12">🛡️</text>}
              {worker.unitType === 'cavalry' ? (
                <g>
                  {worker.sprinting && <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 22} rx={28} ry={17} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2" opacity={0.8} />}
                  {/* Horse body */}
                  <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 22} rx={22} ry={14} fill={worker.state === 'attacking' ? '#b45309' : worker.sprinting ? '#f59e0b' : '#d97706'} stroke="#78350f" strokeWidth={2.5} />
                  {/* Horse head */}
                  <ellipse cx={isoX + TILE_SIZE / 2 + 18} cy={isoY + 12} rx={10} ry={8} fill={worker.state === 'attacking' ? '#b45309' : worker.sprinting ? '#f59e0b' : '#d97706'} stroke="#78350f" strokeWidth={2} />
                  {/* Legs */}
                  <line x1={isoX + TILE_SIZE / 2 - 12} y1={isoY + 30} x2={isoX + TILE_SIZE / 2 - 12} y2={isoY + 44} stroke="#92400e" strokeWidth={4} strokeLinecap="round" />
                  <line x1={isoX + TILE_SIZE / 2 + 4} y1={isoY + 30} x2={isoX + TILE_SIZE / 2 + 4} y2={isoY + 44} stroke="#92400e" strokeWidth={4} strokeLinecap="round" />
                  {/* Rider */}
                  <circle cx={isoX + TILE_SIZE / 2 + 4} cy={isoY + 8} r={8} fill="#fbbf24" stroke="#78350f" strokeWidth={2} />
                  <text x={isoX + TILE_SIZE / 2 + 4} y={isoY + 12} textAnchor="middle" fontSize="10">⚔️</text>
                  {worker.sprinting && <text x={isoX + TILE_SIZE / 2 - 18} y={isoY + 8} textAnchor="middle" fontSize="14">⚡</text>}
                </g>
              ) : worker.unitType === 'catapult' ? (
                <g>
                  {/* Catapult frame */}
                  <rect x={isoX + TILE_SIZE / 2 - 20} y={isoY + 6} width={40} height={18} fill="#78350f" stroke="#92400e" strokeWidth={2} rx={3} />
                  {/* Wheels */}
                  <circle cx={isoX + TILE_SIZE / 2 - 14} cy={isoY + 26} r={7} fill="#1c1917" stroke="#92400e" strokeWidth={2} />
                  <circle cx={isoX + TILE_SIZE / 2 + 14} cy={isoY + 26} r={7} fill="#1c1917" stroke="#92400e" strokeWidth={2} />
                  {/* Throwing arm */}
                  <line x1={isoX + TILE_SIZE / 2} y1={isoY + 14} x2={isoX + TILE_SIZE / 2 - 6} y2={isoY - 8} stroke="#a16207" strokeWidth={3} strokeLinecap="round" />
                  {/* Boulder */}
                  <circle cx={isoX + TILE_SIZE / 2 - 8} cy={isoY - 12} r={5} fill="#6b7280" stroke="#374151" strokeWidth={1.5} />
                </g>
              ) : worker.unitType === 'trebuchet' ? (
                <g>
                  {/* Trebuchet base — wider than catapult */}
                  <rect x={isoX + TILE_SIZE / 2 - 26} y={isoY + 10} width={52} height={14} fill="#44231a" stroke="#6b3d2e" strokeWidth={2} rx={2} />
                  {/* Larger wheels */}
                  <circle cx={isoX + TILE_SIZE / 2 - 18} cy={isoY + 28} r={9} fill="#1c1917" stroke="#6b3d2e" strokeWidth={2} />
                  <circle cx={isoX + TILE_SIZE / 2 + 18} cy={isoY + 28} r={9} fill="#1c1917" stroke="#6b3d2e" strokeWidth={2} />
                  {/* Counterweight housing */}
                  <rect x={isoX + TILE_SIZE / 2 - 6} y={isoY + 2} width={12} height={10} fill="#92400e" stroke="#78350f" strokeWidth={1.5} rx={1} />
                  {/* Long arm */}
                  <line x1={isoX + TILE_SIZE / 2} y1={isoY + 6} x2={isoX + TILE_SIZE / 2 + 14} y2={isoY - 18} stroke="#92400e" strokeWidth={4} strokeLinecap="round" />
                  {/* Sling + projectile */}
                  <circle cx={isoX + TILE_SIZE / 2 + 18} cy={isoY - 22} r={6} fill="#9ca3af" stroke="#374151" strokeWidth={1.5} />
                  <text x={isoX + TILE_SIZE / 2} y={isoY + 44} textAnchor="middle" fontSize="7" fill="#fde68a" fontWeight="bold">TREBUCHET</text>
                </g>
              ) : (
                <>
                  <circle cx={isoX + TILE_SIZE / 2} cy={isoY + 18} r={worker.unitType === 'hero' ? 22 : 18}
                    fill={worker.unitType === 'hero'
                      ? (worker.state === 'attacking' ? '#92400e' : '#78350f')
                      : worker.unitType === 'swordsman'
                      ? (worker.state === 'attacking' ? '#dc2626' : '#7f1d1d')
                      : (worker.state === 'attacking' ? '#fca5a5' : worker.state === 'gathering' ? '#fde68a' : '#fbbf24')}
                    stroke={worker.unitType === 'hero' ? '#fbbf24' : worker.unitType === 'swordsman' ? '#450a0a' : '#78350f'} strokeWidth={worker.unitType === 'hero' ? 4 : 3} />
                  {worker.unitType === 'hero' && (
                    <g>
                      <polygon points={`${isoX + TILE_SIZE/2 - 10},${isoY - 6} ${isoX + TILE_SIZE/2 - 4},${isoY - 16} ${isoX + TILE_SIZE/2},${isoY - 10} ${isoX + TILE_SIZE/2 + 4},${isoY - 16} ${isoX + TILE_SIZE/2 + 10},${isoY - 6}`} fill="#fbbf24" stroke="#b45309" strokeWidth={1.5} />
                      <text x={isoX + TILE_SIZE/2} y={isoY + 44} textAnchor="middle" fontSize="8" fill="#fde68a" fontWeight="bold">BARNABAS</text>
                    </g>
                  )}
                  <text x={isoX + TILE_SIZE / 2} y={isoY + 26} textAnchor="middle" fontSize={worker.unitType === 'hero' ? 18 : 16}>{worker.unitType === 'hero' ? '🦸' : worker.unitType === 'swordsman' ? '⚔️' : '👨‍🌾'}</text>
                </>
              )}
              <rect x={isoX + TILE_SIZE / 2 - 16} y={isoY - 4} width={32} height={4} fill="#1e293b" />
              <rect x={isoX + TILE_SIZE / 2 - 16} y={isoY - 4} width={32 * hp} height={4} fill={hp > 0.5 ? '#4ade80' : hp > 0.25 ? '#fbbf24' : '#ef4444'} />
              {worker.level > 0 && (
                <text x={isoX + TILE_SIZE / 2 - 18} y={isoY - 6} textAnchor="middle" fontSize="10" fill="#fbbf24">{'⭐'.repeat(worker.level)}</text>
              )}
              {worker.state === 'idle' && worker.unitType === 'farmer' && (
                <g>
                  <circle cx={isoX + TILE_SIZE / 2 + 18} cy={isoY - 8} r={8} fill="#fbbf24" opacity={0.9} />
                  <text x={isoX + TILE_SIZE / 2 + 18} y={isoY - 4} textAnchor="middle" fontSize="11" fill="#1e293b" fontWeight="bold">!</text>
                </g>
              )}
              {worker.unitType !== 'farmer' && worker.state === 'idle' && (
                <g>
                  <circle cx={isoX + TILE_SIZE / 2 + 18} cy={isoY - 8} r={8} fill="#fb923c" opacity={0.85} />
                  <text x={isoX + TILE_SIZE / 2 + 18} y={isoY - 4} textAnchor="middle" fontSize="11" fill="#1e293b" fontWeight="bold">!</text>
                </g>
              )}
              {worker.group !== null && <>
                <circle cx={isoX + TILE_SIZE / 2 + 14} cy={isoY + 6} r={9} fill="#1e293b" stroke="#fbbf24" strokeWidth={1.5} />
                <text x={isoX + TILE_SIZE / 2 + 14} y={isoY + 10} textAnchor="middle" fontSize="10" fill="#fde68a" fontWeight="bold">{worker.group}</text>
              </>}
              {(worker.carrying.gold > 0 || worker.carrying.lumber > 0 || worker.carrying.stone > 0) && (
                <text x={isoX + TILE_SIZE / 2} y={isoY + 48} textAnchor="middle" fontSize="12" fill="#fde68a">
                  {worker.carrying.gold > 0 ? `🪙${worker.carrying.gold}` : ''}{worker.carrying.lumber > 0 ? `🌲${worker.carrying.lumber}` : ''}{worker.carrying.stone > 0 ? `🪨${worker.carrying.stone}` : ''}
                </text>
              )}
            </g>; })}

          {/* Patrol route visualizations */}
          {workers.filter(w => w.patrol && w.selected).map(w => {
            if (!w.patrol) return null;
            const a = tileToSvg(w.patrol.a.x, w.patrol.a.y);
            const b = tileToSvg(w.patrol.b.x, w.patrol.b.y);
            const ax = a.isoX + TILE_SIZE / 2, ay = a.isoY + 18;
            const bx = b.isoX + TILE_SIZE / 2, by = b.isoY + 18;
            return (
              <g key={`patrol-${w.id}`} pointerEvents="none">
                <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#22d3ee" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.6} />
                <circle cx={ax} cy={ay} r={5} fill="none" stroke="#22d3ee" strokeWidth={2} opacity={0.8} />
                <circle cx={bx} cy={by} r={5} fill="none" stroke="#22d3ee" strokeWidth={2} opacity={0.8} />
              </g>
            );
          })}

          {/* Fog of war */}
          {[...Array(GRID_SIZE)].map((_, i) =>
            [...Array(GRID_SIZE)].map((_, j) => {
              if (fogVisible[i]?.[j]) return null;
              const { isoX, isoY } = tileToSvg(i, j);
              const pts = [[isoX, isoY + TILE_SIZE / 2], [isoX + TILE_SIZE, isoY], [isoX + TILE_SIZE * 2, isoY + TILE_SIZE / 2], [isoX + TILE_SIZE, isoY + TILE_SIZE]].map(p => p.join(',')).join(' ');
              return <polygon key={`fog-${i}-${j}`} points={pts} fill={fogExplored[i]?.[j] ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.88)'} pointerEvents="none" />;
            })
          )}

          {/* Night overlay */}
          {dayPhase === 'night' && (
            <rect x={0} y={0} width={viewBoxW} height={viewBoxH} fill="rgba(15,10,40,0.35)" pointerEvents="none" />
          )}

          {/* Floating damage / heal texts */}
          {floatingTexts.map(ft => {
            const age = (Date.now() - ft.createdAt) / 1000;
            const opacity = Math.max(0, 1 - age / 1.2);
            const yOff = age * 45;
            return <text key={ft.id} x={ft.x} y={ft.y - yOff} fill={ft.color} fontSize="18" fontWeight="bold" textAnchor="middle" opacity={opacity} pointerEvents="none" style={{ textShadow: '0 1px 3px #000' }}>{ft.text}</text>;
          })}

          {/* Box selection */}
          {dragBox && Math.abs(dragBox.end.x - dragBox.start.x) > 4 && (
            <rect x={Math.min(dragBox.start.x, dragBox.end.x)} y={Math.min(dragBox.start.y, dragBox.end.y)} width={Math.abs(dragBox.end.x - dragBox.start.x)} height={Math.abs(dragBox.end.y - dragBox.start.y)} fill="rgba(56,189,248,0.08)" stroke="#38bdf8" strokeWidth={2} strokeDasharray="8 4" pointerEvents="none" />
          )}
        </svg>
      </div>

      <RTSUI
        selectedType={selectedType}
        selectedWorkers={selectedWorkers}
        farmhouse={farmhouse}
        farmhouseUpgradeCosts={farmhouseUpgradeCosts}
        farmhouseStorage={farmhouseStorage}
        resources={resources}
        placedBuildings={placedBuildings}
        buildingCosts={BUILDING_COSTS}
        onFarmhouseAction={handleFarmhouseAction}
        onWorkerCommand={handleWorkerCommand}
        patrolMode={patrolMode}
        onPatrolCommand={() => setPatrolMode(m => !m)}
        onHoldPosition={() => setWorkers(ws => ws.map(w => w.selected ? { ...w, holdPosition: true, movingTo: null, path: [], patrol: null, attackMove: false, attackMoveTarget: null, waypoints: [], state: 'idle' } : w))}
        buildMode={buildMode}
        upgrades={upgrades}
        onResearch={handleResearch}
        stance={stance}
        onToggleStance={() => setStance(s => s === 'aggressive' ? 'passive' : 'aggressive')}
        hasBarracks={placedBuildings.some(b => b.type === 'barracks')}
        garrisonedCount={garrisoned.length}
        garrisonCap={GARRISON_CAP}
        onGarrison={handleGarrison}
        onUngarrison={handleUngarrison}
        heroRecruited={heroRecruited}
        heroAbilityCooldown={heroAbilityCooldown}
        onHeroAbility={handleHeroAbility}
        heroShoutCooldown={heroShoutCooldown}
        battleShoutActive={battleShoutUntil > Date.now()}
        onBattleShout={handleBattleShout}
        harvestBoonCooldown={harvestBoonCooldown}
        harvestBoonActive={harvestBoonActive}
        onHarvestBoon={handleHarvestBoon}
        onRecruitHero={() => handleFarmhouseAction('recruitHero')}
        hasSiegeWorkshop={placedBuildings.some(b => b.type === 'siegeWorkshop')}
        hasMarket={placedBuildings.some(b => b.type === 'market')}
        hasBlacksmith={placedBuildings.some(b => b.type === 'blacksmith')}
        blacksmithUpgrades={blacksmithUpgrades}
        onBlacksmithUpgrade={(type) => handleFarmhouseAction(`blacksmith:${type}`)}
        hasStable={placedBuildings.some(b => b.type === 'stable')}
        hasWatchtower={placedBuildings.some(b => b.type === 'watchtower')}
        guardTowerResearched={guardTowerResearched}
        onGuardTower={() => handleFarmhouseAction('guardTower')}
        trainingQueue={trainingQueue}
        trainingProgress={trainingProgress}
        towerGarrison={towerGarrison}
        onTowerDeploy={handleTowerDeploy}
        placedBuildingsList={placedBuildings}
        onSwordsmanCharge={handleSwordsmanCharge}
        onCavalrySprint={handleCavalrySprint}
        onMinimapClick={(tx, ty) => {
          const { isoX, isoY } = tileToSvg(tx, ty);
          const bounds = { minX: -((GRID_SIZE * TILE_SIZE) / 2), maxX: (GRID_SIZE * TILE_SIZE) / 2, minY: -100, maxY: (GRID_SIZE * TILE_SIZE) / 2 };
          setCamera({ x: Math.max(bounds.minX, Math.min(bounds.maxX, -isoX + 400)), y: Math.max(bounds.minY, Math.min(bounds.maxY, -isoY + 200)) });
        }}
        minimapData={minimapData}
        enemyBarnHp={enemyBarnHp}
        enemyBarnMaxHp={ENEMY_BARN_MAX_HP}
        playerBarnHp={playerBarnHp}
        playerBarnMaxHp={PLAYER_BARN_MAX_HP}
        underAttack={underAttack}
        incomeRate={incomeRate}
      />
    </div>
  );
};

export default RTSMap;
