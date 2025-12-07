'use client';

import React, { useEffect, useRef } from 'react';
import { useFarm } from '@/lib/farm/FarmContext';
import { Entity } from './Entity';

export function FarmCanvas() {
  const { state, dispatch } = useFarm();
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    if (state.isPaused) return;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
      lastUpdateRef.current = now;

      // Update positions for all animated entities (animals)
      const updates = state.entities
        .filter((entity) => entity.velocity && entity.velocity > 0)
        .map((entity) => {
          let { x, y, direction = 0, velocity = 0 } = entity;

          // Move in current direction
          x += Math.cos(direction) * velocity * deltaTime * 10;
          y += Math.sin(direction) * velocity * deltaTime * 10;

          // Bounce off boundaries
          if (x < 5 || x > 95) {
            direction = Math.PI - direction;
            x = Math.max(5, Math.min(95, x));
          }
          if (y < 5 || y > 95) {
            direction = -direction;
            y = Math.max(5, Math.min(95, y));
          }

          // Random direction change occasionally
          if (Math.random() < 0.02) {
            direction += (Math.random() - 0.5) * 0.5;
          }

          return {
            id: entity.id,
            x: Number(x.toFixed(2)),
            y: Number(y.toFixed(2)),
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
  }, [state.entities, state.isPaused, dispatch]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-green-400 to-green-600 overflow-hidden rounded-lg shadow-2xl">
      {/* Sky gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-green-400" />

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
        }}
      />

      {/* Render all entities */}
      {state.entities.map((entity) => (
        <Entity key={entity.id} entity={entity} />
      ))}
    </div>
  );
}
