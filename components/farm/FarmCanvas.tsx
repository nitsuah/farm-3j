'use client';

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useFarm } from '@/lib/farm/FarmContext';
import { Entity } from './Entity';
import { IsometricGrid } from './IsometricGrid';
import {
  wander,
  updateTime,
  shouldAdvanceDay,
  updateAnimalNeeds,
  findNearestTrough,
  feedAnimal,
  moveTowards,
} from '@/lib/farm/gameLogic';
import { GAME_CONFIG } from '@/lib/farm/constants';

interface FarmCanvasProps {
  showGrid?: boolean;
}

export function FarmCanvas({ showGrid = false }: FarmCanvasProps) {
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

      // Update animal needs (hunger and happiness)
      const needUpdates = state.entities
        .map(entity => {
          const updates = updateAnimalNeeds(entity, state.time);
          if (updates) {
            return { id: entity.id, ...updates };
          }
          return null;
        })
        .filter(Boolean);

      if (needUpdates.length > 0) {
        needUpdates.forEach(update => {
          dispatch({
            type: 'UPDATE_STATS',
            payload: {
              entities: state.entities.map(e =>
                e.id === update?.id ? { ...e, ...update } : e
              ),
            },
          });
        });
      }

      // Handle feeding: animals seek troughs when hungry
      const troughs = state.entities.filter(e => e.type === 'trough');
      const animals = state.entities.filter(e =>
        ['cow', 'chicken', 'pig', 'sheep'].includes(e.type)
      );

      animals.forEach(animal => {
        const hunger = animal.hunger ?? 0;

        // If hungry enough, try to feed
        if (hunger > GAME_CONFIG.HUNGER_SEEK_THRESHOLD) {
          const nearestTrough = findNearestTrough(animal, troughs);

          if (nearestTrough) {
            const feedResult = feedAnimal(animal, nearestTrough);

            if (feedResult) {
              // Update both animal and trough
              dispatch({
                type: 'UPDATE_STATS',
                payload: {
                  entities: state.entities.map(e => {
                    if (e.id === animal.id) {
                      return { ...e, ...feedResult.animal };
                    }
                    if (e.id === nearestTrough.id) {
                      return { ...e, ...feedResult.trough };
                    }
                    return e;
                  }),
                },
              });
            }
          }
        } else {
          // Not feeding anymore
          if (animal.isFeeding) {
            dispatch({
              type: 'UPDATE_STATS',
              payload: {
                entities: state.entities.map(e =>
                  e.id === animal.id ? { ...e, isFeeding: false } : e
                ),
              },
            });
          }
        }
      });

      // Update positions for all animated entities (animals)
      const updates = state.entities
        .filter(entity => entity.velocity && entity.velocity > 0)
        .map(entity => {
          const hunger = entity.hunger ?? 0;

          // If hungry and not currently feeding, move towards nearest trough
          if (hunger > GAME_CONFIG.HUNGER_SEEK_THRESHOLD && !entity.isFeeding) {
            const nearestTrough = findNearestTrough(entity, troughs);
            if (nearestTrough) {
              const movement = moveTowards(
                entity.x,
                entity.y,
                nearestTrough.x,
                nearestTrough.y,
                (entity.velocity || 0) * deltaTime * 10
              );
              return {
                id: entity.id,
                x: movement.x,
                y: movement.y,
                direction: movement.direction,
              };
            }
          }

          // Otherwise, use normal wander behavior
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

      {/* Isometric terrain grid */}
      <IsometricGrid showGrid={showGrid} />

      {/* Render all entities */}
      {state.entities.map(entity => (
        <Entity key={entity.id} entity={entity} />
      ))}
    </div>
  );
}
