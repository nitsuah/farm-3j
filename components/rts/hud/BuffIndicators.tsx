import React from 'react';

interface BuffIndicatorsProps {
  dayPhase: 'day' | 'night';
  phaseAnnouncement: string | null;
  shrinePlentyBuff: boolean;
  shrineWarBuff: boolean;
}

export const BuffIndicators: React.FC<BuffIndicatorsProps> = ({
  dayPhase,
  phaseAnnouncement,
  shrinePlentyBuff,
  shrineWarBuff,
}) => {
  return (
    <>
      {/* Shrine buff indicators */}
      {(shrineWarBuff || shrinePlentyBuff) && (
        <div
          style={{
            position: 'absolute',
            top: 56,
            right: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            zIndex: 22,
            pointerEvents: 'none',
          }}
        >
          {shrineWarBuff && (
            <div
              style={{
                background: 'rgba(124,58,237,0.85)',
                color: '#fef3c7',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 6,
                border: '1px solid #f97316',
              }}
            >
              ⚔️ War Shrine: +5 ATK
            </div>
          )}
          {shrinePlentyBuff && (
            <div
              style={{
                background: 'rgba(6,78,59,0.85)',
                color: '#d1fae5',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 6,
                border: '1px solid #4ade80',
              }}
            >
              🌾 Plenty Shrine: +15% Gather
            </div>
          )}
        </div>
      )}

      {phaseAnnouncement && (
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            background:
              dayPhase === 'night'
                ? 'rgba(15,10,40,0.95)'
                : 'rgba(120,80,0,0.92)',
            color: dayPhase === 'night' ? '#a5b4fc' : '#fde68a',
            fontSize: 24,
            fontWeight: 800,
            padding: '10px 28px',
            borderRadius: 12,
            zIndex: 24,
            pointerEvents: 'none',
            border: `2px solid ${dayPhase === 'night' ? '#6366f1' : '#fbbf24'}`,
            letterSpacing: 1,
          }}
        >
          {phaseAnnouncement}
        </div>
      )}
    </>
  );
};
