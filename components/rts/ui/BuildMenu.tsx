import React, { useState } from 'react';

import type {
  Upgrades,
  WorkerState,
  FarmhouseAction,
  BuildingType,
  PlacedBuilding,
  BuildingCost,
  Resources,
} from '../game/types';
import { BaseTab } from './BaseTab';
import { BuildTab } from './BuildTab';
import { TechTab } from './TechTab';
import { TrainTab } from './TrainTab';

export interface BuildMenuProps {
  farmhouse: { built: boolean; level: number };
  farmhouseUpgradeCosts: { gold: number; lumber: number }[];
  resources: Resources;
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
      <div className="flex gap-0.5 border-b border-slate-700/60">
        {tabBtn('base', '🏚 Base')}
        {tabBtn('train', '⚔️ Train')}
        {tabBtn('build', '🏗 Build')}
        {tabBtn('tech', '🔬 Tech')}
      </div>
      {fhTab === 'base' && (
        <BaseTab
          farmhouse={farmhouse}
          farmhouseUpgradeCosts={farmhouseUpgradeCosts}
          resources={resources}
          garrisonedCount={garrisonedCount}
          hasMarket={hasMarket}
          onFarmhouseAction={onFarmhouseAction}
          onUngarrison={onUngarrison}
        />
      )}
      {fhTab === 'train' && (
        <TrainTab
          resources={resources}
          hasBarracks={hasBarracks}
          hasStable={hasStable}
          hasSiegeWorkshop={hasSiegeWorkshop}
          trainingQueue={trainingQueue}
          trainingProgress={trainingProgress}
          heroReviveCountdown={heroReviveCountdown}
          heroReviveCost={heroReviveCost}
          heroRecruited={heroRecruited}
          onFarmhouseAction={onFarmhouseAction}
          onInstantRevive={onInstantRevive}
          onRecruitHero={onRecruitHero}
        />
      )}
      {fhTab === 'build' && (
        <BuildTab
          farmhouse={farmhouse}
          resources={resources}
          buildingCosts={buildingCosts}
          placedBuildings={placedBuildings}
          onFarmhouseAction={onFarmhouseAction}
        />
      )}
      {fhTab === 'tech' && (
        <TechTab
          resources={resources}
          upgrades={upgrades}
          hasWatchtower={hasWatchtower}
          hasBlacksmith={hasBlacksmith}
          hasBarracks={hasBarracks}
          guardTowerResearched={guardTowerResearched}
          blacksmithUpgrades={blacksmithUpgrades}
          barracksTech={barracksTech}
          towerGarrison={towerGarrison}
          placedBuildings={placedBuildings}
          onResearch={onResearch}
          onGuardTower={onGuardTower}
          onBlacksmithUpgrade={onBlacksmithUpgrade}
          onBarracksTech={onBarracksTech}
          onTowerDeploy={onTowerDeploy}
        />
      )}
    </>
  );
};
