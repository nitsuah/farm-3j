import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDayNight } from '../useDayNight';

vi.mock('../../game/sound', () => ({
  startAmbient: vi.fn(),
  stopAmbient: vi.fn(),
}));

const makeRefs = () => ({
  isNightRef: { current: false },
  gameOverRef: { current: null },
});

describe('useDayNight transitions', () => {
  afterEach(() => vi.useRealTimers());

  it('starts in day with isNightRef false', () => {
    vi.useFakeTimers();
    const refs = makeRefs();
    const { result } = renderHook(() =>
      useDayNight({ ...refs, gameOver: null, soundMuted: true }),
    );
    expect(result.current.dayPhase).toBe('day');
    expect(result.current.dayProgress).toBe(0);
    expect(refs.isNightRef.current).toBe(false);
  });

  it('runs 60 seconds of day and 45 seconds of night', () => {
    vi.useFakeTimers();
    const refs = makeRefs();
    const { result } = renderHook(() =>
      useDayNight({ ...refs, gameOver: null, soundMuted: true }),
    );
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.dayPhase).toBe('night');
    expect(refs.isNightRef.current).toBe(true);
    expect(result.current.phaseAnnouncement).toContain('Night Falls');
    act(() => vi.advanceTimersByTime(45_000));
    expect(result.current.dayPhase).toBe('day');
    expect(refs.isNightRef.current).toBe(false);
    expect(result.current.phaseAnnouncement).toBe('☀️ Dawn Breaks!');
  });
});
