'use client';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';

import { RTSUI, WorkerState, Upgrades } from './RTSUI';
import {
  type FormationMode,
  type RTSHandlerContext,
  SHOP_ITEMS,
  useRTSHandlers,
} from './hooks/useRTSHandlers';

import {
  ARCHER_TOWER_POS,
  BARN_POS,
  BARN_VISION,
  BUILDING_COSTS,
  BUILDING_MAX_HP,
  BUILDING_REQUIRES,
  CREEP_CAMPS,
  CREEP_MAX_HP,
  ENEMY_BARN_MAX_HP,
  ENEMY_BARN_POS,
  GARRISON_CAP,
  GRID_SIZE,
  HERO_MAX_HP,
  PLAYER_BARN_MAX_HP,
  TILE_SIZE,
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
  HeroItem,
  LootCrate,
  NeutralCreep,
  PlacedBuilding,
  ResourceNode,
  Resources,
  SaveData,
} from './game/types';
import { computeVisible, INITIAL_TILES, tileToSvg } from './game/map';
import { aStar } from './game/pathfinding';
import {
  ALL_ACHIEVEMENTS,
  unlockAchievement,
  type Achievement,
} from './game/achievements';
import {
  loadSave,
  loadSaveSync,
  saveHighScore,
  writeSave,
  type SaveSlot,
} from './game/persistence';
import { makeUnit } from './game/units';
import {
  getSoundMuted,
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
import { useFloatingText } from './hooks/useFloatingText';
import { usePanZoom } from './hooks/usePanZoom';
import { useProjectiles } from './hooks/useProjectiles';

// Re-exported for backwards compatibility â€” previously defined in this file.
export { BUILDING_REQUIRES } from './game/constants';

import type { DifficultyConfig } from './RTSGameRoot';

const RTSMap: React.FC<{
  onNewGame?: () => void;
  difficulty?: DifficultyConfig;
  slot?: SaveSlot;
}> = ({ onNewGame, difficulty, slot = 0 }) => {
  // Load save once per mount (module-level caching caused stale data after New Game)
  const saveRef = useRef<SaveData | null | undefined>(undefined);
  if (saveRef.current === undefined) saveRef.current = loadSaveSync(slot);
  const INITIAL_SAVE = saveRef.current;

  // Background cloud-save sync: if a newer cloud save exists, mirror it to localStorage
  // for the next session (does not affect the current game state).
  useEffect(() => {
    void loadSave(slot);
  }, []); // intentional: only sync from cloud once on mount

  const {
    svgRef,
    zoom,
    setZoom,
    camera,
    setCamera,
    screenShake,
    triggerShake: _triggerShake,
    triggerShakeRef,
  } = usePanZoom();
  const tiles = useMemo(() => INITIAL_TILES, []);
  const [soundMuted, setSoundMutedState] = useState(getSoundMuted);
  const toggleMute = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setSoundMutedState(next);
  };

  const [fogExplored, setFogExplored] = useState<boolean[][]>(() => {
    const saved = INITIAL_SAVE?.fogExplored;
    // Validate fog matches current GRID_SIZE â€” discard if wrong dimensions
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
    { x: 4, y: 5, amount: 250 }, // starting mine â€” close to barn
    { x: 1, y: 11, amount: 250 }, // secondary player-side mine
    { x: 3, y: 18, amount: 300 }, // SW expansion mine
    { x: 9, y: 3, amount: 250 }, // NE near mine
    { x: 12, y: 12, amount: 350 }, // contested center â€” high value, risky
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
        { x: 14, y: 14, amount: 180 }, // former enemy barn position â€” now a contested stone field
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
            mkGatherer(2, 4, 3, 'gold', 0, goldMine), // â†’ gold mine
            mkGatherer(3, 3, 4, 'gold', 0, goldMine), // â†’ gold mine
            mkGatherer(4, 4, 4, 'tree', 0, tree0), // â†’ lumber
            mkGatherer(5, 5, 3, 'tree', 1, tree1), // â†’ lumber
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
  const campClearedAtRef = useRef<Record<number, number>>({}); // campId â†’ timestamp cleared
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
  // Ambient chickens â€” decorative only, wander near barn
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

  // Tower garrison: maps tower building id â†’ garrisoned units (max 3)
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
      void saveHighScore({
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
  // 0â€“50% food cap = no penalty, 51â€“80% = 70% gold rate, 81%+ = 40% gold rate
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
            ? 'ðŸŒ™ Night Falls! Grunts grow strongerâ€¦'
            : 'â˜€ï¸ Dawn Breaks!';
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
    writeSave(
      {
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
      },
      slot
    );
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

  // Achievement: buildings â€” fortified (3 walls) and blacksmith max
  useEffect(() => {
    const wallCount = placedBuildings.filter(b => b.type === 'wall').length;
    if (wallCount >= 3) triggerAchievement('fortified');
  }, [placedBuildings, triggerAchievement]);

  useEffect(() => {
    if (blacksmithUpgrades.steelEdge >= 2 || blacksmithUpgrades.ironHide >= 2) {
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

  const { floatingTexts, addFloatingText } = useFloatingText();

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
        addFloatingText(camp.x, camp.y, 'âš  Creeps Respawned!', '#f87171');
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

  // Hero revive timer â€” ticks down, spawns hero on completion
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
          'ðŸ¦¸ Barnabas Returns!',
          '#fbbf24'
        );
      }
    }, 500);
    return () => clearInterval(id);
  }, [heroReviveAt, addFloatingText]);

  // Detect hero death â†’ start auto-revive timer
  useEffect(() => {
    if (!heroRecruited || heroReviveAt !== null || gameOver) return;
    const hero = workers.find(w => w.unitType === 'hero');
    if (!hero || hero.hp > 0) return;
    heroXpRef.current = { xp: hero.xp, level: hero.level };
    const reviveDelay = Math.min(60000, 20000 + waveRef.current * 2000);
    setHeroReviveAt(Date.now() + reviveDelay);
    setWorkers(ws => ws.filter(w => w.unitType !== 'hero'));
    addFloatingText(hero.x, hero.y, 'ðŸ¦¸ Barnabas Fallen!', '#f97316');
  }, [workers, heroRecruited, heroReviveAt, gameOver, addFloatingText]);

  const { projectiles, addProjectile, moveRing, setMoveRing } =
    useProjectiles();

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

  const handlerCtx: RTSHandlerContext = {
    buildMode,
    setBuildMode,
    setGhostTile,
    formationModeRef,
    setDragBox,
    isDraggingRef,
    buildingIdRef,
    svgRef,
    setMoveRing,
    towerGarrison,
    setTowerGarrison,
    trees,
    goldMines,
    stoneNodes,
    resources,
    heroAbilityCooldown,
    setHeroAbilityCooldown,
    heroShoutCooldown,
    setHeroShoutCooldown,
    setBattleShoutUntil,
    harvestBoonCooldown,
    harvestBoonActive,
    setHarvestBoonCooldown,
    setHarvestBoonActive,
    harvestBoonRef,
    earthquakeCooldown,
    setEarthquakeCooldown,
    setEarthquakeEffect,
    heroItems,
    enemyBarnHp,
    setFarmhouse,
    heroRecruited,
    setHeroRecruited,
    guardTowerResearched,
    setGuardTowerResearched,
    barracksTech,
    setBarracksTech,
    blacksmithUpgrades,
    setBlacksmithUpgrades,
    trainingQueue,
    rallyPoint,
    setRallyPoint,
    upgrades,
    setUpgrades,
    setPatrolMode,
    setSelectedType,
  };
  const handlers = useRTSHandlers(gameCtx, handlerCtx);

  // Chicken wander â€” move each chicken to an adjacent clear tile every ~2s
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
        handlers.handleFarmhouseAction('train');
      }
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        handlers.handleFarmhouseAction('trainSwordsman');
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handlers.handleFarmhouseAction('trainCavalry');
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
        handlers.handleGarrison();
      }
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handlers.handleEarthquake();
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handlers.handleSwordsmanCharge();
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handlers.handleCavalrySprint();
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
          tiles[tx]?.[ty] === 'water' ||
          tiles[tx]?.[ty] === 'tree' ||
          tiles[tx]?.[ty] === 'rock' ||
          placedBuildingsRef.current.some(b => b.x === tx && b.y === ty) ||
          treesRef.current.some(
            t => t.x === tx && t.y === ty && t.amount > 0
          ) ||
          goldMinesRef.current.some(
            m => m.x === tx && m.y === ty && m.amount > 0
          ) ||
          stoneNodesRef.current.some(
            s => s.x === tx && s.y === ty && s.amount > 0
          );
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
        if (
          snap.resources.gold < 30 ||
          snap.resources.food >= snap.resources.foodCap
        )
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
    // deps intentionally empty â€” botCommands is stable (useMemo with [] deps above)
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

  const selectedWorkers = workers.filter(w => w.selected);
  const anySelected = selectedWorkers.length > 0;
  const viewBoxW = GRID_SIZE * TILE_SIZE * 2 + 200;
  const viewBoxH = GRID_SIZE * TILE_SIZE + 200;

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
            enemyLurkers,
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
          onMouseDown={handlers.handleSvgMouseDown}
          onMouseMove={handlers.handleSvgMouseMove}
          onMouseUp={handlers.handleSvgMouseUp}
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
              commandMove: handlers.commandMove,
              commandQueueMove: handlers.commandQueueMove,
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
              isTileOccupied: handlers.isTileOccupied,
              placedBuildings,
            }}
          />
          <ResourceNodesLayer
            {...{
              buildMode,
              commandMove: handlers.commandMove,
              goldMines,
              stoneNodes,
              trees,
            }}
          />
          <BuildingsLayer
            {...{
              anySelected,
              handleAssistConstruction: handlers.handleAssistConstruction,
              handleFarmhouseAction: handlers.handleFarmhouseAction,
              handleRepairBuilding: handlers.handleRepairBuilding,
              handleTowerGarrison: handlers.handleTowerGarrison,
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
              handleAttackEnemyBarn: handlers.handleAttackEnemyBarn,
              handleAttackEnemyTower: handlers.handleAttackEnemyTower,
              handleAttackEnemyWall: handlers.handleAttackEnemyWall,
            }}
          />
          <PlayerBarnLayer
            {...{
              anySelected,
              buildMode,
              clientToSvg: handlers.clientToSvg,
              enemyGrunts,
              fogVisible,
              garrisoned,
              handleGarrison: handlers.handleGarrison,
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
              handleAttackCreep: handlers.handleAttackCreep,
              neutralCreeps,
              shrineCapturing,
            }}
          />
          <EnemyGruntsLayer
            {...{
              anySelected,
              commandMove: handlers.commandMove,
              droppedItems,
              enemyGrunts,
              enemyLurkers,
              fogVisible,
              gruntHitRef,
              handleAttackGrunt: handlers.handleAttackGrunt,
              handleAttackLurker: handlers.handleAttackLurker,
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
              handleAttackNecromancer: handlers.handleAttackNecromancer,
              handleAttackSapper: handlers.handleAttackSapper,
              handleAttackShaman: handlers.handleAttackShaman,
              handleAttackSiege: handlers.handleAttackSiege,
              handleAttackWitchDoctor: handlers.handleAttackWitchDoctor,
            }}
          />
          <EnemyEliteLayer
            {...{
              anySelected,
              enemyTrolls,
              enemyWarchiefs,
              enemyWarlords,
              fogVisible,
              handleAttackTroll: handlers.handleAttackTroll,
              handleAttackWarchief: handlers.handleAttackWarchief,
              handleAttackWarlord: handlers.handleAttackWarlord,
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
        onFarmhouseAction={handlers.handleFarmhouseAction}
        onWorkerCommand={handlers.handleWorkerCommand}
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
        onResearch={handlers.handleResearch}
        stance={stance}
        onToggleStance={() =>
          setStance(s => (s === 'aggressive' ? 'passive' : 'aggressive'))
        }
        hasBarracks={placedBuildings.some(
          b => b.type === 'barracks' && !b.constructing
        )}
        garrisonedCount={garrisoned.length}
        garrisonCap={GARRISON_CAP}
        onGarrison={handlers.handleGarrison}
        onUngarrison={handlers.handleUngarrison}
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
          addFloatingText(BARN_POS.x, BARN_POS.y, 'ðŸ¦¸ Revived!', '#fbbf24');
        }}
        heroAbilityCooldown={heroAbilityCooldown}
        onHeroAbility={handlers.handleHeroAbility}
        heroShoutCooldown={heroShoutCooldown}
        battleShoutActive={battleShoutUntil > Date.now()}
        onBattleShout={handlers.handleBattleShout}
        harvestBoonCooldown={harvestBoonCooldown}
        harvestBoonActive={harvestBoonActive}
        onHarvestBoon={handlers.handleHarvestBoon}
        onRecruitHero={() => handlers.handleFarmhouseAction('recruitHero')}
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
          handlers.handleFarmhouseAction(`blacksmith:${type}`)
        }
        hasStable={placedBuildings.some(
          b => b.type === 'stable' && !b.constructing
        )}
        hasWatchtower={placedBuildings.some(
          b => b.type === 'watchtower' && !b.constructing
        )}
        guardTowerResearched={guardTowerResearched}
        onGuardTower={() => handlers.handleFarmhouseAction('guardTower')}
        trainingQueue={trainingQueue}
        trainingProgress={trainingProgress}
        towerGarrison={towerGarrison}
        onTowerGarrison={handlers.handleTowerGarrison}
        onTowerDeploy={handlers.handleTowerDeploy}
        selectedBuilding={
          placedBuildings.find(b => b.id === selectedBuildingId) ?? null
        }
        onSwordsmanCharge={handlers.handleSwordsmanCharge}
        onCavalrySprint={handlers.handleCavalrySprint}
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
        onBarracksTech={type =>
          handlers.handleFarmhouseAction(`barracks:${type}`)
        }
        earthquakeCooldown={earthquakeCooldown}
        onEarthquake={handlers.handleEarthquake}
        heroItems={heroItems}
        onDropItem={handlers.handleDropItem}
        onUsePotion={handlers.handleUsePotion}
        shopItems={SHOP_ITEMS}
        onBuyItem={handlers.handleBuyItem}
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
          ðŸ¤– DEMO MODE â€” AI is playing
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
        ðŸ†
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
