import { describe, it, expect } from 'vitest';
import {
  isNodeBeingGathered,
  getCompletedBuildings,
  hasBuildingType,
  getActiveNodes,
  getWallTileSet,
} from '../mapSelectors';
import type { PlacedBuilding, WorkerState, ResourceNode } from '../types';

// ── Factories ─────────────────────────────────────────────────────────────────

function makeBuilding(
  overrides: Partial<PlacedBuilding> & Pick<PlacedBuilding, 'id' | 'type'>
): PlacedBuilding {
  return {
    x: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    constructing: false,
    ...overrides,
  };
}

/** Minimal WorkerState factory — fills in all required fields. */
function makeWorker(
  id: number,
  gathering: WorkerState['gathering'] = null
): WorkerState {
  return {
    id,
    x: 0,
    y: 0,
    selected: false,
    movingTo: null,
    path: [],
    gathering,
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
    level: 1,
  };
}

function makeNode(amount: number, x = 0, y = 0): ResourceNode {
  return { x, y, amount };
}

// ── isNodeBeingGathered ───────────────────────────────────────────────────────

describe('isNodeBeingGathered', () => {
  it('returns false when no workers are gathering', () => {
    const workers = [makeWorker(1), makeWorker(2)];
    expect(isNodeBeingGathered(workers, 'tree', 0)).toBe(false);
  });

  it('returns false when a worker gathers a different node type', () => {
    const workers = [makeWorker(1, { type: 'gold', idx: 0 })];
    expect(isNodeBeingGathered(workers, 'tree', 0)).toBe(false);
  });

  it('returns false when a worker gathers the right type but wrong index', () => {
    const workers = [makeWorker(1, { type: 'tree', idx: 2 })];
    expect(isNodeBeingGathered(workers, 'tree', 0)).toBe(false);
  });

  it('returns true when a worker matches both type and index', () => {
    const workers = [
      makeWorker(1, { type: 'stone', idx: 1 }),
      makeWorker(2, { type: 'tree', idx: 0 }),
    ];
    expect(isNodeBeingGathered(workers, 'tree', 0)).toBe(true);
  });

  it('returns true when multiple workers gather the same node', () => {
    const workers = [
      makeWorker(1, { type: 'gold', idx: 3 }),
      makeWorker(2, { type: 'gold', idx: 3 }),
    ];
    expect(isNodeBeingGathered(workers, 'gold', 3)).toBe(true);
  });
});

// ── getCompletedBuildings ─────────────────────────────────────────────────────

describe('getCompletedBuildings', () => {
  it('returns all buildings when none are constructing', () => {
    const buildings = [
      makeBuilding({ id: 1, type: 'farmhouse' }),
      makeBuilding({ id: 2, type: 'barracks' }),
    ];
    expect(getCompletedBuildings(buildings)).toHaveLength(2);
  });

  it('excludes buildings still under construction', () => {
    const buildings = [
      makeBuilding({ id: 1, type: 'farmhouse' }),
      makeBuilding({ id: 2, type: 'barracks', constructing: true }),
    ];
    const result = getCompletedBuildings(buildings);
    expect(result).toHaveLength(1);
    expect(result.at(0)?.id).toBe(1);
  });

  it('returns empty array when all buildings are constructing', () => {
    const buildings = [
      makeBuilding({ id: 1, type: 'wall', constructing: true }),
    ];
    expect(getCompletedBuildings(buildings)).toHaveLength(0);
  });

  it('returns empty array for an empty list', () => {
    expect(getCompletedBuildings([])).toHaveLength(0);
  });
});

// ── hasBuildingType ───────────────────────────────────────────────────────────

describe('hasBuildingType', () => {
  it('returns false when no buildings exist', () => {
    expect(hasBuildingType([], 'barracks')).toBe(false);
  });

  it('returns false when the type is not present', () => {
    const buildings = [makeBuilding({ id: 1, type: 'farmhouse' })];
    expect(hasBuildingType(buildings, 'barracks')).toBe(false);
  });

  it('returns true when a completed building of the type exists', () => {
    const buildings = [makeBuilding({ id: 1, type: 'barracks' })];
    expect(hasBuildingType(buildings, 'barracks')).toBe(true);
  });

  it('returns false when the matching building is still constructing', () => {
    const buildings = [
      makeBuilding({ id: 1, type: 'barracks', constructing: true }),
    ];
    expect(hasBuildingType(buildings, 'barracks')).toBe(false);
  });
});

// ── getActiveNodes ────────────────────────────────────────────────────────────

describe('getActiveNodes', () => {
  it('returns all nodes that have amount > 0', () => {
    const nodes = [makeNode(5), makeNode(0), makeNode(10)];
    expect(getActiveNodes(nodes)).toHaveLength(2);
  });

  it('returns an empty array when all nodes are depleted', () => {
    const nodes = [makeNode(0), makeNode(0)];
    expect(getActiveNodes(nodes)).toHaveLength(0);
  });

  it('returns an empty array for an empty list', () => {
    expect(getActiveNodes([])).toHaveLength(0);
  });

  it('excludes nodes with amount exactly 0', () => {
    const node = makeNode(0);
    expect(getActiveNodes([node])).toHaveLength(0);
  });
});

// ── getWallTileSet ────────────────────────────────────────────────────────────

describe('getWallTileSet', () => {
  it('returns an empty set for an empty list', () => {
    expect(getWallTileSet([])).toEqual(new Set());
  });

  it('excludes non-wall buildings', () => {
    const buildings = [
      makeBuilding({ id: 1, type: 'farmhouse', x: 1, y: 1 }),
      makeBuilding({ id: 2, type: 'barracks', x: 2, y: 2 }),
    ];
    expect(getWallTileSet(buildings).size).toBe(0);
  });

  it('includes completed walls', () => {
    const buildings = [
      makeBuilding({ id: 1, type: 'wall', x: 3, y: 4 }),
      makeBuilding({ id: 2, type: 'wall', x: 7, y: 2 }),
    ];
    const set = getWallTileSet(buildings);
    expect(set.size).toBe(2);
    expect(set.has('3,4')).toBe(true);
    expect(set.has('7,2')).toBe(true);
  });

  it('includes walls still under construction (they block pathfinding immediately)', () => {
    const buildings = [
      makeBuilding({ id: 1, type: 'wall', x: 5, y: 5, constructing: true }),
      makeBuilding({ id: 2, type: 'wall', x: 6, y: 6 }),
    ];
    const set = getWallTileSet(buildings);
    expect(set.size).toBe(2);
    expect(set.has('5,5')).toBe(true);
    expect(set.has('6,6')).toBe(true);
  });
});
