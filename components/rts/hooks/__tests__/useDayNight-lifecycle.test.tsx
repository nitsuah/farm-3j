import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RefObject } from 'react';
import { useDayNight } from '../useDayNight';

vi.mock('../../game/sound', () => ({ startAmbient: vi.fn(), stopAmbient: vi.fn() }));

describe('useDayNight timer lifecycle', () => {
  afterEach(() => vi.useRealTimers());

  it('clears the phase interval and announcement timeout on unmount', () => {
    vi.useFakeTimers();
    const refs = {
      isNightRef: { current: false } as RefObject<boolean>,
      gameOverRef: { current: null } as React.RefObject<'victory' | 'defeat' | null>,
    };
    const { result, unmount } = renderHook(() => useDayNight({ ...refs, gameOver: null, soundMuted: true }));
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.phaseAnnouncement).toContain('Night Falls');
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not advance after the game-over ref is set', () => {
    vi.useFakeTimers();
    const refs = {
      isNightRef: { current: false } as React.RefObject<boolean>,
      gameOverRef: { current: null } as React.RefObject<'victory' | 'defeat' | null>,
    };
    const { result } = renderHook(() => useDayNight({ ...refs, gameOver: null, soundMuted: true }));
    refs.gameOverRef.current = 'defeat';
    act(() => vi.advanceTimersByTime(61_000));
    expect(result.current.dayPhase).toBe('day');
    expect(refs.isNightRef.current).toBe(false);
  });
});
