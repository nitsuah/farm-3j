import type { PlacedBuilding, ResourceNode, WorkerState } from './types';

/** Returns true if any worker is currently gathering from the given resource node. */
export function isNodeBeingGathered(
  workers: WorkerState[],
  nodeType: 'tree' | 'gold' | 'stone',
  nodeIdx: number
): boolean {
  return workers.some(
    w => w.gathering?.type === nodeType && w.gathering?.idx === nodeIdx
  );
}

/** Returns all placed buildings that are fully constructed (not still building). */
export function getCompletedBuildings(
  buildings: PlacedBuilding[]
): PlacedBuilding[] {
  return buildings.filter(b => !b.constructing);
}

/** Returns true if any building of the given type has been constructed. */
export function hasBuildingType(
  buildings: PlacedBuilding[],
  type: PlacedBuilding['type']
): boolean {
  return buildings.some(b => b.type === type && !b.constructing);
}

/** Returns remaining resource nodes with amount above 0. */
export function getActiveNodes(nodes: ResourceNode[]): ResourceNode[] {
  return nodes.filter(n => n.amount > 0);
}

/** Returns the set of wall tile keys (x,y strings) for fast collision lookup.
 * Includes walls still under construction — they block pathfinding immediately. */
export function getWallTileSet(buildings: PlacedBuilding[]): Set<string> {
  return new Set(
    buildings.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`)
  );
}
