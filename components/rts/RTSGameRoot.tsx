import React, { useState, useCallback, useEffect } from 'react';
import RTSMap from './RTSMap';
import { loadSlotMeta, type SaveSlot, type SlotMeta } from './game/persistence';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'demo';

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
  demo: {
    id: 'demo',
    label: 'Demo',
    icon: '🤖',
    desc: 'Watch an AI bot play automatically. Great for showcases and e2e testing.',
    startGold: 200,
    startLumber: 120,
    startStone: 40,
    gruntHpMult: 0.8,
    gruntDmgMult: 0.8,
    gruntSpeedMult: 0.9,
    waveIntervalMult: 1.3,
  },
  easy: {
    id: 'easy',
    label: 'Easy',
    icon: '🌻',
    desc: 'More starting resources, weaker enemies. Good for learning.',
    startGold: 300,
    startLumber: 160,
    startStone: 60,
    gruntHpMult: 0.7,
    gruntDmgMult: 0.7,
    gruntSpeedMult: 0.8,
    waveIntervalMult: 1.4,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    icon: '⚔️',
    desc: 'Balanced experience. Recommended for most players.',
    startGold: 150,
    startLumber: 80,
    startStone: 30,
    gruntHpMult: 1.0,
    gruntDmgMult: 1.0,
    gruntSpeedMult: 1.0,
    waveIntervalMult: 1.0,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    icon: '💀',
    desc: 'Fewer resources, stronger enemies, faster waves.',
    startGold: 80,
    startLumber: 40,
    startStone: 15,
    gruntHpMult: 1.5,
    gruntDmgMult: 1.4,
    gruntSpeedMult: 1.2,
    waveIntervalMult: 0.7,
  },
};

type Screen = 'slots' | 'difficulty';

