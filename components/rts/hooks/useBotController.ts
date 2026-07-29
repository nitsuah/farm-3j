import { useEffect, useRef } from 'react';
import type React from 'react';

import {
  BARN_POS,
  BUILDING_COSTS,
  BUILDING_REQUIRES,
  GRID_SIZE,
} from '../game/constants';
import { INITIAL_TILES, tileDist } from '../game/map';
import { aStar } from '../game/pathfinding';
import type {
  BuildingType,
  PlacedBuilding,
  ResourceNode,
  Resources,
  TileType,
  WorkerState,
} from '../game/types';
import type { RTSGameContext } from './context';

// ---------- Public types ----------

export interface BotCommands {
  /** Send a specific worker to gather a resource node */
  orderGather: (
    workerId: number,
    resourceType: 'gold' | 'tree' | 'stone',
    resourceIdx: number
  ) => void;
  /** Order a specific worker to attack a target */
  orderAttack: (workerId: number, target: WorkerState['attacking']) => void;
  /** Order a specific worker to move to a tile */
  orderMove: (workerId: number, tx: number, ty: number) => void;
  /** Place a building (deducts resources). Returns true on success. */
  buildAt: (type: BuildingType, tx: number, ty: number) => boolean;
  /** Train a new farmer from the barn. Returns true on success. */
  trainFarmer: () => boolean;
  /** Queue a swordsman at the barracks. Returns true on success. */
  trainSwordsman: () => boolean;
}

export interface BotSnapshot {
  resources: Resources;
  workers: WorkerState[];
  placedBuildings: PlacedBuilding[];
  tiles: TileType[][];
  wave: number;
  farmhouse: { built: boolean; level: number };
  gameOver: 'victory' | 'defeat' | null;
}

// ---------- Internal helpers ----------

const BOT_TICK_MS = 1400;

// Ring-scan outward from center to find an unoccupied buildable tile
function findBuildTile(
  cx: number,
  cy: number,
  tiles: TileType[][],
  occupied: Set<string>,
  maxRadius = 10
): { x: number; y: number } | null {
  for (let r = 1; r <= maxRadius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue; // perimeter only
        const x = cx + dx,
          y = cy + dy;
        if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) continue;
        const t = tiles[x]?.[y];
        if (t === 'water' || t === 'tree' || t === 'rock') continue;
        if (occupied.has(`${x},${y}`)) continue;
        return { x, y };
      }
    }
  }
  return null;
}

function nearestResource(
  nodes: ResourceNode[],
  wx: number,
  wy: number
): { idx: number; node: ResourceNode } | null {
  let best: { idx: number; node: ResourceNode } | null = null;
  nodes.forEach((n, idx) => {
    if (n.amount <= 0) return;
    if (
      !best ||
      tileDist(wx, wy, n.x, n.y) < tileDist(wx, wy, best.node.x, best.node.y)
    )
      best = { idx, node: n };
  });
  return best;
}

function hasBuilding(buildings: PlacedBuilding[], type: BuildingType): boolean {
  return buildings.some(b => b.type === type && !b.constructing);
}

function canAfford(
  resources: Resources,
  cost: { gold: number; lumber: number; stone: number }
): boolean {
  return (
    resources.gold >= cost.gold &&
    resources.lumber >= cost.lumber &&
    resources.stone >= cost.stone
  );
}

// ---------- Decision functions ----------

function decideGathering(
  ctx: RTSGameContext,
  commands: BotCommands,
  snap: BotSnapshot
): void {
  const { resources, workers } = snap;
  const { goldMinesRef, treesRef, stoneNodesRef } = ctx;

  const idleFarmers = workers.filter(
    w =>
      w.unitType === 'farmer' &&
      w.hp > 0 &&
      w.state === 'idle' &&
      !w.gathering &&
      !w.attacking &&
      !w.movingTo
  );
  if (idleFarmers.length === 0) return;

  // Determine resource priority
  const needGold = resources.gold < 250;
  const needLumber = resources.lumber < 120;
  const needStone = resources.stone < 60;

  for (const farmer of idleFarmers) {
    if (needGold) {
      const best = nearestResource(goldMinesRef.current, farmer.x, farmer.y);
      if (best) {
        commands.orderGather(farmer.id, 'gold', best.idx);
        botLog('gather', `farmer ${farmer.id} → gold mine ${best.idx}`);
        continue;
      }
    }
    if (needLumber || !needGold) {
      const best = nearestResource(treesRef.current, farmer.x, farmer.y);
      if (best) {
        commands.orderGather(farmer.id, 'tree', best.idx);
        botLog('gather', `farmer ${farmer.id} → tree ${best.idx}`);
        continue;
      }
    }
    if (needStone) {
      const best = nearestResource(stoneNodesRef.current, farmer.x, farmer.y);
      if (best) {
        commands.orderGather(farmer.id, 'stone', best.idx);
        botLog('gather', `farmer ${farmer.id} → stone ${best.idx}`);
        continue;
      }
    }
    // Default: nearest gold
    const fallback = nearestResource(goldMinesRef.current, farmer.x, farmer.y);
    if (fallback) {
      commands.orderGather(farmer.id, 'gold', fallback.idx);
      botLog('gather', `farmer ${farmer.id} → gold (fallback)`);
    }
  }
}

