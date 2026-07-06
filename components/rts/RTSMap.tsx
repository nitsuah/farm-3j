'use client';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';

import {
  RTSUI,
  WorkerState,
  Upgrades,
  UPGRADE_COSTS,
  UPGRADE_MAX,
  FarmhouseAction,
} from './RTSUI';

import {
  ARCHER_TOWER_POS,
  ATTACK_DAMAGE,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
  BARN_POS,
  BARN_VISION,
  BUILDING_COSTS,
  BUILDING_MAX_HP,
  BUILDING_REQUIRES,
  CAVALRY_SPRINT_COOLDOWN_S,
  CAVALRY_SPRINT_DURATION_MS,
  CREEP_CAMPS,
  CREEP_MAX_HP,
  EARTHQUAKE_COOLDOWN_S,
  EARTHQUAKE_DAMAGE,
  EARTHQUAKE_RADIUS,
  EARTHQUAKE_STUN_MS,
  ENEMY_BARN_MAX_HP,
  ENEMY_BARN_POS,
  FOOD_CAP_BASE,
  FOOD_CAP_PER_LEVEL,
  GARRISON_CAP,
  GRID_SIZE,
  HERO_ABILITY_COOLDOWN_S,
  HERO_ABILITY_DAMAGE,
  HERO_ABILITY_RADIUS,
  HERO_ITEM_DATA,
  HERO_MAX_HP,
  HERO_MAX_ITEMS,
  HERO_SHOUT_COOLDOWN_S,
  HERO_SHOUT_DURATION_MS,
  HERO_SHOUT_RADIUS,
  PLAYER_BARN_MAX_HP,
  SWORDSMAN_CHARGE_COOLDOWN_S,
  SWORDSMAN_CHARGE_DAMAGE_MULT,
  SWORDSMAN_DAMAGE_BONUS,
  TILE_SIZE,
  VETERAN_HP_BONUS,
  XP_TO_LEVEL_1,
  XP_TO_LEVEL_2,
  XP_TO_LEVEL_3,
} from './game/constants';
import type {
  BuildingType,
  DroppedItem,
  EnemyGrunt,
  EnemyNecromancer,
  EnemySapper,
  EnemyShaman,
  EnemySiege,
  EnemyTower,
  EnemyTroll,
  EnemyLurker,
  EnemyWarchief,
  EnemyWarlord,
  EnemyWitchDoctor,
  FloatingText,
  HeroItem,
  HeroItemId,
  LootCrate,
  NeutralCreep,
  PlacedBuilding,
  Projectile,
  ResourceNode,
  Resources,
  SaveData,
} from './game/types';
import {
  computeVisible,
  INITIAL_TILES,
  svgToTile,
  tileDist,
  tileToSvg,
} from './game/map';
import { aStar } from './game/pathfinding';
import {
  ALL_ACHIEVEMENTS,
  unlockAchievement,
  type Achievement,
} from './game/achievements';
import {
  loadSave,
  saveHighScore,
  writeSave,
  type SaveSlot,
} from './game/persistence';
import { makeUnit } from './game/units';
import {
  ACK_ATTACK,
  ACK_MOVE,
  getSoundMuted,
  pickAck,
  setSoundMuted,
  startAmbient,
  stopAmbient,
  Snd,
} from './game/sound';
import { AchievementPanel } from './hud/AchievementPanel';
import { AlertsOverlay } from './hud/AlertsOverlay';
import { BuffIndicators } from './hud/BuffIndicators';
import { ControlGroupBar } from './hud/ControlGroupBar';
import { ControlGroupChips } from './hud/ControlGroupChips';
import { DamageLogPanel } from './hud/DamageLogPanel';
import { GameOverOverlay } from './hud/GameOverOverlay';
import { MinimapPanel } from './hud/MinimapPanel';
import { ResourceBar } from './hud/ResourceBar';
import { BuildingsLayer } from './map/BuildingsLayer';
import { EffectsLayer } from './map/EffectsLayer';
import { EnemyBaseLayer } from './map/EnemyBaseLayer';
import { EnemyEliteLayer } from './map/EnemyEliteLayer';
import { EnemyGruntsLayer } from './map/EnemyGruntsLayer';
import { EnemySiegeCastersLayer } from './map/EnemySiegeCastersLayer';
import { NeutralLayer } from './map/NeutralLayer';
import { OverlayRingsLayer } from './map/OverlayRingsLayer';
import { PlayerBarnLayer } from './map/PlayerBarnLayer';
import { ResourceNodesLayer } from './map/ResourceNodesLayer';
import { TerrainLayer } from './map/TerrainLayer';
import { WorkersLayer } from './map/WorkersLayer';
import { useGameLoop } from './hooks/useGameLoop';
import { useProduction } from './hooks/useProduction';
import { useTowerCombat } from './hooks/useTowerCombat';
import { useWaveSpawner } from './hooks/useWaveSpawner';
import { useWorldTicks } from './hooks/useWorldTicks';
import {
  useBotController,
  type BotCommands,
  type BotSnapshot,
} from './hooks/useBotController';

// Re-exported for backwards compatibility — previously defined in this file.
export { BUILDING_REQUIRES } from './game/constants';

import type { DifficultyConfig } from './RTSGameRoot';

