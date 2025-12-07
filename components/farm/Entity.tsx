'use client';

import React, { useMemo } from 'react';
import { Entity as EntityType } from '@/lib/farm/types';

interface EntityProps {
  entity: EntityType;
}

export const Entity = React.memo(function Entity({ entity }: EntityProps) {
  const rotation = entity.direction ? (entity.direction * 180) / Math.PI : 0;
  const isMoving = entity.velocity && entity.velocity > 0;
  const hasResources = entity.inventory && entity.inventory > 0;

  // Determine if this is an animal type
  const isAnimal = ['cow', 'chicken', 'pig', 'sheep'].includes(entity.type);
  const showNeeds =
    isAnimal && (entity.hunger !== undefined || entity.happiness !== undefined);

  const style = useMemo(
    () => ({
      position: 'absolute' as const,
      left: `${entity.x}%`,
      top: `${entity.y}%`,
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      transition: 'left 0.1s linear, top 0.1s linear, transform 0.1s linear',
      zIndex: Math.floor(entity.y * 10), // Better depth sorting with more granularity
      filter: isMoving
        ? 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))'
        : 'drop-shadow(1px 2px 3px rgba(0,0,0,0.2))',
    }),
    [entity.x, entity.y, rotation, isMoving]
  );

  // Different rendering based on entity type
  const getEntityContent = () => {
    switch (entity.type) {
      case 'cow':
        return (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 border-black bg-white text-3xl ${
              isMoving ? 'animate-bounce' : ''
            }`}
            style={{ transform: 'scale(1.1)' }}
          >
            🐄
          </div>
        );
      case 'chicken':
        return (
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 border-orange-400 bg-white text-xl ${
              isMoving ? 'animate-pulse' : ''
            }`}
            style={{ transform: 'scale(0.95)' }}
          >
            🐔
          </div>
        );
      case 'pig':
        return (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 border-pink-400 bg-pink-200 text-2xl ${
              isMoving ? 'animate-bounce' : ''
            }`}
            style={{ transform: 'scale(1.05)' }}
          >
            🐷
          </div>
        );
      case 'sheep':
        return (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-400 bg-white text-2xl ${
              isMoving ? 'animate-bounce' : ''
            }`}
            style={{ transform: 'scale(1.1)' }}
          >
            🐑
          </div>
        );
      case 'barn':
        return (
          <div
            className="relative rounded-t-3xl border-4 border-red-800 bg-red-600 shadow-2xl"
            style={{
              width: entity.width,
              height: entity.height,
              transform: 'perspective(400px) rotateX(5deg)',
            }}
          >
            <div className="absolute top-0 left-1/2 h-12 w-16 -translate-x-1/2 rounded-t-2xl border-4 border-red-900 bg-red-800" />
            <div className="flex h-3/4 w-full items-center justify-center border-b-4 border-red-800 bg-red-700">
              <div className="h-2/3 w-1/3 rounded-t-lg border-2 border-amber-950 bg-amber-900" />
            </div>
            <div className="flex h-1/4 w-full items-center justify-center gap-2 bg-red-800">
              <div className="h-12 w-6 rounded border-2 border-amber-950 bg-amber-900" />
              <div className="h-12 w-6 rounded border-2 border-amber-950 bg-amber-900" />
            </div>
            {/* Shadow underneath */}
            <div className="absolute -bottom-2 left-1/2 h-3 w-3/4 -translate-x-1/2 rounded-full bg-black/20 blur-sm" />
          </div>
        );
      case 'fence':
        const fenceHealth = entity.health || 100;
        const fenceColor =
          fenceHealth > 70
            ? 'bg-amber-700 border-amber-900'
            : fenceHealth > 30
              ? 'bg-amber-800 border-amber-950'
              : 'bg-red-900 border-red-950';
        return (
          <div
            className={`rounded-sm border-2 ${fenceColor} relative shadow-md`}
            style={{ width: entity.width, height: entity.height }}
          >
            {/* Fence post markers */}
            {entity.orientation === 'horizontal' ? (
              <>
                <div className="absolute top-1/2 left-0 h-3 w-2 -translate-y-1/2 bg-amber-950" />
                <div className="absolute top-1/2 right-0 h-3 w-2 -translate-y-1/2 bg-amber-950" />
              </>
            ) : (
              <>
                <div className="absolute top-0 left-1/2 h-2 w-3 -translate-x-1/2 bg-amber-950" />
                <div className="absolute bottom-0 left-1/2 h-2 w-3 -translate-x-1/2 bg-amber-950" />
              </>
            )}
          </div>
        );
      case 'trough':
        return (
          <div
            className="relative rounded-lg border-2 border-gray-600 bg-gray-400 shadow-md"
            style={{ width: entity.width, height: entity.height }}
          >
            <div className="absolute inset-1 rounded bg-gray-500" />
            <div className="absolute right-1 bottom-1 left-1 h-2 rounded-b bg-blue-300 opacity-60" />
          </div>
        );
      case 'pond':
        return (
          <div
            className="rounded-3xl border-4 border-blue-600 bg-blue-400 opacity-80"
            style={{ width: entity.width, height: entity.height }}
          />
        );
      default:
        return <div className="h-8 w-8 rounded bg-gray-400" />;
    }
  };

  return (
    <div style={style}>
      {getEntityContent()}

      {/* Need indicators for animals */}
      {showNeeds && (
        <div
          className="absolute -top-8 left-1/2 flex -translate-x-1/2 gap-1"
          style={{ transform: `translateX(-50%) rotate(${-rotation}deg)` }}
        >
          {/* Hunger indicator */}
          {entity.hunger !== undefined && entity.hunger > 20 && (
            <div className="flex flex-col items-center">
              <div
                className={`text-xs ${
                  entity.hunger > 60 ? 'text-red-500' : 'text-yellow-500'
                }`}
              >
                🍖
              </div>
              <div className="h-1 w-8 overflow-hidden rounded-full bg-gray-300">
                <div
                  className={`h-full ${
                    entity.hunger > 60 ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${entity.hunger}%` }}
                />
              </div>
            </div>
          )}

          {/* Happiness indicator */}
          {entity.happiness !== undefined && entity.happiness < 80 && (
            <div className="flex flex-col items-center">
              <div
                className={`text-xs ${
                  entity.happiness < 50 ? 'text-red-500' : 'text-blue-500'
                }`}
              >
                {entity.happiness < 50 ? '😢' : '😐'}
              </div>
              <div className="h-1 w-8 overflow-hidden rounded-full bg-gray-300">
                <div
                  className={`h-full ${
                    entity.happiness < 50 ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${entity.happiness}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resource indicator */}
      {hasResources && (
        <div className="absolute -top-2 -right-2 flex h-5 w-5 animate-bounce items-center justify-center rounded-full border-2 border-yellow-600 bg-yellow-400 text-xs font-bold">
          {entity.inventory}
        </div>
      )}
    </div>
  );
});
