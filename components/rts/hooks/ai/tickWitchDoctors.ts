import {
  BARN_POS,
  WITCH_DOCTOR_BUFF_DURATION,
  WITCH_DOCTOR_BUFF_MS,
  WITCH_DOCTOR_BUFF_RADIUS,
  WITCH_DOCTOR_GOLD_REWARD,
  WITCH_DOCTOR_SPEED,
} from '../../game/constants';
import { INITIAL_TILES, tileDist } from '../../game/map';
import { aStar } from '../../game/pathfinding';
import { ENEMY_VOICELINES, pickAck } from '../../game/sound';
import type { RTSGameContext } from '../context';

export function tickWitchDoctors(ctx: RTSGameContext, dt: number): void {
  const {
    enemyGruntsRef,
    witchDoctorBuffTimersRef,
    placedBuildingsRef,
    setEnemyWitchDoctors,
    setEnemyGrunts,
    setResources,
    addFloatingText,
  } = ctx;

  // Update Witch Doctors
  setEnemyWitchDoctors(wds => {
    const alive = wds.filter(d => d.hp > 0);
    alive.forEach(d => {
      if (!alive.find(dd => dd.id === d.id)) {
        setResources(r => ({
          ...r,
          gold: r.gold + WITCH_DOCTOR_GOLD_REWARD,
        }));
      }
    });
    return alive.map(wd => {
      const nearGrunts = enemyGruntsRef.current.filter(
        g =>
          g.hp > 0 &&
          tileDist(wd.x, wd.y, g.x, g.y) <= WITCH_DOCTOR_BUFF_RADIUS
      );
      if (nearGrunts.length > 0) {
        if (!witchDoctorBuffTimersRef.current[wd.id]) {
          const wdid = wd.id;
          const capturedWDX2 = Math.round(wd.x);
          const capturedWDY2 = Math.round(wd.y);
          witchDoctorBuffTimersRef.current[wdid] = window.setTimeout(() => {
            delete witchDoctorBuffTimersRef.current[wdid];
            addFloatingText(
              capturedWDX2,
              capturedWDY2,
              pickAck(ENEMY_VOICELINES.witch_doctor ?? []),
              '#a855f7'
            );
            const buffUntil = Date.now() + WITCH_DOCTOR_BUFF_DURATION;
            setEnemyGrunts(gs =>
              gs.map(g => {
                if (
                  g.hp <= 0 ||
                  tileDist(capturedWDX2, capturedWDY2, g.x, g.y) >
                    WITCH_DOCTOR_BUFF_RADIUS
                )
                  return g;
                addFloatingText(
                  Math.round(g.x),
                  Math.round(g.y),
                  '🔴BERSERK!',
                  '#dc2626'
                );
                return { ...g, enragedUntil: buffUntil };
              })
            );
          }, WITCH_DOCTOR_BUFF_MS);
        }
        return { ...wd, state: 'casting' as const };
      }
      if (wd.movingTo) {
        const dx = wd.movingTo.x - wd.x,
          dy = wd.movingTo.y - wd.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.1) {
          const next = wd.path[0] ?? null;
          return {
            ...wd,
            x: wd.movingTo.x,
            y: wd.movingTo.y,
            movingTo: next,
            path: wd.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...wd,
          x: wd.x + (dx / dist) * Math.min(WITCH_DOCTOR_SPEED * dt, dist),
          y: wd.y + (dy / dist) * Math.min(WITCH_DOCTOR_SPEED * dt, dist),
          state: 'moving' as const,
        };
      }
      const wallSetWD2 = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const pWD = aStar(
        INITIAL_TILES,
        { x: Math.round(wd.x), y: Math.round(wd.y) },
        BARN_POS,
        true,
        wallSetWD2
      );
      return { ...wd, movingTo: pWD[0] ?? BARN_POS, path: pWD.slice(1) };
    });
  });
}
