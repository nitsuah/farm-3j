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
  ATTACK_INTERVAL_MS,
  BALLISTA_ATTACK_MS,
  BALLISTA_DAMAGE,
  BALLISTA_PIERCE_DAMAGE,
  BALLISTA_PIERCE_RANGE,
  BALLISTA_RANGE,
  BARN_POS,
  BARN_VISION,
  BOSS_DAMAGE,
  BOSS_GOLD_REWARD,
  BOSS_HP_MULTIPLIER,
  BOSS_XP_REWARD,
  BUILDING_COSTS,
  BUILDING_GRUNT_DAMAGE,
  BUILDING_MAX_HP,
  BUILDING_REQUIRES,
  CARRY_CAP,
  CATAPULT_DAMAGE,
  CATAPULT_FIRE_MS,
  CATAPULT_RANGE,
  CATAPULT_SPEED,
  CATAPULT_SPLASH_DAMAGE,
  CATAPULT_SPLASH_RANGE,
  CAVALRY_DAMAGE_BONUS,
  CAVALRY_SPEED,
  CAVALRY_SPRINT_COOLDOWN_S,
  CAVALRY_SPRINT_DURATION_MS,
  CAVALRY_SPRINT_SPEED_MULT,
  CAVALRY_TRAMPLE_DAMAGE,
  CAVALRY_TRAMPLE_RADIUS,
  CONSTRUCTION_MS,
  CREEP_AGGRO_RANGE,
  CREEP_ATTACK_MS,
  CREEP_CAMPS,
  CREEP_DAMAGE,
  CREEP_LEASH_RANGE,
  CREEP_MAX_HP,
  CREEP_SPEED,
  DEMOLISHER_ATTACK_MS,
  DEMOLISHER_DAMAGE,
  DEMOLISHER_FIRE_RANGE,
  DEMOLISHER_FIRST_WAVE,
  DEMOLISHER_GOLD_REWARD,
  DEMOLISHER_MAX_HP,
  DEMOLISHER_SPEED,
  DEMOLISHER_SPLASH_RANGE,
  DEMOLISHER_XP_REWARD,
  EARTHQUAKE_COOLDOWN_S,
  EARTHQUAKE_DAMAGE,
  EARTHQUAKE_RADIUS,
  EARTHQUAKE_STUN_MS,
  ENEMY_BARN_MAX_HP,
  ENEMY_BARN_POS,
  ENEMY_COUNTER_DAMAGE,
  ENEMY_TOWER_ATTACK_MS,
  ENEMY_TOWER_DAMAGE,
  ENEMY_TOWER_MAX_HP,
  ENEMY_TOWER_POSITIONS,
  ENEMY_TOWER_RANGE,
  ENEMY_TOWER_SPAWN_WAVES,
  ENEMY_WALL_MAX_HP,
  ENEMY_WALL_SPAWN,
  FOOD_CAP_BASE,
  FOOD_CAP_PER_LEVEL,
  FROST_TOWER_ATTACK_MS,
  FROST_TOWER_DAMAGE,
  FROST_TOWER_RANGE,
  FROST_TOWER_SLOW_DURATION,
  FROST_TOWER_SLOW_FACTOR,
  GARRISON_ARMOR_PER_UNIT,
  GARRISON_CAP,
  GARRISON_HEAL_AMOUNT,
  GARRISON_HEAL_MS,
  GATHER_INTERVAL_MS,
  GRID_SIZE,
  GRUNT_ATTACK_MS,
  GRUNT_DAMAGE,
  GRUNT_MAX_HP,
  GRUNT_SPAWN_MS,
  GRUNT_SPEED,
  HERO_ABILITY_COOLDOWN_S,
  HERO_ABILITY_DAMAGE,
  HERO_ABILITY_RADIUS,
  HERO_DAMAGE_BONUS,
  HERO_ITEM_DATA,
  HERO_MAX_HP,
  HERO_MAX_ITEMS,
  HERO_SHOUT_ATK_MULT,
  HERO_SHOUT_COOLDOWN_S,
  HERO_SHOUT_DURATION_MS,
  HERO_SHOUT_RADIUS,
  LOOT_CRATE_POSITIONS,
  LOOT_CRATE_SPAWN_MS,
  LUMBER_SHED_BONUS_MS,
  NECROMANCER_FIRST_WAVE,
  NECROMANCER_GOLD_REWARD,
  NECROMANCER_MAX_HP,
  NECROMANCER_RAISE_MS,
  NECROMANCER_RAISE_RADIUS,
  NECROMANCER_SPEED,
  NECROMANCER_XP_REWARD,
  PLAYER_BARN_MAX_HP,
  POISON_TOWER_ATTACK_MS,
  POISON_TOWER_DAMAGE,
  POISON_TOWER_DPS,
  POISON_TOWER_DURATION_MS,
  POISON_TOWER_RANGE,
  REPAIR_AMOUNT,
  REPAIR_INTERVAL_MS,
  REPAIR_RADIUS,
  SAPPER_EXPLODE_DAMAGE,
  SAPPER_EXPLODE_RADIUS,
  SAPPER_FIRST_WAVE,
  SAPPER_GOLD_REWARD,
  SAPPER_MAX_HP,
  SAPPER_SPEED,
  SAPPER_XP_REWARD,
  SHAMAN_FIRST_WAVE,
  SHAMAN_GOLD_REWARD,
  SHAMAN_HEAL_AMOUNT,
  SHAMAN_HEAL_MS,
  SHAMAN_HEAL_RADIUS,
  SHAMAN_MAX_HP,
  SHAMAN_SPEED,
  SHAMAN_XP_REWARD,
  SHRINES,
  SWORDSMAN_CHARGE_COOLDOWN_S,
  SWORDSMAN_CHARGE_DAMAGE_MULT,
  SWORDSMAN_DAMAGE_BONUS,
  TILE_SIZE,
  TREBUCHET_DAMAGE,
  TREBUCHET_FIRE_MS,
  TREBUCHET_MIN_RANGE,
  TREBUCHET_RANGE,
  TREBUCHET_SPEED,
  TROLL_ATTACK_MS,
  TROLL_ATTACK_RANGE,
  TROLL_DAMAGE,
  TROLL_FIRST_WAVE,
  TROLL_GOLD_REWARD,
  TROLL_KITE_RANGE,
  TROLL_MAX_HP,
  TROLL_SPEED,
  TROLL_XP_REWARD,
  VETERAN_ATK_BONUS,
  VETERAN_HP_BONUS,
  WARCHIEF_DMG,
  WARCHIEF_FIRST_WAVE,
  WARCHIEF_GOLD_REWARD,
  WARCHIEF_MAX_HP,
  WARCHIEF_SPEED,
  WARCHIEF_STOMP_COOLDOWN_MS,
  WARCHIEF_STOMP_RADIUS,
  WARCHIEF_STOMP_SLOW_MS,
  WARCHIEF_XP_REWARD,
  WAR_RAM_ATTACK_MS,
  WAR_RAM_DAMAGE,
  WAR_RAM_FIRST_WAVE,
  WAR_RAM_GOLD_REWARD,
  WAR_RAM_MAX_HP,
  WAR_RAM_SPEED,
  WAR_RAM_XP_REWARD,
  WATCHTOWER_ATTACK_MS,
  WATCHTOWER_ATTACK_RANGE,
  WATCHTOWER_DAMAGE,
  WATCHTOWER_VISION,
  WITCH_DOCTOR_BUFF_DURATION,
  WITCH_DOCTOR_BUFF_MS,
  WITCH_DOCTOR_BUFF_RADIUS,
  WITCH_DOCTOR_ENRAGE_DMG_BONUS,
  WITCH_DOCTOR_FIRST_WAVE,
  WITCH_DOCTOR_GOLD_REWARD,
  WITCH_DOCTOR_MAX_HP,
  WITCH_DOCTOR_SPEED,
  WITCH_DOCTOR_XP_REWARD,
  WORKER_SPEED,
  WORKER_VISION,
  XP_PER_KILL,
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
  EnemyWarchief,
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
  loadSave,
  saveHighScore,
  writeSave,
} from './game/persistence';
import { makeUnit } from './game/units';
import {
  ACK_ATTACK,
  ACK_MOVE,
  getSoundMuted,
  pickAck,
  setSoundMuted,
  Snd,
} from './game/sound';
import { AlertsOverlay } from './hud/AlertsOverlay';
import { BuffIndicators } from './hud/BuffIndicators';
import { ControlGroupBar } from './hud/ControlGroupBar';
import { ControlGroupChips } from './hud/ControlGroupChips';
import { DamageLogPanel } from './hud/DamageLogPanel';
import { GameOverOverlay } from './hud/GameOverOverlay';
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

// Re-exported for backwards compatibility — previously defined in this file.
export { BUILDING_REQUIRES } from './game/constants';

import type { DifficultyConfig } from './RTSGameRoot';

