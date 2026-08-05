import React from "react";

import type {
  Upgrades,
  WorkerState,
  FarmhouseAction,
  HeroItem,
  HeroItemId,
} from "./game/types";
import {
  GRID_SIZE,
  BARN_POS,
  ENEMY_BARN_POS,
  XP_TO_LEVEL_1,
  XP_TO_LEVEL_2,
  XP_TO_LEVEL_3,
  UPGRADE_COSTS,
  UPGRADE_MAX,
  HERO_ITEM_DATA,
} from "./game/constants";
import { BuildMenu } from "./ui/BuildMenu";
import { HeroPanel } from "./ui/HeroPanel";

// Re-export types from canonical locations for backward compatibility
export type { Upgrades, WorkerState };
export type { FarmhouseAction };
export { UPGRADE_COSTS, UPGRADE_MAX };

export type BuildingType =
  | "farmhouse"
  | "lumberShed"
  | "watchtower"
  | "wall"
  | "windmill"
  | "barracks"
  | "siegeWorkshop"
  | "market"
  | "blacksmith"
  | "granary"
  | "stable"
  | "spikeTrap"
  | "frostTower"
  | "ballista"
  | "poisonTower"
  | "supplyStore"
  | "miningCamp";

export interface PlacedBuilding {
  id: number;
  type: BuildingType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  upgraded?: boolean;
  constructing?: boolean;
  constructedAt?: number;
}

export interface BuildingCost {
  gold: number;
  lumber: number;
  stone: number;
  label: string;
  foodCapBonus: number;
}

interface RTSUIProps {
  selectedType: "worker" | "farmhouse" | "building" | null;
  selectedBuilding: PlacedBuilding | null;
  onTowerGarrison: (towerId: number, tx: number, ty: number) => void;
  selectedWorkers: WorkerState[];
  hasBarracks: boolean;
  garrisonedCount: number;
  garrisonCap: number;
  onGarrison: () => void;
  onUngarrison: () => void;
  heroRecruited: boolean;
  heroReviveCountdown: number;
  heroReviveCost: number;
  onInstantRevive: () => void;
  heroAbilityCooldown: number;
  onHeroAbility: () => void;
  heroShoutCooldown: number;
  battleShoutActive: boolean;
  onBattleShout: () => void;
  harvestBoonCooldown: number;
  harvestBoonActive: boolean;
  onHarvestBoon: () => void;
  onRecruitHero: () => void;
  hasSiegeWorkshop: boolean;
  hasMarket: boolean;
  hasBlacksmith: boolean;
  blacksmithUpgrades: { steelEdge: number; ironHide: number };
  onBlacksmithUpgrade: (type: "steelEdge" | "ironHide") => void;
  hasStable: boolean;
  hasWatchtower: boolean;
  guardTowerResearched: boolean;
  onGuardTower: () => void;
  trainingQueue: { type: "swordsman" | "cavalry" }[];
  trainingProgress: number;
  towerGarrison: Record<number, WorkerState[]>;
  onTowerDeploy: (towerId: number, tx: number, ty: number) => void;
  placedBuildingsList: PlacedBuilding[];
  onSwordsmanCharge: () => void;
  onCavalrySprint: () => void;
  onMinimapClick: (tileX: number, tileY: number) => void;
  farmhouse: { built: boolean; level: number };
  farmhouseUpgradeCosts: { gold: number; lumber: number }[];
  farmhouseStorage: { gold: number; lumber: number }[];
  resources: {
    gold: number;
    lumber: number;
    stone: number;
    food: number;
    foodCap: number;
  };
  placedBuildings: PlacedBuilding[];
  buildingCosts: Record<BuildingType, BuildingCost>;
  onFarmhouseAction: (action: FarmhouseAction) => void;
  onWorkerCommand: (cmd: "stop" | "gather" | "attack") => void;
  patrolMode: boolean;
  onPatrolCommand: () => void;
  onHoldPosition: () => void;
  buildMode: BuildingType | null;
  upgrades: Upgrades;
  onResearch: (type: keyof Upgrades) => void;
  stance: "aggressive" | "passive";
  onToggleStance: () => void;
  underAttack: boolean;
  incomeRate: { gold: number; lumber: number; stone: number };
  barracksTech: { veteranTraining: boolean; warDrums: boolean };
  onBarracksTech: (type: "veteranTraining" | "warDrums") => void;
  earthquakeCooldown: number;
  onEarthquake: () => void;
  heroItems: HeroItem[];
  onDropItem: (slotId: number) => void;
  onUsePotion: () => void;
  shopItems: { itemId: HeroItemId; cost: number }[];
  onBuyItem: (itemId: HeroItemId, cost: number) => void;
  formationMode: "cluster" | "line" | "wedge" | "box";
  onCycleFormation: () => void;
  enemyBarnHp: number;
  enemyBarnMaxHp: number;
  playerBarnHp: number;
  playerBarnMaxHp: number;
  minimapData: {
    workers: { x: number; y: number; selected: boolean }[];
    grunts: { x: number; y: number }[];
    enemyBarnAlive: boolean;
    buildings: { x: number; y: number; type: BuildingType }[];
    creepCamps: { x: number; y: number; cleared: boolean }[];
    goldNodes: { x: number; y: number }[];
    stoneNodes: { x: number; y: number }[];
    treeNodes: { x: number; y: number }[];
    enemyTowers: { x: number; y: number }[];
    warRams: { x: number; y: number }[];
    shamans: { x: number; y: number }[];
    trolls: { x: number; y: number }[];
    sappers: { x: number; y: number }[];
    witchDoctors: { x: number; y: number }[];
    warchiefs: { x: number; y: number }[];
    fogExplored: boolean[][];
    attackPings: { x: number; y: number; t: number }[];
    enemyWalls: { x: number; y: number }[];
    lootCrates: { x: number; y: number }[];
    droppedItems: { x: number; y: number }[];
    warlords: { x: number; y: number }[];
    lurkers: { x: number; y: number }[];
  };
}

