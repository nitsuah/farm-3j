import React from 'react';

import {
  TRAIN_CAVALRY_COST,
  TRAIN_CATAPULT_COST,
  TRAIN_HERO_COST,
  TRAIN_QUEUE_MAX,
  TRAIN_SWORDSMAN_COST,
  TRAIN_TREBUCHET_COST,
} from '../game/constants';
import type { FarmhouseAction, Resources } from '../game/types';

export interface TrainTabProps {
  resources: Resources;
  hasBarracks: boolean;
  hasStable: boolean;
  hasSiegeWorkshop: boolean;
  trainingQueue: { type: 'swordsman' | 'cavalry' }[];
  trainingProgress: number;
  heroReviveCountdown: number;
  heroReviveCost: number;
  heroRecruited: boolean;
  onFarmhouseAction: (action: FarmhouseAction) => void;
  onInstantRevive: () => void;
  onRecruitHero: () => void;
}

export const TrainTab: React.FC<TrainTabProps> = ({
  resources,
  hasBarracks,
  hasStable,
  hasSiegeWorkshop,
  trainingQueue,
  trainingProgress,
  heroReviveCountdown,
  heroReviveCost,
  heroRecruited,
  onFarmhouseAction,
  onInstantRevive,
  onRecruitHero,
}) => (
  <div className="flex flex-col gap-1.5 pt-1">
    {(hasBarracks || hasStable) && trainingQueue.length > 0 && (
      <div className="rounded border border-slate-600/60 bg-slate-800/40 px-2 py-1.5">
        <div className="mb-1 flex items-center gap-1 text-xs text-slate-300">
          <span className="font-semibold">Queue</span>
          <span className="text-slate-500">
            ({trainingQueue.length}/{TRAIN_QUEUE_MAX})
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
            resources.gold < TRAIN_SWORDSMAN_COST ||
            resources.food >= resources.foodCap ||
            trainingQueue.length >= TRAIN_QUEUE_MAX
          }
          title={`Train Swordsman — ${TRAIN_SWORDSMAN_COST}🪙, 80HP, +10 dmg`}
        >
          <span>
            ⚔️ Swordsman <span className="opacity-50">[Q]</span>
          </span>
          <span className="mt-0.5 text-[10px] text-amber-300/80">
            {TRAIN_SWORDSMAN_COST}🪙
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
            resources.gold < TRAIN_CAVALRY_COST ||
            resources.food >= resources.foodCap ||
            trainingQueue.length >= TRAIN_QUEUE_MAX
          }
          title={`Train Cavalry — ${TRAIN_CAVALRY_COST}🪙, 2× speed`}
        >
          <span>
            🐴 Cavalry <span className="opacity-50">[R]</span>
          </span>
          <span className="mt-0.5 text-[10px] text-amber-300/80">
            {TRAIN_CAVALRY_COST}🪙
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
            resources.gold < TRAIN_CATAPULT_COST.gold ||
            resources.lumber < TRAIN_CATAPULT_COST.lumber ||
            resources.food >= resources.foodCap
          }
          title={`Train Catapult — ${TRAIN_CATAPULT_COST.gold}🪙 ${TRAIN_CATAPULT_COST.lumber}🌲, AoE 6-tile range`}
        >
          <span>🪨 Catapult</span>
          <span className="mt-0.5 text-[10px] text-amber-300/80">
            {TRAIN_CATAPULT_COST.gold}🪙 {TRAIN_CATAPULT_COST.lumber}🌲
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
            resources.gold < TRAIN_TREBUCHET_COST.gold ||
            resources.lumber < TRAIN_TREBUCHET_COST.lumber ||
            resources.stone < TRAIN_TREBUCHET_COST.stone ||
            resources.food >= resources.foodCap
          }
          title="Train Trebuchet — long-range siege"
        >
          <span>🏰 Trebuchet</span>
          <span className="mt-0.5 text-[10px] text-amber-300/80">
            {TRAIN_TREBUCHET_COST.gold}🪙 {TRAIN_TREBUCHET_COST.lumber}🌲{' '}
            {TRAIN_TREBUCHET_COST.stone}🪨
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
            resources.gold < TRAIN_HERO_COST ||
            resources.food >= resources.foodCap
          }
          title={
            heroRecruited
              ? 'Barnabas already recruited'
              : `Recruit Barnabas — ${TRAIN_HERO_COST}🪙`
          }
        >
          {heroRecruited
            ? '🦸 Hero Active'
            : `🦸 Recruit Hero ${TRAIN_HERO_COST}🪙`}
        </button>
      ))}
    {!hasBarracks && !hasStable && !hasSiegeWorkshop && (
      <div className="py-4 text-center text-xs text-slate-500">
        Build Barracks, Stable, or Siege Workshop to unlock military training
      </div>
    )}
  </div>
);
