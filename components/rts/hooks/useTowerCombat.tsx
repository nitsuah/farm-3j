import { useEffect, useRef } from 'react';

import {
  BALLISTA_ATTACK_MS,
  BARN_COUNTER_DMG,
  BARN_COUNTER_MS,
  BARN_COUNTER_RANGE,
  ENEMY_EXTRA_TOWER_SLOTS,
  ENEMY_EXTRA_WALL_SLOTS,
  BALLISTA_DAMAGE,
  BALLISTA_PIERCE_DAMAGE,
  BALLISTA_PIERCE_RANGE,
  BALLISTA_RANGE,
  BARN_POS,
  ENEMY_BARN_POS,
  ENEMY_TOWER_ATTACK_MS,
  ENEMY_TOWER_DAMAGE,
  ENEMY_TOWER_MAX_HP,
  ENEMY_TOWER_RANGE,
  ENEMY_WALL_MAX_HP,
  FROST_TOWER_ATTACK_MS,
  FROST_TOWER_DAMAGE,
  FROST_TOWER_RANGE,
  FROST_TOWER_SLOW_DURATION,
  PLAYER_BARN_MAX_HP,
  POISON_TOWER_ATTACK_MS,
  POISON_TOWER_DAMAGE,
  POISON_TOWER_DPS,
  POISON_TOWER_DURATION_MS,
  POISON_TOWER_RANGE,
  WATCHTOWER_ATTACK_MS,
  WATCHTOWER_ATTACK_RANGE,
  WATCHTOWER_DAMAGE,
} from '../game/constants';
import { tileDist } from '../game/map';
import type { EnemyGrunt } from '../game/types';
import type { RTSGameContext } from './context';

