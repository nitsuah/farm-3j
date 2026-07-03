// localStorage save/load and high-score persistence for the RTS mode.

import type { HighScoreEntry, SaveData } from './types';

const SAVE_KEY = 'farm3j_rts_v2'; // bumped: map expanded to 25×25
const HIGH_SCORES_KEY = 'farm3j_highscores_v1';

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

// Shallow structural check so a stale or corrupted blob is discarded instead of
// crashing gameplay code later. Kept lenient: legacy saves may omit goldMines.
function isValidSave(d: unknown): d is SaveData {
  if (!d || typeof d !== 'object') return false;
  const s = d as SaveData;
  return (
    s.version === 1 &&
    typeof s.resources === 'object' &&
    s.resources !== null &&
    Array.isArray(s.workers) &&
    Array.isArray(s.placedBuildings)
  );
}

export function loadSave(): SaveData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as SaveData;
    return isValidSave(d) ? d : null;
  } catch {
    return null;
  }
}

// Blocked when a New Game reset is in progress — prevents auto-save from re-writing state
// after clearSave() but before the new component finishes mounting.
let _saveLocked = false;

export function writeSave(data: SaveData): void {
  if (_saveLocked) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}

export function clearSave(): void {
  _saveLocked = true;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore storage errors */
  }
  // Unlock after a tick — by then the new component has mounted and taken over
  setTimeout(() => {
    _saveLocked = false;
  }, 500);
}
