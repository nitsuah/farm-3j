import React from 'react';

import {
  GUARD_TOWER_COST,
  VETERAN_TRAINING_COST,
  WAR_DRUMS_COST,
  UPGRADE_COSTS,
  UPGRADE_MAX,
  BLACKSMITH_STEEL_EDGE_COSTS,
  BLACKSMITH_IRON_HIDE_COSTS,
  WATCHTOWER_GARRISON_DAMAGE_PER,
} from '../game/constants';
import type {
  Upgrades,
  WorkerState,
  PlacedBuilding,
  Resources,
} from '../game/types';
import { canAfford } from './buildMenuHelpers';

const UPGRADE_META: Record<
  keyof Upgrades,
  { label: string; icon: string; desc: string }
> = {
  sharperTools: { label: 'Atk', icon: '⚔️', desc: '+5 attack dmg' },
  swiftHarvest: { label: 'Harvest', icon: '🌾', desc: '-200ms gather' },
  ironWill: { label: 'HP', icon: '🛡️', desc: '+25 max HP' },
};

export interface TechTabProps {
  resources: Resources;
  upgrades: Upgrades;
  hasWatchtower: boolean;
  hasBlacksmith: boolean;
  hasBarracks: boolean;
  guardTowerResearched: boolean;
  blacksmithUpgrades: { steelEdge: number; ironHide: number };
  barracksTech: { veteranTraining: boolean; warDrums: boolean };
  towerGarrison: Record<number, WorkerState[]>;
  placedBuildings: PlacedBuilding[];
  onResearch: (type: keyof Upgrades) => void;
  onGuardTower: () => void;
  onBlacksmithUpgrade: (type: 'steelEdge' | 'ironHide') => void;
  onBarracksTech: (type: 'veteranTraining' | 'warDrums') => void;
  onTowerDeploy: (towerId: number, tx: number, ty: number) => void;
}

export const TechTab: React.FC<TechTabProps> = ({
  resources,
  upgrades,
  hasWatchtower,
  hasBlacksmith,
  hasBarracks,
  guardTowerResearched,
  blacksmithUpgrades,
  barracksTech,
  towerGarrison,
  placedBuildings,
  onResearch,
  onGuardTower,
  onBlacksmithUpgrade,
  onBarracksTech,
  onTowerDeploy,
}) => (
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
            disabled={maxed || !cost || !canAfford(resources, cost)}
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
          resources.gold < GUARD_TOWER_COST.gold ||
          resources.stone < GUARD_TOWER_COST.stone
        }
        title={`Guard Tower — +7 dmg, +1 range on all watchtowers (${GUARD_TOWER_COST.gold}🪙 ${GUARD_TOWER_COST.stone}🪨)`}
      >
        {guardTowerResearched
          ? '🏰 Guard Tower ✓'
          : `🏰 Guard Tower ${GUARD_TOWER_COST.gold}🪙 ${GUARD_TOWER_COST.stone}🪨`}
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
              {upg === 'steelEdge' ? '⚔️ Steel' : '🛡️ Hide'} {'★'.repeat(lvl)}
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
            resources.gold < VETERAN_TRAINING_COST.gold ||
            resources.lumber < VETERAN_TRAINING_COST.lumber
          }
        >
          {barracksTech.veteranTraining
            ? '🛡️ Veteran ✓'
            : `🛡️ Veteran ${VETERAN_TRAINING_COST.gold}🪙 ${VETERAN_TRAINING_COST.lumber}🪵`}
        </button>
        <button
          type="button"
          className={`rounded border py-2.5 text-xs disabled:opacity-40 ${barracksTech.warDrums ? 'border-orange-500/40 bg-orange-900/20 text-orange-400' : 'border-orange-400/70 bg-orange-500/15 text-orange-100 hover:bg-orange-500/30'}`}
          onClick={() => onBarracksTech('warDrums')}
          disabled={
            barracksTech.warDrums ||
            resources.gold < WAR_DRUMS_COST.gold ||
            resources.lumber < WAR_DRUMS_COST.lumber
          }
        >
          {barracksTech.warDrums
            ? '🥁 War Drums ✓'
            : `🥁 Drums ${WAR_DRUMS_COST.gold}🪙 ${WAR_DRUMS_COST.lumber}🪵`}
        </button>
      </div>
    )}
    {hasWatchtower &&
      placedBuildings
        .filter(b => b.type === 'watchtower')
        .map(t => {
          const tg = towerGarrison[t.id] ?? [];
          if (tg.length === 0) return null;
          return (
            <div
              key={t.id}
              className="flex items-center justify-between rounded border border-cyan-700/50 bg-cyan-900/20 px-2 py-1.5 text-xs text-cyan-200"
            >
              <span>
                🗼 ({t.x},{t.y}) {tg.length}/3 +
                {tg.length * WATCHTOWER_GARRISON_DAMAGE_PER}dmg
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
        })}
  </div>
);
