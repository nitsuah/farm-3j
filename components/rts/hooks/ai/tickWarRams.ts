import {
  BARN_POS,
  DEMOLISHER_ATTACK_MS,
  DEMOLISHER_DAMAGE,
  DEMOLISHER_FIRE_RANGE,
  DEMOLISHER_GOLD_REWARD,
  DEMOLISHER_SPEED,
  DEMOLISHER_SPLASH_RANGE,
  WAR_RAM_ATTACK_MS,
  WAR_RAM_DAMAGE,
  WAR_RAM_GOLD_REWARD,
  WAR_RAM_SPEED,
} from '../../game/constants';
import { INITIAL_TILES, tileDist } from '../../game/map';
import { aStar } from '../../game/pathfinding';
import type { RTSGameContext } from '../context';

export function tickWarRams(ctx: RTSGameContext, dt: number): void {
  const {
    placedBuildingsRef,
    siegeAttackTimeoutsRef,
    gameOverRef,
    enemySiegeRef,
    barnDmgThisWaveRef,
    setEnemySiege,
    setResources,
    setPlacedBuildings,
    setPlayerBarnHp,
    setGameOver,
    addFloatingText,
    addDmgLog,
    addProjectile,
    triggerUnderAttackRef,
    triggerShakeRef,
  } = ctx;

  // Update War Rams (enemy siege units)
  setEnemySiege(rams => {
    const survived = rams.filter(r => r.hp > 0);
    const killed = rams.filter(r => r.hp <= 0);
    if (killed.length > 0) {
      killed.forEach(r => {
        const reward =
          r.siegeType === 'demolisher'
            ? DEMOLISHER_GOLD_REWARD
            : WAR_RAM_GOLD_REWARD;
        setResources(res => ({ ...res, gold: res.gold + reward }));
        addFloatingText(
          Math.round(r.x),
          Math.round(r.y),
          `+${reward}🪙`,
          '#fbbf24'
        );
      });
    }
    return survived.map(r => {
      const speed =
        r.siegeType === 'demolisher' ? DEMOLISHER_SPEED : WAR_RAM_SPEED;
      // Move toward target building/barn
      if (r.movingTo) {
        const dx = r.movingTo.x - r.x,
          dy = r.movingTo.y - r.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        // Demolisher stops when in fire range; ram stops at melee
        const stopRange =
          r.siegeType === 'demolisher' ? DEMOLISHER_FIRE_RANGE - 0.5 : 0.1;
        if (d < stopRange) {
          const next = r.path[0] ?? null;
          if (r.siegeType === 'demolisher')
            return {
              ...r,
              x: r.x,
              y: r.y,
              movingTo: null,
              path: [],
              state: 'attacking' as const,
            };
          return {
            ...r,
            x: r.movingTo.x,
            y: r.movingTo.y,
            movingTo: next,
            path: r.path.slice(1),
            state: next ? ('moving' as const) : ('attacking' as const),
          };
        }
        return {
          ...r,
          x: r.x + (dx / d) * Math.min(speed * dt, d),
          y: r.y + (dy / d) * Math.min(speed * dt, d),
        };
      }
      const nearBuilding = placedBuildingsRef.current
        .filter(b => b.hp > 0)
        .sort(
          (a, b2) =>
            tileDist(r.x, r.y, a.x, a.y) - tileDist(r.x, r.y, b2.x, b2.y)
        )[0];
      const barnDist = tileDist(r.x, r.y, BARN_POS.x, BARN_POS.y);
      const buildingDist = nearBuilding
        ? tileDist(r.x, r.y, nearBuilding.x, nearBuilding.y)
        : Infinity;
      // Demolisher: ranged AoE attack
      if (r.siegeType === 'demolisher') {
        const atkRange = DEMOLISHER_FIRE_RANGE;
        const inRange =
          (nearBuilding && buildingDist <= atkRange) || barnDist <= atkRange;
        if (inRange) {
          if (!siegeAttackTimeoutsRef.current[r.id]) {
            const tx =
              nearBuilding && buildingDist <= atkRange
                ? nearBuilding.x
                : BARN_POS.x;
            const ty =
              nearBuilding && buildingDist <= atkRange
                ? nearBuilding.y
                : BARN_POS.y;
            const capturedRId = r.id;
            siegeAttackTimeoutsRef.current[r.id] = window.setTimeout(() => {
              delete siegeAttackTimeoutsRef.current[capturedRId];
              if (gameOverRef.current) return;
              if (
                !enemySiegeRef.current.find(
                  s => s.id === capturedRId && s.hp > 0
                )
              )
                return;
              // AoE splash on buildings
              addProjectile(
                Math.round(r.x),
                Math.round(r.y),
                tx,
                ty,
                'rock',
                900
              );
              setPlacedBuildings(bs =>
                bs.map(b =>
                  tileDist(tx, ty, b.x, b.y) <= DEMOLISHER_SPLASH_RANGE
                    ? { ...b, hp: Math.max(0, b.hp - DEMOLISHER_DAMAGE) }
                    : b
                )
              );
              // Direct barn hit
              if (
                tileDist(tx, ty, BARN_POS.x, BARN_POS.y) <=
                DEMOLISHER_SPLASH_RANGE
              ) {
                barnDmgThisWaveRef.current += DEMOLISHER_DAMAGE;
                addDmgLog('💥 Demolisher', DEMOLISHER_DAMAGE);
                setPlayerBarnHp(hp => {
                  const nHp = Math.max(0, hp - DEMOLISHER_DAMAGE);
                  if (nHp <= 0) setGameOver('defeat');
                  return nHp;
                });
                triggerUnderAttackRef.current({
                  x: BARN_POS.x,
                  y: BARN_POS.y,
                });
                triggerShakeRef.current(1.5);
              }
              addFloatingText(tx, ty, `💣-${DEMOLISHER_DAMAGE}`, '#f97316');
            }, DEMOLISHER_ATTACK_MS);
          }
          return { ...r, state: 'attacking' as const };
        }
        // Move closer
        const wallSetD = new Set(
          placedBuildingsRef.current
            .filter(b => b.type === 'wall')
            .map(b => `${b.x},${b.y}`)
        );
        const dDest2 =
          nearBuilding && buildingDist < barnDist
            ? { x: nearBuilding.x, y: nearBuilding.y }
            : BARN_POS;
        const dPath2 = aStar(
          INITIAL_TILES,
          { x: Math.round(r.x), y: Math.round(r.y) },
          dDest2,
          true,
          wallSetD
        );
        return {
          ...r,
          movingTo: dPath2[0] ?? dDest2,
          path: dPath2.slice(1),
          state: 'moving' as const,
        };
      }
      // War Ram: melee attack
      if (buildingDist <= 1.2 && nearBuilding) {
        if (!siegeAttackTimeoutsRef.current[r.id]) {
          const bid = nearBuilding.id;
          const bx = nearBuilding.x;
          const by = nearBuilding.y;
          siegeAttackTimeoutsRef.current[r.id] = window.setTimeout(() => {
            delete siegeAttackTimeoutsRef.current[r.id];
            setPlacedBuildings(bs =>
              bs.map(b =>
                b.id === bid
                  ? { ...b, hp: Math.max(0, b.hp - WAR_RAM_DAMAGE) }
                  : b
              )
            );
            addFloatingText(bx, by, `🪵-${WAR_RAM_DAMAGE}`, '#dc2626');
          }, WAR_RAM_ATTACK_MS);
        }
        return { ...r, state: 'attacking' as const };
      }
      if (barnDist <= 1.2) {
        if (!siegeAttackTimeoutsRef.current[r.id]) {
          siegeAttackTimeoutsRef.current[r.id] = window.setTimeout(() => {
            delete siegeAttackTimeoutsRef.current[r.id];
            addDmgLog('🪵 War Ram', WAR_RAM_DAMAGE);
            setPlayerBarnHp(hp => {
              const nHp = Math.max(0, hp - WAR_RAM_DAMAGE);
              if (nHp <= 0) setGameOver('defeat');
              return nHp;
            });
            addFloatingText(
              BARN_POS.x,
              BARN_POS.y,
              `🪵-${WAR_RAM_DAMAGE}`,
              '#dc2626'
            );
          }, WAR_RAM_ATTACK_MS);
        }
        return { ...r, state: 'attacking' as const };
      }
      // Re-path to nearest building or barn
      const wallSetR = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const dest =
        nearBuilding && buildingDist < barnDist
          ? { x: nearBuilding.x, y: nearBuilding.y }
          : BARN_POS;
      const p = aStar(
        INITIAL_TILES,
        { x: Math.round(r.x), y: Math.round(r.y) },
        dest,
        true,
        wallSetR
      );
      return {
        ...r,
        movingTo: p[0] ?? dest,
        path: p.slice(1),
        state: 'moving' as const,
      };
    });
  });
}
