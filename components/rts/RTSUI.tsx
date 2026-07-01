import React from 'react';

export interface WorkerState {
  id: number;
  x: number;
  y: number;
  selected: boolean;
  movingTo: null | { x: number; y: number };
  path: { x: number; y: number }[];
  gathering: null | { type: 'tree' | 'gold' | 'stone'; idx: number };
  attacking: null | { targetType: 'enemyBarn' } | { targetType: 'grunt'; gruntId: number } | { targetType: 'creep'; creepId: number };
  carrying: { gold: number; lumber: number; stone: number };
  state: 'idle' | 'moving' | 'gathering' | 'returning' | 'attacking';
  group: number | null;
  hp: number;
  maxHp: number;
  patrol: { a: { x: number; y: number }; b: { x: number; y: number }; heading: 'a' | 'b' } | null;
  unitType: 'farmer' | 'swordsman' | 'hero' | 'catapult';
  xp: number;
  level: number;
}

export type BuildingType = 'farmhouse' | 'lumberShed' | 'watchtower' | 'wall' | 'windmill' | 'barracks' | 'siegeWorkshop' | 'market' | 'blacksmith' | 'granary';

export interface PlacedBuilding {
  id: number;
  type: BuildingType;
  x: number;
  y: number;
}

interface BuildingCost {
  gold: number;
  lumber: number;
  stone: number;
  label: string;
  foodCapBonus: number;
}

export interface Upgrades {
  sharperTools: number;
  swiftHarvest: number;
  ironWill: number;
}

export const UPGRADE_COSTS: Record<keyof Upgrades, { gold: number; lumber: number; stone: number }[]> = {
  sharperTools: [{ gold: 75, lumber: 0, stone: 25 }, { gold: 150, lumber: 0, stone: 50 }],
  swiftHarvest: [{ gold: 50, lumber: 75, stone: 0 }, { gold: 100, lumber: 150, stone: 0 }],
  ironWill:     [{ gold: 75, lumber: 50, stone: 0 }, { gold: 150, lumber: 100, stone: 0 }],
};

export const UPGRADE_MAX = 2;

const UPGRADE_META: Record<keyof Upgrades, { label: string; icon: string; desc: string }> = {
  sharperTools: { label: 'Atk', icon: '⚔️', desc: '+5 attack dmg' },
  swiftHarvest: { label: 'Harvest', icon: '🌾', desc: '-200ms gather' },
  ironWill:     { label: 'HP', icon: '🛡️', desc: '+25 max HP' },
};