function decideCombat(
  ctx: RTSGameContext,
  commands: BotCommands,
  snap: BotSnapshot
): void {
  const { workers } = snap;
  const {
    enemyGruntsRef,
    enemyWarchiefsRef,
    enemyWarlordsRef,
    enemyLurkersRef,
    enemyTrollsRef,
    enemySappersRef,
  } = ctx;

  const idleCombatants = workers.filter(
    w =>
      (w.unitType === 'swordsman' ||
        w.unitType === 'cavalry' ||
        w.unitType === 'hero') &&
      w.hp > 0 &&
      w.state === 'idle' &&
      !w.attacking
  );
  if (idleCombatants.length === 0) return;

  // Build a priority target list
  const warlords = enemyWarlordsRef.current.filter(e => e.hp > 0);
  const warchiefs = enemyWarchiefsRef.current.filter(e => e.hp > 0);
  const sappers = enemySappersRef.current.filter(e => e.hp > 0 && !e.exploded);
  const lurkers = enemyLurkersRef.current.filter(e => e.hp > 0);
  const trolls = enemyTrollsRef.current.filter(e => e.hp > 0);
  const grunts = enemyGruntsRef.current.filter(e => e.hp > 0);

  for (const unit of idleCombatants) {
    // Priority: sapper > warlord > warchief > lurker > troll > grunt
    const sapper = sappers.sort(
      (a, b) =>
        tileDist(unit.x, unit.y, a.x, a.y) - tileDist(unit.x, unit.y, b.x, b.y)
    )[0];
    if (sapper) {
      commands.orderAttack(unit.id, {
        targetType: 'sapper',
        sapperId: sapper.id,
      });
      botLog('combat', `${unit.unitType} ${unit.id} → sapper ${sapper.id}`);
      continue;
    }
    const warlord = warlords.sort(
      (a, b) =>
        tileDist(unit.x, unit.y, a.x, a.y) - tileDist(unit.x, unit.y, b.x, b.y)
    )[0];
    if (warlord) {
      commands.orderAttack(unit.id, {
        targetType: 'warlord',
        warlordId: warlord.id,
      });
      botLog('combat', `${unit.unitType} ${unit.id} → warlord ${warlord.id}`);
      continue;
    }
    const warchief = warchiefs.sort(
      (a, b) =>
        tileDist(unit.x, unit.y, a.x, a.y) - tileDist(unit.x, unit.y, b.x, b.y)
    )[0];
    if (warchief) {
      commands.orderAttack(unit.id, {
        targetType: 'warchief',
        warchiefId: warchief.id,
      });
      botLog('combat', `${unit.unitType} ${unit.id} → warchief ${warchief.id}`);
      continue;
    }
    const lurker = lurkers.sort(
      (a, b) =>
        tileDist(unit.x, unit.y, a.x, a.y) - tileDist(unit.x, unit.y, b.x, b.y)
    )[0];
    if (lurker) {
      commands.orderAttack(unit.id, {
        targetType: 'lurker',
        lurkerId: lurker.id,
      });
      botLog('combat', `${unit.unitType} ${unit.id} → lurker ${lurker.id}`);
      continue;
    }
    const troll = trolls.sort(
      (a, b) =>
        tileDist(unit.x, unit.y, a.x, a.y) - tileDist(unit.x, unit.y, b.x, b.y)
    )[0];
    if (troll) {
      commands.orderAttack(unit.id, { targetType: 'troll', trollId: troll.id });
      botLog('combat', `${unit.unitType} ${unit.id} → troll ${troll.id}`);
      continue;
    }
    const grunt = grunts.sort(
      (a, b) =>
        tileDist(unit.x, unit.y, a.x, a.y) - tileDist(unit.x, unit.y, b.x, b.y)
    )[0];
    if (grunt) {
      commands.orderAttack(unit.id, { targetType: 'grunt', gruntId: grunt.id });
      botLog('combat', `${unit.unitType} ${unit.id} → grunt ${grunt.id}`);
      continue;
    }
    // No enemies: rally near barn
    const rx = BARN_POS.x + 2 + Math.floor(Math.random() * 3);
    const ry = BARN_POS.y + Math.floor(Math.random() * 3);
    commands.orderMove(unit.id, rx, ry);
  }
}

// Building priority queue: entries tried in order until one succeeds
const BUILD_PRIORITY: BuildingType[] = [
  'farmhouse',
  'lumberShed',
  'watchtower',
  'barracks',
  'wall',
  'wall',
  'wall',
  'blacksmith',
  'granary',
  'stable',
  'frostTower',
  'ballista',
];

