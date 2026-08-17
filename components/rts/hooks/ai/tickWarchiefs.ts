import type { HeroItemId } from '../../game/types';
import {
  BARN_POS,
  HERO_ITEM_DATA,
  WARCHIEF_DMG,
  WARCHIEF_GOLD_REWARD,
  WARCHIEF_SPEED,
  WARCHIEF_STOMP_COOLDOWN_MS,
  WARCHIEF_STOMP_RADIUS,
  WARCHIEF_STOMP_SLOW_MS,
} from '../../game/constants';
import { INITIAL_TILES, tileDist } from '../../game/map';
import { aStar } from '../../game/pathfinding';
import { ENEMY_VOICELINES, Snd, pickAck } from '../../game/sound';
import type { RTSGameContext } from '../context';

export function tickWarchiefs(ctx: RTSGameContext, dt: number): void {
  const {
    dropItemIdRef,
    placedBuildingsRef,
    setEnemyWarchiefs,
    setResources,
    setDroppedItems,
    setWorkers,
    setPlayerBarnHp,
    addFloatingText,
    addDmgLog,
  } = ctx;

  // Update Enemy Warchiefs (War Stomp + march to barn)
  setEnemyWarchiefs(wcs => {
    const alive = wcs.filter(wc2 => wc2.hp > 0);
    const killed = wcs.filter(wc2 => wc2.hp <= 0);
    killed.forEach(wc2 => {
      setResources(r => ({ ...r, gold: r.gold + WARCHIEF_GOLD_REWARD }));
      addFloatingText(
        Math.round(wc2.x),
        Math.round(wc2.y),
        `👑 +${WARCHIEF_GOLD_REWARD}🪙`,
        '#fbbf24'
      );
      const wcPool2: HeroItemId[] = [
        'battle_sword',
        'shield_pendant',
        'tome_xp',
        'healing_potion',
      ];
      const wcDrop2 = wcPool2[Math.floor(Math.random() * wcPool2.length)]!;
      setDroppedItems(ds => [
        ...ds,
        {
          id: dropItemIdRef.current++,
          itemId: wcDrop2,
          x: Math.round(wc2.x),
          y: Math.round(wc2.y),
        },
      ]);
      addFloatingText(
        Math.round(wc2.x),
        Math.round(wc2.y),
        `👑 ${HERO_ITEM_DATA[wcDrop2].emoji} Dropped!`,
        '#c084fc'
      );
    });
    const now = Date.now();
    return alive.map(wc2 => {
      // War Stomp: every WARCHIEF_STOMP_COOLDOWN_MS stun all workers within radius
      if (now - wc2.lastStompAt >= WARCHIEF_STOMP_COOLDOWN_MS) {
        const stunUntil = now + WARCHIEF_STOMP_SLOW_MS;
        setWorkers(ws =>
          ws.map(w => {
            if (
              w.hp <= 0 ||
              tileDist(w.x, w.y, wc2.x, wc2.y) > WARCHIEF_STOMP_RADIUS
            )
              return w;
            addFloatingText(
              Math.round(w.x),
              Math.round(w.y),
              '💫STUNNED!',
              '#fbbf24'
            );
            return { ...w, stunUntil };
          })
        );
        Snd.warchiefStomp();
        addFloatingText(
          Math.round(wc2.x),
          Math.round(wc2.y),
          '👊 WAR STOMP!',
          '#ef4444'
        );
        addFloatingText(
          Math.round(wc2.x),
          Math.round(wc2.y) - 1,
          pickAck(ENEMY_VOICELINES.warchief_stomp ?? []),
          '#fbbf24'
        );
        return { ...wc2, state: 'stomping' as const, lastStompAt: now };
      }
      // Attack barn when adjacent
      const distToBarn = tileDist(wc2.x, wc2.y, BARN_POS.x, BARN_POS.y);
      if (distToBarn <= 1.2) {
        addDmgLog('⚔️ Warchief', WARCHIEF_DMG);
        setPlayerBarnHp(hp => Math.max(0, hp - WARCHIEF_DMG));
        addFloatingText(
          BARN_POS.x,
          BARN_POS.y,
          `-${WARCHIEF_DMG}🏰`,
          '#fca5a5'
        );
        return { ...wc2, state: 'attacking' as const };
      }
      // March toward barn
      if (wc2.movingTo) {
        const dx = wc2.movingTo.x - wc2.x,
          dy = wc2.movingTo.y - wc2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.1) {
          const next = wc2.path[0] ?? null;
          return {
            ...wc2,
            x: wc2.movingTo.x,
            y: wc2.movingTo.y,
            movingTo: next,
            path: wc2.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...wc2,
          x: wc2.x + (dx / dist) * Math.min(WARCHIEF_SPEED * dt, dist),
          y: wc2.y + (dy / dist) * Math.min(WARCHIEF_SPEED * dt, dist),
          state: 'moving' as const,
        };
      }
      const wallSetWC2 = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const pWC = aStar(
        INITIAL_TILES,
        { x: Math.round(wc2.x), y: Math.round(wc2.y) },
        BARN_POS,
        true,
        wallSetWC2
      );
      return { ...wc2, movingTo: pWC[0] ?? BARN_POS, path: pWC.slice(1) };
    });
  });
}
