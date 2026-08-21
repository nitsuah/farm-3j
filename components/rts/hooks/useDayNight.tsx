'use client';
import { useState, useEffect, useRef } from 'react';
import type React from 'react';

import { startAmbient, stopAmbient } from '../game/sound';

interface DayNightParams {
  isNightRef: React.RefObject<boolean>;
  gameOver: 'victory' | 'defeat' | null;
  gameOverRef: React.RefObject<'victory' | 'defeat' | null>;
  soundMuted: boolean;
}

const DAY_DURATION_MS = 60_000;
const NIGHT_DURATION_MS = 45_000;

/**
 * Manages the day/night cycle: state, timer interval, and ambient audio.
 * Returns the current phase, progress through the phase, and a transient
 * announcement string shown at each transition.
 */
export function useDayNight({
  isNightRef,
  gameOver,
  gameOverRef,
  soundMuted,
}: DayNightParams) {
  const [dayPhase, setDayPhase] = useState<'day' | 'night'>('day');
  const [dayProgress, setDayProgress] = useState(0); // 0–1 through current phase
  const [phaseAnnouncement, setPhaseAnnouncement] = useState<string | null>(
    null
  );
  const annTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync the isNightRef and restart ambient audio whenever the phase changes.
  useEffect(() => {
    isNightRef.current = dayPhase === 'night';
    if (!soundMuted) startAmbient(dayPhase === 'night');
  }, [dayPhase, soundMuted, isNightRef]);

  // Stop ambient audio when the player mutes or the game ends.
  useEffect(() => {
    if (soundMuted || gameOver) stopAmbient();
    else startAmbient(isNightRef.current);
    return () => stopAmbient();
  }, [soundMuted, gameOver, isNightRef]);

  // Day/night timer — advances progress and flips phase at the end of each period.
  useEffect(() => {
    if (gameOver) return;
    let phaseStart = Date.now();
    let currentPhase: 'day' | 'night' = 'day';
    const tick = setInterval(() => {
      if (gameOverRef.current) return;
      const elapsed = Date.now() - phaseStart;
      const duration =
        currentPhase === 'day' ? DAY_DURATION_MS : NIGHT_DURATION_MS;
      setDayProgress(Math.min(1, elapsed / duration));
      if (elapsed >= duration) {
        currentPhase = currentPhase === 'day' ? 'night' : 'day';
        setDayPhase(currentPhase);
        phaseStart = Date.now();
        const msg =
          currentPhase === 'night'
            ? '🌙 Night Falls! Grunts grow stronger…'
            : '☀️ Dawn Breaks!';
        setPhaseAnnouncement(msg);
        if (annTimerRef.current) clearTimeout(annTimerRef.current);
        annTimerRef.current = setTimeout(
          () => setPhaseAnnouncement(null),
          2500
        );
      }
    }, 250);
    return () => {
      clearInterval(tick);
      if (annTimerRef.current) clearTimeout(annTimerRef.current);
    };
  }, [gameOver, gameOverRef]);

  return { dayPhase, dayProgress, phaseAnnouncement };
}
