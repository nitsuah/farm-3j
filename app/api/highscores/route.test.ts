import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSql = vi.hoisted(() => vi.fn());
vi.mock('@/lib/db', () => ({ sql: mockSql }));

import { GET, POST } from './route';

const url = 'http://localhost/api/highscores';
const post = (body: unknown) =>
  new NextRequest(url, {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
const valid = {
  deviceId: 'd',
  wave: 3,
  kills: 9,
  result: 'victory',
  gold: 12.6,
  timeSecs: 40.4,
  scoreDate: '2026-11-25',
};
// Template values of the last mockSql call (everything after the strings array).
const lastValues = () => mockSql.mock.calls.at(-1)!.slice(1);

beforeEach(() => {
  mockSql.mockReset();
  mockSql.mockResolvedValue([]);
});

describe('without a database', () => {
  it('answers 503 db_unavailable for GET and POST', async () => {
    vi.resetModules();
    vi.doMock('@/lib/db', () => ({ sql: null }));
    const route = await import('./route');
    for (const res of [
      await route.GET(new NextRequest(url)),
      await route.POST(post(valid)),
    ]) {
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: 'db_unavailable' });
    }
    vi.doUnmock('@/lib/db');
  });
});

describe('GET', () => {
  it('returns the rows from the database', async () => {
    const rows = [{ wave: 5, kills: 2 }];
    mockSql.mockResolvedValue(rows);
    const res = await GET(new NextRequest(`${url}?limit=5`));
    expect(await res.json()).toEqual(rows);
  });

  it.each([
    ['?limit=5', 5],
    ['', 10],
    ['?limit=abc', 10],
    ['?limit=500', 100],
  ])('uses the right limit for %j', async (query, expected) => {
    await GET(new NextRequest(`${url}${query}`));
    expect(lastValues().at(-1)).toBe(expected);
  });
});

describe('POST', () => {
  it('stores a valid score with rounded gold and time', async () => {
    const res = await POST(post(valid));
    expect(await res.json()).toEqual({ ok: true });
    expect(lastValues()).toEqual(['d', 3, 9, 'victory', 13, 40, '2026-11-25']);
  });

  it('rejects a non-JSON body and a JSON null', async () => {
    const bad = await POST(post('not json'));
    expect(bad.status).toBe(400);
    expect(await bad.json()).toEqual({ error: 'invalid json' });
    const nul = await POST(post('null'));
    expect(nul.status).toBe(400);
    expect(await nul.json()).toEqual({ error: 'invalid body' });
    expect(mockSql).not.toHaveBeenCalled();
  });

  it.each([
    ['missing deviceId', { ...valid, deviceId: undefined }],
    ['65-character deviceId', { ...valid, deviceId: 'x'.repeat(65) }],
    ['non-integer wave', { ...valid, wave: 1.5 }],
    ['negative kills', { ...valid, kills: -1 }],
    ['unknown result', { ...valid, result: 'draw' }],
  ])('rejects %s with invalid fields', async (_name, body) => {
    const res = await POST(post(body));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid fields' });
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('stores 0 for negative gold or missing time, and cuts long dates to 32 characters', async () => {
    await POST(
      post({
        ...valid,
        gold: -5,
        timeSecs: undefined,
        scoreDate: 'd'.repeat(40),
      }),
    );
    const values = lastValues();
    expect(values[4]).toBe(0);
    expect(values[5]).toBe(0);
    expect(values[6]).toBe('d'.repeat(32));
  });
});
