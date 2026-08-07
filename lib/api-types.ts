// Shared payload types consumed by both edge route handlers and the client
// persistence module, keeping request/response shapes consistent in one place.

export interface HighScorePostBody {
  deviceId: string;
  wave: number;
  kills: number;
  result: 'victory' | 'defeat';
  gold: number;
  timeSecs: number;
  scoreDate: string;
}

export interface HighScoreRow {
  wave: number;
  kills: number;
  result: 'victory' | 'defeat';
  gold: number;
  time_seconds: number;
  score_date: string;
}

export interface SavePostBody {
  deviceId: string;
  slot: number;
  data: unknown;
}

export const VALID_SAVE_SLOTS = [0, 1, 2] as const;
export type SaveSlotValue = (typeof VALID_SAVE_SLOTS)[number];

export function isValidSaveSlot(n: number): n is SaveSlotValue {
  return (VALID_SAVE_SLOTS as readonly number[]).includes(n);
}
