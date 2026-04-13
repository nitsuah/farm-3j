
"use client";
import React, { useState, useEffect, useRef } from 'react';


  const gridSize = 9;
  const tileSize = 64;
  // Resource nodes: trees and gold mine
  const [trees, setTrees] = useState([
    { x: 2, y: 2, amount: 50 },
    { x: 6, y: 3, amount: 50 },
    { x: 4, y: 7, amount: 50 },
    { x: 7, y: 6, amount: 50 },
  ]);
  const [goldMine, setGoldMine] = useState({ x: 1, y: 7, amount: 100 });

  // Camera state
  const [camera, setCamera] = useState({ x: 0, y: 0 });

  // Resource state
  const [resources, setResources] = useState({ gold: 0, lumber: 0 });

  // Worker state
  type WorkerState = {
    x: number;
    y: number;
    selected: boolean;
    movingTo: null | { x: number; y: number };
    gathering?: null | { type: 'tree' | 'gold', idx: number };
    carrying: { gold: number; lumber: number };
    state: 'idle' | 'moving' | 'gathering' | 'returning';
  };
  const [worker, setWorker] = useState<WorkerState>({
    x: 5,
    y: 5,
    selected: false,
    movingTo: null,
    gathering: null,
    carrying: { gold: 0, lumber: 0 },
    state: 'idle',
  });
  const animationRef = useRef<number | null>(null);

  // Handle worker movement animation
  // Worker movement and gather/deposit logic
  useEffect(() => {
    const speed = 0.025;
    let gatherTimeout: number | null = null;
    function animate() {
      setWorker((w: WorkerState) => {
        // If moving to a target
        if (w.movingTo) {
          const dx = w.movingTo.x - w.x;
          const dy = w.movingTo.y - w.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.05) {
            // Arrived at destination
            // If gathering, start gather
            if (w.gathering) {
              return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: null, state: 'gathering' };
            }
            // If returning to barn
            if (w.state === 'returning') {
              // Deposit resources
              setResources((r: typeof resources) => ({
                gold: r.gold + w.carrying.gold,
                lumber: r.lumber + w.carrying.lumber
              }));
              return {
                ...w,
                x: w.movingTo.x,
                y: w.movingTo.y,
                movingTo: null,
                carrying: { gold: 0, lumber: 0 },
                state: 'idle',
                gathering: null,
              };
            }
            // Otherwise, just stop
            return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: null, state: 'idle' };
          }
          return {
            ...w,
            x: w.x + dx * speed,
            y: w.y + dy * speed,
            state: w.gathering ? 'moving' : w.state,
          };
        }
        // If gathering
        if (w.state === 'gathering' && w.gathering) {
          // Simulate gather delay
          if (!gatherTimeout) {
            gatherTimeout = window.setTimeout(() => {
              setWorker((w2: WorkerState) => {
                // Only gather if still at node
                if (w2.state !== 'gathering' || !w2.gathering) return w2;
                if (w2.gathering.type === 'tree') {
                  setTrees((ts: typeof trees) => ts.map((t: typeof trees[0], idx: number) => idx === w2.gathering!.idx ? { ...t, amount: Math.max(0, t.amount - 10) } : t));
                  return {
                    ...w2,
                    carrying: { ...w2.carrying, lumber: w2.carrying.lumber + 10 },
                    state: 'returning',
                    movingTo: { x: 4, y: 4 }, // Barn
                  };
                } else if (w2.gathering.type === 'gold') {
                  setGoldMine((gm: typeof goldMine) => ({ ...gm, amount: Math.max(0, gm.amount - 10) }));
                  return {
                    ...w2,
                    carrying: { ...w2.carrying, gold: w2.carrying.gold + 10 },
                    state: 'returning',
                    movingTo: { x: 4, y: 4 }, // Barn
                  };
                }
                return w2;
              });
            }, 900); // 0.9s gather time
          }
        }
        return w;
      });
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (gatherTimeout) clearTimeout(gatherTimeout);
    };
  }, [worker.movingTo, worker.state, worker.gathering]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setCamera((cam: typeof camera) => {
        let { x, y } = cam;
        // Reverse all directions
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') y += 32;
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') y -= 32;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') x += 32;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') x -= 32;
        return { x, y };
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="absolute inset-0 bg-green-900">
      {/* Resource bar UI (persistent, top) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 48,
        background: 'rgba(30,41,59,0.95)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        fontSize: 20,
        zIndex: 20,
        borderBottom: '4px solid #fbbf24',
        fontWeight: 700
      }}>
        <span style={{ color: '#bbf7d0', marginRight: 24 }}>Lumber: {resources.lumber}</span>
        <span style={{ color: '#fde68a' }}>Gold: {resources.gold}</span>
      </div>
      {/* Debug overlay for camera position */}
      <div style={{ position: 'absolute', top: 56, left: 8, zIndex: 10, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 12px', borderRadius: 6, fontSize: 14 }}>
        Camera: x={camera.x}, y={camera.y}
      </div>
      {/* Isometric grid */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        pointerEvents: 'none',
      }}>
        <svg
          viewBox={`0 0 ${gridSize * tileSize * 2 + 200} ${gridSize * tileSize + 200}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: 'block',
            border: '2px dashed #fbbf24', // debug border
            background: 'none',
            pointerEvents: 'auto',
            transform: `translate(${camera.x}px,${camera.y}px)`
          }}
        >
        {[...Array(gridSize)].map((_, i) =>
          [...Array(gridSize)].map((_, j) => {
            const isoX = (i - j) * tileSize + gridSize * tileSize / 2;
            const isoY = (i + j) * tileSize / 2;
            return (
              <polygon
                key={`tile-${i}-${j}`}
                points={
                  [
                    [isoX, isoY + tileSize / 2],
                    [isoX + tileSize, isoY],
                    [isoX + tileSize * 2, isoY + tileSize / 2],
                    [isoX + tileSize, isoY + tileSize]
                  ].map(p => p.join(",")).join(" ")
                }
                fill="#14532d"
                stroke="#222"
                strokeWidth={2}
                onContextMenu={e => {
                  e.preventDefault();
                  if (worker.selected) {
                    setWorker(w => ({ ...w, movingTo: { x: i, y: j }, gathering: null, state: 'moving' }));
                  }
                }}
                style={{ cursor: worker.selected ? 'pointer' : undefined }}
              />
            );
          })
        )}
                {/* Worker unit */}
                {(() => {
                  const wx = worker.x;
                  const wy = worker.y;
                  const isoX = (wx - wy) * tileSize + gridSize * tileSize / 2 + tileSize;
                  const isoY = (wx + wy) * tileSize / 2 + tileSize / 2;
                  return (
                    <g key="worker" onClick={() => setWorker(w => ({ ...w, selected: !w.selected }))} style={{ cursor: 'pointer' }}>
                      {/* Selection ring */}
                      {worker.selected && (
                        <ellipse cx={isoX + tileSize / 2} cy={isoY + 32} rx={22} ry={10} fill="none" stroke="#38bdf8" strokeWidth={4} />
                      )}
                      {/* Worker body */}
                      <circle cx={isoX + tileSize / 2} cy={isoY + 18} r={18} fill={worker.state === 'gathering' ? '#fde68a' : '#fbbf24'} stroke="#78350f" strokeWidth={4} />
                      <text x={isoX + tileSize / 2} y={isoY + 26} textAnchor="middle" fontSize="18" fill="#78350f" fontWeight="bold">👨‍🌾</text>
                      {/* Carrying icon */}
                      {(worker.carrying.gold > 0 || worker.carrying.lumber > 0) && (
                        <text x={isoX + tileSize / 2} y={isoY + 44} textAnchor="middle" fontSize="16" fill="#fde68a">{worker.carrying.gold > 0 ? `🪙${worker.carrying.gold}` : ''}{worker.carrying.lumber > 0 ? `🌲${worker.carrying.lumber}` : ''}</text>
                      )}
                    </g>
                  );
                })()}
        {/* Trees (resource nodes) */}
        {trees.map(({ x, y, amount }, idx) => {
          const isoX = (x - y) * tileSize + gridSize * tileSize / 2 + tileSize;
          const isoY = (x + y) * tileSize / 2 + tileSize / 2;
          return (
            <g key={`tree-${idx}`}
              style={{ cursor: amount > 0 ? 'pointer' : 'not-allowed', opacity: amount > 0 ? 1 : 0.4 }}
              onContextMenu={e => {
                e.preventDefault();
                if (worker.selected && amount > 0) {
                  setWorker(w => ({
                    ...w,
                    movingTo: { x, y },
                    gathering: { type: 'tree', idx },
                    state: 'moving',
                  }));
                }
              }}
            >
              <ellipse cx={isoX + tileSize / 2} cy={isoY + 10} rx={18} ry={28} fill="#166534" stroke="#052e16" strokeWidth={3} />
              <rect x={isoX + tileSize / 2 - 6} y={isoY + 28} width={12} height={18} fill="#78350f" />
              {/* Resource amount bar */}
              <rect x={isoX + tileSize / 2 - 18} y={isoY - 16} width={36} height={6} fill="#052e16" />
              <rect x={isoX + tileSize / 2 - 18} y={isoY - 16} width={36 * (amount / 50)} height={6} fill="#bbf7d0" />
            </g>
          );
        })}
        {/* Gold Mine (resource node) */}
        {(() => {
          const { x, y, amount } = goldMine;
          const isoX = (x - y) * tileSize + gridSize * tileSize / 2 + tileSize;
          const isoY = (x + y) * tileSize / 2 + tileSize / 2;
          return (
            <g key="gold-mine"
              style={{ cursor: amount > 0 ? 'pointer' : 'not-allowed', opacity: amount > 0 ? 1 : 0.4 }}
              onContextMenu={e => {
                e.preventDefault();
                if (worker.selected && amount > 0) {
                  setWorker(w => ({
                    ...w,
                    movingTo: { x, y },
                    gathering: { type: 'gold', idx: 0 },
                    state: 'moving',
                  }));
                }
              }}
            >
              <ellipse cx={isoX + tileSize / 2} cy={isoY + 24} rx={28} ry={20} fill="#fde68a" stroke="#b45309" strokeWidth={4} />
              <rect x={isoX + tileSize / 2 - 18} y={isoY + 24} width={36} height={18} fill="#a16207" stroke="#854d0e" strokeWidth={2} rx={8} />
              <text x={isoX + tileSize / 2} y={isoY + 40} textAnchor="middle" fontSize="18" fill="#b45309" fontWeight="bold">⛏️</text>
              {/* Resource amount bar */}
              <rect x={isoX + tileSize / 2 - 28} y={isoY + 8} width={56} height={6} fill="#a16207" />
              <rect x={isoX + tileSize / 2 - 28} y={isoY + 8} width={56 * (amount / 100)} height={6} fill="#fde68a" />
            </g>
          );
        })()}
        {/* Main Barn (Town Hall) */}
        <g>
          <rect
            x={(4 - 4) * tileSize + gridSize * tileSize / 2 + tileSize}
            y={(4 + 4) * tileSize / 2 + tileSize / 2}
            width={tileSize}
            height={tileSize}
            fill="#fde68a"
            stroke="#b45309"
            strokeWidth={6}
            rx={16}
          />
          {/* Barn roof */}
          <polygon
            points={[
              [(4 - 4) * tileSize + gridSize * tileSize / 2 + tileSize, (4 + 4) * tileSize / 2 + tileSize / 2],
              [(4 - 4) * tileSize + gridSize * tileSize / 2 + tileSize + tileSize / 2, (4 + 4) * tileSize / 2 + tileSize / 2 - 32],
              [(4 - 4) * tileSize + gridSize * tileSize / 2 + tileSize + tileSize, (4 + 4) * tileSize / 2 + tileSize / 2],
            ].map(p => p.join(",")).join(" ")}
            fill="#b91c1c"
            stroke="#7f1d1d"
            strokeWidth={4}
          />
        </g>
        </svg>
      </div>
    </div>
  );
};
