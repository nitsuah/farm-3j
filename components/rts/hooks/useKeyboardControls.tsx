'use client';
import { useEffect } from 'react';
import type React from 'react';

import { BARN_POS, GRID_SIZE, TILE_SIZE } from '../game/constants';
import { INITIAL_TILES, tileToSvg } from '../game/map';
import type { BuildingType } from '../game/types';
import type { RTSGameContext } from './context';
import type { useRTSHandlers } from './useRTSHandlers';

type Handlers = ReturnType<typeof useRTSHandlers>;

type ChickenState = { id: number; x: number; y: number; facing: 1 | -1 };

const WANDER_DIRS = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
  { dx: 0, dy: 0 },
] as const;

function shuffleDirs(dirs: typeof WANDER_DIRS): { dx: number; dy: number }[] {
  const a: { dx: number; dy: number }[] = [...dirs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

export interface KeyboardControlsParams {
  /** svgRef from usePanZoom */
  svgRef: React.RefObject<SVGSVGElement | null>;
  /** setCamera from usePanZoom */
  setCamera: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  /** from useRTSGameState */
  setGameSpeed: React.Dispatch<React.SetStateAction<number>>;
  /** local UI state */
  setBuildMode: React.Dispatch<React.SetStateAction<BuildingType | null>>;
  setGhostTile: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
  setPatrolMode: React.Dispatch<React.SetStateAction<boolean>>;
  setAttackMoveMode: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedType: React.Dispatch<
    React.SetStateAction<'worker' | 'farmhouse' | 'building' | null>
  >;
  setControlGroups: React.Dispatch<
    React.SetStateAction<Record<number, number[]>>
  >;
  setChickens: React.Dispatch<React.SetStateAction<ChickenState[]>>;
  /** local refs */
  idleWorkerIndexRef: React.MutableRefObject<number>;
  lastGroupKeyRef: React.MutableRefObject<{ num: number; t: number } | null>;
}

/**
 * All keyboard-driven useEffects: chicken wander, Escape/Space/patrol/attack-
 * move, Ctrl+A select-all, command hotkeys, and number-key control groups.
 */
export function useKeyboardControls(
  ctx: RTSGameContext,
  handlers: Handlers,
  params: KeyboardControlsParams
): void {
  const {
    svgRef,
    setCamera,
    setGameSpeed,
    setBuildMode,
    setGhostTile,
    setPatrolMode,
    setAttackMoveMode,
    setSelectedType,
    setControlGroups,
    setChickens,
    idleWorkerIndexRef,
    lastGroupKeyRef,
  } = params;

  const { workersRef, setWorkers, gameOver, gameOverRef } = ctx;

  // ── Chicken wander ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => {
      setChickens(cs =>
        cs.map(c => {
          const shuffled = shuffleDirs(WANDER_DIRS);
          for (const d of shuffled) {
            const nx = c.x + d.dx,
              ny = c.y + d.dy;
            if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE)
              continue;
            if (
              INITIAL_TILES[nx]?.[ny] === 'water' ||
              INITIAL_TILES[nx]?.[ny] === 'tree'
            )
              continue;
            // Stay within 5 tiles of barn
            if (Math.abs(nx - BARN_POS.x) > 5 || Math.abs(ny - BARN_POS.y) > 5)
              continue;
            const facing =
              d.dx === -1
                ? (-1 as const)
                : d.dx === 1
                  ? (1 as const)
                  : c.facing;
            return { ...c, x: nx, y: ny, facing };
          }
          return c;
        })
      );
    }, 2000);
    return () => clearInterval(id);
  }, [gameOver, setChickens]);

  // ── Escape / Space / Patrol / Attack-move ────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBuildMode(null);
        setGhostTile(null);
        setPatrolMode(false);
        setAttackMoveMode(false);
      }
      if (
        e.key === ' ' &&
        !e.ctrlKey &&
        !e.metaKey &&
        (e.target as HTMLElement).tagName !== 'INPUT'
      ) {
        e.preventDefault();
        if (!gameOverRef.current) setGameSpeed(s => (s === 0 ? 1 : 0));
      }
      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
        if (workersRef.current.some(w => w.selected)) {
          setPatrolMode(m => !m);
        }
      }
      if ((e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.metaKey) {
        if (
          workersRef.current.some(
            w =>
              w.selected &&
              w.unitType !== 'farmer' &&
              w.unitType !== 'catapult' &&
              w.unitType !== 'trebuchet'
          )
        ) {
          setAttackMoveMode(m => !m);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    setBuildMode,
    setGhostTile,
    setPatrolMode,
    setAttackMoveMode,
    gameOverRef,
    setGameSpeed,
  ]);

  // ── Ctrl+A: select all living units ─────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        )
          return;
        e.preventDefault();
        setWorkers(ws =>
          ws.map(w => (w.hp > 0 ? { ...w, selected: true } : w))
        );
        setSelectedType('worker');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setWorkers, setSelectedType]);

  // ── Command hotkeys ──────────────────────────────────────────────────────────
  // F=train farmer, Q=swordsman, R=cavalry, Delete=stop, G=garrison,
  // E=earthquake, C=charge, S=cavalry sprint, H=hold position, Tab=idle worker
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOverRef.current) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA'
      )
        return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handlers.handleFarmhouseAction('train');
      }
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        handlers.handleFarmhouseAction('trainSwordsman');
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handlers.handleFarmhouseAction('trainCavalry');
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        setWorkers(ws =>
          ws.map(w =>
            w.selected
              ? {
                  ...w,
                  movingTo: null,
                  path: [],
                  gathering: null,
                  attacking: null,
                  repairing: null,
                  attackMove: false,
                  attackMoveTarget: null,
                  patrol: null,
                  holdPosition: false,
                  waypoints: [],
                  state: 'idle' as const,
                }
              : w
          )
        );
      }
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handlers.handleGarrison();
      }
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handlers.handleEarthquake();
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handlers.handleSwordsmanCharge();
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handlers.handleCavalrySprint();
      }
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setWorkers(ws =>
          ws.map(w =>
            w.selected
              ? {
                  ...w,
                  holdPosition: true,
                  movingTo: null,
                  path: [],
                  patrol: null,
                  attackMove: false,
                  attackMoveTarget: null,
                  waypoints: [],
                  state: 'idle' as const,
                }
              : w
          )
        );
      }
      if (e.key === 'Tab') {
        e.preventDefault();
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
          // Pan camera to center on this worker
          const { isoX, isoY } = tileToSvg(target.x, target.y);
          const svgEl = svgRef.current;
          if (svgEl) {
            const rect = svgEl.getBoundingClientRect();
            setCamera({
              x: rect.width / 2 - isoX - TILE_SIZE / 2,
              y: rect.height / 2 - isoY - 18,
            });
          }
          setSelectedType('worker');
          return ws.map(w => ({ ...w, selected: w.id === target.id }));
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    handlers,
    setWorkers,
    svgRef,
    setCamera,
    idleWorkerIndexRef,
    setSelectedType,
  ]);

  // ── Number-key control groups ────────────────────────────────────────────────
  // Ctrl+N: assign selected units to group N
  // N alone: select group N; double-tap to center camera on the group
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
        return;
      const num = parseInt(e.key);
      if (isNaN(num) || num < 1 || num > 9) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const ids = workersRef.current.filter(w => w.selected).map(w => w.id);
        if (!ids.length) return;
        setControlGroups(cg => ({ ...cg, [num]: ids }));
        setWorkers(ws =>
          ws.map(w =>
            w.selected
              ? { ...w, group: num }
              : w.group === num
                ? { ...w, group: null }
                : w
          )
        );
      } else {
        const ids = workersRef.current
          .filter(w => w.group === num)
          .map(w => w.id);
        if (!ids.length) return;
        setSelectedType('worker');
        setWorkers(ws => ws.map(w => ({ ...w, selected: ids.includes(w.id) })));
        // Double-tap: center camera on group centroid
        const now = Date.now();
        const last = lastGroupKeyRef.current;
        if (last && last.num === num && now - last.t < 500) {
          const units = workersRef.current.filter(
            w => ids.includes(w.id) && w.hp > 0
          );
          if (units.length > 0) {
            const cx = units.reduce((s, u) => s + u.x, 0) / units.length;
            const cy = units.reduce((s, u) => s + u.y, 0) / units.length;
            const { isoX, isoY } = tileToSvg(cx, cy);
            const svgEl = svgRef.current;
            if (svgEl) {
              const rect = svgEl.getBoundingClientRect();
              setCamera({
                x: rect.width / 2 - isoX - TILE_SIZE / 2,
                y: rect.height / 2 - isoY - 18,
              });
            }
          }
          lastGroupKeyRef.current = null;
        } else {
          lastGroupKeyRef.current = { num, t: now };
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    workersRef,
    setWorkers,
    setControlGroups,
    setSelectedType,
    svgRef,
    setCamera,
    lastGroupKeyRef,
  ]);
}
