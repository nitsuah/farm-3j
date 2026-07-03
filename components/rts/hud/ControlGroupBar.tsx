import React from 'react';

import type { WorkerState } from '../game/types';

interface ControlGroupBarProps {
  controlGroups: Record<number, number[]>;
  workers: WorkerState[];
}

export const ControlGroupBar: React.FC<ControlGroupBarProps> = ({
  controlGroups,
  workers,
}) => {
  return (
    <>
      {/* Control group bar */}
      {Object.keys(controlGroups).some(
        k => (controlGroups[Number(k)]?.length ?? 0) > 0
      ) && (
        <div
          style={{
            position: 'absolute',
            top: 44,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 4,
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
            const ids = controlGroups[n];
            if (!ids?.length) return null;
            const alive = workers.filter(w => ids.includes(w.id) && w.hp > 0);
            if (!alive.length) return null;
            return (
              <div
                key={n}
                style={{
                  background: 'rgba(15,23,42,0.85)',
                  border: '1px solid rgba(99,102,241,0.5)',
                  borderRadius: 5,
                  padding: '2px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 32,
                }}
              >
                <span
                  style={{ color: '#a5b4fc', fontSize: 11, fontWeight: 700 }}
                >
                  {n}
                </span>
                <span style={{ color: '#e2e8f0', fontSize: 10 }}>
                  {alive.length}u
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
