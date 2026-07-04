import React from 'react';

import { PLAYER_BARN_MAX_HP } from '../game/constants';

interface AlertsOverlayProps {
  gameOver: 'victory' | 'defeat' | null;
  gameSpeed: number;
  playerBarnHp: number;
  underAttack: boolean;
  waveAnnouncement: string | null;
  wavePreview: string | null;
}

export const AlertsOverlay: React.FC<AlertsOverlayProps> = ({
  gameOver,
  gameSpeed,
  playerBarnHp,
  underAttack,
  waveAnnouncement,
  wavePreview,
}) => {
  return (
    <>
      {/* Wave announcement */}
      {wavePreview && (
        <div
          style={{
            position: 'absolute',
            top: '18%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(120,53,15,0.92)',
            color: '#fde68a',
            fontSize: 13,
            fontWeight: 700,
            padding: '6px 20px',
            borderRadius: 8,
            zIndex: 24,
            pointerEvents: 'none',
            border: '2px solid #f59e0b',
            letterSpacing: 0.5,
            maxWidth: '80vw',
            textAlign: 'center',
          }}
        >
          {wavePreview}
        </div>
      )}
      {/* Critical HP vignette — red pulse at screen edges when barn < 25% */}
      {!gameOver && playerBarnHp / PLAYER_BARN_MAX_HP < 0.25 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 30,
            background:
              'radial-gradient(ellipse at center, transparent 60%, rgba(220,38,38,0.35) 100%)',
            animation: 'pulse 1.2s infinite',
          }}
        />
      )}

      {!gameOver && gameSpeed === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '38%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.75)',
            color: '#fde68a',
            fontSize: 20,
            fontWeight: 800,
            padding: '12px 36px',
            borderRadius: 14,
            zIndex: 35,
            pointerEvents: 'none',
            border: '2px solid rgba(251,191,36,0.5)',
            letterSpacing: 1,
            textAlign: 'center',
          }}
        >
          ⏸ PAUSED
          <br />
          <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>
            Click ▶ Start to begin
          </span>
        </div>
      )}
      {waveAnnouncement && (
        <div
          style={{
            position: 'absolute',
            top: '22%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(127,29,29,0.92)',
            color: '#fca5a5',
            fontSize: 28,
            fontWeight: 800,
            padding: '10px 32px',
            borderRadius: 12,
            zIndex: 25,
            pointerEvents: 'none',
            border: '2px solid #ef4444',
            letterSpacing: 1,
          }}
        >
          {waveAnnouncement}
        </div>
      )}

      {underAttack && (
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(185,28,28,0.92)',
            color: '#fecaca',
            fontSize: 15,
            fontWeight: 800,
            padding: '6px 28px',
            borderRadius: 8,
            zIndex: 26,
            pointerEvents: 'none',
            border: '2px solid #ef4444',
            letterSpacing: 1,
            animation: 'pulse 0.6s infinite',
          }}
        >
          ⚠ UNDER ATTACK ⚠
        </div>
      )}
    </>
  );
};
