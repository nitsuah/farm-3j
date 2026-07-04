import React from 'react';

import type { WorkerState } from '../game/types';
import { loadHighScores, clearSave, type SaveSlot } from '../game/persistence';
import type { PlacedBuilding } from '../game/types';
import { Stat } from '../ui/Stat';

interface GameOverOverlayProps {
  gameEndTime: number | null;
  gameOver: 'victory' | 'defeat' | null;
  killCount: number;
  onNewGame?: () => void;
  placedBuildings: PlacedBuilding[];
  slot: SaveSlot;
  startTimeRef: React.RefObject<number>;
  totalGold: number;
  totalLumber: number;
  totalStone: number;
  wave: number;
  workers: WorkerState[];
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  gameEndTime,
  gameOver,
  killCount,
  onNewGame,
  placedBuildings,
  slot,
  startTimeRef,
  totalGold,
  totalLumber,
  totalStone,
  wave,
  workers,
}) => {
  return (
    <>
      {/* Victory / Defeat overlay */}
      {gameOver &&
        (() => {
          const elapsed = Math.floor(
            ((gameEndTime ?? Date.now()) - startTimeRef.current) / 1000
          );
          const mins = Math.floor(elapsed / 60),
            secs = elapsed % 60;
          const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
          const accentColor = gameOver === 'victory' ? '#fbbf24' : '#ef4444';
          return (
            <div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.88)' }}
            >
              <div className="mb-3 text-7xl">
                {gameOver === 'victory' ? '🏆' : '💀'}
              </div>
              <div
                className="mb-1 text-4xl font-bold"
                style={{ color: accentColor }}
              >
                {gameOver === 'victory' ? 'Victory!' : 'Defeat!'}
              </div>
              <div className="mb-6 text-base text-slate-400">
                {gameOver === 'victory'
                  ? 'The enemy farm has fallen.'
                  : 'Your barn was destroyed by enemy forces.'}
              </div>
              {/* Score card */}
              <div
                style={{
                  background: 'rgba(15,23,42,0.9)',
                  border: `2px solid ${accentColor}30`,
                  borderRadius: 16,
                  padding: '20px 40px',
                  marginBottom: 16,
                  minWidth: 320,
                }}
              >
                <div
                  style={{
                    color: accentColor,
                    fontWeight: 800,
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    marginBottom: 14,
                    textAlign: 'center',
                  }}
                >
                  Battle Report
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px 32px',
                  }}
                >
                  <Stat label="Waves Survived" value={wave} color="#f97316" />
                  <Stat
                    label="Grunts Killed"
                    value={killCount}
                    color="#4ade80"
                  />
                  <Stat
                    label="Gold Mined"
                    value={`${totalGold}🪙`}
                    color="#fde68a"
                  />
                  <Stat
                    label="Lumber Cut"
                    value={`${totalLumber}🌲`}
                    color="#bbf7d0"
                  />
                  <Stat
                    label="Stone Mined"
                    value={`${totalStone}🪨`}
                    color="#cbd5e1"
                  />
                  <Stat
                    label="Buildings"
                    value={placedBuildings.filter(b => !b.constructing).length}
                    color="#a78bfa"
                  />
                  <Stat
                    label="Survivors"
                    value={workers.filter(w => w.hp > 0).length}
                    color="#38bdf8"
                  />
                  <Stat label="Time" value={timeStr} color="#94a3b8" />
                </div>
              </div>
              {/* High score table */}
              {(() => {
                const scores = loadHighScores();
                if (scores.length === 0) return null;
                return (
                  <div
                    style={{
                      background: 'rgba(15,23,42,0.85)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      padding: '12px 24px',
                      marginBottom: 20,
                      minWidth: 320,
                    }}
                  >
                    <div
                      style={{
                        color: '#94a3b8',
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 2,
                        marginBottom: 8,
                        textAlign: 'center',
                      }}
                    >
                      🏆 Best Runs
                    </div>
                    <table
                      style={{
                        width: '100%',
                        fontSize: 12,
                        borderCollapse: 'collapse',
                      }}
                    >
                      <thead>
                        <tr style={{ color: '#64748b' }}>
                          <th style={{ textAlign: 'left', paddingBottom: 4 }}>
                            Date
                          </th>
                          <th>Wave</th>
                          <th>Kills</th>
                          <th>Gold</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scores.map((s, i) => (
                          <tr
                            key={i}
                            style={{
                              color: i === 0 ? '#fbbf24' : '#94a3b8',
                              borderTop: '1px solid rgba(255,255,255,0.05)',
                            }}
                          >
                            <td style={{ paddingTop: 3 }}>{s.date}</td>
                            <td style={{ textAlign: 'center' }}>{s.wave}</td>
                            <td style={{ textAlign: 'center' }}>{s.kills}</td>
                            <td style={{ textAlign: 'center' }}>{s.gold}🪙</td>
                            <td style={{ textAlign: 'center' }}>
                              {s.result === 'victory' ? '🏆' : '💀'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
              <button
                type="button"
                className="rounded-lg border-2 border-amber-500 bg-amber-500/20 px-8 py-3 text-lg text-amber-200 hover:bg-amber-500/40"
                onClick={() => {
                  clearSave(slot);
                  if (onNewGame) onNewGame();
                  else window.location.reload();
                }}
              >
                Play Again
              </button>
            </div>
          );
        })()}
    </>
  );
};
