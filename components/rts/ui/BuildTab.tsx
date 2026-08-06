import React from 'react';

import { LUMBER_SHED_BONUS_MS, BUILDING_REQUIRES } from '../game/constants';
import type {
  BuildingType,
  PlacedBuilding,
  BuildingCost,
  FarmhouseAction,
  Resources,
} from '../game/types';
import { canAfford, fmtCost } from './buildMenuHelpers';

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

const BUILDINGS: BEntry[] = [
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
    desc: '',
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

export interface BuildTabProps {
  farmhouse: { built: boolean };
  resources: Resources;
  buildingCosts: Record<BuildingType, BuildingCost>;
  placedBuildings: PlacedBuilding[];
  onFarmhouseAction: (action: FarmhouseAction) => void;
}

export const BuildTab: React.FC<BuildTabProps> = ({
  farmhouse,
  resources,
  buildingCosts,
  placedBuildings,
  onFarmhouseAction,
}) => {
  const builtTypes = new Set(
    placedBuildings.filter(b => !b.constructing).map(b => b.type)
  );
  if (farmhouse.built) builtTypes.add('farmhouse');

  return (
    <div className="grid grid-cols-3 gap-1.5 pt-1">
      {BUILDINGS.map(b => {
        const cost = buildingCosts[b.key];
        const affordable = canAfford(resources, cost);
        const reqType = BUILDING_REQUIRES[b.key as BuildingType];
        const prereqMet = !reqType || builtTypes.has(reqType);
        const reqLabel = reqType
          ? (buildingCosts[reqType]?.label ?? reqType)
          : '';
        const desc =
          b.key === 'granary'
            ? `+${buildingCosts.granary.foodCapBonus} pop`
            : b.desc;
        return (
          <button
            key={b.key}
            type="button"
            className={`flex flex-col items-center rounded border ${b.border} ${b.bg} ${b.hover} ${b.text} py-1.5 text-xs disabled:opacity-40`}
            onClick={() => onFarmhouseAction(`build:${b.key}`)}
            disabled={!affordable || !prereqMet}
            title={!prereqMet ? `🔒 Requires ${reqLabel}` : desc}
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
};
