'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { RTSUI, WorkerState, Upgrades, UPGRADE_COSTS, UPGRADE_MAX } from './RTSUI';

const GRID_SIZE = 13;
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
const ENEMY_BARN_POS = { x: 10, y: 10 };
const ENEMY_BARN_MAX_HP = 200;
const PLAYER_BARN_MAX_HP = 300;
const ATTACK_DAMAGE = 15;
const ATTACK_INTERVAL_MS = 1200;
const ENEMY_COUNTER_DAMAGE = 8;
const WORKER_MAX_HP = 50;
const GRUNT_MAX_HP = 60;
const GRUNT_DAMAGE = 12;
const GRUNT_ATTACK_MS = 1500;
const GRUNT_SPAWN_MS = 25000;
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
const ARCHER_TOWER_POS = { x: 8, y: 9 };
const ARCHER_TOWER_RANGE = 4;
const ARCHER_TOWER_DAMAGE = 10;
const ARCHER_TOWER_ATTACK_MS = 2500;

interface FloatingText { id: number; x: number; y: number; text: string; color: string; createdAt: number }
type TileType = 'grass' | 'dirt' | 'water' | 'tree' | 'rock';
type BuildingType = 'farmhouse' | 'lumberShed' | 'watchtower' | 'wall' | 'windmill' | 'barracks' | 'siegeWorkshop' | 'market' | 'blacksmith' | 'granary';

interface ResourceNode { x: number; y: number; amount: number }
interface Resources { gold: number; lumber: number; stone: number; food: number; foodCap: number }
interface PlacedBuilding { id: number; type: BuildingType; x: number; y: number }

interface EnemyGrunt {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  movingTo: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  state: 'moving' | 'attacking';
}

const BARN_POS = { x: 4, y: 4 };

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
};

const BUILDING_EMOJI: Record<BuildingType, string> = {
  farmhouse: '🏠', lumberShed: '🪵', watchtower: '🗼', wall: '🧱', windmill: '💨', barracks: '🏯', siegeWorkshop: '⚙️', market: '🏪', blacksmith: '🔨', granary: '🌾',
};

const SWORDSMAN_MAX_HP = 80;
const SWORDSMAN_DAMAGE_BONUS = 10;

