import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDayNight } from '../useDayNight';

vi.mock('../game/sound', () => ({ startAmbient: vi.fn(), stopAmbient: vi.fn() }));

const refs = () => ({
  isNightRef: { current: false } as React.RefObject<boolean>,
  gameOverRef: { current: null } as React.RefObject<'victory' | 'defeat' | null>,
});

describe('useDayNight phase transitions', () => {
  afterEach(() => vi.useRealTimers());

  it('starts in day and synchronizes isNightRef', () => {
    vi.useFakeTimers();
    const r = refs();
    const { result } = renderHook(() => useDayNight({ ...r, gameOver: null, soundMuted: true }));
    expect(result.current.dayPhase).toBe('day');
    expect(result.current.dayProgress).toBe(0);
    expect(r.isNightRef.current).toBe(false);
  });

  it('changes to night after 60 seconds and back to day after 45 more', () => {
    vi.useFakeTimers();
    const r = refs();
    const { result } = renderHook(() => useDayNight({ ...r, gameOver: null, soundMuted: true }));
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.dayPhase).toBe('night');
    expect(r.isNightRef.current).toBe(true);
    expect(result.current.phaseAnnouncement).toContain('Night Falls');
    act(() => vi.advanceTimersByTime(45_000));
    expect(result.current.dayPhase).toBe('day');
    expect(r.isNightRef.current).toBe(false);
    expect(result.current.phaseAnnouncement).toBe('☀️ Dawn Breaks!');
  });
});
