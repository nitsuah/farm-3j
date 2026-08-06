import React, { useState } from 'react';

import type {
  Upgrades,
  WorkerState,
  FarmhouseAction,
  BuildingType,
  PlacedBuilding,
} from '../game/types';
import {
  LUMBER_SHED_BONUS_MS,
  BUILDING_REQUIRES,
  BLACKSMITH_STEEL_EDGE_COSTS,
  BLACKSMITH_IRON_HIDE_COSTS,
  UPGRADE_COSTS,
  UPGRADE_MAX,
} from '../game/constants';

// Re-exported from RTSUI for backward compat, but also defined here to avoid circular imports
export interface BuildingCost {
  gold: number;
  lumber: number;
  stone: number;
  label: string;
  foodCapBonus: number;
}

const UPGRADE_META: Record<
  keyof Upgrades,
  { label: string; icon: string; desc: string }
> = {
  sharperTools: { label: 'Atk', icon: '⚔️', desc: '+5 attack dmg' },
  swiftHarvest: { label: 'Harvest', icon: '🌾', desc: '-200ms gather' },
  ironWill: { label: 'HP', icon: '🛡️', desc: '+25 max HP' },
};

export interface BuildMenuProps {
  farmhouse: { built: boolean; level: number };
  farmhouseUpgradeCosts: { gold: number; lumber: number }[];
  resources: {
    gold: number;
    lumber: number;
    stone: number;
    food: number;
    foodCap: number;
  };
  buildingCosts: Record<BuildingType, BuildingCost>;
  onFarmhouseAction: (action: FarmhouseAction) => void;
  upgrades: Upgrades;
  onResearch: (type: keyof Upgrades) => void;
  hasBarracks: boolean;
  hasStable: boolean;
  hasSiegeWorkshop: boolean;
  hasMarket: boolean;
  hasBlacksmith: boolean;
  hasWatchtower: boolean;
  guardTowerResearched: boolean;
  onGuardTower: () => void;
  trainingQueue: { type: 'swordsman' | 'cavalry' }[];
  trainingProgress: number;
  towerGarrison: Record<number, WorkerState[]>;
  onTowerDeploy: (towerId: number, tx: number, ty: number) => void;
  placedBuildingsList: PlacedBuilding[];
  placedBuildings: PlacedBuilding[];
  heroReviveCountdown: number;
  heroReviveCost: number;
  onInstantRevive: () => void;
  heroRecruited: boolean;
  onRecruitHero: () => void;
  garrisonedCount: number;
  onUngarrison: () => void;
  blacksmithUpgrades: { steelEdge: number; ironHide: number };
  onBlacksmithUpgrade: (type: 'steelEdge' | 'ironHide') => void;
  barracksTech: { veteranTraining: boolean; warDrums: boolean };
  onBarracksTech: (type: 'veteranTraining' | 'warDrums') => void;
}

type FhTab = 'base' | 'build' | 'train' | 'tech';