export function useTowerCombat(ctx: RTSGameContext) {
  const {
    addFloatingText,
    addProjectile,
    blacksmithUpgradesRef,
    enemyBarnHpRef,
    enemyGruntsRef,
    enemyTowerTimersRef,
    enemyTowers,
    enemyTowersRef,
    enemyWallsRef,
    gameOver,
    gameOverRef,
    gameSpeedRef,
    garrisoned,
    garrisonedRef,
    gruntHitRef,
    guardTowerRef,
    placedBuildings,
    placedBuildingsRef,
    playerBarnHpRef,
    setEnemyGrunts,
    setEnemyTowers,
    setEnemyWalls,
    setPlayerBarnHp,
    setWorkers,
    towerGarrisonRef,
    watchtowerTimersRef,
    waveRef,
    workerHitRef,
    workersRef,
  } = ctx;

  // Archer tower (id -1) is now handled by the shared enemy tower fire loop below

  // Enemy barn counterfire: shoots at player units within 5 tiles
  const enemyBarnFireTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (gameOver) return;
    const fire = () => {
      if (gameOverRef.current || enemyBarnHpRef.current <= 0) return;
      const inRange = workersRef.current.filter(
        w =>
          w.hp > 0 &&
          tileDist(w.x, w.y, ENEMY_BARN_POS.x, ENEMY_BARN_POS.y) <=
            BARN_COUNTER_RANGE
      );
      if (inRange.length > 0) {
        const target = inRange.reduce((a, b) =>
          tileDist(a.x, a.y, ENEMY_BARN_POS.x, ENEMY_BARN_POS.y) <
          tileDist(b.x, b.y, ENEMY_BARN_POS.x, ENEMY_BARN_POS.y)
            ? a
            : b
        );
        workerHitRef.current.set(target.id, Date.now());
        setWorkers(prev =>
          prev.map(w =>
            w.id === target.id
              ? { ...w, hp: Math.max(0, w.hp - BARN_COUNTER_DMG) }
              : w
          )
        );
        addFloatingText(
          Math.round(target.x),
          Math.round(target.y),
          `🏴‍☠️-${BARN_COUNTER_DMG}`,
          '#ef4444'
        );
        addProjectile(
          ENEMY_BARN_POS.x,
          ENEMY_BARN_POS.y,
          Math.round(target.x),
          Math.round(target.y),
          'arrow',
          650
        );
      }
      enemyBarnFireTimerRef.current = window.setTimeout(fire, BARN_COUNTER_MS);
    };
    enemyBarnFireTimerRef.current = window.setTimeout(fire, BARN_COUNTER_MS);
    return () => {
      if (enemyBarnFireTimerRef.current)
        clearTimeout(enemyBarnFireTimerRef.current);
    };
  }, [gameOver, addFloatingText, addProjectile]);

  // Enemy AI: auto-builds new towers and walls over time to simulate active enemy base
  useEffect(() => {
    if (gameOver) return;
    let nextTowerIdx = 0;
    let nextWallIdx = 0;
    const towerBuildTimer = window.setInterval(() => {
      if (
        gameOverRef.current ||
        enemyBarnHpRef.current <= 0 ||
        gameSpeedRef.current === 0
      )
        return;
      if (waveRef.current < 5) return;
      const pos = ENEMY_EXTRA_TOWER_SLOTS[nextTowerIdx];
      if (pos && nextTowerIdx < ENEMY_EXTRA_TOWER_SLOTS.length) {
        const alreadyExists = enemyTowersRef.current.find(
          t => t.x === pos.x && t.y === pos.y
        );
        if (!alreadyExists) {
          const tId = 9000 + nextTowerIdx;
          setEnemyTowers(ts => [
            ...ts,
            {
              id: tId,
              x: pos.x,
              y: pos.y,
              hp: ENEMY_TOWER_MAX_HP,
              maxHp: ENEMY_TOWER_MAX_HP,
            },
          ]);
          addFloatingText(pos.x, pos.y, '🏰 Tower Built!', '#ef4444');
        }
        nextTowerIdx++;
      }
    }, 90000);
    const wallBuildTimer = window.setInterval(() => {
      if (
        gameOverRef.current ||
        enemyBarnHpRef.current <= 0 ||
        gameSpeedRef.current === 0
      )
        return;
      if (waveRef.current < 7) return;
      const pos = ENEMY_EXTRA_WALL_SLOTS[nextWallIdx];
      if (pos && nextWallIdx < ENEMY_EXTRA_WALL_SLOTS.length) {
        const alreadyExists = enemyWallsRef.current.find(
          w => w.x === pos.x && w.y === pos.y
        );
        if (!alreadyExists) {
          const wId = 8000 + nextWallIdx;
          setEnemyWalls(ws => [
            ...ws,
            {
              id: wId,
              x: pos.x,
              y: pos.y,
              hp: ENEMY_WALL_MAX_HP,
              maxHp: ENEMY_WALL_MAX_HP,
            },
          ]);
          addFloatingText(pos.x, pos.y, '🧱 Wall Built!', '#dc2626');
        }
        nextWallIdx++;
      }
    }, 60000);
    return () => {
      clearInterval(towerBuildTimer);
      clearInterval(wallBuildTimer);
    };
  }, [gameOver, addFloatingText]);

  // Enemy fortress towers fire at workers in range
  useEffect(() => {
    if (gameOver || enemyTowers.length === 0) return;
    const scheduleShot = (towerId: number, tx: number, ty: number) => {
      enemyTowerTimersRef.current[towerId] = window.setTimeout(() => {
        delete enemyTowerTimersRef.current[towerId];
        if (gameOverRef.current) return;
        if (!enemyTowersRef.current.find(t => t.id === towerId && t.hp > 0))
          return;
        const dmg = Math.max(
          1,
          ENEMY_TOWER_DAMAGE - blacksmithUpgradesRef.current.ironHide * 2
        );
        const inRange = workersRef.current.filter(
          w => w.hp > 0 && tileDist(w.x, w.y, tx, ty) <= ENEMY_TOWER_RANGE
        );
        if (inRange.length > 0) {
          const target = inRange.reduce((a, b) =>
            tileDist(a.x, a.y, tx, ty) < tileDist(b.x, b.y, tx, ty) ? a : b
          );
          workerHitRef.current.set(target.id, Date.now());
          setWorkers(prev =>
            prev.map(w =>
              w.id === target.id ? { ...w, hp: Math.max(0, w.hp - dmg) } : w
            )
          );
          addFloatingText(
            Math.round(target.x),
            Math.round(target.y),
            `🏹-${dmg}`,
            '#dc2626'
          );
          addProjectile(
            tx,
            ty,
            Math.round(target.x),
            Math.round(target.y),
            'arrow',
            650
          );
        }
        scheduleShot(towerId, tx, ty);
      }, ENEMY_TOWER_ATTACK_MS);
    };
    enemyTowers
      .filter(t => t.hp > 0)
      .forEach(t => {
        if (!enemyTowerTimersRef.current[t.id]) scheduleShot(t.id, t.x, t.y);
      });
    return () => {
      Object.values(enemyTowerTimersRef.current).forEach(clearTimeout);
      enemyTowerTimersRef.current = {};
    };
  }, [enemyTowers, gameOver, addFloatingText, addProjectile]);

  // Player watchtowers fire arrows at enemy grunts in range
  useEffect(() => {
    const towers = placedBuildings.filter(
      b => b.type === 'watchtower' && b.hp > 0 && !b.constructing
    );
    if (!gameOver && towers.length > 0) {
      const scheduleShot = (towerId: number, tx: number, ty: number) => {
        watchtowerTimersRef.current[towerId] = window.setTimeout(() => {
          delete watchtowerTimersRef.current[towerId];
          if (gameOverRef.current) return;
          const tower = placedBuildingsRef.current.find(b => b.id === towerId);
          if (!tower || tower.hp <= 0) return;
          const grunts = enemyGruntsRef.current;
          const isGuard = guardTowerRef.current;
          const garrisonCount = (towerGarrisonRef.current[towerId] ?? [])
            .length;
          const dmgT =
            (isGuard ? WATCHTOWER_DAMAGE + 7 : WATCHTOWER_DAMAGE) +
            garrisonCount * 4;
          const rangeT =
            (isGuard ? WATCHTOWER_ATTACK_RANGE + 1 : WATCHTOWER_ATTACK_RANGE) +
            garrisonCount * 0.5;
          const inRangeT = grunts.filter(
            g => g.hp > 0 && tileDist(g.x, g.y, tx, ty) <= rangeT
          );
          const targetT = inRangeT.reduce<EnemyGrunt | null>(
            (best, g) =>
              !best ||
              tileDist(g.x, g.y, tx, ty) < tileDist(best.x, best.y, tx, ty)
                ? g
                : best,
            null
          );
          if (targetT) {
            gruntHitRef.current.set(targetT.id, Date.now());
            setEnemyGrunts(gs =>
              gs.map(g =>
                g.id === targetT.id ? { ...g, hp: Math.max(0, g.hp - dmgT) } : g
              )
            );
            addFloatingText(
              Math.round(targetT.x),
              Math.round(targetT.y),
              `${isGuard ? '🏰' : '🏹'}-${dmgT}`,
              '#22d3ee'
            );
            addProjectile(
              tx,
              ty,
              Math.round(targetT.x),
              Math.round(targetT.y),
              'arrow',
              600
            );
          }
          scheduleShot(towerId, tx, ty);
        }, WATCHTOWER_ATTACK_MS);
      };
      towers.forEach(t => {
        if (!watchtowerTimersRef.current[t.id]) scheduleShot(t.id, t.x, t.y);
      });
    }
    return () => {
      Object.values(watchtowerTimersRef.current).forEach(clearTimeout);
      watchtowerTimersRef.current = {};
    };
  }, [placedBuildings, gameOver, addFloatingText, addProjectile]);

  // Frost Tower auto-fire — slows + chips grunts in range
  const frostTowerTimersRef = useRef<Record<number, number>>({});
  useEffect(() => {
    const frostTowers = placedBuildings.filter(
      b => b.type === 'frostTower' && b.hp > 0 && !b.constructing
    );
    if (!gameOver && frostTowers.length > 0) {
      const scheduleFrost = (towerId: number, tx: number, ty: number) => {
        frostTowerTimersRef.current[towerId] = window.setTimeout(() => {
          delete frostTowerTimersRef.current[towerId];
          if (gameOverRef.current) return;
          const tower = placedBuildingsRef.current.find(b => b.id === towerId);
          if (!tower || tower.hp <= 0) return;
          const grunts = enemyGruntsRef.current.filter(
            g => g.hp > 0 && tileDist(g.x, g.y, tx, ty) <= FROST_TOWER_RANGE
          );
          const target = grunts.reduce<EnemyGrunt | null>(
            (best, g) =>
              !best ||
              tileDist(g.x, g.y, tx, ty) < tileDist(best.x, best.y, tx, ty)
                ? g
                : best,
            null
          );
          if (target) {
            const freezeUntil = Date.now() + FROST_TOWER_SLOW_DURATION;
            setEnemyGrunts(gs =>
              gs.map(g =>
                g.id === target.id
                  ? {
                      ...g,
                      hp: Math.max(0, g.hp - FROST_TOWER_DAMAGE),
                      frozenUntil: freezeUntil,
                    }
                  : g
              )
            );
            addFloatingText(
              Math.round(target.x),
              Math.round(target.y),
              `❄️-${FROST_TOWER_DAMAGE}`,
              '#93c5fd'
            );
            addProjectile(
              tx,
              ty,
              Math.round(target.x),
              Math.round(target.y),
              'ice',
              500
            );
          }
          scheduleFrost(towerId, tx, ty);
        }, FROST_TOWER_ATTACK_MS);
      };
      frostTowers.forEach(t => {
        if (!frostTowerTimersRef.current[t.id]) scheduleFrost(t.id, t.x, t.y);
      });
    }
    return () => {
      Object.values(frostTowerTimersRef.current).forEach(clearTimeout);
      frostTowerTimersRef.current = {};
    };
  }, [placedBuildings, gameOver, addFloatingText, addProjectile]);

  // Ballista Tower auto-fire — piercing bolt hits primary target + nearby grunts
  const ballistaTimersRef = useRef<Record<number, number>>({});
  useEffect(() => {
    const ballistaTowers = placedBuildings.filter(
      b => b.type === 'ballista' && b.hp > 0 && !b.constructing
    );
    if (!gameOver && ballistaTowers.length > 0) {
      const scheduleBallista = (towerId: number, tx: number, ty: number) => {
        ballistaTimersRef.current[towerId] = window.setTimeout(() => {
          delete ballistaTimersRef.current[towerId];
          if (gameOverRef.current) return;
          const tower = placedBuildingsRef.current.find(b => b.id === towerId);
          if (!tower || tower.hp <= 0) return;
          const grunts = enemyGruntsRef.current.filter(
            g => g.hp > 0 && tileDist(g.x, g.y, tx, ty) <= BALLISTA_RANGE
          );
          const primary = grunts.reduce<EnemyGrunt | null>(
            (best, g) =>
              !best ||
              tileDist(g.x, g.y, tx, ty) < tileDist(best.x, best.y, tx, ty)
                ? g
                : best,
            null
          );
          if (primary) {
            const px = primary.x,
              py = primary.y;
            addProjectile(tx, ty, Math.round(px), Math.round(py), 'bolt', 450);
            setEnemyGrunts(gs =>
              gs.map(g => {
                if (g.id === primary.id) {
                  addFloatingText(
                    Math.round(px),
                    Math.round(py),
                    `🏹-${BALLISTA_DAMAGE}`,
                    '#f59e0b'
                  );
                  return { ...g, hp: Math.max(0, g.hp - BALLISTA_DAMAGE) };
                }
                if (tileDist(g.x, g.y, px, py) <= BALLISTA_PIERCE_RANGE) {
                  addFloatingText(
                    Math.round(g.x),
                    Math.round(g.y),
                    `-${BALLISTA_PIERCE_DAMAGE}`,
                    '#fbbf24'
                  );
                  return {
                    ...g,
                    hp: Math.max(0, g.hp - BALLISTA_PIERCE_DAMAGE),
                  };
                }
                return g;
              })
            );
          }
          scheduleBallista(towerId, tx, ty);
        }, BALLISTA_ATTACK_MS);
      };
      ballistaTowers.forEach(t => {
        if (!ballistaTimersRef.current[t.id]) scheduleBallista(t.id, t.x, t.y);
      });
    }
    return () => {
      Object.values(ballistaTimersRef.current).forEach(clearTimeout);
      ballistaTimersRef.current = {};
    };
  }, [placedBuildings, gameOver, addFloatingText, addProjectile]);

  // Poison Tower auto-fire — deals initial dmg + DoT to nearest grunt in range
  const poisonTowerTimersRef = useRef<Record<number, number>>({});
  useEffect(() => {
    const poisonTowers = placedBuildings.filter(
      b => b.type === 'poisonTower' && b.hp > 0 && !b.constructing
    );
    if (!gameOver && poisonTowers.length > 0) {
      const schedulePoison = (towerId: number, tx: number, ty: number) => {
        poisonTowerTimersRef.current[towerId] = window.setTimeout(() => {
          delete poisonTowerTimersRef.current[towerId];
          if (gameOverRef.current) return;
          const tower = placedBuildingsRef.current.find(b => b.id === towerId);
          if (!tower || tower.hp <= 0) return;
          const grunts = enemyGruntsRef.current.filter(
            g => g.hp > 0 && tileDist(g.x, g.y, tx, ty) <= POISON_TOWER_RANGE
          );
          const target = grunts.reduce<EnemyGrunt | null>(
            (best, g) =>
              !best ||
              tileDist(g.x, g.y, tx, ty) < tileDist(best.x, best.y, tx, ty)
                ? g
                : best,
            null
          );
          if (target) {
            const poisonUntil = Date.now() + POISON_TOWER_DURATION_MS;
            setEnemyGrunts(gs =>
              gs.map(g =>
                g.id === target.id
                  ? {
                      ...g,
                      hp: Math.max(0, g.hp - POISON_TOWER_DAMAGE),
                      poisonedUntil: poisonUntil,
                      poisonDps: POISON_TOWER_DPS,
                    }
                  : g
              )
            );
            addFloatingText(
              Math.round(target.x),
              Math.round(target.y),
              `☠️-${POISON_TOWER_DAMAGE}`,
              '#4ade80'
            );
            addProjectile(
              tx,
              ty,
              Math.round(target.x),
              Math.round(target.y),
              'poison',
              550
            );
          }
          schedulePoison(towerId, tx, ty);
        }, POISON_TOWER_ATTACK_MS);
      };
      poisonTowers.forEach(t => {
        if (!poisonTowerTimersRef.current[t.id]) schedulePoison(t.id, t.x, t.y);
      });
    }
    return () => {
      Object.values(poisonTowerTimersRef.current).forEach(clearTimeout);
      poisonTowerTimersRef.current = {};
    };
  }, [placedBuildings, gameOver, addFloatingText, addProjectile]);

  // Player barn defense fire — scales with wave and garrison count; Last Stand at <25% HP
  const barnArrowTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (gameOver) return;
    const BARN_DEFENSE_RANGE = 5;
    const BARN_DEFENSE_MS = 2500;
    const fireBarnArrow = () => {
      if (gameOverRef.current) return;
      // Damage: 10 base + 1 per 3 waves + 3 per garrisoned unit
      const waveDmgBonus = Math.floor(waveRef.current / 3);
      const garrisonDmgBonus = garrisonedRef.current.length * 3;
      const lastStand = playerBarnHpRef.current / PLAYER_BARN_MAX_HP < 0.25;
      const dmg = (10 + waveDmgBonus + garrisonDmgBonus) * (lastStand ? 2 : 1);
      const target = enemyGruntsRef.current.reduce<EnemyGrunt | null>(
        (best, g) => {
          if (tileDist(g.x, g.y, BARN_POS.x, BARN_POS.y) > BARN_DEFENSE_RANGE)
            return best;
          if (
            !best ||
            tileDist(g.x, g.y, BARN_POS.x, BARN_POS.y) <
              tileDist(best.x, best.y, BARN_POS.x, BARN_POS.y)
          )
            return g;
          return best;
        },
        null
      );
      if (target) {
        setEnemyGrunts(gs =>
          gs.map(g =>
            g.id === target.id ? { ...g, hp: Math.max(0, g.hp - dmg) } : g
          )
        );
        addFloatingText(
          Math.round(target.x),
          Math.round(target.y),
          `🏰-${dmg}`,
          '#fbbf24'
        );
      }
      const fireDelay =
        playerBarnHpRef.current / PLAYER_BARN_MAX_HP < 0.25
          ? BARN_DEFENSE_MS / 2
          : BARN_DEFENSE_MS;
      barnArrowTimerRef.current = window.setTimeout(fireBarnArrow, fireDelay);
    };
    barnArrowTimerRef.current = window.setTimeout(
      fireBarnArrow,
      BARN_DEFENSE_MS
    );
    return () => {
      if (barnArrowTimerRef.current) clearTimeout(barnArrowTimerRef.current);
    };
  }, [gameOver, addFloatingText]);

  // Passive barn regen: +1 HP every 5s when no grunts are active and barn < max
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => {
      if (gameOverRef.current || gameSpeedRef.current === 0) return;
      if (enemyGruntsRef.current.length > 0) return;
      setPlayerBarnHp(hp =>
        hp < PLAYER_BARN_MAX_HP ? Math.min(PLAYER_BARN_MAX_HP, hp + 1) : hp
      );
    }, 5000);
    return () => clearInterval(id);
  }, [gameOver]);

  // Barn HP regen from garrison: +2 HP/s per garrisoned unit, capped at max HP
  useEffect(() => {
    if (gameOver || garrisoned.length === 0) return;
    const id = setInterval(() => {
      if (gameOverRef.current) return;
      const count = garrisonedRef.current.length;
      if (count === 0) return;
      const regen = count * 2;
      setPlayerBarnHp(hp => {
        const next = Math.min(PLAYER_BARN_MAX_HP, hp + regen);
        if (next > hp)
          addFloatingText(BARN_POS.x, BARN_POS.y, `+${regen}🏰`, '#4ade80');
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gameOver, garrisoned.length, addFloatingText]);
}
