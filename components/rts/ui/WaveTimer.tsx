import React from 'react';

export interface WaveTimerProps {
  /** Matches ResourceBar's gameOver prop type. Truthy value means the game ended. */
  gameOver: 'victory' | 'defeat' | null;
  nextWaveAt: number | null;
  waveTimerRemainingRef: React.MutableRefObject<number | null>;
  gameSpeed: number;
}

/**
 * Displays the countdown timer until the next wave spawns.
 * Renders null when there is no pending wave or the game is over.
 */
export const WaveTimer: React.FC<WaveTimerProps> = ({
  gameOver,
  nextWaveAt,
  waveTimerRemainingRef,
  gameSpeed,
}) => {
  if (
    gameOver !== null ||
    (!nextWaveAt && waveTimerRemainingRef.current === null)
  ) {
    return null;
  }

  const secsLeft =
    gameSpeed === 0 || nextWaveAt === null
      ? Math.max(0, Math.ceil((waveTimerRemainingRef.current ?? 0) / 1000))
      : Math.max(0, Math.ceil((nextWaveAt - Date.now()) / 1000));
  const urgent = secsLeft <= 5 && gameSpeed > 0;

  return (
    <span
      className={`text-xs ${
        gameSpeed === 0
          ? 'font-normal text-slate-500'
          : urgent
            ? 'animate-[pulse_0.6s_infinite] font-bold text-red-500'
            : 'font-normal text-slate-400'
      }`}
    >
      ⏱{secsLeft}s{gameSpeed === 0 ? '⏸' : ''}
    </span>
  );
};