const RTSMap: React.FC<{
  onNewGame?: () => void;
  difficulty?: DifficultyConfig;
}> = ({ onNewGame, difficulty }) => {
  // Load save once per mount (module-level caching caused stale data after New Game)
  const saveRef = useRef<SaveData | null | undefined>(undefined);
  if (saveRef.current === undefined) saveRef.current = loadSave();
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
  const enemyWarchiefssRef = useRef<EnemyWarchief[]>([]);
  useEffect(() => {
    enemyWarchiefssRef.current = enemyWarchiefs;
  }, [enemyWarchiefs]);
  const warchiefIdRef = useRef(9000);
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
  const TRAIN_TIME_MS = 8000;
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
  const NIGHT_SPEED_MULT = 1.3;
  const [dayPhase, setDayPhase] = useState<'day' | 'night'>('day');
  const [dayProgress, setDayProgress] = useState(0); // 0-1 through current phase
  const [phaseAnnouncement, setPhaseAnnouncement] = useState<string | null>(
    null
  );
  const isNightRef = useRef(false);
  useEffect(() => {
    isNightRef.current = dayPhase === 'night';
  }, [dayPhase]);

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
    });
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

  // Wave-based grunt spawner
  const doSpawnWave = useCallback(() => {
    if (gameOverRef.current) return;
    const newWave = waveRef.current + 1;
    // Wave clear bonus: if barn took no damage last wave, award bonus gold
    if (newWave > 1 && barnDmgThisWaveRef.current === 0) {
      const bonus = 20 + newWave * 3;
      setResources(r => ({ ...r, gold: r.gold + bonus }));
      addFloatingText(
        BARN_POS.x,
        BARN_POS.y,
        `✨ Flawless! +${bonus}🪙`,
        '#fbbf24'
      );
    }
    barnDmgThisWaveRef.current = 0;
    waveRef.current = newWave;
    setWave(newWave);
    Snd.waveWarning();
    const towerIdx = ENEMY_TOWER_SPAWN_WAVES.indexOf(
      newWave as (typeof ENEMY_TOWER_SPAWN_WAVES)[number]
    );
    const isBossWave = newWave % 10 === 0;
    if (towerIdx >= 0 && !isBossWave) {
      const pos = ENEMY_TOWER_POSITIONS[towerIdx];
      if (!pos) return;
      setEnemyTowers(ts => [
        ...ts,
        {
          id: newWave,
          x: pos.x,
          y: pos.y,
          hp: ENEMY_TOWER_MAX_HP,
          maxHp: ENEMY_TOWER_MAX_HP,
        },
      ]);
      setWaveAnnouncement(`⚔️ Wave ${newWave} — ENEMY TOWER BUILT!`);
    } else if (isBossWave) {
      setWaveAnnouncement(`💀 Wave ${newWave} — WAR BULL INCOMING!`);
    } else {
      setWaveAnnouncement(
        `⚔️ Wave ${newWave}${newWave % 3 === 0 ? ' — DOUBLE ASSAULT!' : '!'}`
      );
    }
    window.setTimeout(() => setWaveAnnouncement(null), 3000);

    // Enemy fortification walls build up progressively around their base
    const wallPositions = ENEMY_WALL_SPAWN[newWave];
    if (wallPositions) {
      setEnemyWalls(ws => {
        const newWalls = wallPositions
          .filter(pos => !ws.some(w => w.x === pos.x && w.y === pos.y))
          .map(pos => ({
            id: enemyWallIdRef.current++,
            x: pos.x,
            y: pos.y,
            hp: ENEMY_WALL_MAX_HP,
            maxHp: ENEMY_WALL_MAX_HP,
          }));
        return [...ws, ...newWalls];
      });
    }

    const diffHpMult = difficulty?.gruntHpMult ?? 1;
    const gruntHp = Math.round(
      (GRUNT_MAX_HP + (newWave - 1) * 10) * diffHpMult
    );
    const wallSet = new Set(
      placedBuildingsRef.current
        .filter(b => b.type === 'wall')
        .map(b => `${b.x},${b.y}`)
    );

    // Boss spawn on multiples of 10
    if (isBossWave) {
      const bossHp = gruntHp * BOSS_HP_MULTIPLIER;
      const cx = Math.max(0, ENEMY_BARN_POS.x - 1);
      const cy = ENEMY_BARN_POS.y;
      const bossPath = aStar(
        INITIAL_TILES,
        { x: cx, y: cy },
        BARN_POS,
        true,
        wallSet
      );
      const boss: EnemyGrunt = {
        id: gruntIdRef.current++,
        x: cx,
        y: cy,
        hp: bossHp,
        maxHp: bossHp,
        movingTo: bossPath[0] ?? BARN_POS,
        path: bossPath.slice(1),
        state: 'moving',
        isBoss: true,
      };
      setEnemyGrunts(gs => [...gs, boss]);
    }

    // Scale count: 1-2 early, up to 4-6 by wave 20+; double on every 3rd wave
    const baseCount = Math.min(6, 1 + Math.floor(newWave / 5));
    const count = newWave % 3 === 0 ? baseCount + 2 : baseCount;
    for (let i = 0; i < count; i++) {
      const ox = (i % 3) - 1; // spread: -1, 0, +1
      const oy = Math.floor(i / 3) % 2 === 0 ? 1 : -1;
      const cx = Math.max(0, Math.min(GRID_SIZE - 1, ENEMY_BARN_POS.x + ox));
      const cy = Math.max(0, Math.min(GRID_SIZE - 1, ENEMY_BARN_POS.y + oy));
      const path = aStar(
        INITIAL_TILES,
        { x: cx, y: cy },
        BARN_POS,
        true,
        wallSet
      );
      const grunt: EnemyGrunt = {
        id: gruntIdRef.current++,
        x: cx,
        y: cy,
        hp: gruntHp,
        maxHp: gruntHp,
        movingTo: path[0] ?? BARN_POS,
        path: path.slice(1),
        state: 'moving',
      };
      setEnemyGrunts(gs => [...gs, grunt]);
    }
    // Flanking attack: wave 8+ every 4 waves — 2 grunts from east/south corner
    if (newWave >= 8 && newWave % 4 === 0) {
      const FLANK_POSITIONS = [
        { x: 24, y: 12 },
        { x: 12, y: 24 },
      ];
      FLANK_POSITIONS.forEach(fp => {
        const fPath = aStar(INITIAL_TILES, fp, BARN_POS, true, wallSet);
        const flankGrunt: EnemyGrunt = {
          id: gruntIdRef.current++,
          x: fp.x,
          y: fp.y,
          hp: gruntHp,
          maxHp: gruntHp,
          movingTo: fPath[0] ?? BARN_POS,
          path: fPath.slice(1),
          state: 'moving',
        };
        setEnemyGrunts(gs => [...gs, flankGrunt]);
      });
      addFloatingText(BARN_POS.x, BARN_POS.y, '⚠ FLANKING!', '#f97316');
    }

    // War Ram spawn: wave 6+ every 3 waves
    if (newWave >= WAR_RAM_FIRST_WAVE && newWave % 3 === 0) {
      const rx = Math.max(0, ENEMY_BARN_POS.x - 2);
      const ry = ENEMY_BARN_POS.y;
      const nearestBuilding = placedBuildingsRef.current
        .filter(b => b.hp > 0)
        .reduce<PlacedBuilding | null>(
          (best, b) =>
            !best ||
            tileDist(rx, ry, b.x, b.y) < tileDist(rx, ry, best.x, best.y)
              ? b
              : best,
          null
        );
      const ramDest = nearestBuilding ?? BARN_POS;
      const ramPath = aStar(
        INITIAL_TILES,
        { x: rx, y: ry },
        { x: ramDest.x, y: ramDest.y },
        true,
        wallSet
      );
      const ram: EnemySiege = {
        id: siegeIdRef.current++,
        x: rx,
        y: ry,
        hp: WAR_RAM_MAX_HP,
        maxHp: WAR_RAM_MAX_HP,
        movingTo: ramPath[0] ?? { x: ramDest.x, y: ramDest.y },
        path: ramPath.slice(1),
        state: 'moving',
        targetBuildingId: nearestBuilding?.id ?? -1,
      };
      setEnemySiege(prev => [...prev, ram]);
      setWaveAnnouncement(`🪵 Wave ${newWave} — WAR RAM INCOMING!`);
      window.setTimeout(() => setWaveAnnouncement(null), 3000);
    }

    // Demolisher spawn: wave 14+ every 4 waves
    if (newWave >= DEMOLISHER_FIRST_WAVE && newWave % 4 === 0) {
      const dx = Math.max(0, ENEMY_BARN_POS.x - 2);
      const dy = ENEMY_BARN_POS.y + 1;
      const nearestBuilding2 = placedBuildingsRef.current
        .filter(b => b.hp > 0)
        .reduce<PlacedBuilding | null>(
          (best, b) =>
            !best ||
            tileDist(dx, dy, b.x, b.y) < tileDist(dx, dy, best.x, best.y)
              ? b
              : best,
          null
        );
      const dDest = nearestBuilding2 ?? BARN_POS;
      const dPath = aStar(
        INITIAL_TILES,
        { x: dx, y: dy },
        { x: dDest.x, y: dDest.y },
        true,
        wallSet
      );
      const demolisher: EnemySiege = {
        id: siegeIdRef.current++,
        x: dx,
        y: dy,
        hp: DEMOLISHER_MAX_HP,
        maxHp: DEMOLISHER_MAX_HP,
        movingTo: dPath[0] ?? { x: dDest.x, y: dDest.y },
        path: dPath.slice(1),
        state: 'moving',
        targetBuildingId: nearestBuilding2?.id ?? -1,
        siegeType: 'demolisher',
      };
      setEnemySiege(prev => [...prev, demolisher]);
      setWaveAnnouncement(
        `💣 Wave ${newWave} — DEMOLISHER! Protect your buildings!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 3500);
    }

    // Shaman spawn: wave 8+ every 4 waves
    if (newWave >= SHAMAN_FIRST_WAVE && newWave % 4 === 0) {
      const sx = Math.max(0, ENEMY_BARN_POS.x - 1);
      const sy = Math.max(0, ENEMY_BARN_POS.y - 1);
      const shamanPath = aStar(
        INITIAL_TILES,
        { x: sx, y: sy },
        BARN_POS,
        true,
        wallSet
      );
      const shaman: EnemyShaman = {
        id: shamanIdRef.current++,
        x: sx,
        y: sy,
        hp: SHAMAN_MAX_HP,
        maxHp: SHAMAN_MAX_HP,
        movingTo: shamanPath[0] ?? BARN_POS,
        path: shamanPath.slice(1),
        state: 'moving',
      };
      setEnemyShamans(ss => [...ss, shaman]);
      setWaveAnnouncement(
        `🧙 Wave ${newWave} — SHAMAN SPAWNS! Kill the healer!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 3000);
    }

    // Troll spawn: wave 10+ every 5 waves
    if (newWave >= TROLL_FIRST_WAVE && newWave % 5 === 0) {
      const tx2 = Math.max(0, ENEMY_BARN_POS.x - 1);
      const ty2 = Math.max(0, ENEMY_BARN_POS.y + 1);
      const troll: EnemyTroll = {
        id: trollIdRef.current++,
        x: tx2,
        y: ty2,
        hp: TROLL_MAX_HP,
        maxHp: TROLL_MAX_HP,
        movingTo: null,
        path: [],
        state: 'moving',
        targetType: 'barn',
        targetId: null,
      };
      setEnemyTrolls(ts => [...ts, troll]);
      setWaveAnnouncement(
        `🏹 Wave ${newWave} — TROLL ARCHER! Flank with cavalry!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 3000);
    }

    // Sapper spawn: wave 12+ every 6 waves
    if (newWave >= SAPPER_FIRST_WAVE && newWave % 6 === 0) {
      const sx2 = Math.max(0, ENEMY_BARN_POS.x - 2);
      const sy2 = ENEMY_BARN_POS.y;
      // Target: nearest wall, or barn if no walls
      const wallSet2 = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const nearestWall = placedBuildingsRef.current
        .filter(b => b.type === 'wall' && b.hp > 0)
        .sort(
          (a, b2) =>
            tileDist(sx2, sy2, a.x, a.y) - tileDist(sx2, sy2, b2.x, b2.y)
        )[0];
      const sapperTarget = nearestWall ?? BARN_POS;
      const sapperPath = aStar(
        INITIAL_TILES,
        { x: sx2, y: sy2 },
        { x: sapperTarget.x, y: sapperTarget.y },
        true,
        wallSet2
      );
      const sapper: EnemySapper = {
        id: sapperIdRef.current++,
        x: sx2,
        y: sy2,
        hp: SAPPER_MAX_HP,
        maxHp: SAPPER_MAX_HP,
        movingTo: sapperPath[0] ?? { x: sapperTarget.x, y: sapperTarget.y },
        path: sapperPath.slice(1),
        targetX: sapperTarget.x,
        targetY: sapperTarget.y,
        exploded: false,
      };
      setEnemySappers(ss => [...ss, sapper]);
      setWaveAnnouncement(
        `💥 Wave ${newWave} — GOBLIN SAPPER! Kill it before it reaches your walls!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 4000);
    }

    // Necromancer spawn: wave 16+ every 5 waves
    if (newWave >= NECROMANCER_FIRST_WAVE && newWave % 5 === 0) {
      const nx = Math.max(0, ENEMY_BARN_POS.x - 2);
      const ny = ENEMY_BARN_POS.y - 1;
      const nPath = aStar(
        INITIAL_TILES,
        { x: nx, y: ny },
        BARN_POS,
        true,
        wallSet
      );
      const necro: EnemyNecromancer = {
        id: necromancerIdRef.current++,
        x: nx,
        y: ny,
        hp: NECROMANCER_MAX_HP,
        maxHp: NECROMANCER_MAX_HP,
        movingTo: nPath[0] ?? BARN_POS,
        path: nPath.slice(1),
        state: 'moving',
      };
      setEnemyNecromancers(ns => [...ns, necro]);
      setWaveAnnouncement(
        `💀 Wave ${newWave} — NECROMANCER! Kill it before it raises the dead!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 4000);
    }

    // Witch Doctor spawn: wave 12+ every 3 waves
    if (newWave >= WITCH_DOCTOR_FIRST_WAVE && newWave % 3 === 2) {
      const wdx = Math.max(0, ENEMY_BARN_POS.x - 1);
      const wdy = Math.max(0, ENEMY_BARN_POS.y - 2);
      const wdPath = aStar(
        INITIAL_TILES,
        { x: wdx, y: wdy },
        BARN_POS,
        true,
        wallSet
      );
      const wd: EnemyWitchDoctor = {
        id: witchDoctorIdRef.current++,
        x: wdx,
        y: wdy,
        hp: WITCH_DOCTOR_MAX_HP,
        maxHp: WITCH_DOCTOR_MAX_HP,
        movingTo: wdPath[0] ?? BARN_POS,
        path: wdPath.slice(1),
        state: 'moving',
      };
      setEnemyWitchDoctors(prev => [...prev, wd]);
      setWaveAnnouncement(
        `🔮 Wave ${newWave} — WITCH DOCTOR! Kill it or grunts go berserk!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 4000);
    }

    // Warchief spawn: wave 18+ every 8 waves
    if (newWave >= WARCHIEF_FIRST_WAVE && newWave % 8 === 2) {
      const wx2 = Math.max(0, ENEMY_BARN_POS.x - 1);
      const wy2 = ENEMY_BARN_POS.y + 1;
      const wPath = aStar(
        INITIAL_TILES,
        { x: wx2, y: wy2 },
        BARN_POS,
        true,
        wallSet
      );
      const warchief: EnemyWarchief = {
        id: warchiefIdRef.current++,
        x: wx2,
        y: wy2,
        hp: WARCHIEF_MAX_HP,
        maxHp: WARCHIEF_MAX_HP,
        movingTo: wPath[0] ?? BARN_POS,
        path: wPath.slice(1),
        state: 'moving',
        lastStompAt: 0,
      };
      setEnemyWarchiefs(ws2 => [...ws2, warchief]);
      setWaveAnnouncement(
        `👑 Wave ${newWave} — WARCHIEF! Dangerous — he stomps and stuns your units!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 5000);
    }

    const nextDelay = Math.max(
      12000,
      Math.round(
        (GRUNT_SPAWN_MS - (newWave - 1) * 800) *
          (difficulty?.waveIntervalMult ?? 1)
      )
    );
    setNextWaveAt(Date.now() + nextDelay);
    spawnTimerRef.current = window.setTimeout(doSpawnWave, nextDelay);

    // Wave preview: show composition ~6s before next wave
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    const previewWave = newWave + 1;
    const previewDelay = Math.max(0, nextDelay - 6000);
    previewTimerRef.current = window.setTimeout(() => {
      if (gameOverRef.current) return;
      const gruntCount =
        previewWave + 2 + (previewWave % 3 === 0 ? previewWave + 2 : 0);
      const parts: string[] = [`${gruntCount} Grunts`];
      if (previewWave % 10 === 0) parts.push('1 WAR BULL 🐂');
      if (previewWave >= 8 && previewWave % 4 === 0) parts.push('1 Shaman 🧙');
      if (previewWave >= 12 && previewWave % 3 === 2)
        parts.push('1 Witch Doctor 🔮');
      if (previewWave >= 10 && previewWave % 5 === 0) parts.push('1 Troll 🏹');
      if (previewWave >= 12 && previewWave % 6 === 0) parts.push('1 Sapper 💥');
      if (previewWave >= 14 && previewWave % 4 === 0)
        parts.push('1 Demolisher 💣');
      if (previewWave >= 16 && previewWave % 5 === 0)
        parts.push('1 Necromancer 💀');
      if (previewWave >= WARCHIEF_FIRST_WAVE && previewWave % 8 === 2)
        parts.push('1 WARCHIEF 👑');
      if (previewWave >= 6 && previewWave % 3 === 0) parts.push('1 War Ram 🪵');
      setWavePreview(`⚠ INCOMING Wave ${previewWave}: ${parts.join(', ')}`);
      window.setTimeout(() => setWavePreview(null), 5500);
    }, previewDelay);
  }, []);

  useEffect(() => {
    if (gameOver) {
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
      return;
    }
    // Don't start wave timer while paused — pause/resume effect handles it
    if (gameSpeed === 0) return;
    const firstDelay = Math.round(
      GRUNT_SPAWN_MS * (difficulty?.waveIntervalMult ?? 1)
    );
    setNextWaveAt(Date.now() + firstDelay);
    spawnTimerRef.current = window.setTimeout(doSpawnWave, firstDelay);
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [gameOver, doSpawnWave, gameSpeed]);

  // Pause / resume wave spawn timer when gameSpeed toggles between 0 and running
  const doSpawnWaveRef = useRef(doSpawnWave);
  useEffect(() => {
    doSpawnWaveRef.current = doSpawnWave;
  }, [doSpawnWave]);
  useEffect(() => {
    if (gameOver) return;
    if (gameSpeed === 0) {
      // Pausing: cancel timer and save remaining time
      if (spawnTimerRef.current !== null && nextWaveAtRef.current !== null) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
        waveTimerRemainingRef.current = Math.max(
          1000,
          nextWaveAtRef.current - Date.now()
        );
      }
    } else {
      // Unpausing: restart timer if we saved remaining time
      if (
        waveTimerRemainingRef.current !== null &&
        spawnTimerRef.current === null
      ) {
        const remaining = waveTimerRemainingRef.current;
        waveTimerRemainingRef.current = null;
        setNextWaveAt(Date.now() + remaining);
        spawnTimerRef.current = window.setTimeout(
          () => doSpawnWaveRef.current(),
          remaining
        );
      }
    }
  }, [gameSpeed, gameOver]);

  // Loot crate spawner — 1-3 crates appear every 35s; more on later waves
  useEffect(() => {
    if (gameOver) return;
    const spawnCrate = () => {
      if (gameOverRef.current) return;
      const RESOURCES = [
        { gold: 40, lumber: 0, stone: 0 },
        { gold: 0, lumber: 30, stone: 0 },
        { gold: 0, lumber: 0, stone: 25 },
        { gold: 20, lumber: 15, stone: 0 },
        { gold: 25, lumber: 0, stone: 20 },
        { gold: 15, lumber: 15, stone: 10 },
      ];
      const spawnCount =
        waveRef.current >= 10 ? 3 : waveRef.current >= 5 ? 2 : 1;
      const occupied = new Set(lootCratesRef.current.map(c => `${c.x},${c.y}`));
      const candidates = LOOT_CRATE_POSITIONS.filter(
        p => !occupied.has(`${p.x},${p.y}`)
      );
      for (let s = 0; s < spawnCount && candidates.length > 0; s++) {
        const idx = Math.floor(Math.random() * candidates.length);
        const pos = candidates.splice(idx, 1)[0];
        if (!pos) break;
        const res = RESOURCES[Math.floor(Math.random() * RESOURCES.length)] ?? {
          gold: 30,
          lumber: 0,
          stone: 0,
        };
        setLootCrates(cs => [
          ...cs,
          {
            id: lootCrateIdRef.current++,
            x: pos.x,
            y: pos.y,
            gold: res.gold,
            lumber: res.lumber,
            stone: res.stone,
          },
        ]);
      }
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
      if (!shrine || capturedShrinesRef.current.has(shrine.id)) {
        setShrineCapturing(null);
        return;
      }
      const worker = workersRef.current.find(
        w => w.id === cap.workerId && w.hp > 0
      );
      if (
        !worker ||
        Math.round(worker.x) !== shrine.x ||
        Math.round(worker.y) !== shrine.y ||
        worker.movingTo !== null
      ) {
        setShrineCapturing(null);
        return;
      }
      if (Date.now() - cap.startedAt >= shrine.captureMs) {
        setCapturedShrines(s => {
          const ns = new Set(s);
          ns.add(shrine.id);
          return ns;
        });
        setShrineCapturing(null);
        if (shrine.type === 'war') {
          setShrineWarBuff(true);
          addFloatingText(shrine.x, shrine.y, '⚔️ WAR SHRINE!', '#f97316');
        } else {
          setShrinePlentyBuff(true);
          addFloatingText(shrine.x, shrine.y, '🌾 PLENTY SHRINE!', '#4ade80');
        }
      }
    }, 200);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Building construction completion — poll every 500ms and complete any that have finished
  useEffect(() => {
    if (gameOver) return;
    const id = window.setInterval(() => {
      if (gameOverRef.current) return;
      const now = Date.now();
      // Compute which buildings just finished BEFORE entering any updater
      const justFinished = placedBuildingsRef.current.filter(b => {
        if (!b.constructing) return false;
        const assistCount = workersRef.current.filter(
          w => w.assistBuildId === b.id && w.hp > 0
        ).length;
        const speedMult = 1 + assistCount * 0.4;
        return (now - (b.constructedAt ?? now)) * speedMult >= CONSTRUCTION_MS;
      });
      if (justFinished.length === 0) return;
      // Side effects (sound/text/other state) — safe to call outside updater
      justFinished.forEach(b => {
        addFloatingText(b.x, b.y, '✅ Built!', '#4ade80');
        Snd.buildComplete();
        const bonus = BUILDING_COSTS[b.type]?.foodCapBonus ?? 0;
        if (bonus > 0)
          setResources(r => ({ ...r, foodCap: r.foodCap + bonus }));
      });
      // Release assisting workers
      const finishedIds = new Set(justFinished.map(b => b.id));
      setWorkers(ws =>
        ws.map(w =>
          finishedIds.has(w.assistBuildId!)
            ? { ...w, assistBuildId: undefined, state: 'idle' as const }
            : w
        )
      );
      // Mark buildings as complete
      setPlacedBuildings(bs =>
        bs.map(b => {
          if (!finishedIds.has(b.id)) return b;
          return {
            ...b,
            constructing: false,
            constructedAt: undefined,
            hp: b.maxHp,
          };
        })
      );
    }, 500);
    return () => clearInterval(id);
  }, [gameOver, addFloatingText]);

  // Archer tower (id -1) is now handled by the shared enemy tower fire loop below

  // Enemy barn counterfire: shoots at player units within 5 tiles
  const enemyBarnFireTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (gameOver) return;
    const BARN_COUNTER_RANGE = 5;
    const BARN_COUNTER_DMG = 7;
    const BARN_COUNTER_MS = 3000;
    const fire = () => {
      if (gameOverRef.current || enemyBarnHpRef.current <= 0) return;
      const inRange = workersRef.current.filter(
        w =>
          w.hp > 0 &&
          tileDist(w.x, w.y, ENEMY_BARN_POS.x, ENEMY_BARN_POS.y) <=
            BARN_COUNTER_RANGE
      );
      if (inRange.length > 0) {
        const target = inRange.reduce((a, b) =>
          tileDist(a.x, a.y, ENEMY_BARN_POS.x, ENEMY_BARN_POS.y) <
          tileDist(b.x, b.y, ENEMY_BARN_POS.x, ENEMY_BARN_POS.y)
            ? a
            : b
        );
        workerHitRef.current.set(target.id, Date.now());
        setWorkers(prev =>
          prev.map(w =>
            w.id === target.id
              ? { ...w, hp: Math.max(0, w.hp - BARN_COUNTER_DMG) }
              : w
          )
        );
        addFloatingText(
          Math.round(target.x),
          Math.round(target.y),
          `🏴‍☠️-${BARN_COUNTER_DMG}`,
          '#ef4444'
        );
        addProjectile(
          ENEMY_BARN_POS.x,
          ENEMY_BARN_POS.y,
          Math.round(target.x),
          Math.round(target.y),
          'arrow',
          650
        );
      }
      enemyBarnFireTimerRef.current = window.setTimeout(fire, BARN_COUNTER_MS);
    };
    enemyBarnFireTimerRef.current = window.setTimeout(fire, BARN_COUNTER_MS);
    return () => {
      if (enemyBarnFireTimerRef.current)
        clearTimeout(enemyBarnFireTimerRef.current);
    };
  }, [gameOver, addFloatingText, addProjectile]);

  // Enemy AI: auto-builds new towers and walls over time to simulate active enemy base
  useEffect(() => {
    if (gameOver) return;
    const EXTRA_TOWER_SLOTS = [
      { x: 20, y: 21 },
      { x: 21, y: 20 },
      { x: 23, y: 20 },
      { x: 20, y: 23 },
    ];
    const EXTRA_WALL_SLOTS = [
      { x: 20, y: 24 },
      { x: 21, y: 23 },
      { x: 23, y: 21 },
      { x: 24, y: 20 },
    ];
    let nextTowerIdx = 0;
    let nextWallIdx = 0;
    const towerBuildTimer = window.setInterval(() => {
      if (
        gameOverRef.current ||
        enemyBarnHpRef.current <= 0 ||
        gameSpeedRef.current === 0
      )
        return;
      if (waveRef.current < 5) return;
      const pos = EXTRA_TOWER_SLOTS[nextTowerIdx];
      if (pos && nextTowerIdx < EXTRA_TOWER_SLOTS.length) {
        const alreadyExists = enemyTowersRef.current.find(
          t => t.x === pos.x && t.y === pos.y
        );
        if (!alreadyExists) {
          const tId = 9000 + nextTowerIdx;
          setEnemyTowers(ts => [
            ...ts,
            {
              id: tId,
              x: pos.x,
              y: pos.y,
              hp: ENEMY_TOWER_MAX_HP,
              maxHp: ENEMY_TOWER_MAX_HP,
            },
          ]);
          addFloatingText(pos.x, pos.y, '🏰 Tower Built!', '#ef4444');
        }
        nextTowerIdx++;
      }
    }, 90000);
    const wallBuildTimer = window.setInterval(() => {
      if (
        gameOverRef.current ||
        enemyBarnHpRef.current <= 0 ||
        gameSpeedRef.current === 0
      )
        return;
      if (waveRef.current < 7) return;
      const pos = EXTRA_WALL_SLOTS[nextWallIdx];
      if (pos && nextWallIdx < EXTRA_WALL_SLOTS.length) {
        const alreadyExists = enemyWallsRef.current.find(
          w => w.x === pos.x && w.y === pos.y
        );
        if (!alreadyExists) {
          const wId = 8000 + nextWallIdx;
          setEnemyWalls(ws => [
            ...ws,
            {
              id: wId,
              x: pos.x,
              y: pos.y,
              hp: ENEMY_WALL_MAX_HP,
              maxHp: ENEMY_WALL_MAX_HP,
            },
          ]);
          addFloatingText(pos.x, pos.y, '🧱 Wall Built!', '#dc2626');
        }
        nextWallIdx++;
      }
    }, 60000);
    return () => {
      clearInterval(towerBuildTimer);
      clearInterval(wallBuildTimer);
    };
  }, [gameOver, addFloatingText]);

  // Enemy fortress towers fire at workers in range
  useEffect(() => {
    if (gameOver || enemyTowers.length === 0) return;
    const scheduleShot = (towerId: number, tx: number, ty: number) => {
      enemyTowerTimersRef.current[towerId] = window.setTimeout(() => {
        delete enemyTowerTimersRef.current[towerId];
        if (gameOverRef.current) return;
        if (!enemyTowersRef.current.find(t => t.id === towerId && t.hp > 0))
          return;
        const dmg = Math.max(
          1,
          ENEMY_TOWER_DAMAGE - blacksmithUpgradesRef.current.ironHide * 2
        );
        const inRange = workersRef.current.filter(
          w => w.hp > 0 && tileDist(w.x, w.y, tx, ty) <= ENEMY_TOWER_RANGE
        );
        if (inRange.length > 0) {
          const target = inRange.reduce((a, b) =>
            tileDist(a.x, a.y, tx, ty) < tileDist(b.x, b.y, tx, ty) ? a : b
          );
          workerHitRef.current.set(target.id, Date.now());
          setWorkers(prev =>
            prev.map(w =>
              w.id === target.id ? { ...w, hp: Math.max(0, w.hp - dmg) } : w
            )
          );
          addFloatingText(
            Math.round(target.x),
            Math.round(target.y),
            `🏹-${dmg}`,
            '#dc2626'
          );
          addProjectile(
            tx,
            ty,
            Math.round(target.x),
            Math.round(target.y),
            'arrow',
            650
          );
        }
        scheduleShot(towerId, tx, ty);
      }, ENEMY_TOWER_ATTACK_MS);
    };
    enemyTowers
      .filter(t => t.hp > 0)
      .forEach(t => {
        if (!enemyTowerTimersRef.current[t.id]) scheduleShot(t.id, t.x, t.y);
      });
    return () => {
      Object.values(enemyTowerTimersRef.current).forEach(clearTimeout);
      enemyTowerTimersRef.current = {};
    };
  }, [enemyTowers, gameOver, addFloatingText, addProjectile]);

  // Player watchtowers fire arrows at enemy grunts in range
  useEffect(() => {
    const towers = placedBuildings.filter(
      b => b.type === 'watchtower' && b.hp > 0 && !b.constructing
    );
    if (!gameOver && towers.length > 0) {
      const scheduleShot = (towerId: number, tx: number, ty: number) => {
        watchtowerTimersRef.current[towerId] = window.setTimeout(() => {
          delete watchtowerTimersRef.current[towerId];
          if (gameOverRef.current) return;
          const tower = placedBuildingsRef.current.find(b => b.id === towerId);
          if (!tower || tower.hp <= 0) return;
          const grunts = enemyGruntsRef.current;
          const isGuard = guardTowerRef.current;
          const garrisonCount = (towerGarrisonRef.current[towerId] ?? [])
            .length;
          const dmgT =
            (isGuard ? WATCHTOWER_DAMAGE + 7 : WATCHTOWER_DAMAGE) +
            garrisonCount * 4;
          const rangeT =
            (isGuard ? WATCHTOWER_ATTACK_RANGE + 1 : WATCHTOWER_ATTACK_RANGE) +
            garrisonCount * 0.5;
          const inRangeT = grunts.filter(
            g => g.hp > 0 && tileDist(g.x, g.y, tx, ty) <= rangeT
          );
          const targetT = inRangeT.reduce<EnemyGrunt | null>(
            (best, g) =>
              !best ||
              tileDist(g.x, g.y, tx, ty) < tileDist(best.x, best.y, tx, ty)
                ? g
                : best,
            null
          );
          if (targetT) {
            gruntHitRef.current.set(targetT.id, Date.now());
            setEnemyGrunts(gs =>
              gs.map(g =>
                g.id === targetT.id ? { ...g, hp: Math.max(0, g.hp - dmgT) } : g
              )
            );
            addFloatingText(
              Math.round(targetT.x),
              Math.round(targetT.y),
              `${isGuard ? '🏰' : '🏹'}-${dmgT}`,
              '#22d3ee'
            );
            addProjectile(
              tx,
              ty,
              Math.round(targetT.x),
              Math.round(targetT.y),
              'arrow',
              600
            );
          }
          scheduleShot(towerId, tx, ty);
        }, WATCHTOWER_ATTACK_MS);
      };
      towers.forEach(t => {
        if (!watchtowerTimersRef.current[t.id]) scheduleShot(t.id, t.x, t.y);
      });
    }
    return () => {
      Object.values(watchtowerTimersRef.current).forEach(clearTimeout);
      watchtowerTimersRef.current = {};
    };
  }, [placedBuildings, gameOver, addFloatingText, addProjectile]);

  // Frost Tower auto-fire — slows + chips grunts in range
  const frostTowerTimersRef = useRef<Record<number, number>>({});
  useEffect(() => {
    const frostTowers = placedBuildings.filter(
      b => b.type === 'frostTower' && b.hp > 0 && !b.constructing
    );
    if (!gameOver && frostTowers.length > 0) {
      const scheduleFrost = (towerId: number, tx: number, ty: number) => {
        frostTowerTimersRef.current[towerId] = window.setTimeout(() => {
          delete frostTowerTimersRef.current[towerId];
          if (gameOverRef.current) return;
          const tower = placedBuildingsRef.current.find(b => b.id === towerId);
          if (!tower || tower.hp <= 0) return;
          const grunts = enemyGruntsRef.current.filter(
            g => g.hp > 0 && tileDist(g.x, g.y, tx, ty) <= FROST_TOWER_RANGE
          );
          const target = grunts.reduce<EnemyGrunt | null>(
            (best, g) =>
              !best ||
              tileDist(g.x, g.y, tx, ty) < tileDist(best.x, best.y, tx, ty)
                ? g
                : best,
            null
          );
          if (target) {
            const freezeUntil = Date.now() + FROST_TOWER_SLOW_DURATION;
            setEnemyGrunts(gs =>
              gs.map(g =>
                g.id === target.id
                  ? {
                      ...g,
                      hp: Math.max(0, g.hp - FROST_TOWER_DAMAGE),
                      frozenUntil: freezeUntil,
                    }
                  : g
              )
            );
            addFloatingText(
              Math.round(target.x),
              Math.round(target.y),
              `❄️-${FROST_TOWER_DAMAGE}`,
              '#93c5fd'
            );
            addProjectile(
              tx,
              ty,
              Math.round(target.x),
              Math.round(target.y),
              'ice',
              500
            );
          }
          scheduleFrost(towerId, tx, ty);
        }, FROST_TOWER_ATTACK_MS);
      };
      frostTowers.forEach(t => {
        if (!frostTowerTimersRef.current[t.id]) scheduleFrost(t.id, t.x, t.y);
      });
    }
    return () => {
      Object.values(frostTowerTimersRef.current).forEach(clearTimeout);
      frostTowerTimersRef.current = {};
    };
  }, [placedBuildings, gameOver, addFloatingText, addProjectile]);

  // Ballista Tower auto-fire — piercing bolt hits primary target + nearby grunts
  const ballistaTimersRef = useRef<Record<number, number>>({});
  useEffect(() => {
    const ballistaTowers = placedBuildings.filter(
      b => b.type === 'ballista' && b.hp > 0 && !b.constructing
    );
    if (!gameOver && ballistaTowers.length > 0) {
      const scheduleBallista = (towerId: number, tx: number, ty: number) => {
        ballistaTimersRef.current[towerId] = window.setTimeout(() => {
          delete ballistaTimersRef.current[towerId];
          if (gameOverRef.current) return;
          const tower = placedBuildingsRef.current.find(b => b.id === towerId);
          if (!tower || tower.hp <= 0) return;
          const grunts = enemyGruntsRef.current.filter(
            g => g.hp > 0 && tileDist(g.x, g.y, tx, ty) <= BALLISTA_RANGE
          );
          const primary = grunts.reduce<EnemyGrunt | null>(
            (best, g) =>
              !best ||
              tileDist(g.x, g.y, tx, ty) < tileDist(best.x, best.y, tx, ty)
                ? g
                : best,
            null
          );
          if (primary) {
            const px = primary.x,
              py = primary.y;
            addProjectile(tx, ty, Math.round(px), Math.round(py), 'bolt', 450);
            setEnemyGrunts(gs =>
              gs.map(g => {
                if (g.id === primary.id) {
                  addFloatingText(
                    Math.round(px),
                    Math.round(py),
                    `🏹-${BALLISTA_DAMAGE}`,
                    '#f59e0b'
                  );
                  return { ...g, hp: Math.max(0, g.hp - BALLISTA_DAMAGE) };
                }
                if (tileDist(g.x, g.y, px, py) <= BALLISTA_PIERCE_RANGE) {
                  addFloatingText(
                    Math.round(g.x),
                    Math.round(g.y),
                    `-${BALLISTA_PIERCE_DAMAGE}`,
                    '#fbbf24'
                  );
                  return {
                    ...g,
                    hp: Math.max(0, g.hp - BALLISTA_PIERCE_DAMAGE),
                  };
                }
                return g;
              })
            );
          }
          scheduleBallista(towerId, tx, ty);
        }, BALLISTA_ATTACK_MS);
      };
      ballistaTowers.forEach(t => {
        if (!ballistaTimersRef.current[t.id]) scheduleBallista(t.id, t.x, t.y);
      });
    }
    return () => {
      Object.values(ballistaTimersRef.current).forEach(clearTimeout);
      ballistaTimersRef.current = {};
    };
  }, [placedBuildings, gameOver, addFloatingText, addProjectile]);

  // Poison Tower auto-fire — deals initial dmg + DoT to nearest grunt in range
  const poisonTowerTimersRef = useRef<Record<number, number>>({});
  useEffect(() => {
    const poisonTowers = placedBuildings.filter(
      b => b.type === 'poisonTower' && b.hp > 0 && !b.constructing
    );
    if (!gameOver && poisonTowers.length > 0) {
      const schedulePoison = (towerId: number, tx: number, ty: number) => {
        poisonTowerTimersRef.current[towerId] = window.setTimeout(() => {
          delete poisonTowerTimersRef.current[towerId];
          if (gameOverRef.current) return;
          const tower = placedBuildingsRef.current.find(b => b.id === towerId);
          if (!tower || tower.hp <= 0) return;
          const grunts = enemyGruntsRef.current.filter(
            g => g.hp > 0 && tileDist(g.x, g.y, tx, ty) <= POISON_TOWER_RANGE
          );
          const target = grunts.reduce<EnemyGrunt | null>(
            (best, g) =>
              !best ||
              tileDist(g.x, g.y, tx, ty) < tileDist(best.x, best.y, tx, ty)
                ? g
                : best,
            null
          );
          if (target) {
            const poisonUntil = Date.now() + POISON_TOWER_DURATION_MS;
            setEnemyGrunts(gs =>
              gs.map(g =>
                g.id === target.id
                  ? {
                      ...g,
                      hp: Math.max(0, g.hp - POISON_TOWER_DAMAGE),
                      poisonedUntil: poisonUntil,
                      poisonDps: POISON_TOWER_DPS,
                    }
                  : g
              )
            );
            addFloatingText(
              Math.round(target.x),
              Math.round(target.y),
              `☠️-${POISON_TOWER_DAMAGE}`,
              '#4ade80'
            );
            addProjectile(
              tx,
              ty,
              Math.round(target.x),
              Math.round(target.y),
              'poison',
              550
            );
          }
          schedulePoison(towerId, tx, ty);
        }, POISON_TOWER_ATTACK_MS);
      };
      poisonTowers.forEach(t => {
        if (!poisonTowerTimersRef.current[t.id]) schedulePoison(t.id, t.x, t.y);
      });
    }
    return () => {
      Object.values(poisonTowerTimersRef.current).forEach(clearTimeout);
      poisonTowerTimersRef.current = {};
    };
  }, [placedBuildings, gameOver, addFloatingText, addProjectile]);

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
      const target = enemyGruntsRef.current.reduce<EnemyGrunt | null>(
        (best, g) => {
          if (tileDist(g.x, g.y, BARN_POS.x, BARN_POS.y) > BARN_DEFENSE_RANGE)
            return best;
          if (
            !best ||
            tileDist(g.x, g.y, BARN_POS.x, BARN_POS.y) <
              tileDist(best.x, best.y, BARN_POS.x, BARN_POS.y)
          )
            return g;
          return best;
        },
        null
      );
      if (target) {
        setEnemyGrunts(gs =>
          gs.map(g =>
            g.id === target.id ? { ...g, hp: Math.max(0, g.hp - dmg) } : g
          )
        );
        addFloatingText(
          Math.round(target.x),
          Math.round(target.y),
          `🏰-${dmg}`,
          '#fbbf24'
        );
      }
      const fireDelay =
        playerBarnHpRef.current / PLAYER_BARN_MAX_HP < 0.25
          ? BARN_DEFENSE_MS / 2
          : BARN_DEFENSE_MS;
      barnArrowTimerRef.current = window.setTimeout(fireBarnArrow, fireDelay);
    };
    barnArrowTimerRef.current = window.setTimeout(
      fireBarnArrow,
      BARN_DEFENSE_MS
    );
    return () => {
      if (barnArrowTimerRef.current) clearTimeout(barnArrowTimerRef.current);
    };
  }, [gameOver, addFloatingText]);

  // Passive barn regen: +1 HP every 5s when no grunts are active and barn < max
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => {
      if (gameOverRef.current || gameSpeedRef.current === 0) return;
      if (enemyGruntsRef.current.length > 0) return;
      setPlayerBarnHp(hp =>
        hp < PLAYER_BARN_MAX_HP ? Math.min(PLAYER_BARN_MAX_HP, hp + 1) : hp
      );
    }, 5000);
    return () => clearInterval(id);
  }, [gameOver]);

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
        if (next > hp)
          addFloatingText(BARN_POS.x, BARN_POS.y, `+${regen}🏰`, '#4ade80');
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
      if (queue.length === 0) {
        trainingElapsedRef.current = 0;
        setTrainingProgress(0);
        return;
      }
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
        const vetBonus = barracksTechRef.current.veteranTraining ? 20 : 0;
        const baseUnit = makeUnit(newId, BARN_POS.x, BARN_POS.y, type);
        const unit =
          vetBonus > 0
            ? {
                ...baseUnit,
                maxHp: baseUnit.maxHp + vetBonus,
                hp: baseUnit.maxHp + vetBonus,
              }
            : baseUnit;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [
            ...ws,
            {
              ...unit,
              movingTo: path[0] ?? rp,
              path: path.slice(1),
              state: 'moving' as const,
            },
          ];
        }
        return [...ws, unit];
      });
      addFloatingText(
        BARN_POS.x,
        BARN_POS.y,
        type === 'swordsman' ? '⚔️ Ready!' : '🐴 Ready!',
        '#4ade80'
      );
      Snd.unitReady();
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
      const traps = placedBuildingsRef.current.filter(
        b => b.type === 'spikeTrap'
      );
      const now = Date.now();
      const grunts = enemyGruntsRef.current;
      traps.forEach(trap => {
        const lastTrigger = trapTriggeredRef.current[trap.id] ?? 0;
        if (now - lastTrigger < TRAP_COOLDOWN_MS) return; // still on cooldown
        const victim = grunts.find(
          g => g.hp > 0 && tileDist(g.x, g.y, trap.x, trap.y) <= TRAP_RADIUS
        );
        if (!victim) return;
        trapTriggeredRef.current[trap.id] = now;
        setEnemyGrunts(gs =>
          gs.map(g =>
            g.id === victim.id
              ? { ...g, hp: Math.max(0, g.hp - TRAP_DAMAGE) }
              : g
          )
        );
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
      const income = Math.round(mills.length * 2 * upkeepMultRef.current);
      setResources(r => ({ ...r, gold: r.gold + income }));
      mills.forEach(m =>
        addFloatingText(
          m.x,
          m.y,
          `+${Math.round(income / mills.length)}🪙`,
          '#fde68a'
        )
      );
    }, 5000);
    return () => clearInterval(id);
  }, [placedBuildings, gameOver, addFloatingText]);

  // Garrison heal
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => {
      if (gameOverRef.current) return;
      setGarrisoned(gs => {
        const healed = gs.map(u =>
          u.hp < u.maxHp
            ? { ...u, hp: Math.min(u.maxHp, u.hp + GARRISON_HEAL_AMOUNT) }
            : u
        );
        return healed;
      });
    }, GARRISON_HEAL_MS);
    return () => clearInterval(id);
  }, [gameOver]);

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

  const FORMATION_OFFSETS = [
    { dx: 0, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 1 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: -1 },
  ];

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
            ? (FORMATION_OFFSETS[idx++] ?? { dx: 0, dy: 0 })
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
        const offset = FORMATION_OFFSETS[idx++] ?? { dx: 0, dy: 0 };
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

  // Animation loop
  useEffect(() => {
    function animate(timestamp: number) {
      // When paused, skip all game-state updates to avoid 60fps React re-renders
      if (gameSpeedRef.current === 0) {
        prevTimeRef.current = null; // reset so we get a clean delta on resume
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      const deltaTime =
        prevTimeRef.current !== null
          ? (timestamp - prevTimeRef.current) / 1000
          : 1 / 60;
      const dt = Math.min(deltaTime, 0.1) * gameSpeedRef.current;
      prevTimeRef.current = timestamp;

      const curTrees = treesRef.current;
      const curGoldMines = goldMinesRef.current;
      const curStone = stoneNodesRef.current;
      const gatherT = gatherTimeoutsRef.current;
      const attackT = attackTimeoutsRef.current;

      // Morale aura: hero within 3 tiles speeds up attack interval by 30%
      // Battle Shout (level 2 hero ability): all units within 4 tiles get 40% faster attacks for 8s
      const heroUnit = workersRef.current.find(
        w => w.unitType === 'hero' && w.hp > 0
      );
      const shouting = battleShoutUntilRef.current > Date.now();
      const getMoraleMs = (wx: number, wy: number) => {
        if (!heroUnit) return ATTACK_INTERVAL_MS;
        const moraleMult =
          tileDist(wx, wy, heroUnit.x, heroUnit.y) <= 3 ? 0.7 : 1;
        const shoutMult =
          shouting &&
          tileDist(wx, wy, heroUnit.x, heroUnit.y) <= HERO_SHOUT_RADIUS
            ? HERO_SHOUT_ATK_MULT
            : 1;
        return Math.round(ATTACK_INTERVAL_MS * moraleMult * shoutMult);
      };

      // Hero item auto-pickup (must run outside setWorkers updater to avoid nested setState)
      const heroForPickup = workersRef.current.find(
        w => w.unitType === 'hero' && w.hp > 0
      );
      if (heroForPickup) {
        const nearItem = droppedItemsRef.current.find(
          d =>
            !pendingPickupRef.current.has(d.id) &&
            tileDist(d.x, d.y, heroForPickup.x, heroForPickup.y) <= 1.0
        );
        if (nearItem) {
          const data = HERO_ITEM_DATA[nearItem.itemId];
          if (nearItem.itemId === 'tome_xp') {
            pendingPickupRef.current.add(nearItem.id);
            setWorkers(ws2 =>
              ws2.map(u => {
                if (u.unitType !== 'hero') return u;
                const newXp = u.xp + 80;
                const newLevel =
                  newXp >= XP_TO_LEVEL_3
                    ? 3
                    : newXp >= XP_TO_LEVEL_2
                      ? 2
                      : newXp >= XP_TO_LEVEL_1
                        ? 1
                        : 0;
                if (newLevel > u.level) {
                  addFloatingText(
                    Math.round(u.x),
                    Math.round(u.y),
                    `⭐ Level ${newLevel}!`,
                    '#fbbf24'
                  );
                  return {
                    ...u,
                    xp: newXp,
                    level: newLevel,
                    maxHp: u.maxHp + VETERAN_HP_BONUS,
                    hp: Math.min(
                      u.hp + VETERAN_HP_BONUS,
                      u.maxHp + VETERAN_HP_BONUS
                    ),
                  };
                }
                return { ...u, xp: newXp };
              })
            );
            addFloatingText(
              Math.round(heroForPickup.x),
              Math.round(heroForPickup.y),
              `📖 +80 XP!`,
              '#c084fc'
            );
            setDroppedItems(ds => {
              pendingPickupRef.current.delete(nearItem.id);
              return ds.filter(d => d.id !== nearItem.id);
            });
          } else if (heroItemsRef.current.length < HERO_MAX_ITEMS) {
            pendingPickupRef.current.add(nearItem.id);
            setHeroItems(hi => [
              ...hi,
              { id: nearItem.id, itemId: nearItem.itemId },
            ]);
            setDroppedItems(ds => {
              pendingPickupRef.current.delete(nearItem.id);
              return ds.filter(d => d.id !== nearItem.id);
            });
            addFloatingText(
              Math.round(heroForPickup.x),
              Math.round(heroForPickup.y),
              `${data.emoji} ${data.name}!`,
              '#c084fc'
            );
          }
        }
      }

      // Update workers — compute food loss from ref to avoid setState-inside-updater
      const deadWorkerCount = workersRef.current.filter(w => w.hp <= 0).length;
      if (deadWorkerCount > 0)
        setResources(r => ({
          ...r,
          food: Math.max(0, r.food - deadWorkerCount),
        }));
      setWorkers(ws => {
        const alive = ws.filter(w => w.hp > 0);

        return alive.map(w => {
          // Stun check: War Stomp from Warchief freezes unit in place
          if (w.stunUntil && Date.now() < w.stunUntil) return w;

          // Attack-move: scan for nearby enemies while marching
          if (w.attackMove && w.state === 'moving' && !w.attacking) {
            const AM_SCAN = 2.5;
            const nearGrunt = enemyGruntsRef.current.find(
              g => g.hp > 0 && tileDist(w.x, w.y, g.x, g.y) <= AM_SCAN
            );
            if (nearGrunt)
              return {
                ...w,
                attacking: {
                  targetType: 'grunt' as const,
                  gruntId: nearGrunt.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearCreep = neutralCreepsRef.current.find(
              c => c.hp > 0 && tileDist(w.x, w.y, c.x, c.y) <= AM_SCAN
            );
            if (nearCreep)
              return {
                ...w,
                attacking: {
                  targetType: 'creep' as const,
                  creepId: nearCreep.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearRam = enemySiegeRef.current.find(
              r => r.hp > 0 && tileDist(w.x, w.y, r.x, r.y) <= AM_SCAN
            );
            if (nearRam)
              return {
                ...w,
                attacking: {
                  targetType: 'siege' as const,
                  siegeId: nearRam.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearShaman = enemyShamansRef.current.find(
              s => s.hp > 0 && tileDist(w.x, w.y, s.x, s.y) <= AM_SCAN
            );
            if (nearShaman)
              return {
                ...w,
                attacking: {
                  targetType: 'shaman' as const,
                  shamanId: nearShaman.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearTroll = enemyTrollsRef.current.find(
              t => t.hp > 0 && tileDist(w.x, w.y, t.x, t.y) <= AM_SCAN
            );
            if (nearTroll)
              return {
                ...w,
                attacking: {
                  targetType: 'troll' as const,
                  trollId: nearTroll.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearSapper = enemySappersRef.current.find(
              s =>
                s.hp > 0 &&
                !s.exploded &&
                tileDist(w.x, w.y, s.x, s.y) <= AM_SCAN
            );
            if (nearSapper)
              return {
                ...w,
                attacking: {
                  targetType: 'sapper' as const,
                  sapperId: nearSapper.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearNecro = enemyNecromancersRef.current.find(
              n => n.hp > 0 && tileDist(w.x, w.y, n.x, n.y) <= AM_SCAN
            );
            if (nearNecro)
              return {
                ...w,
                attacking: {
                  targetType: 'necromancer' as const,
                  necromancerId: nearNecro.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearWD = enemyWitchDoctorsRef.current.find(
              d => d.hp > 0 && tileDist(w.x, w.y, d.x, d.y) <= AM_SCAN
            );
            if (nearWD)
              return {
                ...w,
                attacking: {
                  targetType: 'witchDoctor' as const,
                  witchDoctorId: nearWD.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearWC = enemyWarchiefssRef.current.find(
              wc2 => wc2.hp > 0 && tileDist(w.x, w.y, wc2.x, wc2.y) <= AM_SCAN
            );
            if (nearWC)
              return {
                ...w,
                attacking: {
                  targetType: 'warchief' as const,
                  warchiefId: nearWC.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
          }
          // Hold position: stay put, auto-attack nearby enemies without chasing
          if (w.holdPosition) {
            if (
              w.state === 'idle' &&
              !w.attacking &&
              w.unitType !== 'farmer' &&
              w.unitType !== 'catapult' &&
              w.unitType !== 'trebuchet'
            ) {
              const HP_RANGE = 1.8;
              const nearGruntH = enemyGruntsRef.current.find(
                g => g.hp > 0 && tileDist(w.x, w.y, g.x, g.y) <= HP_RANGE
              );
              if (nearGruntH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'grunt' as const,
                    gruntId: nearGruntH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearRamH = enemySiegeRef.current.find(
                r => r.hp > 0 && tileDist(w.x, w.y, r.x, r.y) <= HP_RANGE
              );
              if (nearRamH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'siege' as const,
                    siegeId: nearRamH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearShamanH = enemyShamansRef.current.find(
                s => s.hp > 0 && tileDist(w.x, w.y, s.x, s.y) <= HP_RANGE
              );
              if (nearShamanH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'shaman' as const,
                    shamanId: nearShamanH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearTrollH = enemyTrollsRef.current.find(
                t => t.hp > 0 && tileDist(w.x, w.y, t.x, t.y) <= HP_RANGE
              );
              if (nearTrollH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'troll' as const,
                    trollId: nearTrollH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearSapperH = enemySappersRef.current.find(
                s =>
                  s.hp > 0 &&
                  !s.exploded &&
                  tileDist(w.x, w.y, s.x, s.y) <= HP_RANGE
              );
              if (nearSapperH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'sapper' as const,
                    sapperId: nearSapperH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearNecroH = enemyNecromancersRef.current.find(
                n => n.hp > 0 && tileDist(w.x, w.y, n.x, n.y) <= HP_RANGE
              );
              if (nearNecroH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'necromancer' as const,
                    necromancerId: nearNecroH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearWDH = enemyWitchDoctorsRef.current.find(
                d => d.hp > 0 && tileDist(w.x, w.y, d.x, d.y) <= HP_RANGE
              );
              if (nearWDH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'witchDoctor' as const,
                    witchDoctorId: nearWDH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearWCH = enemyWarchiefssRef.current.find(
                wc2 =>
                  wc2.hp > 0 && tileDist(w.x, w.y, wc2.x, wc2.y) <= HP_RANGE
              );
              if (nearWCH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'warchief' as const,
                    warchiefId: nearWCH.id,
                  },
                  state: 'attacking' as const,
                };
            }
            // After killing target, go back to idle (don't chase)
            if (w.state === 'attacking' && w.attacking) {
              const isGruntDead =
                w.attacking.targetType === 'grunt' &&
                !enemyGruntsRef.current.find(
                  g =>
                    g.id ===
                      (w.attacking as { targetType: 'grunt'; gruntId: number })
                        .gruntId && g.hp > 0
                );
              const isRamDead =
                w.attacking.targetType === 'siege' &&
                !enemySiegeRef.current.find(
                  r =>
                    r.id ===
                      (w.attacking as { targetType: 'siege'; siegeId: number })
                        .siegeId && r.hp > 0
                );
              if (isGruntDead || isRamDead)
                return { ...w, attacking: null, state: 'idle' };
            }
            // Block movement while holding position
            if (w.state === 'moving')
              return { ...w, movingTo: null, path: [], state: 'idle' };
            return w;
          }
          // Aggressive stance: idle combat units auto-engage nearby enemies within 3 tiles
          if (
            stanceRef.current === 'aggressive' &&
            w.state === 'idle' &&
            !w.attacking &&
            !w.holdPosition &&
            !w.patrol &&
            w.unitType !== 'farmer' &&
            w.unitType !== 'catapult' &&
            w.unitType !== 'trebuchet'
          ) {
            const AGG_RANGE = 3;
            const nearGruntA = enemyGruntsRef.current.find(
              g => g.hp > 0 && tileDist(w.x, w.y, g.x, g.y) <= AGG_RANGE
            );
            if (nearGruntA)
              return {
                ...w,
                attacking: {
                  targetType: 'grunt' as const,
                  gruntId: nearGruntA.id,
                },
                state: 'attacking' as const,
              };
            const nearRamA = enemySiegeRef.current.find(
              r => r.hp > 0 && tileDist(w.x, w.y, r.x, r.y) <= AGG_RANGE
            );
            if (nearRamA)
              return {
                ...w,
                attacking: {
                  targetType: 'siege' as const,
                  siegeId: nearRamA.id,
                },
                state: 'attacking' as const,
              };
            const nearSapperA = enemySappersRef.current.find(
              s =>
                s.hp > 0 &&
                !s.exploded &&
                tileDist(w.x, w.y, s.x, s.y) <= AGG_RANGE
            );
            if (nearSapperA)
              return {
                ...w,
                attacking: {
                  targetType: 'sapper' as const,
                  sapperId: nearSapperA.id,
                },
                state: 'attacking' as const,
              };
            const nearNecroA = enemyNecromancersRef.current.find(
              n => n.hp > 0 && tileDist(w.x, w.y, n.x, n.y) <= AGG_RANGE
            );
            if (nearNecroA)
              return {
                ...w,
                attacking: {
                  targetType: 'necromancer' as const,
                  necromancerId: nearNecroA.id,
                },
                state: 'attacking' as const,
              };
            const nearWDA = enemyWitchDoctorsRef.current.find(
              d => d.hp > 0 && tileDist(w.x, w.y, d.x, d.y) <= AGG_RANGE
            );
            if (nearWDA)
              return {
                ...w,
                attacking: {
                  targetType: 'witchDoctor' as const,
                  witchDoctorId: nearWDA.id,
                },
                state: 'attacking' as const,
              };
            const nearWCA = enemyWarchiefssRef.current.find(
              wc2 => wc2.hp > 0 && tileDist(w.x, w.y, wc2.x, wc2.y) <= AGG_RANGE
            );
            if (nearWCA)
              return {
                ...w,
                attacking: {
                  targetType: 'warchief' as const,
                  warchiefId: nearWCA.id,
                },
                state: 'attacking' as const,
              };
          }
          // When attack-move unit finishes its target, resume march to original destination
          if (w.attackMove && w.state === 'idle' && w.attackMoveTarget) {
            const dest = w.attackMoveTarget;
            const atDest = tileDist(w.x, w.y, dest.x, dest.y) < 0.5;
            if (!atDest) {
              const p = aStar(
                INITIAL_TILES,
                { x: Math.round(w.x), y: Math.round(w.y) },
                dest
              );
              return {
                ...w,
                movingTo: p[0] ?? dest,
                path: p.slice(1),
                state: 'moving' as const,
              };
            }
            return { ...w, attackMove: false, attackMoveTarget: null };
          }

          if (w.movingTo) {
            const dx = w.movingTo.x - w.x,
              dy = w.movingTo.y - w.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const epsilon = 0.12;
            if (d < epsilon) {
              // Advance along A* path
              if (w.path.length > 0) {
                const [next, ...rest] = w.path;
                return {
                  ...w,
                  x: w.movingTo.x,
                  y: w.movingTo.y,
                  movingTo: next ?? null,
                  path: rest,
                };
              }
              // Arrived at final destination
              if (w.gathering && w.state !== 'returning')
                return {
                  ...w,
                  x: w.movingTo.x,
                  y: w.movingTo.y,
                  movingTo: null,
                  path: [],
                  state: 'gathering',
                };
              if (w.attacking && w.state !== 'returning')
                return {
                  ...w,
                  x: w.movingTo.x,
                  y: w.movingTo.y,
                  movingTo: null,
                  path: [],
                  state: 'attacking',
                };
              if (w.repairing && w.state !== 'returning')
                return {
                  ...w,
                  x: w.movingTo.x,
                  y: w.movingTo.y,
                  movingTo: null,
                  path: [],
                  state: 'repairing',
                };
              if (w.state === 'returning') {
                const movDest = w.movingTo!;
                const atBarn =
                  tileDist(movDest.x, movDest.y, BARN_POS.x, BARN_POS.y) <
                  epsilon;
                const atLumberShed =
                  !atBarn &&
                  w.carrying.lumber > 0 &&
                  placedBuildingsRef.current.some(
                    b =>
                      b.type === 'lumberShed' &&
                      b.hp > 0 &&
                      tileDist(movDest.x, movDest.y, b.x, b.y) < epsilon
                  );
                const atMiningCamp =
                  !atBarn &&
                  !atLumberShed &&
                  (w.carrying.gold > 0 || w.carrying.stone > 0) &&
                  placedBuildingsRef.current.some(
                    b =>
                      b.type === 'miningCamp' &&
                      b.hp > 0 &&
                      tileDist(movDest.x, movDest.y, b.x, b.y) < epsilon
                  );
                if (atBarn || atLumberShed || atMiningCamp) {
                  const goldDeposit = Math.round(
                    w.carrying.gold * upkeepMultRef.current
                  );
                  if (
                    goldDeposit > 0 ||
                    w.carrying.lumber > 0 ||
                    w.carrying.stone > 0
                  )
                    Snd.gold();
                  setResources(r => ({
                    ...r,
                    gold: r.gold + goldDeposit,
                    lumber: r.lumber + w.carrying.lumber,
                    stone: r.stone + w.carrying.stone,
                  }));
                  incomeAccRef.current.gold += goldDeposit;
                  incomeAccRef.current.lumber += w.carrying.lumber;
                  incomeAccRef.current.stone += w.carrying.stone;
                  if (w.carrying.gold > 0)
                    setTotalGold(g => g + w.carrying.gold);
                  if (w.carrying.lumber > 0)
                    setTotalLumber(l => l + w.carrying.lumber);
                  if (w.carrying.stone > 0)
                    setTotalStone(s => s + w.carrying.stone);
                  if (w.gathering) {
                    if (w.gathering.type === 'tree') {
                      const t = curTrees[w.gathering.idx];
                      if (t && t.amount > 0) {
                        const p = aStar(
                          INITIAL_TILES,
                          {
                            x: Math.round(w.movingTo.x),
                            y: Math.round(w.movingTo.y),
                          },
                          { x: t.x, y: t.y }
                        );
                        return {
                          ...w,
                          x: w.movingTo.x,
                          y: w.movingTo.y,
                          movingTo: p[0] ?? { x: t.x, y: t.y },
                          path: p.slice(1),
                          carrying: { gold: 0, lumber: 0, stone: 0 },
                          state: 'moving',
                        };
                      }
                    } else if (w.gathering.type === 'gold') {
                      const mineIdx = w.gathering.idx;
                      const mine = curGoldMines[mineIdx];
                      if (mine && mine.amount > 0) {
                        const p = aStar(
                          INITIAL_TILES,
                          {
                            x: Math.round(w.movingTo.x),
                            y: Math.round(w.movingTo.y),
                          },
                          { x: mine.x, y: mine.y }
                        );
                        return {
                          ...w,
                          x: w.movingTo.x,
                          y: w.movingTo.y,
                          movingTo: p[0] ?? mine,
                          path: p.slice(1),
                          carrying: { gold: 0, lumber: 0, stone: 0 },
                          state: 'moving',
                        };
                      }
                      // mine depleted — auto-find nearest non-empty mine
                      const wx3 = Math.round(w.movingTo.x),
                        wy3 = Math.round(w.movingTo.y);
                      const altMine = curGoldMines.reduce<{
                        node: ResourceNode;
                        idx: number;
                        d: number;
                      } | null>((best, m, i) => {
                        if (m.amount <= 0) return best;
                        const d = tileDist(wx3, wy3, m.x, m.y);
                        return !best || d < best.d
                          ? { node: m, idx: i, d }
                          : best;
                      }, null);
                      if (altMine) {
                        const p = aStar(
                          INITIAL_TILES,
                          { x: wx3, y: wy3 },
                          { x: altMine.node.x, y: altMine.node.y }
                        );
                        return {
                          ...w,
                          x: w.movingTo.x,
                          y: w.movingTo.y,
                          movingTo: p[0] ?? altMine.node,
                          path: p.slice(1),
                          carrying: { gold: 0, lumber: 0, stone: 0 },
                          state: 'moving',
                          gathering: { type: 'gold', idx: altMine.idx },
                        };
                      }
                    } else if (w.gathering.type === 'stone') {
                      const n = curStone[w.gathering.idx];
                      if (n && n.amount > 0) {
                        const p = aStar(
                          INITIAL_TILES,
                          {
                            x: Math.round(w.movingTo.x),
                            y: Math.round(w.movingTo.y),
                          },
                          { x: n.x, y: n.y }
                        );
                        return {
                          ...w,
                          x: w.movingTo.x,
                          y: w.movingTo.y,
                          movingTo: p[0] ?? n,
                          path: p.slice(1),
                          carrying: { gold: 0, lumber: 0, stone: 0 },
                          state: 'moving',
                        };
                      }
                    }
                  }
                  // Auto-gather: find nearest non-empty node of same type
                  if (w.unitType === 'farmer' && w.gathering) {
                    const gType2 = w.gathering.type;
                    const wx2 = Math.round(w.movingTo.x),
                      wy2 = Math.round(w.movingTo.y);
                    if (gType2 === 'tree') {
                      const alt = curTrees.reduce<{
                        node: (typeof curTrees)[0];
                        idx: number;
                        d: number;
                      } | null>((best, t, i) => {
                        if (t.amount <= 0) return best;
                        const d = tileDist(wx2, wy2, t.x, t.y);
                        return !best || d < best.d
                          ? { node: t, idx: i, d }
                          : best;
                      }, null);
                      if (alt) {
                        const p = aStar(
                          INITIAL_TILES,
                          { x: wx2, y: wy2 },
                          { x: alt.node.x, y: alt.node.y }
                        );
                        return {
                          ...w,
                          x: w.movingTo.x,
                          y: w.movingTo.y,
                          movingTo: p[0] ?? alt.node,
                          path: p.slice(1),
                          carrying: { gold: 0, lumber: 0, stone: 0 },
                          state: 'moving',
                          gathering: { type: 'tree', idx: alt.idx },
                        };
                      }
                    } else if (gType2 === 'gold') {
                      // gold is a single node; if depleted, go idle
                    } else if (gType2 === 'stone') {
                      const alt = curStone.reduce<{
                        node: (typeof curStone)[0];
                        idx: number;
                        d: number;
                      } | null>((best, n, i) => {
                        if (n.amount <= 0) return best;
                        const d = tileDist(wx2, wy2, n.x, n.y);
                        return !best || d < best.d
                          ? { node: n, idx: i, d }
                          : best;
                      }, null);
                      if (alt) {
                        const p = aStar(
                          INITIAL_TILES,
                          { x: wx2, y: wy2 },
                          { x: alt.node.x, y: alt.node.y }
                        );
                        return {
                          ...w,
                          x: w.movingTo.x,
                          y: w.movingTo.y,
                          movingTo: p[0] ?? alt.node,
                          path: p.slice(1),
                          carrying: { gold: 0, lumber: 0, stone: 0 },
                          state: 'moving',
                          gathering: { type: 'stone', idx: alt.idx },
                        };
                      }
                    }
                  }
                  return {
                    ...w,
                    x: w.movingTo.x,
                    y: w.movingTo.y,
                    movingTo: null,
                    path: [],
                    carrying: { gold: 0, lumber: 0, stone: 0 },
                    state: 'idle',
                    gathering: null,
                  };
                }
              }
              // Consume next queued waypoint instead of going idle
              if (w.waypoints && w.waypoints.length > 0) {
                const [nextWP, ...restWPs] = w.waypoints;
                if (nextWP) {
                  const p = aStar(
                    INITIAL_TILES,
                    { x: w.movingTo.x, y: w.movingTo.y },
                    nextWP
                  );
                  return {
                    ...w,
                    x: w.movingTo.x,
                    y: w.movingTo.y,
                    movingTo: p[0] ?? nextWP,
                    path: p.slice(1),
                    waypoints: restWPs,
                    state: 'moving' as const,
                  };
                }
              }
              // Loot crate pickup: if unit steps onto a crate tile, collect it
              const arrivedAt = w.movingTo;
              const crateHere = arrivedAt
                ? lootCratesRef.current.find(
                    c =>
                      Math.round(c.x) === Math.round(arrivedAt.x) &&
                      Math.round(c.y) === Math.round(arrivedAt.y)
                  )
                : undefined;
              if (crateHere && w.unitType === 'farmer') {
                setLootCrates(cs => cs.filter(c => c.id !== crateHere.id));
                setResources(r => ({
                  ...r,
                  gold: r.gold + crateHere.gold,
                  lumber: r.lumber + crateHere.lumber,
                  stone: r.stone + crateHere.stone,
                }));
                const label = [
                  crateHere.gold > 0 && `+${crateHere.gold}🪙`,
                  crateHere.lumber > 0 && `+${crateHere.lumber}🌲`,
                  crateHere.stone > 0 && `+${crateHere.stone}🪨`,
                ]
                  .filter(Boolean)
                  .join(' ');
                addFloatingText(
                  Math.round(w.movingTo.x),
                  Math.round(w.movingTo.y),
                  label,
                  '#fbbf24'
                );
              }
              return {
                ...w,
                x: w.movingTo.x,
                y: w.movingTo.y,
                movingTo: null,
                path: [],
                state: 'idle',
              };
            }
            // Cavalry trample: deal passive damage to grunts within radius while moving
            if (w.unitType === 'cavalry') {
              enemyGruntsRef.current.forEach(g => {
                if (
                  g.hp > 0 &&
                  tileDist(w.x, w.y, g.x, g.y) <= CAVALRY_TRAMPLE_RADIUS
                ) {
                  setEnemyGrunts(gs =>
                    gs.map(eg =>
                      eg.id === g.id
                        ? {
                            ...eg,
                            hp: Math.max(
                              0,
                              eg.hp - CAVALRY_TRAMPLE_DAMAGE * dt
                            ),
                          }
                        : eg
                    )
                  );
                }
              });
            }
            const sprintMult = w.sprinting ? CAVALRY_SPRINT_SPEED_MULT : 1;
            const itemSpeedBonus =
              w.unitType === 'hero'
                ? heroItemsRef.current.reduce(
                    (s, it) => s + (HERO_ITEM_DATA[it.itemId].speedBonus ?? 0),
                    0
                  )
                : 0;
            const moveSpeed =
              (w.unitType === 'catapult'
                ? CATAPULT_SPEED
                : w.unitType === 'trebuchet'
                  ? TREBUCHET_SPEED
                  : w.unitType === 'cavalry'
                    ? CAVALRY_SPEED
                    : WORKER_SPEED + itemSpeedBonus) * sprintMult;
            return {
              ...w,
              x: w.x + (dx / d) * Math.min(moveSpeed * dt, d),
              y: w.y + (dy / d) * Math.min(moveSpeed * dt, d),
            };
          }

          if (w.state === 'gathering' && w.gathering) {
            const gType = w.gathering.type;
            if (gType === 'tree') {
              if (w.carrying.lumber >= CARRY_CAP) {
                const sheds = placedBuildingsRef.current.filter(
                  b => b.type === 'lumberShed' && b.hp > 0
                );
                const dropSite =
                  sheds.reduce<{ x: number; y: number } | null>((best, s) => {
                    const d = tileDist(w.x, w.y, s.x, s.y);
                    return !best || d < tileDist(w.x, w.y, best.x, best.y)
                      ? { x: s.x, y: s.y }
                      : best;
                  }, null) ?? BARN_POS;
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  dropSite
                );
                return {
                  ...w,
                  state: 'returning',
                  movingTo: p[0] ?? dropSite,
                  path: p.slice(1),
                };
              }
              if (!gatherT[w.id]) {
                const lumberShedCount = placedBuildingsRef.current.filter(
                  b => b.type === 'lumberShed'
                ).length;
                const boonDiv = harvestBoonRef.current ? 2 : 1;
                const plentyDiv = shrinePlentyBuffRef.current ? 1.15 : 1;
                const gatherMs = Math.max(
                  400,
                  (GATHER_INTERVAL_MS -
                    upgradesRef.current.swiftHarvest * 200 -
                    lumberShedCount * LUMBER_SHED_BONUS_MS) /
                    boonDiv /
                    plentyDiv
                );
                gatherT[w.id] = window.setTimeout(() => {
                  delete gatherTimeoutsRef.current[w.id];
                  const idx = w.gathering!.idx;
                  setWorkers(ws2 =>
                    ws2.map(w2 => {
                      if (
                        w2.id !== w.id ||
                        w2.state !== 'gathering' ||
                        !w2.gathering
                      )
                        return w2;
                      if (
                        (treesRef.current[idx]?.amount ?? 0) > 0 &&
                        w2.carrying.lumber < CARRY_CAP
                      ) {
                        setTrees(ts =>
                          ts.map((t, i) => {
                            if (i !== idx) return t;
                            const next = Math.max(0, t.amount - CARRY_CAP);
                            if (next === 0)
                              addFloatingText(
                                t.x,
                                t.y,
                                '🌲 Depleted!',
                                '#92400e'
                              );
                            return { ...t, amount: next };
                          })
                        );
                        const sheds2 = placedBuildingsRef.current.filter(
                          b => b.type === 'lumberShed' && b.hp > 0
                        );
                        const dropSite2 =
                          sheds2.reduce<{ x: number; y: number } | null>(
                            (best, s) => {
                              const d = tileDist(w2.x, w2.y, s.x, s.y);
                              return !best ||
                                d < tileDist(w2.x, w2.y, best.x, best.y)
                                ? { x: s.x, y: s.y }
                                : best;
                            },
                            null
                          ) ?? BARN_POS;
                        const p = aStar(
                          INITIAL_TILES,
                          { x: Math.round(w2.x), y: Math.round(w2.y) },
                          dropSite2
                        );
                        return {
                          ...w2,
                          carrying: {
                            gold: 0,
                            lumber: w2.carrying.lumber + CARRY_CAP,
                            stone: 0,
                          },
                          state: 'returning',
                          movingTo: p[0] ?? dropSite2,
                          path: p.slice(1),
                        };
                      }
                      return w2;
                    })
                  );
                }, gatherMs);
              }
            } else if (gType === 'gold') {
              if (w.carrying.gold >= CARRY_CAP) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  BARN_POS
                );
                return {
                  ...w,
                  state: 'returning',
                  movingTo: p[0] ?? BARN_POS,
                  path: p.slice(1),
                };
              }
              if (!gatherT[w.id]) {
                const gatherMs = Math.max(
                  400,
                  (GATHER_INTERVAL_MS -
                    upgradesRef.current.swiftHarvest * 200) /
                    (harvestBoonRef.current ? 2 : 1) /
                    (shrinePlentyBuffRef.current ? 1.15 : 1)
                );
                const mineIdx = w.gathering.idx;
                gatherT[w.id] = window.setTimeout(() => {
                  delete gatherTimeoutsRef.current[w.id];
                  setWorkers(ws2 =>
                    ws2.map(w2 => {
                      if (
                        w2.id !== w.id ||
                        w2.state !== 'gathering' ||
                        !w2.gathering
                      )
                        return w2;
                      const mine = goldMinesRef.current[mineIdx];
                      if (
                        mine &&
                        mine.amount > 0 &&
                        w2.carrying.gold < CARRY_CAP
                      ) {
                        setGoldMines(gms =>
                          gms.map((gm, i) => {
                            if (i !== mineIdx) return gm;
                            const next = Math.max(0, gm.amount - CARRY_CAP);
                            if (next === 0)
                              addFloatingText(
                                gm.x,
                                gm.y,
                                '🪙 Mine Depleted!',
                                '#92400e'
                              );
                            return { ...gm, amount: next };
                          })
                        );
                        const camps = placedBuildingsRef.current.filter(
                          b => b.type === 'miningCamp' && b.hp > 0
                        );
                        const goldDrop =
                          camps.reduce<{ x: number; y: number } | null>(
                            (best, c) => {
                              const d = tileDist(w2.x, w2.y, c.x, c.y);
                              return !best ||
                                d < tileDist(w2.x, w2.y, best.x, best.y)
                                ? { x: c.x, y: c.y }
                                : best;
                            },
                            null
                          ) ?? BARN_POS;
                        const p = aStar(
                          INITIAL_TILES,
                          { x: Math.round(w2.x), y: Math.round(w2.y) },
                          goldDrop
                        );
                        return {
                          ...w2,
                          carrying: {
                            gold: w2.carrying.gold + CARRY_CAP,
                            lumber: 0,
                            stone: 0,
                          },
                          state: 'returning',
                          movingTo: p[0] ?? goldDrop,
                          path: p.slice(1),
                        };
                      }
                      return w2;
                    })
                  );
                }, gatherMs);
              }
            } else if (gType === 'stone') {
              if (w.carrying.stone >= CARRY_CAP) {
                const stoneCamps = placedBuildingsRef.current.filter(
                  b => b.type === 'miningCamp' && b.hp > 0
                );
                const stoneDrop =
                  stoneCamps.reduce<{ x: number; y: number } | null>(
                    (best, c) => {
                      const d = tileDist(w.x, w.y, c.x, c.y);
                      return !best || d < tileDist(w.x, w.y, best.x, best.y)
                        ? { x: c.x, y: c.y }
                        : best;
                    },
                    null
                  ) ?? BARN_POS;
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  stoneDrop
                );
                return {
                  ...w,
                  state: 'returning',
                  movingTo: p[0] ?? stoneDrop,
                  path: p.slice(1),
                };
              }
              if (!gatherT[w.id]) {
                const idx = w.gathering.idx;
                const gatherMs = Math.max(
                  400,
                  (GATHER_INTERVAL_MS -
                    upgradesRef.current.swiftHarvest * 200) /
                    (harvestBoonRef.current ? 2 : 1) /
                    (shrinePlentyBuffRef.current ? 1.15 : 1)
                );
                gatherT[w.id] = window.setTimeout(() => {
                  delete gatherTimeoutsRef.current[w.id];
                  setWorkers(ws2 =>
                    ws2.map(w2 => {
                      if (
                        w2.id !== w.id ||
                        w2.state !== 'gathering' ||
                        !w2.gathering
                      )
                        return w2;
                      if (
                        (stoneNodesRef.current[idx]?.amount ?? 0) > 0 &&
                        w2.carrying.stone < CARRY_CAP
                      ) {
                        setStoneNodes(ns =>
                          ns.map((n, i) => {
                            if (i !== idx) return n;
                            const next = Math.max(0, n.amount - CARRY_CAP);
                            if (next === 0)
                              addFloatingText(
                                n.x,
                                n.y,
                                '🪨 Quarry Depleted!',
                                '#92400e'
                              );
                            return { ...n, amount: next };
                          })
                        );
                        const stoneCamps2 = placedBuildingsRef.current.filter(
                          b => b.type === 'miningCamp' && b.hp > 0
                        );
                        const stoneDrop2 =
                          stoneCamps2.reduce<{ x: number; y: number } | null>(
                            (best, c) => {
                              const d = tileDist(w2.x, w2.y, c.x, c.y);
                              return !best ||
                                d < tileDist(w2.x, w2.y, best.x, best.y)
                                ? { x: c.x, y: c.y }
                                : best;
                            },
                            null
                          ) ?? BARN_POS;
                        const p = aStar(
                          INITIAL_TILES,
                          { x: Math.round(w2.x), y: Math.round(w2.y) },
                          stoneDrop2
                        );
                        return {
                          ...w2,
                          carrying: {
                            gold: 0,
                            lumber: 0,
                            stone: w2.carrying.stone + CARRY_CAP,
                          },
                          state: 'returning',
                          movingTo: p[0] ?? stoneDrop2,
                          path: p.slice(1),
                        };
                      }
                      return w2;
                    })
                  );
                }, gatherMs);
              }
            }
          }

          if (w.state === 'attacking' && w.attacking) {
            if (w.attacking.targetType === 'creep') {
              const creepId = (
                w.attacking as { targetType: 'creep'; creepId: number }
              ).creepId;
              const creepTarget = neutralCreepsRef.current.find(
                c => c.id === creepId
              );
              if (!creepTarget) return { ...w, attacking: null, state: 'idle' };
              const distToCreep = tileDist(
                w.x,
                w.y,
                creepTarget.x,
                creepTarget.y
              );
              if (distToCreep > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(creepTarget.x), y: Math.round(creepTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: creepTarget.x, y: creepTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedCX = Math.round(creepTarget.x),
                  capturedCY = Math.round(creepTarget.y);
                const capturedWX3 = Math.round(w.x),
                  capturedWY3 = Math.round(w.y);
                const unitBonusC =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetC = w.level;
                const moraleMs1 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmgC =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusC +
                    capturedVetC * VETERAN_ATK_BONUS;
                  addFloatingText(
                    capturedCX,
                    capturedCY,
                    `-${dmgC}`,
                    '#a855f7'
                  );
                  addFloatingText(capturedWX3, capturedWY3, `⚔️`, '#fbbf24');
                  // Award XP if creep dies
                  setNeutralCreeps(cs =>
                    cs.map(c => {
                      if (c.id !== creepId) return c;
                      const newHp = Math.max(0, c.hp - dmgC);
                      if (newHp <= 0 && c.hp > 0) {
                        setWorkers(ws3 =>
                          ws3.map(u => {
                            if (u.id !== w.id) return u;
                            const newXp = u.xp + XP_PER_KILL;
                            const newLevel =
                              newXp >= XP_TO_LEVEL_3
                                ? 3
                                : newXp >= XP_TO_LEVEL_2
                                  ? 2
                                  : newXp >= XP_TO_LEVEL_1
                                    ? 1
                                    : 0;
                            if (newLevel > u.level) {
                              addFloatingText(
                                capturedWX3,
                                capturedWY3,
                                `⭐ Level ${newLevel}!`,
                                '#fbbf24'
                              );
                              return {
                                ...u,
                                xp: newXp,
                                level: newLevel,
                                maxHp: u.maxHp + VETERAN_HP_BONUS,
                                hp: Math.min(
                                  u.hp + VETERAN_HP_BONUS,
                                  u.maxHp + VETERAN_HP_BONUS
                                ),
                              };
                            }
                            return { ...u, xp: newXp };
                          })
                        );
                      }
                      return { ...c, hp: newHp };
                    })
                  );
                }, moraleMs1);
              }
            } else if (w.attacking.targetType === 'grunt') {
              const target = enemyGruntsRef.current.find(
                g =>
                  g.id ===
                  (w.attacking as { targetType: 'grunt'; gruntId: number })
                    .gruntId
              );
              if (!target) return { ...w, attacking: null, state: 'idle' };
              const distToGrunt = tileDist(w.x, w.y, target.x, target.y);
              if (distToGrunt > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(target.x), y: Math.round(target.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: target.x, y: target.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const gruntId = w.attacking.gruntId;
                const capturedGX = Math.round(target.x),
                  capturedGY = Math.round(target.y);
                const capturedWX = Math.round(w.x),
                  capturedWY = Math.round(w.y);
                const capturedWorkerId = w.id;
                const unitBonus =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const moraleMs2 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[capturedWorkerId];
                  setWorkers(ws2 => {
                    const attacker = ws2.find(u => u.id === capturedWorkerId);
                    const veteranBonus = attacker
                      ? attacker.level * VETERAN_ATK_BONUS
                      : 0;
                    const dmg =
                      ATTACK_DAMAGE +
                      upgradesRef.current.sharperTools * 5 +
                      blacksmithUpgradesRef.current.steelEdge * 5 +
                      (shrineWarBuffRef.current ? 5 : 0) +
                      (barracksTechRef.current.warDrums ? 8 : 0) +
                      unitBonus +
                      veteranBonus;
                    gruntHitRef.current.set(gruntId, Date.now());
                    addFloatingText(
                      capturedGX,
                      capturedGY,
                      `-${dmg}`,
                      '#f97316'
                    );
                    addFloatingText(capturedWX, capturedWY, `⚔️`, '#fbbf24');
                    setEnemyGrunts(gs =>
                      gs.map(g => {
                        if (g.id !== gruntId) return g;
                        const newHp = Math.max(0, g.hp - dmg);
                        if (newHp <= 0 && g.hp > 0) {
                          // Award XP to attacker
                          return { ...g, hp: 0 };
                        }
                        return { ...g, hp: newHp };
                      })
                    );
                    // Award XP to attacker + 25% shared XP to nearby allies within 3 tiles
                    return ws2.map(u => {
                      const gruntCurrent = enemyGruntsRef.current.find(
                        g => g.id === gruntId
                      );
                      const veteranDmg =
                        ATTACK_DAMAGE +
                        upgradesRef.current.sharperTools * 5 +
                        blacksmithUpgradesRef.current.steelEdge * 5 +
                        (shrineWarBuffRef.current ? 5 : 0) +
                        (barracksTechRef.current.warDrums ? 8 : 0) +
                        unitBonus +
                        u.level * VETERAN_ATK_BONUS;
                      const gruntDies =
                        gruntCurrent && gruntCurrent.hp - veteranDmg <= 0;
                      if (!gruntDies) return u;
                      const isAttacker = u.id === capturedWorkerId;
                      const isNearby =
                        !isAttacker &&
                        u.hp > 0 &&
                        tileDist(u.x, u.y, capturedWX, capturedWY) <= 3;
                      const baseXp = gruntCurrent.isBoss
                        ? BOSS_XP_REWARD
                        : XP_PER_KILL;
                      const xpGain = isAttacker
                        ? baseXp
                        : isNearby
                          ? Math.round(baseXp * 0.25)
                          : 0;
                      if (xpGain === 0) return u;
                      const newXp = u.xp + xpGain;
                      const newLevel =
                        newXp >= XP_TO_LEVEL_3
                          ? 3
                          : newXp >= XP_TO_LEVEL_2
                            ? 2
                            : newXp >= XP_TO_LEVEL_1
                              ? 1
                              : 0;
                      if (newLevel > u.level) {
                        addFloatingText(
                          Math.round(u.x),
                          Math.round(u.y),
                          `⭐ Level ${newLevel}!`,
                          '#fbbf24'
                        );
                        const hpGain = VETERAN_HP_BONUS;
                        return {
                          ...u,
                          xp: newXp,
                          level: newLevel,
                          maxHp: u.maxHp + hpGain,
                          hp: Math.min(u.hp + hpGain, u.maxHp + hpGain),
                        };
                      }
                      return { ...u, xp: newXp };
                    });
                  });
                }, moraleMs2);
              }
            } else if (w.attacking.targetType === 'enemyTower') {
              const towerId = (
                w.attacking as { targetType: 'enemyTower'; towerId: number }
              ).towerId;
              const towerTarget = enemyTowersRef.current.find(
                t => t.id === towerId && t.hp > 0
              );
              if (!towerTarget) return { ...w, attacking: null, state: 'idle' };
              const distToTower = tileDist(
                w.x,
                w.y,
                towerTarget.x,
                towerTarget.y
              );
              if (distToTower > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.max(0, towerTarget.x - 1), y: towerTarget.y }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: towerTarget.x - 1, y: towerTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedTX = towerTarget.x,
                  capturedTY = towerTarget.y;
                const capturedTId = towerId;
                const unitBonusT =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetT = w.level;
                const moraleMs3 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusT +
                    capturedVetT * VETERAN_ATK_BONUS;
                  setEnemyTowers(ts =>
                    ts.map(t =>
                      t.id === capturedTId
                        ? { ...t, hp: Math.max(0, t.hp - dmg) }
                        : t
                    )
                  );
                  addFloatingText(capturedTX, capturedTY, `-${dmg}`, '#ef4444');
                }, moraleMs3);
              }
            } else if (w.attacking.targetType === 'enemyWall') {
              const wallId = (
                w.attacking as { targetType: 'enemyWall'; wallId: number }
              ).wallId;
              const wallTarget = enemyWallsRef.current.find(
                ew => ew.id === wallId && ew.hp > 0
              );
              if (!wallTarget) return { ...w, attacking: null, state: 'idle' };
              if (tileDist(w.x, w.y, wallTarget.x, wallTarget.y) > 1.5) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: wallTarget.x, y: wallTarget.y }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: wallTarget.x, y: wallTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedWallId = wallId;
                const capturedWX2 = wallTarget.x,
                  capturedWY2 = wallTarget.y;
                const unitBonusW =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetW = w.level;
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusW +
                    capturedVetW * VETERAN_ATK_BONUS;
                  setEnemyWalls(ews =>
                    ews.map(ew =>
                      ew.id === capturedWallId
                        ? { ...ew, hp: Math.max(0, ew.hp - dmg) }
                        : ew
                    )
                  );
                  addFloatingText(
                    capturedWX2,
                    capturedWY2,
                    `-${dmg}`,
                    '#ef4444'
                  );
                }, 1200);
              }
            } else if (w.attacking.targetType === 'siege') {
              const siegeId = (
                w.attacking as { targetType: 'siege'; siegeId: number }
              ).siegeId;
              const siegeTarget = enemySiegeRef.current.find(
                r => r.id === siegeId && r.hp > 0
              );
              if (!siegeTarget) return { ...w, attacking: null, state: 'idle' };
              const distToSiege = tileDist(
                w.x,
                w.y,
                siegeTarget.x,
                siegeTarget.y
              );
              if (distToSiege > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(siegeTarget.x), y: Math.round(siegeTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: siegeTarget.x, y: siegeTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedSX = Math.round(siegeTarget.x),
                  capturedSY = Math.round(siegeTarget.y);
                const capturedSiegeId = siegeId;
                const unitBonusS =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetS = w.level;
                const moraleMs5 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusS +
                    capturedVetS * VETERAN_ATK_BONUS;
                  setEnemySiege(rs =>
                    rs.map(r =>
                      r.id === capturedSiegeId
                        ? { ...r, hp: Math.max(0, r.hp - dmg) }
                        : r
                    )
                  );
                  addFloatingText(capturedSX, capturedSY, `-${dmg}`, '#ef4444');
                  // XP for killing a ram/demolisher
                  const ramCurrent = enemySiegeRef.current.find(
                    r => r.id === capturedSiegeId
                  );
                  if (ramCurrent && ramCurrent.hp - dmg <= 0) {
                    const siegeXp =
                      ramCurrent.siegeType === 'demolisher'
                        ? DEMOLISHER_XP_REWARD
                        : WAR_RAM_XP_REWARD;
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedSX, capturedSY) <= 3;
                        const xpGain = isAttacker
                          ? siegeXp
                          : isNearby
                            ? Math.round(siegeXp * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
                        const newXp = u.xp + xpGain;
                        const newLevel =
                          newXp >= XP_TO_LEVEL_3
                            ? 3
                            : newXp >= XP_TO_LEVEL_2
                              ? 2
                              : newXp >= XP_TO_LEVEL_1
                                ? 1
                                : 0;
                        if (newLevel > u.level) {
                          addFloatingText(
                            Math.round(u.x),
                            Math.round(u.y),
                            `⭐ Level ${newLevel}!`,
                            '#fbbf24'
                          );
                          return {
                            ...u,
                            xp: newXp,
                            level: newLevel,
                            maxHp: u.maxHp + VETERAN_HP_BONUS,
                            hp: Math.min(
                              u.hp + VETERAN_HP_BONUS,
                              u.maxHp + VETERAN_HP_BONUS
                            ),
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleMs5);
              }
            } else if (w.attacking.targetType === 'shaman') {
              const shamanId = (
                w.attacking as { targetType: 'shaman'; shamanId: number }
              ).shamanId;
              const shamanTarget = enemyShamansRef.current.find(
                s => s.id === shamanId && s.hp > 0
              );
              if (!shamanTarget)
                return { ...w, attacking: null, state: 'idle' };
              const distToShaman = tileDist(
                w.x,
                w.y,
                shamanTarget.x,
                shamanTarget.y
              );
              if (distToShaman > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  {
                    x: Math.round(shamanTarget.x),
                    y: Math.round(shamanTarget.y),
                  }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: shamanTarget.x, y: shamanTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedShX = Math.round(shamanTarget.x),
                  capturedShY = Math.round(shamanTarget.y);
                const capturedShamanId = shamanId;
                const unitBonusSh =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetSh = w.level;
                const moraleMs6 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusSh +
                    capturedVetSh * VETERAN_ATK_BONUS;
                  setEnemyShamans(ss =>
                    ss.map(s =>
                      s.id === capturedShamanId
                        ? { ...s, hp: Math.max(0, s.hp - dmg) }
                        : s
                    )
                  );
                  addFloatingText(
                    capturedShX,
                    capturedShY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                  const shamCurrent = enemyShamansRef.current.find(
                    s => s.id === capturedShamanId
                  );
                  if (shamCurrent && shamCurrent.hp - dmg <= 0) {
                    setResources(r => ({
                      ...r,
                      gold: r.gold + SHAMAN_GOLD_REWARD,
                    }));
                    addFloatingText(
                      capturedShX,
                      capturedShY,
                      `+${SHAMAN_GOLD_REWARD}g`,
                      '#fbbf24'
                    );
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedShX, capturedShY) <= 3;
                        const xpGain = isAttacker
                          ? SHAMAN_XP_REWARD
                          : isNearby
                            ? Math.round(SHAMAN_XP_REWARD * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
                        const newXp = u.xp + xpGain;
                        const newLevel =
                          newXp >= XP_TO_LEVEL_3
                            ? 3
                            : newXp >= XP_TO_LEVEL_2
                              ? 2
                              : newXp >= XP_TO_LEVEL_1
                                ? 1
                                : 0;
                        if (newLevel > u.level) {
                          addFloatingText(
                            Math.round(u.x),
                            Math.round(u.y),
                            `⭐ Level ${newLevel}!`,
                            '#fbbf24'
                          );
                          return {
                            ...u,
                            xp: newXp,
                            level: newLevel,
                            maxHp: u.maxHp + VETERAN_HP_BONUS,
                            hp: Math.min(
                              u.hp + VETERAN_HP_BONUS,
                              u.maxHp + VETERAN_HP_BONUS
                            ),
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleMs6);
              }
            } else if (w.attacking.targetType === 'troll') {
              const trollId = (
                w.attacking as { targetType: 'troll'; trollId: number }
              ).trollId;
              const trollTarget = enemyTrollsRef.current.find(
                t => t.id === trollId && t.hp > 0
              );
              if (!trollTarget) return { ...w, attacking: null, state: 'idle' };
              const distToTroll = tileDist(
                w.x,
                w.y,
                trollTarget.x,
                trollTarget.y
              );
              if (distToTroll > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(trollTarget.x), y: Math.round(trollTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: trollTarget.x, y: trollTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedTrX = Math.round(trollTarget.x),
                  capturedTrY = Math.round(trollTarget.y);
                const capturedTrollId = trollId;
                const unitBonusTr =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetTr = w.level;
                const moraleMs7 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusTr +
                    capturedVetTr * VETERAN_ATK_BONUS;
                  setEnemyTrolls(ts =>
                    ts.map(t =>
                      t.id === capturedTrollId
                        ? { ...t, hp: Math.max(0, t.hp - dmg) }
                        : t
                    )
                  );
                  addFloatingText(
                    capturedTrX,
                    capturedTrY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                  const trCurrent = enemyTrollsRef.current.find(
                    t => t.id === capturedTrollId
                  );
                  if (trCurrent && trCurrent.hp - dmg <= 0) {
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedTrX, capturedTrY) <= 3;
                        const xpGain = isAttacker
                          ? TROLL_XP_REWARD
                          : isNearby
                            ? Math.round(TROLL_XP_REWARD * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
                        const newXp = u.xp + xpGain;
                        const newLevel =
                          newXp >= XP_TO_LEVEL_3
                            ? 3
                            : newXp >= XP_TO_LEVEL_2
                              ? 2
                              : newXp >= XP_TO_LEVEL_1
                                ? 1
                                : 0;
                        if (newLevel > u.level) {
                          addFloatingText(
                            Math.round(u.x),
                            Math.round(u.y),
                            `⭐ Level ${newLevel}!`,
                            '#fbbf24'
                          );
                          return {
                            ...u,
                            xp: newXp,
                            level: newLevel,
                            maxHp: u.maxHp + VETERAN_HP_BONUS,
                            hp: Math.min(
                              u.hp + VETERAN_HP_BONUS,
                              u.maxHp + VETERAN_HP_BONUS
                            ),
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleMs7);
              }
            } else if (w.attacking.targetType === 'sapper') {
              const sapperId = (
                w.attacking as { targetType: 'sapper'; sapperId: number }
              ).sapperId;
              const sapperTarget = enemySappersRef.current.find(
                s => s.id === sapperId && s.hp > 0 && !s.exploded
              );
              if (!sapperTarget)
                return { ...w, attacking: null, state: 'idle' };
              const distToSapper = tileDist(
                w.x,
                w.y,
                sapperTarget.x,
                sapperTarget.y
              );
              if (distToSapper > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  {
                    x: Math.round(sapperTarget.x),
                    y: Math.round(sapperTarget.y),
                  }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: sapperTarget.x, y: sapperTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedSpX = Math.round(sapperTarget.x),
                  capturedSpY = Math.round(sapperTarget.y);
                const capturedSapperId = sapperId;
                const unitBonusSp =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetSp = w.level;
                const moraleMs8 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusSp +
                    capturedVetSp * VETERAN_ATK_BONUS;
                  setEnemySappers(ss =>
                    ss.map(s =>
                      s.id === capturedSapperId
                        ? { ...s, hp: Math.max(0, s.hp - dmg) }
                        : s
                    )
                  );
                  addFloatingText(
                    capturedSpX,
                    capturedSpY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                }, moraleMs8);
              }
            } else if (w.attacking.targetType === 'necromancer') {
              const necroId = (
                w.attacking as {
                  targetType: 'necromancer';
                  necromancerId: number;
                }
              ).necromancerId;
              const necroTarget = enemyNecromancersRef.current.find(
                n => n.id === necroId && n.hp > 0
              );
              if (!necroTarget) return { ...w, attacking: null, state: 'idle' };
              const distToNecro = tileDist(
                w.x,
                w.y,
                necroTarget.x,
                necroTarget.y
              );
              if (distToNecro > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(necroTarget.x), y: Math.round(necroTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: necroTarget.x, y: necroTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedNcX = Math.round(necroTarget.x),
                  capturedNcY = Math.round(necroTarget.y);
                const capturedNecroId = necroId;
                const unitBonusNc =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetNc = w.level;
                const moraleMs9 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusNc +
                    capturedVetNc * VETERAN_ATK_BONUS;
                  setEnemyNecromancers(ns =>
                    ns.map(n =>
                      n.id === capturedNecroId
                        ? { ...n, hp: Math.max(0, n.hp - dmg) }
                        : n
                    )
                  );
                  addFloatingText(
                    capturedNcX,
                    capturedNcY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                  const necroCurrent = enemyNecromancersRef.current.find(
                    n => n.id === capturedNecroId
                  );
                  if (necroCurrent && necroCurrent.hp - dmg <= 0) {
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedNcX, capturedNcY) <= 3;
                        const xpGain = isAttacker
                          ? NECROMANCER_XP_REWARD
                          : isNearby
                            ? Math.round(NECROMANCER_XP_REWARD * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
                        const newXp = u.xp + xpGain;
                        const newLevel =
                          newXp >= XP_TO_LEVEL_3
                            ? 3
                            : newXp >= XP_TO_LEVEL_2
                              ? 2
                              : newXp >= XP_TO_LEVEL_1
                                ? 1
                                : 0;
                        if (newLevel > u.level) {
                          addFloatingText(
                            Math.round(u.x),
                            Math.round(u.y),
                            `⭐ Level ${newLevel}!`,
                            '#fbbf24'
                          );
                          return {
                            ...u,
                            xp: newXp,
                            level: newLevel,
                            maxHp: u.maxHp + VETERAN_HP_BONUS,
                            hp: Math.min(
                              u.hp + VETERAN_HP_BONUS,
                              u.maxHp + VETERAN_HP_BONUS
                            ),
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleMs9);
              }
            } else if (w.attacking.targetType === 'witchDoctor') {
              const wdId = (
                w.attacking as {
                  targetType: 'witchDoctor';
                  witchDoctorId: number;
                }
              ).witchDoctorId;
              const wdTarget = enemyWitchDoctorsRef.current.find(
                d => d.id === wdId && d.hp > 0
              );
              if (!wdTarget) return { ...w, attacking: null, state: 'idle' };
              const distToWD = tileDist(w.x, w.y, wdTarget.x, wdTarget.y);
              if (distToWD > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(wdTarget.x), y: Math.round(wdTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: wdTarget.x, y: wdTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedWDX = Math.round(wdTarget.x),
                  capturedWDY = Math.round(wdTarget.y);
                const capturedWDId = wdId;
                const unitBonusWD =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetWD = w.level;
                const moraleWD = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusWD +
                    capturedVetWD * VETERAN_ATK_BONUS;
                  setEnemyWitchDoctors(ds =>
                    ds.map(d =>
                      d.id === capturedWDId
                        ? { ...d, hp: Math.max(0, d.hp - dmg) }
                        : d
                    )
                  );
                  addFloatingText(
                    capturedWDX,
                    capturedWDY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                  const wdCurrent = enemyWitchDoctorsRef.current.find(
                    d => d.id === capturedWDId
                  );
                  if (wdCurrent && wdCurrent.hp - dmg <= 0) {
                    setResources(r => ({
                      ...r,
                      gold: r.gold + WITCH_DOCTOR_GOLD_REWARD,
                    }));
                    addFloatingText(
                      capturedWDX,
                      capturedWDY,
                      `+${WITCH_DOCTOR_GOLD_REWARD}🪙`,
                      '#fbbf24'
                    );
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedWDX, capturedWDY) <= 3;
                        const xpGain = isAttacker
                          ? WITCH_DOCTOR_XP_REWARD
                          : isNearby
                            ? Math.round(WITCH_DOCTOR_XP_REWARD * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
                        const newXp = u.xp + xpGain;
                        const newLevel =
                          newXp >= XP_TO_LEVEL_3
                            ? 3
                            : newXp >= XP_TO_LEVEL_2
                              ? 2
                              : newXp >= XP_TO_LEVEL_1
                                ? 1
                                : 0;
                        if (newLevel > u.level) {
                          addFloatingText(
                            Math.round(u.x),
                            Math.round(u.y),
                            `⭐ Level ${newLevel}!`,
                            '#fbbf24'
                          );
                          return {
                            ...u,
                            xp: newXp,
                            level: newLevel,
                            maxHp: u.maxHp + VETERAN_HP_BONUS,
                            hp: Math.min(
                              u.hp + VETERAN_HP_BONUS,
                              u.maxHp + VETERAN_HP_BONUS
                            ),
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleWD);
              }
            } else if (w.attacking.targetType === 'warchief') {
              const wcId = (
                w.attacking as { targetType: 'warchief'; warchiefId: number }
              ).warchiefId;
              const wcTarget = enemyWarchiefssRef.current.find(
                wc2 => wc2.id === wcId && wc2.hp > 0
              );
              if (!wcTarget) return { ...w, attacking: null, state: 'idle' };
              const distToWC = tileDist(w.x, w.y, wcTarget.x, wcTarget.y);
              if (distToWC > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(wcTarget.x), y: Math.round(wcTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: wcTarget.x, y: wcTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedWCX = Math.round(wcTarget.x),
                  capturedWCY = Math.round(wcTarget.y);
                const capturedWCId = wcId;
                const unitBonusWC =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetWC = w.level;
                const moraleWC = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusWC +
                    capturedVetWC * VETERAN_ATK_BONUS;
                  setEnemyWarchiefs(wcs =>
                    wcs.map(wc2 =>
                      wc2.id === capturedWCId
                        ? { ...wc2, hp: Math.max(0, wc2.hp - dmg) }
                        : wc2
                    )
                  );
                  addFloatingText(
                    capturedWCX,
                    capturedWCY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                  const wcCurrent = enemyWarchiefssRef.current.find(
                    wc2 => wc2.id === capturedWCId
                  );
                  if (wcCurrent && wcCurrent.hp - dmg <= 0) {
                    setResources(r => ({
                      ...r,
                      gold: r.gold + WARCHIEF_GOLD_REWARD,
                    }));
                    addFloatingText(
                      capturedWCX,
                      capturedWCY,
                      `👑 +${WARCHIEF_GOLD_REWARD}🪙`,
                      '#fbbf24'
                    );
                    const wcPool: HeroItemId[] = [
                      'battle_sword',
                      'shield_pendant',
                      'tome_xp',
                      'healing_potion',
                    ];
                    const wcDrop =
                      wcPool[Math.floor(Math.random() * wcPool.length)]!;
                    setDroppedItems(ds => [
                      ...ds,
                      {
                        id: dropItemIdRef.current++,
                        itemId: wcDrop,
                        x: capturedWCX,
                        y: capturedWCY,
                      },
                    ]);
                    addFloatingText(
                      capturedWCX,
                      capturedWCY,
                      `👑 ${HERO_ITEM_DATA[wcDrop].emoji} Dropped!`,
                      '#c084fc'
                    );
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedWCX, capturedWCY) <= 3;
                        const xpGain = isAttacker
                          ? WARCHIEF_XP_REWARD
                          : isNearby
                            ? Math.round(WARCHIEF_XP_REWARD * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
                        const newXp = u.xp + xpGain;
                        const newLevel =
                          newXp >= XP_TO_LEVEL_3
                            ? 3
                            : newXp >= XP_TO_LEVEL_2
                              ? 2
                              : newXp >= XP_TO_LEVEL_1
                                ? 1
                                : 0;
                        if (newLevel > u.level) {
                          addFloatingText(
                            Math.round(u.x),
                            Math.round(u.y),
                            `⭐ Level ${newLevel}!`,
                            '#fbbf24'
                          );
                          return {
                            ...u,
                            xp: newXp,
                            level: newLevel,
                            maxHp: u.maxHp + VETERAN_HP_BONUS,
                            hp: Math.min(
                              u.hp + VETERAN_HP_BONUS,
                              u.maxHp + VETERAN_HP_BONUS
                            ),
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleWC);
              }
            } else {
              if (!attackT[w.id]) {
                const capturedWX = Math.round(w.x),
                  capturedWY = Math.round(w.y);
                const unitBonus2 =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetLevel = w.level;
                const moraleMs4 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonus2 +
                    capturedVetLevel * VETERAN_ATK_BONUS;
                  setWorkers(ws2 =>
                    ws2.map(w2 => {
                      if (
                        w2.id !== w.id ||
                        w2.state !== 'attacking' ||
                        !w2.attacking
                      )
                        return w2;
                      setEnemyBarnHp(hp => {
                        const nHp = Math.max(0, hp - dmg);
                        if (nHp <= 0) {
                          setGameOver('victory');
                          return nHp;
                        }
                        const crossed = [
                          ...sallyForthThresholdsRef.current,
                        ].filter(t => hp > t && nHp <= t);
                        if (crossed.length > 0) {
                          crossed.forEach(t =>
                            sallyForthThresholdsRef.current.delete(t)
                          );
                          const wSet = new Set(
                            placedBuildingsRef.current
                              .filter(b => b.type === 'wall')
                              .map(b => `${b.x},${b.y}`)
                          );
                          const gruntHp = Math.round(
                            GRUNT_MAX_HP + (waveRef.current - 1) * 10
                          );
                          const defenders = [
                            { ox: -1, oy: 0 },
                            { ox: 0, oy: 1 },
                          ].map(({ ox, oy }) => {
                            const sx = ENEMY_BARN_POS.x + ox,
                              sy = ENEMY_BARN_POS.y + oy;
                            const path = aStar(
                              INITIAL_TILES,
                              { x: sx, y: sy },
                              BARN_POS,
                              true,
                              wSet
                            );
                            return {
                              id: gruntIdRef.current++,
                              x: sx,
                              y: sy,
                              hp: gruntHp,
                              maxHp: gruntHp,
                              movingTo: path[0] ?? BARN_POS,
                              path: path.slice(1),
                              state: 'moving' as const,
                              isBoss: false,
                            };
                          });
                          setEnemyGrunts(gs => [...gs, ...defenders]);
                          addFloatingText(
                            ENEMY_BARN_POS.x,
                            ENEMY_BARN_POS.y,
                            '⚔️ DEFENDERS!',
                            '#ef4444'
                          );
                        }
                        // Last-stand enrage: enemy barn below 50% → all grunts go berserk
                        if (
                          !lastStandEnrageRef.current &&
                          nHp <= ENEMY_BARN_MAX_HP * 0.5
                        ) {
                          lastStandEnrageRef.current = true;
                          const enrageUntil = Date.now() + 60000;
                          setEnemyGrunts(gs =>
                            gs.map(g =>
                              g.hp > 0 ? { ...g, enragedUntil: enrageUntil } : g
                            )
                          );
                          addFloatingText(
                            ENEMY_BARN_POS.x,
                            ENEMY_BARN_POS.y,
                            '💢 LAST STAND!',
                            '#dc2626'
                          );
                          setWaveAnnouncement(
                            '💢 ENEMY LAST STAND — ALL GRUNTS ENRAGED!'
                          );
                          window.setTimeout(
                            () => setWaveAnnouncement(null),
                            4000
                          );
                        }
                        return nHp;
                      });
                      addFloatingText(
                        ENEMY_BARN_POS.x,
                        ENEMY_BARN_POS.y,
                        `-${dmg}`,
                        '#ef4444'
                      );
                      const heroArmorBonus =
                        w2.unitType === 'hero'
                          ? heroItemsRef.current.reduce(
                              (s, it) =>
                                s + (HERO_ITEM_DATA[it.itemId].armorBonus ?? 0),
                              0
                            )
                          : 0;
                      const counterDmg = Math.max(
                        1,
                        ENEMY_COUNTER_DAMAGE -
                          blacksmithUpgradesRef.current.ironHide * 2 -
                          heroArmorBonus
                      );
                      addFloatingText(
                        capturedWX,
                        capturedWY,
                        `-${counterDmg}`,
                        '#fca5a5'
                      );
                      return { ...w2, hp: Math.max(0, w2.hp - counterDmg) };
                    })
                  );
                }, moraleMs4);
              }
            }
          }

          // Catapult auto-fire: idle catapult fires AoE splash at nearest grunt in range
          if (
            w.unitType === 'catapult' &&
            w.state === 'idle' &&
            !attackT[w.id]
          ) {
            const nearestGrunt =
              enemyGruntsRef.current.reduce<EnemyGrunt | null>((best, g) => {
                const d = tileDist(w.x, w.y, g.x, g.y);
                if (d > CATAPULT_RANGE) return best;
                if (!best || d < tileDist(w.x, w.y, best.x, best.y)) return g;
                return best;
              }, null);
            if (nearestGrunt) {
              const cx = nearestGrunt.x,
                cy = nearestGrunt.y;
              const capturedWX = Math.round(w.x),
                capturedWY = Math.round(w.y);
              addProjectile(
                capturedWX,
                capturedWY,
                Math.round(cx),
                Math.round(cy),
                'rock',
                CATAPULT_FIRE_MS
              );
              attackT[w.id] = window.setTimeout(() => {
                delete attackTimeoutsRef.current[w.id];
                addFloatingText(capturedWX, capturedWY, '🪨 Fire!', '#f97316');
                setEnemyGrunts(gs =>
                  gs.map(g => {
                    const d = tileDist(g.x, g.y, cx, cy);
                    if (d <= CATAPULT_SPLASH_RANGE) {
                      const dmg =
                        d === 0 ? CATAPULT_DAMAGE : CATAPULT_SPLASH_DAMAGE;
                      addFloatingText(
                        Math.round(g.x),
                        Math.round(g.y),
                        `-${dmg}`,
                        '#f97316'
                      );
                      return { ...g, hp: Math.max(0, g.hp - dmg) };
                    }
                    return g;
                  })
                );
              }, CATAPULT_FIRE_MS);
            }
          }

          // Trebuchet auto-fire: idle trebuchet fires at enemy barn or enemy towers in range (min range enforced)
          if (
            w.unitType === 'trebuchet' &&
            w.state === 'idle' &&
            !attackT[w.id]
          ) {
            const barnDist = tileDist(
              w.x,
              w.y,
              ENEMY_BARN_POS.x,
              ENEMY_BARN_POS.y
            );
            const barnAlive = enemyBarnHpRef.current > 0;
            const towerTarget = enemyTowersRef.current.find(
              t =>
                t.hp > 0 &&
                tileDist(w.x, w.y, t.x, t.y) <= TREBUCHET_RANGE &&
                tileDist(w.x, w.y, t.x, t.y) >= TREBUCHET_MIN_RANGE
            );
            const shootBarn =
              barnAlive &&
              barnDist <= TREBUCHET_RANGE &&
              barnDist >= TREBUCHET_MIN_RANGE;
            if (shootBarn || towerTarget) {
              const capturedWX = Math.round(w.x),
                capturedWY = Math.round(w.y);
              const targetPos = towerTarget
                ? {
                    x: towerTarget.x,
                    y: towerTarget.y,
                    isTower: true,
                    towerId: towerTarget.id,
                  }
                : {
                    x: ENEMY_BARN_POS.x,
                    y: ENEMY_BARN_POS.y,
                    isTower: false,
                    towerId: -1,
                  };
              addProjectile(
                capturedWX,
                capturedWY,
                targetPos.x,
                targetPos.y,
                'rock',
                TREBUCHET_FIRE_MS
              );
              attackT[w.id] = window.setTimeout(() => {
                delete attackTimeoutsRef.current[w.id];
                addFloatingText(capturedWX, capturedWY, '🪨 FIRE!', '#b45309');
                if (targetPos.isTower) {
                  addFloatingText(
                    targetPos.x,
                    targetPos.y,
                    `-${TREBUCHET_DAMAGE}`,
                    '#b45309'
                  );
                  setEnemyTowers(ts =>
                    ts.map(t =>
                      t.id === targetPos.towerId
                        ? { ...t, hp: Math.max(0, t.hp - TREBUCHET_DAMAGE) }
                        : t
                    )
                  );
                } else {
                  addFloatingText(
                    ENEMY_BARN_POS.x,
                    ENEMY_BARN_POS.y,
                    `-${TREBUCHET_DAMAGE}`,
                    '#b45309'
                  );
                  setEnemyBarnHp(hp => {
                    const nHp = Math.max(0, hp - TREBUCHET_DAMAGE);
                    if (nHp <= 0) {
                      setGameOver('victory');
                      return nHp;
                    }
                    const crossed = [...sallyForthThresholdsRef.current].filter(
                      t => hp > t && nHp <= t
                    );
                    if (crossed.length > 0) {
                      crossed.forEach(t =>
                        sallyForthThresholdsRef.current.delete(t)
                      );
                      const wSet = new Set(
                        placedBuildingsRef.current
                          .filter(b => b.type === 'wall')
                          .map(b => `${b.x},${b.y}`)
                      );
                      const gruntHp = Math.round(
                        GRUNT_MAX_HP + (waveRef.current - 1) * 10
                      );
                      const defenders = [
                        { ox: -1, oy: 0 },
                        { ox: 0, oy: 1 },
                      ].map(({ ox, oy }) => {
                        const sx = ENEMY_BARN_POS.x + ox,
                          sy = ENEMY_BARN_POS.y + oy;
                        const path = aStar(
                          INITIAL_TILES,
                          { x: sx, y: sy },
                          BARN_POS,
                          true,
                          wSet
                        );
                        return {
                          id: gruntIdRef.current++,
                          x: sx,
                          y: sy,
                          hp: gruntHp,
                          maxHp: gruntHp,
                          movingTo: path[0] ?? BARN_POS,
                          path: path.slice(1),
                          state: 'moving' as const,
                          isBoss: false,
                        };
                      });
                      setEnemyGrunts(gs => [...gs, ...defenders]);
                      addFloatingText(
                        ENEMY_BARN_POS.x,
                        ENEMY_BARN_POS.y,
                        '⚔️ DEFENDERS!',
                        '#ef4444'
                      );
                    }
                    return nHp;
                  });
                }
              }, TREBUCHET_FIRE_MS);
            }
          }

          // Building repair: worker in 'repairing' state ticks HP up on the target building
          if (w.state === 'repairing' && w.repairing) {
            const bid = w.repairing.buildingId;
            if (!buildingRepairTimeoutsRef.current[w.id]) {
              const capturedWId = w.id;
              buildingRepairTimeoutsRef.current[capturedWId] =
                window.setTimeout(() => {
                  delete buildingRepairTimeoutsRef.current[capturedWId];
                  let stillDamaged = false;
                  setPlacedBuildings(bs =>
                    bs.map(b => {
                      if (b.id !== bid) return b;
                      const newHp = Math.min(b.maxHp, b.hp + 5);
                      stillDamaged = newHp < b.maxHp;
                      addFloatingText(b.x, b.y, '+5🔧', '#34d399');
                      return { ...b, hp: newHp };
                    })
                  );
                  // If building is fully repaired, go idle
                  if (!stillDamaged) {
                    setWorkers(ws2 =>
                      ws2.map(w2 =>
                        w2.id === capturedWId
                          ? { ...w2, repairing: null, state: 'idle' as const }
                          : w2
                      )
                    );
                  }
                }, REPAIR_INTERVAL_MS);
            }
          } else if (
            buildingRepairTimeoutsRef.current[w.id] &&
            w.state !== 'repairing'
          ) {
            clearTimeout(buildingRepairTimeoutsRef.current[w.id]);
            delete buildingRepairTimeoutsRef.current[w.id];
          }

          // Auto-repair: idle workers near barn slowly regenerate HP
          if (
            w.state === 'idle' &&
            w.hp < w.maxHp &&
            tileDist(w.x, w.y, BARN_POS.x, BARN_POS.y) <= REPAIR_RADIUS
          ) {
            if (!repairTimeoutsRef.current[w.id]) {
              const capturedId = w.id;
              repairTimeoutsRef.current[capturedId] = window.setTimeout(() => {
                delete repairTimeoutsRef.current[capturedId];
                setWorkers(ws2 =>
                  ws2.map(w2 => {
                    if (
                      w2.id !== capturedId ||
                      w2.state !== 'idle' ||
                      w2.hp >= w2.maxHp
                    )
                      return w2;
                    addFloatingText(
                      Math.round(w2.x),
                      Math.round(w2.y),
                      `+${REPAIR_AMOUNT}`,
                      '#4ade80'
                    );
                    return {
                      ...w2,
                      hp: Math.min(w2.maxHp, w2.hp + REPAIR_AMOUNT),
                    };
                  })
                );
              }, REPAIR_INTERVAL_MS);
            }
          } else if (repairTimeoutsRef.current[w.id] && w.state !== 'idle') {
            clearTimeout(repairTimeoutsRef.current[w.id]);
            delete repairTimeoutsRef.current[w.id];
          }

          // Auto-repair burning buildings: idle farmers near a burning building automatically start repairing it
          if (
            w.state === 'idle' &&
            w.unitType === 'farmer' &&
            !w.gathering &&
            !w.attacking
          ) {
            const burningBuilding = placedBuildingsRef.current.find(
              b =>
                b.hp > 0 &&
                b.hp / b.maxHp < 0.25 &&
                tileDist(w.x, w.y, b.x, b.y) <= 3
            );
            if (burningBuilding) {
              const dest = { x: burningBuilding.x, y: burningBuilding.y };
              const p = aStar(
                INITIAL_TILES,
                { x: Math.round(w.x), y: Math.round(w.y) },
                dest
              );
              return {
                ...w,
                repairing: { buildingId: burningBuilding.id },
                state: 'moving' as const,
                movingTo: p[0] ?? dest,
                path: p.slice(1),
              };
            }
          }

          // Patrol: when idle at endpoint, flip heading and march to other point
          if (w.patrol && w.state === 'idle' && !w.movingTo) {
            const nextTarget =
              w.patrol.heading === 'b' ? w.patrol.a : w.patrol.b;
            const newHeading =
              w.patrol.heading === 'b' ? ('a' as const) : ('b' as const);
            const p = aStar(
              INITIAL_TILES,
              { x: Math.round(w.x), y: Math.round(w.y) },
              nextTarget
            );
            return {
              ...w,
              patrol: { ...w.patrol, heading: newHeading },
              movingTo: p[0] ?? nextTarget,
              path: p.slice(1),
              state: 'moving',
            };
          }

          return w;
        });
      });

      // Detect newly dead workers and record corpse positions
      {
        const now = Date.now();
        const newlyDead = workersRef.current.filter(
          w => w.hp <= 0 && !deadWorkerIdsRef.current.has(w.id)
        );
        if (newlyDead.length > 0) {
          newlyDead.forEach(w => deadWorkerIdsRef.current.add(w.id));
          setDeadWorkerPositions(prev => [
            ...prev.filter(p => now - p.t < 8000),
            ...newlyDead.map(w => ({
              x: Math.round(w.x),
              y: Math.round(w.y),
              t: now,
              unitType: w.unitType,
            })),
          ]);
        }
      }

      // Detect destroyed enemy walls and award loot
      {
        const destroyed = enemyWallsRef.current.filter(ew => ew.hp <= 0);
        if (destroyed.length > 0) {
          setEnemyWalls(ews => ews.filter(ew => ew.hp > 0));
          destroyed.forEach(ew => {
            const gold = 15;
            setResources(r => ({ ...r, gold: r.gold + gold }));
            addFloatingText(ew.x, ew.y, `🧱 +${gold}🪙`, '#fbbf24');
          });
        }
      }
      // Detect destroyed enemy towers, award loot, clean up dead entries
      {
        const destroyed = enemyTowersRef.current.filter(t => t.hp <= 0);
        if (destroyed.length > 0) {
          setEnemyTowers(ts => ts.filter(t => t.hp > 0));
          destroyed.forEach(t => {
            const gold = t.id === -1 ? 40 : 25;
            setResources(r => ({ ...r, gold: r.gold + gold }));
            addFloatingText(t.x, t.y, `🏰 +${gold}🪙`, '#fbbf24');
          });
        }
      }

      // Update enemy grunts
      const currentWorkers = workersRef.current;
      setEnemyGrunts(gs => {
        const survived = gs.filter(g => g.hp > 0);
        const killed = gs.filter(g => g.hp <= 0);
        if (killed.length > 0) {
          setKillCount(k => k + killed.length);
          const goldDrop = killed.reduce(
            (sum, g) => sum + (g.isBoss ? BOSS_GOLD_REWARD : 5),
            0
          );
          setResources(r => ({ ...r, gold: r.gold + goldDrop }));
          Snd.death();
          killed.forEach(g =>
            addFloatingText(
              Math.round(g.x),
              Math.round(g.y),
              g.isBoss ? `💀+${BOSS_GOLD_REWARD}🪙` : `+5🪙`,
              '#fbbf24'
            )
          );
          // Record positions for necromancer to raise
          const now = Date.now();
          setDeadGruntPositions(prev => [
            ...prev.filter(p => now - p.t < 20000),
            ...killed.map(g => ({
              x: Math.round(g.x),
              y: Math.round(g.y),
              t: now,
            })),
          ]);
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
            setLootCrates(lcs => [
              ...lcs,
              { id: newId, x: b.x, y: b.y, gold, lumber, stone },
            ]);
            addFloatingText(b.x, b.y, '💥 DESTROYED!', '#f97316');
          }
        });
        return bs.filter(b => b.hp > 0);
      });

      // Burn damage: buildings below 25% HP take 1 HP/s unless a worker is actively repairing
      const repairingBuildingIds = new Set(
        workersRef.current
          .filter(w => w.state === 'repairing' && w.repairing)
          .map(w => w.repairing!.buildingId)
      );
      setPlacedBuildings(bs =>
        bs.map(b => {
          if (b.hp <= 0 || b.hp / b.maxHp >= 0.25) return b;
          if (repairingBuildingIds.has(b.id)) return b;
          return { ...b, hp: Math.max(1, b.hp - dt) };
        })
      );

      const gruntSpeedMult =
        (isNightRef.current ? NIGHT_SPEED_MULT : 1) *
        (difficulty?.gruntSpeedMult ?? 1);
      const nowPoison = Date.now();
      setEnemyGrunts(gs =>
        gs.map(gIn => {
          let g = gIn;
          // Poison DoT tick — apply before other processing
          const poisoned = g.poisonedUntil && nowPoison < g.poisonedUntil;
          if (poisoned && g.poisonDps && g.poisonDps * dt > 0) {
            g = { ...g, hp: Math.max(0, g.hp - g.poisonDps * dt) };
          }
          const frostMult =
            g.frozenUntil && nowPoison < g.frozenUntil
              ? FROST_TOWER_SLOW_FACTOR
              : 1;
          // Proximity aggro: switch to attack nearest worker within 2 tiles
          const nearWorker = currentWorkers.find(
            w => w.hp > 0 && tileDist(g.x, g.y, w.x, w.y) <= 2
          );
          if (nearWorker) {
            const distToWorker = tileDist(g.x, g.y, nearWorker.x, nearWorker.y);
            if (distToWorker <= 1.4) {
              // Attack worker
              if (!gruntAttackTimeoutsRef.current[g.id]) {
                const wid = nearWorker.id;
                const capturedGruntId = g.id;
                const capturedWX = Math.round(nearWorker.x),
                  capturedWY = Math.round(nearWorker.y);
                gruntAttackTimeoutsRef.current[g.id] = window.setTimeout(() => {
                  delete gruntAttackTimeoutsRef.current[g.id];
                  const gruntEnraged =
                    (enemyGruntsRef.current.find(
                      gg => gg.id === capturedGruntId
                    )?.enragedUntil ?? 0) > Date.now();
                  const targetHeroArmor =
                    workersRef.current.find(w2 => w2.id === wid)?.unitType ===
                    'hero'
                      ? heroItemsRef.current.reduce(
                          (s, it) =>
                            s + (HERO_ITEM_DATA[it.itemId].armorBonus ?? 0),
                          0
                        )
                      : 0;
                  const gruntDmg = Math.max(
                    1,
                    Math.round(
                      (GRUNT_DAMAGE +
                        (gruntEnraged ? WITCH_DOCTOR_ENRAGE_DMG_BONUS : 0)) *
                        (difficulty?.gruntDmgMult ?? 1)
                    ) -
                      blacksmithUpgradesRef.current.ironHide * 2 -
                      targetHeroArmor
                  );
                  setWorkers(ws2 =>
                    ws2.map(w2 => {
                      if (w2.id !== wid) return w2;
                      const newHp = Math.max(0, w2.hp - gruntDmg);
                      // Auto-retaliate: if idle and capable of fighting, attack the grunt back
                      if (
                        w2.state === 'idle' &&
                        !w2.attacking &&
                        w2.unitType !== 'catapult' &&
                        w2.unitType !== 'trebuchet'
                      ) {
                        const attacker = enemyGruntsRef.current.find(
                          gg => gg.id === capturedGruntId && gg.hp > 0
                        );
                        if (attacker)
                          return {
                            ...w2,
                            hp: newHp,
                            attacking: {
                              targetType: 'grunt' as const,
                              gruntId: capturedGruntId,
                            },
                            state: 'attacking' as const,
                          };
                      }
                      return { ...w2, hp: newHp };
                    })
                  );
                  workerHitRef.current.set(wid, Date.now());
                  addFloatingText(
                    capturedWX,
                    capturedWY,
                    `-${gruntDmg}`,
                    '#ef4444'
                  );
                  Snd.hit();
                  triggerUnderAttackRef.current({
                    x: capturedWX,
                    y: capturedWY,
                  });
                }, GRUNT_ATTACK_MS);
              }
              return { ...g, movingTo: null, path: [], state: 'attacking' };
            }
            // Move toward worker
            const p = aStar(
              INITIAL_TILES,
              { x: Math.round(g.x), y: Math.round(g.y) },
              { x: Math.round(nearWorker.x), y: Math.round(nearWorker.y) },
              true,
              new Set(
                placedBuildingsRef.current
                  .filter(b => b.type === 'wall')
                  .map(b => `${b.x},${b.y}`)
              )
            );
            const dx = nearWorker.x - g.x,
              dy = nearWorker.y - g.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            return {
              ...g,
              movingTo: p[0] ?? { x: nearWorker.x, y: nearWorker.y },
              path: p.slice(1),
              state: 'moving',
              x:
                g.x +
                (dx / d) *
                  Math.min(GRUNT_SPEED * gruntSpeedMult * frostMult * dt, d),
              y:
                g.y +
                (dy / d) *
                  Math.min(GRUNT_SPEED * gruntSpeedMult * frostMult * dt, d),
            };
          }

          // Building aggro: prioritize military buildings over economic ones (AoE-style target AI)
          const BUILDING_PRIORITY: Partial<Record<BuildingType, number>> = {
            barracks: 5,
            siegeWorkshop: 4,
            stable: 4,
            watchtower: 3,
            blacksmith: 2,
            farmhouse: 1,
          };
          const nearBuildingCandidates = placedBuildingsRef.current.filter(
            b =>
              b.type !== 'wall' &&
              b.hp > 0 &&
              !b.constructing &&
              tileDist(g.x, g.y, b.x, b.y) <= 1.2
          );
          const nearBuilding =
            nearBuildingCandidates.sort(
              (a, b2) =>
                (BUILDING_PRIORITY[b2.type] ?? 0) -
                (BUILDING_PRIORITY[a.type] ?? 0)
            )[0] ?? null;
          if (nearBuilding) {
            if (!buildingAttackTimeoutsRef.current[g.id]) {
              const bid = nearBuilding.id;
              const bx = nearBuilding.x;
              const by = nearBuilding.y;
              buildingAttackTimeoutsRef.current[g.id] = window.setTimeout(
                () => {
                  delete buildingAttackTimeoutsRef.current[g.id];
                  setPlacedBuildings(bs =>
                    bs.map(b =>
                      b.id === bid
                        ? {
                            ...b,
                            hp: Math.max(0, b.hp - BUILDING_GRUNT_DAMAGE),
                          }
                        : b
                    )
                  );
                  addFloatingText(
                    bx,
                    by,
                    `-${BUILDING_GRUNT_DAMAGE}`,
                    '#f97316'
                  );
                  triggerUnderAttackRef.current({ x: bx, y: by });
                },
                GRUNT_ATTACK_MS
              );
            }
            return { ...g, movingTo: null, path: [], state: 'attacking' };
          }

          if (g.movingTo) {
            const dx = g.movingTo.x - g.x,
              dy = g.movingTo.y - g.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const epsilon = 0.12;
            if (d < epsilon) {
              if (g.path.length > 0) {
                const [next, ...rest] = g.path;
                return {
                  ...g,
                  x: g.movingTo.x,
                  y: g.movingTo.y,
                  movingTo: next ?? null,
                  path: rest,
                };
              }
              return {
                ...g,
                x: g.movingTo.x,
                y: g.movingTo.y,
                movingTo: null,
                path: [],
                state: 'attacking',
              };
            }
            return {
              ...g,
              x:
                g.x +
                (dx / d) *
                  Math.min(GRUNT_SPEED * gruntSpeedMult * frostMult * dt, d),
              y:
                g.y +
                (dy / d) *
                  Math.min(GRUNT_SPEED * gruntSpeedMult * frostMult * dt, d),
            };
          }
          if (g.state === 'attacking') {
            if (!gruntAttackTimeoutsRef.current[g.id]) {
              gruntAttackTimeoutsRef.current[g.id] = window.setTimeout(() => {
                delete gruntAttackTimeoutsRef.current[g.id];
                const barnArmor = Math.min(
                  8,
                  garrisonedRef.current.length * GARRISON_ARMOR_PER_UNIT
                );
                const rawBarnDmg = g.isBoss ? BOSS_DAMAGE : GRUNT_DAMAGE;
                const barnDmg = Math.max(1, rawBarnDmg - barnArmor);
                Snd.hit();
                barnDmgThisWaveRef.current += barnDmg;
                addDmgLog(g.isBoss ? '🐂 Boss Grunt' : '👹 Grunt', barnDmg);
                setPlayerBarnHp(hp => {
                  const nHp = Math.max(0, hp - barnDmg);
                  if (nHp <= 0) setGameOver('defeat');
                  return nHp;
                });
                addFloatingText(
                  BARN_POS.x,
                  BARN_POS.y,
                  `-${barnDmg}`,
                  g.isBoss ? '#dc2626' : '#ef4444'
                );
                triggerUnderAttackRef.current({ x: BARN_POS.x, y: BARN_POS.y });
                if (g.isBoss) triggerShakeRef.current(2);
              }, GRUNT_ATTACK_MS);
            }
          }
          // If grunt has no path and isn't attacking anything, re-path to highest-priority building in range or barn
          if (!g.movingTo && g.state !== 'attacking') {
            const PRIORITY: Partial<Record<BuildingType, number>> = {
              barracks: 5,
              siegeWorkshop: 4,
              stable: 4,
              watchtower: 3,
              blacksmith: 2,
              farmhouse: 1,
            };
            const buildings = placedBuildingsRef.current.filter(
              b => b.type !== 'wall' && b.hp > 0
            );
            const target = buildings.sort(
              (a, b2) => (PRIORITY[b2.type] ?? 0) - (PRIORITY[a.type] ?? 0)
            )[0];
            const dest = target ? { x: target.x, y: target.y } : BARN_POS;
            const wallSet2 = new Set(
              placedBuildingsRef.current
                .filter(b => b.type === 'wall')
                .map(b => `${b.x},${b.y}`)
            );
            const p2 = aStar(
              INITIAL_TILES,
              { x: Math.round(g.x), y: Math.round(g.y) },
              dest,
              true,
              wallSet2
            );
            return {
              ...g,
              movingTo: p2[0] ?? dest,
              path: p2.slice(1),
              state: 'moving',
            };
          }
          return g;
        })
      );

      // Update War Rams (enemy siege units)
      setEnemySiege(rams => {
        const survived = rams.filter(r => r.hp > 0);
        const killed = rams.filter(r => r.hp <= 0);
        if (killed.length > 0) {
          killed.forEach(r => {
            const reward =
              r.siegeType === 'demolisher'
                ? DEMOLISHER_GOLD_REWARD
                : WAR_RAM_GOLD_REWARD;
            setResources(res => ({ ...res, gold: res.gold + reward }));
            addFloatingText(
              Math.round(r.x),
              Math.round(r.y),
              `+${reward}🪙`,
              '#fbbf24'
            );
          });
        }
        return survived.map(r => {
          const speed =
            r.siegeType === 'demolisher' ? DEMOLISHER_SPEED : WAR_RAM_SPEED;
          // Move toward target building/barn
          if (r.movingTo) {
            const dx = r.movingTo.x - r.x,
              dy = r.movingTo.y - r.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            // Demolisher stops when in fire range; ram stops at melee
            const stopRange =
              r.siegeType === 'demolisher' ? DEMOLISHER_FIRE_RANGE - 0.5 : 0.1;
            if (d < stopRange) {
              const next = r.path[0] ?? null;
              if (r.siegeType === 'demolisher')
                return {
                  ...r,
                  x: r.x,
                  y: r.y,
                  movingTo: null,
                  path: [],
                  state: 'attacking' as const,
                };
              return {
                ...r,
                x: r.movingTo.x,
                y: r.movingTo.y,
                movingTo: next,
                path: r.path.slice(1),
                state: next ? ('moving' as const) : ('attacking' as const),
              };
            }
            return {
              ...r,
              x: r.x + (dx / d) * Math.min(speed * dt, d),
              y: r.y + (dy / d) * Math.min(speed * dt, d),
            };
          }
          const nearBuilding = placedBuildingsRef.current
            .filter(b => b.hp > 0)
            .sort(
              (a, b2) =>
                tileDist(r.x, r.y, a.x, a.y) - tileDist(r.x, r.y, b2.x, b2.y)
            )[0];
          const barnDist = tileDist(r.x, r.y, BARN_POS.x, BARN_POS.y);
          const buildingDist = nearBuilding
            ? tileDist(r.x, r.y, nearBuilding.x, nearBuilding.y)
            : Infinity;
          // Demolisher: ranged AoE attack
          if (r.siegeType === 'demolisher') {
            const atkRange = DEMOLISHER_FIRE_RANGE;
            const target =
              nearBuilding && buildingDist <= atkRange
                ? nearBuilding
                : barnDist <= atkRange
                  ? null
                  : null;
            const inRange =
              (nearBuilding && buildingDist <= atkRange) ||
              barnDist <= atkRange;
            if (inRange) {
              if (!siegeAttackTimeoutsRef.current[r.id]) {
                const tx =
                  nearBuilding && buildingDist <= atkRange
                    ? nearBuilding.x
                    : BARN_POS.x;
                const ty =
                  nearBuilding && buildingDist <= atkRange
                    ? nearBuilding.y
                    : BARN_POS.y;
                const capturedRId = r.id;
                siegeAttackTimeoutsRef.current[r.id] = window.setTimeout(() => {
                  delete siegeAttackTimeoutsRef.current[capturedRId];
                  if (gameOverRef.current) return;
                  if (
                    !enemySiegeRef.current.find(
                      s => s.id === capturedRId && s.hp > 0
                    )
                  )
                    return;
                  // AoE splash on buildings
                  addProjectile(
                    Math.round(r.x),
                    Math.round(r.y),
                    tx,
                    ty,
                    'rock',
                    900
                  );
                  setPlacedBuildings(bs =>
                    bs.map(b =>
                      tileDist(tx, ty, b.x, b.y) <= DEMOLISHER_SPLASH_RANGE
                        ? { ...b, hp: Math.max(0, b.hp - DEMOLISHER_DAMAGE) }
                        : b
                    )
                  );
                  // Direct barn hit
                  if (
                    tileDist(tx, ty, BARN_POS.x, BARN_POS.y) <=
                    DEMOLISHER_SPLASH_RANGE
                  ) {
                    barnDmgThisWaveRef.current += DEMOLISHER_DAMAGE;
                    addDmgLog('💥 Demolisher', DEMOLISHER_DAMAGE);
                    setPlayerBarnHp(hp => {
                      const nHp = Math.max(0, hp - DEMOLISHER_DAMAGE);
                      if (nHp <= 0) setGameOver('defeat');
                      return nHp;
                    });
                    triggerUnderAttackRef.current({
                      x: BARN_POS.x,
                      y: BARN_POS.y,
                    });
                    triggerShakeRef.current(1.5);
                  }
                  addFloatingText(tx, ty, `💣-${DEMOLISHER_DAMAGE}`, '#f97316');
                }, DEMOLISHER_ATTACK_MS);
              }
              return { ...r, state: 'attacking' as const };
            }
            // Move closer
            const wallSetD = new Set(
              placedBuildingsRef.current
                .filter(b => b.type === 'wall')
                .map(b => `${b.x},${b.y}`)
            );
            const dDest2 =
              nearBuilding && buildingDist < barnDist
                ? { x: nearBuilding.x, y: nearBuilding.y }
                : BARN_POS;
            const dPath2 = aStar(
              INITIAL_TILES,
              { x: Math.round(r.x), y: Math.round(r.y) },
              dDest2,
              true,
              wallSetD
            );
            return {
              ...r,
              movingTo: dPath2[0] ?? dDest2,
              path: dPath2.slice(1),
              state: 'moving' as const,
            };
          }
          // War Ram: melee attack
          if (buildingDist <= 1.2 && nearBuilding) {
            if (!siegeAttackTimeoutsRef.current[r.id]) {
              const bid = nearBuilding.id;
              const bx = nearBuilding.x;
              const by = nearBuilding.y;
              siegeAttackTimeoutsRef.current[r.id] = window.setTimeout(() => {
                delete siegeAttackTimeoutsRef.current[r.id];
                setPlacedBuildings(bs =>
                  bs.map(b =>
                    b.id === bid
                      ? { ...b, hp: Math.max(0, b.hp - WAR_RAM_DAMAGE) }
                      : b
                  )
                );
                addFloatingText(bx, by, `🪵-${WAR_RAM_DAMAGE}`, '#dc2626');
              }, WAR_RAM_ATTACK_MS);
            }
            return { ...r, state: 'attacking' as const };
          }
          if (barnDist <= 1.2) {
            if (!siegeAttackTimeoutsRef.current[r.id]) {
              siegeAttackTimeoutsRef.current[r.id] = window.setTimeout(() => {
                delete siegeAttackTimeoutsRef.current[r.id];
                addDmgLog('🪵 War Ram', WAR_RAM_DAMAGE);
                setPlayerBarnHp(hp => {
                  const nHp = Math.max(0, hp - WAR_RAM_DAMAGE);
                  if (nHp <= 0) setGameOver('defeat');
                  return nHp;
                });
                addFloatingText(
                  BARN_POS.x,
                  BARN_POS.y,
                  `🪵-${WAR_RAM_DAMAGE}`,
                  '#dc2626'
                );
              }, WAR_RAM_ATTACK_MS);
            }
            return { ...r, state: 'attacking' as const };
          }
          // Re-path to nearest building or barn
          const wallSetR = new Set(
            placedBuildingsRef.current
              .filter(b => b.type === 'wall')
              .map(b => `${b.x},${b.y}`)
          );
          const dest =
            nearBuilding && buildingDist < barnDist
              ? { x: nearBuilding.x, y: nearBuilding.y }
              : BARN_POS;
          const p = aStar(
            INITIAL_TILES,
            { x: Math.round(r.x), y: Math.round(r.y) },
            dest,
            true,
            wallSetR
          );
          return {
            ...r,
            movingTo: p[0] ?? dest,
            path: p.slice(1),
            state: 'moving' as const,
          };
        });
      });

      // Update Shamans
      setEnemyShamans(ss => {
        const alive = ss.filter(s => s.hp > 0);
        const killed = ss.filter(s => s.hp <= 0);
        if (killed.length > 0) {
          killed.forEach(s => {
            setResources(res => ({
              ...res,
              gold: res.gold + SHAMAN_GOLD_REWARD,
            }));
            addFloatingText(
              Math.round(s.x),
              Math.round(s.y),
              `+${SHAMAN_GOLD_REWARD}🪙`,
              '#fbbf24'
            );
          });
        }
        return alive.map(s => {
          // Find nearest injured grunt within heal radius to follow
          const injuredGrunts = enemyGruntsRef.current.filter(
            g => g.hp > 0 && g.hp < g.maxHp
          );
          const nearInjured = injuredGrunts.sort(
            (a, b2) =>
              tileDist(s.x, s.y, a.x, a.y) - tileDist(s.x, s.y, b2.x, b2.y)
          )[0];
          if (nearInjured) {
            const d = tileDist(s.x, s.y, nearInjured.x, nearInjured.y);
            if (d <= SHAMAN_HEAL_RADIUS) {
              // In range — heal nearby grunts
              if (!shamanHealTimersRef.current[s.id]) {
                const sid = s.id;
                shamanHealTimersRef.current[sid] = window.setTimeout(() => {
                  delete shamanHealTimersRef.current[sid];
                  setEnemyGrunts(gs =>
                    gs.map(g => {
                      if (
                        g.hp <= 0 ||
                        tileDist(s.x, s.y, g.x, g.y) > SHAMAN_HEAL_RADIUS
                      )
                        return g;
                      const newHp = Math.min(
                        g.maxHp,
                        g.hp + SHAMAN_HEAL_AMOUNT
                      );
                      if (newHp > g.hp)
                        addFloatingText(
                          Math.round(g.x),
                          Math.round(g.y),
                          `🧙+${SHAMAN_HEAL_AMOUNT}`,
                          '#86efac'
                        );
                      return { ...g, hp: newHp };
                    })
                  );
                }, SHAMAN_HEAL_MS);
              }
              return { ...s, state: 'healing' as const };
            }
            // Move toward injured grunt
            const dx = nearInjured.x - s.x,
              dy = nearInjured.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return {
              ...s,
              x: s.x + (dx / dist) * Math.min(SHAMAN_SPEED * dt, dist),
              y: s.y + (dy / dist) * Math.min(SHAMAN_SPEED * dt, dist),
              state: 'moving' as const,
            };
          }
          // No injured grunts — follow nearest grunt toward barn
          if (s.movingTo) {
            const dx = s.movingTo.x - s.x,
              dy = s.movingTo.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.1) {
              const next = s.path[0] ?? null;
              return {
                ...s,
                x: s.movingTo.x,
                y: s.movingTo.y,
                movingTo: next,
                path: s.path.slice(1),
                state: 'moving' as const,
              };
            }
            return {
              ...s,
              x: s.x + (dx / dist) * Math.min(SHAMAN_SPEED * dt, dist),
              y: s.y + (dy / dist) * Math.min(SHAMAN_SPEED * dt, dist),
            };
          }
          const wallSetS = new Set(
            placedBuildingsRef.current
              .filter(b => b.type === 'wall')
              .map(b => `${b.x},${b.y}`)
          );
          const p = aStar(
            INITIAL_TILES,
            { x: Math.round(s.x), y: Math.round(s.y) },
            BARN_POS,
            true,
            wallSetS
          );
          return { ...s, movingTo: p[0] ?? BARN_POS, path: p.slice(1) };
        });
      });

      // Update Necromancers
      setEnemyNecromancers(ns => {
        const alive = ns.filter(n => n.hp > 0);
        const killed = ns.filter(n => n.hp <= 0);
        if (killed.length > 0) {
          killed.forEach(n => {
            setResources(r => ({
              ...r,
              gold: r.gold + NECROMANCER_GOLD_REWARD,
            }));
            addFloatingText(
              Math.round(n.x),
              Math.round(n.y),
              `+${NECROMANCER_GOLD_REWARD}🪙`,
              '#fbbf24'
            );
          });
        }
        return alive.map(n => {
          // Look for a recent dead grunt position within raise radius
          const now = Date.now();
          const nearCorpse = deadGruntPositionsRef.current.find(
            p =>
              now - p.t < 20000 &&
              tileDist(n.x, n.y, p.x, p.y) <= NECROMANCER_RAISE_RADIUS
          );
          if (nearCorpse) {
            if (!necromancerRaiseTimersRef.current[n.id]) {
              const nid = n.id;
              const cx2 = nearCorpse.x;
              const cy2 = nearCorpse.y;
              necromancerRaiseTimersRef.current[nid] = window.setTimeout(() => {
                delete necromancerRaiseTimersRef.current[nid];
                // Consume the corpse and spawn a skeleton grunt (half HP)
                setDeadGruntPositions(prev =>
                  prev.filter(p => !(p.x === cx2 && p.y === cy2))
                );
                const skeletonHp = Math.round(GRUNT_MAX_HP * 0.5);
                const wallSetN = new Set(
                  placedBuildingsRef.current
                    .filter(b => b.type === 'wall')
                    .map(b => `${b.x},${b.y}`)
                );
                const skPath = aStar(
                  INITIAL_TILES,
                  { x: cx2, y: cy2 },
                  BARN_POS,
                  true,
                  wallSetN
                );
                const skeleton: EnemyGrunt = {
                  id: gruntIdRef.current++,
                  x: cx2,
                  y: cy2,
                  hp: skeletonHp,
                  maxHp: skeletonHp,
                  movingTo: skPath[0] ?? BARN_POS,
                  path: skPath.slice(1),
                  state: 'moving',
                  isSkeleton: true,
                };
                setEnemyGrunts(gs => [...gs, skeleton]);
                addFloatingText(cx2, cy2, '💀 RAISED!', '#a855f7');
              }, NECROMANCER_RAISE_MS);
            }
            return { ...n, state: 'raising' as const };
          }
          // Move toward nearest corpse or follow grunts toward barn
          const nearestCorpse = deadGruntPositionsRef.current
            .filter(p => now - p.t < 20000)
            .sort(
              (a, b2) =>
                tileDist(n.x, n.y, a.x, a.y) - tileDist(n.x, n.y, b2.x, b2.y)
            )[0];
          const moveDest = nearestCorpse
            ? { x: nearestCorpse.x, y: nearestCorpse.y }
            : BARN_POS;
          if (n.movingTo) {
            const dx2 = n.movingTo.x - n.x,
              dy2 = n.movingTo.y - n.y;
            const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            if (d2 < 0.1) {
              const next2 = n.path[0] ?? null;
              return {
                ...n,
                x: n.movingTo.x,
                y: n.movingTo.y,
                movingTo: next2,
                path: n.path.slice(1),
                state: 'moving' as const,
              };
            }
            return {
              ...n,
              x: n.x + (dx2 / d2) * Math.min(NECROMANCER_SPEED * dt, d2),
              y: n.y + (dy2 / d2) * Math.min(NECROMANCER_SPEED * dt, d2),
            };
          }
          const wallSetN2 = new Set(
            placedBuildingsRef.current
              .filter(b => b.type === 'wall')
              .map(b => `${b.x},${b.y}`)
          );
          const p2 = aStar(
            INITIAL_TILES,
            { x: Math.round(n.x), y: Math.round(n.y) },
            moveDest,
            true,
            wallSetN2
          );
          return { ...n, movingTo: p2[0] ?? moveDest, path: p2.slice(1) };
        });
      });

      // Update Witch Doctors
      setEnemyWitchDoctors(wds => {
        const alive = wds.filter(d => d.hp > 0);
        alive.forEach(d => {
          if (!alive.find(dd => dd.id === d.id)) {
            setResources(r => ({
              ...r,
              gold: r.gold + WITCH_DOCTOR_GOLD_REWARD,
            }));
          }
        });
        return alive.map(wd => {
          const nearGrunts = enemyGruntsRef.current.filter(
            g =>
              g.hp > 0 &&
              tileDist(wd.x, wd.y, g.x, g.y) <= WITCH_DOCTOR_BUFF_RADIUS
          );
          if (nearGrunts.length > 0) {
            if (!witchDoctorBuffTimersRef.current[wd.id]) {
              const wdid = wd.id;
              const capturedWDX2 = Math.round(wd.x);
              const capturedWDY2 = Math.round(wd.y);
              witchDoctorBuffTimersRef.current[wdid] = window.setTimeout(() => {
                delete witchDoctorBuffTimersRef.current[wdid];
                const buffUntil = Date.now() + WITCH_DOCTOR_BUFF_DURATION;
                setEnemyGrunts(gs =>
                  gs.map(g => {
                    if (
                      g.hp <= 0 ||
                      tileDist(capturedWDX2, capturedWDY2, g.x, g.y) >
                        WITCH_DOCTOR_BUFF_RADIUS
                    )
                      return g;
                    addFloatingText(
                      Math.round(g.x),
                      Math.round(g.y),
                      '🔴BERSERK!',
                      '#dc2626'
                    );
                    return { ...g, enragedUntil: buffUntil };
                  })
                );
              }, WITCH_DOCTOR_BUFF_MS);
            }
            return { ...wd, state: 'casting' as const };
          }
          if (wd.movingTo) {
            const dx = wd.movingTo.x - wd.x,
              dy = wd.movingTo.y - wd.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.1) {
              const next = wd.path[0] ?? null;
              return {
                ...wd,
                x: wd.movingTo.x,
                y: wd.movingTo.y,
                movingTo: next,
                path: wd.path.slice(1),
                state: 'moving' as const,
              };
            }
            return {
              ...wd,
              x: wd.x + (dx / dist) * Math.min(WITCH_DOCTOR_SPEED * dt, dist),
              y: wd.y + (dy / dist) * Math.min(WITCH_DOCTOR_SPEED * dt, dist),
              state: 'moving' as const,
            };
          }
          const wallSetWD2 = new Set(
            placedBuildingsRef.current
              .filter(b => b.type === 'wall')
              .map(b => `${b.x},${b.y}`)
          );
          const pWD = aStar(
            INITIAL_TILES,
            { x: Math.round(wd.x), y: Math.round(wd.y) },
            BARN_POS,
            true,
            wallSetWD2
          );
          return { ...wd, movingTo: pWD[0] ?? BARN_POS, path: pWD.slice(1) };
        });
      });

      // Update Enemy Warchiefs (War Stomp + march to barn)
      setEnemyWarchiefs(wcs => {
        const alive = wcs.filter(wc2 => wc2.hp > 0);
        const killed = wcs.filter(wc2 => wc2.hp <= 0);
        killed.forEach(wc2 => {
          setResources(r => ({ ...r, gold: r.gold + WARCHIEF_GOLD_REWARD }));
          addFloatingText(
            Math.round(wc2.x),
            Math.round(wc2.y),
            `👑 +${WARCHIEF_GOLD_REWARD}🪙`,
            '#fbbf24'
          );
          const wcPool2: HeroItemId[] = [
            'battle_sword',
            'shield_pendant',
            'tome_xp',
            'healing_potion',
          ];
          const wcDrop2 = wcPool2[Math.floor(Math.random() * wcPool2.length)]!;
          setDroppedItems(ds => [
            ...ds,
            {
              id: dropItemIdRef.current++,
              itemId: wcDrop2,
              x: Math.round(wc2.x),
              y: Math.round(wc2.y),
            },
          ]);
          addFloatingText(
            Math.round(wc2.x),
            Math.round(wc2.y),
            `👑 ${HERO_ITEM_DATA[wcDrop2].emoji} Dropped!`,
            '#c084fc'
          );
        });
        const now = Date.now();
        return alive.map(wc2 => {
          // War Stomp: every WARCHIEF_STOMP_COOLDOWN_MS stun all workers within radius
          if (now - wc2.lastStompAt >= WARCHIEF_STOMP_COOLDOWN_MS) {
            const stunUntil = now + WARCHIEF_STOMP_SLOW_MS;
            setWorkers(ws =>
              ws.map(w => {
                if (
                  w.hp <= 0 ||
                  tileDist(w.x, w.y, wc2.x, wc2.y) > WARCHIEF_STOMP_RADIUS
                )
                  return w;
                addFloatingText(
                  Math.round(w.x),
                  Math.round(w.y),
                  '💫STUNNED!',
                  '#fbbf24'
                );
                return { ...w, stunUntil };
              })
            );
            addFloatingText(
              Math.round(wc2.x),
              Math.round(wc2.y),
              '👊 WAR STOMP!',
              '#ef4444'
            );
            return { ...wc2, state: 'stomping' as const, lastStompAt: now };
          }
          // Attack barn when adjacent
          const distToBarn = tileDist(wc2.x, wc2.y, BARN_POS.x, BARN_POS.y);
          if (distToBarn <= 1.2) {
            addDmgLog('⚔️ Warchief', WARCHIEF_DMG);
            setPlayerBarnHp(hp => Math.max(0, hp - WARCHIEF_DMG));
            addFloatingText(
              BARN_POS.x,
              BARN_POS.y,
              `-${WARCHIEF_DMG}🏰`,
              '#fca5a5'
            );
            return { ...wc2, state: 'attacking' as const };
          }
          // March toward barn
          if (wc2.movingTo) {
            const dx = wc2.movingTo.x - wc2.x,
              dy = wc2.movingTo.y - wc2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.1) {
              const next = wc2.path[0] ?? null;
              return {
                ...wc2,
                x: wc2.movingTo.x,
                y: wc2.movingTo.y,
                movingTo: next,
                path: wc2.path.slice(1),
                state: 'moving' as const,
              };
            }
            return {
              ...wc2,
              x: wc2.x + (dx / dist) * Math.min(WARCHIEF_SPEED * dt, dist),
              y: wc2.y + (dy / dist) * Math.min(WARCHIEF_SPEED * dt, dist),
              state: 'moving' as const,
            };
          }
          const wallSetWC2 = new Set(
            placedBuildingsRef.current
              .filter(b => b.type === 'wall')
              .map(b => `${b.x},${b.y}`)
          );
          const pWC = aStar(
            INITIAL_TILES,
            { x: Math.round(wc2.x), y: Math.round(wc2.y) },
            BARN_POS,
            true,
            wallSetWC2
          );
          return { ...wc2, movingTo: pWC[0] ?? BARN_POS, path: pWC.slice(1) };
        });
      });

      // Update enemy Troll Archers
      setEnemyTrolls(ts => {
        const alive = ts.filter(t => t.hp > 0);
        const killed = ts.filter(t => t.hp <= 0);
        killed.forEach(t => {
          setResources(r => ({ ...r, gold: r.gold + TROLL_GOLD_REWARD }));
          addFloatingText(
            Math.round(t.x),
            Math.round(t.y),
            `+${TROLL_GOLD_REWARD}🪙`,
            '#fbbf24'
          );
        });
        return alive.map(t => {
          // Find nearest player unit within attack range
          const nearestWorker = workersRef.current
            .filter(w => w.hp > 0)
            .sort(
              (a, b2) =>
                tileDist(t.x, t.y, a.x, a.y) - tileDist(t.x, t.y, b2.x, b2.y)
            )[0];
          const distToWorker = nearestWorker
            ? tileDist(t.x, t.y, nearestWorker.x, nearestWorker.y)
            : 999;

          if (distToWorker <= TROLL_ATTACK_RANGE) {
            // Fire arrows at nearest worker
            if (!trollAttackTimersRef.current[t.id]) {
              const tid = t.id,
                twx = Math.round(nearestWorker!.x),
                twy = Math.round(nearestWorker!.y),
                wid = nearestWorker!.id;
              const capturedTX = Math.round(t.x),
                capturedTY = Math.round(t.y);
              trollAttackTimersRef.current[tid] = window.setTimeout(() => {
                delete trollAttackTimersRef.current[tid];
                addProjectile(capturedTX, capturedTY, twx, twy, 'arrow', 600);
                setWorkers(ws =>
                  ws.map(w => {
                    if (w.id !== wid || w.hp <= 0) return w;
                    addFloatingText(twx, twy, `-${TROLL_DAMAGE}`, '#fca5a5');
                    return { ...w, hp: Math.max(0, w.hp - TROLL_DAMAGE) };
                  })
                );
              }, TROLL_ATTACK_MS);
            }
            // Kite: if worker is getting close, back away
            if (distToWorker < TROLL_KITE_RANGE) {
              const dx = t.x - nearestWorker!.x,
                dy = t.y - nearestWorker!.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const nx = Math.max(
                0,
                Math.min(GRID_SIZE - 1, t.x + (dx / dist) * TROLL_SPEED * dt)
              );
              const ny = Math.max(
                0,
                Math.min(GRID_SIZE - 1, t.y + (dy / dist) * TROLL_SPEED * dt)
              );
              return {
                ...t,
                x: nx,
                y: ny,
                movingTo: null,
                path: [],
                state: 'kiting' as const,
              };
            }
            return { ...t, state: 'attacking' as const };
          }

          // March toward barn but stop at attack range
          const distToBarn = tileDist(t.x, t.y, BARN_POS.x, BARN_POS.y);
          if (distToBarn <= TROLL_ATTACK_RANGE) {
            // Fire at barn if no worker target
            if (!trollAttackTimersRef.current[t.id]) {
              const tid = t.id;
              const capturedTX2 = Math.round(t.x),
                capturedTY2 = Math.round(t.y);
              trollAttackTimersRef.current[tid] = window.setTimeout(() => {
                delete trollAttackTimersRef.current[tid];
                if (gameOverRef.current) return;
                if (
                  !enemyTrollsRef.current.find(tr => tr.id === tid && tr.hp > 0)
                )
                  return;
                addProjectile(
                  capturedTX2,
                  capturedTY2,
                  BARN_POS.x,
                  BARN_POS.y,
                  'arrow',
                  700
                );
                addFloatingText(
                  BARN_POS.x,
                  BARN_POS.y,
                  `🏹-${TROLL_DAMAGE}`,
                  '#fca5a5'
                );
                addDmgLog('🏹 Troll Archer', TROLL_DAMAGE);
                setPlayerBarnHp(hp => {
                  const nHp = Math.max(0, hp - TROLL_DAMAGE);
                  if (nHp <= 0) setGameOver('defeat');
                  return nHp;
                });
              }, TROLL_ATTACK_MS);
            }
            return { ...t, state: 'attacking' as const };
          }

          if (t.movingTo) {
            const dx = t.movingTo.x - t.x,
              dy = t.movingTo.y - t.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.1) {
              const next = t.path[0] ?? null;
              return {
                ...t,
                x: t.movingTo.x,
                y: t.movingTo.y,
                movingTo: next,
                path: t.path.slice(1),
                state: 'moving' as const,
              };
            }
            return {
              ...t,
              x: t.x + (dx / dist) * Math.min(TROLL_SPEED * dt, dist),
              y: t.y + (dy / dist) * Math.min(TROLL_SPEED * dt, dist),
            };
          }
          const wallSetT = new Set(
            placedBuildingsRef.current
              .filter(b => b.type === 'wall')
              .map(b => `${b.x},${b.y}`)
          );
          const p = aStar(
            INITIAL_TILES,
            { x: Math.round(t.x), y: Math.round(t.y) },
            BARN_POS,
            true,
            wallSetT
          );
          return {
            ...t,
            movingTo: p[0] ?? BARN_POS,
            path: p.slice(1),
            state: 'moving' as const,
          };
        });
      });

      // Update Goblin Sappers
      setEnemySappers(ss => {
        const alive = ss.filter(s => !s.exploded && s.hp > 0);
        const killed = ss.filter(s => !s.exploded && s.hp <= 0);
        killed.forEach(s => {
          setResources(r => ({ ...r, gold: r.gold + SAPPER_GOLD_REWARD }));
          addFloatingText(
            Math.round(s.x),
            Math.round(s.y),
            `+${SAPPER_GOLD_REWARD}🪙 💥Defused!`,
            '#fbbf24'
          );
        });
        return alive
          .map(s => {
            const distToTarget = tileDist(s.x, s.y, s.targetX, s.targetY);
            // Explode on reaching target
            if (distToTarget < 0.8) {
              addFloatingText(
                Math.round(s.x),
                Math.round(s.y),
                '💥 BOOM!',
                '#f97316'
              );
              // Damage all buildings in radius
              setPlacedBuildings(bs =>
                bs.map(b => {
                  const d = tileDist(b.x, b.y, s.x, s.y);
                  if (d > SAPPER_EXPLODE_RADIUS) return b;
                  const newHp = Math.max(0, b.hp - SAPPER_EXPLODE_DAMAGE);
                  addFloatingText(
                    b.x,
                    b.y,
                    `-${SAPPER_EXPLODE_DAMAGE}`,
                    '#ef4444'
                  );
                  return { ...b, hp: newHp };
                })
              );
              // Damage player barn if in range
              if (
                tileDist(s.x, s.y, BARN_POS.x, BARN_POS.y) <=
                SAPPER_EXPLODE_RADIUS
              ) {
                addDmgLog('💣 Goblin Sapper', SAPPER_EXPLODE_DAMAGE);
                setPlayerBarnHp(hp => {
                  const nHp = Math.max(0, hp - SAPPER_EXPLODE_DAMAGE);
                  if (nHp <= 0) setGameOver('defeat');
                  return nHp;
                });
                addFloatingText(
                  BARN_POS.x,
                  BARN_POS.y,
                  `-${SAPPER_EXPLODE_DAMAGE}`,
                  '#ef4444'
                );
              }
              // Damage workers in radius
              setWorkers(ws =>
                ws.map(w => {
                  if (tileDist(w.x, w.y, s.x, s.y) > SAPPER_EXPLODE_RADIUS)
                    return w;
                  addFloatingText(
                    Math.round(w.x),
                    Math.round(w.y),
                    `-${SAPPER_EXPLODE_DAMAGE}`,
                    '#fca5a5'
                  );
                  return {
                    ...w,
                    hp: Math.max(0, w.hp - SAPPER_EXPLODE_DAMAGE),
                  };
                })
              );
              // XP reward to nearby attackers
              setWorkers(ws2 =>
                ws2.map(u => {
                  if (!u.attacking || u.attacking.targetType !== 'sapper')
                    return u;
                  const xpGain = SAPPER_XP_REWARD;
                  const newXp = u.xp + xpGain;
                  const newLevel =
                    newXp >= XP_TO_LEVEL_3
                      ? 3
                      : newXp >= XP_TO_LEVEL_2
                        ? 2
                        : newXp >= XP_TO_LEVEL_1
                          ? 1
                          : 0;
                  if (newLevel > u.level) {
                    addFloatingText(
                      Math.round(u.x),
                      Math.round(u.y),
                      `⭐ Level ${newLevel}!`,
                      '#fbbf24'
                    );
                    return {
                      ...u,
                      xp: newXp,
                      level: newLevel,
                      maxHp: u.maxHp + VETERAN_HP_BONUS,
                      hp: Math.min(
                        u.hp + VETERAN_HP_BONUS,
                        u.maxHp + VETERAN_HP_BONUS
                      ),
                      attacking: null,
                      state: 'idle' as const,
                    };
                  }
                  return {
                    ...u,
                    xp: newXp,
                    attacking: null,
                    state: 'idle' as const,
                  };
                })
              );
              return { ...s, exploded: true };
            }
            // Move toward target
            if (s.movingTo) {
              const dx = s.movingTo.x - s.x,
                dy = s.movingTo.y - s.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 0.1) {
                const next = s.path[0] ?? null;
                if (!next)
                  return {
                    ...s,
                    x: s.movingTo.x,
                    y: s.movingTo.y,
                    movingTo: null,
                    path: [],
                  };
                return {
                  ...s,
                  x: s.movingTo.x,
                  y: s.movingTo.y,
                  movingTo: next,
                  path: s.path.slice(1),
                };
              }
              return {
                ...s,
                x: s.x + (dx / dist) * Math.min(SAPPER_SPEED * dt, dist),
                y: s.y + (dy / dist) * Math.min(SAPPER_SPEED * dt, dist),
              };
            }
            const wallSetSp = new Set(
              placedBuildingsRef.current
                .filter(b => b.type === 'wall')
                .map(b => `${b.x},${b.y}`)
            );
            const p = aStar(
              INITIAL_TILES,
              { x: Math.round(s.x), y: Math.round(s.y) },
              { x: s.targetX, y: s.targetY },
              true,
              wallSetSp
            );
            return {
              ...s,
              movingTo: p[0] ?? { x: s.targetX, y: s.targetY },
              path: p.slice(1),
            };
          })
          .filter(s => !s.exploded);
      });

      // Update neutral creeps
      setNeutralCreeps(creeps => {
        const alive = creeps.filter(c => c.hp > 0);
        const killed = creeps.filter(c => c.hp <= 0);
        if (killed.length > 0) {
          // Check if any camp is now fully cleared
          CREEP_CAMPS.forEach(camp => {
            const campAlive = alive.filter(c => c.campId === camp.id);
            if (
              campAlive.length === 0 &&
              killed.some(c => c.campId === camp.id)
            ) {
              setClearedCamps(s => {
                if (s.has(camp.id)) return s;
                const n = new Set(s);
                n.add(camp.id);
                return n;
              });
              campClearedAtRef.current[camp.id] = Date.now();
              setResources(r => ({ ...r, gold: r.gold + camp.goldReward }));
              addFloatingText(
                camp.x,
                camp.y,
                `+${camp.goldReward}🪙 Camp!`,
                '#fbbf24'
              );
              if (Math.random() < 0.65) {
                const pool: HeroItemId[] = [
                  'boots_speed',
                  'battle_sword',
                  'shield_pendant',
                  'healing_potion',
                ];
                const pick = pool[Math.floor(Math.random() * pool.length)]!;
                setDroppedItems(ds => [
                  ...ds,
                  {
                    id: dropItemIdRef.current++,
                    itemId: pick,
                    x: camp.x,
                    y: camp.y + 1,
                  },
                ]);
                addFloatingText(
                  camp.x,
                  camp.y,
                  `📦 ${HERO_ITEM_DATA[pick].emoji} Item!`,
                  '#c084fc'
                );
              }
            }
          });
          killed.forEach(c => {
            if (creepAttackTimeoutsRef.current[c.id]) {
              clearTimeout(creepAttackTimeoutsRef.current[c.id]);
              delete creepAttackTimeoutsRef.current[c.id];
            }
          });
        }
        return alive.map(c => {
          const workers2 = workersRef.current;
          // Leash: if too far from home, return
          const distHome = tileDist(c.x, c.y, c.homeX, c.homeY);
          if (distHome > CREEP_LEASH_RANGE) {
            return {
              ...c,
              state: 'returning' as const,
              targetWorkerId: null,
              x:
                c.x +
                ((c.homeX - c.x) / distHome) *
                  Math.min(CREEP_SPEED * dt, distHome),
              y:
                c.y +
                ((c.homeY - c.y) / distHome) *
                  Math.min(CREEP_SPEED * dt, distHome),
            };
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
                const capturedX = Math.round(aggro.x),
                  capturedY = Math.round(aggro.y);
                creepAttackTimeoutsRef.current[c.id] = window.setTimeout(() => {
                  delete creepAttackTimeoutsRef.current[c.id];
                  const creepDmg = Math.max(
                    1,
                    CREEP_DAMAGE - blacksmithUpgradesRef.current.ironHide * 2
                  );
                  setWorkers(ws2 =>
                    ws2.map(w2 =>
                      w2.id === wid
                        ? { ...w2, hp: Math.max(0, w2.hp - creepDmg) }
                        : w2
                    )
                  );
                  addFloatingText(
                    capturedX,
                    capturedY,
                    `-${creepDmg}`,
                    '#a855f7'
                  );
                }, CREEP_ATTACK_MS);
              }
              return {
                ...c,
                state: 'chasing' as const,
                targetWorkerId: aggro.id,
              };
            }
            const dx2 = aggro.x - c.x,
              dy2 = aggro.y - c.y;
            const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            return {
              ...c,
              state: 'chasing' as const,
              targetWorkerId: aggro.id,
              x: c.x + (dx2 / d2) * Math.min(CREEP_SPEED * dt, d2),
              y: c.y + (dy2 / d2) * Math.min(CREEP_SPEED * dt, d2),
            };
          }
          // Return home if no aggro
          if (c.state === 'chasing' || c.state === 'returning') {
            if (distHome < 0.15)
              return {
                ...c,
                state: 'idle' as const,
                targetWorkerId: null,
                x: c.homeX,
                y: c.homeY,
              };
            const dx3 = c.homeX - c.x,
              dy3 = c.homeY - c.y;
            const d3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
            return {
              ...c,
              state: 'returning' as const,
              targetWorkerId: null,
              x: c.x + (dx3 / d3) * Math.min(CREEP_SPEED * dt, d3),
              y: c.y + (dy3 / d3) * Math.min(CREEP_SPEED * dt, d3),
            };
          }
          return c;
        });
      });

      // Fog of war update — throttled to every 200ms to avoid per-frame state churn
      const nowFog = Date.now();
      if (nowFog - lastFogUpdateRef.current >= 200) {
        lastFogUpdateRef.current = nowFog;
        const newVisible = computeVisible([
          { x: BARN_POS.x, y: BARN_POS.y, r: BARN_VISION },
          ...workersRef.current.map(w => ({
            x: Math.round(w.x),
            y: Math.round(w.y),
            r: WORKER_VISION,
          })),
          ...placedBuildingsRef.current.map(b => ({
            x: b.x,
            y: b.y,
            r: b.type === 'watchtower' ? WATCHTOWER_VISION : 2,
          })),
        ]);
        // Check if visible set changed
        let visChanged = false;
        const prevVis = fogVisibleRef.current;
        outer: for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            if (!!newVisible[i]?.[j] !== !!prevVis[i]?.[j]) {
              visChanged = true;
              break outer;
            }
          }
        }
        if (visChanged) {
          fogVisibleRef.current = newVisible;
          setFogVisible(newVisible);
          // Also expand explored fog
          const prevExp = fogExploredRef.current;
          let expChanged = false;
          const nextExp = prevExp.map((row, i) =>
            row.map((v, j) => {
              if (!v && newVisible[i]?.[j]) {
                expChanged = true;
                return true;
              }
              return v;
            })
          );
          if (expChanged) {
            fogExploredRef.current = nextExp;
            setFogExplored(nextExp);
          }
        }
      }

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

  // Scroll-wheel zoom anchored to cursor position
  useEffect(() => {
    const ZOOM_MIN = 0.4,
      ZOOM_MAX = 2.5,
      ZOOM_STEP = 0.15;
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
      const wc = enemyWarchiefssRef.current.find(w2 => w2.id === warchiefId);
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
          killCount,
          onNewGame,
          placedBuildings,
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
              fogVisible,
              gruntHitRef,
              handleAttackGrunt,
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
              fogVisible,
              handleAttackTroll,
              handleAttackWarchief,
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
      />
    </div>
  );
};

export default RTSMap;