function decideBuilding(
  commands: BotCommands,
  snap: BotSnapshot,
  tick: number
): void {
  // Check buildings only every 2 ticks to avoid churn
  if (tick % 2 !== 0) return;

  const { resources, placedBuildings, tiles, wave, farmhouse } = snap;

  const occupied = new Set<string>([
    `${BARN_POS.x},${BARN_POS.y}`,
    ...placedBuildings.map(b => `${b.x},${b.y}`),
  ]);

  for (const btype of BUILD_PRIORITY) {
    // Skip walls before wave 3 (save resources for economy)
    if (btype === 'wall' && wave < 3) continue;
    // Skip military buildings before farmhouse is up
    if (
      (btype === 'barracks' || btype === 'stable' || btype === 'blacksmith') &&
      !farmhouse.built
    )
      continue;
    // Skip farmhouse if already built
    if (btype === 'farmhouse' && farmhouse.built) continue;

    // Check tech prereq
    const req = BUILDING_REQUIRES[btype];
    if (req) {
      if (!hasBuilding(placedBuildings, req)) continue;
    }

    // Already built this type (except wall — allow multiple)
    if (btype !== 'wall' && hasBuilding(placedBuildings, btype)) continue;

    // Check resources
    const cost = BUILDING_COSTS[btype];
    if (!cost || !canAfford(resources, cost)) continue;

    // Find a valid placement tile near barn
    const tile = findBuildTile(BARN_POS.x, BARN_POS.y, tiles, occupied);
    if (!tile) continue;

    const ok = commands.buildAt(btype, tile.x, tile.y);
    if (ok) {
      occupied.add(`${tile.x},${tile.y}`);
      botLog('build', `placed ${btype} at (${tile.x},${tile.y})`);
      return; // one building per tick
    }
  }
}

function decideTraining(
  commands: BotCommands,
  snap: BotSnapshot,
  tick: number
): void {
  const { resources, workers, placedBuildings, wave } = snap;
  const farmerCount = workers.filter(
    w => w.unitType === 'farmer' && w.hp > 0
  ).length;
  const combatCount = workers.filter(
    w =>
      (w.unitType === 'swordsman' ||
        w.unitType === 'cavalry' ||
        w.unitType === 'hero') &&
      w.hp > 0
  ).length;

  // Train farmers: aim for 3 farmers minimum, more if economy is strong
  const targetFarmers = Math.min(5, 3 + Math.floor(wave / 10));
  if (farmerCount < targetFarmers && resources.gold >= 30) {
    const ok = commands.trainFarmer();
    if (ok) {
      botLog('train', `farmer (have ${farmerCount}/${targetFarmers})`);
      return;
    }
  }

  // Train swordsmen: alternate with economy, one every 2 ticks
  if (
    tick % 2 === 1 &&
    hasBuilding(placedBuildings, 'barracks') &&
    combatCount < 6 &&
    resources.gold >= 100
  ) {
    const ok = commands.trainSwordsman();
    if (ok) botLog('train', `swordsman (${combatCount + 1})`);
  }
}

// ---------- Main log buffer (shared with window) ----------
const _log: Array<{ category: string; msg: string; ts: number }> = [];
function botLog(category: string, msg: string): void {
  _log.push({ category, msg, ts: Date.now() });
  if (_log.length > 500) _log.shift();
}

// ---------- Hook ----------

export function useBotController(
  ctx: RTSGameContext,
  commands: BotCommands,
  snapshotRef: React.RefObject<BotSnapshot | null>,
  active: boolean
): void {
  const tickRef = useRef(0);
  const lastBotTickRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).__farmBotLog = _log;
      (window as unknown as Record<string, unknown>).__farmBotTick = () =>
        tickRef.current;
    }

    // Poll at a fine interval (350ms) but only execute when enough scaled
    // game-time has elapsed (BOT_TICK_MS / gameSpeed), so the bot thinks
    // proportionally faster at 2x/3x game speed.
    const id = window.setInterval(() => {
      const snap = snapshotRef.current;
      if (!snap || snap.gameOver) return;
      const speed = ctx.gameSpeedRef.current;
      if (speed <= 0) return;

      const now = Date.now();
      const scaledInterval = BOT_TICK_MS / speed;
      if (now - lastBotTickRef.current < scaledInterval) return;
      lastBotTickRef.current = now;

      tickRef.current++;
      const tick = tickRef.current;

      decideGathering(ctx, commands, snap);
      decideCombat(ctx, commands, snap);
      decideBuilding(commands, snap, tick);
      decideTraining(commands, snap, tick);
    }, 350);

    return () => {
      window.clearInterval(id);
      if (typeof window !== 'undefined') {
        delete (window as unknown as Record<string, unknown>).__farmBotLog;
        delete (window as unknown as Record<string, unknown>).__farmBotTick;
      }
    };
  }, [active, ctx, commands, snapshotRef]);
}

// Re-export so RTSMap can build worker paths for the bot's orderGather/orderMove
export { aStar, INITIAL_TILES, tileDist };
