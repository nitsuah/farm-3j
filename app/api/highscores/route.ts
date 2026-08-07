import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { HighScorePostBody, HighScoreRow } from '@/lib/api-types';

export const runtime = 'edge';

function unavailable() {
  return NextResponse.json({ error: 'db_unavailable' }, { status: 503 });
}

// GET /api/highscores?limit=10
export async function GET(req: NextRequest) {
  if (!sql) return unavailable();
  const rawLimit = Number(req.nextUrl.searchParams.get('limit') ?? '10');
  const limit = Math.min(100, Number.isNaN(rawLimit) ? 10 : rawLimit);
  const rows = await sql`
    SELECT wave, kills, result, gold, time_seconds, score_date, recorded_at
    FROM high_scores
    ORDER BY wave DESC, kills DESC
    LIMIT ${limit}
  `;
  return NextResponse.json(rows);
}

// POST /api/highscores   body: { deviceId, wave, kills, result, gold, timeSecs, scoreDate }
export async function POST(req: NextRequest) {
  if (!sql) return unavailable();
  let body: Partial<HighScorePostBody>;
  try {
    const raw = await req.json();
    if (typeof raw !== 'object' || raw === null) {
      return NextResponse.json({ error: 'invalid body' }, { status: 400 });
    }
    body = raw as Partial<HighScorePostBody>;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { deviceId, wave, kills, result, gold, timeSecs, scoreDate } = body;

  if (
    !deviceId ||
    typeof deviceId !== 'string' ||
    deviceId.length > 64 ||
    typeof wave !== 'number' ||
    !Number.isInteger(wave) ||
    wave < 0 ||
    typeof kills !== 'number' ||
    !Number.isInteger(kills) ||
    kills < 0 ||
    (result !== 'victory' && result !== 'defeat')
  ) {
    return NextResponse.json({ error: 'invalid fields' }, { status: 400 });
  }

  const safeGold =
    typeof gold === 'number' && Number.isFinite(gold)
      ? Math.max(0, Math.round(gold))
      : 0;
  const safeTime =
    typeof timeSecs === 'number' && Number.isFinite(timeSecs)
      ? Math.max(0, Math.round(timeSecs))
      : 0;
  const safeDate = typeof scoreDate === 'string' ? scoreDate.slice(0, 32) : '';

  await sql`
    INSERT INTO high_scores (device_id, wave, kills, result, gold, time_seconds, score_date)
    VALUES (${deviceId}, ${wave}, ${kills}, ${result as string}, ${safeGold}, ${safeTime}, ${safeDate})
  `;
  return NextResponse.json({ ok: true });
}

export type { HighScoreRow };
