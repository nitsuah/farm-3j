// Shared mutable-state context handed from RTSMap to the game-logic hooks.
// Fields are the component's state values, setters, and refs — the hooks
// destructure the subset they need. All hooks receive the same object.

import type React from 'react';

import type { DifficultyConfig } from '../RTSGameRoot';
import type {
  DroppedItem,
  Upgrades,
  WorkerState,
  EnemyGrunt,
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
  Projectile,
  ResourceNode,
  Resources,
  TileType,
} from '../game/types';

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;
type Ref<T> = React.RefObject<T>;

export interface RTSGameContext {
  difficulty?: DifficultyConfig;

  // ---------- callbacks ----------
  onAchievement: (id: string) => void;
  addDmgLog: (source: string, amount: number) => void;
  addFloatingText: (
    tileX: number,
    tileY: number,
    text: string,
    color: string
  ) => void;
  addProjectile: (
    fromTX: number,
    fromTY: number,
    toTX: number,
    toTY: number,
    type: Projectile['type'],
    duration: number
  ) => void;
  triggerShakeRef: Ref<(magnitude?: number) => void>;
  triggerUnderAttackRef: Ref<(pos?: { x: number; y: number }) => void>;

  // ---------- reactive values ----------
  enemyTowers: EnemyTower[];
  farmhouse: { built: boolean; level: number };
  gameOver: 'victory' | 'defeat' | null;
  gameSpeed: number;
  garrisoned: WorkerState[];
  placedBuildings: PlacedBuilding[];
  stance: 'aggressive' | 'passive';
  tiles: TileType[][];
  wave: number;
  workers: WorkerState[];

  // ---------- setters ----------
  setCapturedShrines: Setter<Set<number>>;
  setClearedCamps: Setter<Set<number>>;
  setDeadGruntPositions: Setter<{ x: number; y: number; t: number }[]>;
  setDeadWorkerPositions: Setter<
    { x: number; y: number; t: number; unitType: string }[]
  >;
  setDroppedItems: Setter<DroppedItem[]>;
  setEnemyBarnHp: Setter<number>;
  setEnemyGrunts: Setter<EnemyGrunt[]>;
  setEnemyNecromancers: Setter<EnemyNecromancer[]>;
  setEnemySappers: Setter<EnemySapper[]>;
  setEnemyShamans: Setter<EnemyShaman[]>;
  setEnemySiege: Setter<EnemySiege[]>;
  setEnemyTowers: Setter<EnemyTower[]>;
  setEnemyTrolls: Setter<EnemyTroll[]>;
  setEnemyWalls: Setter<EnemyTower[]>;
  setEnemyWarchiefs: Setter<EnemyWarchief[]>;
  setEnemyWarlords: Setter<EnemyWarlord[]>;
  setEnemyWitchDoctors: Setter<EnemyWitchDoctor[]>;
  setFogExplored: Setter<boolean[][]>;
  setFogVisible: Setter<boolean[][]>;
  setGameOver: Setter<'victory' | 'defeat' | null>;
  setGarrisoned: Setter<WorkerState[]>;
  setGoldMines: Setter<ResourceNode[]>;
  setHeroItems: Setter<HeroItem[]>;
  setKillCount: Setter<number>;
  setLootCrates: Setter<LootCrate[]>;
  setNeutralCreeps: Setter<NeutralCreep[]>;
  setNextWaveAt: Setter<number | null>;
  setPlacedBuildings: Setter<PlacedBuilding[]>;
  setPlayerBarnHp: Setter<number>;
  setResources: Setter<Resources>;
  setShrineCapturing: Setter<{
    shrineId: number;
    workerId: number;
    startedAt: number;
  } | null>;
  setShrinePlentyBuff: Setter<boolean>;
  setShrineWarBuff: Setter<boolean>;
  setStoneNodes: Setter<ResourceNode[]>;
  setTotalGold: Setter<number>;
  setTotalLumber: Setter<number>;
  setTotalStone: Setter<number>;
  setTrainingProgress: Setter<number>;
  setTrainingQueue: Setter<{ type: 'swordsman' | 'cavalry' }[]>;
  setTrees: Setter<ResourceNode[]>;
  setWave: Setter<number>;
  setWaveAnnouncement: Setter<string | null>;
  setWavePreview: Setter<string | null>;
  setWorkers: Setter<WorkerState[]>;

