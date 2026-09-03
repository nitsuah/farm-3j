/**
 * MapRenderer — the isometric SVG game view.
 *
 * Extracted from RTSMap.tsx as part of the large-file componentization
 * (TASKS.md "Componentize large files — Phase 2b"). Owns the `<svg>` element,
 * its pan/zoom transform, mouse handlers, and the fixed stack of map layers
 * (terrain → overlays → resource nodes → buildings → bases → units →
 * effects). RTSMap.tsx stays a thin container: it owns state and wires
 * per-layer prop bags into this component instead of rendering the SVG tree
 * itself.
 *
 * Each `*Layer` prop below is typed via `React.ComponentProps<typeof X>` so
 * it always matches the layer component's own prop type — no duplicated
 * type definitions to drift out of sync.
 */

import React from 'react';

import { BuildingsLayer } from './BuildingsLayer';
import { EffectsLayer } from './EffectsLayer';
import { EnemyBaseLayer } from './EnemyBaseLayer';
import { EnemyEliteLayer } from './EnemyEliteLayer';
import { EnemyGruntsLayer } from './EnemyGruntsLayer';
import { EnemySiegeCastersLayer } from './EnemySiegeCastersLayer';
import { NeutralLayer } from './NeutralLayer';
import { OverlayRingsLayer } from './OverlayRingsLayer';
import { PlayerBarnLayer } from './PlayerBarnLayer';
import { ResourceNodesLayer } from './ResourceNodesLayer';
import { TerrainLayer } from './TerrainLayer';
import { WorkersLayer } from './WorkersLayer';
import type { BuildingType } from '../game/types';

export interface MapRendererProps {
  /** Ref forwarded to the root `<svg>` — RTSMap reads it for hit-testing / clientToSvg. */
  svgRef: React.RefObject<SVGSVGElement | null>;
  viewBoxW: number;
  viewBoxH: number;
  camera: { x: number; y: number };
  zoom: number;
  buildMode: BuildingType | null;
  onSvgMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
  onSvgMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onSvgMouseUp: (e: React.MouseEvent<SVGSVGElement>) => void;
  onSvgMouseLeave: () => void;

  terrainLayer: React.ComponentProps<typeof TerrainLayer>;
  overlayRingsLayer: React.ComponentProps<typeof OverlayRingsLayer>;
  resourceNodesLayer: React.ComponentProps<typeof ResourceNodesLayer>;
  buildingsLayer: React.ComponentProps<typeof BuildingsLayer>;
  enemyBaseLayer: React.ComponentProps<typeof EnemyBaseLayer>;
  playerBarnLayer: React.ComponentProps<typeof PlayerBarnLayer>;
  neutralLayer: React.ComponentProps<typeof NeutralLayer>;
  enemyGruntsLayer: React.ComponentProps<typeof EnemyGruntsLayer>;
  enemySiegeCastersLayer: React.ComponentProps<typeof EnemySiegeCastersLayer>;
  enemyEliteLayer: React.ComponentProps<typeof EnemyEliteLayer>;
  workersLayer: React.ComponentProps<typeof WorkersLayer>;
  effectsLayer: React.ComponentProps<typeof EffectsLayer>;
}

/** Renders the isometric SVG game view: pan/zoom viewport + the full map layer stack. */
export const MapRenderer: React.FC<MapRendererProps> = ({
  svgRef,
  viewBoxW,
  viewBoxH,
  camera,
  zoom,
  buildMode,
  onSvgMouseDown,
  onSvgMouseMove,
  onSvgMouseUp,
  onSvgMouseLeave,
  terrainLayer,
  overlayRingsLayer,
  resourceNodesLayer,
  buildingsLayer,
  enemyBaseLayer,
  playerBarnLayer,
  neutralLayer,
  enemyGruntsLayer,
  enemySiegeCastersLayer,
  enemyEliteLayer,
  workersLayer,
  effectsLayer,
}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
      pointerEvents: 'none',
    }}
  >
    <svg
      ref={svgRef}
      viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: 'block',
        pointerEvents: 'auto',
        transform: `translate(${camera.x}px,${camera.y}px) scale(${zoom})`,
        userSelect: 'none',
        cursor: buildMode ? 'crosshair' : 'default',
      }}
      onMouseDown={onSvgMouseDown}
      onMouseMove={onSvgMouseMove}
      onMouseUp={onSvgMouseUp}
      onMouseLeave={onSvgMouseLeave}
    >
      <TerrainLayer {...terrainLayer} />
      <OverlayRingsLayer {...overlayRingsLayer} />
      <ResourceNodesLayer {...resourceNodesLayer} />
      <BuildingsLayer {...buildingsLayer} />
      <EnemyBaseLayer {...enemyBaseLayer} />
      <PlayerBarnLayer {...playerBarnLayer} />
      <NeutralLayer {...neutralLayer} />
      <EnemyGruntsLayer {...enemyGruntsLayer} />
      <EnemySiegeCastersLayer {...enemySiegeCastersLayer} />
      <EnemyEliteLayer {...enemyEliteLayer} />
      <WorkersLayer {...workersLayer} />
      <EffectsLayer {...effectsLayer} />
    </svg>
  </div>
);
