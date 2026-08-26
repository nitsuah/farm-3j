import { describe, it, expect } from 'vitest';

import {
  CATAPULT_MAX_HP,
  CAVALRY_MAX_HP,
  HERO_MAX_HP,
  SWORDSMAN_MAX_HP,
  TREBUCHET_MAX_HP,
  WORKER_MAX_HP,
} from '../constants';
import { makeUnit } from '../units';

describe('makeUnit', () => {
  // ── HP by unit type ──────────────────────────────────────────────────────────

  it('farmer starts at WORKER_MAX_HP', () => {
    const u = makeUnit(1, 5, 7, 'farmer');
    expect(u.hp).toBe(WORKER_MAX_HP);
    expect(u.maxHp).toBe(WORKER_MAX_HP);
  });

  it('hero starts at HERO_MAX_HP', () => {
    const u = makeUnit(2, 3, 4, 'hero');
    expect(u.hp).toBe(HERO_MAX_HP);
    expect(u.maxHp).toBe(HERO_MAX_HP);
  });

  it('swordsman starts at SWORDSMAN_MAX_HP', () => {
    const u = makeUnit(3, 0, 0, 'swordsman');
    expect(u.hp).toBe(SWORDSMAN_MAX_HP);
    expect(u.maxHp).toBe(SWORDSMAN_MAX_HP);
  });

  it('catapult starts at CATAPULT_MAX_HP', () => {
    const u = makeUnit(4, 0, 0, 'catapult');
    expect(u.hp).toBe(CATAPULT_MAX_HP);
    expect(u.maxHp).toBe(CATAPULT_MAX_HP);
  });

  it('cavalry starts at CAVALRY_MAX_HP', () => {
    const u = makeUnit(5, 2, 2, 'cavalry');
    expect(u.hp).toBe(CAVALRY_MAX_HP);
    expect(u.maxHp).toBe(CAVALRY_MAX_HP);
  });

  it('trebuchet starts at TREBUCHET_MAX_HP', () => {
    const u = makeUnit(6, 0, 0, 'trebuchet');
    expect(u.hp).toBe(TREBUCHET_MAX_HP);
    expect(u.maxHp).toBe(TREBUCHET_MAX_HP);
  });

  // ── Identity fields ──────────────────────────────────────────────────────────

  it('assigns id, x, y from arguments', () => {
    const u = makeUnit(42, 13, 7, 'farmer');
    expect(u.id).toBe(42);
    expect(u.x).toBe(13);
    expect(u.y).toBe(7);
  });

  it('assigns unitType from argument', () => {
    expect(makeUnit(1, 0, 0, 'hero').unitType).toBe('hero');
    expect(makeUnit(1, 0, 0, 'swordsman').unitType).toBe('swordsman');
    expect(makeUnit(1, 0, 0, 'farmer').unitType).toBe('farmer');
  });

  // ── Default state ────────────────────────────────────────────────────────────

  it('starts with zero xp and level 0', () => {
    const u = makeUnit(1, 0, 0, 'farmer');
    expect(u.xp).toBe(0);
    expect(u.level).toBe(0);
  });

  it('starts idle', () => {
    expect(makeUnit(1, 0, 0, 'swordsman').state).toBe('idle');
  });

  it('starts not selected', () => {
    expect(makeUnit(1, 0, 0, 'farmer').selected).toBe(false);
  });

  it('starts with no carried resources', () => {
    expect(makeUnit(1, 0, 0, 'farmer').carrying).toEqual({
      gold: 0,
      lumber: 0,
      stone: 0,
    });
  });

  it('starts with null gathering, attacking, repairing', () => {
    const u = makeUnit(1, 0, 0, 'farmer');
    expect(u.gathering).toBeNull();
    expect(u.attacking).toBeNull();
    expect(u.repairing).toBeNull();
  });

  it('starts with empty path and waypoints', () => {
    const u = makeUnit(1, 0, 0, 'swordsman');
    expect(u.path).toEqual([]);
    expect(u.waypoints).toEqual([]);
  });

  it('starts with no group, patrol, or movingTo', () => {
    const u = makeUnit(1, 0, 0, 'farmer');
    expect(u.group).toBeNull();
    expect(u.patrol).toBeNull();
    expect(u.movingTo).toBeNull();
  });

  it('starts with zero cooldowns', () => {
    const u = makeUnit(1, 0, 0, 'cavalry');
    expect(u.chargeCooldown).toBe(0);
    expect(u.sprintCooldown).toBe(0);
    expect(u.sprinting).toBe(false);
  });

  it('starts with holdPosition false and attackMove false', () => {
    const u = makeUnit(1, 0, 0, 'farmer');
    expect(u.holdPosition).toBe(false);
    expect(u.attackMove).toBe(false);
    expect(u.attackMoveTarget).toBeNull();
  });

  // ── hp === maxHp invariant ───────────────────────────────────────────────────

  it('hp always equals maxHp at creation for all types', () => {
    const types = [
      'farmer',
      'hero',
      'swordsman',
      'catapult',
      'cavalry',
      'trebuchet',
    ] as const;
    for (const t of types) {
      const u = makeUnit(1, 0, 0, t);
      expect(u.hp).toBe(u.maxHp);
    }
  });
});
