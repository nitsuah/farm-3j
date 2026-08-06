import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

function unavailable() {
  return NextResponse.json({ error: 'db_unavailable' }, { status: 503 });
}

// GET /api/highscores?limit=10
export async function GET(req: NextRequest) {
  if (!sql) return unavailable();
  const limit = Math.min(
    100,
    parseInt(req.nextUrl.searchParams.get('limit') ?? '10', 10)
  );
  const rows = await sql`
    SELECT player_name, wave, kills, difficulty_id, recorded_at
    FROM high_scores
    ORDER BY wave DESC, kills DESC
    LIMIT ${limit}
  `;
  return NextResponse.json(rows);
}

// POST /api/highscores   body: { deviceId, playerName?, wave, kills, difficultyId? }
export async function POST(req: NextRequest) {
  if (!sql) return unavailable();
  const body = (await req.json()) as {
    deviceId?: string;
    playerName?: string;
    wave?: number;
    kills?: number;
    difficultyId?: string;
  };
  const { deviceId, playerName = 'Anonymous', wave, kills, difficultyId } = body;
  if (!deviceId || wave === undefined || kills === undefined)
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });

  await sql`
    INSERT INTO high_scores (device_id, player_name, wave, kills, difficulty_id)
    VALUES (${deviceId}, ${playerName}, ${wave}, ${kills}, ${difficultyId ?? null})
  `;
  return NextResponse.json({ ok: true });
}
