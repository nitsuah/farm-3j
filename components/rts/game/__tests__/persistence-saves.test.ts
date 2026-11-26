import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SaveData } from '../types';

const legacyKey = 'farm3j_rts_v2';
const slotKey = (n: number) => `farm3j_rts_v2_slot${n}`;
const save = (): SaveData => ({
  version: 2,
  wave: 4,
  savedAt: 123,
  difficultyId: 'normal',
  slotName: 'Test',
  resources: { gold: 0, lumber: 0, stone: 0, food: 0, foodCap: 0 },
  workers: [],
  trees: [],
  goldMines: [],
  stoneNodes: [],
  placedBuildings: [],
  buildingNextId: 1,
  farmhouse: { built: false, level: 0 },
  upgrades: { sharperTools: 0, swiftHarvest: 0, ironWill: 0 },
  killCount: 0,
  totalGold: 0,
  totalLumber: 0,
  totalStone: 0,
  playerBarnHp: 0,
  enemyBarnHp: 0,
  rallyPoint: null,
  fogExplored: [],
});

// persistence.ts keeps a module-level save lock, so load a fresh copy per test.
async function fresh() {
  vi.resetModules();
  return import('../persistence');
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('loadSave', () => {
  it('uses a valid cloud save and mirrors it to localStorage', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => save() });
    vi.stubGlobal('fetch', fetchMock);
    const { loadSave } = await fresh();
    expect(await loadSave(0)).toEqual(save());
    const url = String(fetchMock.mock.calls[0]![0]);
    expect(url).toContain('/api/saves?deviceId=');
    expect(url).toContain('slot=0');
    expect(JSON.parse(localStorage.getItem(slotKey(0))!)).toEqual(save());
  });

  it.each([[null], [{ version: 9 }]])(
    'falls through to the local copy for cloud answer %j',
    async answer => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, json: async () => answer })
      );
      localStorage.setItem(slotKey(0), JSON.stringify(save()));
      const { loadSave } = await fresh();
      expect(await loadSave(0)).toEqual(save());
    }
  );

  it('falls back locally when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { loadSave } = await fresh();
    expect(await loadSave(0)).toBeNull();
    localStorage.setItem(slotKey(0), JSON.stringify(save()));
    expect(await loadSave(0)).toEqual(save());
  });

  it('migrates the legacy save into slot 0 only', async () => {
    localStorage.setItem(legacyKey, JSON.stringify(save()));
    const { loadSave } = await fresh();
    expect(await loadSave(1)).toBeNull();
    expect(localStorage.getItem(legacyKey)).not.toBeNull();
    expect(await loadSave(0)).toEqual(save());
    expect(JSON.parse(localStorage.getItem(slotKey(0))!)).toEqual(save());
    expect(localStorage.getItem(legacyKey)).toBeNull();
  });

  it('returns null for corrupt JSON in the slot key', async () => {
    localStorage.setItem(slotKey(0), '{');
    const { loadSave } = await fresh();
    expect(await loadSave(0)).toBeNull();
  });
});

describe('writeSave', () => {
  it('writes the slot synchronously and POSTs the save', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const { writeSave } = await fresh();
    writeSave(save(), 1);
    expect(JSON.parse(localStorage.getItem(slotKey(1))!)).toEqual(save());
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/saves');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      deviceId: localStorage.getItem('farm3j_device_id'),
      slot: 1,
      data: save(),
    });
  });

  it('does not throw when localStorage.setItem throws', async () => {
    const { writeSave } = await fresh();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => writeSave(save(), 0)).not.toThrow();
  });
});

describe('clearSave', () => {
  it('removes the slot, sends DELETE, and locks later writes', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const { writeSave, clearSave } = await fresh();
    localStorage.setItem(slotKey(2), JSON.stringify(save()));
    clearSave(2);
    expect(localStorage.getItem(slotKey(2))).toBeNull();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toMatch(/^\/api\/saves\?deviceId=.*&slot=2$/);
    expect(init.method).toBe('DELETE');

    fetchMock.mockClear();
    writeSave(save(), 2);
    expect(localStorage.getItem(slotKey(2))).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();

    // The lock is released after 500 ms.
    vi.advanceTimersByTime(500);
    writeSave(save(), 2);
    expect(localStorage.getItem(slotKey(2))).not.toBeNull();
  });
});
