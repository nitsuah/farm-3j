import type { EnemyWarlord, HeroItemId } from '../../game/types';
import {
  BARN_POS,
  HERO_ITEM_DATA,
  WARLORD_DMG,
  WARLORD_GOLD_REWARD,
  WARLORD_SHIELD_BASH_COOLDOWN_MS,
  WARLORD_SHIELD_BASH_RANGE,
  WARLORD_SHIELD_BASH_STUN_MS,
  WARLORD_SPEED,
  WARLORD_WAR_CRY_COOLDOWN_MS,
  WARLORD_WAR_CRY_RADIUS,
  WARLORD_WAR_CRY_SLOW_MS,
} from '../../game/constants';
import { INITIAL_TILES, tileDist } from '../../game/map';
import { aStar } from '../../game/pathfinding';
import { ENEMY_VOICELINES, Snd, pickAck } from '../../game/sound';
import type { RTSGameContext } from '../context';

export function tickWarlords(ctx: RTSGameContext, dt: number): void {
  const {
    dropItemIdRef,
    placedBuildingsRef,
    workersRef,
    setEnemyWarlords,
    setResources,
    setDroppedItems,
    setWorkers,
    setPlayerBarnHp,
    addFloatingText,
    addDmgLog,
  } = ctx;

  // Update Enemy Warlords (War Cry slow AoE + Shield Bash hero stun + march to barn)
  setEnemyWarlords((wls: EnemyWarlord[]) => {
    const alive = wls.filter(wl => wl.hp > 0);
    const killed = wls.filter(wl => wl.hp <= 0);
    killed.forEach(wl => {
      setResources(r => ({ ...r, gold: r.gold + WARLORD_GOLD_REWARD }));
      addFloatingText(
        Math.round(wl.x),
        Math.round(wl.y),
        `⚔ +${WARLORD_GOLD_REWARD}🪙`,
        '#c4b5fd'
      );
      const wlDropPool: HeroItemId[] = ['battle_sword', 'boots_speed'];
      const wlDrop =
        wlDropPool[Math.floor(Math.random() * wlDropPool.length)]!;
      setDroppedItems(ds => [
        ...ds,
        {
          id: dropItemIdRef.current++,
          itemId: wlDrop,
          x: Math.round(wl.x),
          y: Math.round(wl.y),
        },
      ]);
      addFloatingText(
        Math.round(wl.x),
        Math.round(wl.y),
        `⚔ ${HERO_ITEM_DATA[wlDrop].emoji} Dropped!`,
        '#c084fc'
      );
    });
    const now = Date.now();
    return alive.map(wl => {
      // War Cry: slow all workers in radius
      if (now - wl.lastWarCryAt >= WARLORD_WAR_CRY_COOLDOWN_MS) {
        const slowUntil = now + WARLORD_WAR_CRY_SLOW_MS;
        setWorkers(ws =>
          ws.map(w => {
            if (
              w.hp <= 0 ||
              tileDist(w.x, w.y, wl.x, wl.y) > WARLORD_WAR_CRY_RADIUS
            )
              return w;
            addFloatingText(
              Math.round(w.x),
              Math.round(w.y),
              '🌀SLOWED!',
              '#a855f7'
            );
            return { ...w, stunUntil: slowUntil };
          })
        );
        Snd.warlordWarCry();
        addFloatingText(
          Math.round(wl.x),
          Math.round(wl.y),
          '📣 WAR CRY!',
          '#a855f7'
        );
        addFloatingText(
          Math.round(wl.x),
          Math.round(wl.y) - 1,
          pickAck(ENEMY_VOICELINES.warlord_warcry ?? []),
          '#c4b5fd'
        );
        return { ...wl, lastWarCryAt: now };
      }
      // Shield Bash: stun the closest hero within bash range
      if (now - wl.lastShieldBashAt >= WARLORD_SHIELD_BASH_COOLDOWN_MS) {
        const heroInRange = workersRef.current.find(
          w =>
            w.unitType === 'hero' &&
            w.hp > 0 &&
            tileDist(w.x, w.y, wl.x, wl.y) <= WARLORD_SHIELD_BASH_RANGE
        );
        if (heroInRange) {
          const stunUntil = now + WARLORD_SHIELD_BASH_STUN_MS;
          Snd.warlordShieldBash();
          setWorkers(ws =>
            ws.map(w => {
              if (w.id !== heroInRange.id) return w;
              addFloatingText(
                Math.round(w.x),
                Math.round(w.y),
                '🛡 SHIELD BASH!',
                '#ef4444'
              );
              return { ...w, stunUntil };
            })
          );
          addFloatingText(
            Math.round(wl.x),
            Math.round(wl.y) - 1,
            pickAck(ENEMY_VOICELINES.warlord_bash ?? []),
            '#c4b5fd'
          );
          return { ...wl, lastShieldBashAt: now };
        }
      }
      // Attack barn when adjacent
      const distToBarnWL = tileDist(wl.x, wl.y, BARN_POS.x, BARN_POS.y);
      if (distToBarnWL <= 1.2) {
        addDmgLog('⚔️ Warlord', WARLORD_DMG);
        setPlayerBarnHp(hp => Math.max(0, hp - WARLORD_DMG));
        addFloatingText(
          BARN_POS.x,
          BARN_POS.y,
          `-${WARLORD_DMG}🏰`,
          '#fca5a5'
        );
        return { ...wl, state: 'attacking' as const };
      }
      // March toward barn
      if (wl.movingTo) {
        const dx = wl.movingTo.x - wl.x,
          dy = wl.movingTo.y - wl.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.1) {
          const next = wl.path[0] ?? null;
          return {
            ...wl,
            x: wl.movingTo.x,
            y: wl.movingTo.y,
            movingTo: next,
            path: wl.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...wl,
          x: wl.x + (dx / dist) * Math.min(WARLORD_SPEED * dt, dist),
          y: wl.y + (dy / dist) * Math.min(WARLORD_SPEED * dt, dist),
          state: 'moving' as const,
        };
      }
      const wallSetWL = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const pWL = aStar(
        INITIAL_TILES,
        { x: Math.round(wl.x), y: Math.round(wl.y) },
        BARN_POS,
        true,
        wallSetWL
      );
      return { ...wl, movingTo: pWL[0] ?? BARN_POS, path: pWL.slice(1) };
    });
  });
}
