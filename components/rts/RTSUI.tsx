import React from 'react';

// Keep in sync with RTSMap.tsx constants
const LUMBER_SHED_BONUS_MS = 200;
const MINIMAP_GRID = 17;
const MINIMAP_BARN = { x: 2, y: 2 };
const MINIMAP_ENEMY_BARN = { x: 14, y: 14 };

export interface WorkerState {
  id: number;
  x: number;
  y: number;
  selected: boolean;
  movingTo: null | { x: number; y: number };
  path: { x: number; y: number }[];
  gathering: null | { type: 'tree' | 'gold' | 'stone'; idx: number };
  attacking: null | { targetType: 'enemyBarn' } | { targetType: 'grunt'; gruntId: number } | { targetType: 'creep'; creepId: number } | { targetType: 'enemyTower'; towerId: number } | { targetType: 'siege'; siegeId: number } | { targetType: 'shaman'; shamanId: number } | { targetType: 'troll'; trollId: number } | { targetType: 'sapper'; sapperId: number } | { targetType: 'necromancer'; necromancerId: number } | { targetType: 'witchDoctor'; witchDoctorId: number } | { targetType: 'warchief'; warchiefId: number };
  stunUntil?: number;
  assistBuildId?: number;
  repairing: null | { buildingId: number };
  chargeCooldown: number;
  sprintCooldown: number;
  sprinting: boolean;
  waypoints: { x: number; y: number }[];
  attackMove: boolean;
  attackMoveTarget: { x: number; y: number } | null;
  carrying: { gold: number; lumber: number; stone: number };
  state: 'idle' | 'moving' | 'gathering' | 'returning' | 'attacking' | 'repairing';
  group: number | null;
  hp: number;
  maxHp: number;
  patrol: { a: { x: number; y: number }; b: { x: number; y: number }; heading: 'a' | 'b' } | null;
  holdPosition: boolean;
  unitType: 'farmer' | 'swordsman' | 'hero' | 'catapult' | 'cavalry' | 'trebuchet';
  xp: number;
  level: number;
}

