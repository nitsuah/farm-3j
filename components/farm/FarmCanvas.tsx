'use client';

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useFarm } from '@/lib/farm/FarmContext';
import { Entity } from './Entity';
import { wander, updateTime, shouldAdvanceDay } from '@/lib/farm/gameLogic';
import { GAME_CONFIG } from '@/lib/farm/constants';

export function FarmCanvas() {
  const { state, dispatch } = useFarm();
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    if (state.isPaused) return;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
      lastUpdateRef.current = now;

      // Update time and day
      const newTime = updateTime(state.time, deltaTime);
      const dayAdvanced = shouldAdvanceDay(state.time, newTime);

      if (dayAdvanced) {
        dispatch({
          type: 'UPDATE_STATS',
          payload: {
            day: state.day + 1,
            time: newTime,
            fenceHealth: Math.max(0, state.fenceHealth - 2), // Fences decay over time
          },
        });
      } else if (
        Math.abs(newTime - state.time) > GAME_CONFIG.TIME_UPDATE_THRESHOLD
      ) {
        dispatch({ type: 'UPDATE_STATS', payload: { time: newTime } });
      }

      // Produce resources from animals
      dispatch({ type: 'PRODUCE_RESOURCES' });

      // Update positions for all animated entities (animals) using wander behavior
      const updates = state.entities
        .filter(entity => entity.velocity && entity.velocity > 0)
        .map(entity => {
          const { x, y, direction } = wander(
            entity.x,
            entity.y,
            entity.direction || 0,
            entity.velocity || 0,
            deltaTime
          );

          return {
            id: entity.id,
            x,
            y,
            direction,
          };
        });

      if (updates.length > 0) {
        dispatch({ type: 'BATCH_UPDATE_POSITIONS', payload: updates });
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    state.entities,
    state.isPaused,
    state.time,
    state.day,
    state.fenceHealth,
    dispatch,
  ]);

  // Calculate sky color based on time of day - memoized to avoid recalculation
  const getSkyGradient = useCallback(() => {
    const hour = state.time;
    if (hour >= 6 && hour < 12) {
      // Morning - light blue to bright blue
      return 'from-sky-200 via-sky-300 to-blue-400';
    } else if (hour >= 12 && hour < 18) {
      // Afternoon - bright blue to warm blue
      return 'from-blue-400 via-sky-400 to-orange-200';
    } else if (hour >= 18 && hour < 20) {
      // Evening - orange to purple
      return 'from-orange-300 via-pink-300 to-purple-400';
    } else {
      // Night - dark blue to dark purple
      return 'from-indigo-900 via-purple-900 to-slate-900';
    }
  }, [state.time]);

  const isNight = useMemo(
    () => state.time < 6 || state.time >= 20,
    [state.time]
  );

  const skyGradient = getSkyGradient();

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg shadow-2xl">
      {/* Sky gradient background with day/night cycle */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${skyGradient} transition-colors duration-1000`}
      />

      {/* Stars at night */}
      {isNight && (
        <div className="absolute inset-0 opacity-70">
          {[...Array(GAME_CONFIG.NIGHT_STAR_COUNT)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 animate-pulse rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Ground layer with grass texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 10px,
            rgba(34, 197, 94, 0.1) 10px,
            rgba(34, 197, 94, 0.1) 20px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 10px,
            rgba(34, 197, 94, 0.1) 10px,
            rgba(34, 197, 94, 0.1) 20px
          )`,
          backgroundColor: isNight
            ? 'rgba(22, 101, 52, 0.8)'
            : 'rgba(34, 197, 94, 0.6)',
        }}
      />

      {/* Render all entities */}
      {state.entities.map(entity => (
        <Entity key={entity.id} entity={entity} />
      ))}
    </div>
  );
}
