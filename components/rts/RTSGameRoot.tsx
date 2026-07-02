import React, { useState, useCallback } from 'react';
import RTSMap from './RTSMap';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  desc: string;
  icon: string;
  startGold: number;
  startLumber: number;
  startStone: number;
  gruntHpMult: number;
  gruntDmgMult: number;
  gruntSpeedMult: number;
  waveIntervalMult: number; // <1 = faster waves
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: 'easy', label: 'Easy', icon: '🌻', desc: 'More starting resources, weaker enemies. Good for learning.',
    startGold: 300, startLumber: 160, startStone: 60,
    gruntHpMult: 0.7, gruntDmgMult: 0.7, gruntSpeedMult: 0.8, waveIntervalMult: 1.4,
  },
  normal: {
    id: 'normal', label: 'Normal', icon: '⚔️', desc: 'Balanced experience. Recommended for most players.',
    startGold: 150, startLumber: 80, startStone: 30,
    gruntHpMult: 1.0, gruntDmgMult: 1.0, gruntSpeedMult: 1.0, waveIntervalMult: 1.0,
  },
  hard: {
    id: 'hard', label: 'Hard', icon: '💀', desc: 'Fewer resources, stronger enemies, faster waves.',
    startGold: 80, startLumber: 40, startStone: 15,
    gruntHpMult: 1.5, gruntDmgMult: 1.4, gruntSpeedMult: 1.2, waveIntervalMult: 0.7,
  },
};

export const RTSGameRoot: React.FC = () => {
  const [gameKey, setGameKey] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const handleNewGame = useCallback(() => {
    setDifficulty(null);
    setGameKey(k => k + 1);
  }, []);

  if (!difficulty) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-black flex flex-col items-center justify-center gap-8">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌾</div>
          <h1 style={{ color: '#fde68a', fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>Farm RTS</h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Select difficulty</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => {
            const cfg = DIFFICULTY_CONFIGS[d];
            const border = d === 'easy' ? '#4ade80' : d === 'normal' ? '#60a5fa' : '#f87171';
            const bg = d === 'easy' ? 'rgba(74,222,128,0.08)' : d === 'normal' ? 'rgba(96,165,250,0.08)' : 'rgba(248,113,113,0.08)';
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                style={{
                  background: bg, border: `2px solid ${border}`, borderRadius: 12,
                  padding: '20px 28px', cursor: 'pointer', minWidth: 160,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  transition: 'transform 0.1s', color: '#f1f5f9',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span style={{ fontSize: 32 }}>{cfg.icon}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: border }}>{cfg.label}</span>
                <span style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', maxWidth: 130 }}>{cfg.desc}</span>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'left' }}>
                  <div>🪙 {cfg.startGold} 🌲 {cfg.startLumber} 🪨 {cfg.startStone}</div>
                  <div>Enemies: {Math.round(cfg.gruntHpMult * 100)}% HP / {Math.round(cfg.gruntDmgMult * 100)}% dmg</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <RTSMap key={gameKey} onNewGame={handleNewGame} difficulty={DIFFICULTY_CONFIGS[difficulty]} />
    </div>
  );
};
