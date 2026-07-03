import React from 'react';

import type { WorkerState } from '../RTSUI';
import { EARTHQUAKE_RADIUS, GRID_SIZE, TILE_SIZE } from '../game/constants';
import { tileToSvg } from '../game/map';
import type { FloatingText, Projectile } from '../game/types';

interface EffectsLayerProps {
  chickens: { id: number; x: number; y: number; facing: 1 | -1 }[];
  dayPhase: 'day' | 'night';
  dragBox: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null;
  earthquakeEffect: { x: number; y: number; at: number } | null;
  floatingTexts: FloatingText[];
  fogExplored: boolean[][];
  fogVisible: boolean[][];
  moveRing: { svgX: number; svgY: number; born: number } | null;
  projectiles: Projectile[];
  viewBoxH: number;
  viewBoxW: number;
  workers: WorkerState[];
}

export const EffectsLayer: React.FC<EffectsLayerProps> = ({
  chickens,
  dayPhase,
  dragBox,
  earthquakeEffect,
  floatingTexts,
  fogExplored,
  fogVisible,
  moveRing,
  projectiles,
  viewBoxH,
  viewBoxW,
  workers,
}) => {
  return (
    <>
      {/* Patrol route visualizations */}
      {workers
        .filter(w => w.patrol && w.selected)
        .map(w => {
          if (!w.patrol) return null;
          const a = tileToSvg(w.patrol.a.x, w.patrol.a.y);
          const b = tileToSvg(w.patrol.b.x, w.patrol.b.y);
          const ax = a.isoX + TILE_SIZE / 2,
            ay = a.isoY + 18;
          const bx = b.isoX + TILE_SIZE / 2,
            by = b.isoY + 18;
          return (
            <g key={`patrol-${w.id}`} pointerEvents="none">
              <line
                x1={ax}
                y1={ay}
                x2={bx}
                y2={by}
                stroke="#22d3ee"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                opacity={0.6}
              />
              <circle
                cx={ax}
                cy={ay}
                r={5}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={2}
                opacity={0.8}
              />
              <circle
                cx={bx}
                cy={by}
                r={5}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={2}
                opacity={0.8}
              />
            </g>
          );
        })}

      {/* Queued waypoint path visualization (shift+RMB orders) */}
      {workers
        .filter(w => w.selected && w.waypoints && w.waypoints.length > 0)
        .map(w => {
          const pts: { x: number; y: number }[] = [];
          if (w.movingTo) pts.push(w.movingTo);
          pts.push(...(w.waypoints ?? []));
          if (pts.length === 0) return null;
          const origin = tileToSvg(w.x, w.y);
          const ox = origin.isoX + TILE_SIZE / 2,
            oy = origin.isoY + 18;
          const mapped = pts.map(p => {
            const { isoX, isoY } = tileToSvg(p.x, p.y);
            return { x: isoX + TILE_SIZE / 2, y: isoY + 18 };
          });
          return (
            <g key={`wp-${w.id}`} pointerEvents="none">
              {mapped.map((pt, i) => {
                const prev = mapped[i - 1];
                const px = i === 0 ? ox : (prev?.x ?? ox);
                const py = i === 0 ? oy : (prev?.y ?? oy);
                return (
                  <line
                    key={i}
                    x1={px}
                    y1={py}
                    x2={pt.x}
                    y2={pt.y}
                    stroke="#4ade80"
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    opacity={0.55}
                  />
                );
              })}
              {mapped.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={i === mapped.length - 1 ? 6 : 4}
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth={2}
                  opacity={i === mapped.length - 1 ? 0.9 : 0.65}
                />
              ))}
              {mapped.length > 1 &&
                mapped.map((pt, i) => (
                  <text
                    key={i}
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#4ade80"
                    opacity={0.8}
                  >
                    {i + 1}
                  </text>
                ))}
            </g>
          );
        })}

      {/* Fog of war */}
      {[...Array(GRID_SIZE)].map((_, i) =>
        [...Array(GRID_SIZE)].map((_, j) => {
          if (fogVisible[i]?.[j]) return null;
          const { isoX, isoY } = tileToSvg(i, j);
          const pts = [
            [isoX, isoY + TILE_SIZE / 2],
            [isoX + TILE_SIZE, isoY],
            [isoX + TILE_SIZE * 2, isoY + TILE_SIZE / 2],
            [isoX + TILE_SIZE, isoY + TILE_SIZE],
          ]
            .map(p => p.join(','))
            .join(' ');
          return (
            <polygon
              key={`fog-${i}-${j}`}
              points={pts}
              fill={
                fogExplored[i]?.[j] ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.88)'
              }
              pointerEvents="none"
            />
          );
        })
      )}

      {/* Night overlay */}
      {dayPhase === 'night' && (
        <rect
          x={0}
          y={0}
          width={viewBoxW}
          height={viewBoxH}
          fill="rgba(15,10,40,0.35)"
          pointerEvents="none"
        />
      )}

      {/* Ambient chickens — decorative farm animals near barn */}
      {chickens.map(c => {
        if (!fogExplored[c.x]?.[c.y]) return null;
        const { isoX, isoY } = tileToSvg(c.x, c.y);
        const cx = isoX + TILE_SIZE / 2,
          cy = isoY + TILE_SIZE * 0.65;
        const f = c.facing;
        return (
          <g
            key={`chicken-${c.id}`}
            transform={`translate(${cx},${cy}) scale(${f},1)`}
            pointerEvents="none"
          >
            {/* body */}
            <ellipse cx={0} cy={0} rx={7} ry={5} fill="#f5f5dc" />
            {/* head */}
            <circle cx={8} cy={-4} r={4} fill="#f5f5dc" />
            {/* beak */}
            <polygon points="12,-4 14,-3 12,-2" fill="#f59e0b" />
            {/* comb */}
            <polygon points="8,-8 7,-6 9,-6 8,-8" fill="#ef4444" />
            {/* eye */}
            <circle cx={9} cy={-5} r={1} fill="#1e293b" />
            {/* tail feathers */}
            <polygon points="-7,-1 -11,-4 -9,0" fill="#e2e8f0" />
            {/* legs */}
            <line
              x1={-2}
              y1={4}
              x2={-2}
              y2={8}
              stroke="#f59e0b"
              strokeWidth={1.5}
            />
            <line
              x1={3}
              y1={4}
              x2={3}
              y2={8}
              stroke="#f59e0b"
              strokeWidth={1.5}
            />
          </g>
        );
      })}

      {/* Floating damage / heal texts */}
      {floatingTexts.map(ft => {
        const age = (Date.now() - ft.createdAt) / 1000;
        const opacity = Math.max(0, 1 - age / 1.2);
        const yOff = age * 45;
        return (
          <text
            key={ft.id}
            x={ft.x}
            y={ft.y - yOff}
            fill={ft.color}
            fontSize="18"
            fontWeight="bold"
            textAnchor="middle"
            opacity={opacity}
            pointerEvents="none"
            style={{ textShadow: '0 1px 3px #000' }}
          >
            {ft.text}
          </text>
        );
      })}

      {/* Projectiles — flying rocks, arrows, ice bolts, poison */}
      {projectiles.map(p => {
        const elapsed = Date.now() - p.createdAt;
        const t = Math.min(1, elapsed / p.duration);
        const cx = p.fx + (p.tx - p.fx) * t;
        // Arc: parabolic height, max at midpoint
        const arc =
          p.type === 'rock'
            ? -Math.sin(t * Math.PI) * 40
            : p.type === 'bolt'
              ? -Math.sin(t * Math.PI) * 12
              : -Math.sin(t * Math.PI) * 20;
        const cy = p.fy + (p.ty - p.fy) * t + arc;
        const opacity = t < 0.9 ? 1 : (1 - t) / 0.1;
        const color =
          p.type === 'ice'
            ? '#93c5fd'
            : p.type === 'poison'
              ? '#4ade80'
              : p.type === 'bolt'
                ? '#fbbf24'
                : '#f97316';
        const symbol =
          p.type === 'rock'
            ? '🪨'
            : p.type === 'ice'
              ? '❄'
              : p.type === 'poison'
                ? '☠'
                : '➤';
        return (
          <text
            key={p.id}
            x={cx}
            y={cy}
            fontSize={p.type === 'rock' ? 14 : 11}
            textAnchor="middle"
            opacity={opacity}
            pointerEvents="none"
            fill={color}
          >
            {symbol}
          </text>
        );
      })}

      {/* Move-target ring — expanding green circle at right-click destination */}
      {moveRing &&
        (() => {
          const age = Date.now() - moveRing.born;
          const t = Math.min(1, age / 600);
          const r = 6 + t * 20;
          const opacity = 1 - t;
          return (
            <circle
              cx={moveRing.svgX}
              cy={moveRing.svgY}
              r={r}
              fill="none"
              stroke="#4ade80"
              strokeWidth={2}
              opacity={opacity}
              pointerEvents="none"
            />
          );
        })()}

      {/* Earthquake shockwave visual effect */}
      {earthquakeEffect &&
        (() => {
          const age = Date.now() - earthquakeEffect.at;
          if (age > 1200) return null;
          const { isoX, isoY } = tileToSvg(
            earthquakeEffect.x,
            earthquakeEffect.y
          );
          const cx2 = isoX + TILE_SIZE / 2,
            cy2 = isoY + TILE_SIZE / 4;
          const t = age / 1200;
          const rx1 = EARTHQUAKE_RADIUS * TILE_SIZE * t;
          const ry1 = rx1 / 2;
          const rx2 = rx1 * 0.6;
          const ry2 = ry1 * 0.6;
          const op = 1 - t;
          return (
            <g pointerEvents="none">
              <ellipse
                cx={cx2}
                cy={cy2}
                rx={rx1}
                ry={ry1}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={3}
                opacity={op * 0.8}
              />
              <ellipse
                cx={cx2}
                cy={cy2}
                rx={rx2}
                ry={ry2}
                fill="none"
                stroke="#ef4444"
                strokeWidth={2}
                opacity={op * 0.6}
              />
              <ellipse
                cx={cx2}
                cy={cy2}
                rx={rx1 * 0.3}
                ry={ry1 * 0.3}
                fill="rgba(245,158,11,0.15)"
                stroke="none"
                opacity={op}
              />
            </g>
          );
        })()}

      {/* Box selection */}
      {dragBox &&
        (Math.abs(dragBox.end.x - dragBox.start.x) > 4 ||
          Math.abs(dragBox.end.y - dragBox.start.y) > 4) && (
          <rect
            x={Math.min(dragBox.start.x, dragBox.end.x)}
            y={Math.min(dragBox.start.y, dragBox.end.y)}
            width={Math.abs(dragBox.end.x - dragBox.start.x)}
            height={Math.abs(dragBox.end.y - dragBox.start.y)}
            fill="rgba(56,189,248,0.08)"
            stroke="#38bdf8"
            strokeWidth={2}
            strokeDasharray="8 4"
            pointerEvents="none"
          />
        )}
    </>
  );
};
