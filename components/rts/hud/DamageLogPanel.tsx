import React from 'react';

import type { WorkerState } from '../RTSUI';
import { TILE_SIZE } from '../game/constants';
import { tileToSvg } from '../game/map';

interface DamageLogPanelProps {
  damageLog: { source: string; amount: number; t: number }[];
  damageLogOpen: boolean;
  idleWorkerIndexRef: React.MutableRefObject<number>;
  setCamera: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setDamageLog: React.Dispatch<
    React.SetStateAction<{ source: string; amount: number; t: number }[]>
  >;
  setDamageLogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedType: React.Dispatch<
    React.SetStateAction<'worker' | 'farmhouse' | 'building' | null>
  >;
  setWorkers: React.Dispatch<React.SetStateAction<WorkerState[]>>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  underAttack: boolean;
  workers: WorkerState[];
}

export const DamageLogPanel: React.FC<DamageLogPanelProps> = ({
  damageLog,
  damageLogOpen,
  idleWorkerIndexRef,
  setCamera,
  setDamageLog,
  setDamageLogOpen,
  setSelectedType,
  setWorkers,
  svgRef,
  underAttack,
  workers,
}) => {
  return (
    <>
      {/* Damage log toggle + panel */}
      <button
        type="button"
        onClick={() => setDamageLogOpen(o => !o)}
        style={{
          position: 'absolute',
          bottom: 180,
          right: 8,
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid rgba(239,68,68,0.5)',
          color: '#fca5a5',
          fontSize: 11,
          padding: '3px 8px',
          borderRadius: 6,
          zIndex: 30,
          cursor: 'pointer',
        }}
      >
        📋 Combat Log {damageLog.length > 0 && `(${damageLog.length})`}
      </button>
      {damageLogOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 210,
            right: 8,
            width: 220,
            maxHeight: 280,
            overflowY: 'auto',
            background: 'rgba(10,10,20,0.95)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: 8,
            zIndex: 30,
            padding: 8,
            fontSize: 11,
            color: '#f1f5f9',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: '#ef4444',
              marginBottom: 6,
              borderBottom: '1px solid rgba(239,68,68,0.3)',
              paddingBottom: 4,
            }}
          >
            🏰 Barn Damage Log
          </div>
          {damageLog.length === 0 && (
            <div style={{ color: '#64748b' }}>No damage yet.</div>
          )}
          {[...damageLog]
            .reverse()
            .slice(0, 20)
            .map((entry, i) => {
              const ago = Math.round((Date.now() - entry.t) / 1000);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '2px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: i === 0 ? '#fca5a5' : '#94a3b8',
                  }}
                >
                  <span>{entry.source}</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>
                    -{entry.amount}{' '}
                    <span style={{ color: '#64748b', fontWeight: 400 }}>
                      {ago}s ago
                    </span>
                  </span>
                </div>
              );
            })}
          <button
            type="button"
            onClick={() => setDamageLog([])}
            style={{
              marginTop: 6,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 4,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Clear
          </button>
        </div>
      )}
      {(() => {
        const idleCount = workers.filter(
          w =>
            w.hp > 0 &&
            w.unitType === 'farmer' &&
            w.state === 'idle' &&
            !w.gathering &&
            !w.attacking &&
            !w.repairing
        ).length;
        if (idleCount === 0) return null;
        return (
          <button
            type="button"
            onClick={() => {
              setWorkers(ws => {
                const idleWorkers = ws.filter(
                  w =>
                    w.hp > 0 &&
                    w.state === 'idle' &&
                    !w.gathering &&
                    !w.attacking &&
                    !w.repairing
                );
                if (idleWorkers.length === 0) return ws;
                const idx = idleWorkerIndexRef.current % idleWorkers.length;
                idleWorkerIndexRef.current = (idx + 1) % idleWorkers.length;
                const target = idleWorkers[idx] ?? idleWorkers[0];
                if (!target) return ws;
                const { isoX, isoY } = tileToSvg(target.x, target.y);
                const svgEl = svgRef.current;
                if (svgEl) {
                  const rect = svgEl.getBoundingClientRect();
                  setCamera({
                    x: rect.width / 2 - isoX - TILE_SIZE / 2,
                    y: rect.height / 2 - isoY - 18,
                  });
                }
                return ws.map(w => ({ ...w, selected: w.id === target.id }));
              });
              setSelectedType('worker');
            }}
            style={{
              position: 'absolute',
              top: underAttack ? 90 : 56,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(124,45,18,0.92)',
              color: '#fed7aa',
              fontSize: 13,
              fontWeight: 700,
              padding: '5px 18px',
              borderRadius: 8,
              zIndex: 24,
              border: '1.5px solid #f97316',
              cursor: 'pointer',
              letterSpacing: 0.5,
            }}
          >
            🧑‍🌾 {idleCount} idle worker{idleCount > 1 ? 's' : ''} — click to
            select
          </button>
        );
      })()}
    </>
  );
};