const RTSMap: React.FC<{
  onNewGame?: () => void;
  difficulty?: DifficultyConfig;
  slot?: SaveSlot;
}> = ({ onNewGame, difficulty, slot = 0 }) => {
  // Load save once per mount (module-level caching caused stale data after New Game)
  const saveRef = useRef<SaveData | null | undefined>(undefined);
  if (saveRef.current === undefined) saveRef.current = loadSave(slot);
  const INITIAL_SAVE = saveRef.current;

  const [zoom, setZoom] = useState(1);
  const tiles = useMemo(() => INITIAL_TILES, []);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [screenShake, setScreenShake] = useState(0);
  const screenShakeTimerRef = useRef<number | null>(null);
  const triggerShake = useCallback((magnitude = 1) => {
    setScreenShake(magnitude);
    if (screenShakeTimerRef.current) clearTimeout(screenShakeTimerRef.current);
    screenShakeTimerRef.current = window.setTimeout(
      () => setScreenShake(0),
      350
    );
  }, []);
  const triggerShakeRef = useRef(triggerShake);
  useEffect(() => {
    triggerShakeRef.current = triggerShake;
  }, [triggerShake]);
  const svgRef = useRef<SVGSVGElement>(null);
  const [soundMuted, setSoundMutedState] = useState(getSoundMuted);
  const toggleMute = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setSoundMutedState(next);
  };

  const [fogExplored, setFogExplored] = useState<boolean[][]>(() => {
    const saved = INITIAL_SAVE?.fogExplored;
    // Validate fog matches current GRID_SIZE — discard if wrong dimensions
    if (saved && saved.length === GRID_SIZE && saved[0]?.length === GRID_SIZE)
      return saved;
    return computeVisible([{ x: BARN_POS.x, y: BARN_POS.y, r: BARN_VISION }]);
  });
  const fogExploredRef = useRef(fogExplored);
  // fogVisible: currently-visible tiles (for rendering enemy units in/out of fog)
  const [fogVisible, setFogVisible] = useState<boolean[][]>(() =>
    computeVisible([{ x: BARN_POS.x, y: BARN_POS.y, r: BARN_VISION }])
  );
  const fogVisibleRef = useRef(fogVisible);
  const [dragBox, setDragBox] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);
  const isDraggingRef = useRef(false);
  const [buildMode, setBuildMode] = useState<BuildingType | null>(null);
  const [ghostTile, setGhostTile] = useState<{ x: number; y: number } | null>(
    null
  );
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
  useEffect(() => {
    fogExploredRef.current = fogExplored;
  }, [fogExplored]);
  useEffect(() => {
    fogVisibleRef.current = fogVisible;
  }, [fogVisible]);
  const [controlGroups, setControlGroups] = useState<Record<number, number[]>>(
    {}
  );
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

  const DEFAULT_TREES: ResourceNode[] = [
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
  const DEFAULT_GOLD_MINES: ResourceNode[] = [
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
        // Player corner
        { x: 4, y: 1, amount: 180 },
        { x: 1, y: 4, amount: 180 },
        // SW cluster
        { x: 2, y: 15, amount: 160 },
        { x: 5, y: 13, amount: 160 },
        // NW cluster
        { x: 13, y: 2, amount: 160 },
        { x: 15, y: 4, amount: 160 },
        // Center area
        { x: 9, y: 9, amount: 180 },
        { x: 11, y: 7, amount: 160 },
        { x: 7, y: 11, amount: 160 },
        // Mid flanks
        { x: 6, y: 20, amount: 160 },
        { x: 20, y: 6, amount: 160 },
        { x: 14, y: 14, amount: 180 }, // former enemy barn position — now a contested stone field
        // Deep flanks
        { x: 10, y: 22, amount: 160 },
        { x: 22, y: 10, amount: 160 },
        // Enemy-corner approaches
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

  const makeWorker = (id: number, x: number, y: number) =>
    makeUnit(id, x, y, 'farmer');
  const makeSwordsman = (id: number, x: number, y: number) =>
    makeUnit(id, x, y, 'swordsman');

  const [workers, setWorkers] = useState<WorkerState[]>(() =>
    INITIAL_SAVE?.workers?.length
      ? INITIAL_SAVE.workers.map(w => ({
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
        }))
      : (() => {
          // WC3/AoE style: workers start pre-assigned to harvest nearby resources
          const goldMine = { x: 4, y: 5 }; // nearest starting gold mine (idx 0)
          const tree0 = { x: 4, y: 2 }; // nearest tree cluster
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
            gathering: { type: gtype, idx } as {
              type: 'gold' | 'tree';
              idx: number;
            },
            movingTo: dest,
            path: [] as { x: number; y: number }[],
            state: 'moving' as const,
          });
          return [
            { ...makeUnit(1, 3, 3, 'farmer'), selected: true }, // idle, player's first unit to control
            mkGatherer(2, 4, 3, 'gold', 0, goldMine), // → gold mine
            mkGatherer(3, 3, 4, 'gold', 0, goldMine), // → gold mine
            mkGatherer(4, 4, 4, 'tree', 0, tree0), // → lumber
            mkGatherer(5, 5, 3, 'tree', 1, tree1), // → lumber
          ];
        })()
  );
  const workersRef = useRef(workers);
  useEffect(() => {
    workersRef.current = workers;
  }, [workers]);

  const [enemyGrunts, setEnemyGrunts] = useState<EnemyGrunt[]>([]);
  const enemyGruntsRef = useRef(enemyGrunts);
  useEffect(() => {
    enemyGruntsRef.current = enemyGrunts;
  }, [enemyGrunts]);
  const gruntIdRef = useRef(1);
  const gruntAttackTimeoutsRef = useRef<Record<number, number>>({});

  const makeCreeps = () => {
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
  };
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
  const campClearedAtRef = useRef<Record<number, number>>({}); // campId → timestamp cleared
  const creepAttackTimeoutsRef = useRef<Record<number, number>>({});
  const creepIdCounterRef = useRef(1000); // avoid id collisions on respawn

  const [wave, setWave] = useState(() => INITIAL_SAVE?.wave ?? 0);
  const waveRef = useRef(INITIAL_SAVE?.wave ?? 0);
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

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
  const [enemySiege, setEnemySiege] = useState<EnemySiege[]>([]);
  const enemySiegeRef = useRef<EnemySiege[]>([]);
  useEffect(() => {
    enemySiegeRef.current = enemySiege;
  }, [enemySiege]);
  const siegeIdRef = useRef(1000);
  const [enemyShamans, setEnemyShamans] = useState<EnemyShaman[]>([]);
  const enemyShamansRef = useRef<EnemyShaman[]>([]);
  useEffect(() => {
    enemyShamansRef.current = enemyShamans;
  }, [enemyShamans]);
  const shamanIdRef = useRef(2000);
  const shamanHealTimersRef = useRef<Record<number, number>>({});
  const [enemyNecromancers, setEnemyNecromancers] = useState<
    EnemyNecromancer[]
  >([]);
  const enemyNecromancersRef = useRef<EnemyNecromancer[]>([]);
  useEffect(() => {
    enemyNecromancersRef.current = enemyNecromancers;
  }, [enemyNecromancers]);
  const necromancerIdRef = useRef(7000);
  const necromancerRaiseTimersRef = useRef<Record<number, number>>({});
  const [enemyWitchDoctors, setEnemyWitchDoctors] = useState<
    EnemyWitchDoctor[]
  >([]);
  const enemyWitchDoctorsRef = useRef<EnemyWitchDoctor[]>([]);
  useEffect(() => {
    enemyWitchDoctorsRef.current = enemyWitchDoctors;
  }, [enemyWitchDoctors]);
  const witchDoctorIdRef = useRef(8000);
  const witchDoctorBuffTimersRef = useRef<Record<number, number>>({});
  const [enemyWarchiefs, setEnemyWarchiefs] = useState<EnemyWarchief[]>([]);
  const enemyWarchiefsRef = useRef<EnemyWarchief[]>([]);
  useEffect(() => {
    enemyWarchiefsRef.current = enemyWarchiefs;
  }, [enemyWarchiefs]);
  const warchiefIdRef = useRef(9000);
  const [enemyWarlords, setEnemyWarlords] = useState<EnemyWarlord[]>([]);
  const enemyWarlordsRef = useRef<EnemyWarlord[]>([]);
  useEffect(() => {
    enemyWarlordsRef.current = enemyWarlords;
  }, [enemyWarlords]);
  const warlordIdRef = useRef(10000);
  const [enemyLurkers, setEnemyLurkers] = useState<EnemyLurker[]>([]);
  const enemyLurkersRef = useRef<EnemyLurker[]>([]);
  useEffect(() => {
    enemyLurkersRef.current = enemyLurkers;
  }, [enemyLurkers]);
  const lurkerIdRef = useRef(11000);
  const lurkerAttackTimeoutsRef = useRef<Record<number, number>>({});
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
  const [enemyTrolls, setEnemyTrolls] = useState<EnemyTroll[]>([]);
  const enemyTrollsRef = useRef<EnemyTroll[]>([]);
  useEffect(() => {
    enemyTrollsRef.current = enemyTrolls;
  }, [enemyTrolls]);
  const trollIdRef = useRef(3000);
  const trollAttackTimersRef = useRef<Record<number, number>>({});
  const [enemySappers, setEnemySappers] = useState<EnemySapper[]>([]);
  const enemySappersRef = useRef<EnemySapper[]>([]);
  useEffect(() => {
    enemySappersRef.current = enemySappers;
  }, [enemySappers]);
  const sapperIdRef = useRef(4000);
  const [lootCrates, setLootCrates] = useState<LootCrate[]>([]);
  const lootCratesRef = useRef<LootCrate[]>([]);
  useEffect(() => {
    lootCratesRef.current = lootCrates;
  }, [lootCrates]);
  const lootCrateIdRef = useRef(5000);
  const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
  const heroItemsRef = useRef<HeroItem[]>([]);
  useEffect(() => {
    heroItemsRef.current = heroItems;
  }, [heroItems]);
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const droppedItemsRef = useRef<DroppedItem[]>([]);
  useEffect(() => {
    droppedItemsRef.current = droppedItems;
  }, [droppedItems]);
  const dropItemIdRef = useRef(9000);
  type FormationMode = 'cluster' | 'line' | 'wedge' | 'box';
  const [formationMode, setFormationMode] = useState<FormationMode>('cluster');
  const formationModeRef = useRef<FormationMode>('cluster');
  useEffect(() => {
    formationModeRef.current = formationMode;
  }, [formationMode]);
  const pendingPickupRef = useRef<Set<number>>(new Set());
  const [waveAnnouncement, setWaveAnnouncement] = useState<string | null>(null);
  const [wavePreview, setWavePreview] = useState<string | null>(null);
  const previewTimerRef = useRef<number | null>(null);
  const gameOverRef = useRef<'victory' | 'defeat' | null>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const [nextWaveAt, setNextWaveAt] = useState<number | null>(null);
  const nextWaveAtRef = useRef<number | null>(null);
  useEffect(() => {
    nextWaveAtRef.current = nextWaveAt;
  }, [nextWaveAt]);
  const waveTimerRemainingRef = useRef<number | null>(null);
  const idleWorkerIndexRef = useRef(0);
  const lastGroupKeyRef = useRef<{ num: number; t: number } | null>(null);
  // Ambient chickens — decorative only, wander near barn
  const [chickens, setChickens] = useState<
    { id: number; x: number; y: number; facing: 1 | -1 }[]
  >(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: BARN_POS.x + (i % 3) - 1,
      y: BARN_POS.y + Math.floor(i / 3) + 1,
      facing: 1 as const,
    }))
  );
  const [capturedShrines, setCapturedShrines] = useState<Set<number>>(
    new Set()
  );
  const capturedShrinesRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    capturedShrinesRef.current = capturedShrines;
  }, [capturedShrines]);
  // shrineCapturing: which shrine a worker is channeling and since when
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
  const [gameSpeed, setGameSpeed] = useState(0);
  const gameSpeedRef = useRef(0);
  useEffect(() => {
    gameSpeedRef.current = gameSpeed;
  }, [gameSpeed]);
  const barnDmgThisWaveRef = useRef(0); // tracks barn HP lost this wave for clear-bonus
  const [damageLog, setDamageLog] = useState<
    { source: string; amount: number; t: number }[]
  >([]);
  const [damageLogOpen, setDamageLogOpen] = useState(false);
  const addDmgLog = useCallback((source: string, amount: number) => {
    setDamageLog(prev => [
      ...prev.slice(-49),
      { source, amount, t: Date.now() },
    ]);
  }, []);

  const [enemyBarnHp, setEnemyBarnHp] = useState(
    () => INITIAL_SAVE?.enemyBarnHp ?? ENEMY_BARN_MAX_HP
  );
  const enemyBarnHpRef = useRef(INITIAL_SAVE?.enemyBarnHp ?? ENEMY_BARN_MAX_HP);
  useEffect(() => {
    enemyBarnHpRef.current = enemyBarnHp;
  }, [enemyBarnHp]);
  const sallyForthThresholdsRef = useRef<Set<number>>(new Set([150, 100, 50])); // barn HP thresholds that trigger sally
  const lastStandEnrageRef = useRef(false); // one-shot: enrage all grunts when enemy barn hits 50%
  const [playerBarnHp, setPlayerBarnHp] = useState(
    () => INITIAL_SAVE?.playerBarnHp ?? PLAYER_BARN_MAX_HP
  );
  const playerBarnHpRef = useRef(
    INITIAL_SAVE?.playerBarnHp ?? PLAYER_BARN_MAX_HP
  );
  useEffect(() => {
    playerBarnHpRef.current = playerBarnHp;
  }, [playerBarnHp]);
  const [gameOver, setGameOver] = useState<'victory' | 'defeat' | null>(null);
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

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

  const [heroRecruited, setHeroRecruited] = useState(false);
  const [heroReviveAt, setHeroReviveAt] = useState<number | null>(null); // timestamp when auto-revive completes
  const [heroReviveCountdown, setHeroReviveCountdown] = useState(0);
  const heroXpRef = useRef<{ xp: number; level: number } | null>(null); // preserve XP/level across death
  const [heroAbilityCooldown, setHeroAbilityCooldown] = useState(0);
  useEffect(() => {
    if (heroAbilityCooldown <= 0) return;
    const id = setInterval(
      () => setHeroAbilityCooldown(c => Math.max(0, c - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [heroAbilityCooldown > 0]);
  const [heroShoutCooldown, setHeroShoutCooldown] = useState(0);
  useEffect(() => {
    if (heroShoutCooldown <= 0) return;
    const id = setInterval(
      () => setHeroShoutCooldown(c => Math.max(0, c - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [heroShoutCooldown > 0]);
  const [battleShoutUntil, setBattleShoutUntil] = useState(0);
  const battleShoutUntilRef = useRef(0);
  useEffect(() => {
    battleShoutUntilRef.current = battleShoutUntil;
  }, [battleShoutUntil]);
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
  }, [harvestBoonCooldown > 0]);
  useEffect(() => {
    if (earthquakeCooldown <= 0) return;
    const id = setInterval(
      () => setEarthquakeCooldown(c => Math.max(0, c - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [earthquakeCooldown > 0]);
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
  const startTimeRef = useRef(Date.now());
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  useEffect(() => {
    if (gameOver && !gameEndTime) {
      const endTime = Date.now();
      setGameEndTime(endTime);
      saveHighScore({
        wave,
        kills: killCount,
        result: gameOver,
        gold: totalGold,
        time: Math.floor((endTime - startTimeRef.current) / 1000),
        date: new Date().toLocaleDateString(),
      });
      if (gameOver === 'victory') Snd.victory();
      else Snd.defeat();
    }
  }, [gameOver, gameEndTime, wave, killCount, totalGold]);

  const [farmhouse, setFarmhouse] = useState<{ built: boolean; level: number }>(
    () => INITIAL_SAVE?.farmhouse ?? { built: false, level: 0 }
  );
  const farmhouseUpgradeCosts = [
    { gold: 50, lumber: 50 },
    { gold: 100, lumber: 100 },
    { gold: 200, lumber: 200 },
  ];
  const farmhouseStorage = [
    { gold: 100, lumber: 100 },
    { gold: 200, lumber: 200 },
    { gold: 400, lumber: 400 },
  ];
  const maxFarmhouseLevel = farmhouseUpgradeCosts.length - 1;
  const [selectedType, setSelectedType] = useState<
    'worker' | 'farmhouse' | 'building' | null
  >('worker');
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(
    null
  );
  const [rallyPoint, setRallyPoint] = useState<{ x: number; y: number } | null>(
    () => INITIAL_SAVE?.rallyPoint ?? null
  );
  const rallyPointRef = useRef(rallyPoint);
  useEffect(() => {
    rallyPointRef.current = rallyPoint;
  }, [rallyPoint]);
  const [patrolMode, setPatrolMode] = useState(false);
  const patrolModeRef = useRef(false);
  useEffect(() => {
    patrolModeRef.current = patrolMode;
  }, [patrolMode]);
  const [attackMoveMode, setAttackMoveMode] = useState(false);
  const attackMoveModeRef = useRef(false);
  useEffect(() => {
    attackMoveModeRef.current = attackMoveMode;
  }, [attackMoveMode]);
  const [stance, setStance] = useState<'aggressive' | 'passive'>('aggressive');
  const stanceRef = useRef<'aggressive' | 'passive'>('aggressive');
  useEffect(() => {
    stanceRef.current = stance;
  }, [stance]);
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

  const [blacksmithUpgrades, setBlacksmithUpgrades] = useState(
    () => INITIAL_SAVE?.blacksmithUpgrades ?? { steelEdge: 0, ironHide: 0 }
  );
  const blacksmithUpgradesRef = useRef(blacksmithUpgrades);
  useEffect(() => {
    blacksmithUpgradesRef.current = blacksmithUpgrades;
  }, [blacksmithUpgrades]);
  const [guardTowerResearched, setGuardTowerResearched] = useState(
    () => INITIAL_SAVE?.guardTowerResearched ?? false
  );
  const guardTowerRef = useRef(guardTowerResearched);
  useEffect(() => {
    guardTowerRef.current = guardTowerResearched;
  }, [guardTowerResearched]);
  const [barracksTech, setBarracksTech] = useState(
    () =>
      INITIAL_SAVE?.barracksTech ?? { veteranTraining: false, warDrums: false }
  );
  const barracksTechRef = useRef(barracksTech);
  useEffect(() => {
    barracksTechRef.current = barracksTech;
  }, [barracksTech]);

  // Upkeep system (WC3-style): high food usage reduces gold income
  // 0–50% food cap = no penalty, 51–80% = 70% gold rate, 81%+ = 40% gold rate
  const upkeepPct =
    resources.foodCap > 0 ? resources.food / resources.foodCap : 0;
  const upkeepMult = upkeepPct <= 0.5 ? 1 : upkeepPct <= 0.8 ? 0.7 : 0.4;
  const upkeepMultRef = useRef(upkeepMult);
  useEffect(() => {
    upkeepMultRef.current = upkeepMult;
  }, [upkeepMult]);

  // Unit training queue (barracks + stable)
  const [trainingQueue, setTrainingQueue] = useState<
    { type: 'swordsman' | 'cavalry' }[]
  >([]);
  const [trainingProgress, setTrainingProgress] = useState(0); // 0-1 for first item
  const trainingQueueRef = useRef<{ type: 'swordsman' | 'cavalry' }[]>([]);
  const trainingElapsedRef = useRef(0);
  useEffect(() => {
    trainingQueueRef.current = trainingQueue;
  }, [trainingQueue]);

  // Day/Night cycle
  const DAY_DURATION_MS = 60000;
  const NIGHT_DURATION_MS = 45000;
  const [dayPhase, setDayPhase] = useState<'day' | 'night'>('day');
  const [dayProgress, setDayProgress] = useState(0); // 0-1 through current phase
  const [phaseAnnouncement, setPhaseAnnouncement] = useState<string | null>(
    null
  );
  const isNightRef = useRef(false);
  useEffect(() => {
    isNightRef.current = dayPhase === 'night';
    if (!soundMuted) startAmbient(dayPhase === 'night');
  }, [dayPhase, soundMuted]);

  // Stop ambient audio when muted or game over
  useEffect(() => {
    if (soundMuted || gameOver) stopAmbient();
    else startAmbient(isNightRef.current);
  }, [soundMuted, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    let phaseStart = Date.now();
    let currentPhase: 'day' | 'night' = 'day';
    const tick = setInterval(() => {
      if (gameOverRef.current) return;
      const elapsed = Date.now() - phaseStart;
      const duration =
        currentPhase === 'day' ? DAY_DURATION_MS : NIGHT_DURATION_MS;
      setDayProgress(Math.min(1, elapsed / duration));
      if (elapsed >= duration) {
        currentPhase = currentPhase === 'day' ? 'night' : 'day';
        setDayPhase(currentPhase);
        phaseStart = Date.now();
        const msg =
          currentPhase === 'night'
            ? '🌙 Night Falls! Grunts grow stronger…'
            : '☀️ Dawn Breaks!';
        setPhaseAnnouncement(msg);
        setTimeout(() => setPhaseAnnouncement(null), 2500);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [gameOver]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(
    null
  );
  const [achievementPanelOpen, setAchievementPanelOpen] = useState(false);
  const sapperKillCountRef = useRef<number>(0);
  const [incomeRate, setIncomeRate] = useState({
    gold: 0,
    lumber: 0,
    stone: 0,
  });
  const incomeAccRef = useRef({ gold: 0, lumber: 0, stone: 0 });
  const [underAttack, setUnderAttack] = useState(false);
  const underAttackTimerRef = useRef<number | null>(null);
  const [minimapPings, setMinimapPings] = useState<
    { x: number; y: number; t: number }[]
  >([]);
  const triggerUnderAttack = useCallback((pos?: { x: number; y: number }) => {
    setUnderAttack(true);
    if (underAttackTimerRef.current) clearTimeout(underAttackTimerRef.current);
    underAttackTimerRef.current = window.setTimeout(
      () => setUnderAttack(false),
      4000
    );
    if (pos)
      setMinimapPings(prev => [
        ...prev.filter(p => Date.now() - p.t < 3000),
        { x: pos.x, y: pos.y, t: Date.now() },
      ]);
  }, []);
  const triggerUnderAttackRef = useRef(triggerUnderAttack);
  useEffect(() => {
    triggerUnderAttackRef.current = triggerUnderAttack;
  }, [triggerUnderAttack]);

  const doSave = useCallback(() => {
    writeSave({
      version: 1,
      resources,
      workers: workersRef.current.map(w => ({
        id: w.id,
        x: Math.round(w.x),
        y: Math.round(w.y),
        hp: w.hp,
        maxHp: w.maxHp,
        unitType: w.unitType,
        group: w.group,
        xp: w.xp,
        level: w.level,
        gathering: w.gathering,
        state: w.state,
      })),
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
      totalStone,
      playerBarnHp: playerBarnHpRef.current,
      enemyBarnHp,
      rallyPoint,
      fogExplored,
      guardTowerResearched,
      barracksTech,
      blacksmithUpgrades,
      savedAt: Date.now(),
      difficultyId: difficulty?.id,
    }, slot);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [
    resources,
    farmhouse,
    killCount,
    totalGold,
    totalLumber,
    totalStone,
    enemyBarnHp,
    rallyPoint,
    fogExplored,
    guardTowerResearched,
    barracksTech,
    blacksmithUpgrades,
  ]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(doSave, 30000);
    return () => clearInterval(id);
  }, [gameOver, doSave]);

  const triggerAchievement = useCallback((id: string) => {
    const isNew = unlockAchievement(id);
    if (!isNew) return;
    const achv = ALL_ACHIEVEMENTS.find(a => a.id === id);
    if (!achv) return;
    Snd.achievementUnlock();
    setAchievementToast(achv);
    window.setTimeout(() => setAchievementToast(null), 4500);
  }, []);

  // Achievement: kill milestones
  useEffect(() => {
    if (killCount >= 1) triggerAchievement('first_blood');
    if (killCount >= 100) triggerAchievement('kill_100');
    if (killCount >= 500) triggerAchievement('kill_500');
  }, [killCount, triggerAchievement]);

  // Achievement: wave milestones
  useEffect(() => {
    if (wave >= 10) triggerAchievement('wave_10');
    if (wave >= 20) triggerAchievement('wave_20');
    if (wave >= 30) triggerAchievement('wave_30');
    if (wave >= 50) triggerAchievement('wave_50');
  }, [wave, triggerAchievement]);

  // Achievement: total gold earned
  useEffect(() => {
    if (totalGold >= 1000) triggerAchievement('gold_baron');
  }, [totalGold, triggerAchievement]);

  // Achievement: unit count and veterancy
  useEffect(() => {
    if (workers.length >= 6) triggerAchievement('pack_leader');
    const level3Count = workers.filter(w => w.level >= 3).length;
    if (level3Count >= 3) triggerAchievement('veteran_corps');
  }, [workers, triggerAchievement]);

  // Achievement: hero items
  useEffect(() => {
    if (heroItems.length >= 3) triggerAchievement('hero_equipped');
  }, [heroItems, triggerAchievement]);

  // Achievement: buildings — fortified (3 walls) and blacksmith max
  useEffect(() => {
    const wallCount = placedBuildings.filter(b => b.type === 'wall').length;
    if (wallCount >= 3) triggerAchievement('fortified');
  }, [placedBuildings, triggerAchievement]);

  useEffect(() => {
    if (
      blacksmithUpgrades.steelEdge >= 2 ||
      blacksmithUpgrades.ironHide >= 2
    ) {
      triggerAchievement('blacksmith_max');
    }
  }, [blacksmithUpgrades, triggerAchievement]);

  // Income rate: snapshot every 30s, publish as per-minute rate
  useEffect(() => {
    const id = setInterval(() => {
      const acc = incomeAccRef.current;
      setIncomeRate({
        gold: acc.gold * 2,
        lumber: acc.lumber * 2,
        stone: acc.stone * 2,
      });
      incomeAccRef.current = { gold: 0, lumber: 0, stone: 0 };
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Save on tab close
  useEffect(() => {
    const handler = () => {
      if (!gameOverRef.current) doSave();
    };
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
  const lastFogUpdateRef = useRef<number>(0); // timestamp of last fog recompute
  // Hit-flash: tracks timestamp of last damage taken per unit id (workers and grunts)
  const workerHitRef = useRef<Map<number, number>>(new Map());
  const gruntHitRef = useRef<Map<number, number>>(new Map());

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const floatingTextIdRef = useRef(1);
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setFloatingTexts(ts => {
        if (ts.length === 0) return ts; // avoid new empty array reference every 100ms
        const filtered = ts.filter(t => now - t.createdAt < 1200);
        return filtered.length === ts.length ? ts : filtered;
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  const addFloatingText = useCallback(
    (tileX: number, tileY: number, text: string, color: string) => {
      const { isoX, isoY } = tileToSvg(tileX, tileY);
      setFloatingTexts(ts => [
        ...ts,
        {
          id: floatingTextIdRef.current++,
          x: isoX + TILE_SIZE / 2 + (Math.random() * 20 - 10),
          y: isoY + 10,
          text,
          color,
          createdAt: Date.now(),
        },
      ]);
    },
    []
  );

  // Creep camp respawn: cleared camps respawn after 3 minutes (WC3-style)
  const CAMP_RESPAWN_MS = 180_000;
  useEffect(() => {
    const id = setInterval(() => {
      if (gameOverRef.current || gameSpeedRef.current === 0) return;
      const now = Date.now();
      const toRespawn = CREEP_CAMPS.filter(camp => {
        const clearedAt = campClearedAtRef.current[camp.id];
        return clearedAt && now - clearedAt >= CAMP_RESPAWN_MS;
      });
      if (toRespawn.length === 0) return;
      toRespawn.forEach(camp => {
        delete campClearedAtRef.current[camp.id];
        addFloatingText(camp.x, camp.y, '⚠ Creeps Respawned!', '#f87171');
      });
      setClearedCamps(s => {
        const n = new Set(s);
        toRespawn.forEach(c => n.delete(c.id));
        return n;
      });
      setNeutralCreeps(cs => {
        const respawnedIds = new Set(toRespawn.map(c => c.id));
        const existing = cs.filter(c => !respawnedIds.has(c.campId));
        const newCreeps = toRespawn.flatMap(camp => [
          {
            id: creepIdCounterRef.current++,
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
            id: creepIdCounterRef.current++,
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
        return [...existing, ...newCreeps];
      });
    }, 5000);
    return () => clearInterval(id);
  }, [addFloatingText]);

  // Hero revive timer — ticks down, spawns hero on completion
  useEffect(() => {
    if (heroReviveAt === null) {
      setHeroReviveCountdown(0);
      return;
    }
    const id = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((heroReviveAt - Date.now()) / 1000)
      );
      setHeroReviveCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        setHeroReviveAt(null);
        setWorkers(ws => {
          const newId = Math.max(...ws.map(w => w.id), 0) + 1;
          const hero = makeUnit(newId, BARN_POS.x, BARN_POS.y, 'hero');
          const saved = heroXpRef.current;
          return [
            ...ws,
            saved
              ? {
                  ...hero,
                  xp: saved.xp,
                  level: saved.level,
                  maxHp: HERO_MAX_HP + saved.level * 10,
                  hp: HERO_MAX_HP + saved.level * 10,
                }
              : hero,
          ];
        });
        addFloatingText(
          BARN_POS.x,
          BARN_POS.y,
          '🦸 Barnabas Returns!',
          '#fbbf24'
        );
      }
    }, 500);
    return () => clearInterval(id);
  }, [heroReviveAt, addFloatingText]);

  // Detect hero death → start auto-revive timer
  useEffect(() => {
    if (!heroRecruited || heroReviveAt !== null || gameOver) return;
    const hero = workers.find(w => w.unitType === 'hero');
    if (!hero || hero.hp > 0) return;
    heroXpRef.current = { xp: hero.xp, level: hero.level };
    const reviveDelay = Math.min(60000, 20000 + waveRef.current * 2000);
    setHeroReviveAt(Date.now() + reviveDelay);
    setWorkers(ws => ws.filter(w => w.unitType !== 'hero'));
    addFloatingText(hero.x, hero.y, '🦸 Barnabas Fallen!', '#f97316');
  }, [workers, heroRecruited, heroReviveAt, gameOver, addFloatingText]);

  // Projectile system — flying arrows/rocks/ice bolts
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const projIdRef = useRef(0);
  // Move-target ring — flashes at right-click destination like WC3/AoE
  const [moveRing, setMoveRing] = useState<{
    svgX: number;
    svgY: number;
    born: number;
  } | null>(null);
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setProjectiles(ps =>
        ps.filter(p => now - p.createdAt < p.duration + 100)
      );
      if (moveRing && now - moveRing.born > 700) setMoveRing(null);
    }, 200);
    return () => clearInterval(id);
  }, []);
  const addProjectile = useCallback(
    (
      fromTX: number,
      fromTY: number,
      toTX: number,
      toTY: number,
      type: Projectile['type'],
      duration: number
    ) => {
      const { isoX: fx, isoY: fy } = tileToSvg(fromTX, fromTY);
      const { isoX: tx2, isoY: ty2 } = tileToSvg(toTX, toTY);
      setProjectiles(ps => [
        ...ps,
        {
          id: projIdRef.current++,
          fx: fx + TILE_SIZE / 2,
          fy: fy + TILE_SIZE / 4,
          tx: tx2 + TILE_SIZE / 2,
          ty: ty2 + TILE_SIZE / 4,
          type,
          createdAt: Date.now(),
          duration,
        },
      ]);
    },
    []
  );

  // Fog of war: updated in the animate loop to avoid useEffect cascade

  const gameCtx = {
    difficulty,
    onAchievement: triggerAchievement,
    addDmgLog,
    addFloatingText,
    addProjectile,
    animationRef,
    attackTimeoutsRef,
    barnDmgThisWaveRef,
    barracksTechRef,
    battleShoutUntilRef,
    blacksmithUpgradesRef,
    buildingAttackTimeoutsRef,
    buildingRepairTimeoutsRef,
    campClearedAtRef,
    capturedShrinesRef,
    creepAttackTimeoutsRef,
    deadGruntPositionsRef,
    deadWorkerIdsRef,
    dropItemIdRef,
    droppedItemsRef,
    enemyBarnHpRef,
    enemyGruntsRef,
    enemyNecromancersRef,
    enemySappersRef,
    enemyShamansRef,
    enemySiegeRef,
    enemyTowerTimersRef,
    enemyTowers,
    enemyTowersRef,
    enemyTrollsRef,
    enemyWallIdRef,
    enemyLurkersRef,
    enemyWallsRef,
    enemyWarchiefsRef,
    enemyWarlordsRef,
    enemyWitchDoctorsRef,
    farmhouse,
    fogExploredRef,
    fogVisibleRef,
    gameOver,
    gameOverRef,
    gameSpeed,
    gameSpeedRef,
    garrisoned,
    garrisonedRef,
    gatherTimeoutsRef,
    goldMinesRef,
    gruntAttackTimeoutsRef,
    gruntHitRef,
    gruntIdRef,
    guardTowerRef,
    harvestBoonRef,
    heroItemsRef,
    incomeAccRef,
    isNightRef,
    lastFogUpdateRef,
    lastStandEnrageRef,
    lootCrateIdRef,
    lootCratesRef,
    necromancerIdRef,
    necromancerRaiseTimersRef,
    neutralCreepsRef,
    nextWaveAtRef,
    pendingPickupRef,
    placedBuildings,
    placedBuildingsRef,
    playerBarnHpRef,
    prevTimeRef,
    previewTimerRef,
    rallyPointRef,
    repairTimeoutsRef,
    sallyForthThresholdsRef,
    sapperIdRef,
    sapperKillCountRef,
    setCapturedShrines,
    setClearedCamps,
    setDeadGruntPositions,
    setDeadWorkerPositions,
    setDroppedItems,
    setEnemyBarnHp,
    setEnemyGrunts,
    setEnemyNecromancers,
    setEnemySappers,
    setEnemyShamans,
    setEnemySiege,
    setEnemyTowers,
    setEnemyTrolls,
    setEnemyLurkers,
    setEnemyWalls,
    setEnemyWarchiefs,
    setEnemyWarlords,
    setEnemyWitchDoctors,
    setFogExplored,
    setFogVisible,
    setGameOver,
    setGarrisoned,
    setGoldMines,
    setHeroItems,
    setKillCount,
    setLootCrates,
    setNeutralCreeps,
    setNextWaveAt,
    setPlacedBuildings,
    setPlayerBarnHp,
    setResources,
    setShrineCapturing,
    setShrinePlentyBuff,
    setShrineWarBuff,
    setStoneNodes,
    setTotalGold,
    setTotalLumber,
    setTotalStone,
    setTrainingProgress,
    setTrainingQueue,
    setTrees,
    setWave,
    setWaveAnnouncement,
    setWavePreview,
    setWorkers,
    shamanHealTimersRef,
    shamanIdRef,
    shrineCapturingRef,
    shrinePlentyBuffRef,
    shrineWarBuffRef,
    siegeAttackTimeoutsRef,
    siegeIdRef,
    spawnTimerRef,
    stance,
    stanceRef,
    stoneNodesRef,
    tiles,
    towerGarrisonRef,
    trainingElapsedRef,
    trainingQueueRef,
    trapTriggeredRef,
    treesRef,
    triggerShakeRef,
    triggerUnderAttackRef,
    lurkerAttackTimeoutsRef,
    lurkerIdRef,
    trollAttackTimersRef,
    trollIdRef,
    upgradesRef,
    upkeepMultRef,
    warchiefIdRef,
    warlordIdRef,
    watchtowerTimersRef,
    wave,
    waveRef,
    waveTimerRemainingRef,
    witchDoctorBuffTimersRef,
    witchDoctorIdRef,
    workerHitRef,
    workers,
    workersRef,
  };
  useWaveSpawner(gameCtx);
  useWorldTicks(gameCtx);
  useTowerCombat(gameCtx);
  useProduction(gameCtx);

  const handleTowerGarrison = useCallback(
    (towerId: number, tx: number, ty: number) => {
      const TOWER_CAP = 3;
      setWorkers(ws => {
        const current = towerGarrisonRef.current[towerId] ?? [];
        const slots = TOWER_CAP - current.length;
        if (slots <= 0) return ws;
        const selected = ws
          .filter(
            w =>
              w.selected &&
              w.unitType !== 'catapult' &&
              w.unitType !== 'trebuchet'
          )
          .slice(0, slots);
        if (selected.length === 0) return ws;
        const ids = new Set(selected.map(w => w.id));
        setTowerGarrison(tg => ({
          ...tg,
          [towerId]: [
            ...(tg[towerId] ?? []),
            ...selected.map(w => ({
              ...w,
              selected: false,
              state: 'idle' as const,
              movingTo: null,
              path: [],
              gathering: null,
              attacking: null,
              repairing: null,
              patrol: null,
              attackMove: false,
              attackMoveTarget: null,
            })),
          ],
        }));
        setResources(r => ({ ...r, food: r.food - selected.length }));
        addFloatingText(tx, ty, `+${selected.length} 🏰`, '#22d3ee');
        return ws.filter(w => !ids.has(w.id));
      });
    },
    [addFloatingText]
  );

  const handleTowerDeploy = useCallback(
    (towerId: number, tx: number, ty: number) => {
      const units = towerGarrisonRef.current[towerId] ?? [];
      if (units.length === 0) return;
      setTowerGarrison(tg => {
        const next = { ...tg };
        delete next[towerId];
        return next;
      });
      setWorkers(ws => [
        ...ws,
        ...units.map((u, i) => ({
          ...u,
          x: tx + (i % 2 === 0 ? -1 : 1),
          y: ty + Math.floor(i / 2),
          selected: false,
        })),
      ]);
      setResources(r => ({ ...r, food: r.food + units.length }));
    },
    []
  );

  const handleGarrison = useCallback(() => {
    setWorkers(ws => {
      const slots = GARRISON_CAP - garrisonedRef.current.length;
      if (slots <= 0) return ws;
      const toGarrison = ws.filter(w => w.selected).slice(0, slots);
      if (toGarrison.length === 0) return ws;
      Snd.garrison();
      const ids = new Set(toGarrison.map(w => w.id));
      setGarrisoned(g => [
        ...g,
        ...toGarrison.map(w => ({
          ...w,
          selected: false,
          state: 'idle' as const,
          movingTo: null,
          path: [],
          gathering: null,
          attacking: null,
          repairing: null,
          patrol: null,
        })),
      ]);
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
      const deployed = units.map((u, i) => ({
        ...u,
        x: BARN_POS.x + (i % 3) - 1,
        y: BARN_POS.y + Math.floor(i / 3) + 1,
      }));
      setResources(r => ({ ...r, food: r.food + units.length }));
      return [...ws, ...deployed];
    });
  }, []);

  const handleHeroAbility = useCallback(() => {
    if (heroAbilityCooldown > 0) return;
    const hero = workersRef.current.find(w => w.unitType === 'hero');
    if (!hero) return;
    const hx = Math.round(hero.x),
      hy = Math.round(hero.y);
    setEnemyGrunts(gs =>
      gs.map(g => {
        if (tileDist(g.x, g.y, hx, hy) <= HERO_ABILITY_RADIUS) {
          addFloatingText(
            Math.round(g.x),
            Math.round(g.y),
            `-${HERO_ABILITY_DAMAGE}🗡️`,
            '#f59e0b'
          );
          return { ...g, hp: Math.max(0, g.hp - HERO_ABILITY_DAMAGE) };
        }
        return g;
      })
    );
    addFloatingText(hx, hy, '⚡ Rallying Cry!', '#fbbf24');
    Snd.ability();
    setHeroAbilityCooldown(HERO_ABILITY_COOLDOWN_S);
  }, [heroAbilityCooldown, addFloatingText]);

  const handleBattleShout = useCallback(() => {
    if (heroShoutCooldown > 0) return;
    const hero = workersRef.current.find(
      w => w.unitType === 'hero' && w.hp > 0 && w.level >= 2
    );
    if (!hero) return;
    const until = Date.now() + HERO_SHOUT_DURATION_MS;
    setBattleShoutUntil(until);
    addFloatingText(
      Math.round(hero.x),
      Math.round(hero.y),
      '📯 Battle Shout!',
      '#fb923c'
    );
    Snd.ability();
    workersRef.current
      .filter(
        w =>
          w.hp > 0 &&
          w.id !== hero.id &&
          tileDist(w.x, w.y, hero.x, hero.y) <= HERO_SHOUT_RADIUS
      )
      .forEach(w => {
        addFloatingText(
          Math.round(w.x),
          Math.round(w.y),
          '⚡ HASTED!',
          '#fbbf24'
        );
      });
    setHeroShoutCooldown(HERO_SHOUT_COOLDOWN_S);
  }, [heroShoutCooldown, addFloatingText]);

  const handleHarvestBoon = useCallback(() => {
    if (harvestBoonCooldown > 0 || harvestBoonActive) return;
    const hero = workersRef.current.find(w => w.unitType === 'hero');
    if (!hero) return;
    setHarvestBoonActive(true);
    harvestBoonRef.current = true;
    addFloatingText(
      Math.round(hero.x),
      Math.round(hero.y),
      '🌾 Harvest Boon!',
      '#86efac'
    );
    workers.forEach(w => {
      if (w.unitType === 'farmer')
        addFloatingText(Math.round(w.x), Math.round(w.y), '⚡', '#86efac');
    });
    setHarvestBoonCooldown(40);
    window.setTimeout(() => {
      setHarvestBoonActive(false);
      harvestBoonRef.current = false;
    }, 10000);
  }, [harvestBoonCooldown, harvestBoonActive, addFloatingText, workers]);

  const SHOP_ITEMS: { itemId: HeroItemId; cost: number }[] = [
    { itemId: 'boots_speed', cost: 75 },
    { itemId: 'battle_sword', cost: 100 },
    { itemId: 'shield_pendant', cost: 80 },
    { itemId: 'healing_potion', cost: 50 },
  ];

  const handleBuyItem = useCallback(
    (itemId: string, cost: number) => {
      const id = itemId as HeroItemId;
      if (resources.gold < cost) return;
      if (heroItemsRef.current.length >= HERO_MAX_ITEMS) return;
      if (id === 'tome_xp') {
        setWorkers(ws =>
          ws.map(w => {
            if (w.unitType !== 'hero') return w;
            const newXp = w.xp + 80;
            const newLevel =
              newXp >= XP_TO_LEVEL_3
                ? 3
                : newXp >= XP_TO_LEVEL_2
                  ? 2
                  : newXp >= XP_TO_LEVEL_1
                    ? 1
                    : 0;
            if (newLevel > w.level) {
              addFloatingText(
                Math.round(w.x),
                Math.round(w.y),
                `⭐ Level ${newLevel}!`,
                '#fbbf24'
              );
              return {
                ...w,
                xp: newXp,
                level: newLevel,
                maxHp: w.maxHp + VETERAN_HP_BONUS,
                hp: Math.min(
                  w.hp + VETERAN_HP_BONUS,
                  w.maxHp + VETERAN_HP_BONUS
                ),
              };
            }
            return { ...w, xp: newXp };
          })
        );
      } else {
        setHeroItems(hi => [
          ...hi,
          { id: dropItemIdRef.current++, itemId: id },
        ]);
      }
      setResources(r => ({ ...r, gold: r.gold - cost }));
      const hero = workersRef.current.find(
        w => w.unitType === 'hero' && w.hp > 0
      );
      if (hero)
        addFloatingText(
          Math.round(hero.x),
          Math.round(hero.y),
          `${HERO_ITEM_DATA[id].emoji} Purchased!`,
          '#c084fc'
        );
      Snd.ability();
    },
    [resources.gold, addFloatingText]
  );

  const handleDropItem = useCallback(
    (itemSlotId: number) => {
      const item = heroItems.find(it => it.id === itemSlotId);
      if (!item) return;
      const hero = workersRef.current.find(
        w => w.unitType === 'hero' && w.hp > 0
      );
      if (!hero) return;
      setDroppedItems(ds => [
        ...ds,
        {
          id: dropItemIdRef.current++,
          itemId: item.itemId,
          x: Math.round(hero.x),
          y: Math.round(hero.y) + 1,
        },
      ]);
      setHeroItems(hi => hi.filter(it => it.id !== itemSlotId));
    },
    [heroItems]
  );

  const handleUsePotion = useCallback(() => {
    const potionIdx = heroItems.findIndex(it => it.itemId === 'healing_potion');
    if (potionIdx < 0) return;
    const hero = workersRef.current.find(
      w => w.unitType === 'hero' && w.hp > 0
    );
    if (!hero) return;
    const healAmt = 75;
    setWorkers(ws =>
      ws.map(w =>
        w.unitType === 'hero'
          ? { ...w, hp: Math.min(w.maxHp, w.hp + healAmt) }
          : w
      )
    );
    setHeroItems(hi => {
      const next = [...hi];
      next.splice(potionIdx, 1);
      return next;
    });
    addFloatingText(
      Math.round(hero.x),
      Math.round(hero.y),
      `🧪 +${healAmt} HP`,
      '#4ade80'
    );
    Snd.ability();
  }, [heroItems, addFloatingText]);

  const handleEarthquake = useCallback(() => {
    if (earthquakeCooldown > 0) return;
    const hero = workersRef.current.find(
      w => w.unitType === 'hero' && w.hp > 0 && w.level >= 3
    );
    if (!hero) return;
    const hx = Math.round(hero.x),
      hy = Math.round(hero.y);
    const now = Date.now();
    const stunUntil = now + EARTHQUAKE_STUN_MS;
    setEnemyGrunts(gs =>
      gs.map(g =>
        tileDist(g.x, g.y, hx, hy) <= EARTHQUAKE_RADIUS
          ? {
              ...g,
              hp: Math.max(0, g.hp - EARTHQUAKE_DAMAGE),
              frozenUntil: stunUntil,
            }
          : g
      )
    );
    setEnemyShamans(ss =>
      ss.map(s =>
        tileDist(s.x, s.y, hx, hy) <= EARTHQUAKE_RADIUS
          ? { ...s, hp: Math.max(0, s.hp - EARTHQUAKE_DAMAGE) }
          : s
      )
    );
    setEnemyTrolls(ts =>
      ts.map(t =>
        tileDist(t.x, t.y, hx, hy) <= EARTHQUAKE_RADIUS
          ? { ...t, hp: Math.max(0, t.hp - EARTHQUAKE_DAMAGE) }
          : t
      )
    );
    setEnemySiege(rs =>
      rs.map(r =>
        tileDist(r.x, r.y, hx, hy) <= EARTHQUAKE_RADIUS
          ? { ...r, hp: Math.max(0, r.hp - EARTHQUAKE_DAMAGE) }
          : r
      )
    );
    setEnemyWarchiefs(ws2 =>
      ws2.map(wc =>
        tileDist(wc.x, wc.y, hx, hy) <= EARTHQUAKE_RADIUS
          ? { ...wc, hp: Math.max(0, wc.hp - EARTHQUAKE_DAMAGE) }
          : wc
      )
    );
    addFloatingText(hx, hy, '🌋 EARTHQUAKE!', '#f59e0b');
    setEarthquakeEffect({ x: hx, y: hy, at: now });
    Snd.ability();
    setEarthquakeCooldown(EARTHQUAKE_COOLDOWN_S);
  }, [earthquakeCooldown, addFloatingText]);

  const handleSwordsmanCharge = useCallback(() => {
    const swords = workersRef.current.filter(
      w => w.selected && w.unitType === 'swordsman' && w.chargeCooldown <= 0
    );
    if (swords.length === 0) return;
    const allGrunts = enemyGruntsRef.current.filter(g => g.hp > 0);
    if (allGrunts.length === 0) return;
    Snd.charge();
    swords.forEach(sw => {
      const nearest = allGrunts.reduce<EnemyGrunt | null>(
        (best, g) =>
          !best ||
          tileDist(sw.x, sw.y, g.x, g.y) < tileDist(best.x, best.y, sw.x, sw.y)
            ? g
            : best,
        null
      );
      if (!nearest) return;
      const dmg =
        (ATTACK_DAMAGE +
          SWORDSMAN_DAMAGE_BONUS +
          upgradesRef.current.sharperTools * 5 +
          blacksmithUpgradesRef.current.steelEdge * 5 +
          (shrineWarBuffRef.current ? 5 : 0)) *
        SWORDSMAN_CHARGE_DAMAGE_MULT;
      addFloatingText(
        Math.round(nearest.x),
        Math.round(nearest.y),
        `⚔️-${dmg}`,
        '#ef4444'
      );
      addFloatingText(
        Math.round(sw.x),
        Math.round(sw.y),
        '⚡ Charge!',
        '#fbbf24'
      );
      setEnemyGrunts(gs =>
        gs.map(g =>
          g.id === nearest.id ? { ...g, hp: Math.max(0, g.hp - dmg) } : g
        )
      );
    });
    setWorkers(ws =>
      ws.map(w =>
        swords.some(s => s.id === w.id)
          ? { ...w, chargeCooldown: SWORDSMAN_CHARGE_COOLDOWN_S }
          : w
      )
    );
  }, [addFloatingText]);

  const handleCavalrySprint = useCallback(() => {
    const cav = workersRef.current.filter(
      w => w.selected && w.unitType === 'cavalry' && w.sprintCooldown <= 0
    );
    if (cav.length === 0) return;
    Snd.charge();
    const ids = new Set(cav.map(w => w.id));
    setWorkers(ws =>
      ws.map(w =>
        ids.has(w.id)
          ? { ...w, sprinting: true, sprintCooldown: CAVALRY_SPRINT_COOLDOWN_S }
          : w
      )
    );
    cav.forEach(c =>
      addFloatingText(Math.round(c.x), Math.round(c.y), '🐴 Sprint!', '#f59e0b')
    );
    window.setTimeout(() => {
      setWorkers(ws =>
        ws.map(w => (ids.has(w.id) ? { ...w, sprinting: false } : w))
      );
    }, CAVALRY_SPRINT_DURATION_MS);
  }, [addFloatingText]);

  // Chicken wander — move each chicken to an adjacent clear tile every ~2s
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => {
      setChickens(cs =>
        cs.map(c => {
          const dirs = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 0 },
          ];
          const shuffled = dirs.sort(() => Math.random() - 0.5);
          for (const d of shuffled) {
            const nx = c.x + d.dx,
              ny = c.y + d.dy;
            if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE)
              continue;
            if (
              INITIAL_TILES[nx]?.[ny] === 'water' ||
              INITIAL_TILES[nx]?.[ny] === 'tree'
            )
              continue;
            // Stay within 5 tiles of barn
            if (Math.abs(nx - BARN_POS.x) > 5 || Math.abs(ny - BARN_POS.y) > 5)
              continue;
            const facing =
              d.dx === -1
                ? (-1 as const)
                : d.dx === 1
                  ? (1 as const)
                  : c.facing;
            return { ...c, x: nx, y: ny, facing };
          }
          return c;
        })
      );
    }, 2000);
    return () => clearInterval(id);
  }, [gameOver]);

  const isTileOccupied = useCallback(
    (x: number, y: number): boolean => {
      if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return true;
      if (tiles[x]?.[y] === 'water') return true;
      if (x === BARN_POS.x && y === BARN_POS.y) return true;
      if (x === ENEMY_BARN_POS.x && y === ENEMY_BARN_POS.y) return true;
      if (trees.some(t => t.x === x && t.y === y && t.amount > 0)) return true;
      if (goldMines.some(m => m.x === x && m.y === y && m.amount > 0))
        return true;
      if (stoneNodes.some(s => s.x === x && s.y === y && s.amount > 0))
        return true;
      if (placedBuildings.some(b => b.x === x && b.y === y)) return true;
      return false;
    },
    [tiles, trees, goldMines, stoneNodes, placedBuildings]
  );

  const clientToSvg = useCallback((cx: number, cy: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = cx;
    pt.y = cy;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }, []);

  const FORMATION_OFFSETS_BY_MODE: Record<
    string,
    { dx: number; dy: number }[]
  > = {
    cluster: [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: -1 },
    ],
    line: [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 2, dy: 0 },
      { dx: -2, dy: 0 },
      { dx: 3, dy: 0 },
      { dx: -3, dy: 0 },
      { dx: 4, dy: 0 },
      { dx: -4, dy: 0 },
    ],
    wedge: [
      { dx: 0, dy: 0 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: 1 },
      { dx: -2, dy: 2 },
      { dx: 0, dy: 2 },
      { dx: 2, dy: 2 },
      { dx: -3, dy: 3 },
      { dx: -1, dy: 3 },
      { dx: 1, dy: 3 },
    ],
    box: [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: 1 },
      { dx: 0, dy: 2 },
      { dx: 1, dy: 2 },
      { dx: -1, dy: 2 },
    ],
  };
  const getFormationOffsets = () =>
    FORMATION_OFFSETS_BY_MODE[formationModeRef.current] ??
    FORMATION_OFFSETS_BY_MODE.cluster!;

  /** Issue a move command to selected workers using A*; spreads into formation when pure move */
  const commandMove = useCallback(
    (
      targetX: number,
      targetY: number,
      gathering?: WorkerState['gathering'],
      attacking?: WorkerState['attacking']
    ) => {
      // Flash move-target ring at destination (only for pure moves, not gather/attack)
      if (!gathering && !attacking) {
        const { isoX, isoY } = tileToSvg(targetX, targetY);
        setMoveRing({
          svgX: isoX + TILE_SIZE / 2,
          svgY: isoY + TILE_SIZE / 4,
          born: Date.now(),
        });
        Snd.move();
      }
      setWorkers(ws => {
        const selected = ws.filter(w => w.selected);
        // Voice acknowledgement — pick one speaker from selected units
        const speaker = selected[Math.floor(Math.random() * selected.length)];
        if (speaker) {
          const lines = attacking
            ? (ACK_ATTACK[speaker.unitType] ?? ACK_ATTACK.farmer)
            : (ACK_MOVE[speaker.unitType] ?? ACK_MOVE.farmer);
          const ack = pickAck(lines ?? []);
          if (ack)
            addFloatingText(
              Math.round(speaker.x),
              Math.round(speaker.y),
              ack,
              '#fde68a'
            );
        }
        let idx = 0;
        return ws.map(w => {
          if (!w.selected) return w;
          if (
            gathering &&
            (w.unitType === 'swordsman' ||
              w.unitType === 'catapult' ||
              w.unitType === 'trebuchet' ||
              w.unitType === 'hero' ||
              w.unitType === 'cavalry')
          )
            return w;
          const isFormation = !gathering && !attacking;
          const offset = isFormation
            ? (getFormationOffsets()[idx++] ?? { dx: 0, dy: 0 })
            : { dx: 0, dy: 0 };
          const tx = Math.max(0, Math.min(GRID_SIZE - 1, targetX + offset.dx));
          const ty = Math.max(0, Math.min(GRID_SIZE - 1, targetY + offset.dy));
          const dest =
            INITIAL_TILES[tx]?.[ty] === 'water'
              ? { x: targetX, y: targetY }
              : { x: tx, y: ty };
          const startTile = { x: Math.round(w.x), y: Math.round(w.y) };
          const rawPath = aStar(INITIAL_TILES, startTile, dest);
          const first = rawPath[0] ?? dest;
          return {
            ...w,
            movingTo: first,
            path: rawPath.slice(1),
            gathering: gathering ?? null,
            attacking: attacking ?? null,
            repairing: null,
            attackMove: false,
            attackMoveTarget: null,
            patrol: null,
            holdPosition: false,
            waypoints: [],
            state: 'moving',
          };
        });
      });
    },
    [addFloatingText]
  );

  // Shift+right-click: append waypoint to queue
  const commandQueueMove = useCallback((targetX: number, targetY: number) => {
    setWorkers(ws => {
      const selected = ws.filter(w => w.selected);
      let idx = 0;
      return ws.map(w => {
        if (!w.selected) return w;
        const offset = getFormationOffsets()[idx++] ?? { dx: 0, dy: 0 };
        const tx = Math.max(0, Math.min(GRID_SIZE - 1, targetX + offset.dx));
        const ty = Math.max(0, Math.min(GRID_SIZE - 1, targetY + offset.dy));
        const dest =
          INITIAL_TILES[tx]?.[ty] === 'water'
            ? { x: targetX, y: targetY }
            : { x: tx, y: ty };
        // If unit is idle or has no movingTo, start moving immediately; otherwise append waypoint
        if (!w.movingTo && w.state !== 'moving') {
          const startTile = { x: Math.round(w.x), y: Math.round(w.y) };
          const rawPath = aStar(INITIAL_TILES, startTile, dest);
          return {
            ...w,
            movingTo: rawPath[0] ?? dest,
            path: rawPath.slice(1),
            gathering: null,
            attacking: null,
            repairing: null,
            patrol: null,
            waypoints: [],
            state: 'moving' as const,
          };
        }
        return { ...w, waypoints: [...(w.waypoints ?? []), dest] };
      });
    });
  }, []);

  // Mouse handlers
  const handleSvgMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (e.button !== 0 || buildMode) return;
      const coords = clientToSvg(e.clientX, e.clientY);
      if (!coords) return;
      isDraggingRef.current = true;
      setDragBox({
        start: { x: coords.x, y: coords.y },
        end: { x: coords.x, y: coords.y },
      });
    },
    [clientToSvg, buildMode]
  );

  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (buildMode) {
        const coords = clientToSvg(e.clientX, e.clientY);
        if (coords) {
          const { tx, ty } = svgToTile(coords.x, coords.y);
          setGhostTile({ x: tx, y: ty });
        }
        return;
      }
      if (!isDraggingRef.current) return;
      const coords = clientToSvg(e.clientX, e.clientY);
      if (coords)
        setDragBox(db =>
          db ? { ...db, end: { x: coords.x, y: coords.y } } : null
        );
    },
    [clientToSvg, buildMode]
  );

  const handleSvgMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (buildMode && e.button === 0) {
        const coords = clientToSvg(e.clientX, e.clientY);
        if (coords) {
          const { tx, ty } = svgToTile(coords.x, coords.y);
          if (!isTileOccupied(tx, ty)) {
            const cost = BUILDING_COSTS[buildMode];
            if (
              resources.gold >= cost.gold &&
              resources.lumber >= cost.lumber &&
              resources.stone >= cost.stone
            ) {
              setResources(r => ({
                ...r,
                gold: r.gold - cost.gold,
                lumber: r.lumber - cost.lumber,
                stone: r.stone - cost.stone,
              }));
              setPlacedBuildings(bs => {
                const maxHp = BUILDING_MAX_HP[buildMode];
                return [
                  ...bs,
                  {
                    id: buildingIdRef.current++,
                    type: buildMode,
                    x: tx,
                    y: ty,
                    hp: 1,
                    maxHp,
                    constructing: true,
                    constructedAt: Date.now(),
                  },
                ];
              });
            }
            setBuildMode(null);
            setGhostTile(null);
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
        if (
          Math.abs(end.x - db.start.x) > 8 ||
          Math.abs(end.y - db.start.y) > 8
        ) {
          const minX = Math.min(db.start.x, end.x),
            maxX = Math.max(db.start.x, end.x);
          const minY = Math.min(db.start.y, end.y),
            maxY = Math.max(db.start.y, end.y);
          setWorkers(ws => {
            const hit = ws.filter(w => {
              const { isoX, isoY } = tileToSvg(w.x, w.y);
              const wx = isoX + TILE_SIZE / 2,
                wy = isoY + 18;
              return wx >= minX && wx <= maxX && wy >= minY && wy <= maxY;
            });
            if (hit.length === 0) return ws;
            setSelectedType('worker');
            const hitIds = new Set(hit.map(w => w.id));
            return ws.map(w => ({ ...w, selected: hitIds.has(w.id) }));
          });
        }
        return null;
      });
    },
    [clientToSvg, buildMode, isTileOccupied]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBuildMode(null);
        setGhostTile(null);
        setPatrolMode(false);
        setAttackMoveMode(false);
      }
      if (
        e.key === ' ' &&
        !e.ctrlKey &&
        !e.metaKey &&
        (e.target as HTMLElement).tagName !== 'INPUT'
      ) {
        e.preventDefault();
        if (!gameOverRef.current) setGameSpeed(s => (s === 0 ? 1 : 0));
      }
      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
        setWorkers(ws => {
          if (ws.some(w => w.selected)) {
            setPatrolMode(m => !m);
          }
          return ws;
        });
      }
      if ((e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.metaKey) {
        setWorkers(ws => {
          if (
            ws.some(
              w =>
                w.selected &&
                w.unitType !== 'farmer' &&
                w.unitType !== 'catapult' &&
                w.unitType !== 'trebuchet'
            )
          ) {
            setAttackMoveMode(m => !m);
          }
          return ws;
        });
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
        setWorkers(ws =>
          ws.map(w => (w.hp > 0 ? { ...w, selected: true } : w))
        );
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
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA'
      )
        return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleFarmhouseAction('train');
      }
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        handleFarmhouseAction('trainSwordsman');
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleFarmhouseAction('trainCavalry');
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        setWorkers(ws =>
          ws.map(w =>
            w.selected
              ? {
                  ...w,
                  movingTo: null,
                  path: [],
                  gathering: null,
                  attacking: null,
                  repairing: null,
                  attackMove: false,
                  attackMoveTarget: null,
                  patrol: null,
                  holdPosition: false,
                  waypoints: [],
                  state: 'idle' as const,
                }
              : w
          )
        );
      }
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handleGarrison();
      }
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleEarthquake();
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleSwordsmanCharge();
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleCavalrySprint();
      }
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setWorkers(ws =>
          ws.map(w =>
            w.selected
              ? {
                  ...w,
                  holdPosition: true,
                  movingTo: null,
                  path: [],
                  patrol: null,
                  attackMove: false,
                  attackMoveTarget: null,
                  waypoints: [],
                  state: 'idle' as const,
                }
              : w
          )
        );
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        setWorkers(ws => {
          const idleWorkers = ws.filter(
            w =>
              w.hp > 0 &&
              w.state === 'idle' &&
              !w.gathering &&
              !w.attacking &&
              !w.repairing
          );
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
            setCamera({
              x: rect.width / 2 - isoX - TILE_SIZE / 2,
              y: rect.height / 2 - isoY - 18,
            });
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
        setWorkers(ws =>
          ws.map(w =>
            w.selected
              ? { ...w, group: num }
              : w.group === num
                ? { ...w, group: null }
                : w
          )
        );
      } else {
        setControlGroups(cg => {
          const ids = cg[num];
          if (!ids?.length) return cg;
          setSelectedType('worker');
          setWorkers(ws =>
            ws.map(w => ({ ...w, selected: ids.includes(w.id) }))
          );
          // Double-tap: center camera on group centroid
          const now = Date.now();
          const last = lastGroupKeyRef.current;
          if (last && last.num === num && now - last.t < 500) {
            const units = workersRef.current.filter(
              w => ids.includes(w.id) && w.hp > 0
            );
            if (units.length > 0) {
              const cx = units.reduce((s, u) => s + u.x, 0) / units.length;
              const cy = units.reduce((s, u) => s + u.y, 0) / units.length;
              const { isoX, isoY } = tileToSvg(cx, cy);
              const svgEl = svgRef.current;
              if (svgEl) {
                const rect = svgEl.getBoundingClientRect();
                setCamera({
                  x: rect.width / 2 - isoX - TILE_SIZE / 2,
                  y: rect.height / 2 - isoY - 18,
                });
              }
            }
            lastGroupKeyRef.current = null;
          } else {
            lastGroupKeyRef.current = { num, t: now };
          }
          return cg;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [workers]);

  useGameLoop(gameCtx);

  // ---------- Bot / Demo mode ----------
  const isDemo = difficulty?.id === 'demo';
  const botSnapshotRef = useRef<BotSnapshot | null>(null);
  useEffect(() => {
    botSnapshotRef.current = {
      resources,
      workers,
      placedBuildings,
      tiles,
      wave,
      farmhouse,
      gameOver,
    };
  }, [resources, workers, placedBuildings, tiles, wave, farmhouse, gameOver]);

  const botCommands = useMemo<BotCommands>(
    () => ({
      orderGather: (workerId, resourceType, resourceIdx) => {
        const nodes =
          resourceType === 'gold'
            ? goldMinesRef.current
            : resourceType === 'tree'
              ? treesRef.current
              : stoneNodesRef.current;
        const node = nodes[resourceIdx];
        if (!node) return;
        setWorkers(ws =>
          ws.map(w => {
            if (w.id !== workerId || w.hp <= 0) return w;
            const dest = { x: node.x, y: node.y };
            const path = aStar(
              INITIAL_TILES,
              { x: Math.round(w.x), y: Math.round(w.y) },
              dest
            );
            return {
              ...w,
              movingTo: path[0] ?? dest,
              path: path.slice(1),
              gathering: { type: resourceType, idx: resourceIdx },
              attacking: null,
              state: 'moving' as const,
              selected: false,
            };
          })
        );
      },

      orderAttack: (workerId, target) => {
        setWorkers(ws =>
          ws.map(w => {
            if (w.id !== workerId || w.hp <= 0) return w;
            return {
              ...w,
              attacking: target,
              gathering: null,
              movingTo: null,
              path: [],
              state: 'attacking' as const,
              selected: false,
            };
          })
        );
      },

      orderMove: (workerId, tx, ty) => {
        setWorkers(ws =>
          ws.map(w => {
            if (w.id !== workerId || w.hp <= 0) return w;
            const dest = { x: tx, y: ty };
            const path = aStar(
              INITIAL_TILES,
              { x: Math.round(w.x), y: Math.round(w.y) },
              dest
            );
            return {
              ...w,
              movingTo: path[0] ?? dest,
              path: path.slice(1),
              attacking: null,
              gathering: null,
              state: 'moving' as const,
              selected: false,
            };
          })
        );
      },

      buildAt: (type, tx, ty) => {
        const snap = botSnapshotRef.current;
        if (!snap) return false;
        const cost = BUILDING_COSTS[type];
        if (!cost) return false;
        if (
          snap.resources.gold < cost.gold ||
          snap.resources.lumber < cost.lumber ||
          snap.resources.stone < cost.stone
        )
          return false;
        const occupied =
          (tx === BARN_POS.x && ty === BARN_POS.y) ||
          (tx === ENEMY_BARN_POS.x && ty === ENEMY_BARN_POS.y) ||
          (tiles[tx]?.[ty] === 'water') ||
          (tiles[tx]?.[ty] === 'tree') ||
          (tiles[tx]?.[ty] === 'rock') ||
          placedBuildingsRef.current.some(b => b.x === tx && b.y === ty) ||
          treesRef.current.some(t => t.x === tx && t.y === ty && t.amount > 0) ||
          goldMinesRef.current.some(m => m.x === tx && m.y === ty && m.amount > 0) ||
          stoneNodesRef.current.some(s => s.x === tx && s.y === ty && s.amount > 0);
        if (occupied) return false;
        setResources(r => ({
          ...r,
          gold: r.gold - cost.gold,
          lumber: r.lumber - cost.lumber,
          stone: r.stone - cost.stone,
        }));
        setPlacedBuildings(bs => [
          ...bs,
          {
            id: buildingIdRef.current++,
            type,
            x: tx,
            y: ty,
            hp: 1,
            maxHp: BUILDING_MAX_HP[type] ?? 100,
            constructing: true,
            constructedAt: Date.now(),
          },
        ]);
        return true;
      },

      trainFarmer: () => {
        const snap = botSnapshotRef.current;
        if (!snap) return false;
        if (snap.resources.gold < 30 || snap.resources.food >= snap.resources.foodCap)
          return false;
        if (!snap.farmhouse.built) return false;
        setResources(r => ({ ...r, gold: r.gold - 30, food: r.food + 1 }));
        setWorkers(ws => {
          const newId = Math.max(...ws.map(w => w.id), 0) + 1;
          return [...ws, makeWorker(newId, BARN_POS.x, BARN_POS.y)];
        });
        return true;
      },

      trainSwordsman: () => {
        const snap = botSnapshotRef.current;
        if (!snap) return false;
        if (
          snap.resources.gold < 50 ||
          snap.resources.food >= snap.resources.foodCap
        )
          return false;
        setResources(r => ({ ...r, gold: r.gold - 50, food: r.food + 1 }));
        setTrainingQueue(q => [...q, { type: 'swordsman' }]);
        return true;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useBotController(gameCtx, botCommands, botSnapshotRef, isDemo);

  // Demo mode: auto-restart 5 s after game over so it loops as a showcase
  useEffect(() => {
    if (!isDemo || !gameOver) return;
    const id = window.setTimeout(() => {
      if (onNewGame) onNewGame();
    }, 5000);
    return () => window.clearTimeout(id);
  }, [isDemo, gameOver, onNewGame]);

  // Scroll-wheel zoom anchored to cursor position
  useEffect(() => {
    const svgEl = svgRef.current;

    const applyZoom = (newZoom: number, anchorX: number, anchorY: number) => {
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      // anchor in SVG element coords (before camera translate)
      const svgCenterX = rect.left + rect.width / 2;
      const svgCenterY = rect.top + rect.height / 2;
      const ax = anchorX - svgCenterX;
      const ay = anchorY - svgCenterY;
      setZoom(prevZoom => {
        const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
        const ratio = clamped / prevZoom;
        // Shift camera so world point under cursor stays fixed
        setCamera(c => ({
          x: ax + (c.x - ax) * ratio,
          y: ay + (c.y - ay) * ratio,
        }));
        return clamped;
      });
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setZoom(prev => {
        const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev + delta));
        if (!svgEl) return next;
        const rect = svgEl.getBoundingClientRect();
        const svgCenterX = rect.left + rect.width / 2;
        const svgCenterY = rect.top + rect.height / 2;
        const ax = e.clientX - svgCenterX;
        const ay = e.clientY - svgCenterY;
        const ratio = next / prev;
        setCamera(c => ({
          x: ax + (c.x - ax) * ratio,
          y: ay + (c.y - ay) * ratio,
        }));
        return next;
      });
    };

    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === '=' || e.key === '+')
        applyZoom(999, window.innerWidth / 2, window.innerHeight / 2);
      if (e.key === '-' || e.key === '_')
        applyZoom(-999, window.innerWidth / 2, window.innerHeight / 2);
    };
    // reuse applyZoom for +/- by clamping to next step
    const onKeyFull = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === '=' || e.key === '+') {
        setZoom(prev => {
          const next = Math.min(ZOOM_MAX, prev + ZOOM_STEP);
          return next;
        });
      }
      if (e.key === '-' || e.key === '_') {
        setZoom(prev => {
          const next = Math.max(ZOOM_MIN, prev - ZOOM_STEP);
          return next;
        });
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyFull);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyFull);
    };
  }, []);

  // Smooth WASD/Arrow camera pan using held-key tracking + RAF
  useEffect(() => {
    const bounds = {
      minX: -(GRID_SIZE * TILE_SIZE),
      maxX: GRID_SIZE * TILE_SIZE,
      minY: -200,
      maxY: GRID_SIZE * TILE_SIZE,
    };
    const PAN_SPEED = 480; // px/sec
    const held = new Set<string>();
    let rafId = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (held.size > 0) {
        const up = held.has('ArrowUp') || held.has('w') || held.has('W');
        const down = held.has('ArrowDown') || held.has('s') || held.has('S');
        const left = held.has('ArrowLeft') || held.has('a') || held.has('A');
        const right = held.has('ArrowRight') || held.has('d') || held.has('D');
        const dx = (left ? 1 : 0) - (right ? 1 : 0);
        const dy = (up ? 1 : 0) - (down ? 1 : 0);
        if (dx !== 0 || dy !== 0) {
          setCamera(c => ({
            x: Math.max(
              bounds.minX,
              Math.min(bounds.maxX, c.x + dx * PAN_SPEED * dt)
            ),
            y: Math.max(
              bounds.minY,
              Math.min(bounds.maxY, c.y + dy * PAN_SPEED * dt)
            ),
          }));
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(t => {
      last = t;
      rafId = requestAnimationFrame(tick);
    });

    const onKeyDown = (e: KeyboardEvent) => {
      const panKeys = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'w',
        'W',
        'a',
        'A',
        's',
        'S',
        'd',
        'D',
      ];
      if (!panKeys.includes(e.key)) return;
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA'
      )
        return;
      e.preventDefault();
      held.add(e.key);
    };
    const onKeyUp = (e: KeyboardEvent) => held.delete(e.key);
    const onBlur = () => held.clear();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Mouse edge-scroll — pan when cursor is within EDGE_ZONE px of viewport edge
  useEffect(() => {
    const EDGE_ZONE = 48;
    const PAN_SPEED = 400;
    const bounds = {
      minX: -(GRID_SIZE * TILE_SIZE),
      maxX: GRID_SIZE * TILE_SIZE,
      minY: -200,
      maxY: GRID_SIZE * TILE_SIZE,
    };
    let mx = -1,
      my = -1,
      rafId = 0,
      last = 0;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let dx = 0,
        dy = 0;
      if (mx >= 0) {
        if (mx < EDGE_ZONE) dx = 1;
        else if (mx > vw - EDGE_ZONE) dx = -1;
        if (my < EDGE_ZONE) dy = 1;
        else if (my > vh - EDGE_ZONE) dy = -1;
      }
      if (dx !== 0 || dy !== 0) {
        setCamera(c => ({
          x: Math.max(
            bounds.minX,
            Math.min(bounds.maxX, c.x + dx * PAN_SPEED * dt)
          ),
          y: Math.max(
            bounds.minY,
            Math.min(bounds.maxY, c.y + dy * PAN_SPEED * dt)
          ),
        }));
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(t => {
      last = t;
      rafId = requestAnimationFrame(tick);
    });

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const selectedWorkers = workers.filter(w => w.selected);
  const anySelected = selectedWorkers.length > 0;
  const viewBoxW = GRID_SIZE * TILE_SIZE * 2 + 200;
  const viewBoxH = GRID_SIZE * TILE_SIZE + 200;

  const handleFarmhouseAction = (action: FarmhouseAction) => {
    if (action === 'build' || action === 'upgrade') {
      const level = farmhouse.built ? farmhouse.level : 0;
      const cost = farmhouseUpgradeCosts[level];
      if (!cost || (farmhouse.built && farmhouse.level >= maxFarmhouseLevel))
        return;
      if (resources.gold < cost.gold || resources.lumber < cost.lumber) return;
      setResources(r => ({
        ...r,
        gold: r.gold - cost.gold,
        lumber: r.lumber - cost.lumber,
      }));
      setFarmhouse(fh =>
        fh.built
          ? { built: true, level: fh.level + 1 }
          : { built: true, level: 1 }
      );
      setResources(r => ({
        ...r,
        foodCap: FOOD_CAP_BASE + (farmhouse.level + 1) * FOOD_CAP_PER_LEVEL,
      }));
    } else if (action === 'train') {
      if (resources.gold < 30 || resources.food >= resources.foodCap) return;
      setResources(r => ({ ...r, gold: r.gold - 30, food: r.food + 1 }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [
            ...ws,
            {
              ...makeWorker(newId, BARN_POS.x, BARN_POS.y),
              movingTo: path[0] ?? rp,
              path: path.slice(1),
              state: 'moving' as const,
            },
          ];
        }
        return [...ws, makeWorker(newId, BARN_POS.x, BARN_POS.y)];
      });
    } else if (action === 'recruitHero') {
      if (
        heroRecruited ||
        resources.gold < 150 ||
        resources.food >= resources.foodCap
      )
        return;
      setHeroRecruited(true);
      setResources(r => ({ ...r, gold: r.gold - 150, food: r.food + 1 }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const hero = makeUnit(newId, BARN_POS.x, BARN_POS.y, 'hero');
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [
            ...ws,
            {
              ...hero,
              movingTo: path[0] ?? rp,
              path: path.slice(1),
              state: 'moving',
            },
          ];
        }
        return [...ws, hero];
      });
    } else if (action === 'trainSwordsman') {
      if (
        resources.gold < 50 ||
        resources.food >= resources.foodCap ||
        trainingQueue.length >= 5
      )
        return;
      setResources(r => ({ ...r, gold: r.gold - 50, food: r.food + 1 }));
      setTrainingQueue(q => [...q, { type: 'swordsman' }]);
    } else if (action === 'trainCavalry') {
      if (
        resources.gold < 60 ||
        resources.food >= resources.foodCap ||
        trainingQueue.length >= 5
      )
        return;
      setResources(r => ({ ...r, gold: r.gold - 60, food: r.food + 1 }));
      setTrainingQueue(q => [...q, { type: 'cavalry' }]);
    } else if (action === 'trainCatapult') {
      if (
        resources.gold < 150 ||
        resources.lumber < 80 ||
        resources.food >= resources.foodCap
      )
        return;
      setResources(r => ({
        ...r,
        gold: r.gold - 150,
        lumber: r.lumber - 80,
        food: r.food + 1,
      }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [
            ...ws,
            {
              ...makeUnit(newId, BARN_POS.x, BARN_POS.y, 'catapult'),
              movingTo: path[0] ?? rp,
              path: path.slice(1),
              state: 'moving' as const,
            },
          ];
        }
        return [...ws, makeUnit(newId, BARN_POS.x, BARN_POS.y, 'catapult')];
      });
    } else if (action === 'trainTrebuchet') {
      if (
        resources.gold < 200 ||
        resources.lumber < 80 ||
        resources.stone < 60 ||
        resources.food >= resources.foodCap
      )
        return;
      setResources(r => ({
        ...r,
        gold: r.gold - 200,
        lumber: r.lumber - 80,
        stone: r.stone - 60,
        food: r.food + 1,
      }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [
            ...ws,
            {
              ...makeUnit(newId, BARN_POS.x, BARN_POS.y, 'trebuchet'),
              movingTo: path[0] ?? rp,
              path: path.slice(1),
              state: 'moving' as const,
            },
          ];
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
      const cost =
        level === 0 ? { gold: 80, stone: 60 } : { gold: 160, stone: 120 };
      if (resources.gold < cost.gold || resources.stone < cost.stone) return;
      setResources(r => ({
        ...r,
        gold: r.gold - cost.gold,
        stone: r.stone - cost.stone,
      }));
      setBlacksmithUpgrades(u => ({ ...u, steelEdge: u.steelEdge + 1 }));
      addFloatingText(
        BARN_POS.x,
        BARN_POS.y,
        `⚔️ Steel Edge ${level + 1}!`,
        '#f59e0b'
      );
    } else if (action === 'blacksmith:ironHide') {
      const level = blacksmithUpgrades.ironHide;
      if (level >= 2) return;
      const cost =
        level === 0 ? { gold: 80, lumber: 50 } : { gold: 160, lumber: 100 };
      if (resources.gold < cost.gold || resources.lumber < cost.lumber) return;
      setResources(r => ({
        ...r,
        gold: r.gold - cost.gold,
        lumber: r.lumber - cost.lumber,
      }));
      setBlacksmithUpgrades(u => ({ ...u, ironHide: u.ironHide + 1 }));
      addFloatingText(
        BARN_POS.x,
        BARN_POS.y,
        `🛡️ Iron Hide ${level + 1}!`,
        '#38bdf8'
      );
    } else if (action === 'guardTower') {
      if (guardTowerResearched || resources.gold < 120 || resources.stone < 80)
        return;
      setResources(r => ({ ...r, gold: r.gold - 120, stone: r.stone - 80 }));
      setGuardTowerResearched(true);
      addFloatingText(BARN_POS.x, BARN_POS.y, '🏰 Guard Tower!', '#22d3ee');
    } else if (action === 'barracks:veteranTraining') {
      if (
        barracksTech.veteranTraining ||
        resources.gold < 100 ||
        resources.lumber < 60
      )
        return;
      setResources(r => ({ ...r, gold: r.gold - 100, lumber: r.lumber - 60 }));
      setBarracksTech(t => ({ ...t, veteranTraining: true }));
      // Apply +20 maxHp to all existing combat units
      setWorkers(ws =>
        ws.map(w =>
          w.unitType === 'swordsman' ||
          w.unitType === 'cavalry' ||
          w.unitType === 'hero'
            ? { ...w, maxHp: w.maxHp + 20, hp: w.hp + 20 }
            : w
        )
      );
      addFloatingText(
        BARN_POS.x,
        BARN_POS.y,
        '🛡️ Veteran Training!',
        '#f87171'
      );
    } else if (action === 'barracks:warDrums') {
      if (
        barracksTech.warDrums ||
        resources.gold < 120 ||
        resources.lumber < 40
      )
        return;
      setResources(r => ({ ...r, gold: r.gold - 120, lumber: r.lumber - 40 }));
      setBarracksTech(t => ({ ...t, warDrums: true }));
      addFloatingText(BARN_POS.x, BARN_POS.y, '🥁 War Drums!', '#fb923c');
    } else if (action.startsWith('upgradeWall:')) {
      const bid = parseInt(action.split(':')[1] ?? '0');
      const wall = placedBuildings.find(
        b => b.id === bid && b.type === 'wall' && !b.upgraded
      );
      if (!wall || resources.gold < 50 || resources.stone < 20) return;
      setResources(r => ({ ...r, gold: r.gold - 50, stone: r.stone - 20 }));
      setPlacedBuildings(bs =>
        bs.map(b =>
          b.id === bid
            ? {
                ...b,
                upgraded: true,
                maxHp: 350,
                hp: Math.min(b.hp + 230, 350),
              }
            : b
        )
      );
      addFloatingText(wall.x, wall.y, '🪨 Stone Wall!', '#94a3b8');
    } else if (action.startsWith('build:')) {
      const btype = action.split(':')[1] as BuildingType;
      if (BUILDING_COSTS[btype]) {
        const req = BUILDING_REQUIRES[btype];
        const prereqMet =
          !req ||
          (req === 'farmhouse'
            ? farmhouse.built
            : placedBuildings.some(b => b.type === req && !b.constructing));
        if (prereqMet) setBuildMode(btype);
      }
    }
  };

  const handleWorkerCommand = (cmd: 'stop' | 'gather' | 'attack') => {
    if (cmd === 'stop') {
      Object.values(gatherTimeoutsRef.current).forEach(clearTimeout);
      Object.values(attackTimeoutsRef.current).forEach(clearTimeout);
      gatherTimeoutsRef.current = {};
      attackTimeoutsRef.current = {};
      setPatrolMode(false);
      setWorkers(ws =>
        ws.map(w =>
          w.selected
            ? {
                ...w,
                movingTo: null,
                path: [],
                gathering: null,
                attacking: null,
                repairing: null,
                attackMove: false,
                attackMoveTarget: null,
                patrol: null,
                holdPosition: false,
                waypoints: [],
                state: 'idle',
              }
            : w
        )
      );
    }
  };

  const handleResearch = (type: keyof Upgrades) => {
    const currentLevel = upgrades[type];
    if (currentLevel >= UPGRADE_MAX) return;
    const cost = UPGRADE_COSTS[type][currentLevel];
    if (!cost) return;
    if (
      resources.gold < cost.gold ||
      resources.lumber < cost.lumber ||
      resources.stone < cost.stone
    )
      return;
    setResources(r => ({
      ...r,
      gold: r.gold - cost.gold,
      lumber: r.lumber - cost.lumber,
      stone: r.stone - cost.stone,
    }));
    setUpgrades(u => ({ ...u, [type]: u[type] + 1 }));
    if (type === 'ironWill') {
      const hpBonus = 25;
      setWorkers(ws =>
        ws.map(w => ({
          ...w,
          maxHp: w.maxHp + hpBonus,
          hp: Math.min(w.hp + hpBonus, w.maxHp + hpBonus),
        }))
      );
    }
  };

  const handleAssistConstruction = useCallback(
    (buildingId: number, bx: number, by: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (anySelected) {
        // Send selected farmers to assist
        const target = { x: bx, y: by };
        setWorkers(ws =>
          ws.map(w => {
            if (!w.selected || w.unitType !== 'farmer') return w;
            const start = { x: Math.round(w.x), y: Math.round(w.y) };
            const path = aStar(INITIAL_TILES, start, target);
            return {
              ...w,
              movingTo: path[0] ?? target,
              path: path.slice(1),
              gathering: null,
              attacking: null,
              repairing: null,
              assistBuildId: buildingId,
              patrol: null,
              state: 'moving' as const,
            };
          })
        );
        addFloatingText(bx, by, '🔨 Assist!', '#fbbf24');
      } else {
        // Cancel construction — 50% resource refund
        setPlacedBuildings(bs => {
          const b = bs.find(x => x.id === buildingId);
          if (!b) return bs;
          const cost = BUILDING_COSTS[b.type];
          if (cost) {
            setResources(r => ({
              ...r,
              gold: r.gold + Math.floor(cost.gold * 0.5),
              lumber: r.lumber + Math.floor(cost.lumber * 0.5),
              stone: r.stone + Math.floor(cost.stone * 0.5),
            }));
          }
          setWorkers(ws =>
            ws.map(w =>
              w.assistBuildId === buildingId
                ? { ...w, assistBuildId: undefined, state: 'idle' as const }
                : w
            )
          );
          addFloatingText(bx, by, '❌ Cancelled', '#f87171');
          return bs.filter(x => x.id !== buildingId);
        });
      }
    },
    [anySelected, addFloatingText]
  );

  const handleRepairBuilding = useCallback(
    (buildingId: number, bx: number, by: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const target = { x: bx, y: by };
      setWorkers(ws =>
        ws.map(w => {
          if (
            !w.selected ||
            w.unitType === 'catapult' ||
            w.unitType === 'trebuchet'
          )
            return w;
          const start = { x: Math.round(w.x), y: Math.round(w.y) };
          const path = aStar(INITIAL_TILES, start, target);
          return {
            ...w,
            movingTo: path[0] ?? target,
            path: path.slice(1),
            gathering: null,
            attacking: null,
            repairing: { buildingId },
            patrol: null,
            state: 'moving' as const,
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackEnemyBarn = (e: React.MouseEvent) => {
    e.preventDefault();
    if (enemyBarnHp <= 0 || !anySelected) return;
    const adjTile = { x: ENEMY_BARN_POS.x - 1, y: ENEMY_BARN_POS.y };
    commandMove(adjTile.x, adjTile.y, null, { targetType: 'enemyBarn' });
  };

  const handleAttackEnemyTower = (
    towerId: number,
    tx: number,
    ty: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    if (!anySelected) return;
    const adj = { x: Math.max(0, tx - 1), y: ty };
    commandMove(adj.x, adj.y, null, { targetType: 'enemyTower', towerId });
  };

  const handleAttackEnemyWall = (
    wallId: number,
    tx: number,
    ty: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    if (!anySelected) return;
    setWorkers(ws =>
      ws.map(w => {
        if (!w.selected) return w;
        const path = aStar(
          INITIAL_TILES,
          { x: Math.round(w.x), y: Math.round(w.y) },
          { x: tx, y: ty }
        );
        return {
          ...w,
          movingTo: path[0] ?? { x: tx, y: ty },
          path: path.slice(1),
          gathering: null,
          attacking: { targetType: 'enemyWall' as const, wallId },
          state: 'moving' as const,
        };
      })
    );
  };

  const handleAttackGrunt = useCallback(
    (gruntId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const grunt = enemyGruntsRef.current.find(g => g.id === gruntId);
      if (!grunt) return;
      const tx = Math.round(grunt.x),
        ty = Math.round(grunt.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'grunt' as const, gruntId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackSiege = useCallback(
    (siegeId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const ram = enemySiegeRef.current.find(r => r.id === siegeId);
      if (!ram) return;
      const tx = Math.round(ram.x),
        ty = Math.round(ram.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'siege' as const, siegeId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackShaman = useCallback(
    (shamanId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const shaman = enemyShamansRef.current.find(s => s.id === shamanId);
      if (!shaman) return;
      const tx = Math.round(shaman.x),
        ty = Math.round(shaman.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'shaman' as const, shamanId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackNecromancer = useCallback(
    (necroId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const necro = enemyNecromancersRef.current.find(n => n.id === necroId);
      if (!necro) return;
      const tx = Math.round(necro.x),
        ty = Math.round(necro.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: {
              targetType: 'necromancer' as const,
              necromancerId: necroId,
            },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackWitchDoctor = useCallback(
    (wdId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const wd = enemyWitchDoctorsRef.current.find(d => d.id === wdId);
      if (!wd) return;
      const tx = Math.round(wd.x),
        ty = Math.round(wd.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: {
              targetType: 'witchDoctor' as const,
              witchDoctorId: wdId,
            },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackWarchief = useCallback(
    (warchiefId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const wc = enemyWarchiefsRef.current.find(w2 => w2.id === warchiefId);
      if (!wc) return;
      const tx = Math.round(wc.x),
        ty = Math.round(wc.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'warchief' as const, warchiefId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackWarlord = useCallback(
    (warlordId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const wl = enemyWarlordsRef.current.find(w2 => w2.id === warlordId);
      if (!wl) return;
      const tx = Math.round(wl.x),
        ty = Math.round(wl.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'warlord' as const, warlordId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackLurker = useCallback(
    (lurkerId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const lk = enemyLurkersRef.current.find(l => l.id === lurkerId);
      if (!lk) return;
      const tx = Math.round(lk.x),
        ty = Math.round(lk.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'lurker' as const, lurkerId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackTroll = useCallback(
    (trollId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const troll = enemyTrollsRef.current.find(t => t.id === trollId);
      if (!troll) return;
      const tx = Math.round(troll.x),
        ty = Math.round(troll.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'troll' as const, trollId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackSapper = useCallback(
    (sapperId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const sapper = enemySappersRef.current.find(s => s.id === sapperId);
      if (!sapper) return;
      const tx = Math.round(sapper.x),
        ty = Math.round(sapper.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'sapper' as const, sapperId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackCreep = useCallback(
    (creepId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const creep = neutralCreepsRef.current.find(c => c.id === creepId);
      if (!creep) return;
      const tx = Math.round(creep.x),
        ty = Math.round(creep.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          // Reuse grunt attack state but target creep — we handle damage via attackTimeoutsRef with a creep target type
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'creep' as const, creepId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const minimapData = useMemo(
    () => ({
      workers: workers.map(w => ({ x: w.x, y: w.y, selected: w.selected })),
      grunts: enemyGrunts.map(g => ({ x: g.x, y: g.y })),
      enemyBarnAlive: enemyBarnHp > 0,
      buildings: placedBuildings.map(b => ({ x: b.x, y: b.y, type: b.type })),
      creepCamps: CREEP_CAMPS.map(c => ({
        x: c.x,
        y: c.y,
        cleared: clearedCamps.has(c.id),
      })),
      enemyTowers: enemyTowers
        .filter(t => t.hp > 0)
        .map(t => ({ x: t.x, y: t.y })),
      goldNodes: goldMines
        .filter(m => m.amount > 0)
        .map(m => ({ x: m.x, y: m.y })),
      stoneNodes: stoneNodes
        .filter(n => n.amount > 0)
        .map(n => ({ x: n.x, y: n.y })),
      treeNodes: trees.filter(t => t.amount > 0).map(t => ({ x: t.x, y: t.y })),
      warRams: enemySiege.filter(r => r.hp > 0).map(r => ({ x: r.x, y: r.y })),
      shamans: enemyShamans
        .filter(s => s.hp > 0)
        .map(s => ({ x: s.x, y: s.y })),
      trolls: enemyTrolls.filter(t => t.hp > 0).map(t => ({ x: t.x, y: t.y })),
      sappers: enemySappers
        .filter(s => s.hp > 0 && !s.exploded)
        .map(s => ({ x: s.x, y: s.y })),
      witchDoctors: enemyWitchDoctors
        .filter(d => d.hp > 0)
        .map(d => ({ x: d.x, y: d.y })),
      warchiefs: enemyWarchiefs
        .filter(wc2 => wc2.hp > 0)
        .map(wc2 => ({ x: wc2.x, y: wc2.y })),
      fogExplored,
      attackPings: minimapPings.filter(p => Date.now() - p.t < 2500),
      enemyWalls: enemyWalls
        .filter(ew => ew.hp > 0)
        .map(ew => ({ x: ew.x, y: ew.y })),
      lootCrates: lootCrates.map(c => ({ x: c.x, y: c.y })),
      droppedItems: droppedItems.map(d => ({ x: d.x, y: d.y })),
      warlords: enemyWarlords
        .filter(wl => wl.hp > 0)
        .map(wl => ({ x: wl.x, y: wl.y })),
      lurkers: enemyLurkers
        .filter(lk => lk.hp > 0)
        .map(lk => ({ x: lk.x, y: lk.y })),
    }),
    [
      workers,
      enemyGrunts,
      enemyBarnHp,
      placedBuildings,
      clearedCamps,
      goldMines,
      stoneNodes,
      trees,
      enemyTowers,
      enemySiege,
      enemyShamans,
      enemyTrolls,
      enemySappers,
      enemyWitchDoctors,
      enemyWarchiefs,
      fogExplored,
      minimapPings,
      enemyWalls,
      lootCrates,
      droppedItems,
      enemyWarlords,
      enemyLurkers,
    ]
  );

  return (
    <div
      className="absolute inset-0 bg-black"
      style={
        screenShake > 0
          ? {
              transform: `translate(${(Math.random() - 0.5) * 6 * screenShake}px, ${(Math.random() - 0.5) * 6 * screenShake}px)`,
            }
          : undefined
      }
      onContextMenu={e => {
        if (buildMode) {
          e.preventDefault();
          setBuildMode(null);
          setGhostTile(null);
        }
      }}
    >
      <GameOverOverlay
        {...{
          gameEndTime,
          gameOver,
          isDemo,
          killCount,
          onNewGame,
          placedBuildings,
          slot,
          startTimeRef,
          totalGold,
          totalLumber,
          totalStone,
          wave,
          workers,
        }}
      />
      <AlertsOverlay
        {...{
          gameOver,
          gameSpeed,
          playerBarnHp,
          underAttack,
          waveAnnouncement,
          wavePreview,
        }}
      />
      <DamageLogPanel
        {...{
          damageLog,
          damageLogOpen,
          idleWorkerIndexRef,
          setCamera,
          setDamageLog,
          setDamageLogOpen,
          setSelectedType,
          setWorkers,
          svgRef,
          underAttack,
          workers,
        }}
      />
      <BuffIndicators
        {...{ dayPhase, phaseAnnouncement, shrinePlentyBuff, shrineWarBuff }}
      />
      <ResourceBar
        {...{
          attackMoveMode,
          buildMode,
          difficulty,
          dayPhase,
          dayProgress,
          doSave,
          enemyGrunts,
          enemySappers,
          enemyShamans,
          enemySiege,
          enemyTrolls,
          enemyWarchiefs,
          gameOver,
          gameSpeed,
          incomeRate,
          killCount,
          nextWaveAt,
          onNewGame,
          patrolMode,
          resources,
          saveStatus,
          setGameSpeed,
          setZoom,
          slot,
          soundMuted,
          startTimeRef,
          toggleMute,
          upkeepMult,
          wave,
          waveTimerRemainingRef,
          zoom,
        }}
      />
      <ControlGroupChips {...{ controlGroups, setSelectedType, setWorkers }} />
      {!gameOver && (
        <MinimapPanel
          {...{
            enemyGrunts,
            enemySappers,
            enemyShamans,
            enemySiege,
            enemyTrolls,
            enemyWarchiefs,
            enemyWarlords,
            fogExplored,
            fogVisible,
            placedBuildings,
            tiles,
            workers,
          }}
        />
      )}
      {/* SVG map */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: 'block',
            pointerEvents: 'auto',
            transform: `translate(${camera.x}px,${camera.y}px) scale(${zoom})`,
            userSelect: 'none',
            cursor: buildMode ? 'crosshair' : 'default',
          }}
          onMouseDown={handleSvgMouseDown}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={() => {
            isDraggingRef.current = false;
            setDragBox(null);
            setGhostTile(null);
          }}
        >
          <TerrainLayer
            {...{
              addFloatingText,
              anySelected,
              attackMoveMode,
              attackMoveModeRef,
              buildMode,
              capturedShrines,
              commandMove,
              commandQueueMove,
              lootCrates,
              patrolMode,
              patrolModeRef,
              selectedType,
              setAttackMoveMode,
              setPatrolMode,
              setRallyPoint,
              setShrineCapturing,
              setWorkers,
              tiles,
              workers,
            }}
          />
          <OverlayRingsLayer
            {...{
              buildMode,
              enemySiege,
              enemyTowers,
              enemyTrolls,
              enemyWarchiefs,
              fogVisible,
              ghostTile,
              guardTowerResearched,
              isTileOccupied,
              placedBuildings,
            }}
          />
          <ResourceNodesLayer
            {...{ buildMode, commandMove, goldMines, stoneNodes, trees }}
          />
          <BuildingsLayer
            {...{
              anySelected,
              handleAssistConstruction,
              handleFarmhouseAction,
              handleRepairBuilding,
              handleTowerGarrison,
              placedBuildings,
              resources,
              selectedBuildingId,
              setSelectedBuildingId,
              setSelectedType,
              setWorkers,
              towerGarrison,
              trapTriggeredRef,
              workers,
            }}
          />

          <EnemyBaseLayer
            {...{
              anySelected,
              enemyBarnHp,
              enemyTowers,
              enemyWalls,
              fogVisible,
              handleAttackEnemyBarn,
              handleAttackEnemyTower,
              handleAttackEnemyWall,
            }}
          />
          <PlayerBarnLayer
            {...{
              anySelected,
              buildMode,
              clientToSvg,
              enemyGrunts,
              fogVisible,
              garrisoned,
              handleGarrison,
              playerBarnHp,
              rallyPoint,
              selectedType,
              setRallyPoint,
              setSelectedBuildingId,
              setSelectedType,
              setWorkers,
            }}
          />
          <NeutralLayer
            {...{
              anySelected,
              capturedShrines,
              clearedCamps,
              deadGruntPositions,
              fogVisible,
              handleAttackCreep,
              neutralCreeps,
              shrineCapturing,
            }}
          />
          <EnemyGruntsLayer
            {...{
              anySelected,
              commandMove,
              droppedItems,
              enemyGrunts,
              enemyLurkers,
              fogVisible,
              gruntHitRef,
              handleAttackGrunt,
              handleAttackLurker,
              lootCrates,
            }}
          />
          <EnemySiegeCastersLayer
            {...{
              anySelected,
              enemyNecromancers,
              enemySappers,
              enemyShamans,
              enemySiege,
              enemyWitchDoctors,
              fogVisible,
              handleAttackNecromancer,
              handleAttackSapper,
              handleAttackShaman,
              handleAttackSiege,
              handleAttackWitchDoctor,
            }}
          />
          <EnemyEliteLayer
            {...{
              anySelected,
              enemyTrolls,
              enemyWarchiefs,
              enemyWarlords,
              fogVisible,
              handleAttackTroll,
              handleAttackWarchief,
              handleAttackWarlord,
            }}
          />
          <WorkersLayer
            {...{
              battleShoutUntil,
              buildMode,
              deadWorkerPositions,
              fogVisible,
              isDraggingRef,
              setSelectedBuildingId,
              setSelectedType,
              setWorkers,
              workerHitRef,
              workers,
            }}
          />
          <EffectsLayer
            {...{
              chickens,
              dayPhase,
              dragBox,
              earthquakeEffect,
              floatingTexts,
              fogExplored,
              fogVisible,
              moveRing,
              projectiles,
              viewBoxH,
              viewBoxW,
              workers,
            }}
          />
        </svg>
      </div>

      <ControlGroupBar {...{ controlGroups, workers }} />
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
        onHoldPosition={() =>
          setWorkers(ws =>
            ws.map(w =>
              w.selected
                ? {
                    ...w,
                    holdPosition: true,
                    movingTo: null,
                    path: [],
                    patrol: null,
                    attackMove: false,
                    attackMoveTarget: null,
                    waypoints: [],
                    state: 'idle',
                  }
                : w
            )
          )
        }
        buildMode={buildMode}
        upgrades={upgrades}
        onResearch={handleResearch}
        stance={stance}
        onToggleStance={() =>
          setStance(s => (s === 'aggressive' ? 'passive' : 'aggressive'))
        }
        hasBarracks={placedBuildings.some(
          b => b.type === 'barracks' && !b.constructing
        )}
        garrisonedCount={garrisoned.length}
        garrisonCap={GARRISON_CAP}
        onGarrison={handleGarrison}
        onUngarrison={handleUngarrison}
        heroRecruited={heroRecruited}
        heroReviveCountdown={heroReviveCountdown}
        heroReviveCost={Math.min(200, 80 + wave * 5)}
        onInstantRevive={() => {
          const cost = Math.min(200, 80 + wave * 5);
          if (resources.gold < cost) return;
          setResources(r => ({ ...r, gold: r.gold - cost }));
          setHeroReviveAt(null);
          const saved = heroXpRef.current;
          setWorkers(ws => {
            const newId = Math.max(...ws.map(w => w.id), 0) + 1;
            const hero = makeUnit(newId, BARN_POS.x, BARN_POS.y, 'hero');
            return [
              ...ws,
              saved
                ? {
                    ...hero,
                    xp: saved.xp,
                    level: saved.level,
                    maxHp: HERO_MAX_HP + saved.level * 10,
                    hp: HERO_MAX_HP + saved.level * 10,
                  }
                : hero,
            ];
          });
          addFloatingText(BARN_POS.x, BARN_POS.y, '🦸 Revived!', '#fbbf24');
        }}
        heroAbilityCooldown={heroAbilityCooldown}
        onHeroAbility={handleHeroAbility}
        heroShoutCooldown={heroShoutCooldown}
        battleShoutActive={battleShoutUntil > Date.now()}
        onBattleShout={handleBattleShout}
        harvestBoonCooldown={harvestBoonCooldown}
        harvestBoonActive={harvestBoonActive}
        onHarvestBoon={handleHarvestBoon}
        onRecruitHero={() => handleFarmhouseAction('recruitHero')}
        hasSiegeWorkshop={placedBuildings.some(
          b => b.type === 'siegeWorkshop' && !b.constructing
        )}
        hasMarket={placedBuildings.some(
          b => b.type === 'market' && !b.constructing
        )}
        hasBlacksmith={placedBuildings.some(
          b => b.type === 'blacksmith' && !b.constructing
        )}
        blacksmithUpgrades={blacksmithUpgrades}
        onBlacksmithUpgrade={type =>
          handleFarmhouseAction(`blacksmith:${type}`)
        }
        hasStable={placedBuildings.some(
          b => b.type === 'stable' && !b.constructing
        )}
        hasWatchtower={placedBuildings.some(
          b => b.type === 'watchtower' && !b.constructing
        )}
        guardTowerResearched={guardTowerResearched}
        onGuardTower={() => handleFarmhouseAction('guardTower')}
        trainingQueue={trainingQueue}
        trainingProgress={trainingProgress}
        towerGarrison={towerGarrison}
        onTowerGarrison={handleTowerGarrison}
        onTowerDeploy={handleTowerDeploy}
        selectedBuilding={
          placedBuildings.find(b => b.id === selectedBuildingId) ?? null
        }
        placedBuildingsList={placedBuildings}
        onSwordsmanCharge={handleSwordsmanCharge}
        onCavalrySprint={handleCavalrySprint}
        onMinimapClick={(tx, ty) => {
          const { isoX, isoY } = tileToSvg(tx, ty);
          const bounds = {
            minX: -((GRID_SIZE * TILE_SIZE) / 2),
            maxX: (GRID_SIZE * TILE_SIZE) / 2,
            minY: -100,
            maxY: (GRID_SIZE * TILE_SIZE) / 2,
          };
          setCamera({
            x: Math.max(bounds.minX, Math.min(bounds.maxX, -isoX + 400)),
            y: Math.max(bounds.minY, Math.min(bounds.maxY, -isoY + 200)),
          });
        }}
        minimapData={minimapData}
        enemyBarnHp={enemyBarnHp}
        enemyBarnMaxHp={ENEMY_BARN_MAX_HP}
        playerBarnHp={playerBarnHp}
        playerBarnMaxHp={PLAYER_BARN_MAX_HP}
        underAttack={underAttack}
        incomeRate={incomeRate}
        barracksTech={barracksTech}
        onBarracksTech={type => handleFarmhouseAction(`barracks:${type}`)}
        earthquakeCooldown={earthquakeCooldown}
        onEarthquake={handleEarthquake}
        heroItems={heroItems}
        onDropItem={handleDropItem}
        onUsePotion={handleUsePotion}
        shopItems={SHOP_ITEMS}
        onBuyItem={handleBuyItem}
        formationMode={formationMode}
        onCycleFormation={() =>
          setFormationMode(m => {
            const order: FormationMode[] = ['cluster', 'line', 'wedge', 'box'];
            return order[(order.indexOf(m) + 1) % order.length]!;
          })
        }
      />
      {/* Demo mode indicator */}
      {isDemo && (
        <div
          style={{
            position: 'fixed',
            top: '0.4rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: 'rgba(109,40,217,0.85)',
            border: '1.5px solid #a78bfa',
            borderRadius: '1rem',
            color: '#ddd6fe',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.2rem 0.75rem',
            letterSpacing: 1,
            pointerEvents: 'none',
          }}
        >
          🤖 DEMO MODE — AI is playing
        </div>
      )}
      {/* Achievement panel button */}
      <button
        onClick={() => setAchievementPanelOpen(o => !o)}
        style={{
          position: 'fixed',
          top: '3.5rem',
          right: '0.5rem',
          zIndex: 150,
          background: achievementPanelOpen
            ? 'rgba(109,40,217,0.9)'
            : 'rgba(30,27,75,0.85)',
          border: '1.5px solid #7c3aed',
          borderRadius: '0.5rem',
          color: '#c4b5fd',
          fontSize: '1.1rem',
          padding: '0.3rem 0.5rem',
          cursor: 'pointer',
          lineHeight: 1,
        }}
        title="Achievements"
      >
        🏆
      </button>
      {/* Achievement panel */}
      {achievementPanelOpen && (
        <AchievementPanel onClose={() => setAchievementPanelOpen(false)} />
      )}
      {/* Achievement unlock toast */}
      {achievementToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '5.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
            border: '1.5px solid #a855f7',
            borderRadius: '0.75rem',
            padding: '0.6rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 4px 24px rgba(168,85,247,0.5)',
            pointerEvents: 'none',
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>{achievementToast.emoji}</span>
          <div>
            <div
              style={{
                fontSize: '0.6rem',
                color: '#c4b5fd',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
              }}
            >
              Achievement Unlocked
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                color: '#f5f3ff',
                fontWeight: 700,
              }}
            >
              {achievementToast.name}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#ddd6fe' }}>
              {achievementToast.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RTSMap;
