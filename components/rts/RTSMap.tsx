
"use client";
import React, { useState, useEffect, useRef } from 'react';

export const RTSMap: React.FC = () => {
  const gridSize = 9;
  const tileSize = 64;
  const trees = [
    { x: 2, y: 2 }, { x: 6, y: 3 }, { x: 4, y: 7 }, { x: 7, y: 6 }
  ];
  // Gold mine position
  const goldMine = { x: 1, y: 7 };

  // Camera state
  const [camera, setCamera] = useState({ x: 0, y: 0 });

  // Worker state
  const [worker, setWorker] = useState({ x: 5, y: 5, selected: false, movingTo: null as null | { x: number; y: number } });
  const animationRef = useRef<number | null>(null);

  // Handle worker movement animation
  useEffect(() => {
    if (!worker.movingTo) return;
    const speed = 0.08; // tiles per frame
    function animate() {
      setWorker(w => {
        if (!w.movingTo) return w;
        const dx = w.movingTo.x - w.x;
        const dy = w.movingTo.y - w.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.05) {
          return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: null };
        }
        return {
          ...w,
          x: w.x + dx * speed,
          y: w.y + dy * speed,
        };
      });
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [worker.movingTo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setCamera(cam => {
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
        <span style={{ color: '#bbf7d0', marginRight: 24 }}>Lumber: 0</span>
        <span style={{ color: '#fde68a' }}>Gold: 0</span>
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
          width={gridSize * tileSize * 2 + 200}
          height={gridSize * tileSize + 200}
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
                    setWorker(w => ({ ...w, movingTo: { x: i, y: j } }));
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
                      <circle cx={isoX + tileSize / 2} cy={isoY + 18} r={18} fill="#fbbf24" stroke="#78350f" strokeWidth={4} />
                      <text x={isoX + tileSize / 2} y={isoY + 26} textAnchor="middle" fontSize="18" fill="#78350f" fontWeight="bold">👨‍🌾</text>
                    </g>
                  );
                })()}
        {/* Trees */}
        {trees.map(({ x, y }, idx) => {
          const isoX = (x - y) * tileSize + gridSize * tileSize / 2 + tileSize;
          const isoY = (x + y) * tileSize / 2 + tileSize / 2;
          return (
            <g key={`tree-${idx}`}>
              <ellipse cx={isoX + tileSize / 2} cy={isoY + 10} rx={18} ry={28} fill="#166534" stroke="#052e16" strokeWidth={3} />
              <rect x={isoX + tileSize / 2 - 6} y={isoY + 28} width={12} height={18} fill="#78350f" />
            </g>
          );
        })}
        {/* Gold Mine (clickable debug marker) */}
        {(() => {
          const { x, y } = goldMine;
          const isoX = (x - y) * tileSize + gridSize * tileSize / 2 + tileSize;
          const isoY = (x + y) * tileSize / 2 + tileSize / 2;
          return (
            <g key="gold-mine">
              <ellipse cx={isoX + tileSize / 2} cy={isoY + 24} rx={28} ry={20} fill="#fde68a" stroke="#b45309" strokeWidth={4} style={{ cursor: 'pointer' }}
                onClick={() => alert('Gold mine clicked!')} />
              <rect x={isoX + tileSize / 2 - 18} y={isoY + 24} width={36} height={18} fill="#a16207" stroke="#854d0e" strokeWidth={2} rx={8} />
              <text x={isoX + tileSize / 2} y={isoY + 40} textAnchor="middle" fontSize="18" fill="#b45309" fontWeight="bold">⛏️</text>
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
