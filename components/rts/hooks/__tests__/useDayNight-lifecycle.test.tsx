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
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('clears interval and announcement timeout on unmount', () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const refs = makeRefs();
    const { result, unmount } = renderHook(() =>
      useDayNight({
        ...refs,
        gameOver: null,
        soundMuted: true,
      }),
    );

    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.phaseAnnouncement).toContain('Night Falls');
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('clears the phase announcement after 2.5 seconds', () => {
    vi.useFakeTimers();
    const refs = makeRefs();
    const { result } = renderHook(() =>
      useDayNight({
        ...refs,
        gameOver: null,
        soundMuted: true,
      }),
    );

    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.phaseAnnouncement).toContain('Night Falls');

    act(() => vi.advanceTimersByTime(2500));
    expect(result.current.phaseAnnouncement).toBeNull();
  });

  it('does not advance after game over', () => {
    vi.useFakeTimers();
    const refs = makeRefs();
    const { result } = renderHook(() =>
      useDayNight({
        ...refs,
        gameOver: null,
        soundMuted: true,
      }),
    );

    refs.gameOverRef.current = 'defeat';
    act(() => vi.advanceTimersByTime(61_000));
    expect(result.current.dayPhase).toBe('day');
    expect(refs.isNightRef.current).toBe(false);
  });
});
