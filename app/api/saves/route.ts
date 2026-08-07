import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { isValidSaveSlot, type SavePostBody } from '@/lib/api-types';

export const runtime = 'edge';

function unavailable() {
  return NextResponse.json({ error: 'db_unavailable' }, { status: 503 });
}

function parseSlot(s: string): number | null {
  const n = Number(s);
  return Number.isInteger(n) && isValidSaveSlot(n) ? n : null;
}

// GET /api/saves?deviceId=xxx&slot=n
export async function GET(req: NextRequest) {
  if (!sql) return unavailable();
  const deviceId = req.nextUrl.searchParams.get('deviceId');
  const slotParam = req.nextUrl.searchParams.get('slot');
  if (!deviceId)
    return NextResponse.json({ error: 'missing deviceId' }, { status: 400 });

  if (slotParam !== null) {
    const slot = parseSlot(slotParam);
    if (slot === null)
      return NextResponse.json({ error: 'invalid slot' }, { status: 400 });
    const rows = await sql`
      SELECT data FROM game_saves
      WHERE device_id = ${deviceId} AND slot = ${slot}
    `;
    if (rows.length === 0) return NextResponse.json(null);
    return NextResponse.json((rows[0] as { data: unknown }).data);
  }

  const rows = await sql`
    SELECT slot, data, updated_at FROM game_saves
    WHERE device_id = ${deviceId}
    ORDER BY slot
  `;
  return NextResponse.json(rows);
}

// POST /api/saves   body: { deviceId, slot, data }
export async function POST(req: NextRequest) {
  if (!sql) return unavailable();
  let body: Partial<SavePostBody>;
  try {
    const raw = await req.json();
    if (typeof raw !== 'object' || raw === null) {
      return NextResponse.json({ error: 'invalid body' }, { status: 400 });
    }
    body = raw as Partial<SavePostBody>;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const { deviceId, slot, data } = body;
  if (!deviceId || slot === undefined || !data)
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  if (!isValidSaveSlot(slot))
    return NextResponse.json({ error: 'invalid slot' }, { status: 400 });

  await sql`
    INSERT INTO game_saves (device_id, slot, data, updated_at)
    VALUES (${deviceId}, ${slot}, ${JSON.stringify(data)}, NOW())
    ON CONFLICT (device_id, slot)
    DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `;
  return NextResponse.json({ ok: true });
}

// DELETE /api/saves?deviceId=xxx&slot=n
export async function DELETE(req: NextRequest) {
  if (!sql) return unavailable();
  const deviceId = req.nextUrl.searchParams.get('deviceId');
  const slotParam = req.nextUrl.searchParams.get('slot');
  if (!deviceId || slotParam === null)
    return NextResponse.json({ error: 'missing params' }, { status: 400 });
  const slot = parseSlot(slotParam);
  if (slot === null)
    return NextResponse.json({ error: 'invalid slot' }, { status: 400 });

  await sql`
    DELETE FROM game_saves WHERE device_id = ${deviceId} AND slot = ${slot}
  `;
  return NextResponse.json({ ok: true });
}
