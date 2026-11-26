import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadHighScores,
  loadHighScoresSync,
  loadSaveSync,
  loadSlotMeta,
  saveHighScore,
} from '../persistence';
import type { HighScoreEntry, SaveData } from '../types';

const legacyKey = 'farm3j_rts_v2';
const slot0Key = 'farm3j_rts_v2_slot0';
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
    expect(loadSlotMeta(0)).toEqual({
      wave: 4,
      savedAt: 123,
      difficultyId: 'normal',
      slotName: 'Test',
    });
  });
});

const scoresKey = 'farm3j_highscores_v1';
const entry = (over: Partial<HighScoreEntry> = {}): HighScoreEntry => ({
  wave: 3,
  kills: 10,
  result: 'victory',
  gold: 50,
  time: 120,
  date: '2026-01-01',
  ...over,
});

describe('loadHighScoresSync', () => {
  it('returns [] for empty and malformed storage', () => {
    expect(loadHighScoresSync()).toEqual([]);
    localStorage.setItem(scoresKey, '{');
    expect(loadHighScoresSync()).toEqual([]);
  });
  it('returns stored entries, and passes non-array JSON through unchanged', () => {
    localStorage.setItem(scoresKey, JSON.stringify([entry()]));
    expect(loadHighScoresSync()).toEqual([entry()]);
    // Current behaviour: no array check, so valid non-array JSON is returned as-is.
    localStorage.setItem(scoresKey, JSON.stringify({ a: 1 }));
    expect(loadHighScoresSync()).toEqual({ a: 1 });
  });
});

describe('saveHighScore', () => {
  it('persists locally and posts the full payload', async () => {
    let storedAtFetch: string | null = null;
    const fetchMock = vi.fn().mockImplementation(() => {
      // Capture the local write as seen when fetch runs; assert after the call.
      storedAtFetch = localStorage.getItem(scoresKey);
      return new Promise(() => {});
    });
    vi.stubGlobal('fetch', fetchMock);
    await saveHighScore(entry());
    expect(JSON.parse(storedAtFetch!)).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/highscores');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      deviceId: localStorage.getItem('farm3j_device_id'),
      wave: 3,
      kills: 10,
      result: 'victory',
      gold: 50,
      timeSecs: 120,
      scoreDate: '2026-01-01',
    });
    expect(body.deviceId).toBeTruthy();
  });
  it('sorts by wave then kills, descending', async () => {
    await saveHighScore(entry({ wave: 2, kills: 5 }));
    await saveHighScore(entry({ wave: 5, kills: 1 }));
    await saveHighScore(entry({ wave: 2, kills: 9 }));
    expect(loadHighScoresSync().map((e) => [e.wave, e.kills])).toEqual([
      [5, 1],
      [2, 9],
      [2, 5],
    ]);
  });
  it('keeps only the top 10', async () => {
    for (let i = 1; i <= 12; i++) await saveHighScore(entry({ wave: i }));
    const scores = loadHighScoresSync();
    expect(scores).toHaveLength(10);
    expect(scores[0]!.wave).toBe(12);
    expect(scores[9]!.wave).toBe(3);
  });
});

describe('loadHighScores', () => {
  it('maps API rows and defaults missing fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            wave: 7,
            kills: 30,
            result: 'victory',
            gold: 9,
            time_seconds: 42,
            score_date: '2026-02-02',
          },
          { wave: 1, kills: 2 },
        ],
      }),
    );
    expect(await loadHighScores()).toEqual([
      {
        wave: 7,
        kills: 30,
        result: 'victory',
        gold: 9,
        time: 42,
        date: '2026-02-02',
      },
      { wave: 1, kills: 2, result: 'defeat', gold: 0, time: 0, date: '' },
    ]);
  });
  it('falls back to local scores on a non-ok response', async () => {
    localStorage.setItem(scoresKey, JSON.stringify([entry({ wave: 9 })]));
    expect(await loadHighScores()).toEqual([entry({ wave: 9 })]);
  });
  it('falls back to local scores when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    localStorage.setItem(scoresKey, JSON.stringify([entry({ wave: 8 })]));
    expect(await loadHighScores()).toEqual([entry({ wave: 8 })]);
  });
});
