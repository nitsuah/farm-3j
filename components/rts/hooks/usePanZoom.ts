import { useCallback, useEffect, useRef, useState } from 'react';

import {
  GRID_SIZE,
  TILE_SIZE,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
} from '../game/constants';

// Pan, zoom, and screen-shake state + input handlers extracted from RTSMap.
// Owns the SVG ref so the scroll-wheel effect can read getBoundingClientRect.
export function usePanZoom() {
  const [zoom, setZoom] = useState(1);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [screenShake, setScreenShake] = useState(0);
  const screenShakeTimerRef = useRef<number | null>(null);
  const triggerShake = useCallback((magnitude = 1) => {
    setScreenShake(magnitude);
    if (screenShakeTimerRef.current) clearTimeout(screenShakeTimerRef.current);
    screenShakeTimerRef.current = window.setTimeout(
      () => setScreenShake(0),
      350
    );
  }, []);
  const triggerShakeRef = useRef(triggerShake);
  useEffect(() => {
    triggerShakeRef.current = triggerShake;
  }, [triggerShake]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Scroll-wheel zoom anchored to cursor position
  useEffect(() => {
    const svgEl = svgRef.current;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setZoom(prev => {
        const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev + delta));
        if (!svgEl) return next;
        const rect = svgEl.getBoundingClientRect();
        const svgCenterX = rect.left + rect.width / 2;
        const svgCenterY = rect.top + rect.height / 2;
        const ax = e.clientX - svgCenterX;
        const ay = e.clientY - svgCenterY;
        const ratio = next / prev;
        setCamera(c => ({
          x: ax + (c.x - ax) * ratio,
          y: ay + (c.y - ay) * ratio,
        }));
        return next;
      });
    };

    const onKeyFull = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === '=' || e.key === '+') {
        setZoom(prev => {
          const next = Math.min(ZOOM_MAX, prev + ZOOM_STEP);
          return next;
        });
      }
      if (e.key === '-' || e.key === '_') {
        setZoom(prev => {
          const next = Math.max(ZOOM_MIN, prev - ZOOM_STEP);
          return next;
        });
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyFull);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyFull);
    };
  }, []);

  // Smooth WASD/Arrow camera pan using held-key tracking + RAF
  useEffect(() => {
    const bounds = {
      minX: -(GRID_SIZE * TILE_SIZE),
      maxX: GRID_SIZE * TILE_SIZE,
      minY: -200,
      maxY: GRID_SIZE * TILE_SIZE,
    };
    const PAN_SPEED = 480; // px/sec
    const held = new Set<string>();
    let rafId = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (held.size > 0) {
        const up = held.has('ArrowUp') || held.has('w') || held.has('W');
        const down = held.has('ArrowDown') || held.has('s') || held.has('S');
        const left = held.has('ArrowLeft') || held.has('a') || held.has('A');
        const right = held.has('ArrowRight') || held.has('d') || held.has('D');
        const dx = (left ? 1 : 0) - (right ? 1 : 0);
        const dy = (up ? 1 : 0) - (down ? 1 : 0);
        if (dx !== 0 || dy !== 0) {
          setCamera(c => ({
            x: Math.max(
              bounds.minX,
              Math.min(bounds.maxX, c.x + dx * PAN_SPEED * dt)
            ),
            y: Math.max(
              bounds.minY,
              Math.min(bounds.maxY, c.y + dy * PAN_SPEED * dt)
            ),
          }));
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(t => {
      last = t;
      rafId = requestAnimationFrame(tick);
    });

    const onKeyDown = (e: KeyboardEvent) => {
      const panKeys = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'w',
        'W',
        'a',
        'A',
        's',
        'S',
        'd',
        'D',
      ];
      if (!panKeys.includes(e.key)) return;
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA'
      )
        return;
      e.preventDefault();
      held.add(e.key);
    };
    const onKeyUp = (e: KeyboardEvent) => held.delete(e.key);
    const onBlur = () => held.clear();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Mouse edge-scroll — pan when cursor is within EDGE_ZONE px of viewport edge
  useEffect(() => {
    const EDGE_ZONE = 48;
    const PAN_SPEED = 400;
    const bounds = {
      minX: -(GRID_SIZE * TILE_SIZE),
      maxX: GRID_SIZE * TILE_SIZE,
      minY: -200,
      maxY: GRID_SIZE * TILE_SIZE,
    };
    let mx = -1,
      my = -1,
      rafId = 0,
      last = 0;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let dx = 0,
        dy = 0;
      if (mx >= 0) {
        if (mx < EDGE_ZONE) dx = 1;
        else if (mx > vw - EDGE_ZONE) dx = -1;
        if (my < EDGE_ZONE) dy = 1;
        else if (my > vh - EDGE_ZONE) dy = -1;
      }
      if (dx !== 0 || dy !== 0) {
        setCamera(c => ({
          x: Math.max(
            bounds.minX,
            Math.min(bounds.maxX, c.x + dx * PAN_SPEED * dt)
          ),
          y: Math.max(
            bounds.minY,
            Math.min(bounds.maxY, c.y + dy * PAN_SPEED * dt)
          ),
        }));
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(t => {
      last = t;
      rafId = requestAnimationFrame(tick);
    });

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return {
    svgRef,
    zoom,
    setZoom,
    camera,
    setCamera,
    screenShake,
    triggerShake,
    triggerShakeRef,
  };
}
