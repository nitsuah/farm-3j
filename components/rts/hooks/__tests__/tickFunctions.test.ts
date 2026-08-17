import { describe, it, expect, vi } from 'vitest';
import { tickWorkers } from '../ai/tickWorkers';
import { tickNeutralCreeps } from '../ai/tickNeutralCreeps';
import { tickEnemySappers } from '../ai/tickEnemySappers';
import type { RTSGameContext } from '../context';

import type { WorkerState } from '../../game/types';

function makeWorker(overrides: Partial<WorkerState> = {}): WorkerState {
  return {
    id: 1,
    x: 5,
    y: 5,
    selected: false,
    movingTo: null,
    path: [],
    gathering: null,
    attacking: null,
    repairing: null,
    chargeCooldown: 0,
    sprintCooldown: 0,
    sprinting: false,
    waypoints: [],
    attackMove: false,
    attackMoveTarget: null,
    carrying: { gold: 0, lumber: 0, stone: 0 },
    state: 'idle',
    group: null,
    hp: 100,
    maxHp: 100,
    patrol: null,
    holdPosition: false,
    unitType: 'farmer',
    xp: 0,
    level: 0,
    ...overrides,
  };
}

// Build a minimal mock RTSGameContext for testing tick functions.
// All setters are no-ops; all refs hold safe empty defaults.
function makeMockCtx(): RTSGameContext {
  const ref = <T>(val: T) => ({ current: val });
  const fn = () => vi.fn();
  return {
    difficulty: undefined,

    // callbacks
    onAchievement: vi.fn(),
    addDmgLog: vi.fn(),
    addFloatingText: vi.fn(),
    addProjectile: vi.fn(),
    triggerShakeRef: ref(vi.fn()),
    triggerUnderAttackRef: ref(vi.fn()),

    // reactive values (unused by tick functions; here for type-safety)
    enemyTowers: [],
    farmhouse: { built: false, level: 0 },
    gameOver: null,
    gameSpeed: 1,
    garrisoned: [],
    placedBuildings: [],
    stance: 'aggressive',
    tiles: [],
    wave: 1,
    workers: [],

    // setters
    setCapturedShrines: vi.fn(),
    setClearedCamps: vi.fn(),
    setDeadGruntPositions: vi.fn(),
    setDeadWorkerPositions: vi.fn(),
    setDroppedItems: vi.fn(),
    setEnemyBarnHp: vi.fn(),
    setEnemyGrunts: vi.fn(),
    setEnemyNecromancers: vi.fn(),
    setEnemySappers: vi.fn(),
    setEnemyShamans: vi.fn(),
    setEnemySiege: vi.fn(),
    setEnemyTowers: vi.fn(),
    setEnemyTrolls: vi.fn(),
    setEnemyWalls: vi.fn(),
    setEnemyWarchiefs: vi.fn(),
    setEnemyLurkers: vi.fn(),
    setEnemyWarlords: vi.fn(),
    setEnemyWitchDoctors: vi.fn(),
    setFogExplored: vi.fn(),
    setFogVisible: vi.fn(),
    setGameOver: vi.fn(),
    setGarrisoned: vi.fn(),
    setGoldMines: vi.fn(),
    setHeroItems: vi.fn(),
    setKillCount: vi.fn(),
    setLootCrates: vi.fn(),
    setNeutralCreeps: vi.fn(),
    setNextWaveAt: vi.fn(),
    setPlacedBuildings: vi.fn(),
    setPlayerBarnHp: vi.fn(),
    setResources: vi.fn(),
    setShrineCapturing: vi.fn(),
    setShrinePlentyBuff: vi.fn(),
    setShrineWarBuff: vi.fn(),
    setStoneNodes: vi.fn(),
    setTotalGold: vi.fn(),
    setTotalLumber: vi.fn(),
    setTotalStone: vi.fn(),
    setTrainingProgress: vi.fn(),
    setTrainingQueue: vi.fn(),
    setTrees: vi.fn(),
    setWave: vi.fn(),
    setWaveAnnouncement: vi.fn(),
    setWavePreview: vi.fn(),
    setWorkers: vi.fn(),

    // refs
    animationRef: ref(null),
    attackTimeoutsRef: ref({}),
    barnDmgThisWaveRef: ref(0),
    barracksTechRef: ref({ veteranTraining: false, warDrums: false }),
    battleShoutUntilRef: ref(0),
    blacksmithUpgradesRef: ref({ steelEdge: 0, ironHide: 0 }),
    buildingAttackTimeoutsRef: ref({}),
    buildingRepairTimeoutsRef: ref({}),
    campClearedAtRef: ref({}),
    capturedShrinesRef: ref(new Set<number>()),
    creepAttackTimeoutsRef: ref({}),
    deadGruntPositionsRef: ref([]),
    deadWorkerIdsRef: ref(new Set<number>()),
    dropItemIdRef: ref(0),
    droppedItemsRef: ref([]),
    enemyBarnHpRef: ref(1000),
    enemyGruntsRef: ref([]),
    enemyNecromancersRef: ref([]),
    enemySappersRef: ref([]),
    enemyShamansRef: ref([]),
    enemySiegeRef: ref([]),
    enemyTowerTimersRef: ref({}),
    enemyTowersRef: ref([]),
    enemyTrollsRef: ref([]),
    enemyWallIdRef: ref(0),
    enemyWallsRef: ref([]),
    enemyLurkersRef: ref([]),
    lurkerAttackTimeoutsRef: ref({}),
    lurkerIdRef: ref(0),
    enemyWarchiefsRef: ref([]),
    enemyWarlordsRef: ref([]),
    enemyWitchDoctorsRef: ref([]),
    fogExploredRef: ref([]),
    fogVisibleRef: ref([]),
    gameOverRef: ref(null),
    gameSpeedRef: ref(1),
    garrisonedRef: ref([]),
    gatherTimeoutsRef: ref({}),
    goldMinesRef: ref([]),
    gruntAttackTimeoutsRef: ref({}),
    gruntHitRef: ref(new Map<number, number>()),
    gruntIdRef: ref(0),
    guardTowerRef: ref(false),
    harvestBoonRef: ref(false),
    heroItemsRef: ref([]),
    incomeAccRef: ref({ gold: 0, lumber: 0, stone: 0 }),
    isNightRef: ref(false),
    lastFogUpdateRef: ref(0),
    lastStandEnrageRef: ref(false),
    lootCrateIdRef: ref(0),
    lootCratesRef: ref([]),
    necromancerIdRef: ref(0),
    necromancerRaiseTimersRef: ref({}),
    neutralCreepsRef: ref([]),
    nextWaveAtRef: ref(null),
    pendingPickupRef: ref(new Set<number>()),
    placedBuildingsRef: ref([]),
    playerBarnHpRef: ref(200),
    prevTimeRef: ref(null),
    previewTimerRef: ref(null),
    rallyPointRef: ref(null),
    repairTimeoutsRef: ref({}),
    sallyForthThresholdsRef: ref(new Set<number>()),
    sapperIdRef: ref(0),
    sapperKillCountRef: ref(0),
    shamanHealTimersRef: ref({}),
    shamanIdRef: ref(0),
    shrineCapturingRef: ref(null),
    shrinePlentyBuffRef: ref(false),
    shrineWarBuffRef: ref(false),
    siegeAttackTimeoutsRef: ref({}),
    siegeIdRef: ref(0),
    spawnTimerRef: ref(null),
    stanceRef: ref('aggressive' as const),
    stoneNodesRef: ref([]),
    towerGarrisonRef: ref({}),
    trainingElapsedRef: ref(0),
    trainingQueueRef: ref([]),
    trapTriggeredRef: ref({}),
    treesRef: ref([]),
    trollAttackTimersRef: ref({}),
    trollIdRef: ref(0),
    upgradesRef: ref({ sharperTools: 0, swiftHarvest: 0, ironWill: 0 }),
    upkeepMultRef: ref(1),
    warchiefIdRef: ref(0),
    warlordIdRef: ref(0),
    watchtowerTimersRef: ref({}),
    waveRef: ref(1),
    waveTimerRemainingRef: ref(null),
    witchDoctorBuffTimersRef: ref({}),
    witchDoctorIdRef: ref(0),
    workerHitRef: ref(new Map<number, number>()),
    workersRef: ref([]),
  } satisfies RTSGameContext;
}

