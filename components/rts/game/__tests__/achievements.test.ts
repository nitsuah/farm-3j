import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ALL_ACHIEVEMENTS, getEarnedAchievements, unlockAchievement } from '../achievements';

describe('ALL_ACHIEVEMENTS', () => {
  it('has 18 entries', () => {
    expect(ALL_ACHIEVEMENTS).toHaveLength(18);
  });

  it('all ids are unique', () => {
    const ids = ALL_ACHIEVEMENTS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every entry has non-empty name, description, and emoji', () => {
    for (const a of ALL_ACHIEVEMENTS) {
      expect(a.name).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.emoji).toBeTruthy();
    }
  });

  it('contains first_blood and warlord_slayer', () => {
    const ids = ALL_ACHIEVEMENTS.map(a => a.id);
    expect(ids).toContain('first_blood');
    expect(ids).toContain('warlord_slayer');
  });
});

describe('getEarnedAchievements', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('returns empty Set on empty storage', () => {
    expect(getEarnedAchievements()).toEqual(new Set());
  });

  it('returns stored ids from localStorage', () => {
    localStorage.setItem('farm3j_achievements_v1', JSON.stringify(['wave_10']));
    expect(getEarnedAchievements()).toEqual(new Set(['wave_10']));
  });

  it('returns empty Set on corrupt JSON instead of throwing', () => {
    localStorage.setItem('farm3j_achievements_v1', 'not valid json');
    expect(getEarnedAchievements()).toEqual(new Set());
  });
});

describe('unlockAchievement', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('returns true first time and false second time', () => {
    expect(unlockAchievement('first_blood')).toBe(true);
    expect(unlockAchievement('first_blood')).toBe(false);
  });

  it('stores the id exactly once', () => {
    unlockAchievement('first_blood');
    const stored = JSON.parse(localStorage.getItem('farm3j_achievements_v1') || '[]');
    expect(stored).toEqual(['first_blood']);
  });

  it('keeps both ids when unlocking a second achievement', () => {
    unlockAchievement('first_blood');
    unlockAchievement('warlord_slayer');
    const stored = JSON.parse(localStorage.getItem('farm3j_achievements_v1') || '[]');
    expect(stored).toContain('first_blood');
    expect(stored).toContain('warlord_slayer');
    expect(stored).toHaveLength(2);
  });
});
