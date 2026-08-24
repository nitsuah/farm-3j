/**
 * Basic tick-coverage tests for enemy AI functions not yet tested.
 * Strategy: verify each tick function can be called with a minimal mock
 * context (empty unit arrays) without throwing, and invokes the expected
 * state setter at least once. Comprehensive path coverage lives in
 * integration/e2e tests — these ensure the functions are wired and reachable.
 */
import { describe, expect, it, vi } from 'vitest';

import { tickEnemyGrunts } from '../ai/tickEnemyGrunts';
import { tickEnemyLurkers } from '../ai/tickEnemyLurkers';
import { tickEnemyNecromancers } from '../ai/tickEnemyNecromancers';
import { tickEnemyShamans } from '../ai/tickEnemyShamans';
import { tickEnemySiege } from '../ai/tickEnemySiege';
import { tickEnemyTrolls } from '../ai/tickEnemyTrolls';
import { tickEnemyWarchiefs } from '../ai/tickEnemyWarchiefs';
import { tickEnemyWarlords } from '../ai/tickEnemyWarlords';
import { tickEnemyWitchDoctors } from '../ai/tickEnemyWitchDoctors';
import type { RTSGameContext } from '../context';

// ── Shared mock factory ───────────────────────────────────────────────────────

function ref<T>(val: T) {
  return { current: val };
}

function makeMockCtx(): RTSGameContext {
  return {
    difficulty: undefined,
    onAchievement: vi.fn(),
    addDmgLog: vi.fn(),
    addFloatingText: vi.fn(),
    addProjectile: vi.fn(),
    triggerShakeRef: ref(vi.fn()),
    triggerUnderAttackRef: ref(vi.fn()),

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

// ── tickEnemyGrunts ───────────────────────────────────────────────────────────

describe('tickEnemyGrunts', () => {
  it('does not throw with empty state', () => {
    const ctx = makeMockCtx();
    expect(() => tickEnemyGrunts(ctx, 1 / 60)).not.toThrow();
  });

  it('calls setEnemyGrunts once per tick', () => {
    const ctx = makeMockCtx();
    tickEnemyGrunts(ctx, 1 / 60);
    expect(ctx.setEnemyGrunts).toHaveBeenCalledTimes(1);
  });

  it('does not touch setGameOver when no grunts are attacking the barn', () => {
    const ctx = makeMockCtx();
    tickEnemyGrunts(ctx, 1 / 60);
    expect(ctx.setGameOver).not.toHaveBeenCalled();
  });
});

// ── tickEnemySiege ────────────────────────────────────────────────────────────

describe('tickEnemySiege', () => {
  it('does not throw with empty state', () => {
    const ctx = makeMockCtx();
    expect(() => tickEnemySiege(ctx, 1 / 60)).not.toThrow();
  });

  it('calls setEnemySiege once per tick', () => {
    const ctx = makeMockCtx();
    tickEnemySiege(ctx, 1 / 60);
    expect(ctx.setEnemySiege).toHaveBeenCalledTimes(1);
  });
});

// ── tickEnemyShamans ──────────────────────────────────────────────────────────

describe('tickEnemyShamans', () => {
  it('does not throw with empty state', () => {
    const ctx = makeMockCtx();
    expect(() => tickEnemyShamans(ctx, 1 / 60)).not.toThrow();
  });

  it('calls setEnemyShamans once per tick', () => {
    const ctx = makeMockCtx();
    tickEnemyShamans(ctx, 1 / 60);
    expect(ctx.setEnemyShamans).toHaveBeenCalledTimes(1);
  });
});

// ── tickEnemyNecromancers ─────────────────────────────────────────────────────

describe('tickEnemyNecromancers', () => {
  it('does not throw with empty state', () => {
    const ctx = makeMockCtx();
    expect(() => tickEnemyNecromancers(ctx, 1 / 60)).not.toThrow();
  });

  it('calls setEnemyNecromancers once per tick', () => {
    const ctx = makeMockCtx();
    tickEnemyNecromancers(ctx, 1 / 60);
    expect(ctx.setEnemyNecromancers).toHaveBeenCalledTimes(1);
  });
});

// ── tickEnemyWitchDoctors ─────────────────────────────────────────────────────

describe('tickEnemyWitchDoctors', () => {
  it('does not throw with empty state', () => {
    const ctx = makeMockCtx();
    expect(() => tickEnemyWitchDoctors(ctx, 1 / 60)).not.toThrow();
  });

  it('calls setEnemyWitchDoctors once per tick', () => {
    const ctx = makeMockCtx();
    tickEnemyWitchDoctors(ctx, 1 / 60);
    expect(ctx.setEnemyWitchDoctors).toHaveBeenCalledTimes(1);
  });
});

// ── tickEnemyWarchiefs ────────────────────────────────────────────────────────

describe('tickEnemyWarchiefs', () => {
  it('does not throw with empty state', () => {
    const ctx = makeMockCtx();
    expect(() => tickEnemyWarchiefs(ctx, 1 / 60)).not.toThrow();
  });

  it('calls setEnemyWarchiefs once per tick', () => {
    const ctx = makeMockCtx();
    tickEnemyWarchiefs(ctx, 1 / 60);
    expect(ctx.setEnemyWarchiefs).toHaveBeenCalledTimes(1);
  });
});

// ── tickEnemyWarlords ─────────────────────────────────────────────────────────

describe('tickEnemyWarlords', () => {
  it('does not throw with empty state', () => {
    const ctx = makeMockCtx();
    expect(() => tickEnemyWarlords(ctx, 1 / 60)).not.toThrow();
  });

  it('calls setEnemyWarlords once per tick', () => {
    const ctx = makeMockCtx();
    tickEnemyWarlords(ctx, 1 / 60);
    expect(ctx.setEnemyWarlords).toHaveBeenCalledTimes(1);
  });
});

// ── tickEnemyLurkers ──────────────────────────────────────────────────────────

describe('tickEnemyLurkers', () => {
  it('does not throw with empty state', () => {
    const ctx = makeMockCtx();
    const lurkerKillCountRef = { current: 0 };
    expect(() =>
      tickEnemyLurkers(ctx, 1 / 60, lurkerKillCountRef)
    ).not.toThrow();
  });

  it('calls setEnemyLurkers once per tick', () => {
    const ctx = makeMockCtx();
    const lurkerKillCountRef = { current: 0 };
    tickEnemyLurkers(ctx, 1 / 60, lurkerKillCountRef);
    expect(ctx.setEnemyLurkers).toHaveBeenCalledTimes(1);
  });

  it('does not modify lurkerKillCountRef when no lurkers are present', () => {
    const ctx = makeMockCtx();
    const lurkerKillCountRef = { current: 0 };
    tickEnemyLurkers(ctx, 1 / 60, lurkerKillCountRef);
    expect(lurkerKillCountRef.current).toBe(0);
  });
});

// ── tickEnemyTrolls ───────────────────────────────────────────────────────────

describe('tickEnemyTrolls', () => {
  it('does not throw with empty state', () => {
    const ctx = makeMockCtx();
    expect(() => tickEnemyTrolls(ctx, 1 / 60)).not.toThrow();
  });

  it('calls setEnemyTrolls once per tick', () => {
    const ctx = makeMockCtx();
    tickEnemyTrolls(ctx, 1 / 60);
    expect(ctx.setEnemyTrolls).toHaveBeenCalledTimes(1);
  });
});