describe('tickWorkers', () => {
  it('returns an empty array when given no workers', () => {
    const ctx = makeMockCtx();
    const result = tickWorkers([], ctx, 1 / 60);
    expect(result).toEqual([]);
  });

  it('removes dead workers (hp ≤ 0) from the returned array', () => {
    const ctx = makeMockCtx();
    const deadWorker = makeWorker({ id: 1, hp: 0 });
    ctx.workersRef.current = [deadWorker];
    const result = tickWorkers([deadWorker], ctx, 1 / 60);
    // tickWorkers filters out dead workers from the live list
    expect(result.find(w => w.id === 1)).toBeUndefined();
  });

  it('does not modify worker hp when worker is idle with no threats', () => {
    const ctx = makeMockCtx();
    const worker = makeWorker({ id: 2, x: 10, y: 10, hp: 100 });
    ctx.workersRef.current = [worker];
    const result = tickWorkers([worker], ctx, 1 / 60);
    const found = result.find(w => w.id === 2);
    expect(found).toBeDefined();
    expect(found!.hp).toBe(100);
  });
});

describe('tickNeutralCreeps', () => {
  it('calls setNeutralCreeps once per tick', () => {
    const ctx = makeMockCtx();
    tickNeutralCreeps(ctx, 1 / 60);
    expect(ctx.setNeutralCreeps).toHaveBeenCalledTimes(1);
  });

  it('does not call setClearedCamps when no creeps are killed', () => {
    const ctx = makeMockCtx();
    tickNeutralCreeps(ctx, 1 / 60);
    expect(ctx.setClearedCamps).not.toHaveBeenCalled();
  });
});

describe('tickEnemySappers', () => {
  it('calls setEnemySappers once per tick', () => {
    const ctx = makeMockCtx();
    const sapperWarnedRef = { current: new Set<number>() };
    tickEnemySappers(ctx, 1 / 60, sapperWarnedRef);
    expect(ctx.setEnemySappers).toHaveBeenCalledTimes(1);
  });

  it('does not award gold when there are no sappers', () => {
    const ctx = makeMockCtx();
    const sapperWarnedRef = { current: new Set<number>() };
    tickEnemySappers(ctx, 1 / 60, sapperWarnedRef);
    expect(ctx.setResources).not.toHaveBeenCalled();
  });

  it('preserves sapperWarnedRef across calls', () => {
    const ctx = makeMockCtx();
    const sapperWarnedRef = { current: new Set<number>([42]) };
    tickEnemySappers(ctx, 1 / 60, sapperWarnedRef);
    // ref should still hold our pre-seeded id
    expect(sapperWarnedRef.current.has(42)).toBe(true);
  });
});