export const BuildMenu: React.FC<BuildMenuProps> = ({
  farmhouse,
  farmhouseUpgradeCosts,
  resources,
  buildingCosts,
  onFarmhouseAction,
  upgrades,
  onResearch,
  hasBarracks,
  hasStable,
  hasSiegeWorkshop,
  hasMarket,
  hasBlacksmith,
  hasWatchtower,
  guardTowerResearched,
  onGuardTower,
  trainingQueue,
  trainingProgress,
  towerGarrison,
  onTowerDeploy,
  placedBuildingsList,
  placedBuildings,
  heroReviveCountdown,
  heroReviveCost,
  onInstantRevive,
  heroRecruited,
  onRecruitHero,
  garrisonedCount,
  onUngarrison,
  blacksmithUpgrades,
  onBlacksmithUpgrade,
  barracksTech,
  onBarracksTech,
}) => {
  const [fhTab, setFhTab] = useState<FhTab>('base');

  const canAfford = (cost: { gold: number; lumber: number; stone: number }) =>
    resources.gold >= cost.gold &&
    resources.lumber >= cost.lumber &&
    resources.stone >= cost.stone;

  const fmtCost = (c: { gold: number; lumber: number; stone: number }) =>
    [
      c.gold > 0 && `${c.gold}🪙`,
      c.lumber > 0 && `${c.lumber}🌲`,
      c.stone > 0 && `${c.stone}🪨`,
    ]
      .filter(Boolean)
      .join(' ');

  const tabBtn = (tab: FhTab, label: string) => (
    <button
      type="button"
      onClick={() => setFhTab(tab)}
      className={`flex-1 rounded-t px-2 py-1 text-xs font-semibold transition-colors ${fhTab === tab ? 'bg-amber-700/60 text-amber-100' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'}`}
    >
      {label}
    </button>
  );

  if (!farmhouse.built) {
    return (
      <button
        type="button"
        className="rounded border border-amber-500/70 bg-amber-500/15 px-2 py-2.5 text-xs text-amber-100 hover:bg-amber-500/30 disabled:opacity-40"
        onClick={() => onFarmhouseAction('build')}
        disabled={
          resources.gold < (farmhouseUpgradeCosts[0]?.gold ?? Infinity) ||
          resources.lumber < (farmhouseUpgradeCosts[0]?.lumber ?? Infinity)
        }
      >
        Build Barn ({farmhouseUpgradeCosts[0]?.gold ?? '?'}🪙{' '}
        {farmhouseUpgradeCosts[0]?.lumber ?? '?'}🌲)
      </button>
    );
  }

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-slate-700/60">
        {tabBtn('base', '🏚 Base')}
        {tabBtn('train', '⚔️ Train')}
        {tabBtn('build', '🏗 Build')}
        {tabBtn('tech', '🔬 Tech')}
      </div>

      {/* BASE tab — train farmer, garrison, hero, upgrade barn */}
      {fhTab === 'base' && (
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            type="button"
            className="rounded border border-blue-500/70 bg-blue-500/15 py-2.5 text-xs text-blue-100 hover:bg-blue-500/30 disabled:opacity-40"
            onClick={() => onFarmhouseAction('train')}
            disabled={
              resources.gold < 30 || resources.food >= resources.foodCap
            }
            title={
              resources.food >= resources.foodCap
                ? 'Food cap! Build Farmhouse'
                : 'Train Farmer (30🪙)'
            }
          >
            🌾 Farmer 30🪙 <span className="text-xs opacity-50">[F]</span>
          </button>
          {farmhouse.level < farmhouseUpgradeCosts.length && (
            <button
              type="button"
              className="rounded border border-amber-500/70 bg-amber-500/15 py-2.5 text-xs text-amber-100 hover:bg-amber-500/30 disabled:opacity-40"
              onClick={() => onFarmhouseAction('upgrade')}
              disabled={
                resources.gold <
                  (farmhouseUpgradeCosts[farmhouse.level]?.gold ?? 0) ||
                resources.lumber <
                  (farmhouseUpgradeCosts[farmhouse.level]?.lumber ?? 0)
              }
            >
              ⬆️ Upgrade Barn
            </button>
          )}
          {garrisonedCount > 0 && (
            <button
              type="button"
              className="col-span-2 rounded border border-sky-500/60 bg-sky-900/30 py-2 text-xs text-sky-200 hover:bg-sky-500/30"
              onClick={onUngarrison}
            >
              🚪 Deploy All Garrison
            </button>
          )}
          {hasMarket && (
            <>
              <button
                type="button"
                className="rounded border border-yellow-500/70 bg-yellow-900/20 py-2 text-xs text-yellow-100 hover:bg-yellow-900/40 disabled:opacity-40"
                onClick={() => onFarmhouseAction('trade:lumberToGold')}
                disabled={resources.lumber < 50}
                title="Sell 50🌲 for 30🪙"
              >
                🏪 50🌲→30🪙
              </button>
              <button
                type="button"
                className="rounded border border-yellow-500/70 bg-yellow-900/20 py-2 text-xs text-yellow-100 hover:bg-yellow-900/40 disabled:opacity-40"
                onClick={() => onFarmhouseAction('trade:stoneToGold')}
                disabled={resources.stone < 30}
                title="Sell 30🪨 for 20🪙"
              >
                🏪 30🪨→20🪙
              </button>
              <button
                type="button"
                className="col-span-2 rounded border border-green-600/70 bg-green-900/20 py-2 text-xs text-green-100 hover:bg-green-900/40 disabled:opacity-40"
                onClick={() => onFarmhouseAction('trade:stoneToLumber')}
                disabled={resources.stone < 40}
              >
                🏪 40🪨→25🌲
              </button>
            </>
          )}
        </div>
      )}

      {/* TRAIN tab — military units */}
      {fhTab === 'train' && (
        <div className="flex flex-col gap-1.5 pt-1">
          {(hasBarracks || hasStable) && trainingQueue.length > 0 && (
            <div className="rounded border border-slate-600/60 bg-slate-800/40 px-2 py-1.5">
              <div className="mb-1 flex items-center gap-1 text-xs text-slate-300">
                <span className="font-semibold">Queue</span>
                <span className="text-slate-500">
                  ({trainingQueue.length}/5)
                </span>
              </div>
              <div className="mb-1 h-1.5 w-full rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${trainingProgress * 100}%` }}
                />
              </div>
              <div className="flex gap-1">
                {trainingQueue.map((u, i) => (
                  <span
                    key={i}
                    className={`rounded px-1 py-0.5 text-sm ${i === 0 ? 'bg-emerald-700/40 text-emerald-200' : 'bg-slate-700/60 text-slate-400'}`}
                  >
                    {u.type === 'swordsman' ? '⚔️' : '🐴'}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-1.5">
            {hasBarracks ? (
              <button
                type="button"
                className="flex flex-col items-center rounded border border-rose-500/70 bg-rose-500/15 py-1.5 text-xs text-rose-100 hover:bg-rose-500/30 disabled:opacity-40"
                onClick={() => onFarmhouseAction('trainSwordsman')}
                disabled={
                  resources.gold < 50 ||
                  resources.food >= resources.foodCap ||
                  trainingQueue.length >= 5
                }
                title="Train Swordsman — 50🪙, 80HP, +10 dmg"
              >
                <span>
                  ⚔️ Swordsman <span className="opacity-50">[Q]</span>
                </span>
                <span className="mt-0.5 text-[10px] text-amber-300/80">
                  50🪙
                </span>
              </button>
            ) : (
              <div
                className="flex flex-col items-center rounded border border-slate-600/40 bg-slate-800/30 py-1.5 text-xs text-slate-500"
                title="Build Barracks first"
              >
                ⚔️ Swordsman
                <span className="mt-0.5 text-[10px]">🔒 Barracks</span>
              </div>
            )}
            {hasStable ? (
              <button
                type="button"
                className="flex flex-col items-center rounded border border-amber-500/70 bg-amber-500/15 py-1.5 text-xs text-amber-100 hover:bg-amber-500/30 disabled:opacity-40"
                onClick={() => onFarmhouseAction('trainCavalry')}
                disabled={
                  resources.gold < 60 ||
                  resources.food >= resources.foodCap ||
                  trainingQueue.length >= 5
                }
                title="Train Cavalry — 60🪙, 2× speed"
              >
                <span>
                  🐴 Cavalry <span className="opacity-50">[R]</span>
                </span>
                <span className="mt-0.5 text-[10px] text-amber-300/80">
                  60🪙
                </span>
              </button>
            ) : (
              <div
                className="flex flex-col items-center rounded border border-slate-600/40 bg-slate-800/30 py-1.5 text-xs text-slate-500"
                title="Build Stable first"
              >
                🐴 Cavalry
                <span className="mt-0.5 text-[10px]">🔒 Stable</span>
              </div>
            )}
            {hasSiegeWorkshop ? (
              <button
                type="button"
                className="flex flex-col items-center rounded border border-orange-500/70 bg-orange-500/15 py-1.5 text-xs text-orange-100 hover:bg-orange-500/30 disabled:opacity-40"
                onClick={() => onFarmhouseAction('trainCatapult')}
                disabled={
                  resources.gold < 150 ||
                  resources.lumber < 80 ||
                  resources.food >= resources.foodCap
                }
                title="Train Catapult — 150🪙 80🌲, AoE 6-tile range"
              >
                <span>🪨 Catapult</span>
                <span className="mt-0.5 text-[10px] text-amber-300/80">
                  150🪙 80🌲
                </span>
              </button>
            ) : (
              <div
                className="flex flex-col items-center rounded border border-slate-600/40 bg-slate-800/30 py-1.5 text-xs text-slate-500"
                title="Build Siege Workshop first"
              >
                🪨 Catapult
                <span className="mt-0.5 text-[10px]">🔒 Siege Wksp</span>
              </div>
            )}
            {hasSiegeWorkshop ? (
              <button
                type="button"
                className="flex flex-col items-center rounded border border-yellow-700/70 bg-yellow-900/20 py-1.5 text-xs text-yellow-100 hover:bg-yellow-900/40 disabled:opacity-40"
                onClick={() => onFarmhouseAction('trainTrebuchet')}
                disabled={
                  resources.gold < 200 ||
                  resources.lumber < 80 ||
                  resources.stone < 60 ||
                  resources.food >= resources.foodCap
                }
                title="Train Trebuchet — long-range siege"
              >
                <span>🏰 Trebuchet</span>
                <span className="mt-0.5 text-[10px] text-amber-300/80">
                  200🪙 80🌲 60🪨
                </span>
              </button>
            ) : (
              <div
                className="flex flex-col items-center rounded border border-slate-600/40 bg-slate-800/30 py-1.5 text-xs text-slate-500"
                title="Build Siege Workshop first"
              >
                🏰 Trebuchet
                <span className="mt-0.5 text-[10px]">🔒 Siege Wksp</span>
              </div>
            )}
          </div>
          {hasBarracks &&
            (heroReviveCountdown > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="rounded border border-orange-400/50 bg-orange-500/10 px-2 py-1.5 text-center text-xs text-orange-200">
                  ⏳ Barnabas reviving {heroReviveCountdown}s…
                </div>
                <button
                  type="button"
                  className="rounded border border-yellow-400/70 bg-yellow-500/20 py-2 text-xs text-yellow-100 hover:bg-yellow-500/40 disabled:opacity-40"
                  onClick={onInstantRevive}
                  disabled={resources.gold < heroReviveCost}
                >
                  ⚡ Revive Now ({heroReviveCost}🪙)
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="rounded border border-yellow-400/70 bg-yellow-500/15 py-2.5 text-xs text-yellow-100 hover:bg-yellow-500/30 disabled:opacity-40"
                onClick={onRecruitHero}
                disabled={
                  heroRecruited ||
                  resources.gold < 150 ||
                  resources.food >= resources.foodCap
                }
                title={
                  heroRecruited
                    ? 'Barnabas already recruited'
                    : 'Recruit Barnabas — 150🪙'
                }
              >
                {heroRecruited ? '🦸 Hero Active' : '🦸 Recruit Hero 150🪙'}
              </button>
            ))}
          {!hasBarracks && !hasStable && !hasSiegeWorkshop && (
            <div className="py-4 text-center text-xs text-slate-500">
              Build Barracks, Stable, or Siege Workshop to unlock military
              training
            </div>
          )}
        </div>
      )}

      {/* BUILD tab — all buildings with inline costs */}
      {fhTab === 'build' &&
        (() => {
          interface BEntry {
            key: BuildingType;
            icon: string;
            label: string;
            border: string;
            bg: string;
            hover: string;
            text: string;
            desc: string;
          }
          const buildings: BEntry[] = [
            {
              key: 'farmhouse',
              icon: '🏠',
              label: 'Farmhouse',
              border: 'border-green-500/70',
              bg: 'bg-green-500/15',
              hover: 'hover:bg-green-500/30',
              text: 'text-green-100',
              desc: '+5 food cap',
            },
            {
              key: 'watchtower',
              icon: '🗼',
              label: 'Watchtower',
              border: 'border-slate-500/70',
              bg: 'bg-slate-500/15',
              hover: 'hover:bg-slate-500/30',
              text: 'text-slate-100',
              desc: 'Vision + arrows',
            },
            {
              key: 'lumberShed',
              icon: '🪵',
              label: 'Lumber Shed',
              border: 'border-yellow-700/70',
              bg: 'bg-yellow-900/20',
              hover: 'hover:bg-yellow-900/40',
              text: 'text-yellow-100',
              desc: `-${LUMBER_SHED_BONUS_MS}ms gather`,
            },
            {
              key: 'wall',
              icon: '🧱',
              label: 'Wall',
              border: 'border-amber-700/70',
              bg: 'bg-amber-900/20',
              hover: 'hover:bg-amber-900/40',
              text: 'text-amber-100',
              desc: 'Blocks grunts',
            },
            {
              key: 'windmill',
              icon: '💨',
              label: 'Windmill',
              border: 'border-lime-600/70',
              bg: 'bg-lime-900/20',
              hover: 'hover:bg-lime-900/40',
              text: 'text-lime-100',
              desc: '+2🪙/5s',
            },
            {
              key: 'granary',
              icon: '🌾',
              label: 'Granary',
              border: 'border-yellow-600/70',
              bg: 'bg-yellow-900/20',
              hover: 'hover:bg-yellow-900/40',
              text: 'text-yellow-100',
              desc: `+${buildingCosts.granary.foodCapBonus} pop`,
            },
            {
              key: 'barracks',
              icon: '🏯',
              label: 'Barracks',
              border: 'border-red-700/70',
              bg: 'bg-red-900/20',
              hover: 'hover:bg-red-900/40',
              text: 'text-red-100',
              desc: 'Unlocks ⚔️ Sword',
            },
            {
              key: 'stable',
              icon: '🐴',
              label: 'Stable',
              border: 'border-amber-500/70',
              bg: 'bg-amber-900/20',
              hover: 'hover:bg-amber-900/40',
              text: 'text-amber-100',
              desc: 'Unlocks 🐴 Cav',
            },
            {
              key: 'siegeWorkshop',
              icon: '⚙️',
              label: 'Siege Wksp',
              border: 'border-orange-600/70',
              bg: 'bg-orange-900/20',
              hover: 'hover:bg-orange-900/40',
              text: 'text-orange-100',
              desc: 'Unlocks 🪨 Catapult',
            },
            {
              key: 'market',
              icon: '🏪',
              label: 'Market',
              border: 'border-emerald-600/70',
              bg: 'bg-emerald-900/20',
              hover: 'hover:bg-emerald-900/40',
              text: 'text-emerald-100',
              desc: 'Trade resources',
            },
            {
              key: 'blacksmith',
              icon: '🔨',
              label: 'Blacksmith',
              border: 'border-red-800/70',
              bg: 'bg-red-950/30',
              hover: 'hover:bg-red-900/40',
              text: 'text-red-100',
              desc: 'Atk + armor upgrades',
            },
            {
              key: 'spikeTrap',
              icon: '🪤',
              label: 'Spike Trap',
              border: 'border-yellow-700/70',
              bg: 'bg-yellow-900/20',
              hover: 'hover:bg-yellow-800/30',
              text: 'text-yellow-200',
              desc: '20 dmg on step',
            },
            {
              key: 'frostTower',
              icon: '❄️',
              label: 'Frost Tower',
              border: 'border-cyan-700/70',
              bg: 'bg-cyan-900/20',
              hover: 'hover:bg-cyan-800/30',
              text: 'text-cyan-200',
              desc: 'Slow + 5 dmg',
            },
            {
              key: 'ballista',
              icon: '🏹',
              label: 'Ballista',
              border: 'border-yellow-700/70',
              bg: 'bg-yellow-900/20',
              hover: 'hover:bg-yellow-800/30',
              text: 'text-yellow-200',
              desc: '18 pierce, 6.5 range',
            },
            {
              key: 'poisonTower',
              icon: '☠️',
              label: 'Poison Twr',
              border: 'border-green-500/70',
              bg: 'bg-green-500/15',
              hover: 'hover:bg-green-500/30',
              text: 'text-green-100',
              desc: '8+3/s, 5-tile',
            },
            {
              key: 'supplyStore',
              icon: '🛒',
              label: 'Supply Store',
              border: 'border-violet-600/70',
              bg: 'bg-violet-900/20',
              hover: 'hover:bg-violet-900/40',
              text: 'text-violet-100',
              desc: 'Hero item shop',
            },
            {
              key: 'miningCamp',
              icon: '⛏️',
              label: 'Mining Camp',
              border: 'border-yellow-500/70',
              bg: 'bg-yellow-900/20',
              hover: 'hover:bg-yellow-900/40',
              text: 'text-yellow-100',
              desc: 'Gold/stone drop-off',
            },
          ];
          const builtTypes = new Set(
            placedBuildings.filter(b => !b.constructing).map(b => b.type)
          );
          if (farmhouse.built) builtTypes.add('farmhouse');
          return (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {buildings.map(b => {
                const cost = buildingCosts[b.key];
                const affordable = canAfford(cost);
                const reqType = BUILDING_REQUIRES[b.key as BuildingType];
                const prereqMet = !reqType || builtTypes.has(reqType);
                const reqLabel = reqType
                  ? (buildingCosts[reqType]?.label ?? reqType)
                  : '';
                return (
                  <button
                    key={b.key}
                    type="button"
                    className={`flex flex-col items-center rounded border ${b.border} ${b.bg} ${b.hover} ${b.text} py-1.5 text-xs disabled:opacity-40`}
                    onClick={() => onFarmhouseAction(`build:${b.key}`)}
                    disabled={!affordable || !prereqMet}
                    title={!prereqMet ? `🔒 Requires ${reqLabel}` : b.desc}
                  >
                    <span>
                      {!prereqMet ? '🔒' : b.icon} {b.label}
                    </span>
                    <span
                      className={`mt-0.5 text-[10px] ${!prereqMet ? 'text-slate-600' : affordable ? 'text-amber-300/80' : 'text-slate-500'}`}
                    >
                      {!prereqMet ? `Req: ${reqLabel}` : fmtCost(cost)}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })()}

      {/* TECH tab — research + upgrades */}
      {fhTab === 'tech' && (
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(UPGRADE_META) as (keyof Upgrades)[]).map(key => {
              const level = upgrades[key];
              const maxed = level >= UPGRADE_MAX;
              const cost = UPGRADE_COSTS[key][level];
              const meta = UPGRADE_META[key];
              return (
                <button
                  type="button"
                  key={key}
                  className="rounded border border-purple-500/70 bg-purple-500/15 py-2.5 text-xs text-purple-100 hover:bg-purple-500/30 disabled:opacity-40"
                  disabled={maxed || !cost || !canAfford(cost)}
                  onClick={() => onResearch(key)}
                  title={
                    maxed
                      ? `${meta.label} maxed`
                      : cost
                        ? `${meta.desc} · ${cost.gold > 0 ? cost.gold + '🪙' : ''}${cost.lumber > 0 ? cost.lumber + '🌲' : ''}${cost.stone > 0 ? cost.stone + '🪨' : ''}`
                        : ''
                  }
                >
                  {meta.icon}
                  {level > 0 && (
                    <span className="text-purple-300">{'★'.repeat(level)}</span>
                  )}{' '}
                  {meta.label}
                  {maxed && <span className="text-purple-400"> ✓</span>}
                </button>
              );
            })}
          </div>
          {hasWatchtower && (
            <button
              type="button"
              className={`rounded border py-2.5 text-xs disabled:opacity-40 ${guardTowerResearched ? 'border-cyan-500/50 bg-cyan-900/20 text-cyan-400' : 'border-cyan-500/70 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/30'}`}
              onClick={onGuardTower}
              disabled={
                guardTowerResearched ||
                resources.gold < 120 ||
                resources.stone < 80
              }
              title="Guard Tower — +7 dmg, +1 range on all watchtowers (120🪙 80🪨)"
            >
              {guardTowerResearched
                ? '🏰 Guard Tower ✓'
                : '🏰 Guard Tower 120🪙 80🪨'}
            </button>
          )}
          {hasBlacksmith && (
            <div className="grid grid-cols-2 gap-1.5">
              {(['steelEdge', 'ironHide'] as const).map(upg => {
                const lvl = blacksmithUpgrades[upg];
                const costs =
                  upg === 'steelEdge'
                    ? BLACKSMITH_STEEL_EDGE_COSTS
                    : BLACKSMITH_IRON_HIDE_COSTS;
                const cost = costs[lvl];
                const canAffordUpg =
                  cost !== undefined &&
                  resources.gold >= cost.gold &&
                  ('stone' in cost
                    ? resources.stone >= cost.stone
                    : resources.lumber >= (cost as { lumber: number }).lumber);
                const maxLvl = costs.length;
                const costLabel =
                  lvl >= maxLvl
                    ? 'MAX'
                    : cost
                      ? 'stone' in cost
                        ? `${cost.gold}🪙 ${cost.stone}🪨`
                        : `${cost.gold}🪙 ${(cost as { lumber: number }).lumber}🪵`
                      : '';
                return (
                  <button
                    key={upg}
                    type="button"
                    className={`rounded border py-2.5 text-xs hover:opacity-90 disabled:opacity-40 ${upg === 'steelEdge' ? 'border-red-700/70 bg-red-950/20 text-red-100 hover:bg-red-900/40' : 'border-sky-700/70 bg-sky-950/20 text-sky-100 hover:bg-sky-900/40'}`}
                    onClick={() => onBlacksmithUpgrade(upg)}
                    disabled={lvl >= maxLvl || !canAffordUpg}
                    title={
                      upg === 'steelEdge'
                        ? 'Steel Edge — +5 atk all units per level'
                        : 'Iron Hide — -2 dmg taken per level'
                    }
                  >
                    {upg === 'steelEdge' ? '⚔️ Steel' : '🛡️ Hide'}{' '}
                    {'★'.repeat(lvl)}
                    {'☆'.repeat(maxLvl - lvl)} {costLabel}
                  </button>
                );
              })}
            </div>
          )}
          {hasBarracks && (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                className={`rounded border py-2.5 text-xs disabled:opacity-40 ${barracksTech.veteranTraining ? 'border-red-500/40 bg-red-900/20 text-red-400' : 'border-red-400/70 bg-red-500/15 text-red-100 hover:bg-red-500/30'}`}
                onClick={() => onBarracksTech('veteranTraining')}
                disabled={
                  barracksTech.veteranTraining ||
                  resources.gold < 100 ||
                  resources.lumber < 60
                }
              >
                {barracksTech.veteranTraining
                  ? '🛡️ Veteran ✓'
                  : '🛡️ Veteran 100🪙 60🪵'}
              </button>
              <button
                type="button"
                className={`rounded border py-2.5 text-xs disabled:opacity-40 ${barracksTech.warDrums ? 'border-orange-500/40 bg-orange-900/20 text-orange-400' : 'border-orange-400/70 bg-orange-500/15 text-orange-100 hover:bg-orange-500/30'}`}
                onClick={() => onBarracksTech('warDrums')}
                disabled={
                  barracksTech.warDrums ||
                  resources.gold < 120 ||
                  resources.lumber < 40
                }
              >
                {barracksTech.warDrums
                  ? '🥁 War Drums ✓'
                  : '🥁 Drums 120🪙 40🪵'}
              </button>
            </div>
          )}
          {hasWatchtower &&
            (() => {
              const towers = placedBuildingsList.filter(
                b => b.type === 'watchtower'
              );
              return towers.map(t => {
                const tg = towerGarrison[t.id] ?? [];
                if (tg.length === 0) return null;
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded border border-cyan-700/50 bg-cyan-900/20 px-2 py-1.5 text-xs text-cyan-200"
                  >
                    <span>
                      🗼 ({t.x},{t.y}) {tg.length}/3 +{tg.length * 4}dmg
                    </span>
                    <button
                      type="button"
                      className="rounded bg-cyan-800/40 px-2 py-0.5 hover:bg-cyan-700/50"
                      onClick={() => onTowerDeploy(t.id, t.x, t.y)}
                    >
                      🚪 Deploy
                    </button>
                  </div>
                );
              });
            })()}
        </div>
      )}
    </>
  );
};
