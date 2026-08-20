'use client';
import React, { useCallback } from 'react';

import type { RTSGameContext } from './context';
import type {
  BuildingType,
  EnemyGrunt,
  FarmhouseAction,
  HeroItem,
  HeroItemId,
  ResourceNode,
  Resources,
  Upgrades,
} from '../game/types';
import {
  ATTACK_DAMAGE,
  BARN_POS,
  BLACKSMITH_IRON_HIDE_COSTS,
  BLACKSMITH_STEEL_EDGE_COSTS,
  BUILDING_COSTS,
  BUILDING_MAX_HP,
  BUILDING_REQUIRES,
  CAVALRY_SPRINT_COOLDOWN_S,
  CAVALRY_SPRINT_DURATION_MS,
  EARTHQUAKE_COOLDOWN_S,
  EARTHQUAKE_DAMAGE,
  EARTHQUAKE_RADIUS,
  EARTHQUAKE_STUN_MS,
  ENEMY_BARN_POS,
  FOOD_CAP_BASE,
  FOOD_CAP_PER_LEVEL,
  GARRISON_CAP,
  GRID_SIZE,
  GUARD_TOWER_COST,
  HERO_ABILITY_COOLDOWN_S,
  HERO_ABILITY_DAMAGE,
  HERO_ABILITY_RADIUS,
  HERO_ITEM_DATA,
  HERO_MAX_ITEMS,
  HERO_SHOUT_COOLDOWN_S,
  HERO_SHOUT_DURATION_MS,
  HERO_SHOUT_RADIUS,
  TILE_SIZE,
  TRAIN_CATAPULT_COST,
  TRAIN_CAVALRY_COST,
  TRAIN_FARMER_COST,
  TRAIN_HERO_COST,
  TRAIN_QUEUE_MAX,
  TRAIN_SWORDSMAN_COST,
  TRAIN_TREBUCHET_COST,
  UPGRADE_COSTS,
  UPGRADE_MAX,
  VETERAN_HP_BONUS,
  VETERAN_TRAINING_COST,
  XP_TO_LEVEL_1,
  XP_TO_LEVEL_2,
  XP_TO_LEVEL_3,
  WAR_DRUMS_COST,
  SWORDSMAN_CHARGE_COOLDOWN_S,
  SWORDSMAN_CHARGE_DAMAGE_MULT,
  SWORDSMAN_DAMAGE_BONUS,
} from '../game/constants';
import { aStar } from '../game/pathfinding';
import { INITIAL_TILES, svgToTile, tileDist, tileToSvg } from '../game/map';
import { ACK_ATTACK, ACK_MOVE, pickAck, Snd } from '../game/sound';
import { makeUnit } from '../game/units';

// ---------------------------------------------------------------------------
// Exported type
// ---------------------------------------------------------------------------

export type FormationMode = 'cluster' | 'line' | 'wedge' | 'box';

// ---------------------------------------------------------------------------
// Module-level constants (no state deps)
// ---------------------------------------------------------------------------

export const FORMATION_OFFSETS_BY_MODE: Record<
  string,
  { dx: number; dy: number }[]
> = {
  cluster: [
    { dx: 0, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 1 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: -1 },
  ],
  line: [
    { dx: 0, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 2, dy: 0 },
    { dx: -2, dy: 0 },
    { dx: 3, dy: 0 },
    { dx: -3, dy: 0 },
    { dx: 4, dy: 0 },
    { dx: -4, dy: 0 },
  ],
  wedge: [
    { dx: 0, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: 1 },
    { dx: -2, dy: 2 },
    { dx: 0, dy: 2 },
    { dx: 2, dy: 2 },
    { dx: -3, dy: 3 },
    { dx: -1, dy: 3 },
    { dx: 1, dy: 3 },
  ],
  box: [
    { dx: 0, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: 2 },
    { dx: 1, dy: 2 },
    { dx: -1, dy: 2 },
  ],
};

export const SHOP_ITEMS: { itemId: HeroItemId; cost: number }[] = [
  { itemId: 'boots_speed', cost: 75 },
  { itemId: 'battle_sword', cost: 100 },
  { itemId: 'shield_pendant', cost: 80 },
  { itemId: 'healing_potion', cost: 50 },
];

// ---------------------------------------------------------------------------
// RTSHandlerContext — UI state the handlers need beyond what RTSGameContext provides
// ---------------------------------------------------------------------------

