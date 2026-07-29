// localStorage save/load and high-score persistence for the RTS mode.

import type { HighScoreEntry, SaveData } from './types';

const HIGH_SCORES_KEY = 'farm3j_highscores_v1';
const LEGACY_SAVE_KEY = 'farm3j_rts_v2';
const SLOT_KEYS = [
  'farm3j_rts_v2_slot0',
  'farm3j_rts_v2_slot1',
  'farm3j_rts_v2_slot2',
] as const;

export type SaveSlot = 0 | 1 | 2;

export function loadHighScores(): HighScoreEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) ?? '[]');
  } catch {
    return [];
  }
}
export function saveHighScore(entry: HighScoreEntry) {
  const scores = loadHighScores();
  scores.push(entry);
  scores.sort((a, b) => b.wave - a.wave || b.kills - a.kills);
  try {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores.slice(0, 5)));
  } catch {
    /* ignore storage errors */
  }
}

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

export function loadSave(slot: SaveSlot): SaveData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SLOT_KEYS[slot]);
    if (!raw) {
      // Migrate legacy single-save into slot 0 on first load
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
  try {
    localStorage.setItem(SLOT_KEYS[slot], JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}

export function clearSave(slot: SaveSlot): void {
  _saveLocked = true;
  try {
    localStorage.removeItem(SLOT_KEYS[slot]);
  } catch {
    /* ignore storage errors */
  }
  setTimeout(() => {
    _saveLocked = false;
  }, 500);
}