  // ---------- state mirrors & timers (refs) ----------
  animationRef: Ref<number | null>;
  attackTimeoutsRef: Ref<Record<number, number>>;
  barnDmgThisWaveRef: Ref<number>;
  barracksTechRef: Ref<{ veteranTraining: boolean; warDrums: boolean }>;
  battleShoutUntilRef: Ref<number>;
  blacksmithUpgradesRef: Ref<{ steelEdge: number; ironHide: number }>;
  buildingAttackTimeoutsRef: Ref<Record<number, number>>;
  buildingRepairTimeoutsRef: Ref<Record<number, number>>;
  campClearedAtRef: Ref<Record<number, number>>;
  capturedShrinesRef: Ref<Set<number>>;
  creepAttackTimeoutsRef: Ref<Record<number, number>>;
  deadGruntPositionsRef: Ref<{ x: number; y: number; t: number }[]>;
  deadWorkerIdsRef: Ref<Set<number>>;
  dropItemIdRef: Ref<number>;
  droppedItemsRef: Ref<DroppedItem[]>;
  enemyBarnHpRef: Ref<number>;
  enemyGruntsRef: Ref<EnemyGrunt[]>;
  enemyNecromancersRef: Ref<EnemyNecromancer[]>;
  enemySappersRef: Ref<EnemySapper[]>;
  enemyShamansRef: Ref<EnemyShaman[]>;
  enemySiegeRef: Ref<EnemySiege[]>;
  enemyTowerTimersRef: Ref<Record<number, number>>;
  enemyTowersRef: Ref<EnemyTower[]>;
  enemyTrollsRef: Ref<EnemyTroll[]>;
  enemyWallIdRef: Ref<number>;
  enemyWallsRef: Ref<EnemyTower[]>;
  enemyWarchiefsRef: Ref<EnemyWarchief[]>;
  enemyWarlordsRef: Ref<EnemyWarlord[]>;
  enemyWitchDoctorsRef: Ref<EnemyWitchDoctor[]>;
  fogExploredRef: Ref<boolean[][]>;
  fogVisibleRef: Ref<boolean[][]>;
  gameOverRef: Ref<'victory' | 'defeat' | null>;
  gameSpeedRef: Ref<number>;
  garrisonedRef: Ref<WorkerState[]>;
  gatherTimeoutsRef: Ref<Record<number, number>>;
  goldMinesRef: Ref<ResourceNode[]>;
  gruntAttackTimeoutsRef: Ref<Record<number, number>>;
  gruntHitRef: Ref<Map<number, number>>;
  gruntIdRef: Ref<number>;
  guardTowerRef: Ref<boolean>;
  harvestBoonRef: Ref<boolean>;
  heroItemsRef: Ref<HeroItem[]>;
  incomeAccRef: Ref<{ gold: number; lumber: number; stone: number }>;
  isNightRef: Ref<boolean>;
  lastFogUpdateRef: Ref<number>;
  lastStandEnrageRef: Ref<boolean>;
  lootCrateIdRef: Ref<number>;
  lootCratesRef: Ref<LootCrate[]>;
  necromancerIdRef: Ref<number>;
  necromancerRaiseTimersRef: Ref<Record<number, number>>;
  neutralCreepsRef: Ref<NeutralCreep[]>;
  nextWaveAtRef: Ref<number | null>;
  pendingPickupRef: Ref<Set<number>>;
  placedBuildingsRef: Ref<PlacedBuilding[]>;
  playerBarnHpRef: Ref<number>;
  prevTimeRef: Ref<number | null>;
  previewTimerRef: Ref<number | null>;
  rallyPointRef: Ref<{ x: number; y: number } | null>;
  repairTimeoutsRef: Ref<Record<number, number>>;
  sallyForthThresholdsRef: Ref<Set<number>>;
  sapperIdRef: Ref<number>;
  sapperKillCountRef: Ref<number>;
  shamanHealTimersRef: Ref<Record<number, number>>;
  shamanIdRef: Ref<number>;
  shrineCapturingRef: Ref<{
    shrineId: number;
    workerId: number;
    startedAt: number;
  } | null>;
  shrinePlentyBuffRef: Ref<boolean>;
  shrineWarBuffRef: Ref<boolean>;
  siegeAttackTimeoutsRef: Ref<Record<number, number>>;
  siegeIdRef: Ref<number>;
  spawnTimerRef: Ref<number | null>;
  stanceRef: Ref<'aggressive' | 'passive'>;
  stoneNodesRef: Ref<ResourceNode[]>;
  towerGarrisonRef: Ref<Record<number, WorkerState[]>>;
  trainingElapsedRef: Ref<number>;
  trainingQueueRef: Ref<{ type: 'swordsman' | 'cavalry' }[]>;
  trapTriggeredRef: Ref<Record<number, number>>;
  treesRef: Ref<ResourceNode[]>;
  trollAttackTimersRef: Ref<Record<number, number>>;
  trollIdRef: Ref<number>;
  upgradesRef: Ref<Upgrades>;
  upkeepMultRef: Ref<number>;
  warchiefIdRef: Ref<number>;
  warlordIdRef: Ref<number>;
  watchtowerTimersRef: Ref<Record<number, number>>;
  waveRef: Ref<number>;
  waveTimerRemainingRef: Ref<number | null>;
  witchDoctorBuffTimersRef: Ref<Record<number, number>>;
  witchDoctorIdRef: Ref<number>;
  workerHitRef: Ref<Map<number, number>>;
  workersRef: Ref<WorkerState[]>;
}
