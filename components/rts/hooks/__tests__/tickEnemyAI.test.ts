/**
 * Basic tick-coverage tests for enemy AI functions not yet tested.
 * Strategy: verify each tick function can be called with a minimal mock
 * context (empty unit arrays) without throwing, and invokes the expected
 * state setter at least once. Comprehensive path coverage lives in
 * integration/e2e tests — these ensure the functions are wired and reachable.
 */
import { describe, expect, it } from 'vitest';

import { tickEnemyGrunts } from '../ai/tickEnemyGrunts';
import { tickEnemyLurkers } from '../ai/tickEnemyLurkers';
import { tickEnemyNecromancers } from '../ai/tickEnemyNecromancers';
import { tickEnemyShamans } from '../ai/tickEnemyShamans';
import { tickEnemySiege } from '../ai/tickEnemySiege';
import { tickEnemyTrolls } from '../ai/tickEnemyTrolls';
import { tickEnemyWarchiefs } from '../ai/tickEnemyWarchiefs';
import { tickEnemyWarlords } from '../ai/tickEnemyWarlords';
import { tickEnemyWitchDoctors } from '../ai/tickEnemyWitchDoctors';
import { makeMockCtx } from './makeMockCtx';

// ── tickEnemyGrunts ───────────────────────────────────────────────────────────

describe('tickEnemyGrunts', () => {
  it('does not throw with empty state', () => {
    const ctx = makeMockCtx();
    expect(() => tickEnemyGrunts(ctx, 1 / 60)).not.toThrow();
  });

  it('calls setEnemyGrunts twice per tick (filter dead + update state)', () => {
    const ctx = makeMockCtx();
    tickEnemyGrunts(ctx, 1 / 60);
    expect(ctx.setEnemyGrunts).toHaveBeenCalledTimes(2);
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
