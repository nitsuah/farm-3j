'use client';

import React from 'react';
import { Entity as EntityType } from '@/lib/farm/types';

interface EntityProps {
  entity: EntityType;
}

export function Entity({ entity }: EntityProps) {
  const rotation = entity.direction ? (entity.direction * 180) / Math.PI : 0;
  const isMoving = entity.velocity && entity.velocity > 0;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${entity.x}%`,
    top: `${entity.y}%`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    transition: 'left 0.1s linear, top 0.1s linear, transform 0.1s linear',
    zIndex: Math.floor(entity.y),
    filter: isMoving
      ? 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))'
      : 'drop-shadow(1px 2px 3px rgba(0,0,0,0.2))',
  };

  // Different rendering based on entity type
  const getEntityContent = () => {
    switch (entity.type) {
      case 'cow':
        return (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 border-black bg-white text-3xl ${
              isMoving ? 'animate-bounce' : ''
            }`}
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
          >
            🐑
          </div>
        );
      case 'barn':
        return (
          <div
            className="relative rounded-t-3xl border-4 border-red-800 bg-red-600 shadow-2xl"
            style={{ width: entity.width, height: entity.height }}
          >
            <div className="absolute left-1/2 top-0 h-12 w-16 -translate-x-1/2 rounded-t-2xl border-4 border-red-900 bg-red-800" />
            <div className="flex h-3/4 w-full items-center justify-center border-b-4 border-red-800 bg-red-700">
              <div className="h-2/3 w-1/3 rounded-t-lg border-2 border-amber-950 bg-amber-900" />
            </div>
            <div className="flex h-1/4 w-full items-center justify-center gap-2 bg-red-800">
              <div className="h-12 w-6 rounded border-2 border-amber-950 bg-amber-900" />
              <div className="h-12 w-6 rounded border-2 border-amber-950 bg-amber-900" />
            </div>
          </div>
        );
      case 'fence':
        return (
          <div
            className="border-2 border-amber-900 bg-amber-700"
            style={{ width: entity.width, height: entity.height }}
          />
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

  return <div style={style}>{getEntityContent()}</div>;
}
