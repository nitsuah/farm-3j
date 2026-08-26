import { describe, it, expect } from 'vitest';
import { isValidSaveSlot, VALID_SAVE_SLOTS } from './api-types';

describe('VALID_SAVE_SLOTS', () => {
  it('contains slots 0, 1, and 2', () => {
    expect(VALID_SAVE_SLOTS).toEqual([0, 1, 2]);
  });
});

describe('isValidSaveSlot', () => {
  it('returns true for slot 0', () => {
    expect(isValidSaveSlot(0)).toBe(true);
  });

  it('returns true for slot 1', () => {
    expect(isValidSaveSlot(1)).toBe(true);
  });

  it('returns true for slot 2', () => {
    expect(isValidSaveSlot(2)).toBe(true);
  });

  it('returns false for slot 3', () => {
    expect(isValidSaveSlot(3)).toBe(false);
  });

  it('returns false for negative values', () => {
    expect(isValidSaveSlot(-1)).toBe(false);
  });

  it('returns false for non-integer values', () => {
    expect(isValidSaveSlot(1.5)).toBe(false);
  });
});
