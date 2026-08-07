import React from 'react';

import { TRAIN_FARMER_COST } from '../game/constants';
import type { FarmhouseAction, Resources } from '../game/types';

export interface BaseTabProps {
  farmhouse: { built: boolean; level: number };
  farmhouseUpgradeCosts: { gold: number; lumber: number }[];
  resources: Resources;
  garrisonedCount: number;
  hasMarket: boolean;
  onFarmhouseAction: (action: FarmhouseAction) => void;
  onUngarrison: () => void;
}

export const BaseTab: React.FC<BaseTabProps> = ({
  farmhouse,
  farmhouseUpgradeCosts,
  resources,
  garrisonedCount,
  hasMarket,
  onFarmhouseAction,
  onUngarrison,
}) => (
  <div className="grid grid-cols-2 gap-1.5 pt-1">
    <button
      type="button"
      className="rounded border border-blue-500/70 bg-blue-500/15 py-2.5 text-xs text-blue-100 hover:bg-blue-500/30 disabled:opacity-40"
      onClick={() => onFarmhouseAction('train')}
      disabled={
        resources.gold < TRAIN_FARMER_COST ||
        resources.food >= resources.foodCap
      }
      title={
        resources.food >= resources.foodCap
          ? 'Food cap! Build Farmhouse'
          : `Train Farmer (${TRAIN_FARMER_COST}🪙)`
      }
    >
      🌾 Farmer {TRAIN_FARMER_COST}🪙{' '}
      <span className="text-xs opacity-50">[F]</span>
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
);
