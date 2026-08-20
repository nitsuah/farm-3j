'use client';
import { useState, useEffect, useRef, useMemo } from 'react';

import type { WorkerState, Upgrades } from '../RTSUI';
import {
  ARCHER_TOWER_POS,
  BARN_POS,
  BARN_VISION,
  BUILDING_MAX_HP,
  CREEP_CAMPS,
  CREEP_MAX_HP,
  ENEMY_BARN_MAX_HP,
  GRID_SIZE,
  PLAYER_BARN_MAX_HP,
} from '../game/constants';
import type {
  DroppedItem,
  EnemyGrunt,
  EnemyLurker,
  EnemyNecromancer,
  EnemySapper,
  EnemyShaman,
  EnemySiege,
  EnemyTower,
  EnemyTroll,
  EnemyWarchief,
  EnemyWarlord,
  EnemyWitchDoctor,
  HeroItem,
  LootCrate,
  NeutralCreep,
  PlacedBuilding,
  ResourceNode,
  Resources,
  SaveData,
  TileType,
} from '../game/types';
import { computeVisible, INITIAL_TILES } from '../game/map';
import { loadSave, loadSaveSync, type SaveSlot } from '../game/persistence';
import { makeUnit } from '../game/units';
import type { DifficultyConfig } from '../RTSGameRoot';

// ---------------------------------------------------------------------------
// Module-level constants (pure data, no React deps)
// ---------------------------------------------------------------------------

export const DEFAULT_TREES: ResourceNode[] = [
  // Starting cluster near barn (2,2)
  { x: 4, y: 2, amount: 80 },
  { x: 5, y: 2, amount: 80 },
  { x: 4, y: 3, amount: 80 },
  { x: 5, y: 3, amount: 80 },
  // Player-side mid cluster
  { x: 2, y: 10, amount: 70 },
  { x: 3, y: 10, amount: 70 },
  { x: 2, y: 11, amount: 70 },
  // West-mid cluster
  { x: 7, y: 4, amount: 70 },
  { x: 8, y: 4, amount: 70 },
  { x: 7, y: 5, amount: 70 },
  { x: 9, y: 4, amount: 70 },
  // SW cluster
  { x: 4, y: 16, amount: 70 },
  { x: 5, y: 16, amount: 70 },
  { x: 4, y: 17, amount: 70 },
  // NE cluster
  { x: 16, y: 4, amount: 70 },
  { x: 17, y: 4, amount: 70 },
  { x: 16, y: 5, amount: 70 },
  // Center cluster
  { x: 6, y: 15, amount: 70 },
  { x: 7, y: 15, amount: 70 },
  { x: 6, y: 16, amount: 70 },
  { x: 15, y: 6, amount: 70 },
  { x: 16, y: 6, amount: 70 },
  { x: 15, y: 7, amount: 70 },
  // Mid clusters
  { x: 9, y: 13, amount: 70 },
  { x: 10, y: 13, amount: 70 },
  { x: 9, y: 14, amount: 70 },
  { x: 13, y: 9, amount: 70 },
  { x: 14, y: 9, amount: 70 },
  { x: 13, y: 10, amount: 70 },
  // Deep mid / enemy approach
  { x: 11, y: 18, amount: 70 },
  { x: 12, y: 18, amount: 70 },
  { x: 11, y: 19, amount: 70 },
  { x: 18, y: 11, amount: 70 },
  { x: 19, y: 11, amount: 70 },
  { x: 18, y: 12, amount: 70 },
  // Enemy-side clusters
  { x: 20, y: 16, amount: 70 },
  { x: 21, y: 16, amount: 70 },
  { x: 20, y: 17, amount: 70 },
  { x: 16, y: 20, amount: 70 },
  { x: 17, y: 20, amount: 70 },
  { x: 16, y: 21, amount: 70 },
  { x: 22, y: 14, amount: 70 },
  { x: 23, y: 14, amount: 70 },
  { x: 14, y: 22, amount: 70 },
  { x: 14, y: 23, amount: 70 },
];

