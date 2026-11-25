import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSaveSync, loadSlotMeta } from '../persistence';
import type { SaveData } from '../types';

const legacyKey = 'farm3j_rts_v2';
const slot0Key = 'farm3j_rts_v2_slot0';
const save = () =>
  ({ version: 2, wave: 4, savedAt: 123, difficultyId: 'normal', slotName: 'Test', resources: {}, workers: [], placedBuildings: [] }) as unknown as SaveData;

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
});
afterEach(() => vi.unstubAllGlobals());

describe('loadSaveSync', () => {
  it('returns null for empty storage, malformed JSON, and unsupported versions', () => {
    expect(loadSaveSync(0)).toBeNull();
    localStorage.setItem(slot0Key, '{');
    expect(loadSaveSync(0)).toBeNull();
    localStorage.setItem(slot0Key, JSON.stringify({ ...save(), version: 3 }));
    expect(loadSaveSync(0)).toBeNull();
  });
  it('round-trips a valid slot save', () => {
    localStorage.setItem(slot0Key, JSON.stringify(save()));
    expect(loadSaveSync(0)).toEqual(save());
  });
  it('migrates a valid legacy save into slot 0 and removes the old key', () => {
    localStorage.setItem(legacyKey, JSON.stringify(save()));
    expect(loadSaveSync(0)).toEqual(save());
    expect(JSON.parse(localStorage.getItem(slot0Key)!)).toEqual(save());
    expect(localStorage.getItem(legacyKey)).toBeNull();
  });
  it('does not migrate the legacy save into slot 1', () => {
    localStorage.setItem(legacyKey, JSON.stringify(save()));
    expect(loadSaveSync(1)).toBeNull();
    expect(localStorage.getItem(legacyKey)).not.toBeNull();
  });
});

describe('loadSlotMeta', () => {
  it('returns save metadata and null for an empty slot', () => {
    expect(loadSlotMeta(0)).toBeNull();
    localStorage.setItem(slot0Key, JSON.stringify(save()));
    expect(loadSlotMeta(0)).toEqual({ wave: 4, savedAt: 123, difficultyId: 'normal', slotName: 'Test' });
  });
});
