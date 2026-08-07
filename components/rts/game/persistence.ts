// Save/load and high-score persistence for the RTS mode.
//
// Strategy (tried in order):
//   1. Cloud API (/api/saves, /api/highscores) — active when the server has DATABASE_URL.
//      Identified by an anonymous device UUID persisted in localStorage.
//   2. localStorage — always available as a fallback.

import type { HighScoreEntry, SaveData } from './types';

// ---------- device id ----------
const DEVICE_ID_KEY = 'farm3j_device_id';

export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// ---------- localStorage keys ----------
const HIGH_SCORES_KEY = 'farm3j_highscores_v1';
const LEGACY_SAVE_KEY = 'farm3j_rts_v2';
const SLOT_KEYS = [
  'farm3j_rts_v2_slot0',
  'farm3j_rts_v2_slot1',
  'farm3j_rts_v2_slot2',
] as const;

export type SaveSlot = 0 | 1 | 2;

// ---------- high scores ----------
function loadHighScoresLocal(): HighScoreEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export async function loadHighScores(): Promise<HighScoreEntry[]> {
  try {
    const r = await fetch('/api/highscores?limit=10');
    if (r.ok) {
      const rows = (await r.json()) as {
        wave: number;
        kills: number;
        result: 'victory' | 'defeat';
        gold: number;
        time_seconds: number;
        score_date: string;
      }[];
      return rows.map(row => ({
        wave: row.wave,
        kills: row.kills,
        result: row.result ?? 'defeat',
        gold: row.gold ?? 0,
        time: row.time_seconds ?? 0,
        date: row.score_date ?? '',
      }));
    }
  } catch {
    // fall through
  }
  return loadHighScoresLocal();
}

export async function saveHighScore(entry: HighScoreEntry): Promise<void> {
  // Always write locally for instant feedback
  const scores = loadHighScoresLocal();
  scores.push(entry);
  scores.sort((a, b) => b.wave - a.wave || b.kills - a.kills);
  try {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores.slice(0, 10)));
  } catch {
    /* ignore quota */
  }

  // Fire-and-forget to cloud
  try {
    void fetch('/api/highscores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: getDeviceId(),
        wave: entry.wave,
        kills: entry.kills,
        result: entry.result,
        gold: entry.gold,
        timeSecs: entry.time,
        scoreDate: entry.date,
      }),
    });
  } catch {
    /* ignore network errors */
  }
}

// ---------- save validation ----------
function isValidSave(d: unknown): d is SaveData {
  if (!d || typeof d !== 'object') return false;
  const s = d as SaveData;
  return (
    (s.version === 1 || s.version === 2) &&
    typeof s.resources === 'object' &&
    s.resources !== null &&
    Array.isArray(s.workers) &&
    Array.isArray(s.placedBuildings)
  );
}

// Synchronous read from localStorage — used during React render where async is not allowed.
// The async loadSave() call should be used in useEffect for cloud sync.
export function loadSaveSync(slot: SaveSlot): SaveData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SLOT_KEYS[slot]);
    if (!raw) {
      if (slot === 0) {
        const legacyRaw = localStorage.getItem(LEGACY_SAVE_KEY);
        if (legacyRaw) {
          const d = JSON.parse(legacyRaw) as SaveData;
          if (isValidSave(d)) {
            writeSave(d, slot);
            localStorage.removeItem(LEGACY_SAVE_KEY);
            return d;
          }
        }
      }
      return null;
    }
    const d = JSON.parse(raw) as SaveData;
    return isValidSave(d) ? d : null;
  } catch {
    return null;
  }
}

// Synchronous high scores from localStorage — used when async is not possible.
export function loadHighScoresSync(): HighScoreEntry[] {
  return loadHighScoresLocal();
}

// ---------- slot metadata ----------
export interface SlotMeta {
  wave: number;
  savedAt: number;
  difficultyId?: string;
  slotName?: string;
}

export function loadSlotMeta(slot: SaveSlot): SlotMeta | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SLOT_KEYS[slot]);
    if (!raw) return null;
    const d = JSON.parse(raw) as SaveData;
    if (!isValidSave(d)) return null;
    return {
      wave: d.wave,
      savedAt: d.savedAt ?? 0,
      difficultyId: d.difficultyId,
      slotName: d.slotName,
    };
  } catch {
    return null;
  }
}

// ---------- load ----------
export async function loadSave(slot: SaveSlot): Promise<SaveData | null> {
  if (typeof window === 'undefined') return null;

  // Try cloud first
  try {
    const r = await fetch(`/api/saves?deviceId=${getDeviceId()}&slot=${slot}`);
    if (r.ok) {
      const d = (await r.json()) as SaveData | null;
      if (d && isValidSave(d)) {
        // Mirror to localStorage so the game can access it synchronously
        try { localStorage.setItem(SLOT_KEYS[slot], JSON.stringify(d)); } catch { /* ignore */ }
        return d;
      }
    }
  } catch {
    // fall through to localStorage
  }

  // localStorage
  try {
    const raw = localStorage.getItem(SLOT_KEYS[slot]);
    if (!raw) {
      if (slot === 0) {
        const legacyRaw = localStorage.getItem(LEGACY_SAVE_KEY);
        if (legacyRaw) {
          const d = JSON.parse(legacyRaw) as SaveData;
          if (isValidSave(d)) {
            writeSave(d, slot);
            localStorage.removeItem(LEGACY_SAVE_KEY);
            return d;
          }
        }
      }
      return null;
    }
    const d = JSON.parse(raw) as SaveData;
    return isValidSave(d) ? d : null;
  } catch {
    return null;
  }
}

let _saveLocked = false;

export function writeSave(data: SaveData, slot: SaveSlot): void {
  if (_saveLocked) return;
  // Always write localStorage synchronously (game loop depends on this)
  try {
    localStorage.setItem(SLOT_KEYS[slot], JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
  // Fire-and-forget cloud write
  try {
    void fetch('/api/saves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: getDeviceId(), slot, data }),
    });
  } catch {
    /* ignore */
  }
}

export function clearSave(slot: SaveSlot): void {
  _saveLocked = true;
  try {
    localStorage.removeItem(SLOT_KEYS[slot]);
  } catch {
    /* ignore */
  }
  // Fire-and-forget cloud delete
  try {
    void fetch(`/api/saves?deviceId=${getDeviceId()}&slot=${slot}`, {
      method: 'DELETE',
    });
  } catch {
    /* ignore */
  }
  setTimeout(() => {
    _saveLocked = false;
  }, 500);
}