function formatDate(ts: number): string {
  if (!ts) return 'Unknown date';
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const DIFF_ICONS: Record<string, string> = {
  easy: '🌻',
  normal: '⚔️',
  hard: '💀',
  demo: '🤖',
};

export const RTSGameRoot: React.FC = () => {
  const [gameKey, setGameKey] = useState(0);
  const [screen, setScreen] = useState<Screen>('slots');
  const [slot, setSlot] = useState<SaveSlot>(0);
  const [pendingSlot, setPendingSlot] = useState<SaveSlot>(0);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [slotMetas, setSlotMetas] = useState<(SlotMeta | null)[]>([
    null,
    null,
    null,
  ]);

  useEffect(() => {
    setSlotMetas(([0, 1, 2] as SaveSlot[]).map(s => loadSlotMeta(s)));
  }, [gameKey]);

  const handleNewGame = useCallback(() => {
    setDifficulty(null);
    setScreen('slots');
    setGameKey(k => k + 1);
  }, []);

  // Running the game
  if (difficulty !== null) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-black">
        <RTSMap
          key={gameKey}
          onNewGame={handleNewGame}
          difficulty={DIFFICULTY_CONFIGS[difficulty]}
          slot={slot}
        />
      </div>
    );
  }

  // Difficulty picker
  if (screen === 'difficulty') {
    return (
      <div className="relative flex h-screen w-screen flex-col items-center justify-center gap-8 overflow-hidden bg-black">
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setScreen('slots')}
            style={{
              color: '#64748b',
              fontSize: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: 8,
            }}
          >
            ← Back to slots
          </button>
          <div style={{ fontSize: 32 }}>⚔️</div>
          <h1
            style={{
              color: '#fde68a',
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            Select Difficulty
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
            Slot {pendingSlot + 1} — new game
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => {
            const cfg = DIFFICULTY_CONFIGS[d];
            const border =
              d === 'easy' ? '#4ade80' : d === 'normal' ? '#60a5fa' : '#f87171';
            const bg =
              d === 'easy'
                ? 'rgba(74,222,128,0.08)'
                : d === 'normal'
                  ? 'rgba(96,165,250,0.08)'
                  : 'rgba(248,113,113,0.08)';
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setSlot(pendingSlot);
                  setDifficulty(d);
                }}
                style={{
                  background: bg,
                  border: `2px solid ${border}`,
                  borderRadius: 12,
                  padding: '20px 28px',
                  cursor: 'pointer',
                  minWidth: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  color: '#f1f5f9',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.transform = 'scale(1.05)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
              >
                <span style={{ fontSize: 32 }}>{cfg.icon}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: border }}>
                  {cfg.label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: '#94a3b8',
                    textAlign: 'center',
                    maxWidth: 130,
                  }}
                >
                  {cfg.desc}
                </span>
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    marginTop: 4,
                    textAlign: 'left',
                  }}
                >
                  <div>
                    🪙 {cfg.startGold} 🌲 {cfg.startLumber} 🪨 {cfg.startStone}
                  </div>
                  <div>
                    Enemies: {Math.round(cfg.gruntHpMult * 100)}% HP /{' '}
                    {Math.round(cfg.gruntDmgMult * 100)}% dmg
                  </div>
                </div>
              </button>
            );
          })}
          {/* Demo / bot mode */}
          {(() => {
            const cfg = DIFFICULTY_CONFIGS.demo;
            return (
              <button
                key="demo"
                type="button"
                onClick={() => {
                  setSlot(pendingSlot);
                  setDifficulty('demo');
                }}
                style={{
                  background: 'rgba(167,139,250,0.08)',
                  border: '2px dashed #a78bfa',
                  borderRadius: 12,
                  padding: '20px 28px',
                  cursor: 'pointer',
                  minWidth: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  color: '#f1f5f9',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.transform = 'scale(1.05)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
              >
                <span style={{ fontSize: 32 }}>{cfg.icon}</span>
                <span
                  style={{ fontSize: 20, fontWeight: 700, color: '#a78bfa' }}
                >
                  {cfg.label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: '#94a3b8',
                    textAlign: 'center',
                    maxWidth: 130,
                  }}
                >
                  {cfg.desc}
                </span>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  AI controls all units
                </div>
              </button>
            );
          })()}
        </div>
      </div>
    );
  }

  // Slot picker
  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center gap-6 overflow-hidden bg-black">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🌾</div>
        <h1
          style={{
            color: '#fde68a',
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: 1,
          }}
        >
          Farm RTS
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
          Choose a save slot
        </p>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {([0, 1, 2] as SaveSlot[]).map(s => {
          const meta = slotMetas[s] ?? null;
          const hasSave = meta !== null;
          return (
            <div
              key={s}
              style={{
                border: '2px solid #334155',
                borderRadius: 12,
                padding: '20px 24px',
                minWidth: 180,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(15,23,42,0.8)',
              }}
            >
              <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                Slot {s + 1}
              </div>
              {hasSave ? (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>
                      {DIFF_ICONS[meta.difficultyId ?? 'normal'] ?? '⚔️'}
                    </div>
                    <div
                      style={{
                        color: '#fde68a',
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      Wave {meta.wave}
                    </div>
                    <div
                      style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}
                    >
                      {meta.difficultyId
                        ? meta.difficultyId.charAt(0).toUpperCase() +
                          meta.difficultyId.slice(1)
                        : 'Normal'}
                    </div>
                    {meta.savedAt > 0 && (
                      <div
                        style={{ color: '#475569', fontSize: 10, marginTop: 4 }}
                      >
                        {formatDate(meta.savedAt)}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSlot(s);
                      setDifficulty(
                        (meta.difficultyId as Difficulty) ?? 'normal'
                      );
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 0',
                      borderRadius: 8,
                      border: '1.5px solid #22c55e',
                      background: 'rgba(34,197,94,0.12)',
                      color: '#86efac',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background =
                        'rgba(34,197,94,0.25)')
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.background =
                        'rgba(34,197,94,0.12)')
                    }
                  >
                    ▶ Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingSlot(s);
                      setScreen('difficulty');
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 0',
                      borderRadius: 8,
                      border: '1.5px solid #475569',
                      background: 'rgba(71,85,105,0.15)',
                      color: '#94a3b8',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background =
                        'rgba(71,85,105,0.35)')
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.background =
                        'rgba(71,85,105,0.15)')
                    }
                  >
                    🆕 New Game (overwrite)
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{ color: '#475569', fontSize: 28, margin: '8px 0' }}
                  >
                    —
                  </div>
                  <div style={{ color: '#475569', fontSize: 12 }}>
                    Empty slot
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingSlot(s);
                      setScreen('difficulty');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 0',
                      borderRadius: 8,
                      border: '1.5px solid #60a5fa',
                      background: 'rgba(96,165,250,0.12)',
                      color: '#93c5fd',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background =
                        'rgba(96,165,250,0.25)')
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.background =
                        'rgba(96,165,250,0.12)')
                    }
                  >
                    🆕 New Game
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