export type BuildingType = 'farmhouse' | 'lumberShed' | 'watchtower' | 'wall' | 'windmill' | 'barracks' | 'siegeWorkshop' | 'market' | 'blacksmith' | 'granary' | 'stable' | 'spikeTrap' | 'frostTower' | 'ballista' | 'poisonTower';

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
  onBlacksmithUpgrade: (type: 'steelEdge' | 'ironHide') => void;
  hasStable: boolean;
  hasWatchtower: boolean;
  guardTowerResearched: boolean;
  onGuardTower: () => void;
  trainingQueue: {type: 'swordsman' | 'cavalry'}[];
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
  resources: { gold: number; lumber: number; stone: number; food: number; foodCap: number };
  placedBuildings: PlacedBuilding[];
  buildingCosts: Record<BuildingType, BuildingCost>;
  onFarmhouseAction: (action: string) => void;
  onWorkerCommand: (cmd: 'stop' | 'gather' | 'attack') => void;
  patrolMode: boolean;
  onPatrolCommand: () => void;
  onHoldPosition: () => void;
  buildMode: BuildingType | null;
  upgrades: Upgrades;
  onResearch: (type: keyof Upgrades) => void;
  stance: 'aggressive' | 'passive';
  onToggleStance: () => void;
  underAttack: boolean;
  incomeRate: { gold: number; lumber: number; stone: number };
  barracksTech: { veteranTraining: boolean; warDrums: boolean };
  onBarracksTech: (type: 'veteranTraining' | 'warDrums') => void;
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
  onTowerDeploy,
  placedBuildingsList,
  onSwordsmanCharge,
  onCavalrySprint,
  onMinimapClick,
  stance,
  onToggleStance,
  underAttack,
  incomeRate,
  barracksTech,
  onBarracksTech,
}) => {
  const isHeroSelected = selectedWorkers.some(w => w.unitType === 'hero');
  const heroLevel = selectedWorkers.find(w => w.unitType === 'hero')?.level ?? 0;
  const selectedCount = selectedWorkers.length;
  const firstWorker = selectedWorkers[0] ?? null;
  const anyFarmers = selectedWorkers.some(w => w.unitType === 'farmer');
  const allSwordsmen = selectedWorkers.length > 0 && selectedWorkers.every(w => w.unitType === 'swordsman');
  const allSameType = selectedWorkers.length > 0 && selectedWorkers.every(w => w.unitType === firstWorker?.unitType);

  const stateLabel = (w: WorkerState) => {
    if (w.patrol) return '🔄 Patrolling';
    if (w.state === 'idle') return 'Idle';
    if (w.state === 'moving') return 'Moving';
    if (w.state === 'gathering') return 'Gathering';
    if (w.state === 'returning') return 'Returning';
    if (w.state === 'attacking') return '⚔️ Attacking';
    if (w.state === 'repairing') return '🔧 Repairing';
    return w.state;
  };

  const canAfford = (cost: { gold: number; lumber: number; stone: number }) =>
    resources.gold >= cost.gold && resources.lumber >= cost.lumber && resources.stone >= cost.stone;

  const hpPct = (hp: number, max: number) => Math.max(0, hp / max);
  const hpColor = (pct: number) => pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#fbbf24' : '#ef4444';

  return (
    <div className="absolute bottom-0 left-0 z-30 w-full border-t-4 border-amber-600 bg-slate-950/95 px-2 py-2 md:px-4 md:py-3" style={{ maxHeight: '45vh', overflowY: 'auto' }}>
      <div className="grid h-full grid-cols-1 items-stretch gap-2 landscape:grid-cols-[160px_1fr_160px] md:grid-cols-[220px_1fr_220px] md:gap-3">
        {/* Unit / building info */}
        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-3 text-amber-100">
          <div className="text-xs tracking-wide text-amber-300/90 uppercase">
            {selectedType === 'farmhouse' ? 'Building' : 'Selection'}
          </div>
          {selectedType === 'worker' && firstWorker ? (
            <>
              <div className="mt-1 text-sm font-semibold">
                {firstWorker.unitType === 'hero' ? '🦸 Barnabas' : firstWorker.unitType === 'catapult' ? '🪨 Catapult' : firstWorker.unitType === 'trebuchet' ? '🏰 Trebuchet' : !allSameType ? '⚔️/🌾 Mixed' : firstWorker.unitType === 'cavalry' ? '🐴 Cavalry' : allSwordsmen ? '⚔️ Swordsman' : 'Farmer'}{selectedCount > 1 && firstWorker.unitType !== 'hero' ? ` ×${selectedCount}` : ''}
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
                    {!firstWorker.patrol && firstWorker.attacking ? ` → ${firstWorker.attacking.targetType === 'enemyBarn' ? 'enemy barn' : firstWorker.attacking.targetType === 'grunt' ? 'grunt' : firstWorker.attacking.targetType === 'shaman' ? 'shaman' : firstWorker.attacking.targetType === 'troll' ? 'troll archer' : firstWorker.attacking.targetType === 'sapper' ? 'sapper' : firstWorker.attacking.targetType === 'siege' ? 'siege engine' : firstWorker.attacking.targetType === 'enemyTower' ? 'enemy tower' : 'target'}` : ''}
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
              <div className="mt-0.5 text-xs text-yellow-400/80">🏰 Defense: 6 dmg / 3s (4-tile range)</div>
              {garrisonedCount > 0 && (
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-sky-300">🏰 {garrisonedCount} garrisoned · healing</span>
                  <button type="button" className="rounded border border-sky-500/60 bg-sky-900/30 px-1.5 py-0.5 text-xs text-sky-200 hover:bg-sky-500/30" onClick={onUngarrison}>🚪 Deploy</button>
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
        <div className="rounded border border-amber-700/60 bg-slate-900/80 p-2 md:p-3">
          <div className="mb-1 text-xs tracking-wide text-amber-300/90 uppercase md:mb-2">Commands</div>

          {selectedType === 'worker' && selectedCount > 0 && (
            <div className="grid grid-cols-4 gap-2">
              <button type="button" className="rounded border border-amber-500/70 bg-amber-500/15 px-2 py-2 text-xs text-amber-100 hover:bg-amber-500/30" title="Right-click tile to move">Move</button>
              {anyFarmers && (
                <button type="button" className="rounded border border-green-500/70 bg-green-500/15 px-2 py-2 text-xs text-green-100 hover:bg-green-500/30" title="Right-click resource node">Harvest</button>
              )}
              <button
                type="button"
                className={`rounded border border-red-500/70 bg-red-500/15 px-2 py-2 text-xs text-red-100 hover:bg-red-500/30 ${allSwordsmen ? 'col-span-2' : ''}`}
                onClick={() => onWorkerCommand('stop')}
              >
                Stop
              </button>
              {anyFarmers && (
                <button
                  type="button"
                  className="rounded border border-blue-500/70 bg-blue-500/15 px-2 py-2 text-xs text-blue-100 hover:bg-blue-500/30 disabled:opacity-40"
                  onClick={() => onFarmhouseAction('build:farmhouse')}
                  disabled={!canAfford(buildingCosts.farmhouse)}
                  title={`Farmhouse (${buildingCosts.farmhouse.gold}🪙 ${buildingCosts.farmhouse.lumber}🌲)`}
                >
                  Build
                </button>
              )}
              <button
                type="button"
                className="col-span-2 rounded border border-orange-500/70 bg-orange-500/15 px-2 py-2 text-xs text-orange-100 hover:bg-orange-500/30"
                onClick={() => onWorkerCommand('attack')}
                title="Right-click enemy building to attack"
              >
                ⚔️ Attack
              </button>
              <button
                type="button"
                className={`col-span-2 rounded border px-2 py-2 text-xs hover:opacity-90 ${patrolMode ? 'border-cyan-400 bg-cyan-500/30 text-cyan-100' : 'border-cyan-500/70 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/30'}`}
                onClick={onPatrolCommand}
                title="Patrol [P] — right-click two points to set patrol route"
              >
                {patrolMode ? '🔄 Set Patrol…' : '🔄 Patrol'}
              </button>
              <button
                type="button"
                className="col-span-2 rounded border border-yellow-500/70 bg-yellow-500/15 px-2 py-2 text-xs text-yellow-100 hover:bg-yellow-500/30"
                onClick={onHoldPosition}
                title="Hold Position [H] — stand still, auto-attack enemies in range without chasing"
              >
                🛡️ Hold [H]
              </button>
              <button
                type="button"
                className={`col-span-2 rounded border px-2 py-2 text-xs hover:opacity-90 ${stance === 'aggressive' ? 'border-red-400/70 bg-red-500/20 text-red-100' : 'border-slate-500/70 bg-slate-700/30 text-slate-300'}`}
                onClick={onToggleStance}
                title={stance === 'aggressive' ? 'Aggressive stance — units auto-engage nearby enemies. Click for Passive.' : 'Passive stance — units only retaliate when attacked. Click for Aggressive.'}
              >
                {stance === 'aggressive' ? '⚔️ Aggressive' : '🛡 Passive'}
              </button>
              <button
                type="button"
                className="col-span-2 rounded border border-sky-500/70 bg-sky-500/15 px-2 py-2 text-xs text-sky-100 hover:bg-sky-500/30 disabled:opacity-40"
                onClick={onGarrison}
                disabled={garrisonedCount >= garrisonCap}
                title={`Garrison in barn [right-click barn] — ${garrisonedCount}/${garrisonCap} slots · +5 HP/s heal · barn gains armor`}
              >
                🏰 Garrison ({garrisonedCount}/{garrisonCap})
              </button>
              {selectedWorkers.some(w => w.unitType === 'cavalry') && (() => {
                const sprintReady = selectedWorkers.some(w => w.unitType === 'cavalry' && w.sprintCooldown <= 0);
                const maxCd = Math.max(...selectedWorkers.filter(w => w.unitType === 'cavalry').map(w => w.sprintCooldown));
                const anySprinting = selectedWorkers.some(w => w.unitType === 'cavalry' && w.sprinting);
                return <button
                  type="button"
                  className={`col-span-4 rounded border px-2 py-2 text-xs font-semibold disabled:opacity-40 ${anySprinting ? 'border-amber-400 bg-amber-500/30 text-amber-100' : sprintReady ? 'border-amber-500/70 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30' : 'border-amber-800/50 bg-amber-900/20 text-amber-600'}`}
                  onClick={onCavalrySprint}
                  disabled={!sprintReady || anySprinting}
                  title="Sprint [S] — 2× speed for 5s; 20s cooldown; passive trample dmg while moving"
                >
                  {anySprinting ? '🐴 Sprinting! (trample active)' : sprintReady ? '🐴 Sprint [S] — 2× speed 5s' : `🐴 Sprint [S] — ${maxCd}s`}
                </button>;
              })()}
              {selectedWorkers.some(w => w.unitType === 'swordsman') && (() => {
                const chargeReady = selectedWorkers.some(w => w.unitType === 'swordsman' && w.chargeCooldown <= 0);
                const maxCd = Math.max(...selectedWorkers.filter(w => w.unitType === 'swordsman').map(w => w.chargeCooldown));
                return <button
                  type="button"
                  className={`col-span-4 rounded border px-2 py-2 text-xs font-semibold disabled:opacity-40 ${chargeReady ? 'border-red-400 bg-red-500/20 text-red-100 hover:bg-red-500/30' : 'border-red-800/50 bg-red-900/20 text-red-600'}`}
                  onClick={onSwordsmanCharge}
                  disabled={!chargeReady}
                  title="Charge [C] — instant 2× damage to nearest grunt; 12s cooldown"
                >
                  {chargeReady ? '⚡ Charge [C] — 2× dmg burst' : `⚡ Charge [C] — ${maxCd}s`}
                </button>;
              })()}
              {isHeroSelected && (<>
                <button
                  type="button"
                  className={`col-span-2 rounded border px-2 py-2 text-xs font-semibold disabled:opacity-40 ${heroAbilityCooldown > 0 ? 'border-yellow-700/50 bg-yellow-900/20 text-yellow-600' : 'border-yellow-400 bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30'}`}
                  onClick={onHeroAbility}
                  disabled={heroAbilityCooldown > 0}
                  title="Rallying Cry — AoE damage to all grunts within 3.5 tiles"
                >
                  {heroAbilityCooldown > 0 ? `⚡ Cry (${heroAbilityCooldown}s)` : '⚡ Rallying Cry'}
                </button>
                {heroLevel >= 2 ? (
                  <button
                    type="button"
                    className={`col-span-2 rounded border px-2 py-2 text-xs font-semibold disabled:opacity-40 ${battleShoutActive ? 'border-orange-400 bg-orange-500/30 text-orange-200' : heroShoutCooldown > 0 ? 'border-orange-700/50 bg-orange-900/20 text-orange-600' : 'border-orange-400 bg-orange-500/20 text-orange-200 hover:bg-orange-500/30'}`}
                    onClick={onBattleShout}
                    disabled={heroShoutCooldown > 0 || battleShoutActive}
                    title="Battle Shout — all nearby allies attack 40% faster for 8s (unlocked at hero level 2)"
                  >
                    {battleShoutActive ? '📯 Shouting...' : heroShoutCooldown > 0 ? `📯 Shout (${heroShoutCooldown}s)` : '📯 Battle Shout'}
                  </button>
                ) : (
                  <div className="col-span-2 rounded border border-slate-600/40 px-2 py-2 text-center text-xs text-slate-500" title="Reach hero level 2 to unlock Battle Shout">📯 Battle Shout (Lv2)</div>
                )}
                <button
                  type="button"
                  className={`col-span-2 rounded border px-2 py-2 text-xs font-semibold disabled:opacity-40 ${harvestBoonActive ? 'border-green-400 bg-green-500/30 text-green-200' : harvestBoonCooldown > 0 ? 'border-green-700/50 bg-green-900/20 text-green-600' : 'border-green-400 bg-green-500/20 text-green-200 hover:bg-green-500/30'}`}
                  onClick={onHarvestBoon}
                  disabled={harvestBoonCooldown > 0 || harvestBoonActive}
                  title="Harvest Boon — all farmers gather 2× faster for 10 seconds"
                >
                  {harvestBoonActive ? '🌾 Boon! (active)' : harvestBoonCooldown > 0 ? `🌾 Boon (${harvestBoonCooldown}s)` : '🌾 Harvest Boon'}
                </button>
              </>)}
            </div>
          )}

          {selectedType === 'farmhouse' && (
            <div className="grid grid-cols-4 gap-2">
              {!farmhouse.built ? (
                <button
                  type="button"
                  className="col-span-2 rounded border border-amber-500/70 bg-amber-500/15 px-2 py-2 text-xs text-amber-100 hover:bg-amber-500/30 disabled:opacity-40"
                  onClick={() => onFarmhouseAction('build')}
                  disabled={resources.gold < (farmhouseUpgradeCosts[0]?.gold ?? 0) || resources.lumber < (farmhouseUpgradeCosts[0]?.lumber ?? 0)}
                >
                  Build ({farmhouseUpgradeCosts[0]?.gold}🪙 {farmhouseUpgradeCosts[0]?.lumber}🌲)
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="rounded border border-blue-500/70 bg-blue-500/15 px-2 py-2 text-xs text-blue-100 hover:bg-blue-500/30 disabled:opacity-40"
                    onClick={() => onFarmhouseAction('train')}
                    disabled={resources.gold < 30 || resources.food >= resources.foodCap}
                    title={resources.food >= resources.foodCap ? 'Food cap! Build Farmhouse' : 'Train Farmer (30🪙)'}
                  >
                    Train 30🪙 <span className="opacity-50">[F]</span>
                  </button>
                  {farmhouse.level < farmhouseUpgradeCosts.length && (
                    <button
                      type="button"
                      className="rounded border border-amber-500/70 bg-amber-500/15 px-2 py-2 text-xs text-amber-100 hover:bg-amber-500/30 disabled:opacity-40"
                      onClick={() => onFarmhouseAction('upgrade')}
                      disabled={resources.gold < (farmhouseUpgradeCosts[farmhouse.level]?.gold ?? 0) || resources.lumber < (farmhouseUpgradeCosts[farmhouse.level]?.lumber ?? 0)}
                    >
                      Upgrade
                    </button>
                  )}
                  <button type="button" className="rounded border border-green-500/70 bg-green-500/15 px-2 py-2 text-xs text-green-100 hover:bg-green-500/30 disabled:opacity-40" onClick={() => onFarmhouseAction('build:farmhouse')} disabled={!canAfford(buildingCosts.farmhouse)} title="+5 food cap">🏠 Farm</button>
                  <button type="button" className="rounded border border-slate-500/70 bg-slate-500/15 px-2 py-2 text-xs text-slate-100 hover:bg-slate-500/30 disabled:opacity-40" onClick={() => onFarmhouseAction('build:watchtower')} disabled={!canAfford(buildingCosts.watchtower)} title="Expands vision">🗼 Tower</button>
                  <button type="button" className="rounded border border-yellow-700/70 bg-yellow-900/20 px-2 py-2 text-xs text-yellow-100 hover:bg-yellow-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:lumberShed')} disabled={!canAfford(buildingCosts.lumberShed)} title={`Lumber Shed — -${LUMBER_SHED_BONUS_MS}ms lumber gather per shed`}>🪵 Shed</button>
                  <button type="button" className="rounded border border-amber-700/70 bg-amber-900/20 px-2 py-2 text-xs text-amber-100 hover:bg-amber-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:wall')} disabled={!canAfford(buildingCosts.wall)} title="Palisade Wall — blocks enemy grunts">🧱 Wall</button>
                  <button type="button" className="rounded border border-lime-600/70 bg-lime-900/20 px-2 py-2 text-xs text-lime-100 hover:bg-lime-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:windmill')} disabled={!canAfford(buildingCosts.windmill)} title="Windmill — +2🪙 every 5s">💨 Mill</button>
                  <button type="button" className="rounded border border-red-700/70 bg-red-900/20 px-2 py-2 text-xs text-red-100 hover:bg-red-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:barracks')} disabled={!canAfford(buildingCosts.barracks)} title="Barracks — train Swordsmen">🏯 Barracks</button>
                  <button type="button" className="rounded border border-orange-600/70 bg-orange-900/20 px-2 py-2 text-xs text-orange-100 hover:bg-orange-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:siegeWorkshop')} disabled={!canAfford(buildingCosts.siegeWorkshop)} title={`Siege Workshop — train Catapults (${buildingCosts.siegeWorkshop.gold}🪙 ${buildingCosts.siegeWorkshop.lumber}🌲 ${buildingCosts.siegeWorkshop.stone}🪨)`}>⚙️ Siege</button>
                  <button type="button" className="rounded border border-emerald-600/70 bg-emerald-900/20 px-2 py-2 text-xs text-emerald-100 hover:bg-emerald-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:market')} disabled={!canAfford(buildingCosts.market)} title={`Market — trade lumber for gold (${buildingCosts.market.gold}🪙 ${buildingCosts.market.lumber}🌲 ${buildingCosts.market.stone}🪨)`}>🏪 Market</button>
                  <button type="button" className="rounded border border-red-800/70 bg-red-950/30 px-2 py-2 text-xs text-red-100 hover:bg-red-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:blacksmith')} disabled={!canAfford(buildingCosts.blacksmith)} title={`Blacksmith — upgrade unit attack and armor (${buildingCosts.blacksmith.gold}🪙 ${buildingCosts.blacksmith.lumber}🌲 ${buildingCosts.blacksmith.stone}🪨)`}>🔨 Smith</button>
                  <button type="button" className="rounded border border-yellow-600/70 bg-yellow-900/20 px-2 py-2 text-xs text-yellow-100 hover:bg-yellow-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:granary')} disabled={!canAfford(buildingCosts.granary)} title={`Granary — +${buildingCosts.granary.foodCapBonus} population cap (${buildingCosts.granary.gold}🪙 ${buildingCosts.granary.lumber}🌲 ${buildingCosts.granary.stone}🪨)`}>🌾 Granary</button>
                  <button type="button" className="rounded border border-amber-500/70 bg-amber-900/20 px-2 py-2 text-xs text-amber-100 hover:bg-amber-900/40 disabled:opacity-40" onClick={() => onFarmhouseAction('build:stable')} disabled={!canAfford(buildingCosts.stable)} title={`Stable — train fast Cavalry units (${buildingCosts.stable.gold}🪙 ${buildingCosts.stable.lumber}🌲 ${buildingCosts.stable.stone}🪨)`}>🐴 Stable</button>
                  {hasMarket && (
                    <>
                      <button
                        type="button"
                        className="col-span-2 rounded border border-yellow-500/70 bg-yellow-900/20 px-2 py-2 text-xs text-yellow-100 hover:bg-yellow-900/40 disabled:opacity-40"
                        onClick={() => onFarmhouseAction('trade:lumberToGold')}
                        disabled={resources.lumber < 50}
                        title="Sell 50🌲 for 30🪙 at the Market"
                      >
                        🏪 Sell 50🌲 → 30🪙
                      </button>
                      <button
                        type="button"
                        className="col-span-2 rounded border border-yellow-500/70 bg-yellow-900/20 px-2 py-2 text-xs text-yellow-100 hover:bg-yellow-900/40 disabled:opacity-40"
                        onClick={() => onFarmhouseAction('trade:stoneToGold')}
                        disabled={resources.stone < 30}
                        title="Sell 30🪨 for 20🪙 at the Market"
                      >
                        🏪 Sell 30🪨 → 20🪙
                      </button>
                      <button
                        type="button"
                        className="col-span-2 rounded border border-green-600/70 bg-green-900/20 px-2 py-2 text-xs text-green-100 hover:bg-green-900/40 disabled:opacity-40"
                        onClick={() => onFarmhouseAction('trade:stoneToLumber')}
                        disabled={resources.stone < 40}
                        title="Convert 40🪨 stone to 25🌲 lumber at the Market"
                      >
                        🏪 Convert 40🪨 → 25🌲
                      </button>
                    </>
                  )}
                  {hasBlacksmith && (
                    <>
                      <button
                        type="button"
                        className="col-span-2 rounded border border-red-700/70 bg-red-950/20 px-2 py-2 text-xs text-red-100 hover:bg-red-900/40 disabled:opacity-40"
                        onClick={() => onBlacksmithUpgrade('steelEdge')}
                        disabled={blacksmithUpgrades.steelEdge >= 2 || (blacksmithUpgrades.steelEdge === 0 ? resources.gold < 80 || resources.stone < 60 : resources.gold < 160 || resources.stone < 120)}
                        title={blacksmithUpgrades.steelEdge >= 2 ? '⚔️ Steel Edge maxed (+10 atk)' : blacksmithUpgrades.steelEdge === 0 ? '⚔️ Steel Edge I — +5 atk dmg all units (80🪙 60🪨)' : '⚔️ Steel Edge II — +5 atk dmg all units (160🪙 120🪨)'}
                      >
                        ⚔️ Steel Edge {'★'.repeat(blacksmithUpgrades.steelEdge)}{'☆'.repeat(2 - blacksmithUpgrades.steelEdge)} {blacksmithUpgrades.steelEdge >= 2 ? 'MAX' : blacksmithUpgrades.steelEdge === 0 ? '80🪙 60🪨' : '160🪙 120🪨'}
                      </button>
                      <button
                        type="button"
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
                      type="button"
                      className="col-span-2 rounded border border-rose-500/70 bg-rose-500/15 px-2 py-2 text-xs text-rose-100 hover:bg-rose-500/30 disabled:opacity-40"
                      onClick={() => onFarmhouseAction('trainSwordsman')}
                      disabled={resources.gold < 50 || resources.food >= resources.foodCap || trainingQueue.length >= 5}
                      title="Train Swordsman — 50🪙, 80HP, +10 dmg, cannot harvest; queued (max 5)"
                    >
                      ⚔️ Train Swordsman 50🪙 <span className="opacity-50">[Q]</span>
                    </button>
                  )}
                  {hasBarracks && (
                    <button
                      type="button"
                      className="col-span-2 rounded border border-yellow-400/70 bg-yellow-500/15 px-2 py-2 text-xs text-yellow-100 hover:bg-yellow-500/30 disabled:opacity-40"
                      onClick={onRecruitHero}
                      disabled={heroRecruited || resources.gold < 150 || resources.food >= resources.foodCap}
                      title={heroRecruited ? 'Barnabas already recruited (one hero per game)' : 'Recruit Barnabas — 150🪙, 150HP, +20 dmg, ⚡ Rallying Cry ability'}
                    >
                      {heroRecruited ? '🦸 Hero Recruited' : '🦸 Recruit Hero 150🪙'}
                    </button>
                  )}
                  {hasStable && (
                    <button
                      type="button"
                      className="col-span-2 rounded border border-amber-500/70 bg-amber-500/15 px-2 py-2 text-xs text-amber-100 hover:bg-amber-500/30 disabled:opacity-40"
                      onClick={() => onFarmhouseAction('trainCavalry')}
                      disabled={resources.gold < 60 || resources.food >= resources.foodCap || trainingQueue.length >= 5}
                      title="Train Cavalry — 60🪙, 65HP, 2× speed, +8 dmg, cannot harvest; queued (max 5)"
                    >
                      🐴 Train Cavalry 60🪙 <span className="opacity-50">[R]</span>
                    </button>
                  )}
                  {hasBarracks && (
                    <div className="col-span-4 border-t border-slate-700/50 pt-2">
                      <div className="mb-1.5 text-xs font-semibold text-slate-400">⚗️ Barracks Research</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          className={`rounded border px-2 py-1.5 text-xs font-semibold disabled:opacity-40 ${barracksTech.veteranTraining ? 'border-red-500/40 bg-red-900/20 text-red-400 cursor-default' : 'border-red-400/70 bg-red-500/15 text-red-100 hover:bg-red-500/30'}`}
                          onClick={() => onBarracksTech('veteranTraining')}
                          disabled={barracksTech.veteranTraining || resources.gold < 100 || resources.lumber < 60}
                          title="Veteran Training — all combat units gain +20 max HP permanently (100🪙 60🌲)"
                        >
                          {barracksTech.veteranTraining ? '🛡️ Veteran ✓' : `🛡️ Vet. Train 100🪙60🌲`}
                        </button>
                        <button
                          type="button"
                          className={`rounded border px-2 py-1.5 text-xs font-semibold disabled:opacity-40 ${barracksTech.warDrums ? 'border-orange-500/40 bg-orange-900/20 text-orange-400 cursor-default' : 'border-orange-400/70 bg-orange-500/15 text-orange-100 hover:bg-orange-500/30'}`}
                          onClick={() => onBarracksTech('warDrums')}
                          disabled={barracksTech.warDrums || resources.gold < 120 || resources.lumber < 40}
                          title="War Drums — all friendly combat units deal +8 damage permanently (120🪙 40🌲)"
                        >
                          {barracksTech.warDrums ? '🥁 War Drums ✓' : `🥁 War Drums 120🪙40🌲`}
                        </button>
                      </div>
                    </div>
                  )}
                  {(hasBarracks || hasStable) && trainingQueue.length > 0 && (
                    <div className="col-span-4 rounded border border-slate-600/60 bg-slate-800/40 px-2 py-1.5">
                      <div className="mb-1 flex items-center gap-1 text-xs text-slate-300">
                        <span className="font-semibold">Training Queue</span>
                        <span className="text-slate-500">({trainingQueue.length}/5)</span>
                      </div>
                      <div className="mb-1.5 h-1.5 w-full rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${trainingProgress * 100}%` }} />
                      </div>
                      <div className="flex gap-1">
                        {trainingQueue.map((u, i) => (
                          <span key={i} title={u.type} className={`rounded px-1 py-0.5 text-sm ${i === 0 ? 'bg-emerald-700/40 text-emerald-200' : 'bg-slate-700/60 text-slate-400'}`}>
                            {u.type === 'swordsman' ? '⚔️' : '🐴'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasSiegeWorkshop && (
                    <button
                      type="button"
                      className="col-span-2 rounded border border-orange-500/70 bg-orange-500/15 px-2 py-2 text-xs text-orange-100 hover:bg-orange-500/30 disabled:opacity-40"
                      onClick={() => onFarmhouseAction('trainCatapult')}
                      disabled={resources.gold < 150 || resources.lumber < 80 || resources.food >= resources.foodCap}
                      title="Train Catapult — 150🪙 80🌲, 60HP, AoE splash vs grunts, 6-tile range"
                    >
                      🪨 Train Catapult 150🪙
                    </button>
                  )}
                  {hasSiegeWorkshop && (
                    <button
                      type="button"
                      className="col-span-2 rounded border border-yellow-700/70 bg-yellow-900/20 px-2 py-2 text-xs text-yellow-100 hover:bg-yellow-900/40 disabled:opacity-40"
                      onClick={() => onFarmhouseAction('trainTrebuchet')}
                      disabled={resources.gold < 200 || resources.lumber < 80 || resources.stone < 60 || resources.food >= resources.foodCap}
                      title="Train Trebuchet — 200🪙 80🌲 60🪨, 45HP, auto-fires at enemy barn &amp; towers from 9-tile range, min 2.5-tile range"
                    >
                      🏰 Train Trebuchet 200🪙
                    </button>
                  )}
                  {hasWatchtower && (
                    <button
                      type="button"
                      className={`col-span-4 rounded border px-2 py-2 text-xs disabled:opacity-40 ${guardTowerResearched ? 'border-cyan-500/50 bg-cyan-900/20 text-cyan-400' : 'border-cyan-500/70 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/30'}`}
                      onClick={onGuardTower}
                      disabled={guardTowerResearched || resources.gold < 120 || resources.stone < 80}
                      title="Guard Tower — upgrades all watchtowers: +7 dmg, +1 range (5→6)"
                    >
                      {guardTowerResearched ? '🏰 Guard Tower ✓ (active)' : '🏰 Guard Tower 120🪙 80🪨 — upgrade all towers'}
                    </button>
                  )}
                  {hasWatchtower && (() => {
                    const towers = placedBuildingsList.filter(b => b.type === 'watchtower');
                    return towers.map(t => {
                      const tg = towerGarrison[t.id] ?? [];
                      if (tg.length === 0) return null;
                      return <div key={t.id} className="col-span-4 flex items-center justify-between rounded border border-cyan-700/50 bg-cyan-900/20 px-2 py-1 text-xs text-cyan-200">
                        <span>🗼 Tower ({t.x},{t.y}): {tg.length}/3 garrisoned +{tg.length*4}dmg +{(tg.length*0.5).toFixed(1)}rng</span>
                        <button type="button" className="ml-2 rounded bg-cyan-800/40 px-2 py-0.5 text-cyan-100 hover:bg-cyan-700/50" onClick={() => onTowerDeploy(t.id, t.x, t.y)}>🚪 Deploy</button>
                      </div>;
                    });
                  })()}
                  <button
                    type="button"
                    className="col-span-2 rounded border border-yellow-700/70 bg-yellow-900/20 px-2 py-2 text-xs text-yellow-200 hover:bg-yellow-800/30 disabled:opacity-40"
                    onClick={() => onFarmhouseAction('build:spikeTrap')}
                    disabled={!canAfford(buildingCosts.spikeTrap)}
                    title={`Spike Trap — ${buildingCosts.spikeTrap.gold}🪙 ${buildingCosts.spikeTrap.lumber}🌲 ${buildingCosts.spikeTrap.stone}🪨 | Deals 20 dmg to grunts that step on it; 30s cooldown per trap`}
                  >
                    🪤 Spike Trap {buildingCosts.spikeTrap.gold}🪙
                  </button>
                  <button
                    type="button"
                    className="col-span-2 rounded border border-cyan-700/70 bg-cyan-900/20 px-2 py-2 text-xs text-cyan-200 hover:bg-cyan-800/30 disabled:opacity-40"
                    onClick={() => onFarmhouseAction('build:frostTower')}
                    disabled={!canAfford(buildingCosts.frostTower)}
                    title={`Frost Tower — ${buildingCosts.frostTower.gold}🪙 ${buildingCosts.frostTower.lumber}🌲 ${buildingCosts.frostTower.stone}🪨 | Slows enemies 50% for 3s and deals 5 dmg; 4.5-tile range every 2.5s`}
                  >
                    ❄️ Frost Tower {buildingCosts.frostTower.gold}🪙
                  </button>
                  <button
                    type="button"
                    className="col-span-2 rounded border border-yellow-700/70 bg-yellow-900/20 px-2 py-2 text-xs text-yellow-200 hover:bg-yellow-800/30 disabled:opacity-40"
                    onClick={() => onFarmhouseAction('build:ballista')}
                    disabled={!canAfford(buildingCosts.ballista)}
                    title={`Ballista Tower — ${buildingCosts.ballista.gold}🪙 ${buildingCosts.ballista.lumber}🌲 ${buildingCosts.ballista.stone}🪨 | Piercing bolt: ${buildingCosts.ballista.gold ? '18' : '18'} dmg in 6.5-tile range, pierce nearby for 9 dmg every 4s`}
                  >
                    🏹 Ballista {buildingCosts.ballista.gold}🪙
                  </button>
                  <button
                    type="button"
                    className="rounded border border-green-500/70 bg-green-500/15 px-1 py-2 text-xs text-green-100 hover:bg-green-500/30 disabled:opacity-40"
                    onClick={() => onFarmhouseAction('build:poisonTower')}
                    disabled={!canAfford(buildingCosts.poisonTower)}
                    title={`Poison Tower — ${buildingCosts.poisonTower.gold}🪙 ${buildingCosts.poisonTower.lumber}🌲 ${buildingCosts.poisonTower.stone}🪨 | Fires poison arrow: 8 dmg + 3 dmg/s for 4s; 5-tile range every 3s`}
                  >
                    ☠️ Poison {buildingCosts.poisonTower.gold}🪙
                  </button>
                  {(Object.keys(UPGRADE_META) as (keyof Upgrades)[]).map(key => {
                    const level = upgrades[key];
                    const maxed = level >= UPGRADE_MAX;
                    const cost = UPGRADE_COSTS[key][level];
                    const meta = UPGRADE_META[key];
                    const affordable = cost ? canAfford(cost) : false;
                    return (
                      <button
                        type="button"
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
          <svg className="mt-1.5 h-16 w-full cursor-crosshair rounded border border-slate-700 bg-slate-800/80" viewBox={`0 0 ${MINIMAP_GRID} ${MINIMAP_GRID}`} preserveAspectRatio="xMidYMid meet" onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); const tx = Math.round(((e.clientX - rect.left) / rect.width) * MINIMAP_GRID); const ty = Math.round(((e.clientY - rect.top) / rect.height) * MINIMAP_GRID); onMinimapClick(tx, ty); }}>
            {/* Resource nodes */}
            {minimapData.treeNodes.map((n, i) => (
              <rect key={`t${i}`} x={n.x - 0.35} y={n.y - 0.35} width={0.7} height={0.7} fill="#15803d" opacity={0.7} />
            ))}
            {minimapData.goldNodes.map((n, i) => (
              <rect key={`g${i}`} x={n.x - 0.35} y={n.y - 0.35} width={0.7} height={0.7} fill="#ca8a04" opacity={0.7} />
            ))}
            {minimapData.stoneNodes.map((n, i) => (
              <rect key={`s${i}`} x={n.x - 0.35} y={n.y - 0.35} width={0.7} height={0.7} fill="#6b7280" opacity={0.7} />
            ))}
            {/* Creep camps (not cleared) */}
            {minimapData.creepCamps.filter(c => !c.cleared).map((c, i) => (
              <g key={`cc${i}`}>
                <line x1={c.x - 0.5} y1={c.y - 0.5} x2={c.x + 0.5} y2={c.y + 0.5} stroke="#a855f7" strokeWidth={0.4} />
                <line x1={c.x + 0.5} y1={c.y - 0.5} x2={c.x - 0.5} y2={c.y + 0.5} stroke="#a855f7" strokeWidth={0.4} />
              </g>
            ))}
            {/* Player buildings */}
            {minimapData.buildings.map((b, i) => (
              <rect key={`b${i}`} x={b.x - 0.45} y={b.y - 0.45} width={0.9} height={0.9} fill="#f59e0b" opacity={0.85} rx={0.15} />
            ))}
            {/* Player barn */}
            <rect x={MINIMAP_BARN.x - 0.7} y={MINIMAP_BARN.y - 0.7} width={1.4} height={1.4} fill="#fbbf24" rx={0.2} />
            {/* Enemy barn */}
            {minimapData.enemyBarnAlive && <rect x={MINIMAP_ENEMY_BARN.x - 0.7} y={MINIMAP_ENEMY_BARN.y - 0.7} width={1.4} height={1.4} fill="#ef4444" rx={0.2} />}
            {/* Enemy fortress towers */}
            {minimapData.enemyTowers.map((t, i) => (
              <rect key={`et${i}`} x={t.x - 0.45} y={t.y - 0.45} width={0.9} height={0.9} fill="#dc2626" opacity={0.9} rx={0.1} />
            ))}
            {/* Workers */}
            {minimapData.workers.map((w, i) => (
              <circle key={i} cx={w.x} cy={w.y} r={0.55} fill={w.selected ? '#38bdf8' : '#4ade80'} />
            ))}
            {/* Grunts */}
            {minimapData.grunts.map((g, i) => (
              <circle key={i} cx={g.x} cy={g.y} r={0.55} fill="#f97316" />
            ))}
            {/* War Rams */}
            {minimapData.warRams.map((r, i) => (
              <rect key={`ram${i}`} x={r.x - 0.7} y={r.y - 0.5} width={1.4} height={1} fill="#7c2d12" stroke="#dc2626" strokeWidth={0.2} rx={0.15} />
            ))}
            {/* Shamans */}
            {minimapData.shamans.map((s, i) => (
              <circle key={`shaman${i}`} cx={s.x} cy={s.y} r={0.6} fill="#4ade80" stroke="#166534" strokeWidth={0.2} />
            ))}
            {/* Troll Archers */}
            {minimapData.trolls.map((t, i) => (
              <polygon key={`troll${i}`} points={`${t.x},${t.y - 0.8} ${t.x + 0.7},${t.y + 0.5} ${t.x - 0.7},${t.y + 0.5}`} fill="#f97316" stroke="#7c2d12" strokeWidth={0.15} />
            ))}
            {/* Goblin Sappers — red X */}
            {minimapData.sappers.map((s, i) => (
              <g key={`sapper${i}`}>
                <line x1={s.x - 0.6} y1={s.y - 0.6} x2={s.x + 0.6} y2={s.y + 0.6} stroke="#dc2626" strokeWidth={0.35} />
                <line x1={s.x + 0.6} y1={s.y - 0.6} x2={s.x - 0.6} y2={s.y + 0.6} stroke="#dc2626" strokeWidth={0.35} />
              </g>
            ))}
            {/* Witch Doctors — magenta diamond */}
            {minimapData.witchDoctors.map((d, i) => (
              <polygon key={`wd${i}`} points={`${d.x},${d.y - 0.8} ${d.x + 0.7},${d.y} ${d.x},${d.y + 0.8} ${d.x - 0.7},${d.y}`} fill="#e879f9" stroke="#7e22ce" strokeWidth={0.15} />
            ))}
            {/* Warchief — gold star */}
            {minimapData.warchiefs.map((wc2, i) => (
              <polygon key={`warchief${i}`} points={`${wc2.x},${wc2.y - 1} ${wc2.x + 0.35},${wc2.y - 0.3} ${wc2.x + 1},${wc2.y - 0.3} ${wc2.x + 0.5},${wc2.y + 0.2} ${wc2.x + 0.65},${wc2.y + 1} ${wc2.x},${wc2.y + 0.6} ${wc2.x - 0.65},${wc2.y + 1} ${wc2.x - 0.5},${wc2.y + 0.2} ${wc2.x - 1},${wc2.y - 0.3} ${wc2.x - 0.35},${wc2.y - 0.3}`} fill="#f59e0b" stroke="#d97706" strokeWidth={0.1} />
            ))}
          </svg>
          <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-slate-500">
            <span><span className="inline-block h-1.5 w-1.5 rounded-full bg-green-600 align-middle" /> trees</span>
            <span><span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-600 align-middle" /> gold</span>
            <span><span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-500 align-middle" /> stone</span>
            <span><span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 align-middle" /> buildings</span>
            <span className="text-purple-400">✕ creeps</span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>Pop {resources.food}/{resources.foodCap}</span>
            {resources.food >= resources.foodCap && <span className="text-amber-400">⚠ Cap!</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
