import React from 'react';

import type { WorkerState } from '../RTSUI';

interface ControlGroupChipsProps {
  controlGroups: Record<number, number[]>;
  setSelectedType: React.Dispatch<
    React.SetStateAction<'worker' | 'farmhouse' | 'building' | null>
  >;
  setWorkers: React.Dispatch<React.SetStateAction<WorkerState[]>>;
}

export function ControlGroupChips({
  controlGroups,
  setSelectedType,
  setWorkers,
}: ControlGroupChipsProps) {
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
          {Object.entries(controlGroups).map(
            ([num, ids]) =>
              ids.length > 0 && (
                <div
                  key={num}
                  style={{
                    background: 'rgba(15,23,42,0.9)',
                    border: '1px solid #d97706',
                    color: '#fde68a',
                    padding: '2px 10px',
                    borderRadius: 4,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSelectedType('worker');
                    setWorkers(ws =>
                      ws.map(w => ({ ...w, selected: ids.includes(w.id) }))
                    );
                  }}
                >
                  [{num}] ×{ids.length}
                </div>
              )
          )}
        </div>
      )}

    </>
  );
}