export const RTSUI: React.FC<RTSUIProps> = ({
  selectedType,
  selectedWorkers,
  farmhouse,
  farmhouseUpgradeCosts,
  farmhouseStorage,
  resources,
  buildingCosts,
  onFarmhouseAction,
  onWorkerCommand,
  patrolMode,
  onPatrolCommand,
  onHoldPosition,
  buildMode,
  upgrades,
  onResearch,
  minimapData,
  enemyBarnHp,
  enemyBarnMaxHp,
  playerBarnHp,
  playerBarnMaxHp,
  hasBarracks,
  garrisonedCount,
  garrisonCap,
  onGarrison,
  onUngarrison,
  heroRecruited,
  heroReviveCountdown,
  heroReviveCost,
  onInstantRevive,
  heroAbilityCooldown,
  onHeroAbility,
  heroShoutCooldown,
  battleShoutActive,
  onBattleShout,
  harvestBoonCooldown,
  harvestBoonActive,
  onHarvestBoon,
  onRecruitHero,
  hasSiegeWorkshop,
  hasMarket,
  hasBlacksmith,
  blacksmithUpgrades,
  onBlacksmithUpgrade,
  hasStable,
  hasWatchtower,
  guardTowerResearched,
  onGuardTower,
  trainingQueue,
  trainingProgress,
  towerGarrison,
  onTowerGarrison,
  onTowerDeploy,
  selectedBuilding,
  placedBuildingsList,
  placedBuildings,
  onSwordsmanCharge,
  onCavalrySprint,
  onMinimapClick,
  stance,
  onToggleStance,
  underAttack: _underAttack,
  incomeRate: _incomeRate,
  barracksTech,
  onBarracksTech,
  earthquakeCooldown,
  onEarthquake,
  heroItems,
  onDropItem,
  onUsePotion,
  shopItems,
  onBuyItem,
  formationMode,
  onCycleFormation,
}) => {
  const isHeroSelected = selectedWorkers.some((w) => w.unitType === "hero");
  const heroLevel =
    selectedWorkers.find((w) => w.unitType === "hero")?.level ?? 0;
  const selectedCount = selectedWorkers.length;
  const firstWorker = selectedWorkers[0] ?? null;
  const anyFarmers = selectedWorkers.some((w) => w.unitType === "farmer");
  const allSwordsmen =
    selectedWorkers.length > 0 &&
    selectedWorkers.every((w) => w.unitType === "swordsman");
  const allSameType =
    selectedWorkers.length > 0 &&
    selectedWorkers.every((w) => w.unitType === firstWorker?.unitType);

  const stateLabel = (w: WorkerState) => {
    if (w.patrol) return "🔄 Patrolling";
    if (w.state === "idle") return "Idle";
    if (w.state === "moving") return "Moving";
    if (w.state === "gathering") return "Gathering";
    if (w.state === "returning") return "Returning";
    if (w.state === "attacking") return "⚔️ Attacking";
    if (w.state === "repairing") return "🔧 Repairing";
    return w.state;
  };

  const hpPct = (hp: number, max: number) => Math.max(0, hp / max);
  const hpColor = (pct: number) =>
    pct > 0.5 ? "#4ade80" : pct > 0.25 ? "#fbbf24" : "#ef4444";

  return (
    <div
      className="absolute bottom-0 left-0 z-30 w-full border-t-4 border-amber-600 bg-slate-950/95 px-2 py-2 md:px-4 md:py-3"
      style={{ maxHeight: "40vh", overflowY: "auto" }}
    >
      <div className="grid h-full grid-cols-1 items-stretch gap-2 md:grid-cols-[200px_1fr_200px] md:gap-3 landscape:grid-cols-[140px_1fr_140px]">
        {/* Unit / building info */}
        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-3 text-amber-100">
          <div className="text-xs tracking-wide text-amber-300/90 uppercase">
            {selectedType === "farmhouse"
              ? "Building"
              : selectedType === "building"
                ? "Structure"
                : "Selection"}
          </div>
          {selectedType === "worker" && firstWorker ? (
            <>
              <div className="mt-1 text-sm font-semibold">
                {firstWorker.unitType === "hero"
                  ? "🦸 Barnabas"
                  : firstWorker.unitType === "catapult"
                    ? "🪨 Catapult"
                    : firstWorker.unitType === "trebuchet"
                      ? "🏰 Trebuchet"
                      : !allSameType
                        ? "⚔️/🌾 Mixed"
                        : firstWorker.unitType === "cavalry"
                          ? "🐴 Cavalry"
                          : allSwordsmen
                            ? "⚔️ Swordsman"
                            : "Farmer"}
                {selectedCount > 1 && firstWorker.unitType !== "hero"
                  ? ` ×${selectedCount}`
                  : ""}
                {firstWorker.group !== null && selectedCount === 1 && (
                  <span className="ml-2 rounded bg-amber-900/60 px-1.5 text-xs text-amber-300">
                    G{firstWorker.group}
                  </span>
                )}
              </div>
              {selectedCount === 1 && (
                <>
                  {/* HP bar */}
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded bg-slate-700">
                      <div
                        className="h-2 rounded transition-all"
                        style={{
                          width: `${hpPct(firstWorker.hp, firstWorker.maxHp) * 100}%`,
                          background: hpColor(
                            hpPct(firstWorker.hp, firstWorker.maxHp),
                          ),
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-300">
                      {firstWorker.hp}/{firstWorker.maxHp}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-300">
                    {stateLabel(firstWorker)}
                    {!firstWorker.patrol && firstWorker.gathering
                      ? ` (${firstWorker.gathering.type})`
                      : ""}
                    {!firstWorker.patrol && firstWorker.attacking
                      ? ` → ${firstWorker.attacking.targetType === "enemyBarn" ? "enemy barn" : firstWorker.attacking.targetType === "grunt" ? "grunt" : firstWorker.attacking.targetType === "shaman" ? "shaman" : firstWorker.attacking.targetType === "troll" ? "troll archer" : firstWorker.attacking.targetType === "sapper" ? "sapper" : firstWorker.attacking.targetType === "siege" ? "siege engine" : firstWorker.attacking.targetType === "enemyTower" ? "enemy tower" : "target"}`
                      : ""}
                  </div>
                  <div className="mt-0.5 text-xs text-amber-200">
                    {firstWorker.carrying.gold > 0 &&
                      `🪙${firstWorker.carrying.gold} `}
                    {firstWorker.carrying.lumber > 0 &&
                      `🌲${firstWorker.carrying.lumber} `}
                    {firstWorker.carrying.stone > 0 &&
                      `🪨${firstWorker.carrying.stone}`}
                    {!firstWorker.carrying.gold &&
                      !firstWorker.carrying.lumber &&
                      !firstWorker.carrying.stone &&
                      "Empty"}
                  </div>
                  {(() => {
                    const lvl = firstWorker.level;
                    const xp = firstWorker.xp;
                    const brackets: [number, number][] = [
                      [0, XP_TO_LEVEL_1],
                      [XP_TO_LEVEL_1, XP_TO_LEVEL_2],
                      [XP_TO_LEVEL_2, XP_TO_LEVEL_3],
                    ];
                    const [lo, hi] =
                      lvl >= 3
                        ? [XP_TO_LEVEL_3, XP_TO_LEVEL_3]
                        : (brackets[lvl] ?? [0, XP_TO_LEVEL_1]);
                    const pct =
                      lvl >= 3
                        ? 100
                        : hi === lo
                          ? 100
                          : Math.min(100, ((xp - lo) / (hi - lo)) * 100);
                    const stars =
                      "⭐".repeat(lvl) + "☆".repeat(Math.max(0, 3 - lvl));
                    return (
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-xs text-yellow-300">{stars}</span>
                        <div className="h-1.5 flex-1 rounded bg-slate-700">
                          <div
                            className="h-1.5 rounded bg-yellow-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-yellow-400/70">
                          {lvl >= 3 ? "MAX" : `${xp - lo}/${hi - lo}xp`}
                        </span>
                      </div>
                    );
                  })()}
                </>
              )}
              {selectedCount > 1 && (
                <div className="mt-0.5 text-xs text-slate-300">
                  {selectedWorkers.filter((w) => w.state === "idle").length}{" "}
                  idle ·{" "}
                  {selectedWorkers.filter((w) => w.state !== "idle").length}{" "}
                  working
                </div>
              )}
            </>
          ) : selectedType === "farmhouse" ? (
            <>
              <div className="mt-1 text-sm font-semibold">
                Barn {farmhouse.built ? `(Lv ${farmhouse.level})` : ""}
              </div>
              {/* Player barn HP */}
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 flex-1 rounded bg-slate-700">
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${hpPct(playerBarnHp, playerBarnMaxHp) * 100}%`,
                      background: hpColor(hpPct(playerBarnHp, playerBarnMaxHp)),
                    }}
                  />
                </div>
                <span className="text-xs text-slate-300">
                  {playerBarnHp}/{playerBarnMaxHp}
                </span>
              </div>
              {farmhouse.built && (
                <div className="mt-0.5 text-xs text-slate-400">
                  Storage: {farmhouseStorage[farmhouse.level - 1]?.gold ?? "?"}
                  🪙 Pop: {resources.food}/{resources.foodCap}
                </div>
              )}
              <div className="mt-0.5 text-xs text-yellow-400/80">
                🏰 Defense: 6 dmg / 3s (4-tile range)
              </div>
              {garrisonedCount > 0 && (
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-sky-300">
                    🏰 {garrisonedCount} garrisoned · healing
                  </span>
                  <button
                    type="button"
                    className="rounded border border-sky-500/60 bg-sky-900/30 px-1.5 py-0.5 text-xs text-sky-200 hover:bg-sky-500/30"
                    onClick={onUngarrison}
                  >
                    🚪 Deploy
                  </button>
                </div>
              )}
            </>
          ) : selectedType === "building" && selectedBuilding ? (
            (() => {
              const b = selectedBuilding;
              const BUILDING_LABELS: Record<string, string> = {
                farmhouse: "Farmhouse",
                lumberShed: "Lumber Shed",
                watchtower: "Watchtower",
                windmill: "Windmill",
                barracks: "Barracks",
                siegeWorkshop: "Siege Workshop",
                market: "Market",
                blacksmith: "Blacksmith",
                granary: "Granary",
                stable: "Stable",
                spikeTrap: "Spike Trap",
                frostTower: "Frost Tower",
                ballista: "Ballista",
                poisonTower: "Poison Tower",
                wall: "Wall",
                supplyStore: "Farm Supply Store",
                miningCamp: "Mining Camp",
              };
              const BUILDING_EMOJI_MAP: Record<string, string> = {
                farmhouse: "🏠",
                lumberShed: "🪵",
                watchtower: "🗼",
                windmill: "💨",
                barracks: "🏯",
                siegeWorkshop: "⚙️",
                market: "🏪",
                blacksmith: "🔨",
                granary: "🌾",
                stable: "🐴",
                spikeTrap: "🪤",
                frostTower: "❄️",
                ballista: "🏹",
                poisonTower: "☠️",
                wall: "🧱",
                supplyStore: "🛒",
                miningCamp: "⛏️",
              };
              const BUILDING_DESCS: Record<string, string> = {
                watchtower: "Ranged attack · garrison 3 units",
                barracks: "Trains swordsmen · upgrade to guard",
                frostTower: "Slows enemies · 5-tile range",
                ballista: "High dmg · long range · single target",
                poisonTower: "Poisons AoE · 3-tile range",
                siegeWorkshop: "Builds catapults & trebuchets",
                market: "Passive gold income +2/5s",
                blacksmith: "Upgrade unit attack & armor",
                stable: "Trains cavalry units",
                granary: "+15 food cap",
                lumberShed: "Lumber drop-off · gather bonus",
                windmill: "+2🪙 every 5s",
                spikeTrap: "Damage grunts that step on it",
                farmhouse: "+5 food cap per level",
                supplyStore: "Hero item shop · buy with gold",
                miningCamp: "Gold/stone drop-off site",
              };
              const hpP = b.hp / b.maxHp;
              const isTower =
                b.type === "watchtower" ||
                b.type === "frostTower" ||
                b.type === "ballista" ||
                b.type === "poisonTower";
              const tgUnits = isTower ? (towerGarrison[b.id] ?? []) : [];
              return (
                <>
                  <div className="mt-1 text-sm font-semibold">
                    {BUILDING_EMOJI_MAP[b.type]}{" "}
                    {BUILDING_LABELS[b.type] ?? b.type}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded bg-slate-700">
                      <div
                        className="h-2 rounded transition-all"
                        style={{
                          width: `${hpP * 100}%`,
                          background:
                            hpP > 0.5
                              ? "#4ade80"
                              : hpP > 0.25
                                ? "#fbbf24"
                                : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-300">
                      {b.hp}/{b.maxHp}
                    </span>
                  </div>
                  {BUILDING_DESCS[b.type] && (
                    <div className="mt-0.5 text-xs text-slate-400">
                      {BUILDING_DESCS[b.type]}
                    </div>
                  )}
                  {isTower && (
                    <div className="mt-0.5 text-xs text-sky-300">
                      👥 Garrison: {tgUnits.length}/3
                    </div>
                  )}
                </>
              );
            })()
          ) : buildMode ? (
            <>
              <div className="mt-1 text-sm font-semibold text-amber-300">
                Build Mode
              </div>
              <div className="mt-0.5 text-xs text-slate-300">
                {buildingCosts[buildMode].label}
              </div>
              <div className="mt-0.5 text-xs text-amber-200">
                {buildingCosts[buildMode].gold}🪙
                {buildingCosts[buildMode].lumber > 0
                  ? ` ${buildingCosts[buildMode].lumber}🌲`
                  : ""}
                {buildingCosts[buildMode].stone > 0
                  ? ` ${buildingCosts[buildMode].stone}🪨`
                  : ""}
              </div>
            </>
          ) : (
            <div className="mt-2 text-xs text-slate-400">Nothing selected</div>
          )}
        </div>

        {/* Command card */}
        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-2 md:p-3">
          <div className="mb-1 text-xs tracking-wide text-amber-300/90 uppercase md:mb-2">
            Commands
          </div>

          {selectedType === "worker" && selectedCount > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                className="rounded border border-amber-500/70 bg-amber-500/15 py-2.5 text-xs text-amber-100 hover:bg-amber-500/30"
                title="Right-click tile to move"
              >
                Move
              </button>
              {anyFarmers ? (
                <button
                  type="button"
                  className="rounded border border-green-500/70 bg-green-500/15 py-2.5 text-xs text-green-100 hover:bg-green-500/30"
                  title="Right-click resource node"
                >
                  Harvest
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="rounded border border-red-500/70 bg-red-500/15 py-2.5 text-xs text-red-100 hover:bg-red-500/30"
                onClick={() => onWorkerCommand("stop")}
              >
                Stop
              </button>
              <button
                type="button"
                className="rounded border border-orange-500/70 bg-orange-500/15 py-2.5 text-xs text-orange-100 hover:bg-orange-500/30"
                onClick={() => onWorkerCommand("attack")}
                title="Right-click enemy to attack"
              >
                ⚔️ Attack
              </button>
              <button
                type="button"
                className={`rounded border py-2.5 text-xs hover:opacity-90 ${patrolMode ? "border-cyan-400 bg-cyan-500/30 text-cyan-100" : "border-cyan-500/70 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/30"}`}
                onClick={onPatrolCommand}
                title="Patrol [P]"
              >
                {patrolMode ? "🔄 Set Route…" : "🔄 Patrol"}
              </button>
              <button
                type="button"
                className="rounded border border-yellow-500/70 bg-yellow-500/15 py-2.5 text-xs text-yellow-100 hover:bg-yellow-500/30"
                onClick={onHoldPosition}
                title="Hold [H]"
              >
                🛡️ Hold
              </button>
              <button
                type="button"
                className={`rounded border py-2.5 text-xs hover:opacity-90 ${stance === "aggressive" ? "border-red-400/70 bg-red-500/20 text-red-100" : "border-slate-500/70 bg-slate-700/30 text-slate-300"}`}
                onClick={onToggleStance}
              >
                {stance === "aggressive" ? "⚔️ Aggro" : "🛡 Passive"}
              </button>
              <button
                type="button"
                className="col-span-2 rounded border border-sky-500/70 bg-sky-500/15 py-2.5 text-xs text-sky-100 hover:bg-sky-500/30 disabled:opacity-40"
                onClick={onGarrison}
                disabled={garrisonedCount >= garrisonCap}
                title={`Garrison — ${garrisonedCount}/${garrisonCap}`}
              >
                🏰 Garrison ({garrisonedCount}/{garrisonCap})
              </button>
              {selectedWorkers.some((w) => w.unitType === "cavalry") &&
                (() => {
                  const sprintReady = selectedWorkers.some(
                    (w) => w.unitType === "cavalry" && w.sprintCooldown <= 0,
                  );
                  const maxCd = Math.max(
                    ...selectedWorkers
                      .filter((w) => w.unitType === "cavalry")
                      .map((w) => w.sprintCooldown),
                  );
                  const anySprinting = selectedWorkers.some(
                    (w) => w.unitType === "cavalry" && w.sprinting,
                  );
                  return (
                    <button
                      type="button"
                      className={`col-span-3 rounded border py-2.5 text-xs font-semibold disabled:opacity-40 ${anySprinting ? "border-amber-400 bg-amber-500/30 text-amber-100" : sprintReady ? "border-amber-500/70 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" : "border-amber-800/50 bg-amber-900/20 text-amber-600"}`}
                      onClick={onCavalrySprint}
                      disabled={!sprintReady || anySprinting}
                      title="Sprint [S] — 2× speed for 5s; 20s cooldown; passive trample dmg while moving"
                    >
                      {anySprinting
                        ? "🐴 Sprinting!"
                        : sprintReady
                          ? "🐴 Sprint [S]"
                          : `🐴 Sprint ${maxCd}s`}
                    </button>
                  );
                })()}
              {selectedWorkers.some((w) => w.unitType === "swordsman") &&
                (() => {
                  const chargeReady = selectedWorkers.some(
                    (w) => w.unitType === "swordsman" && w.chargeCooldown <= 0,
                  );
                  const maxCd = Math.max(
                    ...selectedWorkers
                      .filter((w) => w.unitType === "swordsman")
                      .map((w) => w.chargeCooldown),
                  );
                  return (
                    <button
                      type="button"
                      className={`col-span-3 rounded border py-2.5 text-xs font-semibold disabled:opacity-40 ${chargeReady ? "border-red-400 bg-red-500/20 text-red-100 hover:bg-red-500/30" : "border-red-800/50 bg-red-900/20 text-red-600"}`}
                      onClick={onSwordsmanCharge}
                      disabled={!chargeReady}
                      title="Charge [C] — instant 2× damage to nearest grunt; 12s cooldown"
                    >
                      {chargeReady ? "⚡ Charge [C]" : `⚡ Charge ${maxCd}s`}
                    </button>
                  );
                })()}
              {isHeroSelected && (
                <HeroPanel
                  heroLevel={heroLevel}
                  heroAbilityCooldown={heroAbilityCooldown}
                  onHeroAbility={onHeroAbility}
                  heroShoutCooldown={heroShoutCooldown}
                  battleShoutActive={battleShoutActive}
                  onBattleShout={onBattleShout}
                  harvestBoonCooldown={harvestBoonCooldown}
                  harvestBoonActive={harvestBoonActive}
                  onHarvestBoon={onHarvestBoon}
                  earthquakeCooldown={earthquakeCooldown}
                  onEarthquake={onEarthquake}
                  heroItems={heroItems}
                  onDropItem={onDropItem}
                  onUsePotion={onUsePotion}
                />
              )}
            </div>
          )}

          {/* Formation toggle — shown when 2+ units selected */}
          {selectedCount > 1 && selectedType === "worker" && (
            <div className="mt-2 flex items-center gap-2 border-t border-slate-700/50 pt-2">
              <span className="text-xs text-slate-400">Formation:</span>
              <button
                type="button"
                onClick={onCycleFormation}
                className="rounded border border-slate-500/60 bg-slate-800/60 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700/60"
                title="Cycle formation shape: cluster → line → wedge → box"
              >
                {formationMode === "cluster" && "⬡ Cluster"}
                {formationMode === "line" && "▬ Line"}
                {formationMode === "wedge" && "▲ Wedge"}
                {formationMode === "box" && "⬛ Box"}
              </button>
            </div>
          )}

          {selectedType === "building" &&
            selectedBuilding &&
            (() => {
              const b = selectedBuilding;
              const isTower = b.type === "watchtower";
              const tgUnits = towerGarrison[b.id] ?? [];
              const isAttackTower =
                b.type === "frostTower" ||
                b.type === "ballista" ||
                b.type === "poisonTower";
              return (
                <div className="grid grid-cols-2 gap-1.5">
                  {isTower && (
                    <>
                      <button
                        type="button"
                        className="rounded border border-sky-500/70 bg-sky-500/15 py-2.5 text-xs text-sky-100 hover:bg-sky-500/30 disabled:opacity-40"
                        onClick={() => onTowerGarrison(b.id, b.x, b.y)}
                        disabled={tgUnits.length >= 3}
                        title="Garrison selected units into this tower for bonus dmg [G]"
                      >
                        🏰 Garrison ({tgUnits.length}/3)
                      </button>
                      <button
                        type="button"
                        className="rounded border border-slate-500/70 bg-slate-700/30 py-2.5 text-xs text-slate-200 hover:bg-slate-600/30 disabled:opacity-40"
                        onClick={() => onTowerDeploy(b.id, b.x, b.y)}
                        disabled={tgUnits.length === 0}
                        title="Deploy garrisoned units back to the field"
                      >
                        🚪 Deploy ({tgUnits.length})
                      </button>
                    </>
                  )}
                  {isAttackTower && (
                    <div className="col-span-2 py-1 text-center text-xs text-slate-400">
                      Auto-attacks nearby enemies
                    </div>
                  )}
                  {b.type === "barracks" && (
                    <>
                      <div className="col-span-2 py-1 text-center text-xs text-slate-400">
                        Train units from Barn → Train tab
                      </div>
                    </>
                  )}
                  {b.hp < b.maxHp && (
                    <div className="col-span-2 py-1 text-center text-xs text-amber-400/80">
                      🔧 Damaged — right-click with workers to repair
                    </div>
                  )}
                  {b.type === "supplyStore" && (
                    <div className="col-span-2">
                      <div className="mb-1 text-xs font-semibold text-violet-300">
                        🛒 Shop — Hero Items
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {shopItems.map((s) => {
                          const data = HERO_ITEM_DATA[s.itemId];
                          if (!data) return null;
                          const canBuy =
                            resources.gold >= s.cost && heroItems.length < 3;
                          return (
                            <button
                              key={s.itemId}
                              type="button"
                              className={`flex flex-col items-center rounded border py-1.5 text-[10px] ${canBuy ? "cursor-pointer border-violet-500/60 bg-violet-900/20 text-violet-100 hover:bg-violet-900/40" : "cursor-not-allowed border-slate-700/40 bg-slate-800/30 text-slate-500 opacity-50"}`}
                              onClick={() =>
                                canBuy && onBuyItem(s.itemId, s.cost)
                              }
                              title={`${data.name}: ${data.desc}`}
                              disabled={!canBuy}
                            >
                              <span className="text-base">{data.emoji}</span>
                              <span className="font-medium">{data.name}</span>
                              <span className="text-yellow-400">
                                {s.cost}🪙
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {heroItems.length >= 3 && (
                        <div className="mt-1 text-center text-[10px] text-amber-400">
                          Inventory full (3/3)
                        </div>
                      )}
                    </div>
                  )}
                  {b.type !== "watchtower" &&
                    !isAttackTower &&
                    b.type !== "barracks" &&
                    b.type !== "supplyStore" &&
                    b.hp >= b.maxHp && (
                      <div className="col-span-2 py-1 text-center text-xs text-slate-500">
                        No actions available
                      </div>
                    )}
                </div>
              );
            })()}

          {selectedType === "farmhouse" && (
            <div className="flex flex-col gap-1">
              <BuildMenu
                farmhouse={farmhouse}
                farmhouseUpgradeCosts={farmhouseUpgradeCosts}
                resources={resources}
                buildingCosts={buildingCosts}
                onFarmhouseAction={onFarmhouseAction}
                upgrades={upgrades}
                onResearch={onResearch}
                hasBarracks={hasBarracks}
                hasStable={hasStable}
                hasSiegeWorkshop={hasSiegeWorkshop}
                hasMarket={hasMarket}
                hasBlacksmith={hasBlacksmith}
                hasWatchtower={hasWatchtower}
                guardTowerResearched={guardTowerResearched}
                onGuardTower={onGuardTower}
                trainingQueue={trainingQueue}
                trainingProgress={trainingProgress}
                towerGarrison={towerGarrison}
                onTowerDeploy={onTowerDeploy}
                placedBuildingsList={placedBuildingsList}
                placedBuildings={placedBuildings}
                heroReviveCountdown={heroReviveCountdown}
                heroReviveCost={heroReviveCost}
                onInstantRevive={onInstantRevive}
                heroRecruited={heroRecruited}
                onRecruitHero={onRecruitHero}
                garrisonedCount={garrisonedCount}
                onUngarrison={onUngarrison}
                blacksmithUpgrades={blacksmithUpgrades}
                onBlacksmithUpgrade={onBlacksmithUpgrade}
                barracksTech={barracksTech}
                onBarracksTech={onBarracksTech}
              />
            </div>
          )}

          {buildMode && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-amber-300">
                Placing {buildingCosts[buildMode].label} — click map to place,
                Esc to cancel
              </span>
            </div>
          )}

          {!selectedType && !buildMode && (
            <div className="text-xs text-slate-500">
              Click a unit or barn · Ctrl+1-9: group · 1-9: recall · Right-click
              enemy barn to attack
            </div>
          )}
        </div>

        {/* Minimap + enemy HP */}
        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-3 text-amber-100">
          <div className="text-xs tracking-wide text-amber-300/90 uppercase">
            Status
          </div>
          <div className="mt-1 text-xs text-slate-400">Enemy Barn</div>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded bg-slate-700">
              <div
                className="h-2 rounded transition-all"
                style={{
                  width: `${hpPct(enemyBarnHp, enemyBarnMaxHp) * 100}%`,
                  background: "#ef4444",
                }}
              />
            </div>
            <span className="text-xs text-red-300">
              {enemyBarnHp}/{enemyBarnMaxHp}
            </span>
          </div>
          <svg
            className="mt-1.5 h-24 w-full cursor-crosshair rounded border border-slate-700 bg-slate-800/80"
            viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
            preserveAspectRatio="xMidYMid meet"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const tx = Math.round(
                ((e.clientX - rect.left) / rect.width) * GRID_SIZE,
              );
              const ty = Math.round(
                ((e.clientY - rect.top) / rect.height) * GRID_SIZE,
              );
              onMinimapClick(tx, ty);
            }}
          >
            {/* Resource nodes */}
            {minimapData.treeNodes.map((n, i) => (
              <rect
                key={`t${i}`}
                x={n.x - 0.35}
                y={n.y - 0.35}
                width={0.7}
                height={0.7}
                fill="#15803d"
                opacity={0.7}
              />
            ))}
            {minimapData.goldNodes.map((n, i) => (
              <rect
                key={`g${i}`}
                x={n.x - 0.35}
                y={n.y - 0.35}
                width={0.7}
                height={0.7}
                fill="#ca8a04"
                opacity={0.7}
              />
            ))}
            {minimapData.stoneNodes.map((n, i) => (
              <rect
                key={`s${i}`}
                x={n.x - 0.35}
                y={n.y - 0.35}
                width={0.7}
                height={0.7}
                fill="#6b7280"
                opacity={0.7}
              />
            ))}
            {/* Creep camps (not cleared) */}
            {minimapData.creepCamps
              .filter((c) => !c.cleared)
              .map((c, i) => (
                <g key={`cc${i}`}>
                  <line
                    x1={c.x - 0.5}
                    y1={c.y - 0.5}
                    x2={c.x + 0.5}
                    y2={c.y + 0.5}
                    stroke="#a855f7"
                    strokeWidth={0.4}
                  />
                  <line
                    x1={c.x + 0.5}
                    y1={c.y - 0.5}
                    x2={c.x - 0.5}
                    y2={c.y + 0.5}
                    stroke="#a855f7"
                    strokeWidth={0.4}
                  />
                </g>
              ))}
            {/* Player buildings */}
            {minimapData.buildings.map((b, i) => (
              <rect
                key={`b${i}`}
                x={b.x - 0.45}
                y={b.y - 0.45}
                width={0.9}
                height={0.9}
                fill="#f59e0b"
                opacity={0.85}
                rx={0.15}
              />
            ))}
            {/* Player barn */}
            <rect
              x={BARN_POS.x - 0.7}
              y={BARN_POS.y - 0.7}
              width={1.4}
              height={1.4}
              fill="#fbbf24"
              rx={0.2}
            />
            {/* Enemy barn */}
            {minimapData.enemyBarnAlive && (
              <rect
                x={ENEMY_BARN_POS.x - 0.7}
                y={ENEMY_BARN_POS.y - 0.7}
                width={1.4}
                height={1.4}
                fill="#ef4444"
                rx={0.2}
              />
            )}
            {/* Enemy fortress towers */}
            {minimapData.enemyTowers.map((t, i) => (
              <rect
                key={`et${i}`}
                x={t.x - 0.45}
                y={t.y - 0.45}
                width={0.9}
                height={0.9}
                fill="#dc2626"
                opacity={0.9}
                rx={0.1}
              />
            ))}
            {/* Workers */}
            {minimapData.workers.map((w, i) => (
              <circle
                key={i}
                cx={w.x}
                cy={w.y}
                r={0.55}
                fill={w.selected ? "#38bdf8" : "#4ade80"}
              />
            ))}
            {/* Grunts */}
            {minimapData.grunts.map((g, i) => (
              <circle key={i} cx={g.x} cy={g.y} r={0.55} fill="#f97316" />
            ))}
            {/* War Rams */}
            {minimapData.warRams.map((r, i) => (
              <rect
                key={`ram${i}`}
                x={r.x - 0.7}
                y={r.y - 0.5}
                width={1.4}
                height={1}
                fill="#7c2d12"
                stroke="#dc2626"
                strokeWidth={0.2}
                rx={0.15}
              />
            ))}
            {/* Shamans */}
            {minimapData.shamans.map((s, i) => (
              <circle
                key={`shaman${i}`}
                cx={s.x}
                cy={s.y}
                r={0.6}
                fill="#4ade80"
                stroke="#166534"
                strokeWidth={0.2}
              />
            ))}
            {/* Troll Archers */}
            {minimapData.trolls.map((t, i) => (
              <polygon
                key={`troll${i}`}
                points={`${t.x},${t.y - 0.8} ${t.x + 0.7},${t.y + 0.5} ${t.x - 0.7},${t.y + 0.5}`}
                fill="#f97316"
                stroke="#7c2d12"
                strokeWidth={0.15}
              />
            ))}
            {/* Goblin Sappers — red X */}
            {minimapData.sappers.map((s, i) => (
              <g key={`sapper${i}`}>
                <line
                  x1={s.x - 0.6}
                  y1={s.y - 0.6}
                  x2={s.x + 0.6}
                  y2={s.y + 0.6}
                  stroke="#dc2626"
                  strokeWidth={0.35}
                />
                <line
                  x1={s.x + 0.6}
                  y1={s.y - 0.6}
                  x2={s.x - 0.6}
                  y2={s.y + 0.6}
                  stroke="#dc2626"
                  strokeWidth={0.35}
                />
              </g>
            ))}
            {/* Witch Doctors — magenta diamond */}
            {minimapData.witchDoctors.map((d, i) => (
              <polygon
                key={`wd${i}`}
                points={`${d.x},${d.y - 0.8} ${d.x + 0.7},${d.y} ${d.x},${d.y + 0.8} ${d.x - 0.7},${d.y}`}
                fill="#e879f9"
                stroke="#7e22ce"
                strokeWidth={0.15}
              />
            ))}
            {/* Warchief — gold star */}
            {minimapData.warchiefs.map((wc2, i) => (
              <polygon
                key={`warchief${i}`}
                points={`${wc2.x},${wc2.y - 1} ${wc2.x + 0.35},${wc2.y - 0.3} ${wc2.x + 1},${wc2.y - 0.3} ${wc2.x + 0.5},${wc2.y + 0.2} ${wc2.x + 0.65},${wc2.y + 1} ${wc2.x},${wc2.y + 0.6} ${wc2.x - 0.65},${wc2.y + 1} ${wc2.x - 0.5},${wc2.y + 0.2} ${wc2.x - 1},${wc2.y - 0.3} ${wc2.x - 0.35},${wc2.y - 0.3}`}
                fill="#f59e0b"
                stroke="#d97706"
                strokeWidth={0.1}
              />
            ))}
            {/* Fog of war overlay — unexplored tiles darkened on minimap */}
            {minimapData.fogExplored.flatMap((col, x) =>
              col.map((explored, y) =>
                explored ? null : (
                  <rect
                    key={`fog-${x}-${y}`}
                    x={x - 0.5}
                    y={y - 0.5}
                    width={1}
                    height={1}
                    fill="#0f172a"
                    opacity={0.75}
                  />
                ),
              ),
            )}
            {/* Enemy fortification walls */}
            {minimapData.enemyWalls.map((ew, i) => (
              <rect
                key={`ew${i}`}
                x={ew.x - 0.4}
                y={ew.y - 0.25}
                width={0.8}
                height={0.5}
                fill="#7f1d1d"
                stroke="#dc2626"
                strokeWidth={0.1}
                rx={0.05}
              />
            ))}
            {/* Loot crates — cyan squares */}
            {minimapData.lootCrates.map((c, i) => (
              <rect
                key={`lc${i}`}
                x={c.x - 0.35}
                y={c.y - 0.35}
                width={0.7}
                height={0.7}
                fill="#06b6d4"
                opacity={0.8}
                rx={0.1}
              />
            ))}
            {/* Dropped hero items — purple diamonds */}
            {minimapData.droppedItems.map((d, i) => (
              <polygon
                key={`di${i}`}
                points={`${d.x},${d.y - 0.5} ${d.x + 0.4},${d.y} ${d.x},${d.y + 0.5} ${d.x - 0.4},${d.y}`}
                fill="#a855f7"
                opacity={0.9}
              />
            ))}
            {/* Warlords — large dark-purple star */}
            {minimapData.warlords.map((wl, i) => (
              <polygon
                key={`warlord${i}`}
                points={`${wl.x},${wl.y - 1.4} ${wl.x + 0.5},${wl.y - 0.5} ${wl.x + 1.4},${wl.y - 0.4} ${wl.x + 0.7},${wl.y + 0.4} ${wl.x + 0.9},${wl.y + 1.4} ${wl.x},${wl.y + 0.8} ${wl.x - 0.9},${wl.y + 1.4} ${wl.x - 0.7},${wl.y + 0.4} ${wl.x - 1.4},${wl.y - 0.4} ${wl.x - 0.5},${wl.y - 0.5}`}
                fill="#7c3aed"
                stroke="#c4b5fd"
                strokeWidth={0.15}
              />
            ))}
            {/* Night Lurkers — fast teal triangles */}
            {minimapData.lurkers.map((lk, i) => (
              <polygon
                key={`lurker${i}`}
                points={`${lk.x},${lk.y - 0.9} ${lk.x + 0.8},${lk.y + 0.7} ${lk.x - 0.8},${lk.y + 0.7}`}
                fill="#0d9488"
                stroke="#99f6e4"
                strokeWidth={0.12}
              />
            ))}
            {/* Attack pings — expanding red rings */}
            {minimapData.attackPings.map((p, i) => {
              const age = (Date.now() - p.t) / 2500;
              return (
                <circle
                  key={`ping-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={0.5 + age * 2.5}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={0.4}
                  opacity={0.9 - age * 0.9}
                />
              );
            })}
          </svg>
          <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-slate-500">
            <span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-600 align-middle" />{" "}
              trees
            </span>
            <span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-600 align-middle" />{" "}
              gold
            </span>
            <span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-500 align-middle" />{" "}
              stone
            </span>
            <span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 align-middle" />{" "}
              buildings
            </span>
            <span className="text-purple-400">✕ creeps</span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>
              Pop {resources.food}/{resources.foodCap}
            </span>
            {resources.food >= resources.foodCap ? (
              <span className="text-amber-400">⚠ Cap!</span>
            ) : resources.food > resources.foodCap * 0.8 ? (
              <span className="text-red-400">📉 Heavy upkeep (40%)</span>
            ) : resources.food > resources.foodCap * 0.5 ? (
              <span className="text-yellow-400">📉 Low upkeep (70%)</span>
            ) : (
              <span className="text-green-400">✓ No upkeep</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
