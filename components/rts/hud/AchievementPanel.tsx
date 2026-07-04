import React from 'react';

import {
  ALL_ACHIEVEMENTS,
  getEarnedAchievements,
} from '../game/achievements';

interface AchievementPanelProps {
  onClose: () => void;
}

export const AchievementPanel: React.FC<AchievementPanelProps> = ({
  onClose,
}) => {
  const earned = getEarnedAchievements();
  const total = ALL_ACHIEVEMENTS.length;
  const count = ALL_ACHIEVEMENTS.filter(a => earned.has(a.id)).length;

  return (
    <div
      style={{
        position: 'fixed',
        top: '5.5rem',
        right: '0.5rem',
        zIndex: 160,
        background: 'rgba(15,12,40,0.97)',
        border: '1.5px solid #7c3aed',
        borderRadius: '0.75rem',
        padding: '0.75rem',
        width: '17rem',
        maxHeight: '70vh',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(109,40,217,0.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <span
          style={{
            color: '#c4b5fd',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
          }}
        >
          🏆 Achievements ({count}/{total})
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#7c3aed',
            fontSize: '1rem',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '0.1rem 0.3rem',
          }}
        >
          ✕
        </button>
      </div>
      {/* Progress bar */}
      <div
        style={{
          height: '4px',
          background: '#1e1b4b',
          borderRadius: '2px',
          marginBottom: '0.6rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(count / total) * 100}%`,
            background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      {/* Achievement list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {ALL_ACHIEVEMENTS.map(a => {
          const unlocked = earned.has(a.id);
          return (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.35rem 0.5rem',
                background: unlocked
                  ? 'rgba(109,40,217,0.2)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${unlocked ? '#7c3aed' : '#2e1065'}`,
                borderRadius: '0.4rem',
                opacity: unlocked ? 1 : 0.5,
              }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '0.05rem' }}>
                {unlocked ? a.emoji : '🔒'}
              </span>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: unlocked ? '#f5f3ff' : '#6b7280',
                  }}
                >
                  {a.name}
                </div>
                <div
                  style={{
                    fontSize: '0.62rem',
                    color: unlocked ? '#c4b5fd' : '#4b5563',
                    lineHeight: 1.3,
                  }}
                >
                  {a.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
