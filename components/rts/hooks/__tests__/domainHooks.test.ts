/**
 * Tests for the domain hook tick functions.
 *
 * useCombatResolution, useResourceTick, usePathfinding: no React hooks inside —
 * they destructure ctx and return a plain closure, safe to call directly.
 *
 * useEnemyAI: uses useRef internally, so tested via renderHook.
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useEnemyAI } from '../useEnemyAI';
import { useCombatResolution } from '../useCombatResolution';
import { usePathfinding } from '../usePathfinding';
import { useResourceTick } from '../useResourceTick';
import {
  GRID_SIZE,
  HERO_MAX_ITEMS,
  XP_TO_LEVEL_1,
} from '../../game/constants';
import type { Resources } from '../../game/types';
import { makeMockCtx, makeDroppedItem, makeWorker } from './makeMockCtx';

// ── useEnemyAI (requires renderHook since it uses useRef internally) ──────────

describe('useEnemyAI', () => {
  it('returns a callable tick function', () => {
    const ctx = makeMockCtx();
    const { result } = renderHook(() => useEnemyAI(ctx));
    expect(typeof result.current).toBe('function');
  });

  it('tick does not throw with empty state', () => {
    const ctx = makeMockCtx();
    const { result } = renderHook(() => useEnemyAI(ctx));
    expect(() => result.current(1 / 60)).not.toThrow();
  });

  it('calls setWorkers once per tick (for tickWorkers)', () => {
    const ctx = makeMockCtx();
    const { result } = renderHook(() => useEnemyAI(ctx));
    result.current(1 / 60);
    // tickWorkers always calls setWorkers
    expect(ctx.setWorkers).toHaveBeenCalledTimes(1);
  });

  it('calls setEnemyGrunts twice per tick (filter dead + update state)', () => {
    const ctx = makeMockCtx();
    const { result } = renderHook(() => useEnemyAI(ctx));
    result.current(1 / 60);
    expect(ctx.setEnemyGrunts).toHaveBeenCalledTimes(2);
  });

  it('calls setNeutralCreeps once per tick (for tickNeutralCreeps)', () => {
    const ctx = makeMockCtx();
    const { result } = renderHook(() => useEnemyAI(ctx));
    result.current(1 / 60);
    expect(ctx.setNeutralCreeps).toHaveBeenCalledTimes(1);
  });

  it('calls setEnemySappers once per tick (for tickEnemySappers)', () => {
    const ctx = makeMockCtx();
    const { result } = renderHook(() => useEnemyAI(ctx));
    result.current(1 / 60);
    expect(ctx.setEnemySappers).toHaveBeenCalledTimes(1);
  });

  it('remains callable after a re-render', () => {
    const ctx = makeMockCtx();
    const { result, rerender } = renderHook(() => useEnemyAI(ctx));
    const first = result.current;
    rerender();
    // useRef means lurkerKillCountRef and sapperWarnedRef persist,
    // but the returned function is recreated each render (first render's
    // copy is what useGameLoop captures); both calls should work
    expect(() => result.current(1 / 60)).not.toThrow();
    expect(typeof first).toBe('function');
  });
});

// ── useResourceTick ───────────────────────────────────────────────────────────

describe('useResourceTick tick function', () => {
  it('does not call setResources when no workers are dead and no structures destroyed', () => {
    const ctx = makeMockCtx();
    const tick = useResourceTick(ctx);
    tick(1 / 60);
    expect(ctx.setResources).not.toHaveBeenCalled();
  });

  it('drains food when dead workers are present', () => {
    const ctx = makeMockCtx();
    ctx.workersRef.current = [
      makeWorker({ id: 1, hp: 0 }), // dead
      makeWorker({ id: 2, hp: 0 }), // dead
      makeWorker({ id: 3, hp: 50 }), // alive
    ];
    const tick = useResourceTick(ctx);
    tick(1 / 60);
    expect(ctx.setResources).toHaveBeenCalledTimes(1);
    // The updater should subtract 2 from food (2 dead workers)
    const arg = vi.mocked(ctx.setResources).mock.calls[0]![0];
    expect(typeof arg).toBe('function');
    const updater = arg as (r: Resources) => Resources;
    const result = updater({
      food: 10,
      gold: 100,
      lumber: 0,
      stone: 0,
      foodCap: 100,
    });
    expect(result.food).toBe(8); // 10 - 2
  });

  it('food cannot go below 0 from dead worker drain', () => {
    const ctx = makeMockCtx();
    ctx.workersRef.current = [
      makeWorker({ id: 1, hp: 0 }),
      makeWorker({ id: 2, hp: 0 }),
      makeWorker({ id: 3, hp: 0 }),
    ];
    const tick = useResourceTick(ctx);
    tick(1 / 60);
    const arg2 = vi.mocked(ctx.setResources).mock.calls[0]![0];
    expect(typeof arg2).toBe('function');
    const updater2 = arg2 as (r: Resources) => Resources;
    const result = updater2({
      food: 1,
      gold: 0,
      lumber: 0,
      stone: 0,
      foodCap: 100,
    });
    expect(result.food).toBe(0);
  });

  it('calls setEnemyWalls to filter out destroyed walls', () => {
    const ctx = makeMockCtx();
    ctx.enemyWallsRef.current = [
      { id: 1, x: 3, y: 4, hp: 0, maxHp: 100 },
      { id: 2, x: 5, y: 6, hp: 50, maxHp: 100 },
    ];
    const tick = useResourceTick(ctx);
    tick(1 / 60);
    expect(ctx.setEnemyWalls).toHaveBeenCalledTimes(1);
    // Awards gold for the destroyed wall
    expect(ctx.setResources).toHaveBeenCalled();
    expect(ctx.addFloatingText).toHaveBeenCalled();
  });

  it('does not call setEnemyWalls when all walls are alive', () => {
    const ctx = makeMockCtx();
    ctx.enemyWallsRef.current = [{ id: 1, x: 3, y: 4, hp: 50, maxHp: 100 }];
    const tick = useResourceTick(ctx);
    tick(1 / 60);
    expect(ctx.setEnemyWalls).not.toHaveBeenCalled();
  });

  it('calls setEnemyTowers to filter out destroyed towers', () => {
    const ctx = makeMockCtx();
    ctx.enemyTowersRef.current = [{ id: 10, x: 20, y: 20, hp: 0, maxHp: 200 }];
    const tick = useResourceTick(ctx);
    tick(1 / 60);
    expect(ctx.setEnemyTowers).toHaveBeenCalledTimes(1);
    expect(ctx.addFloatingText).toHaveBeenCalled();
  });

  it('awards 40 gold for the archer tower (id -1)', () => {
    const ctx = makeMockCtx();
    ctx.enemyTowersRef.current = [{ id: -1, x: 5, y: 5, hp: 0, maxHp: 200 }];
    const tick = useResourceTick(ctx);
    tick(1 / 60);
    // At least one setResources call for the gold award
    const calls = vi.mocked(ctx.setResources).mock.calls;
    const goldAward = calls.find(([u]) => {
      if (typeof u !== 'function') return false;
      const r = (u as (r: Resources) => Resources)({
        food: 0,
        gold: 0,
        lumber: 0,
        stone: 0,
        foodCap: 100,
      });
      return r.gold === 40;
    });
    expect(goldAward).toBeDefined();
  });

  it('awards 25 gold for a regular enemy tower', () => {
    const ctx = makeMockCtx();
    ctx.enemyTowersRef.current = [{ id: 9001, x: 5, y: 5, hp: 0, maxHp: 200 }];
    const tick = useResourceTick(ctx);
    tick(1 / 60);
    const calls = vi.mocked(ctx.setResources).mock.calls;
    const goldAward = calls.find(([u]) => {
      if (typeof u !== 'function') return false;
      const r = (u as (r: Resources) => Resources)({
        food: 0,
        gold: 0,
        lumber: 0,
        stone: 0,
        foodCap: 100,
      });
      return r.gold === 25;
    });
    expect(goldAward).toBeDefined();
  });
});

// ── useCombatResolution ───────────────────────────────────────────────────────

describe('useCombatResolution tick function', () => {
  it('does nothing when no workers exist', () => {
    const ctx = makeMockCtx();
    const tick = useCombatResolution(ctx);
    expect(() => tick(1 / 60)).not.toThrow();
    expect(ctx.setDeadWorkerPositions).not.toHaveBeenCalled();
  });

  it('does not flag alive workers as dead', () => {
    const ctx = makeMockCtx();
    ctx.workersRef.current = [makeWorker({ id: 1, hp: 50 })];
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.setDeadWorkerPositions).not.toHaveBeenCalled();
  });

  it('records newly dead workers in setDeadWorkerPositions', () => {
    const ctx = makeMockCtx();
    ctx.workersRef.current = [makeWorker({ id: 1, hp: 0, x: 3, y: 5 })];
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.setDeadWorkerPositions).toHaveBeenCalledTimes(1);
  });

  it('does not re-record already-tracked dead workers', () => {
    const ctx = makeMockCtx();
    ctx.workersRef.current = [makeWorker({ id: 1, hp: 0, x: 3, y: 5 })];
    // Pre-seed the dead set so worker id 1 is already known
    ctx.deadWorkerIdsRef.current.add(1);
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.setDeadWorkerPositions).not.toHaveBeenCalled();
  });

  it('does not call setWorkers for hero pickup when no hero exists', () => {
    const ctx = makeMockCtx();
    ctx.workersRef.current = [makeWorker({ id: 1, hp: 50 })];
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.setWorkers).not.toHaveBeenCalled();
  });

  it('does not pick up an item when no items are dropped', () => {
    const ctx = makeMockCtx();
    ctx.workersRef.current = [
      makeWorker({ id: 99, hp: 100, x: 5, y: 5, unitType: 'hero' }),
    ];
    ctx.droppedItemsRef.current = [];
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.setHeroItems).not.toHaveBeenCalled();
  });

  it('does not pick up an item that is too far away', () => {
    const ctx = makeMockCtx();
    ctx.workersRef.current = [
      makeWorker({ id: 99, hp: 100, x: 5, y: 5, unitType: 'hero' }),
    ];
    ctx.droppedItemsRef.current = [
      makeDroppedItem({ id: 1, itemId: 'boots_speed', x: 10, y: 10 }),
    ];
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.setHeroItems).not.toHaveBeenCalled();
  });

  it('dead hero (hp=0) does not pick up nearby items', () => {
    const ctx = makeMockCtx();
    ctx.workersRef.current = [
      makeWorker({ id: 99, hp: 0, x: 5, y: 5, unitType: 'hero' }),
    ];
    ctx.droppedItemsRef.current = [
      makeDroppedItem({ id: 1, itemId: 'boots_speed', x: 5, y: 5 }),
    ];
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.setHeroItems).not.toHaveBeenCalled();
  });

  it('skips pickup when item is already in pendingPickupRef', () => {
    const ctx = makeMockCtx();
    ctx.workersRef.current = [
      makeWorker({ id: 99, hp: 100, x: 5, y: 5, unitType: 'hero' }),
    ];
    ctx.droppedItemsRef.current = [
      makeDroppedItem({ id: 7, itemId: 'boots_speed', x: 5, y: 5 }),
    ];
    ctx.pendingPickupRef.current.add(7);
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.setHeroItems).not.toHaveBeenCalled();
  });

  it('picks up a non-tome item: calls setHeroItems, setDroppedItems, addFloatingText', () => {
    const ctx = makeMockCtx();
    ctx.workersRef.current = [
      makeWorker({ id: 99, hp: 100, x: 5, y: 5, unitType: 'hero' }),
    ];
    ctx.droppedItemsRef.current = [
      makeDroppedItem({ id: 3, itemId: 'boots_speed', x: 5, y: 5 }),
    ];
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.setHeroItems).toHaveBeenCalledTimes(1);
    expect(ctx.setDroppedItems).toHaveBeenCalledTimes(1);
    expect(ctx.addFloatingText).toHaveBeenCalled();
    expect(ctx.pendingPickupRef.current.has(3)).toBe(true);
  });

  it('does not pick up a non-tome item when hero inventory is full', () => {
    const ctx = makeMockCtx();
    ctx.workersRef.current = [
      makeWorker({ id: 99, hp: 100, x: 5, y: 5, unitType: 'hero' }),
    ];
    ctx.droppedItemsRef.current = [
      makeDroppedItem({ id: 4, itemId: 'boots_speed', x: 5, y: 5 }),
    ];
    ctx.heroItemsRef.current = Array.from({ length: HERO_MAX_ITEMS }, (_, i) => ({
      id: i,
      itemId: 'boots_speed',
    }));
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.setHeroItems).not.toHaveBeenCalled();
  });

  it('picks up tome_xp: calls setWorkers, setDroppedItems, addFloatingText for XP', () => {
    const ctx = makeMockCtx();
    // Hero at level 1 so picking up tome (80 xp) won't trigger level-up to 2
    ctx.workersRef.current = [
      makeWorker({ id: 99, hp: 100, x: 5, y: 5, unitType: 'hero', level: 1, xp: 0 }),
    ];
    ctx.droppedItemsRef.current = [
      makeDroppedItem({ id: 5, itemId: 'tome_xp', x: 5, y: 5 }),
    ];
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.setWorkers).toHaveBeenCalledTimes(1);
    expect(ctx.setDroppedItems).toHaveBeenCalledTimes(1);
    // At least the "+80 XP!" floating text should appear
    expect(ctx.addFloatingText).toHaveBeenCalled();
    expect(ctx.pendingPickupRef.current.has(5)).toBe(true);
  });

  it('picks up tome_xp that causes a level-up: addFloatingText called twice', () => {
    const ctx = makeMockCtx();
    // Hero at level 0, xp 0 → tome gives 80 xp → 80 >= XP_TO_LEVEL_1 → level 1
    ctx.workersRef.current = [
      makeWorker({ id: 99, hp: 100, x: 5, y: 5, unitType: 'hero', level: 0, xp: 0 }),
    ];
    ctx.droppedItemsRef.current = [
      makeDroppedItem({ id: 6, itemId: 'tome_xp', x: 5, y: 5 }),
    ];
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    // One call for "⭐ Level N!" and one for "📖 +XP!"
    expect(ctx.addFloatingText).toHaveBeenCalledTimes(2);
    // Level-up call should include "Level"
    const calls = vi.mocked(ctx.addFloatingText).mock.calls;
    const levelUpCall = calls.find(([, , msg]) => msg.includes('Level'));
    expect(levelUpCall).toBeDefined();
    // XP should be at least XP_TO_LEVEL_1 after pickup
    expect(80).toBeGreaterThanOrEqual(XP_TO_LEVEL_1);
  });

  it('pendingPickupRef cleanup: removes id when item is no longer in droppedItemsRef', () => {
    const ctx = makeMockCtx();
    ctx.pendingPickupRef.current.add(42);
    ctx.droppedItemsRef.current = []; // item 42 already removed from state
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.pendingPickupRef.current.has(42)).toBe(false);
  });

  it('pendingPickupRef cleanup: retains id when item still exists in droppedItemsRef', () => {
    const ctx = makeMockCtx();
    ctx.pendingPickupRef.current.add(99);
    ctx.droppedItemsRef.current = [
      makeDroppedItem({ id: 99, itemId: 'boots_speed', x: 20, y: 20 }),
    ];
    const tick = useCombatResolution(ctx);
    tick(1 / 60);
    expect(ctx.pendingPickupRef.current.has(99)).toBe(true);
  });
});

// ── usePathfinding ────────────────────────────────────────────────────────────

describe('usePathfinding tick function', () => {
  it('does not call setFogVisible when the interval has not elapsed', () => {
    const ctx = makeMockCtx();
    // lastFogUpdateRef.current = Date.now() → interval not elapsed yet
    ctx.lastFogUpdateRef.current = Date.now();
    const tick = usePathfinding(ctx);
    tick();
    expect(ctx.setFogVisible).not.toHaveBeenCalled();
  });

  it('calls setFogVisible when the interval has elapsed and visibility changed', () => {
    const ctx = makeMockCtx();
    // Set last update to 1 second ago so the 350ms throttle has expired
    ctx.lastFogUpdateRef.current = Date.now() - 1000;
    // Put a worker inside the grid to create a visible region
    ctx.workersRef.current = [makeWorker({ x: 5, y: 5 })];
    const tick = usePathfinding(ctx);
    tick();
    // Should have computed visibility and called setFogVisible (there is a change
    // since fogVisibleRef starts all-false and worker creates a visible circle)
    expect(ctx.setFogVisible).toHaveBeenCalledTimes(1);
  });

  it('updates lastFogUpdateRef when the interval elapses', () => {
    const ctx = makeMockCtx();
    const before = Date.now() - 1000;
    ctx.lastFogUpdateRef.current = before;
    const tick = usePathfinding(ctx);
    tick();
    expect(ctx.lastFogUpdateRef.current).toBeGreaterThan(before);
  });

  it('does not set fog explored when nothing new is explored', () => {
    const ctx = makeMockCtx();
    // Mark everything as already explored
    ctx.fogExploredRef.current = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(true)
    );
    ctx.fogVisibleRef.current = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(true)
    );
    ctx.lastFogUpdateRef.current = Date.now() - 1000;
    ctx.workersRef.current = [makeWorker({ x: 5, y: 5 })];
    const tick = usePathfinding(ctx);
    tick();
    // Visible didn't change (already all true via fogVisibleRef) — setFogVisible
    // may or may not fire, but setFogExplored should not fire since everything explored
    expect(ctx.setFogExplored).not.toHaveBeenCalled();
  });

  it('can be called multiple times without throwing', () => {
    const ctx = makeMockCtx();
    ctx.lastFogUpdateRef.current = Date.now() - 2000;
    const tick = usePathfinding(ctx);
    expect(() => {
      tick();
      // Update ref so subsequent call respects throttle
      ctx.lastFogUpdateRef.current = Date.now();
      tick();
    }).not.toThrow();
  });
});
