import {
  HERO_ITEM_DATA,
  HERO_MAX_ITEMS,
  VETERAN_HP_BONUS,
  XP_TO_LEVEL_1,
  XP_TO_LEVEL_2,
  XP_TO_LEVEL_3,
} from '../game/constants';
import { tileDist } from '../game/map';
import type { RTSGameContext } from './context';

// Returns a stable tick function called each rAF frame by useGameLoop.
export function useCombatResolution(ctx: RTSGameContext): (dt: number) => void {
  const {
    addFloatingText,
    deadWorkerIdsRef,
    droppedItemsRef,
    heroItemsRef,
    pendingPickupRef,
    setDeadWorkerPositions,
    setDroppedItems,
    setHeroItems,
    setWorkers,
    workersRef,
  } = ctx;

  return (_dt: number) => {
    // Hero item auto-pickup (must run outside setWorkers updater to avoid nested setState)
    const heroForPickup = workersRef.current.find(
      w => w.unitType === 'hero' && w.hp > 0
    );
    if (heroForPickup) {
      const nearItem = droppedItemsRef.current.find(
        d =>
          !pendingPickupRef.current.has(d.id) &&
          tileDist(d.x, d.y, heroForPickup.x, heroForPickup.y) <= 1.0
      );
      if (nearItem) {
        const data = HERO_ITEM_DATA[nearItem.itemId];
        if (nearItem.itemId === 'tome_xp') {
          pendingPickupRef.current.add(nearItem.id);
          setWorkers(ws2 =>
            ws2.map(u => {
              if (u.unitType !== 'hero') return u;
              const newXp = u.xp + 80;
              const newLevel =
                newXp >= XP_TO_LEVEL_3
                  ? 3
                  : newXp >= XP_TO_LEVEL_2
                    ? 2
                    : newXp >= XP_TO_LEVEL_1
                      ? 1
                      : 0;
              if (newLevel > u.level) {
                addFloatingText(
                  Math.round(u.x),
                  Math.round(u.y),
                  `⭐ Level ${newLevel}!`,
                  '#fbbf24'
                );
                return {
                  ...u,
                  xp: newXp,
                  level: newLevel,
                  maxHp: u.maxHp + VETERAN_HP_BONUS,
                  hp: Math.min(
                    u.hp + VETERAN_HP_BONUS,
                    u.maxHp + VETERAN_HP_BONUS
                  ),
                };
              }
              return { ...u, xp: newXp };
            })
          );
          addFloatingText(
            Math.round(heroForPickup.x),
            Math.round(heroForPickup.y),
            `📖 +80 XP!`,
            '#c084fc'
          );
          setDroppedItems(ds => {
            pendingPickupRef.current.delete(nearItem.id);
            return ds.filter(d => d.id !== nearItem.id);
          });
        } else if (heroItemsRef.current.length < HERO_MAX_ITEMS) {
          pendingPickupRef.current.add(nearItem.id);
          setHeroItems(hi => [
            ...hi,
            { id: nearItem.id, itemId: nearItem.itemId },
          ]);
          setDroppedItems(ds => {
            pendingPickupRef.current.delete(nearItem.id);
            return ds.filter(d => d.id !== nearItem.id);
          });
          addFloatingText(
            Math.round(heroForPickup.x),
            Math.round(heroForPickup.y),
            `${data?.emoji} ${data?.name}!`,
            '#c084fc'
          );
        }
      }
    }

    // Detect newly dead workers and record corpse positions
    const now = Date.now();
    const newlyDead = workersRef.current.filter(
      w => w.hp <= 0 && !deadWorkerIdsRef.current.has(w.id)
    );
    if (newlyDead.length > 0) {
      newlyDead.forEach(w => deadWorkerIdsRef.current.add(w.id));
      setDeadWorkerPositions(prev => [
        ...prev.filter(p => now - p.t < 8000),
        ...newlyDead.map(w => ({
          x: Math.round(w.x),
          y: Math.round(w.y),
          t: now,
          unitType: w.unitType,
        })),
      ]);
    }
  };
}
