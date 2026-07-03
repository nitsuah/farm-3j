import React from 'react';

import type { WorkerState } from '../game/types';

interface ControlGroupChipsProps {
  controlGroups: Record<number, number[]>;
  setSelectedType: React.Dispatch<
    React.SetStateAction<'worker' | 'farmhouse' | 'building' | null>
  >;
  setWorkers: React.Dispatch<React.SetStateAction<WorkerState[]>>;
}

export const ControlGroupChips: React.FC<ControlGroupChipsProps> = ({
  controlGroups,
  setSelectedType,
  setWorkers,
}) => {
  return (
    <>
      {/* Control group chips */}
      {Object.keys(controlGroups).length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 8,
            zIndex: 15,
            display: 'flex',
            gap: 6,
          }}
        >
          {Object.entries(controlGroups).map(([num, ids]) => {
            if (ids.length === 0) return null;
            const selectGroup = () => {
              setSelectedType('worker');
              setWorkers(ws =>
                ws.map(w => ({ ...w, selected: ids.includes(w.id) }))
              );
            };
            return (
              <button
                key={num}
                type="button"
                style={{
                  background: 'rgba(15,23,42,0.9)',
                  border: '1px solid #d97706',
                  color: '#fde68a',
                  padding: '2px 10px',
                  borderRadius: 4,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
                onClick={selectGroup}
              >
                [{num}] ×{ids.length}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};