function makeTiles(): TileType[][] {
  return Array.from({ length: GRID_SIZE }, (_, i) =>
    Array.from({ length: GRID_SIZE }, (_, j) => {
      if ((i >= 1 && i <= 3 && j >= 1 && j <= 2) || (i >= 8 && i <= 10 && j >= 8 && j <= 9)) return 'water';
      if ((i === 3 || i === 4) && (j === 6 || j === 7)) return 'tree';
      if ((i === 6 || i === 7) && (j === 2 || j === 3)) return 'rock';
      if (j === 4 || i === 5) return 'dirt';
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

interface SaveWorker { id: number; x: number; y: number; hp: number; maxHp: number; unitType: 'farmer' | 'swordsman' | 'hero' | 'catapult'; group: number | null; xp?: number; level?: number }
interface SaveData {
  version: 1;
  resources: Resources;
  workers: SaveWorker[];
  trees: ResourceNode[];
  goldMine: ResourceNode;
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

const INITIAL_SAVE: SaveData | null = (() => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as SaveData;
    return d?.version === 1 ? d : null;
  } catch { return null; }
})();

function writeSave(data: SaveData): void {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch {}
}

function clearSave(): void {
  try { localStorage.removeItem(SAVE_KEY); } catch {}
}

function makeUnit(id: number, x: number, y: number, unitType: 'farmer' | 'swordsman' | 'hero' | 'catapult'): WorkerState {
  const maxHp = unitType === 'hero' ? HERO_MAX_HP : unitType === 'swordsman' ? SWORDSMAN_MAX_HP : unitType === 'catapult' ? CATAPULT_MAX_HP : WORKER_MAX_HP;
  return { id, x, y, selected: false, movingTo: null, path: [], gathering: null, attacking: null, carrying: { gold: 0, lumber: 0, stone: 0 }, state: 'idle', group: null, hp: maxHp, maxHp, patrol: null, unitType, xp: 0, level: 0 };
}
// ---------------------------------

const Stat: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div>
    <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
    <div style={{ color, fontSize: 22, fontWeight: 700 }}>{value}</div>
  </div>
);

const RTSMap: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const tiles = useMemo(() => INITIAL_TILES, []);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const [fogExplored, setFogExplored] = useState<boolean[][]>(() => INITIAL_SAVE?.fogExplored ?? computeVisible([{ x: BARN_POS.x, y: BARN_POS.y, r: BARN_VISION }]));
  const [dragBox, setDragBox] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const isDraggingRef = useRef(false);
  const [buildMode, setBuildMode] = useState<BuildingType | null>(null);
  const [ghostTile, setGhostTile] = useState<{ x: number; y: number } | null>(null);
  const [placedBuildings, setPlacedBuildings] = useState<PlacedBuilding[]>(() => INITIAL_SAVE?.placedBuildings ?? []);
  const buildingIdRef = useRef(INITIAL_SAVE?.buildingNextId ?? 1);
  const placedBuildingsRef = useRef(placedBuildings);
  useEffect(() => { placedBuildingsRef.current = placedBuildings; }, [placedBuildings]);
  const [controlGroups, setControlGroups] = useState<Record<number, number[]>>({});
  const [resources, setResources] = useState<Resources>(() => INITIAL_SAVE?.resources ?? { gold: 0, lumber: 0, stone: 0, food: 2, foodCap: FOOD_CAP_BASE });

  const DEFAULT_TREES: ResourceNode[] = [
    { x: 2, y: 2, amount: 50 }, { x: 6, y: 3, amount: 50 }, { x: 4, y: 7, amount: 50 },
    { x: 7, y: 6, amount: 50 }, { x: 3, y: 9, amount: 50 }, { x: 9, y: 3, amount: 50 },
    { x: 10, y: 10, amount: 50 }, { x: 1, y: 10, amount: 50 }, { x: 11, y: 2, amount: 50 },
    { x: 8, y: 9, amount: 50 },
  ];
  const [trees, setTrees] = useState<ResourceNode[]>(() => INITIAL_SAVE?.trees ?? DEFAULT_TREES);
  const [goldMine, setGoldMine] = useState<ResourceNode>(() => INITIAL_SAVE?.goldMine ?? { x: 1, y: 7, amount: 100 });
  const [stoneNodes, setStoneNodes] = useState<ResourceNode[]>(() => INITIAL_SAVE?.stoneNodes ?? [
    { x: 9, y: 1, amount: 100 }, { x: 11, y: 5, amount: 100 }, { x: 0, y: 5, amount: 100 },
    { x: 5, y: 11, amount: 100 }, { x: 10, y: 7, amount: 100 },
  ]);
  const treesRef = useRef(trees);
  const goldMineRef = useRef(goldMine);
  const stoneNodesRef = useRef(stoneNodes);
  useEffect(() => { treesRef.current = trees; }, [trees]);
  useEffect(() => { goldMineRef.current = goldMine; }, [goldMine]);
  useEffect(() => { stoneNodesRef.current = stoneNodes; }, [stoneNodes]);

  const makeWorker = (id: number, x: number, y: number) => makeUnit(id, x, y, 'farmer');
  const makeSwordsman = (id: number, x: number, y: number) => makeUnit(id, x, y, 'swordsman');

  const [workers, setWorkers] = useState<WorkerState[]>(() =>
    INITIAL_SAVE?.workers?.length
      ? INITIAL_SAVE.workers.map(w => ({ ...makeUnit(w.id, w.x, w.y, w.unitType), hp: w.hp, maxHp: w.maxHp, group: w.group, xp: w.xp ?? 0, level: w.level ?? 0 }))
      : [{ ...makeUnit(1, 5, 5, 'farmer'), selected: true }, makeUnit(2, 7, 7, 'farmer')]
  );
  const workersRef = useRef(workers);
  useEffect(() => { workersRef.current = workers; }, [workers]);

  const [enemyGrunts, setEnemyGrunts] = useState<EnemyGrunt[]>([]);
  const enemyGruntsRef = useRef(enemyGrunts);
  useEffect(() => { enemyGruntsRef.current = enemyGrunts; }, [enemyGrunts]);
  const gruntIdRef = useRef(1);
  const gruntAttackTimeoutsRef = useRef<Record<number, number>>({});

  const [wave, setWave] = useState(() => INITIAL_SAVE?.wave ?? 0);
  const waveRef = useRef(INITIAL_SAVE?.wave ?? 0);
  const [waveAnnouncement, setWaveAnnouncement] = useState<string | null>(null);
  const gameOverRef = useRef<'victory' | 'defeat' | null>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const [gameSpeed, setGameSpeed] = useState(1);
  const gameSpeedRef = useRef(1);
  useEffect(() => { gameSpeedRef.current = gameSpeed; }, [gameSpeed]);

  const [enemyBarnHp, setEnemyBarnHp] = useState(() => INITIAL_SAVE?.enemyBarnHp ?? ENEMY_BARN_MAX_HP);
  const [playerBarnHp, setPlayerBarnHp] = useState(() => INITIAL_SAVE?.playerBarnHp ?? PLAYER_BARN_MAX_HP);
  const playerBarnHpRef = useRef(INITIAL_SAVE?.playerBarnHp ?? PLAYER_BARN_MAX_HP);
  useEffect(() => { playerBarnHpRef.current = playerBarnHp; }, [playerBarnHp]);
  const [gameOver, setGameOver] = useState<'victory' | 'defeat' | null>(null);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  const [garrisoned, setGarrisoned] = useState<WorkerState[]>([]);
  const garrisonedRef = useRef(garrisoned);
  useEffect(() => { garrisonedRef.current = garrisoned; }, [garrisoned]);

  const [heroRecruited, setHeroRecruited] = useState(false);
  const [heroAbilityCooldown, setHeroAbilityCooldown] = useState(0);
  useEffect(() => {
    if (heroAbilityCooldown <= 0) return;
    const id = setInterval(() => setHeroAbilityCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [heroAbilityCooldown > 0]); // eslint-disable-line react-hooks/exhaustive-deps
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
  const [patrolMode, setPatrolMode] = useState(false);
  const patrolModeRef = useRef(false);
  useEffect(() => { patrolModeRef.current = patrolMode; }, [patrolMode]);
  const [upgrades, setUpgrades] = useState<Upgrades>(() => INITIAL_SAVE?.upgrades ?? { sharperTools: 0, swiftHarvest: 0, ironWill: 0 });
  const upgradesRef = useRef(upgrades);
  useEffect(() => { upgradesRef.current = upgrades; }, [upgrades]);

  const [blacksmithUpgrades, setBlacksmithUpgrades] = useState({ steelEdge: 0, ironHide: 0 });
  const blacksmithUpgradesRef = useRef(blacksmithUpgrades);
  useEffect(() => { blacksmithUpgradesRef.current = blacksmithUpgrades; }, [blacksmithUpgrades]);

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

  const doSave = useCallback(() => {
    writeSave({
      version: 1,
      resources,
      workers: workersRef.current.map(w => ({ id: w.id, x: Math.round(w.x), y: Math.round(w.y), hp: w.hp, maxHp: w.maxHp, unitType: w.unitType, group: w.group, xp: w.xp, level: w.level })),
      trees: treesRef.current,
      goldMine: goldMineRef.current,
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
    setWaveAnnouncement(`⚔️ Wave ${newWave}${newWave % 3 === 0 ? ' — DOUBLE ASSAULT!' : '!'}`);
    window.setTimeout(() => setWaveAnnouncement(null), 2500);

    const gruntHp = GRUNT_MAX_HP + (newWave - 1) * 10;
    const count = newWave % 3 === 0 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const ox = i === 0 ? 1 : -1;
      const cx = Math.max(0, Math.min(GRID_SIZE - 1, ENEMY_BARN_POS.x + ox));
      const cy = Math.max(0, Math.min(GRID_SIZE - 1, ENEMY_BARN_POS.y + (Math.random() > 0.5 ? 1 : -1)));
      const wallSet = new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`));
      const path = aStar(INITIAL_TILES, { x: cx, y: cy }, BARN_POS, true, wallSet);
      const grunt: EnemyGrunt = { id: gruntIdRef.current++, x: cx, y: cy, hp: gruntHp, maxHp: gruntHp, movingTo: path[0] ?? BARN_POS, path: path.slice(1), state: 'moving' };
      setEnemyGrunts(gs => [...gs, grunt]);
    }

    const nextDelay = Math.max(10000, GRUNT_SPAWN_MS - (newWave - 1) * 1500);
    spawnTimerRef.current = window.setTimeout(doSpawnWave, nextDelay);
  }, []);

  useEffect(() => {
    if (gameOver) { if (spawnTimerRef.current) { clearTimeout(spawnTimerRef.current); spawnTimerRef.current = null; } return; }
    spawnTimerRef.current = window.setTimeout(doSpawnWave, GRUNT_SPAWN_MS);
    return () => { if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current); };
  }, [gameOver, doSpawnWave]);

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

  // Player watchtowers fire arrows at enemy grunts in range
  useEffect(() => {
    const towers = placedBuildings.filter(b => b.type === 'watchtower');
    if (gameOver || towers.length === 0) return;
    const scheduleShot = (towerId: number, tx: number, ty: number) => {
      watchtowerTimersRef.current[towerId] = window.setTimeout(() => {
        delete watchtowerTimersRef.current[towerId];
        if (gameOverRef.current) return;
        const grunts = enemyGruntsRef.current;
        const target = grunts.reduce<EnemyGrunt | null>((best, g) => {
          if (tileDist(g.x, g.y, tx, ty) > WATCHTOWER_ATTACK_RANGE) return best;
          if (!best || tileDist(g.x, g.y, tx, ty) < tileDist(best.x, best.y, tx, ty)) return g;
          return best;
        }, null);
        if (target) {
          setEnemyGrunts(gs => gs.map(g => g.id === target.id ? { ...g, hp: Math.max(0, g.hp - WATCHTOWER_DAMAGE) } : g));
          addFloatingText(Math.round(target.x), Math.round(target.y), `🏹-${WATCHTOWER_DAMAGE}`, '#22d3ee');
        }
        scheduleShot(towerId, tx, ty);
      }, WATCHTOWER_ATTACK_MS);
    };
    towers.forEach(t => { if (!watchtowerTimersRef.current[t.id]) scheduleShot(t.id, t.x, t.y); });
    return () => { Object.values(watchtowerTimersRef.current).forEach(clearTimeout); watchtowerTimersRef.current = {}; };
  }, [placedBuildings, gameOver, addFloatingText]);

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

  const handleGarrison = useCallback(() => {
    setWorkers(ws => {
      const slots = GARRISON_CAP - garrisonedRef.current.length;
      if (slots <= 0) return ws;
      const toGarrison = ws.filter(w => w.selected).slice(0, slots);
      if (toGarrison.length === 0) return ws;
      const ids = new Set(toGarrison.map(w => w.id));
      setGarrisoned(g => [...g, ...toGarrison.map(w => ({ ...w, selected: false, state: 'idle' as const, movingTo: null, path: [], gathering: null, attacking: null, patrol: null }))]);
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

  const isTileOccupied = useCallback((x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return true;
    if (tiles[x]?.[y] === 'water') return true;
    if (x === BARN_POS.x && y === BARN_POS.y) return true;
    if (x === ENEMY_BARN_POS.x && y === ENEMY_BARN_POS.y) return true;
    if (trees.some(t => t.x === x && t.y === y && t.amount > 0)) return true;
    if (goldMine.x === x && goldMine.y === y && goldMine.amount > 0) return true;
    if (stoneNodes.some(s => s.x === x && s.y === y && s.amount > 0)) return true;
    if (placedBuildings.some(b => b.x === x && b.y === y)) return true;
    return false;
  }, [tiles, trees, goldMine, stoneNodes, placedBuildings]);

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
        if (gathering && (w.unitType === 'swordsman' || w.unitType === 'catapult' || w.unitType === 'hero')) return w;
        const isFormation = !gathering && !attacking;
        const offset = isFormation ? (FORMATION_OFFSETS[idx++] ?? { dx: 0, dy: 0 }) : { dx: 0, dy: 0 };
        const tx = Math.max(0, Math.min(GRID_SIZE - 1, targetX + offset.dx));
        const ty = Math.max(0, Math.min(GRID_SIZE - 1, targetY + offset.dy));
        const dest = INITIAL_TILES[tx]?.[ty] === 'water' ? { x: targetX, y: targetY } : { x: tx, y: ty };
        const startTile = { x: Math.round(w.x), y: Math.round(w.y) };
        const rawPath = aStar(INITIAL_TILES, startTile, dest);
        const first = rawPath[0] ?? dest;
        return { ...w, movingTo: first, path: rawPath.slice(1), gathering: gathering ?? null, attacking: attacking ?? null, patrol: null, state: 'moving' };
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
            setPlacedBuildings(bs => [...bs, { id: buildingIdRef.current++, type: buildMode, x: tx, y: ty }]);
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
      if (e.key === 'Escape') { setBuildMode(null); setGhostTile(null); setPatrolMode(false); }
      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
        setWorkers(ws => { if (ws.some(w => w.selected)) { setPatrolMode(m => !m); } return ws; });
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
      const curGold = goldMineRef.current;
      const curStone = stoneNodesRef.current;
      const gatherT = gatherTimeoutsRef.current;
      const attackT = attackTimeoutsRef.current;

      // Update workers
      setWorkers(ws => {
        const alive = ws.filter(w => w.hp > 0);
        if (alive.length < ws.length) setResources(r => ({ ...r, food: Math.max(0, r.food - (ws.length - alive.length)) }));

        return alive.map(w => {
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
              if (w.state === 'returning') {
                const atBarn = tileDist(w.movingTo.x, w.movingTo.y, BARN_POS.x, BARN_POS.y) < epsilon;
                if (atBarn) {
                  setResources(r => ({ ...r, gold: r.gold + w.carrying.gold, lumber: r.lumber + w.carrying.lumber, stone: r.stone + w.carrying.stone }));
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
                      if (curGold.amount > 0) {
                        const p = aStar(INITIAL_TILES, { x: Math.round(w.movingTo.x), y: Math.round(w.movingTo.y) }, { x: curGold.x, y: curGold.y });
                        return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: p[0] ?? curGold, path: p.slice(1), carrying: { gold: 0, lumber: 0, stone: 0 }, state: 'moving' };
                      }
                    } else if (w.gathering.type === 'stone') {
                      const n = curStone[w.gathering.idx];
                      if (n && n.amount > 0) {
                        const p = aStar(INITIAL_TILES, { x: Math.round(w.movingTo.x), y: Math.round(w.movingTo.y) }, { x: n.x, y: n.y });
                        return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: p[0] ?? n, path: p.slice(1), carrying: { gold: 0, lumber: 0, stone: 0 }, state: 'moving' };
                      }
                    }
                  }
                  return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: null, path: [], carrying: { gold: 0, lumber: 0, stone: 0 }, state: 'idle', gathering: null };
                }
              }
              return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: null, path: [], state: 'idle' };
            }
            const moveSpeed = w.unitType === 'catapult' ? CATAPULT_SPEED : WORKER_SPEED;
            return { ...w, x: w.x + (dx / d) * Math.min(moveSpeed * dt, d), y: w.y + (dy / d) * Math.min(moveSpeed * dt, d) };
          }

          if (w.state === 'gathering' && w.gathering) {
            const gType = w.gathering.type;
            if (gType === 'tree') {
              if (w.carrying.lumber >= CARRY_CAP) {
                const p = aStar(INITIAL_TILES, { x: Math.round(w.x), y: Math.round(w.y) }, BARN_POS);
                return { ...w, state: 'returning', movingTo: p[0] ?? BARN_POS, path: p.slice(1) };
              }
              if (!gatherT[w.id]) {
                const gatherMs = Math.max(400, GATHER_INTERVAL_MS - upgradesRef.current.swiftHarvest * 200);
                gatherT[w.id] = window.setTimeout(() => {
                  delete gatherTimeoutsRef.current[w.id];
                  const idx = w.gathering!.idx;
                  setWorkers(ws2 => ws2.map(w2 => {
                    if (w2.id !== w.id || w2.state !== 'gathering' || !w2.gathering) return w2;
                    if ((treesRef.current[idx]?.amount ?? 0) > 0 && w2.carrying.lumber < CARRY_CAP) {
                      setTrees(ts => ts.map((t, i) => i === idx ? { ...t, amount: Math.max(0, t.amount - CARRY_CAP) } : t));
                      const p = aStar(INITIAL_TILES, { x: Math.round(w2.x), y: Math.round(w2.y) }, BARN_POS);
                      return { ...w2, carrying: { gold: 0, lumber: w2.carrying.lumber + CARRY_CAP, stone: 0 }, state: 'returning', movingTo: p[0] ?? BARN_POS, path: p.slice(1) };
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
                const gatherMs = Math.max(400, GATHER_INTERVAL_MS - upgradesRef.current.swiftHarvest * 200);
                gatherT[w.id] = window.setTimeout(() => {
                  delete gatherTimeoutsRef.current[w.id];
                  setWorkers(ws2 => ws2.map(w2 => {
                    if (w2.id !== w.id || w2.state !== 'gathering' || !w2.gathering) return w2;
                    if (goldMineRef.current.amount > 0 && w2.carrying.gold < CARRY_CAP) {
                      setGoldMine(gm => ({ ...gm, amount: Math.max(0, gm.amount - CARRY_CAP) }));
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
                const gatherMs = Math.max(400, GATHER_INTERVAL_MS - upgradesRef.current.swiftHarvest * 200);
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
            if (w.attacking.targetType === 'grunt') {
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
                const unitBonus = w.unitType === 'hero' ? HERO_DAMAGE_BONUS : w.unitType === 'swordsman' ? SWORDSMAN_DAMAGE_BONUS : 0;
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[capturedWorkerId];
                  setWorkers(ws2 => {
                    const attacker = ws2.find(u => u.id === capturedWorkerId);
                    const veteranBonus = attacker ? attacker.level * VETERAN_ATK_BONUS : 0;
                    const dmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + unitBonus + veteranBonus;
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
                    // Award XP to attacker if grunt will die
                    return ws2.map(u => {
                      if (u.id !== capturedWorkerId) return u;
                      const gruntCurrent = enemyGruntsRef.current.find(g => g.id === gruntId);
                      const veteranDmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + unitBonus + u.level * VETERAN_ATK_BONUS;
                      if (!gruntCurrent || gruntCurrent.hp - veteranDmg > 0) return u;
                      const newXp = u.xp + XP_PER_KILL;
                      const newLevel = newXp >= XP_TO_LEVEL_2 ? 2 : newXp >= XP_TO_LEVEL_1 ? 1 : 0;
                      if (newLevel > u.level) {
                        addFloatingText(capturedWX, capturedWY, `⭐ Level ${newLevel}!`, '#fbbf24');
                        const hpGain = VETERAN_HP_BONUS;
                        return { ...u, xp: newXp, level: newLevel, maxHp: u.maxHp + hpGain, hp: Math.min(u.hp + hpGain, u.maxHp + hpGain) };
                      }
                      return { ...u, xp: newXp };
                    });
                  });
                }, ATTACK_INTERVAL_MS);
              }
            } else {
              if (!attackT[w.id]) {
                const capturedWX = Math.round(w.x), capturedWY = Math.round(w.y);
                const unitBonus2 = w.unitType === 'hero' ? HERO_DAMAGE_BONUS : w.unitType === 'swordsman' ? SWORDSMAN_DAMAGE_BONUS : 0;
                const capturedVetLevel = w.level;
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg = ATTACK_DAMAGE + upgradesRef.current.sharperTools * 5 + blacksmithUpgradesRef.current.steelEdge * 5 + unitBonus2 + capturedVetLevel * VETERAN_ATK_BONUS;
                  setWorkers(ws2 => ws2.map(w2 => {
                    if (w2.id !== w.id || w2.state !== 'attacking' || !w2.attacking) return w2;
                    setEnemyBarnHp(hp => { const nHp = Math.max(0, hp - dmg); if (nHp <= 0) setGameOver('victory'); return nHp; });
                    addFloatingText(ENEMY_BARN_POS.x, ENEMY_BARN_POS.y, `-${dmg}`, '#ef4444');
                    const counterDmg = Math.max(1, ENEMY_COUNTER_DAMAGE - blacksmithUpgradesRef.current.ironHide * 2);
                    addFloatingText(capturedWX, capturedWY, `-${counterDmg}`, '#fca5a5');
                    return { ...w2, hp: Math.max(0, w2.hp - counterDmg) };
                  }));
                }, ATTACK_INTERVAL_MS);
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
          const goldDrop = killed.length * 5;
          setResources(r => ({ ...r, gold: r.gold + goldDrop }));
          killed.forEach(g => addFloatingText(Math.round(g.x), Math.round(g.y), `+${5}🪙`, '#fbbf24'));
        }
        return survived;
      });
      const gruntSpeedMult = isNightRef.current ? NIGHT_SPEED_MULT : 1;
      setEnemyGrunts(gs => gs.map(g => {
        // Proximity aggro: switch to attack nearest worker within 2 tiles
        const nearWorker = currentWorkers.find(w => w.hp > 0 && tileDist(g.x, g.y, w.x, w.y) <= 2);
        if (nearWorker) {
          const distToWorker = tileDist(g.x, g.y, nearWorker.x, nearWorker.y);
          if (distToWorker <= 1.4) {
            // Attack worker
            if (!gruntAttackTimeoutsRef.current[g.id]) {
              const wid = nearWorker.id;
              const capturedWX = Math.round(nearWorker.x), capturedWY = Math.round(nearWorker.y);
              gruntAttackTimeoutsRef.current[g.id] = window.setTimeout(() => {
                delete gruntAttackTimeoutsRef.current[g.id];
                const gruntDmg = Math.max(1, GRUNT_DAMAGE - blacksmithUpgradesRef.current.ironHide * 2);
                setWorkers(ws2 => ws2.map(w2 => w2.id === wid ? { ...w2, hp: Math.max(0, w2.hp - gruntDmg) } : w2));
                addFloatingText(capturedWX, capturedWY, `-${gruntDmg}`, '#ef4444');
              }, GRUNT_ATTACK_MS);
            }
            return { ...g, movingTo: null, path: [], state: 'attacking' };
          }
          // Move toward worker
          const p = aStar(INITIAL_TILES, { x: Math.round(g.x), y: Math.round(g.y) }, { x: Math.round(nearWorker.x), y: Math.round(nearWorker.y) }, true, new Set(placedBuildingsRef.current.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`)));
          const dx = nearWorker.x - g.x, dy = nearWorker.y - g.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          return { ...g, movingTo: p[0] ?? { x: nearWorker.x, y: nearWorker.y }, path: p.slice(1), state: 'moving', x: g.x + (dx / d) * Math.min(GRUNT_SPEED * gruntSpeedMult * dt, d), y: g.y + (dy / d) * Math.min(GRUNT_SPEED * gruntSpeedMult * dt, d) };
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
          return { ...g, x: g.x + (dx / d) * Math.min(GRUNT_SPEED * gruntSpeedMult * dt, d), y: g.y + (dy / d) * Math.min(GRUNT_SPEED * gruntSpeedMult * dt, d) };
        }
        if (g.state === 'attacking') {
          if (!gruntAttackTimeoutsRef.current[g.id]) {
            gruntAttackTimeoutsRef.current[g.id] = window.setTimeout(() => {
              delete gruntAttackTimeoutsRef.current[g.id];
              const barnArmor = Math.min(8, garrisonedRef.current.length * GARRISON_ARMOR_PER_UNIT);
              const barnDmg = Math.max(1, GRUNT_DAMAGE - barnArmor);
              setPlayerBarnHp(hp => { const nHp = Math.max(0, hp - barnDmg); if (nHp <= 0) setGameOver('defeat'); return nHp; });
              addFloatingText(BARN_POS.x, BARN_POS.y, `-${GRUNT_DAMAGE}`, '#ef4444');
            }, GRUNT_ATTACK_MS);
          }
        }
        return g;
      }));

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      Object.values(gatherTimeoutsRef.current).forEach(clearTimeout);
      Object.values(attackTimeoutsRef.current).forEach(clearTimeout);
      Object.values(gruntAttackTimeoutsRef.current).forEach(clearTimeout);
      Object.values(repairTimeoutsRef.current).forEach(clearTimeout);
      gatherTimeoutsRef.current = {};
      attackTimeoutsRef.current = {};
      gruntAttackTimeoutsRef.current = {};
      repairTimeoutsRef.current = {};
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
      if (resources.gold < 50 || resources.food >= resources.foodCap) return;
      setResources(r => ({ ...r, gold: r.gold - 50, food: r.food + 1 }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [...ws, { ...makeSwordsman(newId, BARN_POS.x, BARN_POS.y), movingTo: path[0] ?? rp, path: path.slice(1), state: 'moving' as const }];
        }
        return [...ws, makeSwordsman(newId, BARN_POS.x, BARN_POS.y)];
      });
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
    } else if (action === 'trade:lumberToGold') {
      if (resources.lumber < 50) return;
      setResources(r => ({ ...r, lumber: r.lumber - 50, gold: r.gold + 30 }));
      addFloatingText(BARN_POS.x, BARN_POS.y, '+30🪙', '#fbbf24');
    } else if (action === 'trade:stoneToGold') {
      if (resources.stone < 30) return;
      setResources(r => ({ ...r, stone: r.stone - 30, gold: r.gold + 20 }));
      addFloatingText(BARN_POS.x, BARN_POS.y, '+20🪙', '#fbbf24');
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
      setWorkers(ws => ws.map(w => w.selected ? { ...w, movingTo: null, path: [], gathering: null, attacking: null, patrol: null, state: 'idle' } : w));
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

  const handleAttackEnemyBarn = (e: React.MouseEvent) => {
    e.preventDefault();
    if (enemyBarnHp <= 0 || !anySelected) return;
    const adjTile = { x: ENEMY_BARN_POS.x - 1, y: ENEMY_BARN_POS.y };
    commandMove(adjTile.x, adjTile.y, null, { targetType: 'enemyBarn' });
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

  const minimapData = useMemo(() => ({
    workers: workers.map(w => ({ x: w.x, y: w.y, selected: w.selected })),
    grunts: enemyGrunts.map(g => ({ x: g.x, y: g.y })),
    enemyBarnAlive: enemyBarnHp > 0,
  }), [workers, enemyGrunts, enemyBarnHp]);

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
            <button className="rounded-lg border-2 border-amber-500 bg-amber-500/20 px-8 py-3 text-lg text-amber-200 hover:bg-amber-500/40" onClick={() => { clearSave(); window.location.reload(); }}>
              Play Again
            </button>
          </div>
        );
      })()}

      {/* Wave announcement */}
      {waveAnnouncement && (
        <div style={{ position: 'absolute', top: '22%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(127,29,29,0.92)', color: '#fca5a5', fontSize: 28, fontWeight: 800, padding: '10px 32px', borderRadius: 12, zIndex: 25, pointerEvents: 'none', border: '2px solid #ef4444', letterSpacing: 1 }}>
          {waveAnnouncement}
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
        <span style={{ color: '#fde68a' }}>🪙 {resources.gold}</span>
        <span style={{ color: '#bbf7d0' }}>🌲 {resources.lumber}</span>
        <span style={{ color: '#cbd5e1' }}>🪨 {resources.stone}</span>
        {wave > 0 && <span style={{ color: '#f97316', background: 'rgba(249,115,22,0.15)', padding: '1px 10px', borderRadius: 6, fontSize: 14 }}>Wave {wave}</span>}
        {killCount > 0 && <span style={{ color: '#4ade80', fontSize: 14 }}>☠ {killCount}</span>}
        <span style={{ color: '#fca5a5', marginLeft: 'auto' }}>👥 {resources.food}/{resources.foodCap}</span>
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
        ) : (
          <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 400 }}>WASD pan · scroll zoom · Ctrl+1-9 groups · P patrol</span>
        )}
        <button onClick={doSave} style={{ background: saveStatus === 'saved' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: saveStatus === 'saved' ? '#4ade80' : '#94a3b8', padding: '2px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
          {saveStatus === 'saved' ? '✓ Saved' : '💾 Save'}
        </button>
        <button onClick={() => { clearSave(); window.location.reload(); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '2px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
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
                        return { ...w, patrol: { a, b: dest, heading: 'b' }, movingTo: p[0] ?? dest, path: p.slice(1), gathering: null, attacking: null, state: 'moving' };
                      }));
                      setPatrolMode(false);
                      return;
                    }
                    commandMove(i, j);
                  }}
                  style={{ cursor: buildMode ? 'crosshair' : patrolMode ? 'crosshair' : (anySelected || selectedType === 'farmhouse' ? 'pointer' : undefined) }}
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

          {/* Gold mine */}
          {goldMine.amount > 0 && (() => { const { x, y, amount } = goldMine; const { isoX, isoY } = tileToSvg(x, y);
            return <g key="gold-mine" style={{ cursor: 'pointer' }} onContextMenu={e => { e.preventDefault(); if (buildMode) return; commandMove(x, y, { type: 'gold', idx: 0 }); }}>
              <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 24} rx={28} ry={20} fill="#fde68a" stroke="#b45309" strokeWidth={4} />
              <text x={isoX + TILE_SIZE / 2} y={isoY + 32} textAnchor="middle" fontSize="16">⛏️</text>
              <rect x={isoX + TILE_SIZE / 2 - 28} y={isoY + 8} width={56} height={5} fill="#a16207" />
              <rect x={isoX + TILE_SIZE / 2 - 28} y={isoY + 8} width={56 * (amount / 100)} height={5} fill="#fde68a" />
            </g>; })()}

          {/* Placed buildings */}
          {placedBuildings.map(b => { const { isoX, isoY } = tileToSvg(b.x, b.y);
            if (b.type === 'wall') {
              return <g key={`building-${b.id}`} pointerEvents="none">
                {[0.15, 0.5, 0.85].map(f => (
                  <rect key={f} x={isoX + TILE_SIZE * 2 * f - 5} y={isoY + TILE_SIZE * 0.05} width={10} height={TILE_SIZE * 0.55} fill="#78350f" stroke="#451a03" strokeWidth={2} rx={2} />
                ))}
                <rect x={isoX + TILE_SIZE / 6} y={isoY + TILE_SIZE * 0.18} width={TILE_SIZE * 1.7} height={10} fill="#a16207" stroke="#451a03" strokeWidth={2} rx={3} />
                <rect x={isoX + TILE_SIZE / 6} y={isoY + TILE_SIZE * 0.33} width={TILE_SIZE * 1.7} height={10} fill="#92400e" stroke="#451a03" strokeWidth={2} rx={3} />
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
            const colors: Record<string, { fill: string; stroke: string }> = { farmhouse: { fill: '#fef3c7', stroke: '#92400e' }, lumberShed: { fill: '#a16207', stroke: '#78350f' }, watchtower: { fill: '#64748b', stroke: '#1e293b' } };
            const c = colors[b.type] ?? { fill: '#374151', stroke: '#1f2937' };
            return <g key={`building-${b.id}`}>
              <rect x={isoX + TILE_SIZE / 4} y={isoY} width={TILE_SIZE * 1.5} height={TILE_SIZE * 0.8} fill={c.fill} stroke={c.stroke} strokeWidth={3} rx={8} />
              <text x={isoX + TILE_SIZE} y={isoY + TILE_SIZE / 2} textAnchor="middle" fontSize="22">{BUILDING_EMOJI[b.type]}</text>
            </g>; })}

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
            return <g style={{ cursor: 'pointer' }}
              onClick={() => { if (!buildMode) { setSelectedType('farmhouse'); setWorkers(ws => ws.map(w => ({ ...w, selected: false }))); } }}
              onContextMenu={e => {
                e.preventDefault();
                if (anySelected && selectedType === 'worker') { handleGarrison(); return; }
                if (selectedType === 'farmhouse') { const coords = clientToSvg(e.clientX, e.clientY); if (coords) { const { tx, ty } = svgToTile(coords.x, coords.y); setRallyPoint({ x: tx, y: ty }); } }
              }}>
              <rect x={isoX} y={isoY} width={TILE_SIZE} height={TILE_SIZE} fill="#fde68a" stroke={hasGarrison ? '#22d3ee' : '#b45309'} strokeWidth={hasGarrison ? 5 : 6} rx={12} />
              <polygon points={[[isoX, isoY], [isoX + TILE_SIZE / 2, isoY - 32], [isoX + TILE_SIZE, isoY]].map(p => p.join(',')).join(' ')} fill="#b91c1c" stroke="#7f1d1d" strokeWidth={4} />
              <text x={isoX + TILE_SIZE / 2} y={isoY + 44} textAnchor="middle" fontSize="22">🏚️</text>
              <rect x={isoX - 8} y={isoY - 14} width={TILE_SIZE + 16} height={8} fill="#1e293b" rx={4} />
              <rect x={isoX - 8} y={isoY - 14} width={(TILE_SIZE + 16) * hpPct} height={8} fill={hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#fbbf24' : '#ef4444'} rx={4} />
              {hasGarrison && <>
                <circle cx={isoX + TILE_SIZE - 6} cy={isoY + 10} r={10} fill="#0c4a6e" stroke="#22d3ee" strokeWidth={2} />
                <text x={isoX + TILE_SIZE - 6} y={isoY + 14} textAnchor="middle" fontSize="10" fill="#7dd3fc" fontWeight="bold">{garrisoned.length}</text>
              </>}
            </g>; })()}

          {/* Enemy grunts */}
          {enemyGrunts.map(g => { const { isoX, isoY } = tileToSvg(g.x, g.y); const hp = g.hp / g.maxHp;
            return <g key={`grunt-${g.id}`} style={{ cursor: anySelected ? 'crosshair' : 'default' }} onContextMenu={e => handleAttackGrunt(g.id, e)}>
              <circle cx={isoX + TILE_SIZE / 2} cy={isoY + 18} r={16} fill={g.state === 'attacking' ? '#dc2626' : '#f97316'} stroke="#7f1d1d" strokeWidth={3} />
              <text x={isoX + TILE_SIZE / 2} y={isoY + 26} textAnchor="middle" fontSize="14">👹</text>
              <rect x={isoX + TILE_SIZE / 2 - 14} y={isoY - 4} width={28} height={4} fill="#1e293b" />
              <rect x={isoX + TILE_SIZE / 2 - 14} y={isoY - 4} width={28 * hp} height={4} fill="#ef4444" />
            </g>; })}

          {/* Workers */}
          {workers.map(worker => { const { isoX, isoY } = tileToSvg(worker.x, worker.y); const hp = worker.hp / worker.maxHp;
            return <g key={`worker-${worker.id}`}
              onClick={e => { e.stopPropagation(); if (!isDraggingRef.current && !buildMode) { setSelectedType('worker'); setWorkers(ws => ws.map(w => ({ ...w, selected: w.id === worker.id }))); } }}
              style={{ cursor: 'pointer' }}>
              {worker.selected && <ellipse cx={isoX + TILE_SIZE / 2} cy={isoY + 32} rx={worker.unitType === 'hero' ? 26 : worker.unitType === 'catapult' ? 28 : 22} ry={10} fill="none" stroke={worker.unitType === 'hero' ? '#fbbf24' : worker.unitType === 'catapult' ? '#ea580c' : worker.unitType === 'swordsman' ? '#f87171' : '#38bdf8'} strokeWidth={3} />}
              {worker.unitType === 'catapult' ? (
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
        buildMode={buildMode}
        upgrades={upgrades}
        onResearch={handleResearch}
        hasBarracks={placedBuildings.some(b => b.type === 'barracks')}
        garrisonedCount={garrisoned.length}
        garrisonCap={GARRISON_CAP}
        onGarrison={handleGarrison}
        onUngarrison={handleUngarrison}
        heroRecruited={heroRecruited}
        heroAbilityCooldown={heroAbilityCooldown}
        onHeroAbility={handleHeroAbility}
        onRecruitHero={() => handleFarmhouseAction('recruitHero')}
        hasSiegeWorkshop={placedBuildings.some(b => b.type === 'siegeWorkshop')}
        hasMarket={placedBuildings.some(b => b.type === 'market')}
        hasBlacksmith={placedBuildings.some(b => b.type === 'blacksmith')}
        blacksmithUpgrades={blacksmithUpgrades}
        onBlacksmithUpgrade={(type) => handleFarmhouseAction(`blacksmith:${type}`)}
        minimapData={minimapData}
        enemyBarnHp={enemyBarnHp}
        enemyBarnMaxHp={ENEMY_BARN_MAX_HP}
        playerBarnHp={playerBarnHp}
        playerBarnMaxHp={PLAYER_BARN_MAX_HP}
      />
    </div>
  );
};

export default RTSMap;
