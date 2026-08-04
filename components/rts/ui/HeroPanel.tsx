import React from 'react';
import { HERO_ITEM_DATA } from './heroItemData';

export interface HeroPanelProps {
  heroLevel: number;
  heroAbilityCooldown: number;
  onHeroAbility: () => void;
  heroShoutCooldown: number;
  battleShoutActive: boolean;
  onBattleShout: () => void;
  harvestBoonCooldown: number;
  harvestBoonActive: boolean;
  onHarvestBoon: () => void;
  earthquakeCooldown: number;
  onEarthquake: () => void;
  heroItems: { id: number; itemId: string }[];
  onDropItem: (slotId: number) => void;
  onUsePotion: () => void;
}

/**
 * Renders hero ability buttons and hero item inventory slots.
 * Intended to be rendered inside the worker command card when the hero is selected.
 */
export const HeroPanel: React.FC<HeroPanelProps> = ({
  heroLevel,
  heroAbilityCooldown,
  onHeroAbility,
  heroShoutCooldown,
  battleShoutActive,
  onBattleShout,
  harvestBoonCooldown,
  harvestBoonActive,
  onHarvestBoon,
  earthquakeCooldown,
  onEarthquake,
  heroItems,
  onDropItem,
  onUsePotion,
}) => (
  <>
    {/* Hero ability buttons */}
    <button
      type="button"
      className={`col-span-3 rounded border py-2.5 text-xs font-semibold disabled:opacity-40 ${heroAbilityCooldown > 0 ? 'border-yellow-700/50 bg-yellow-900/20 text-yellow-600' : 'border-yellow-400 bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30'}`}
      onClick={onHeroAbility}
      disabled={heroAbilityCooldown > 0}
      title="Rallying Cry — AoE damage to all grunts within 3.5 tiles"
    >
      {heroAbilityCooldown > 0
        ? `⚡ Cry (${heroAbilityCooldown}s)`
        : '⚡ Rallying Cry'}
    </button>
    {heroLevel >= 2 ? (
      <button
        type="button"
        className={`col-span-3 rounded border py-2.5 text-xs font-semibold disabled:opacity-40 ${battleShoutActive ? 'border-orange-400 bg-orange-500/30 text-orange-200' : heroShoutCooldown > 0 ? 'border-orange-700/50 bg-orange-900/20 text-orange-600' : 'border-orange-400 bg-orange-500/20 text-orange-200 hover:bg-orange-500/30'}`}
        onClick={onBattleShout}
        disabled={heroShoutCooldown > 0 || battleShoutActive}
        title="Battle Shout — all nearby allies attack 40% faster for 8s"
      >
        {battleShoutActive
          ? '📯 Shouting...'
          : heroShoutCooldown > 0
            ? `📯 Shout ${heroShoutCooldown}s`
            : '📯 Battle Shout'}
      </button>
    ) : (
      <div className="col-span-3 rounded border border-slate-600/40 py-2.5 text-center text-xs text-slate-500">
        📯 Battle Shout (Lv2)
      </div>
    )}
    <button
      type="button"
      className={`col-span-3 rounded border py-2.5 text-xs font-semibold disabled:opacity-40 ${harvestBoonActive ? 'border-green-400 bg-green-500/30 text-green-200' : harvestBoonCooldown > 0 ? 'border-green-700/50 bg-green-900/20 text-green-600' : 'border-green-400 bg-green-500/20 text-green-200 hover:bg-green-500/30'}`}
      onClick={onHarvestBoon}
      disabled={harvestBoonCooldown > 0 || harvestBoonActive}
      title="Harvest Boon — all farmers gather 2× faster for 10s"
    >
      {harvestBoonActive
        ? '🌾 Boon! (active)'
        : harvestBoonCooldown > 0
          ? `🌾 Boon ${harvestBoonCooldown}s`
          : '🌾 Harvest Boon'}
    </button>
    {heroLevel >= 3 ? (
      <button
        type="button"
        className={`col-span-3 rounded border py-2.5 text-xs font-semibold disabled:opacity-40 ${earthquakeCooldown > 0 ? 'border-amber-700/50 bg-amber-900/20 text-amber-600' : 'border-amber-400 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'}`}
        onClick={onEarthquake}
        disabled={earthquakeCooldown > 0}
        title="Earthquake [E] — 45 dmg to all enemies in 5-tile radius + 2.5s stun"
      >
        {earthquakeCooldown > 0
          ? `🌋 Earthquake ${earthquakeCooldown}s`
          : '🌋 Earthquake [E]'}
      </button>
    ) : (
      <div className="col-span-3 rounded border border-slate-600/40 py-2.5 text-center text-xs text-slate-500">
        🌋 Earthquake (Lv3 — 280xp)
      </div>
    )}

    {/* Hero item inventory slots */}
    {heroItems.length > 0 && (
      <div className="col-span-3 mt-2 border-t border-slate-700/50 pt-2">
        <div className="mb-1 text-xs font-semibold text-violet-300">
          🎒 Items ({heroItems.length}/3)
        </div>
        <div className="grid grid-cols-3 gap-1">
          {heroItems.map(item => {
            const data = HERO_ITEM_DATA[item.itemId];
            if (!data) return null;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col items-center rounded border border-violet-500/40 bg-violet-900/20 p-1.5 text-center"
                title={`${data.name}\n${data.desc}\n${data.consumable ? 'Click to use' : 'Right-click to drop'}`}
              >
                <span className="text-lg leading-none">{data.emoji}</span>
                <span className="mt-0.5 text-[9px] leading-tight text-violet-200">
                  {data.name}
                </span>
                {data.consumable ? (
                  <button
                    onClick={
                      item.itemId === 'healing_potion'
                        ? onUsePotion
                        : undefined
                    }
                    className="mt-1 w-full rounded bg-violet-600/40 py-0.5 text-[9px] text-violet-100 hover:bg-violet-600/60 disabled:opacity-40"
                  >
                    Use
                  </button>
                ) : (
                  <button
                    onClick={() => onDropItem(item.id)}
                    className="mt-1 w-full rounded bg-slate-600/40 py-0.5 text-[9px] text-slate-300 hover:bg-slate-600/60"
                  >
                    Drop
                  </button>
                )}
              </div>
            );
          })}
          {Array.from({ length: 3 - heroItems.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex h-16 items-center justify-center rounded border border-dashed border-slate-700/50 text-xs text-slate-600"
            >
              —
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);
