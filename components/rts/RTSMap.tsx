"use client";
import React, { useState, useEffect, useRef } from 'react';

const RTSMap: React.FC = () => {
  // Debug: show worker and resource state
  // ...existing code...
  const gridSize = 13; // expanded map
  const tileSize = 64;

  // Tile types: grass, dirt, water, trees, rocks
  type TileType = 'grass' | 'dirt' | 'water' | 'tree' | 'rock';
  const [zoom, setZoom] = useState(1);
  // Generate a full 13x13 map so rendering indexes always match gridSize.
  const [tiles] = useState<TileType[][]>(() =>
    Array.from({ length: gridSize }, (_, i) =>
      Array.from({ length: gridSize }, (_, j) => {
        if ((i >= 1 && i <= 3 && j >= 1 && j <= 2) || (i >= 8 && i <= 10 && j >= 8 && j <= 9)) {
          return 'water';
        }
        if ((i === 3 || i === 4) && (j === 6 || j === 7)) {
          return 'tree';
        }
        if ((i === 6 || i === 7) && (j === 2 || j === 3)) {
          return 'rock';
        }
        if (j === 4 || i === 5) {
          return 'dirt';
        }
        return 'grass';
      })
    )
  );
  // Resource nodes: trees and gold mine
  const [trees, setTrees] = useState([
    { x: 2, y: 2, amount: 50 },
    { x: 6, y: 3, amount: 50 },
    { x: 4, y: 7, amount: 50 },
    { x: 7, y: 6, amount: 50 },
  ]);
  const [goldMine, setGoldMine] = useState({ x: 1, y: 7, amount: 100 });

  // Camera state
  // Camera state
  // Start centered
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  // Camera clamp boundaries (in px)
  const cameraBounds = {
    minX: -((gridSize * tileSize) / 2),
    maxX: ((gridSize * tileSize) / 2),
    minY: -100,
    maxY: (gridSize * tileSize) / 2
  };

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
  // Barn location (center of map for now)
  const barnPos = { x: 6, y: 6 };
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
  // FPS counter
  const [fps, setFps] = useState(0);
  useEffect(() => {
    let last = performance.now();
    let frames = 0;
    let running = true;
    function loop() {
      frames++;
      const now = performance.now();
      if (now - last > 1000) {
        setFps(frames);
        frames = 0;
        last = now;
      }
      if (running) requestAnimationFrame(loop);
    }
    loop();
    return () => { running = false; };
  }, []);
  const debugState = JSON.stringify({ worker, resources, trees, goldMine }, null, 2);
  // ...existing code...

  // Handle worker movement animation
  // Worker movement and gather/deposit logic
  // Zoom controls
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(z => Math.max(0.5, Math.min(2, z + (e.deltaY < 0 ? 0.25 : -0.25))));
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

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
            if (w.gathering && w.state !== 'returning') {
              // Arrived at resource node, start gathering
              return { ...w, x: w.movingTo.x, y: w.movingTo.y, movingTo: null, state: 'gathering' };
            }
            if (w.state === 'returning') {
              // Deposit resources at barn
              setResources((r: typeof resources) => ({
                gold: r.gold + w.carrying.gold,
                lumber: r.lumber + w.carrying.lumber
              }));
              // Resume gathering if node still has resources, else find nearest of same type
              if (w.gathering) {
                if (w.gathering.type === 'tree') {
                  // If original node still has resources
                  if (trees[w.gathering.idx]?.amount > 0) {
                    return {
                      ...w,
                      x: w.movingTo.x,
                      y: w.movingTo.y,
                      movingTo: { x: trees[w.gathering.idx].x, y: trees[w.gathering.idx].y },
                      carrying: { gold: 0, lumber: 0 },
                      state: 'moving',
                    };
                  }
                  // Find nearest available tree
                  const available = trees
                    .map((t, i) => ({ ...t, idx: i }))
                    .filter(t => t.amount > 0);
                  if (available.length > 0) {
                    // Find nearest
                    const { x: wx, y: wy } = w;
                    const nearest = available.reduce((a, b) => {
                      const da = Math.abs(a.x - wx) + Math.abs(a.y - wy);
                      const db = Math.abs(b.x - wx) + Math.abs(b.y - wy);
                      return da < db ? a : b;
                    });
                    return {
                      ...w,
                      x: w.movingTo.x,
                      y: w.movingTo.y,
                      movingTo: { x: nearest.x, y: nearest.y },
                      gathering: { type: 'tree', idx: nearest.idx },
                      carrying: { gold: 0, lumber: 0 },
                      state: 'moving',
                    };
                  }
                } else if (w.gathering.type === 'gold') {
                  if (goldMine.amount > 0) {
                    return {
                      ...w,
                      x: w.movingTo.x,
                      y: w.movingTo.y,
                      movingTo: { x: goldMine.x, y: goldMine.y },
                      carrying: { gold: 0, lumber: 0 },
                      state: 'moving',
                    };
                  }
                }
              }
              // Otherwise, idle (but preserve gathering if possible)
              let gathering = w.gathering;
              // If there are still nodes of this type, keep gathering field
              if (w.gathering) {
                if (w.gathering.type === 'tree') {
                  const available = trees.filter(t => t.amount > 0);
                  if (available.length === 0) gathering = null;
                } else if (w.gathering.type === 'gold') {
                  if (goldMine.amount <= 0) gathering = null;
                }
              }
              return {
                ...w,
                x: w.movingTo.x,
                y: w.movingTo.y,
                movingTo: null,
                carrying: { gold: 0, lumber: 0 },
                state: gathering ? 'moving' : 'idle',
                gathering,
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
                if (w2.state !== 'gathering' || !w2.gathering) return w2;
                // Carry cap: 10 per trip
                if (w2.gathering.type === 'tree') {
                  const idx = w2.gathering.idx;
                  if (trees[idx]?.amount > 0 && w2.carrying.lumber < 10) {
                    setTrees((ts: typeof trees) => ts.map((t, i) => i === idx ? { ...t, amount: Math.max(0, t.amount - 10) } : t));
                    return {
                      ...w2,
                      carrying: { ...w2.carrying, lumber: w2.carrying.lumber + 10 },
                      state: 'returning',
                      movingTo: { ...barnPos },
                    };
                  }
                } else if (w2.gathering.type === 'gold') {
                  if (goldMine.amount > 0 && w2.carrying.gold < 10) {
                    setGoldMine((gm: typeof goldMine) => ({ ...gm, amount: Math.max(0, gm.amount - 10) }));
                    return {
                      ...w2,
                      carrying: { ...w2.carrying, gold: w2.carrying.gold + 10 },
                      state: 'returning',
                      movingTo: { ...barnPos },
                    };
                  }
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
  }, [worker.movingTo, worker.state, worker.gathering, trees, goldMine]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
      if (!movementKeys.includes(e.key)) return;

      // Keep the browser viewport fixed while panning the in-game camera.
      e.preventDefault();
      setCamera((cam: typeof camera) => {
        let { x, y } = cam;
        // Reverse all directions
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') y += 32;
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') y -= 32;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') x += 32;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') x -= 32;
        // Clamp camera
        x = Math.max(cameraBounds.minX, Math.min(cameraBounds.maxX, x));
        y = Math.max(cameraBounds.minY, Math.min(cameraBounds.maxY, y));
        return { x, y };
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="absolute inset-0 bg-black">
      {/* Debug: show full state for troubleshooting */}
      <div style={{ position: 'absolute', bottom: 80, left: 24, zIndex: 20, background: 'rgba(0,0,0,0.85)', color: '#bbf7d0', padding: '8px 16px', borderRadius: 8, fontSize: 12, maxWidth: 400, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
        <b>DEBUG STATE</b>
        <pre>{debugState}</pre>
      </div>
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
      {/* Isometric grid and game rendering */}
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
            transform: `translate(${camera.x}px,${camera.y}px) scale(${zoom})`
          }}
        >
        {/* Tiles, grid lines, and coordinates */}
        {[...Array(gridSize)].map((_, i) =>
          [...Array(gridSize)].map((_, j) => {
            const isoX = (i - j) * tileSize + gridSize * tileSize / 2;
            const isoY = (i + j) * tileSize / 2;
            // Tile color by type
            let fill = '#14532d';
            if (tiles[i][j] === 'dirt') fill = '#a16207';
            if (tiles[i][j] === 'water') fill = '#2563eb';
            if (tiles[i][j] === 'rock') fill = '#64748b';
            if (tiles[i][j] === 'tree') fill = '#166534';
            return (
              <g key={`tile-${i}-${j}`}>
                {/* Tile polygon */}
                <polygon
                  points={[
                    [isoX, isoY + tileSize / 2],
                    [isoX + tileSize, isoY],
                    [isoX + tileSize * 2, isoY + tileSize / 2],
                    [isoX + tileSize, isoY + tileSize]
                  ].map(p => p.join(",")).join(" ")}
                  fill={fill}
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
                {/* Grid coordinate label */}
                <text
                  x={isoX + tileSize + 2}
                  y={isoY + tileSize / 2 + 12}
                  fontSize="12"
                  fill="#fff"
                  opacity={0.7}
                  pointerEvents="none"
                >
                  {i},{j}
                </text>
              </g>
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
          if (amount <= 0) return null;
          const isoX = (x - y) * tileSize + gridSize * tileSize / 2 + tileSize;
          const isoY = (x + y) * tileSize / 2 + tileSize / 2;
          return (
            <g key={`tree-${idx}`}
              style={{ cursor: 'pointer', opacity: amount > 0 ? 1 : 0.2 }}
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
          if (amount <= 0) return null;
          const isoX = (x - y) * tileSize + gridSize * tileSize / 2 + tileSize;
          const isoY = (x + y) * tileSize / 2 + tileSize / 2;
          return (
            <g key="gold-mine"
              style={{ cursor: 'pointer', opacity: amount > 0 ? 1 : 0.2 }}
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
      {/* Zoom UI */}
      <div style={{ position: 'absolute', top: 56, right: 24, zIndex: 10, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 12px', borderRadius: 6, fontSize: 14 }}>
        Zoom: {zoom}x (scroll to zoom)
      </div>
    </div>
  );
};

export default RTSMap;
