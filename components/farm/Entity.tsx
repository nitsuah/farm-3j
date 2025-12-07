'use client';

import React from 'react';
import { Entity as EntityType } from '@/lib/farm/types';

interface EntityProps {
  entity: EntityType;
}

export function Entity({ entity }: EntityProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${entity.x}%`,
    top: `${entity.y}%`,
    transform: 'translate(-50%, -50%)',
    transition: 'left 0.1s linear, top 0.1s linear',
    zIndex: Math.floor(entity.y),
  };

  // Different rendering based on entity type
  const getEntityContent = () => {
    switch (entity.type) {
      case 'cow':
        return (
          <div className="w-12 h-12 bg-white border-2 border-black rounded-lg flex items-center justify-center text-2xl">
            🐄
          </div>
        );
      case 'chicken':
        return (
          <div className="w-8 h-8 bg-white border-2 border-orange-400 rounded-lg flex items-center justify-center text-xl">
            🐔
          </div>
        );
      case 'pig':
        return (
          <div className="w-10 h-10 bg-pink-200 border-2 border-pink-400 rounded-lg flex items-center justify-center text-2xl">
            🐷
          </div>
        );
      case 'sheep':
        return (
          <div className="w-10 h-10 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center text-2xl">
            🐑
          </div>
        );
      case 'barn':
        return (
          <div
            className="bg-red-600 border-4 border-red-800 rounded-t-3xl shadow-lg"
            style={{ width: entity.width, height: entity.height }}
          >
            <div className="w-full h-3/4 bg-red-700 border-b-4 border-red-800" />
            <div className="w-full h-1/4 bg-red-800" />
          </div>
        );
      case 'fence':
        return (
          <div
            className="bg-amber-700 border-2 border-amber-900"
            style={{ width: entity.width, height: entity.height }}
          />
        );
      case 'pond':
        return (
          <div
            className="bg-blue-400 border-4 border-blue-600 rounded-3xl opacity-80"
            style={{ width: entity.width, height: entity.height }}
          />
        );
      default:
        return <div className="w-8 h-8 bg-gray-400 rounded" />;
    }
  };

  return <div style={style}>{getEntityContent()}</div>;
}
