import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useDayNight } from '../useDayNight';

vi.mock('../../game/sound', () => ({
  startAmbient: vi.fn(),
  stopAmbient: vi.fn(),
}));

const makeRefs = () => ({
  isNightRef: { current: false },
  gameOverRef: { current: null as 'victory' | 'defeat' | null },
});

describe('useDayNight lifecycle', () => {
  afterEach(() => vi.useRealTimers());

  it('clears timers on unmount', () => {
    vi.useFakeTimers();
    const refs = makeRefs();
    const { result, unmount } = renderHook(() =>
      useDayNight({ ...refs, gameOver: null, soundMuted: true }),
    );
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.phaseAnnouncement).toContain('Night Falls');
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not advance after game over', () => {
    vi.useFakeTimers();
    const refs = makeRefs();
    const { result } = renderHook(() =>
      useDayNight({ ...refs, gameOver: null, soundMuted: true }),
    );
    refs.gameOverRef.current = 'defeat';
    act(() => vi.advanceTimersByTime(61_000));
    expect(result.current.dayPhase).toBe('day');
    expect(refs.isNightRef.current).toBe(false);
  });
});