interface RTSUIProps {
  selectedType: 'worker' | 'farmhouse' | null;
  selectedWorkers: WorkerState[];
  hasBarracks: boolean;
  garrisonedCount: number;
  garrisonCap: number;
  onGarrison: () => void;
  onUngarrison: () => void;
  heroRecruited: boolean;
  heroAbilityCooldown: number;
  onHeroAbility: () => void;
  onRecruitHero: () => void;
  hasSiegeWorkshop: boolean;
  hasMarket: boolean;
  hasBlacksmith: boolean;
  blacksmithUpgrades: { steelEdge: number; ironHide: number };
  onBlacksmithUpgrade: (type: 'steelEdge' | 'ironHide') => void;
  farmhouse: { built: boolean; level: number };
  farmhouseUpgradeCosts: { gold: number; lumber: number }[];
  farmhouseStorage: { gold: number; lumber: number }[];
  resources: { gold: number; lumber: number; stone: number; food: number; foodCap: number };
  placedBuildings: PlacedBuilding[];
  buildingCosts: Record<BuildingType, BuildingCost>;
  onFarmhouseAction: (action: string) => void;
  onWorkerCommand: (cmd: 'stop' | 'gather' | 'attack') => void;
  patrolMode: boolean;
  onPatrolCommand: () => void;
  buildMode: BuildingType | null;
  upgrades: Upgrades;
  onResearch: (type: keyof Upgrades) => void;
  enemyBarnHp: number;
  enemyBarnMaxHp: number;
  playerBarnHp: number;
  playerBarnMaxHp: number;
  minimapData: {
    workers: { x: number; y: number; selected: boolean }[];
    grunts: { x: number; y: number }[];
    enemyBarnAlive: boolean;
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
  heroAbilityCooldown,
  onHeroAbility,
  onRecruitHero,
  hasSiegeWorkshop,
  hasMarket,
  hasBlacksmith,
  blacksmithUpgrades,
  onBlacksmithUpgrade,
}) => {
  const isHeroSelected = selectedWorkers.some(w => w.unitType === 'hero');
  const selectedCount = selectedWorkers.length;
  const firstWorker = selectedWorkers[0] ?? null;
  const anyFarmers = selectedWorkers.some(w => w.unitType === 'farmer');
  const allSwordsmen = selectedWorkers.length > 0 && selectedWorkers.every(w => w.unitType === 'swordsman');

  const stateLabel = (w: WorkerState) => {
    if (w.patrol) return '🔄 Patrolling';
    if (w.state === 'idle') return 'Idle';
    if (w.state === 'moving') return 'Moving';
    if (w.state === 'gathering') return 'Gathering';
    if (w.state === 'returning') return 'Returning';
    if (w.state === 'attacking') return '⚔️ Attacking';
    return w.state;
  };

  const canAfford = (cost: { gold: number; lumber: number; stone: number }) =>
    resources.gold >= cost.gold && resources.lumber >= cost.lumber && resources.stone >= cost.stone;

  const hpPct = (hp: number, max: number) => Math.max(0, hp / max);
  const hpColor = (pct: number) => pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#fbbf24' : '#ef4444';

  return (
    <div className="absolute bottom-0 left-0 z-30 h-36 w-full border-t-4 border-amber-600 bg-slate-950/95 px-4 py-3">
      <div className="grid h-full grid-cols-1 items-stretch gap-3 md:grid-cols-[220px_1fr_220px]">
        {/* Unit / building info */}
        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-3 text-amber-100">
          <div className="text-xs tracking-wide text-amber-300/90 uppercase">
            {selectedType === 'farmhouse' ? 'Building' : 'Selection'}
          </div>
          {selectedType === 'worker' && firstWorker ? (
            <>
              <div className="mt-1 text-sm font-semibold">
                {firstWorker.unitType === 'hero' ? '🦸 Barnabas' : firstWorker.unitType === 'catapult' ? '🪨 Catapult' : allSwordsmen ? '⚔️ Swordsman' : firstWorker.unitType === 'swordsman' ? 'Mixed' : 'Farmer'}{selectedCount > 1 && firstWorker.unitType !== 'hero' ? ` ×${selectedCount}` : ''}
                {firstWorker.group !== null && selectedCount === 1 && (
                  <span className="ml-2 rounded bg-amber-900/60 px-1.5 text-xs text-amber-300">G{firstWorker.group}</span>
                )}
              </div>
              {selectedCount === 1 && (
                <>
                  {/* HP bar */}
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded bg-slate-700">
                      <div className="h-2 rounded transition-all" style={{ width: `${hpPct(firstWorker.hp, firstWorker.maxHp) * 100}%`, background: hpColor(hpPct(firstWorker.hp, firstWorker.maxHp)) }} />
                    </div>
                    <span className="text-xs text-slate-300">{firstWorker.hp}/{firstWorker.maxHp}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-300">
                    {stateLabel(firstWorker)}
                    {!firstWorker.patrol && firstWorker.gathering ? ` (${firstWorker.gathering.type})` : ''}
                    {!firstWorker.patrol && firstWorker.attacking ? ' enemy barn' : ''}
                  </div>
                  <div className="mt-0.5 text-xs text-amber-200">
                    {firstWorker.carrying.gold > 0 && `🪙${firstWorker.carrying.gold} `}
                    {firstWorker.carrying.lumber > 0 && `🌲${firstWorker.carrying.lumber} `}
                    {firstWorker.carrying.stone > 0 && `🪨${firstWorker.carrying.stone}`}
                    {!firstWorker.carrying.gold && !firstWorker.carrying.lumber && !firstWorker.carrying.stone && 'Empty'}
                  </div>
                  {firstWorker.level > 0 || firstWorker.xp > 0 ? (
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="text-xs text-yellow-300">{'⭐'.repeat(firstWorker.level)}{firstWorker.level === 0 ? '☆☆' : firstWorker.level === 1 ? '☆' : ''}</span>
                      <div className="h-1.5 flex-1 rounded bg-slate-700">
                        <div className="h-1.5 rounded bg-yellow-400 transition-all" style={{ width: `${Math.min(100, (firstWorker.xp / (firstWorker.level >= 2 ? 120 : firstWorker.level === 1 ? 120 : 40)) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-yellow-400/70">{firstWorker.xp}xp</span>
                    </div>
                  ) : (
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">☆☆ Lv0</span>
                      <div className="h-1.5 flex-1 rounded bg-slate-700">
                        <div className="h-1.5 rounded bg-yellow-400/50 transition-all" style={{ width: `${(firstWorker.xp / 40) * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{firstWorker.xp}/40</span>
                    </div>
                  )}
                </>
              )}
              {selectedCount > 1 && (
                <div className="mt-0.5 text-xs text-slate-300">
                  {selectedWorkers.filter(w => w.state === 'idle').length} idle · {selectedWorkers.filter(w => w.state !== 'idle').length} working
                </div>
              )}
            </>
          ) : selectedType === 'farmhouse' ? (
            <>
              <div className="mt-1 text-sm font-semibold">Barn {farmhouse.built ? `(Lv ${farmhouse.level})` : ''}</div>
              {/* Player barn HP */}
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 flex-1 rounded bg-slate-700">
                  <div className="h-2 rounded" style={{ width: `${hpPct(playerBarnHp, playerBarnMaxHp) * 100}%`, background: hpColor(hpPct(playerBarnHp, playerBarnMaxHp)) }} />
                </div>
                <span className="text-xs text-slate-300">{playerBarnHp}/{playerBarnMaxHp}</span>
              </div>
              {farmhouse.built && (
                <div className="mt-0.5 text-xs text-slate-400">
                  Storage: {farmhouseStorage[farmhouse.level - 1]?.gold ?? '?'}🪙 Pop: {resources.food}/{resources.foodCap}
                </div>
              )}
              {garrisonedCount > 0 && (
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-sky-300">🏰 {garrisonedCount} garrisoned · healing</span>
                  <button className="rounded border border-sky-500/60 bg-sky-900/30 px-1.5 py-0.5 text-xs text-sky-200 hover:bg-sky-500/30" onClick={onUngarrison}>🚪 Deploy</button>
                </div>
              )}
            </>
          ) : buildMode ? (
            <>
              <div className="mt-1 text-sm font-semibold text-amber-300">Build Mode</div>
              <div className="mt-0.5 text-xs text-slate-300">{buildingCosts[buildMode].label}</div>
              <div className="mt-0.5 text-xs text-amber-200">
                {buildingCosts[buildMode].gold}🪙{buildingCosts[buildMode].lumber > 0 ? ` ${buildingCosts[buildMode].lumber}🌲` : ''}{buildingCosts[buildMode].stone > 0 ? ` ${buildingCosts[buildMode].stone}🪨` : ''}
              </div>
            </>
          ) : (
            <div className="mt-2 text-xs text-slate-400">Nothing selected</div>
          )}
        </div>

        {/* Command card */}
        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-3">
          <div className="mb-2 text-xs tracking-wide text-amber-300/90 uppercase">Commands</div>

          {selectedType === 'worker' && selectedCount > 0 && (
            <div className="grid grid-cols-4 gap-2">
              <button className="rounded border border-amber-500/70 bg-amber-500/15 px-2 py-2 text-xs text-amber-100 hover:bg-amber-500/30" title="Right-click tile to move">Move</button>
              {!allSwordsmen && (
                <button className="rounded border border-green-500/70 bg-green-500/15 px-2 py-2 text-xs text-green-100 hover:bg-green-500/30" title="Right-click resource node">Harvest</button>
              )}
              <button
                className={`rounded border border-red-500/70 bg-red-500/15 px-2 py-2 text-xs text-red-100 hover:bg-red-500/30 ${allSwordsmen ? 'col-span-2' : ''}`}
                onClick={() => onWorkerCommand('stop')}
              >
                Stop
              </button>
              {!allSwordsmen && (
                <button
                  className="rounded border border-blue-500/70 bg-blue-500/15 px-2 py-2 text-xs text-blue-100 hover:bg-blue-500/30 disabled:opacity-40"
                  onClick={() => onFarmhouseAction('build:farmhouse')}
                  disabled={!canAfford(buildingCosts.farmhouse)}
                  title={`Farmhouse (${buildingCosts.farmhouse.gold}🪙 ${buildingCosts.farmhouse.lumber}🌲)`}
                >
                  Build
                </button>
              )}
              <button
                className="col-span-2 rounded border border-orange-500/70 bg-orange-500/15 px-2 py-2 text-xs text-orange-100 hover:bg-orange-500/30"
                onClick={() => onWorkerCommand('attack')}
                title="Right-click enemy building to attack"
              >
                ⚔️ Attack
              </button>
              <button
                className={`col-span-2 rounded border px-2 py-2 text-xs hover:opacity-90 ${patrolMode ? 'border-cyan-400 bg-cyan-500/30 text-cyan-100' : 'border-cyan-500/70 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/30'}`}
                onClick={onPatrolCommand}
                title="Patrol [P] — right-click two points to set patrol route"
              >
                {patrolMode ? '🔄 Set Patrol…' : '🔄 Patrol'}
              </button>
              <button
                className="col-span-2 rounded border border-sky-500/70 bg-sky-500/15 px-2 py-2 text-xs text-sky-100 hover:bg-sky-500/30 disabled:opacity-40"
                onClick={onGarrison}
                disabled={garrisonedCount >= garrisonCap}
                title={`Garrison in barn [right-click barn] — ${garrisonedCount}/${garrisonCap} slots · +5 HP/s heal · barn gains armor`}
              >
                🏰 Garrison ({garrisonedCount}/{garrisonCap})
              </button>
              {isHeroSelected && (
                <button
                  className={`col-span-4 rounded border px-2 py-2 text-xs font-semibold disabled:opacity-40 ${heroAbilityCooldown > 0 ? 'border-yellow-700/50 bg-yellow-900/20 text-yellow-600' : 'border-yellow-400 bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30'}`}
                  onClick={onHeroAbility}
                  disabled={heroAbilityCooldown > 0}
                  title="Rallying Cry — AoE damage to all grunts within 3.5 tiles"
                >
                  {heroAbilityCooldown > 0 ? `⚡ Rallying Cry (${heroAbilityCooldown}s)` : '⚡ Rallying Cry — AoE 30 dmg'}
                </button>
              )}
            </div>
          )}

          {selectedType === 'farmhouse' && (
            <div className="grid grid-cols-4 gap-2">
              {!farmhouse.built ? (
                <button
                  className="col-span-2 rounded border border-amber-500/70 bg-amber-500/15 px-2 py-2 text-xs text-amber-100 hover:bg-amber-500/30 disabled:opacity-40"
                  onClick={() => onFarmhouseAction('build')}
                  disabled={resources.gold < (farmhouseUpgradeCosts[0]?.gold ?? 0) || resources.lumber < (farmhouseUpgradeCosts[0]?.lumber ?? 0)}
                >
                  Build ({farmhouseUpgradeCosts[0]?.gold}🪙 {farmhouseUpgradeCosts[0]?.lumber}🌲)
                </button>
              ) : (
                <>
                  <button
                    className="rounded border border-blue-500/70 bg-blue-500/15 px-2 py-2 text-xs text-blue-100 hover:bg-blue-500/30 disabled:opacity-40"
                    onClick={() => onFarmhouseAction('train')}
                    disabled={resources.gold < 30 || resources.food >= resources.foodCap}
                    title={resources.food >= resources.foodCap ? 'Food cap! Build Farmhouse' : 'Train Farmer (30🪙)'}
                  >
                    Train 30🪙
                  </button>
                  {farmhouse.level < 2 && (
                    <button
                      className="rounded border border-amber-500/70 bg-amber-500/15 px-2 py-2 text-xs text-amber-100 hover:bg-amber-500/30 disabled:opacity-40"
                      onClick={() => onFarmhouseAction('upgrade')}
                      disabled={resources.gold < (farmhouseUpgradeCosts[farmhouse.level]?.gold ?? 0) || resources.lumber < (farmhouseUpgradeCosts[farmhouse.level]?.lumber ?? 0)}
                    >
                      Upgrade
                    </button>
                  )}
                  <button className="rounded border border-green-500/70 bg-green-500/15 px-2 py-2 text-xs text-green-100 hover:bg-green-500/30 disabled:opacity-40" onClick={() => onFarmhouseAction('build:farmhouse')} disabled={!canAfford(buildingCosts.farmhouse)} title="+5 food cap">🏠 Farm</button>
                  <button className="rounded border border-slate-500/70 bg-slate-500/15 px-2 py-2 text-xs text-slate-100 hover:bg-slate-500/30 disabled:opacity-40" onClick={() => onFarmhouseAction('build:watchtower')} disabled={!canAfford(buildingCosts.watchtower)} title="Expands vision">🗼 Tower</button>
                  <button className="rounded border border-yellow-700/70 bg-yellow-900/20 px-2 py-2 text-xs text-yellow-100 hover:bg-yellow-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:lumberShed')} disabled={!canAfford(buildingCosts.lumberShed)} title="Lumber Shed">🪵 Shed</button>
                  <button className="rounded border border-amber-700/70 bg-amber-900/20 px-2 py-2 text-xs text-amber-100 hover:bg-amber-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:wall')} disabled={!canAfford(buildingCosts.wall)} title="Palisade Wall — blocks enemy grunts">🧱 Wall</button>
                  <button className="rounded border border-lime-600/70 bg-lime-900/20 px-2 py-2 text-xs text-lime-100 hover:bg-lime-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:windmill')} disabled={!canAfford(buildingCosts.windmill)} title="Windmill — +2🪙 every 5s">💨 Mill</button>
                  <button className="rounded border border-red-700/70 bg-red-900/20 px-2 py-2 text-xs text-red-100 hover:bg-red-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:barracks')} disabled={!canAfford(buildingCosts.barracks)} title="Barracks — train Swordsmen">🏯 Barracks</button>
                  <button className="rounded border border-orange-600/70 bg-orange-900/20 px-2 py-2 text-xs text-orange-100 hover:bg-orange-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:siegeWorkshop')} disabled={!canAfford(buildingCosts.siegeWorkshop)} title="Siege Workshop — train Catapults (100🪙 80🌲 60🪨)">⚙️ Siege</button>
                  <button className="rounded border border-emerald-600/70 bg-emerald-900/20 px-2 py-2 text-xs text-emerald-100 hover:bg-emerald-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:market')} disabled={!canAfford(buildingCosts.market)} title="Market — trade lumber for gold (80🪙 60🌲 20🪨)">🏪 Market</button>
                  <button className="rounded border border-red-800/70 bg-red-950/30 px-2 py-2 text-xs text-red-100 hover:bg-red-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:blacksmith')} disabled={!canAfford(buildingCosts.blacksmith)} title="Blacksmith — upgrade unit attack and armor (100🪙 60🌲 80🪨)">🔨 Smith</button>
                  <button className="rounded border border-yellow-600/70 bg-yellow-900/20 px-2 py-2 text-xs text-yellow-100 hover:bg-yellow-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:granary')} disabled={!canAfford(buildingCosts.granary)} title="Granary — +8 population cap (50🪙 80🌲 20🪨)">🌾 Granary</button>
                  {hasMarket && (
                    <>
                      <button
                        className="col-span-2 rounded border border-yellow-500/70 bg-yellow-900/20 px-2 py-2 text-xs text-yellow-100 hover:bg-yellow-900/40 disabled:opacity-40"
                        onClick={() => onFarmhouseAction('trade:lumberToGold')}
                        disabled={resources.lumber < 50}
                        title="Sell 50🌲 for 30🪙 at the Market"
                      >
                        🏪 Sell 50🌲 → 30🪙
                      </button>
                      <button
                        className="col-span-2 rounded border border-yellow-500/70 bg-yellow-900/20 px-2 py-2 text-xs text-yellow-100 hover:bg-yellow-900/40 disabled:opacity-40"
                        onClick={() => onFarmhouseAction('trade:stoneToGold')}
                        disabled={resources.stone < 30}
                        title="Sell 30🪨 for 20🪙 at the Market"
                      >
                        🏪 Sell 30🪨 → 20🪙
                      </button>
                    </>
                  )}
                  {hasBlacksmith && (
                    <>
                      <button
                        className="col-span-2 rounded border border-red-700/70 bg-red-950/20 px-2 py-2 text-xs text-red-100 hover:bg-red-900/40 disabled:opacity-40"
                        onClick={() => onBlacksmithUpgrade('steelEdge')}
                        disabled={blacksmithUpgrades.steelEdge >= 2 || (blacksmithUpgrades.steelEdge === 0 ? resources.gold < 80 || resources.stone < 60 : resources.gold < 160 || resources.stone < 120)}
                        title={blacksmithUpgrades.steelEdge >= 2 ? '⚔️ Steel Edge maxed (+10 atk)' : blacksmithUpgrades.steelEdge === 0 ? '⚔️ Steel Edge I — +5 atk dmg all units (80🪙 60🪨)' : '⚔️ Steel Edge II — +5 atk dmg all units (160🪙 120🪨)'}
                      >
                        ⚔️ Steel Edge {'★'.repeat(blacksmithUpgrades.steelEdge)}{'☆'.repeat(2 - blacksmithUpgrades.steelEdge)} {blacksmithUpgrades.steelEdge >= 2 ? 'MAX' : blacksmithUpgrades.steelEdge === 0 ? '80🪙 60🪨' : '160🪙 120🪨'}
                      </button>
                      <button
                        className="col-span-2 rounded border border-sky-700/70 bg-sky-950/20 px-2 py-2 text-xs text-sky-100 hover:bg-sky-900/40 disabled:opacity-40"
                        onClick={() => onBlacksmithUpgrade('ironHide')}
                        disabled={blacksmithUpgrades.ironHide >= 2 || (blacksmithUpgrades.ironHide === 0 ? resources.gold < 80 || resources.lumber < 50 : resources.gold < 160 || resources.lumber < 100)}
                        title={blacksmithUpgrades.ironHide >= 2 ? '🛡️ Iron Hide maxed (-4 dmg taken)' : blacksmithUpgrades.ironHide === 0 ? '🛡️ Iron Hide I — -2 dmg from grunts (80🪙 50🌲)' : '🛡️ Iron Hide II — -2 dmg from grunts (160🪙 100🌲)'}
                      >
                        🛡️ Iron Hide {'★'.repeat(blacksmithUpgrades.ironHide)}{'☆'.repeat(2 - blacksmithUpgrades.ironHide)} {blacksmithUpgrades.ironHide >= 2 ? 'MAX' : blacksmithUpgrades.ironHide === 0 ? '80🪙 50🌲' : '160🪙 100🌲'}
                      </button>
                    </>
                  )}
                  {hasBarracks && (
                    <button
                      className="col-span-2 rounded border border-rose-500/70 bg-rose-500/15 px-2 py-2 text-xs text-rose-100 hover:bg-rose-500/30 disabled:opacity-40"
                      onClick={() => onFarmhouseAction('trainSwordsman')}
                      disabled={resources.gold < 50 || resources.food >= resources.foodCap}
                      title="Train Swordsman — 50🪙, 80HP, +10 dmg, cannot harvest"
                    >
                      ⚔️ Train Swordsman 50🪙
                    </button>
                  )}
                  {hasBarracks && (
                    <button
                      className="col-span-2 rounded border border-yellow-400/70 bg-yellow-500/15 px-2 py-2 text-xs text-yellow-100 hover:bg-yellow-500/30 disabled:opacity-40"
                      onClick={onRecruitHero}
                      disabled={heroRecruited || resources.gold < 150 || resources.food >= resources.foodCap}
                      title={heroRecruited ? 'Barnabas already recruited (one hero per game)' : 'Recruit Barnabas — 150🪙, 150HP, +20 dmg, ⚡ Rallying Cry ability'}
                    >
                      {heroRecruited ? '🦸 Hero Recruited' : '🦸 Recruit Hero 150🪙'}
                    </button>
                  )}
                  {hasSiegeWorkshop && (
                    <button
                      className="col-span-2 rounded border border-orange-500/70 bg-orange-500/15 px-2 py-2 text-xs text-orange-100 hover:bg-orange-500/30 disabled:opacity-40"
                      onClick={() => onFarmhouseAction('trainCatapult')}
                      disabled={resources.gold < 150 || resources.lumber < 80 || resources.food >= resources.foodCap}
                      title="Train Catapult — 150🪙 80🌲, 60HP, AoE splash damage, slow"
                    >
                      🪨 Train Catapult 150🪙
                    </button>
                  )}
                  {(Object.keys(UPGRADE_META) as (keyof Upgrades)[]).map(key => {
                    const level = upgrades[key];
                    const maxed = level >= UPGRADE_MAX;
                    const cost = UPGRADE_COSTS[key][level];
                    const meta = UPGRADE_META[key];
                    const affordable = cost ? canAfford(cost) : false;
                    return (
                      <button
                        key={key}
                        className="rounded border border-purple-500/70 bg-purple-500/15 px-1 py-2 text-xs text-purple-100 hover:bg-purple-500/30 disabled:opacity-40"
                        disabled={maxed || !affordable}
                        onClick={() => onResearch(key)}
                        title={maxed ? `${meta.label} maxed` : cost ? `${meta.desc} · ${cost.gold > 0 ? cost.gold + '🪙' : ''}${cost.lumber > 0 ? cost.lumber + '🌲' : ''}${cost.stone > 0 ? cost.stone + '🪨' : ''}` : ''}
                      >
                        {meta.icon}{level > 0 && <span className="text-purple-300">{'★'.repeat(level)}</span>} {meta.label}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {buildMode && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-amber-300">Placing {buildingCosts[buildMode].label} — click map to place, Esc to cancel</span>
            </div>
          )}

          {!selectedType && !buildMode && (
            <div className="text-xs text-slate-500">Click a unit or barn · Ctrl+1-9: group · 1-9: recall · Right-click enemy barn to attack</div>
          )}
        </div>

        {/* Minimap + enemy HP */}
        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-3 text-amber-100">
          <div className="text-xs tracking-wide text-amber-300/90 uppercase">Status</div>
          <div className="mt-1 text-xs text-slate-400">Enemy Barn</div>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded bg-slate-700">
              <div className="h-2 rounded transition-all" style={{ width: `${hpPct(enemyBarnHp, enemyBarnMaxHp) * 100}%`, background: '#ef4444' }} />
            </div>
            <span className="text-xs text-red-300">{enemyBarnHp}/{enemyBarnMaxHp}</span>
          </div>
          <svg className="mt-1.5 h-10 w-full rounded border border-slate-700 bg-slate-800/80" viewBox={`0 0 ${13} ${13}`} preserveAspectRatio="xMidYMid meet">
            {/* Player barn */}
            <rect x={4 - 0.6} y={4 - 0.6} width={1.2} height={1.2} fill="#fbbf24" />
            {/* Enemy barn */}
            {minimapData.enemyBarnAlive && <rect x={10 - 0.6} y={10 - 0.6} width={1.2} height={1.2} fill="#ef4444" />}
            {/* Workers */}
            {minimapData.workers.map((w, i) => (
              <circle key={i} cx={w.x} cy={w.y} r={0.5} fill={w.selected ? '#38bdf8' : '#4ade80'} />
            ))}
            {/* Grunts */}
            {minimapData.grunts.map((g, i) => (
              <circle key={i} cx={g.x} cy={g.y} r={0.5} fill="#f97316" />
            ))}
          </svg>
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>Pop {resources.food}/{resources.foodCap}</span>
            {resources.food >= resources.foodCap && <span className="text-amber-400">⚠ Cap!</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