export const DEFAULT_GOLD_MINES: ResourceNode[] = [
  { x: 4, y: 5, amount: 250 }, // starting mine — close to barn
  { x: 1, y: 11, amount: 250 }, // secondary player-side mine
  { x: 3, y: 18, amount: 300 }, // SW expansion mine
  { x: 9, y: 3, amount: 250 }, // NE near mine
  { x: 12, y: 12, amount: 350 }, // contested center — high value, risky
  { x: 8, y: 20, amount: 300 }, // mid-south mine
  { x: 20, y: 8, amount: 300 }, // mid-north mine
  { x: 18, y: 18, amount: 300 }, // deep mid mine
  { x: 23, y: 12, amount: 250 }, // enemy-side north
  { x: 12, y: 23, amount: 250 }, // enemy-side west
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function makeWorker(id: number, x: number, y: number): WorkerState {
  return makeUnit(id, x, y, 'farmer');
}

export function makeCreeps(): NeutralCreep[] {
  let id = 1;
  return CREEP_CAMPS.flatMap(camp => [
    {
      id: id++,
      campId: camp.id,
      x: camp.x,
      y: camp.y,
      homeX: camp.x,
      homeY: camp.y,
      hp: CREEP_MAX_HP,
      maxHp: CREEP_MAX_HP,
      state: 'idle' as const,
      targetWorkerId: null,
    },
    {
      id: id++,
      campId: camp.id,
      x: camp.x + 1,
      y: camp.y,
      homeX: camp.x + 1,
      homeY: camp.y,
      hp: CREEP_MAX_HP,
      maxHp: CREEP_MAX_HP,
      state: 'idle' as const,
      targetWorkerId: null,
    },
  ]);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRTSGameState(
  slot: SaveSlot,
  difficulty: DifficultyConfig | undefined
) {
  // ---- Load save once per mount ----
  const saveRef = useRef<SaveData | null | undefined>(undefined);
  if (saveRef.current === undefined) saveRef.current = loadSaveSync(slot);
  const INITIAL_SAVE = saveRef.current;

  // Background cloud-save sync: if a newer cloud save exists, mirror it to
  // localStorage for the next session (does not affect current game state).
  useEffect(() => {
    void loadSave(slot);
  }, []); // intentional: only sync from cloud once on mount

  // ---- Tiles ----
  const tiles = useMemo<TileType[][]>(() => INITIAL_TILES, []);

  // ---- Fog ----
  const [fogExplored, setFogExplored] = useState<boolean[][]>(() => {
    const saved = INITIAL_SAVE?.fogExplored;
    if (saved && saved.length === GRID_SIZE && saved[0]?.length === GRID_SIZE)
      return saved;
    return computeVisible([{ x: BARN_POS.x, y: BARN_POS.y, r: BARN_VISION }]);
  });
  const fogExploredRef = useRef(fogExplored);
  const [fogVisible, setFogVisible] = useState<boolean[][]>(() =>
    computeVisible([{ x: BARN_POS.x, y: BARN_POS.y, r: BARN_VISION }])
  );
  const fogVisibleRef = useRef(fogVisible);
  useEffect(() => {
    fogExploredRef.current = fogExplored;
  }, [fogExplored]);
  useEffect(() => {
    fogVisibleRef.current = fogVisible;
  }, [fogVisible]);

  // ---- Buildings ----
  const [placedBuildings, setPlacedBuildings] = useState<PlacedBuilding[]>(() =>
    (INITIAL_SAVE?.placedBuildings ?? []).map((b: PlacedBuilding) =>
      b.hp != null
        ? b
        : {
            ...b,
            hp: BUILDING_MAX_HP[b.type] ?? 100,
            maxHp: BUILDING_MAX_HP[b.type] ?? 100,
          }
    )
  );
  const buildingIdRef = useRef(INITIAL_SAVE?.buildingNextId ?? 1);
  const placedBuildingsRef = useRef(placedBuildings);
  useEffect(() => {
    placedBuildingsRef.current = placedBuildings;
  }, [placedBuildings]);

  // ---- Resources ----
  const [resources, setResources] = useState<Resources>(
    () =>
      INITIAL_SAVE?.resources ?? {
        gold: difficulty?.startGold ?? 150,
        lumber: difficulty?.startLumber ?? 80,
        stone: difficulty?.startStone ?? 30,
        food: 5,
        foodCap: 10,
      }
  );

  // ---- Resource nodes ----
  const [trees, setTrees] = useState<ResourceNode[]>(
    () => INITIAL_SAVE?.trees ?? DEFAULT_TREES
  );
  const [goldMines, setGoldMines] = useState<ResourceNode[]>(
    () =>
      INITIAL_SAVE?.goldMines ??
      (INITIAL_SAVE?.goldMine ? [INITIAL_SAVE.goldMine] : DEFAULT_GOLD_MINES)
  );
  const [stoneNodes, setStoneNodes] = useState<ResourceNode[]>(
    () =>
      INITIAL_SAVE?.stoneNodes ?? [
        { x: 4, y: 1, amount: 180 },
        { x: 1, y: 4, amount: 180 },
        { x: 2, y: 15, amount: 160 },
        { x: 5, y: 13, amount: 160 },
        { x: 13, y: 2, amount: 160 },
        { x: 15, y: 4, amount: 160 },
        { x: 9, y: 9, amount: 180 },
        { x: 11, y: 7, amount: 160 },
        { x: 7, y: 11, amount: 160 },
        { x: 6, y: 20, amount: 160 },
        { x: 20, y: 6, amount: 160 },
        { x: 14, y: 14, amount: 180 },
        { x: 10, y: 22, amount: 160 },
        { x: 22, y: 10, amount: 160 },
        { x: 20, y: 20, amount: 160 },
        { x: 24, y: 18, amount: 160 },
        { x: 18, y: 24, amount: 160 },
      ]
  );
  const treesRef = useRef(trees);
  const goldMinesRef = useRef(goldMines);
  const stoneNodesRef = useRef(stoneNodes);
  useEffect(() => {
    treesRef.current = trees;
  }, [trees]);
  useEffect(() => {
    goldMinesRef.current = goldMines;
  }, [goldMines]);
  useEffect(() => {
    stoneNodesRef.current = stoneNodes;
  }, [stoneNodes]);

  // ---- Workers ----
  const [workers, setWorkers] = useState<WorkerState[]>(() => {
    if (INITIAL_SAVE?.workers?.length) {
      return INITIAL_SAVE.workers.map(w => ({
        ...makeUnit(w.id, w.x, w.y, w.unitType),
        hp: w.hp,
        maxHp: w.maxHp,
        group: w.group,
        xp: w.xp ?? 0,
        level: w.level ?? 0,
        gathering: w.gathering ?? null,
        state:
          w.state === 'gathering' ||
          w.state === 'moving' ||
          w.state === 'returning'
            ? (w.state as WorkerState['state'])
            : 'idle',
      }));
    }
    const goldMine = { x: 4, y: 5 };
    const tree0 = { x: 4, y: 2 };
    const tree1 = { x: 5, y: 2 };
    const mkGatherer = (
      id: number,
      sx: number,
      sy: number,
      gtype: 'gold' | 'tree',
      idx: number,
      dest: { x: number; y: number }
    ) => ({
      ...makeUnit(id, sx, sy, 'farmer'),
      gathering: { type: gtype, idx } as { type: 'gold' | 'tree'; idx: number },
      movingTo: dest,
      path: [] as { x: number; y: number }[],
      state: 'moving' as const,
    });
    return [
      { ...makeUnit(1, 3, 3, 'farmer'), selected: true },
      mkGatherer(2, 4, 3, 'gold', 0, goldMine),
      mkGatherer(3, 3, 4, 'gold', 0, goldMine),
      mkGatherer(4, 4, 4, 'tree', 0, tree0),
      mkGatherer(5, 5, 3, 'tree', 1, tree1),
    ];
  });
  const workersRef = useRef(workers);
  useEffect(() => {
    workersRef.current = workers;
  }, [workers]);

  // Tick down per-unit cooldowns every second
  useEffect(() => {
    const id = setInterval(() => {
      setWorkers(ws => {
        const hasCooldown = ws.some(
          w => w.chargeCooldown > 0 || w.sprintCooldown > 0
        );
        if (!hasCooldown) return ws;
        return ws.map(w =>
          w.chargeCooldown > 0 || w.sprintCooldown > 0
            ? {
                ...w,
                chargeCooldown: Math.max(0, w.chargeCooldown - 1),
                sprintCooldown: Math.max(0, w.sprintCooldown - 1),
              }
            : w
        );
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ---- Enemy grunts ----
  const [enemyGrunts, setEnemyGrunts] = useState<EnemyGrunt[]>([]);
  const enemyGruntsRef = useRef(enemyGrunts);
  useEffect(() => {
    enemyGruntsRef.current = enemyGrunts;
  }, [enemyGrunts]);
  const gruntIdRef = useRef(1);
  const gruntAttackTimeoutsRef = useRef<Record<number, number>>({});

  // ---- Neutral creeps ----
  const [neutralCreeps, setNeutralCreeps] = useState<NeutralCreep[]>(() =>
    makeCreeps()
  );
  const neutralCreepsRef = useRef(neutralCreeps);
  useEffect(() => {
    neutralCreepsRef.current = neutralCreeps;
  }, [neutralCreeps]);
  const [clearedCamps, setClearedCamps] = useState<Set<number>>(
    () => new Set()
  );
  const campClearedAtRef = useRef<Record<number, number>>({});
  const creepAttackTimeoutsRef = useRef<Record<number, number>>({});
  const creepIdCounterRef = useRef(1000);

  // ---- Wave / tick ----
  const [wave, setWave] = useState(() => INITIAL_SAVE?.wave ?? 0);
  const waveRef = useRef(INITIAL_SAVE?.wave ?? 0);
  useEffect(() => {
    waveRef.current = wave;
  }, [wave]);
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // ---- Enemy towers & walls ----
  const [enemyTowers, setEnemyTowers] = useState<EnemyTower[]>(() => [
    {
      id: -1,
      x: ARCHER_TOWER_POS.x,
      y: ARCHER_TOWER_POS.y,
      hp: 120,
      maxHp: 120,
    },
  ]);
  const enemyTowersRef = useRef<EnemyTower[]>([]);
  useEffect(() => {
    enemyTowersRef.current = enemyTowers;
  }, [enemyTowers]);
  const enemyTowerTimersRef = useRef<Record<number, number>>({});
  const [enemyWalls, setEnemyWalls] = useState<EnemyTower[]>([]);
  const enemyWallsRef = useRef<EnemyTower[]>([]);
  useEffect(() => {
    enemyWallsRef.current = enemyWalls;
  }, [enemyWalls]);
  const enemyWallIdRef = useRef(7000);

  // ---- Enemy siege ----
  const [enemySiege, setEnemySiege] = useState<EnemySiege[]>([]);
  const enemySiegeRef = useRef<EnemySiege[]>([]);
  useEffect(() => {
    enemySiegeRef.current = enemySiege;
  }, [enemySiege]);
  const siegeIdRef = useRef(1000);

  // ---- Enemy shamans ----
  const [enemyShamans, setEnemyShamans] = useState<EnemyShaman[]>([]);
  const enemyShamansRef = useRef<EnemyShaman[]>([]);
  useEffect(() => {
    enemyShamansRef.current = enemyShamans;
  }, [enemyShamans]);
  const shamanIdRef = useRef(2000);
  const shamanHealTimersRef = useRef<Record<number, number>>({});

  // ---- Enemy necromancers ----
  const [enemyNecromancers, setEnemyNecromancers] = useState<
    EnemyNecromancer[]
  >([]);
  const enemyNecromancersRef = useRef<EnemyNecromancer[]>([]);
  useEffect(() => {
    enemyNecromancersRef.current = enemyNecromancers;
  }, [enemyNecromancers]);
  const necromancerIdRef = useRef(7000);
  const necromancerRaiseTimersRef = useRef<Record<number, number>>({});

  // ---- Enemy witch doctors ----
  const [enemyWitchDoctors, setEnemyWitchDoctors] = useState<
    EnemyWitchDoctor[]
  >([]);
  const enemyWitchDoctorsRef = useRef<EnemyWitchDoctor[]>([]);
  useEffect(() => {
    enemyWitchDoctorsRef.current = enemyWitchDoctors;
  }, [enemyWitchDoctors]);
  const witchDoctorIdRef = useRef(8000);
  const witchDoctorBuffTimersRef = useRef<Record<number, number>>({});

  // ---- Enemy warchiefs ----
  const [enemyWarchiefs, setEnemyWarchiefs] = useState<EnemyWarchief[]>([]);
  const enemyWarchiefsRef = useRef<EnemyWarchief[]>([]);
  useEffect(() => {
    enemyWarchiefsRef.current = enemyWarchiefs;
  }, [enemyWarchiefs]);
  const warchiefIdRef = useRef(9000);

  // ---- Enemy warlords ----
  const [enemyWarlords, setEnemyWarlords] = useState<EnemyWarlord[]>([]);
  const enemyWarlordsRef = useRef<EnemyWarlord[]>([]);
  useEffect(() => {
    enemyWarlordsRef.current = enemyWarlords;
  }, [enemyWarlords]);
  const warlordIdRef = useRef(10000);

  // ---- Enemy lurkers ----
  const [enemyLurkers, setEnemyLurkers] = useState<EnemyLurker[]>([]);
  const enemyLurkersRef = useRef<EnemyLurker[]>([]);
  useEffect(() => {
    enemyLurkersRef.current = enemyLurkers;
  }, [enemyLurkers]);
  const lurkerIdRef = useRef(11000);
  const lurkerAttackTimeoutsRef = useRef<Record<number, number>>({});

  // ---- Enemy trolls ----
  const [enemyTrolls, setEnemyTrolls] = useState<EnemyTroll[]>([]);
  const enemyTrollsRef = useRef<EnemyTroll[]>([]);
  useEffect(() => {
    enemyTrollsRef.current = enemyTrolls;
  }, [enemyTrolls]);
  const trollIdRef = useRef(3000);
  const trollAttackTimersRef = useRef<Record<number, number>>({});

  // ---- Enemy sappers ----
  const [enemySappers, setEnemySappers] = useState<EnemySapper[]>([]);
  const enemySappersRef = useRef<EnemySapper[]>([]);
  useEffect(() => {
    enemySappersRef.current = enemySappers;
  }, [enemySappers]);
  const sapperIdRef = useRef(4000);

  // ---- Dead unit positions ----
  const [deadGruntPositions, setDeadGruntPositions] = useState<
    { x: number; y: number; t: number }[]
  >([]);
  const deadGruntPositionsRef = useRef<{ x: number; y: number; t: number }[]>(
    []
  );
  useEffect(() => {
    deadGruntPositionsRef.current = deadGruntPositions;
  }, [deadGruntPositions]);
  const [deadWorkerPositions, setDeadWorkerPositions] = useState<
    { x: number; y: number; t: number; unitType: string }[]
  >([]);
  const deadWorkerIdsRef = useRef<Set<number>>(new Set());

  // ---- Loot crates ----
  const [lootCrates, setLootCrates] = useState<LootCrate[]>([]);
  const lootCratesRef = useRef<LootCrate[]>([]);
  useEffect(() => {
    lootCratesRef.current = lootCrates;
  }, [lootCrates]);
  const lootCrateIdRef = useRef(5000);

  // ---- Hero items ----
  const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
  const heroItemsRef = useRef<HeroItem[]>([]);
  useEffect(() => {
    heroItemsRef.current = heroItems;
  }, [heroItems]);

  // ---- Dropped items ----
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const droppedItemsRef = useRef<DroppedItem[]>([]);
  useEffect(() => {
    droppedItemsRef.current = droppedItems;
  }, [droppedItems]);
  const dropItemIdRef = useRef(9000);

  // ---- Pending pickup ----
  const pendingPickupRef = useRef<Set<number>>(new Set());

  // ---- Wave announcements ----
  const [waveAnnouncement, setWaveAnnouncement] = useState<string | null>(null);
  const [wavePreview, setWavePreview] = useState<string | null>(null);
  const previewTimerRef = useRef<number | null>(null);

  // ---- Game over ----
  const [gameOver, setGameOver] = useState<'victory' | 'defeat' | null>(null);
  const gameOverRef = useRef<'victory' | 'defeat' | null>(null);
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  // ---- Spawn / wave timers ----
  const spawnTimerRef = useRef<number | null>(null);
  const [nextWaveAt, setNextWaveAt] = useState<number | null>(null);
  const nextWaveAtRef = useRef<number | null>(null);
  useEffect(() => {
    nextWaveAtRef.current = nextWaveAt;
  }, [nextWaveAt]);
  const waveTimerRemainingRef = useRef<number | null>(null);

  // ---- Shrines ----
  const [capturedShrines, setCapturedShrines] = useState<Set<number>>(
    new Set()
  );
  const capturedShrinesRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    capturedShrinesRef.current = capturedShrines;
  }, [capturedShrines]);
  const [shrineCapturing, setShrineCapturing] = useState<{
    shrineId: number;
    workerId: number;
    startedAt: number;
  } | null>(null);
  const shrineCapturingRef = useRef<{
    shrineId: number;
    workerId: number;
    startedAt: number;
  } | null>(null);
  useEffect(() => {
    shrineCapturingRef.current = shrineCapturing;
  }, [shrineCapturing]);
  const [shrineWarBuff, setShrineWarBuff] = useState(false);
  const shrineWarBuffRef = useRef(false);
  useEffect(() => {
    shrineWarBuffRef.current = shrineWarBuff;
  }, [shrineWarBuff]);
  const [shrinePlentyBuff, setShrinePlentyBuff] = useState(false);
  const shrinePlentyBuffRef = useRef(false);
  useEffect(() => {
    shrinePlentyBuffRef.current = shrinePlentyBuff;
  }, [shrinePlentyBuff]);

  // ---- Game speed ----
  const [gameSpeed, setGameSpeed] = useState(0);
  const gameSpeedRef = useRef(0);
  useEffect(() => {
    gameSpeedRef.current = gameSpeed;
  }, [gameSpeed]);

  // ---- Barn damage tracking ----
  const barnDmgThisWaveRef = useRef(0);
  const sallyForthThresholdsRef = useRef<Set<number>>(new Set([150, 100, 50]));
  const lastStandEnrageRef = useRef(false);

  // ---- Enemy barn HP ----
  const [enemyBarnHp, setEnemyBarnHp] = useState(
    () => INITIAL_SAVE?.enemyBarnHp ?? ENEMY_BARN_MAX_HP
  );
  const enemyBarnHpRef = useRef(INITIAL_SAVE?.enemyBarnHp ?? ENEMY_BARN_MAX_HP);
  useEffect(() => {
    enemyBarnHpRef.current = enemyBarnHp;
  }, [enemyBarnHp]);

  // ---- Player barn HP ----
  const [playerBarnHp, setPlayerBarnHp] = useState(
    () => INITIAL_SAVE?.playerBarnHp ?? PLAYER_BARN_MAX_HP
  );
  const playerBarnHpRef = useRef(
    INITIAL_SAVE?.playerBarnHp ?? PLAYER_BARN_MAX_HP
  );
  useEffect(() => {
    playerBarnHpRef.current = playerBarnHp;
  }, [playerBarnHp]);

  // ---- Garrison ----
  const [garrisoned, setGarrisoned] = useState<WorkerState[]>([]);
  const garrisonedRef = useRef(garrisoned);
  useEffect(() => {
    garrisonedRef.current = garrisoned;
  }, [garrisoned]);

  // Tower garrison: maps tower building id → garrisoned units (max 3)
  const [towerGarrison, setTowerGarrison] = useState<
    Record<number, WorkerState[]>
  >({});
  const towerGarrisonRef = useRef(towerGarrison);
  useEffect(() => {
    towerGarrisonRef.current = towerGarrison;
  }, [towerGarrison]);

  // ---- Hero state ----
  const [heroRecruited, setHeroRecruited] = useState(false);
  const [heroReviveAt, setHeroReviveAt] = useState<number | null>(null);
  const [heroReviveCountdown, setHeroReviveCountdown] = useState(0);
  const heroXpRef = useRef<{ xp: number; level: number } | null>(null);
  const [heroAbilityCooldown, setHeroAbilityCooldown] = useState(0);
  useEffect(() => {
    if (heroAbilityCooldown <= 0) return;
    const id = setInterval(
      () => setHeroAbilityCooldown(c => Math.max(0, c - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [heroAbilityCooldown > 0]); // eslint-disable-line
  const [heroShoutCooldown, setHeroShoutCooldown] = useState(0);
  useEffect(() => {
    if (heroShoutCooldown <= 0) return;
    const id = setInterval(
      () => setHeroShoutCooldown(c => Math.max(0, c - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [heroShoutCooldown > 0]); // eslint-disable-line

  // ---- Battle shout ----
  const [battleShoutUntil, setBattleShoutUntil] = useState(0);
  const battleShoutUntilRef = useRef(0);
  useEffect(() => {
    battleShoutUntilRef.current = battleShoutUntil;
  }, [battleShoutUntil]);

  // ---- Harvest boon / earthquake ----
  const [harvestBoonCooldown, setHarvestBoonCooldown] = useState(0);
  const [harvestBoonActive, setHarvestBoonActive] = useState(false);
  const [earthquakeCooldown, setEarthquakeCooldown] = useState(0);
  const [earthquakeEffect, setEarthquakeEffect] = useState<{
    x: number;
    y: number;
    at: number;
  } | null>(null);
  const harvestBoonRef = useRef(false);
  useEffect(() => {
    harvestBoonRef.current = harvestBoonActive;
  }, [harvestBoonActive]);
  useEffect(() => {
    if (harvestBoonCooldown <= 0) return;
    const id = setInterval(
      () => setHarvestBoonCooldown(c => Math.max(0, c - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [harvestBoonCooldown > 0]); // eslint-disable-line
  useEffect(() => {
    if (earthquakeCooldown <= 0) return;
    const id = setInterval(
      () => setEarthquakeCooldown(c => Math.max(0, c - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [earthquakeCooldown > 0]); // eslint-disable-line

  // ---- Kill / resource totals ----
  const [killCount, setKillCount] = useState(
    () => INITIAL_SAVE?.killCount ?? 0
  );
  const [totalGold, setTotalGold] = useState(
    () => INITIAL_SAVE?.totalGold ?? 0
  );
  const [totalLumber, setTotalLumber] = useState(
    () => INITIAL_SAVE?.totalLumber ?? 0
  );
  const [totalStone, setTotalStone] = useState(
    () => INITIAL_SAVE?.totalStone ?? 0
  );

  // ---- Farmhouse ----
  const [farmhouse, setFarmhouse] = useState<{ built: boolean; level: number }>(
    () => INITIAL_SAVE?.farmhouse ?? { built: false, level: 0 }
  );

  // ---- Rally point ----
  const [rallyPoint, setRallyPoint] = useState<{
    x: number;
    y: number;
  } | null>(() => INITIAL_SAVE?.rallyPoint ?? null);
  const rallyPointRef = useRef(rallyPoint);
  useEffect(() => {
    rallyPointRef.current = rallyPoint;
  }, [rallyPoint]);

  // ---- Stance ----
  const [stance, setStance] = useState<'aggressive' | 'passive'>('aggressive');
  const stanceRef = useRef<'aggressive' | 'passive'>('aggressive');
  useEffect(() => {
    stanceRef.current = stance;
  }, [stance]);

  // ---- Upgrades ----
  const [upgrades, setUpgrades] = useState<Upgrades>(
    () =>
      INITIAL_SAVE?.upgrades ?? {
        sharperTools: 0,
        swiftHarvest: 0,
        ironWill: 0,
      }
  );
  const upgradesRef = useRef(upgrades);
  useEffect(() => {
    upgradesRef.current = upgrades;
  }, [upgrades]);

  // ---- Blacksmith upgrades ----
  const [blacksmithUpgrades, setBlacksmithUpgrades] = useState(
    () => INITIAL_SAVE?.blacksmithUpgrades ?? { steelEdge: 0, ironHide: 0 }
  );
  const blacksmithUpgradesRef = useRef(blacksmithUpgrades);
  useEffect(() => {
    blacksmithUpgradesRef.current = blacksmithUpgrades;
  }, [blacksmithUpgrades]);

  // ---- Guard tower research ----
  const [guardTowerResearched, setGuardTowerResearched] = useState(
    () => INITIAL_SAVE?.guardTowerResearched ?? false
  );
  const guardTowerRef = useRef(guardTowerResearched);
  useEffect(() => {
    guardTowerRef.current = guardTowerResearched;
  }, [guardTowerResearched]);

  // ---- Barracks tech ----
  const [barracksTech, setBarracksTech] = useState(
    () =>
      INITIAL_SAVE?.barracksTech ?? {
        veteranTraining: false,
        warDrums: false,
      }
  );
  const barracksTechRef = useRef(barracksTech);
  useEffect(() => {
    barracksTechRef.current = barracksTech;
  }, [barracksTech]);

  // ---- Upkeep ----
  const upkeepPct =
    resources.foodCap > 0 ? resources.food / resources.foodCap : 0;
  const upkeepMult = upkeepPct <= 0.5 ? 1 : upkeepPct <= 0.8 ? 0.7 : 0.4;
  const upkeepMultRef = useRef(upkeepMult);
  useEffect(() => {
    upkeepMultRef.current = upkeepMult;
  }, [upkeepMult]);

  // ---- Training queue ----
  const [trainingQueue, setTrainingQueue] = useState<
    { type: 'swordsman' | 'cavalry' }[]
  >([]);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const trainingQueueRef = useRef<{ type: 'swordsman' | 'cavalry' }[]>([]);
  const trainingElapsedRef = useRef(0);
  useEffect(() => {
    trainingQueueRef.current = trainingQueue;
  }, [trainingQueue]);

  // ---- Night ref (used by gameplay hooks via context) ----
  const isNightRef = useRef(false);

  // ---- Misc income / tracking refs ----
  const incomeAccRef = useRef({ gold: 0, lumber: 0, stone: 0 });
  const sapperKillCountRef = useRef<number>(0);

  // ---- Timer / timeout refs ----
  const gatherTimeoutsRef = useRef<Record<number, number>>({});
  const attackTimeoutsRef = useRef<Record<number, number>>({});
  const repairTimeoutsRef = useRef<Record<number, number>>({});
  const watchtowerTimersRef = useRef<Record<number, number>>({});
  const trapTriggeredRef = useRef<Record<number, number>>({});
  const buildingAttackTimeoutsRef = useRef<Record<number, number>>({});
  const siegeAttackTimeoutsRef = useRef<Record<number, number>>({});
  const buildingRepairTimeoutsRef = useRef<Record<number, number>>({});

  // ---- Animation / fog refs ----
  const animationRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);
  const lastFogUpdateRef = useRef<number>(0);

  // ---- Hit-flash refs ----
  const workerHitRef = useRef<Map<number, number>>(new Map());
  const gruntHitRef = useRef<Map<number, number>>(new Map());

  // ---------------------------------------------------------------------------
  // Return all state, setters, and refs
  // ---------------------------------------------------------------------------
  return {
    // Save
    INITIAL_SAVE,
    // Tiles
    tiles,
    // Fog
    fogExplored,
    setFogExplored,
    fogExploredRef,
    fogVisible,
    setFogVisible,
    fogVisibleRef,
    // Buildings
    placedBuildings,
    setPlacedBuildings,
    buildingIdRef,
    placedBuildingsRef,
    // Resources
    resources,
    setResources,
    // Resource nodes
    trees,
    setTrees,
    treesRef,
    goldMines,
    setGoldMines,
    goldMinesRef,
    stoneNodes,
    setStoneNodes,
    stoneNodesRef,
    // Workers
    workers,
    setWorkers,
    workersRef,
    // Enemy grunts
    enemyGrunts,
    setEnemyGrunts,
    enemyGruntsRef,
    gruntIdRef,
    gruntAttackTimeoutsRef,
    // Neutral creeps
    neutralCreeps,
    setNeutralCreeps,
    neutralCreepsRef,
    clearedCamps,
    setClearedCamps,
    campClearedAtRef,
    creepAttackTimeoutsRef,
    creepIdCounterRef,
    // Wave
    wave,
    setWave,
    waveRef,
    // Enemy towers & walls
    enemyTowers,
    setEnemyTowers,
    enemyTowersRef,
    enemyTowerTimersRef,
    enemyWalls,
    setEnemyWalls,
    enemyWallsRef,
    enemyWallIdRef,
    // Enemy siege
    enemySiege,
    setEnemySiege,
    enemySiegeRef,
    siegeIdRef,
    // Enemy shamans
    enemyShamans,
    setEnemyShamans,
    enemyShamansRef,
    shamanIdRef,
    shamanHealTimersRef,
    // Enemy necromancers
    enemyNecromancers,
    setEnemyNecromancers,
    enemyNecromancersRef,
    necromancerIdRef,
    necromancerRaiseTimersRef,
    // Enemy witch doctors
    enemyWitchDoctors,
    setEnemyWitchDoctors,
    enemyWitchDoctorsRef,
    witchDoctorIdRef,
    witchDoctorBuffTimersRef,
    // Enemy warchiefs
    enemyWarchiefs,
    setEnemyWarchiefs,
    enemyWarchiefsRef,
    warchiefIdRef,
    // Enemy warlords
    enemyWarlords,
    setEnemyWarlords,
    enemyWarlordsRef,
    warlordIdRef,
    // Enemy lurkers
    enemyLurkers,
    setEnemyLurkers,
    enemyLurkersRef,
    lurkerIdRef,
    lurkerAttackTimeoutsRef,
    // Enemy trolls
    enemyTrolls,
    setEnemyTrolls,
    enemyTrollsRef,
    trollIdRef,
    trollAttackTimersRef,
    // Enemy sappers
    enemySappers,
    setEnemySappers,
    enemySappersRef,
    sapperIdRef,
    // Dead positions
    deadGruntPositions,
    setDeadGruntPositions,
    deadGruntPositionsRef,
    deadWorkerPositions,
    setDeadWorkerPositions,
    deadWorkerIdsRef,
    // Loot
    lootCrates,
    setLootCrates,
    lootCratesRef,
    lootCrateIdRef,
    // Hero items
    heroItems,
    setHeroItems,
    heroItemsRef,
    // Dropped items
    droppedItems,
    setDroppedItems,
    droppedItemsRef,
    dropItemIdRef,
    pendingPickupRef,
    // Wave announcements
    waveAnnouncement,
    setWaveAnnouncement,
    wavePreview,
    setWavePreview,
    previewTimerRef,
    // Game over
    gameOver,
    setGameOver,
    gameOverRef,
    // Wave timers
    spawnTimerRef,
    nextWaveAt,
    setNextWaveAt,
    nextWaveAtRef,
    waveTimerRemainingRef,
    // Shrines
    capturedShrines,
    setCapturedShrines,
    capturedShrinesRef,
    shrineCapturing,
    setShrineCapturing,
    shrineCapturingRef,
    shrineWarBuff,
    setShrineWarBuff,
    shrineWarBuffRef,
    shrinePlentyBuff,
    setShrinePlentyBuff,
    shrinePlentyBuffRef,
    // Game speed
    gameSpeed,
    setGameSpeed,
    gameSpeedRef,
    // Barn
    barnDmgThisWaveRef,
    sallyForthThresholdsRef,
    lastStandEnrageRef,
    enemyBarnHp,
    setEnemyBarnHp,
    enemyBarnHpRef,
    playerBarnHp,
    setPlayerBarnHp,
    playerBarnHpRef,
    // Garrison
    garrisoned,
    setGarrisoned,
    garrisonedRef,
    towerGarrison,
    setTowerGarrison,
    towerGarrisonRef,
    // Hero
    heroRecruited,
    setHeroRecruited,
    heroReviveAt,
    setHeroReviveAt,
    heroReviveCountdown,
    setHeroReviveCountdown,
    heroXpRef,
    heroAbilityCooldown,
    setHeroAbilityCooldown,
    heroShoutCooldown,
    setHeroShoutCooldown,
    // Battle shout
    battleShoutUntil,
    setBattleShoutUntil,
    battleShoutUntilRef,
    // Harvest boon / earthquake
    harvestBoonCooldown,
    setHarvestBoonCooldown,
    harvestBoonActive,
    setHarvestBoonActive,
    harvestBoonRef,
    earthquakeCooldown,
    setEarthquakeCooldown,
    earthquakeEffect,
    setEarthquakeEffect,
    // Totals
    killCount,
    setKillCount,
    totalGold,
    setTotalGold,
    totalLumber,
    setTotalLumber,
    totalStone,
    setTotalStone,
    // Farmhouse
    farmhouse,
    setFarmhouse,
    // Rally point
    rallyPoint,
    setRallyPoint,
    rallyPointRef,
    // Stance
    stance,
    setStance,
    stanceRef,
    // Upgrades
    upgrades,
    setUpgrades,
    upgradesRef,
    // Blacksmith
    blacksmithUpgrades,
    setBlacksmithUpgrades,
    blacksmithUpgradesRef,
    // Guard tower
    guardTowerResearched,
    setGuardTowerResearched,
    guardTowerRef,
    // Barracks tech
    barracksTech,
    setBarracksTech,
    barracksTechRef,
    // Upkeep
    upkeepPct,
    upkeepMult,
    upkeepMultRef,
    // Training
    trainingQueue,
    setTrainingQueue,
    trainingQueueRef,
    trainingElapsedRef,
    trainingProgress,
    setTrainingProgress,
    // Night ref
    isNightRef,
    // Income / tracking
    incomeAccRef,
    sapperKillCountRef,
    // Timer refs
    gatherTimeoutsRef,
    attackTimeoutsRef,
    repairTimeoutsRef,
    watchtowerTimersRef,
    trapTriggeredRef,
    buildingAttackTimeoutsRef,
    siegeAttackTimeoutsRef,
    buildingRepairTimeoutsRef,
    // Animation
    animationRef,
    prevTimeRef,
    lastFogUpdateRef,
    // Hit flash
    workerHitRef,
    gruntHitRef,
  };
}

export type RTSGameStateReturn = ReturnType<typeof useRTSGameState>;