export interface RTSHandlerContext {
  buildMode: BuildingType | null;
  setBuildMode: React.Dispatch<React.SetStateAction<BuildingType | null>>;
  setGhostTile: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
  formationModeRef: React.MutableRefObject<FormationMode>;
  setDragBox: React.Dispatch<
    React.SetStateAction<{
      start: { x: number; y: number };
      end: { x: number; y: number };
    } | null>
  >;
  isDraggingRef: React.MutableRefObject<boolean>;
  buildingIdRef: React.MutableRefObject<number>;
  svgRef: React.RefObject<SVGSVGElement>;
  setMoveRing: React.Dispatch<
    React.SetStateAction<{ svgX: number; svgY: number; born: number } | null>
  >;
  towerGarrison: Record<number, import('../game/types').WorkerState[]>;
  setTowerGarrison: React.Dispatch<
    React.SetStateAction<Record<number, import('../game/types').WorkerState[]>>
  >;
  trees: ResourceNode[];
  goldMines: ResourceNode[];
  stoneNodes: ResourceNode[];
  resources: Resources;
  heroAbilityCooldown: number;
  setHeroAbilityCooldown: React.Dispatch<React.SetStateAction<number>>;
  heroShoutCooldown: number;
  setHeroShoutCooldown: React.Dispatch<React.SetStateAction<number>>;
  setBattleShoutUntil: React.Dispatch<React.SetStateAction<number>>;
  harvestBoonCooldown: number;
  harvestBoonActive: boolean;
  setHarvestBoonCooldown: React.Dispatch<React.SetStateAction<number>>;
  setHarvestBoonActive: React.Dispatch<React.SetStateAction<boolean>>;
  harvestBoonRef: React.MutableRefObject<boolean>;
  earthquakeCooldown: number;
  setEarthquakeCooldown: React.Dispatch<React.SetStateAction<number>>;
  setEarthquakeEffect: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; at: number } | null>
  >;
  heroItems: HeroItem[];
  enemyBarnHp: number;
  setFarmhouse: React.Dispatch<
    React.SetStateAction<{ built: boolean; level: number }>
  >;
  heroRecruited: boolean;
  setHeroRecruited: React.Dispatch<React.SetStateAction<boolean>>;
  guardTowerResearched: boolean;
  setGuardTowerResearched: React.Dispatch<React.SetStateAction<boolean>>;
  barracksTech: { veteranTraining: boolean; warDrums: boolean };
  setBarracksTech: React.Dispatch<
    React.SetStateAction<{ veteranTraining: boolean; warDrums: boolean }>
  >;
  blacksmithUpgrades: { steelEdge: number; ironHide: number };
  setBlacksmithUpgrades: React.Dispatch<
    React.SetStateAction<{ steelEdge: number; ironHide: number }>
  >;
  trainingQueue: { type: 'swordsman' | 'cavalry' }[];
  rallyPoint: { x: number; y: number } | null;
  setRallyPoint: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
  upgrades: Upgrades;
  setUpgrades: React.Dispatch<React.SetStateAction<Upgrades>>;
  setPatrolMode: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedType: React.Dispatch<
    React.SetStateAction<'worker' | 'farmhouse' | 'building' | null>
  >;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRTSHandlers(ctx: RTSGameContext, ui: RTSHandlerContext) {
  const {
    addFloatingText,
    blacksmithUpgradesRef,
    enemyGruntsRef,
    enemyLurkersRef,
    enemyNecromancersRef,
    enemySappersRef,
    enemyShamansRef,
    enemySiegeRef,
    enemyTrollsRef,
    enemyWarchiefsRef,
    enemyWarlordsRef,
    enemyWitchDoctorsRef,
    farmhouse,
    gatherTimeoutsRef,
    attackTimeoutsRef,
    garrisonedRef,
    heroItemsRef,
    dropItemIdRef,
    neutralCreepsRef,
    placedBuildings,
    setDroppedItems,
    setEnemyGrunts,
    setEnemyNecromancers,
    setEnemySappers,
    setEnemyShamans,
    setEnemySiege,
    setEnemyTrolls,
    setEnemyWarchiefs,
    setEnemyWarlords,
    setEnemyWitchDoctors,
    setGarrisoned,
    setHeroItems,
    setPlacedBuildings,
    setResources,
    setWorkers,
    shrineWarBuffRef,
    towerGarrisonRef,
    upgradesRef,
    workers,
    workersRef,
  } = ctx;

  const {
    buildMode,
    setBuildMode,
    setGhostTile,
    formationModeRef,
    setDragBox,
    isDraggingRef,
    buildingIdRef,
    svgRef,
    setMoveRing,
    setTowerGarrison,
    trees,
    goldMines,
    stoneNodes,
    resources,
    heroAbilityCooldown,
    setHeroAbilityCooldown,
    heroShoutCooldown,
    setHeroShoutCooldown,
    setBattleShoutUntil,
    harvestBoonCooldown,
    harvestBoonActive,
    setHarvestBoonCooldown,
    setHarvestBoonActive,
    harvestBoonRef,
    earthquakeCooldown,
    setEarthquakeCooldown,
    setEarthquakeEffect,
    heroItems,
    enemyBarnHp,
    setFarmhouse,
    heroRecruited,
    setHeroRecruited,
    guardTowerResearched,
    setGuardTowerResearched,
    barracksTech,
    setBarracksTech,
    blacksmithUpgrades,
    setBlacksmithUpgrades,
    trainingQueue,
    rallyPoint,
    setRallyPoint,
    upgrades,
    setUpgrades,
    setPatrolMode,
    setSelectedType,
  } = ui;

  // Derived
  const anySelected = workers.some(w => w.selected);

  // Local constants mirrored from RTSMap (no state deps — could be top-level but
  // kept here so they live alongside their only consumer, handleFarmhouseAction).
  const farmhouseUpgradeCosts = [
    { gold: 50, lumber: 50 },
    { gold: 100, lumber: 100 },
    { gold: 200, lumber: 200 },
  ];
  const maxFarmhouseLevel = farmhouseUpgradeCosts.length - 1;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const isTileOccupied = useCallback(
    (x: number, y: number): boolean => {
      if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return true;
      if (INITIAL_TILES[x]?.[y] === 'water') return true;
      if (x === BARN_POS.x && y === BARN_POS.y) return true;
      if (x === ENEMY_BARN_POS.x && y === ENEMY_BARN_POS.y) return true;
      if (trees.some(t => t.x === x && t.y === y && t.amount > 0)) return true;
      if (goldMines.some(m => m.x === x && m.y === y && m.amount > 0))
        return true;
      if (stoneNodes.some(s => s.x === x && s.y === y && s.amount > 0))
        return true;
      if (placedBuildings.some(b => b.x === x && b.y === y)) return true;
      return false;
    },
    [trees, goldMines, stoneNodes, placedBuildings]
  );

  const clientToSvg = useCallback((cx: number, cy: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = cx;
    pt.y = cy;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }, []);

  const getFormationOffsets = () =>
    FORMATION_OFFSETS_BY_MODE[formationModeRef.current] ??
    FORMATION_OFFSETS_BY_MODE.cluster!;

  // ---------------------------------------------------------------------------
  // Tower garrison
  // ---------------------------------------------------------------------------

  const handleTowerGarrison = useCallback(
    (towerId: number, tx: number, ty: number) => {
      const TOWER_CAP = 3;
      setWorkers(ws => {
        const current = towerGarrisonRef.current[towerId] ?? [];
        const slots = TOWER_CAP - current.length;
        if (slots <= 0) return ws;
        const selected = ws
          .filter(
            w =>
              w.selected &&
              w.unitType !== 'catapult' &&
              w.unitType !== 'trebuchet'
          )
          .slice(0, slots);
        if (selected.length === 0) return ws;
        const ids = new Set(selected.map(w => w.id));
        setTowerGarrison(tg => ({
          ...tg,
          [towerId]: [
            ...(tg[towerId] ?? []),
            ...selected.map(w => ({
              ...w,
              selected: false,
              state: 'idle' as const,
              movingTo: null,
              path: [],
              gathering: null,
              attacking: null,
              repairing: null,
              patrol: null,
              attackMove: false,
              attackMoveTarget: null,
            })),
          ],
        }));
        setResources(r => ({ ...r, food: r.food - selected.length }));
        addFloatingText(tx, ty, `+${selected.length} 🏰`, '#22d3ee');
        return ws.filter(w => !ids.has(w.id));
      });
    },
    [addFloatingText]
  );

  const handleTowerDeploy = useCallback(
    (towerId: number, tx: number, ty: number) => {
      const units = towerGarrisonRef.current[towerId] ?? [];
      if (units.length === 0) return;
      setTowerGarrison(tg => {
        const next = { ...tg };
        delete next[towerId];
        return next;
      });
      setWorkers(ws => [
        ...ws,
        ...units.map((u, i) => ({
          ...u,
          x: tx + (i % 2 === 0 ? -1 : 1),
          y: ty + Math.floor(i / 2),
          selected: false,
        })),
      ]);
      setResources(r => ({ ...r, food: r.food + units.length }));
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Barn garrison
  // ---------------------------------------------------------------------------

  const handleGarrison = useCallback(() => {
    setWorkers(ws => {
      const slots = GARRISON_CAP - garrisonedRef.current.length;
      if (slots <= 0) return ws;
      const toGarrison = ws.filter(w => w.selected).slice(0, slots);
      if (toGarrison.length === 0) return ws;
      Snd.garrison();
      const ids = new Set(toGarrison.map(w => w.id));
      setGarrisoned(g => [
        ...g,
        ...toGarrison.map(w => ({
          ...w,
          selected: false,
          state: 'idle' as const,
          movingTo: null,
          path: [],
          gathering: null,
          attacking: null,
          repairing: null,
          patrol: null,
        })),
      ]);
      setResources(r => ({ ...r, food: r.food - toGarrison.length }));
      return ws.filter(w => !ids.has(w.id));
    });
  }, []);

  const handleUngarrison = useCallback(() => {
    const units = garrisonedRef.current;
    if (units.length === 0) return;
    setGarrisoned([]);
    setWorkers(ws => {
      const newId = Math.max(...ws.map(w => w.id), ...units.map(u => u.id), 0);
      void newId;
      const deployed = units.map((u, i) => ({
        ...u,
        x: BARN_POS.x + (i % 3) - 1,
        y: BARN_POS.y + Math.floor(i / 3) + 1,
      }));
      setResources(r => ({ ...r, food: r.food + units.length }));
      return [...ws, ...deployed];
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Hero abilities
  // ---------------------------------------------------------------------------

  const handleHeroAbility = useCallback(() => {
    if (heroAbilityCooldown > 0) return;
    const hero = workersRef.current.find(w => w.unitType === 'hero');
    if (!hero) return;
    const hx = Math.round(hero.x),
      hy = Math.round(hero.y);
    setEnemyGrunts(gs =>
      gs.map(g => {
        if (tileDist(g.x, g.y, hx, hy) <= HERO_ABILITY_RADIUS) {
          addFloatingText(
            Math.round(g.x),
            Math.round(g.y),
            `-${HERO_ABILITY_DAMAGE}🗡️`,
            '#f59e0b'
          );
          return { ...g, hp: Math.max(0, g.hp - HERO_ABILITY_DAMAGE) };
        }
        return g;
      })
    );
    addFloatingText(hx, hy, '⚡ Rallying Cry!', '#fbbf24');
    Snd.ability();
    setHeroAbilityCooldown(HERO_ABILITY_COOLDOWN_S);
  }, [heroAbilityCooldown, addFloatingText]);

  const handleBattleShout = useCallback(() => {
    if (heroShoutCooldown > 0) return;
    const hero = workersRef.current.find(
      w => w.unitType === 'hero' && w.hp > 0 && w.level >= 2
    );
    if (!hero) return;
    const until = Date.now() + HERO_SHOUT_DURATION_MS;
    setBattleShoutUntil(until);
    addFloatingText(
      Math.round(hero.x),
      Math.round(hero.y),
      '📯 Battle Shout!',
      '#fb923c'
    );
    Snd.ability();
    workersRef.current
      .filter(
        w =>
          w.hp > 0 &&
          w.id !== hero.id &&
          tileDist(w.x, w.y, hero.x, hero.y) <= HERO_SHOUT_RADIUS
      )
      .forEach(w => {
        addFloatingText(
          Math.round(w.x),
          Math.round(w.y),
          '⚡ HASTED!',
          '#fbbf24'
        );
      });
    setHeroShoutCooldown(HERO_SHOUT_COOLDOWN_S);
  }, [heroShoutCooldown, addFloatingText]);

  const handleHarvestBoon = useCallback(() => {
    if (harvestBoonCooldown > 0 || harvestBoonActive) return;
    const hero = workersRef.current.find(w => w.unitType === 'hero');
    if (!hero) return;
    setHarvestBoonActive(true);
    harvestBoonRef.current = true;
    addFloatingText(
      Math.round(hero.x),
      Math.round(hero.y),
      '🌾 Harvest Boon!',
      '#86efac'
    );
    workers.forEach(w => {
      if (w.unitType === 'farmer')
        addFloatingText(Math.round(w.x), Math.round(w.y), '⚡', '#86efac');
    });
    setHarvestBoonCooldown(40);
    window.setTimeout(() => {
      setHarvestBoonActive(false);
      harvestBoonRef.current = false;
    }, 10000);
  }, [harvestBoonCooldown, harvestBoonActive, addFloatingText, workers]);

  // ---------------------------------------------------------------------------
  // Hero shop
  // ---------------------------------------------------------------------------

  const handleBuyItem = useCallback(
    (itemId: HeroItemId, cost: number) => {
      if (resources.gold < cost) return;
      if (heroItemsRef.current.length >= HERO_MAX_ITEMS) return;
      if (itemId === 'tome_xp') {
        setWorkers(ws =>
          ws.map(w => {
            if (w.unitType !== 'hero') return w;
            const newXp = w.xp + 80;
            const newLevel =
              newXp >= XP_TO_LEVEL_3
                ? 3
                : newXp >= XP_TO_LEVEL_2
                  ? 2
                  : newXp >= XP_TO_LEVEL_1
                    ? 1
                    : 0;
            if (newLevel > w.level) {
              addFloatingText(
                Math.round(w.x),
                Math.round(w.y),
                `⭐ Level ${newLevel}!`,
                '#fbbf24'
              );
              return {
                ...w,
                xp: newXp,
                level: newLevel,
                maxHp: w.maxHp + VETERAN_HP_BONUS,
                hp: Math.min(
                  w.hp + VETERAN_HP_BONUS,
                  w.maxHp + VETERAN_HP_BONUS
                ),
              };
            }
            return { ...w, xp: newXp };
          })
        );
      } else {
        setHeroItems(hi => [...hi, { id: dropItemIdRef.current++, itemId }]);
      }
      setResources(r => ({ ...r, gold: r.gold - cost }));
      const hero = workersRef.current.find(
        w => w.unitType === 'hero' && w.hp > 0
      );
      if (hero)
        addFloatingText(
          Math.round(hero.x),
          Math.round(hero.y),
          `${HERO_ITEM_DATA[itemId].emoji} Purchased!`,
          '#c084fc'
        );
      Snd.ability();
    },
    [resources.gold, addFloatingText]
  );

  const handleDropItem = useCallback(
    (itemSlotId: number) => {
      const item = heroItems.find(it => it.id === itemSlotId);
      if (!item) return;
      const hero = workersRef.current.find(
        w => w.unitType === 'hero' && w.hp > 0
      );
      if (!hero) return;
      setDroppedItems(ds => [
        ...ds,
        {
          id: dropItemIdRef.current++,
          itemId: item.itemId,
          x: Math.round(hero.x),
          y: Math.round(hero.y) + 1,
        },
      ]);
      setHeroItems(hi => hi.filter(it => it.id !== itemSlotId));
    },
    [heroItems]
  );

  const handleUsePotion = useCallback(() => {
    const potionIdx = heroItems.findIndex(it => it.itemId === 'healing_potion');
    if (potionIdx < 0) return;
    const hero = workersRef.current.find(
      w => w.unitType === 'hero' && w.hp > 0
    );
    if (!hero) return;
    const healAmt = 75;
    setWorkers(ws =>
      ws.map(w =>
        w.unitType === 'hero'
          ? { ...w, hp: Math.min(w.maxHp, w.hp + healAmt) }
          : w
      )
    );
    setHeroItems(hi => {
      const next = [...hi];
      next.splice(potionIdx, 1);
      return next;
    });
    addFloatingText(
      Math.round(hero.x),
      Math.round(hero.y),
      `🧪 +${healAmt} HP`,
      '#4ade80'
    );
    Snd.ability();
  }, [heroItems, addFloatingText]);

  // ---------------------------------------------------------------------------
  // Earthquake (hero L3 ability)
  // ---------------------------------------------------------------------------

  const handleEarthquake = useCallback(() => {
    if (earthquakeCooldown > 0) return;
    const hero = workersRef.current.find(
      w => w.unitType === 'hero' && w.hp > 0 && w.level >= 3
    );
    if (!hero) return;
    const hx = Math.round(hero.x),
      hy = Math.round(hero.y);
    const now = Date.now();
    const stunUntil = now + EARTHQUAKE_STUN_MS;
    setEnemyGrunts(gs =>
      gs.map(g =>
        tileDist(g.x, g.y, hx, hy) <= EARTHQUAKE_RADIUS
          ? {
              ...g,
              hp: Math.max(0, g.hp - EARTHQUAKE_DAMAGE),
              frozenUntil: stunUntil,
            }
          : g
      )
    );
    setEnemyShamans(ss =>
      ss.map(s =>
        tileDist(s.x, s.y, hx, hy) <= EARTHQUAKE_RADIUS
          ? { ...s, hp: Math.max(0, s.hp - EARTHQUAKE_DAMAGE) }
          : s
      )
    );
    setEnemyTrolls(ts =>
      ts.map(t =>
        tileDist(t.x, t.y, hx, hy) <= EARTHQUAKE_RADIUS
          ? { ...t, hp: Math.max(0, t.hp - EARTHQUAKE_DAMAGE) }
          : t
      )
    );
    setEnemySiege(rs =>
      rs.map(r =>
        tileDist(r.x, r.y, hx, hy) <= EARTHQUAKE_RADIUS
          ? { ...r, hp: Math.max(0, r.hp - EARTHQUAKE_DAMAGE) }
          : r
      )
    );
    setEnemyWarchiefs(ws2 =>
      ws2.map(wc =>
        tileDist(wc.x, wc.y, hx, hy) <= EARTHQUAKE_RADIUS
          ? { ...wc, hp: Math.max(0, wc.hp - EARTHQUAKE_DAMAGE) }
          : wc
      )
    );
    addFloatingText(hx, hy, '🌋 EARTHQUAKE!', '#f59e0b');
    setEarthquakeEffect({ x: hx, y: hy, at: now });
    Snd.ability();
    setEarthquakeCooldown(EARTHQUAKE_COOLDOWN_S);
  }, [earthquakeCooldown, addFloatingText]);

  // ---------------------------------------------------------------------------
  // Unit special abilities
  // ---------------------------------------------------------------------------

  const handleSwordsmanCharge = useCallback(() => {
    const swords = workersRef.current.filter(
      w => w.selected && w.unitType === 'swordsman' && w.chargeCooldown <= 0
    );
    if (swords.length === 0) return;
    const allGrunts = enemyGruntsRef.current.filter(g => g.hp > 0);
    if (allGrunts.length === 0) return;
    Snd.charge();
    swords.forEach(sw => {
      const nearest = allGrunts.reduce<EnemyGrunt | null>(
        (best, g) =>
          !best ||
          tileDist(sw.x, sw.y, g.x, g.y) < tileDist(best.x, best.y, sw.x, sw.y)
            ? g
            : best,
        null
      );
      if (!nearest) return;
      const dmg =
        (ATTACK_DAMAGE +
          SWORDSMAN_DAMAGE_BONUS +
          upgradesRef.current.sharperTools * 5 +
          blacksmithUpgradesRef.current.steelEdge * 5 +
          (shrineWarBuffRef.current ? 5 : 0)) *
        SWORDSMAN_CHARGE_DAMAGE_MULT;
      addFloatingText(
        Math.round(nearest.x),
        Math.round(nearest.y),
        `⚔️-${dmg}`,
        '#ef4444'
      );
      addFloatingText(
        Math.round(sw.x),
        Math.round(sw.y),
        '⚡ Charge!',
        '#fbbf24'
      );
      setEnemyGrunts(gs =>
        gs.map(g =>
          g.id === nearest.id ? { ...g, hp: Math.max(0, g.hp - dmg) } : g
        )
      );
    });
    setWorkers(ws =>
      ws.map(w =>
        swords.some(s => s.id === w.id)
          ? { ...w, chargeCooldown: SWORDSMAN_CHARGE_COOLDOWN_S }
          : w
      )
    );
  }, [addFloatingText]);

  const handleCavalrySprint = useCallback(() => {
    const cav = workersRef.current.filter(
      w => w.selected && w.unitType === 'cavalry' && w.sprintCooldown <= 0
    );
    if (cav.length === 0) return;
    Snd.charge();
    const ids = new Set(cav.map(w => w.id));
    setWorkers(ws =>
      ws.map(w =>
        ids.has(w.id)
          ? { ...w, sprinting: true, sprintCooldown: CAVALRY_SPRINT_COOLDOWN_S }
          : w
      )
    );
    cav.forEach(c =>
      addFloatingText(Math.round(c.x), Math.round(c.y), '🐴 Sprint!', '#f59e0b')
    );
    window.setTimeout(() => {
      setWorkers(ws =>
        ws.map(w => (ids.has(w.id) ? { ...w, sprinting: false } : w))
      );
    }, CAVALRY_SPRINT_DURATION_MS);
  }, [addFloatingText]);

  // ---------------------------------------------------------------------------
  // Movement commands
  // ---------------------------------------------------------------------------

  /** Issue a move command to selected workers using A*; spreads into formation when pure move */
  const commandMove = useCallback(
    (
      targetX: number,
      targetY: number,
      gathering?: import('../game/types').WorkerState['gathering'],
      attacking?: import('../game/types').WorkerState['attacking']
    ) => {
      // Flash move-target ring at destination (only for pure moves, not gather/attack)
      if (!gathering && !attacking) {
        const { isoX, isoY } = tileToSvg(targetX, targetY);
        setMoveRing({
          svgX: isoX + TILE_SIZE / 2,
          svgY: isoY + TILE_SIZE / 4,
          born: Date.now(),
        });
        Snd.move();
      }
      setWorkers(ws => {
        const selected = ws.filter(w => w.selected);
        // Voice acknowledgement — pick one speaker from selected units
        const speaker = selected[Math.floor(Math.random() * selected.length)];
        if (speaker) {
          const lines = attacking
            ? (ACK_ATTACK[speaker.unitType] ?? ACK_ATTACK.farmer)
            : (ACK_MOVE[speaker.unitType] ?? ACK_MOVE.farmer);
          const ack = pickAck(lines ?? []);
          if (ack)
            addFloatingText(
              Math.round(speaker.x),
              Math.round(speaker.y),
              ack,
              '#fde68a'
            );
        }
        let idx = 0;
        return ws.map(w => {
          if (!w.selected) return w;
          if (
            gathering &&
            (w.unitType === 'swordsman' ||
              w.unitType === 'catapult' ||
              w.unitType === 'trebuchet' ||
              w.unitType === 'hero' ||
              w.unitType === 'cavalry')
          )
            return w;
          const isFormation = !gathering && !attacking;
          const offset = isFormation
            ? (getFormationOffsets()[idx++] ?? { dx: 0, dy: 0 })
            : { dx: 0, dy: 0 };
          const tx = Math.max(0, Math.min(GRID_SIZE - 1, targetX + offset.dx));
          const ty = Math.max(0, Math.min(GRID_SIZE - 1, targetY + offset.dy));
          const dest =
            INITIAL_TILES[tx]?.[ty] === 'water'
              ? { x: targetX, y: targetY }
              : { x: tx, y: ty };
          const startTile = { x: Math.round(w.x), y: Math.round(w.y) };
          const rawPath = aStar(INITIAL_TILES, startTile, dest);
          const first = rawPath[0] ?? dest;
          return {
            ...w,
            movingTo: first,
            path: rawPath.slice(1),
            gathering: gathering ?? null,
            attacking: attacking ?? null,
            repairing: null,
            attackMove: false,
            attackMoveTarget: null,
            patrol: null,
            holdPosition: false,
            waypoints: [],
            state: 'moving',
          };
        });
      });
    },
    [addFloatingText]
  );

  // Shift+right-click: append waypoint to queue
  const commandQueueMove = useCallback((targetX: number, targetY: number) => {
    setWorkers(ws => {
      let idx = 0;
      return ws.map(w => {
        if (!w.selected) return w;
        const offset = getFormationOffsets()[idx++] ?? { dx: 0, dy: 0 };
        const tx = Math.max(0, Math.min(GRID_SIZE - 1, targetX + offset.dx));
        const ty = Math.max(0, Math.min(GRID_SIZE - 1, targetY + offset.dy));
        const dest =
          INITIAL_TILES[tx]?.[ty] === 'water'
            ? { x: targetX, y: targetY }
            : { x: tx, y: ty };
        // If unit is idle or has no movingTo, start moving immediately; otherwise append waypoint
        if (!w.movingTo && w.state !== 'moving') {
          const startTile = { x: Math.round(w.x), y: Math.round(w.y) };
          const rawPath = aStar(INITIAL_TILES, startTile, dest);
          return {
            ...w,
            movingTo: rawPath[0] ?? dest,
            path: rawPath.slice(1),
            gathering: null,
            attacking: null,
            repairing: null,
            patrol: null,
            waypoints: [],
            state: 'moving' as const,
          };
        }
        return { ...w, waypoints: [...(w.waypoints ?? []), dest] };
      });
    });
  }, []);

  // ---------------------------------------------------------------------------
  // SVG mouse handlers
  // ---------------------------------------------------------------------------

  const handleSvgMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (e.button !== 0 || buildMode) return;
      const coords = clientToSvg(e.clientX, e.clientY);
      if (!coords) return;
      isDraggingRef.current = true;
      setDragBox({
        start: { x: coords.x, y: coords.y },
        end: { x: coords.x, y: coords.y },
      });
    },
    [clientToSvg, buildMode]
  );

  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (buildMode) {
        const coords = clientToSvg(e.clientX, e.clientY);
        if (coords) {
          const { tx, ty } = svgToTile(coords.x, coords.y);
          setGhostTile({ x: tx, y: ty });
        }
        return;
      }
      if (!isDraggingRef.current) return;
      const coords = clientToSvg(e.clientX, e.clientY);
      if (coords)
        setDragBox(db =>
          db ? { ...db, end: { x: coords.x, y: coords.y } } : null
        );
    },
    [clientToSvg, buildMode]
  );

  const handleSvgMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (buildMode && e.button === 0) {
        const coords = clientToSvg(e.clientX, e.clientY);
        if (coords) {
          const { tx, ty } = svgToTile(coords.x, coords.y);
          if (!isTileOccupied(tx, ty)) {
            const cost = BUILDING_COSTS[buildMode];
            if (
              resources.gold >= cost.gold &&
              resources.lumber >= cost.lumber &&
              resources.stone >= cost.stone
            ) {
              setResources(r => ({
                ...r,
                gold: r.gold - cost.gold,
                lumber: r.lumber - cost.lumber,
                stone: r.stone - cost.stone,
              }));
              setPlacedBuildings(bs => {
                const maxHp = BUILDING_MAX_HP[buildMode];
                return [
                  ...bs,
                  {
                    id: buildingIdRef.current++,
                    type: buildMode,
                    x: tx,
                    y: ty,
                    hp: 1,
                    maxHp,
                    constructing: true,
                    constructedAt: Date.now(),
                  },
                ];
              });
            }
            setBuildMode(null);
            setGhostTile(null);
          }
        }
        return;
      }
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setDragBox(db => {
        if (!db) return null;
        const coords = clientToSvg(e.clientX, e.clientY);
        const end = coords ?? db.end;
        if (
          Math.abs(end.x - db.start.x) > 8 ||
          Math.abs(end.y - db.start.y) > 8
        ) {
          const minX = Math.min(db.start.x, end.x),
            maxX = Math.max(db.start.x, end.x);
          const minY = Math.min(db.start.y, end.y),
            maxY = Math.max(db.start.y, end.y);
          setWorkers(ws => {
            const hit = ws.filter(w => {
              const { isoX, isoY } = tileToSvg(w.x, w.y);
              const wx = isoX + TILE_SIZE / 2,
                wy = isoY + 18;
              return wx >= minX && wx <= maxX && wy >= minY && wy <= maxY;
            });
            if (hit.length === 0) return ws;
            setSelectedType('worker');
            const hitIds = new Set(hit.map(w => w.id));
            return ws.map(w => ({ ...w, selected: hitIds.has(w.id) }));
          });
        }
        return null;
      });
    },
    [clientToSvg, buildMode, isTileOccupied]
  );

  // ---------------------------------------------------------------------------
  // Farmhouse / building / training actions
  // ---------------------------------------------------------------------------

  const handleFarmhouseAction = (action: FarmhouseAction) => {
    if (action === 'build' || action === 'upgrade') {
      const level = farmhouse.built ? farmhouse.level : 0;
      const cost = farmhouseUpgradeCosts[level];
      if (!cost || (farmhouse.built && farmhouse.level >= maxFarmhouseLevel))
        return;
      if (resources.gold < cost.gold || resources.lumber < cost.lumber) return;
      setResources(r => ({
        ...r,
        gold: r.gold - cost.gold,
        lumber: r.lumber - cost.lumber,
      }));
      setFarmhouse(fh =>
        fh.built
          ? { built: true, level: fh.level + 1 }
          : { built: true, level: 1 }
      );
      setResources(r => ({
        ...r,
        foodCap: FOOD_CAP_BASE + (farmhouse.level + 1) * FOOD_CAP_PER_LEVEL,
      }));
    } else if (action === 'train') {
      if (
        resources.gold < TRAIN_FARMER_COST ||
        resources.food >= resources.foodCap
      )
        return;
      setResources(r => ({
        ...r,
        gold: r.gold - TRAIN_FARMER_COST,
        food: r.food + 1,
      }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [
            ...ws,
            {
              ...makeUnit(newId, BARN_POS.x, BARN_POS.y, 'farmer'),
              movingTo: path[0] ?? rp,
              path: path.slice(1),
              state: 'moving' as const,
            },
          ];
        }
        return [...ws, makeUnit(newId, BARN_POS.x, BARN_POS.y, 'farmer')];
      });
    } else if (action === 'recruitHero') {
      if (
        heroRecruited ||
        resources.gold < TRAIN_HERO_COST ||
        resources.food >= resources.foodCap
      )
        return;
      setHeroRecruited(true);
      setResources(r => ({
        ...r,
        gold: r.gold - TRAIN_HERO_COST,
        food: r.food + 1,
      }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const hero = makeUnit(newId, BARN_POS.x, BARN_POS.y, 'hero');
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [
            ...ws,
            {
              ...hero,
              movingTo: path[0] ?? rp,
              path: path.slice(1),
              state: 'moving',
            },
          ];
        }
        return [...ws, hero];
      });
    } else if (action === 'trainSwordsman') {
      if (
        resources.gold < TRAIN_SWORDSMAN_COST ||
        resources.food >= resources.foodCap ||
        trainingQueue.length >= TRAIN_QUEUE_MAX
      )
        return;
      setResources(r => ({
        ...r,
        gold: r.gold - TRAIN_SWORDSMAN_COST,
        food: r.food + 1,
      }));
      ctx.setTrainingQueue(q => [...q, { type: 'swordsman' }]);
    } else if (action === 'trainCavalry') {
      if (
        resources.gold < TRAIN_CAVALRY_COST ||
        resources.food >= resources.foodCap ||
        trainingQueue.length >= TRAIN_QUEUE_MAX
      )
        return;
      setResources(r => ({
        ...r,
        gold: r.gold - TRAIN_CAVALRY_COST,
        food: r.food + 1,
      }));
      ctx.setTrainingQueue(q => [...q, { type: 'cavalry' }]);
    } else if (action === 'trainCatapult') {
      if (
        resources.gold < TRAIN_CATAPULT_COST.gold ||
        resources.lumber < TRAIN_CATAPULT_COST.lumber ||
        resources.food >= resources.foodCap
      )
        return;
      setResources(r => ({
        ...r,
        gold: r.gold - TRAIN_CATAPULT_COST.gold,
        lumber: r.lumber - TRAIN_CATAPULT_COST.lumber,
        food: r.food + 1,
      }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [
            ...ws,
            {
              ...makeUnit(newId, BARN_POS.x, BARN_POS.y, 'catapult'),
              movingTo: path[0] ?? rp,
              path: path.slice(1),
              state: 'moving' as const,
            },
          ];
        }
        return [...ws, makeUnit(newId, BARN_POS.x, BARN_POS.y, 'catapult')];
      });
    } else if (action === 'trainTrebuchet') {
      if (
        resources.gold < TRAIN_TREBUCHET_COST.gold ||
        resources.lumber < TRAIN_TREBUCHET_COST.lumber ||
        resources.stone < TRAIN_TREBUCHET_COST.stone ||
        resources.food >= resources.foodCap
      )
        return;
      setResources(r => ({
        ...r,
        gold: r.gold - TRAIN_TREBUCHET_COST.gold,
        lumber: r.lumber - TRAIN_TREBUCHET_COST.lumber,
        stone: r.stone - TRAIN_TREBUCHET_COST.stone,
        food: r.food + 1,
      }));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const rp = rallyPoint;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [
            ...ws,
            {
              ...makeUnit(newId, BARN_POS.x, BARN_POS.y, 'trebuchet'),
              movingTo: path[0] ?? rp,
              path: path.slice(1),
              state: 'moving' as const,
            },
          ];
        }
        return [...ws, makeUnit(newId, BARN_POS.x, BARN_POS.y, 'trebuchet')];
      });
    } else if (action === 'trade:lumberToGold') {
      if (resources.lumber < 50) return;
      setResources(r => ({ ...r, lumber: r.lumber - 50, gold: r.gold + 30 }));
      addFloatingText(BARN_POS.x, BARN_POS.y, '+30🪙', '#fbbf24');
    } else if (action === 'trade:stoneToGold') {
      if (resources.stone < 30) return;
      setResources(r => ({ ...r, stone: r.stone - 30, gold: r.gold + 20 }));
      addFloatingText(BARN_POS.x, BARN_POS.y, '+20🪙', '#fbbf24');
    } else if (action === 'trade:stoneToLumber') {
      if (resources.stone < 40) return;
      setResources(r => ({
        ...r,
        stone: r.stone - 40,
        lumber: r.lumber + 25,
      }));
      addFloatingText(BARN_POS.x, BARN_POS.y, '+25🌲', '#4ade80');
    } else if (action === 'blacksmith:steelEdge') {
      const level = blacksmithUpgrades.steelEdge;
      const cost = BLACKSMITH_STEEL_EDGE_COSTS[level];
      if (!cost) return;
      if (resources.gold < cost.gold || resources.stone < cost.stone) return;
      setResources(r => ({
        ...r,
        gold: r.gold - cost.gold,
        stone: r.stone - cost.stone,
      }));
      setBlacksmithUpgrades(u => ({ ...u, steelEdge: u.steelEdge + 1 }));
      addFloatingText(
        BARN_POS.x,
        BARN_POS.y,
        `⚔️ Steel Edge ${level + 1}!`,
        '#f59e0b'
      );
    } else if (action === 'blacksmith:ironHide') {
      const level = blacksmithUpgrades.ironHide;
      const cost = BLACKSMITH_IRON_HIDE_COSTS[level];
      if (!cost) return;
      if (resources.gold < cost.gold || resources.lumber < cost.lumber) return;
      setResources(r => ({
        ...r,
        gold: r.gold - cost.gold,
        lumber: r.lumber - cost.lumber,
      }));
      setBlacksmithUpgrades(u => ({ ...u, ironHide: u.ironHide + 1 }));
      addFloatingText(
        BARN_POS.x,
        BARN_POS.y,
        `🛡️ Iron Hide ${level + 1}!`,
        '#38bdf8'
      );
    } else if (action === 'guardTower') {
      if (
        guardTowerResearched ||
        resources.gold < GUARD_TOWER_COST.gold ||
        resources.stone < GUARD_TOWER_COST.stone
      )
        return;
      setResources(r => ({
        ...r,
        gold: r.gold - GUARD_TOWER_COST.gold,
        stone: r.stone - GUARD_TOWER_COST.stone,
      }));
      setGuardTowerResearched(true);
      addFloatingText(BARN_POS.x, BARN_POS.y, '🏰 Guard Tower!', '#22d3ee');
    } else if (action === 'barracks:veteranTraining') {
      if (
        barracksTech.veteranTraining ||
        resources.gold < VETERAN_TRAINING_COST.gold ||
        resources.lumber < VETERAN_TRAINING_COST.lumber
      )
        return;
      setResources(r => ({
        ...r,
        gold: r.gold - VETERAN_TRAINING_COST.gold,
        lumber: r.lumber - VETERAN_TRAINING_COST.lumber,
      }));
      setBarracksTech(t => ({ ...t, veteranTraining: true }));
      // Apply +20 maxHp to all existing combat units
      setWorkers(ws =>
        ws.map(w =>
          w.unitType === 'swordsman' ||
          w.unitType === 'cavalry' ||
          w.unitType === 'hero'
            ? { ...w, maxHp: w.maxHp + 20, hp: w.hp + 20 }
            : w
        )
      );
      addFloatingText(
        BARN_POS.x,
        BARN_POS.y,
        '🛡️ Veteran Training!',
        '#f87171'
      );
    } else if (action === 'barracks:warDrums') {
      if (
        barracksTech.warDrums ||
        resources.gold < WAR_DRUMS_COST.gold ||
        resources.lumber < WAR_DRUMS_COST.lumber
      )
        return;
      setResources(r => ({
        ...r,
        gold: r.gold - WAR_DRUMS_COST.gold,
        lumber: r.lumber - WAR_DRUMS_COST.lumber,
      }));
      setBarracksTech(t => ({ ...t, warDrums: true }));
      addFloatingText(BARN_POS.x, BARN_POS.y, '🥁 War Drums!', '#fb923c');
    } else if (action.startsWith('upgradeWall:')) {
      const bid = parseInt(action.split(':')[1] ?? '0');
      const wall = placedBuildings.find(
        b => b.id === bid && b.type === 'wall' && !b.upgraded
      );
      if (!wall || resources.gold < 50 || resources.stone < 20) return;
      setResources(r => ({ ...r, gold: r.gold - 50, stone: r.stone - 20 }));
      setPlacedBuildings(bs =>
        bs.map(b =>
          b.id === bid
            ? {
                ...b,
                upgraded: true,
                maxHp: 350,
                hp: Math.min(b.hp + 230, 350),
              }
            : b
        )
      );
      addFloatingText(wall.x, wall.y, '🪨 Stone Wall!', '#94a3b8');
    } else if (action.startsWith('build:')) {
      const btype = action.split(':')[1] as BuildingType;
      if (BUILDING_COSTS[btype]) {
        const req = BUILDING_REQUIRES[btype];
        const prereqMet =
          !req ||
          (req === 'farmhouse'
            ? farmhouse.built
            : placedBuildings.some(b => b.type === req && !b.constructing));
        if (prereqMet) setBuildMode(btype);
      }
    }
  };

  const handleWorkerCommand = (cmd: 'stop' | 'gather' | 'attack') => {
    if (cmd === 'stop') {
      Object.values(gatherTimeoutsRef.current).forEach(clearTimeout);
      Object.values(attackTimeoutsRef.current).forEach(clearTimeout);
      gatherTimeoutsRef.current = {};
      attackTimeoutsRef.current = {};
      setPatrolMode(false);
      setWorkers(ws =>
        ws.map(w =>
          w.selected
            ? {
                ...w,
                movingTo: null,
                path: [],
                gathering: null,
                attacking: null,
                repairing: null,
                attackMove: false,
                attackMoveTarget: null,
                patrol: null,
                holdPosition: false,
                waypoints: [],
                state: 'idle',
              }
            : w
        )
      );
    }
  };

  const handleResearch = (type: keyof Upgrades) => {
    const currentLevel = upgrades[type];
    if (currentLevel >= UPGRADE_MAX) return;
    const cost = UPGRADE_COSTS[type][currentLevel];
    if (!cost) return;
    if (
      resources.gold < cost.gold ||
      resources.lumber < cost.lumber ||
      resources.stone < cost.stone
    )
      return;
    setResources(r => ({
      ...r,
      gold: r.gold - cost.gold,
      lumber: r.lumber - cost.lumber,
      stone: r.stone - cost.stone,
    }));
    setUpgrades(u => ({ ...u, [type]: u[type] + 1 }));
    if (type === 'ironWill') {
      const hpBonus = 25;
      setWorkers(ws =>
        ws.map(w => ({
          ...w,
          maxHp: w.maxHp + hpBonus,
          hp: Math.min(w.hp + hpBonus, w.maxHp + hpBonus),
        }))
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Building interactions
  // ---------------------------------------------------------------------------

  const handleAssistConstruction = useCallback(
    (buildingId: number, bx: number, by: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (anySelected) {
        // Send selected farmers to assist
        const target = { x: bx, y: by };
        setWorkers(ws =>
          ws.map(w => {
            if (!w.selected || w.unitType !== 'farmer') return w;
            const start = { x: Math.round(w.x), y: Math.round(w.y) };
            const path = aStar(INITIAL_TILES, start, target);
            return {
              ...w,
              movingTo: path[0] ?? target,
              path: path.slice(1),
              gathering: null,
              attacking: null,
              repairing: null,
              assistBuildId: buildingId,
              patrol: null,
              state: 'moving' as const,
            };
          })
        );
        addFloatingText(bx, by, '🔨 Assist!', '#fbbf24');
      } else {
        // Cancel construction — 50% resource refund
        setPlacedBuildings(bs => {
          const b = bs.find(x => x.id === buildingId);
          if (!b) return bs;
          const cost = BUILDING_COSTS[b.type];
          if (cost) {
            setResources(r => ({
              ...r,
              gold: r.gold + Math.floor(cost.gold * 0.5),
              lumber: r.lumber + Math.floor(cost.lumber * 0.5),
              stone: r.stone + Math.floor(cost.stone * 0.5),
            }));
          }
          setWorkers(ws =>
            ws.map(w =>
              w.assistBuildId === buildingId
                ? { ...w, assistBuildId: undefined, state: 'idle' as const }
                : w
            )
          );
          addFloatingText(bx, by, '❌ Cancelled', '#f87171');
          return bs.filter(x => x.id !== buildingId);
        });
      }
    },
    [anySelected, addFloatingText]
  );

  const handleRepairBuilding = useCallback(
    (buildingId: number, bx: number, by: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const target = { x: bx, y: by };
      setWorkers(ws =>
        ws.map(w => {
          if (
            !w.selected ||
            w.unitType === 'catapult' ||
            w.unitType === 'trebuchet'
          )
            return w;
          const start = { x: Math.round(w.x), y: Math.round(w.y) };
          const path = aStar(INITIAL_TILES, start, target);
          return {
            ...w,
            movingTo: path[0] ?? target,
            path: path.slice(1),
            gathering: null,
            attacking: null,
            repairing: { buildingId },
            patrol: null,
            state: 'moving' as const,
          };
        })
      );
    },
    [anySelected]
  );

  // ---------------------------------------------------------------------------
  // Attack commands
  // ---------------------------------------------------------------------------

  const handleAttackEnemyBarn = (e: React.MouseEvent) => {
    e.preventDefault();
    if (enemyBarnHp <= 0 || !anySelected) return;
    const adjTile = { x: ENEMY_BARN_POS.x - 1, y: ENEMY_BARN_POS.y };
    commandMove(adjTile.x, adjTile.y, null, { targetType: 'enemyBarn' });
  };

  const handleAttackEnemyTower = (
    towerId: number,
    tx: number,
    ty: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    if (!anySelected) return;
    const adj = { x: Math.max(0, tx - 1), y: ty };
    commandMove(adj.x, adj.y, null, { targetType: 'enemyTower', towerId });
  };

  const handleAttackEnemyWall = (
    wallId: number,
    tx: number,
    ty: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    if (!anySelected) return;
    setWorkers(ws =>
      ws.map(w => {
        if (!w.selected) return w;
        const path = aStar(
          INITIAL_TILES,
          { x: Math.round(w.x), y: Math.round(w.y) },
          { x: tx, y: ty }
        );
        return {
          ...w,
          movingTo: path[0] ?? { x: tx, y: ty },
          path: path.slice(1),
          gathering: null,
          attacking: { targetType: 'enemyWall' as const, wallId },
          state: 'moving' as const,
        };
      })
    );
  };

  const handleAttackGrunt = useCallback(
    (gruntId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const grunt = enemyGruntsRef.current.find(g => g.id === gruntId);
      if (!grunt) return;
      const tx = Math.round(grunt.x),
        ty = Math.round(grunt.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'grunt' as const, gruntId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackSiege = useCallback(
    (siegeId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const ram = enemySiegeRef.current.find(r => r.id === siegeId);
      if (!ram) return;
      const tx = Math.round(ram.x),
        ty = Math.round(ram.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'siege' as const, siegeId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackShaman = useCallback(
    (shamanId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const shaman = enemyShamansRef.current.find(s => s.id === shamanId);
      if (!shaman) return;
      const tx = Math.round(shaman.x),
        ty = Math.round(shaman.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'shaman' as const, shamanId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackNecromancer = useCallback(
    (necroId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const necro = enemyNecromancersRef.current.find(n => n.id === necroId);
      if (!necro) return;
      const tx = Math.round(necro.x),
        ty = Math.round(necro.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: {
              targetType: 'necromancer' as const,
              necromancerId: necroId,
            },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackWitchDoctor = useCallback(
    (wdId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const wd = enemyWitchDoctorsRef.current.find(d => d.id === wdId);
      if (!wd) return;
      const tx = Math.round(wd.x),
        ty = Math.round(wd.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: {
              targetType: 'witchDoctor' as const,
              witchDoctorId: wdId,
            },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackWarchief = useCallback(
    (warchiefId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const wc = enemyWarchiefsRef.current.find(w2 => w2.id === warchiefId);
      if (!wc) return;
      const tx = Math.round(wc.x),
        ty = Math.round(wc.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'warchief' as const, warchiefId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackWarlord = useCallback(
    (warlordId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const wl = enemyWarlordsRef.current.find(w2 => w2.id === warlordId);
      if (!wl) return;
      const tx = Math.round(wl.x),
        ty = Math.round(wl.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'warlord' as const, warlordId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackLurker = useCallback(
    (lurkerId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const lk = enemyLurkersRef.current.find(l => l.id === lurkerId);
      if (!lk) return;
      const tx = Math.round(lk.x),
        ty = Math.round(lk.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'lurker' as const, lurkerId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackTroll = useCallback(
    (trollId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const troll = enemyTrollsRef.current.find(t => t.id === trollId);
      if (!troll) return;
      const tx = Math.round(troll.x),
        ty = Math.round(troll.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'troll' as const, trollId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackSapper = useCallback(
    (sapperId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const sapper = enemySappersRef.current.find(s => s.id === sapperId);
      if (!sapper) return;
      const tx = Math.round(sapper.x),
        ty = Math.round(sapper.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'sapper' as const, sapperId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  const handleAttackCreep = useCallback(
    (creepId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!anySelected) return;
      const creep = neutralCreepsRef.current.find(c => c.id === creepId);
      if (!creep) return;
      const tx = Math.round(creep.x),
        ty = Math.round(creep.y);
      setWorkers(ws =>
        ws.map(w => {
          if (!w.selected) return w;
          const path = aStar(
            INITIAL_TILES,
            { x: Math.round(w.x), y: Math.round(w.y) },
            { x: tx, y: ty }
          );
          const first = path[0] ?? { x: tx, y: ty };
          // Reuse grunt attack state but target creep — we handle damage via attackTimeoutsRef with a creep target type
          return {
            ...w,
            movingTo: first,
            path: path.slice(1),
            gathering: null,
            attacking: { targetType: 'creep' as const, creepId },
            state: 'moving',
          };
        })
      );
    },
    [anySelected]
  );

  // ---------------------------------------------------------------------------
  // Return all handlers
  // ---------------------------------------------------------------------------

  return {
    // helpers (also used in JSX)
    clientToSvg,
    commandMove,
    commandQueueMove,
    isTileOccupied,
    // SVG mouse
    handleSvgMouseDown,
    handleSvgMouseMove,
    handleSvgMouseUp,
    // tower garrison
    handleTowerGarrison,
    handleTowerDeploy,
    // barn garrison
    handleGarrison,
    handleUngarrison,
    // hero abilities
    handleHeroAbility,
    handleBattleShout,
    handleHarvestBoon,
    // shop
    handleBuyItem,
    handleDropItem,
    handleUsePotion,
    // earthquake
    handleEarthquake,
    // unit specials
    handleSwordsmanCharge,
    handleCavalrySprint,
    // farmhouse / buildings / training
    handleFarmhouseAction,
    handleWorkerCommand,
    handleResearch,
    handleAssistConstruction,
    handleRepairBuilding,
    // attack commands
    handleAttackEnemyBarn,
    handleAttackEnemyTower,
    handleAttackEnemyWall,
    handleAttackGrunt,
    handleAttackSiege,
    handleAttackShaman,
    handleAttackNecromancer,
    handleAttackWitchDoctor,
    handleAttackWarchief,
    handleAttackWarlord,
    handleAttackLurker,
    handleAttackTroll,
    handleAttackSapper,
    handleAttackCreep,
  };
}
