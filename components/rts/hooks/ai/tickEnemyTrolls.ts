// Enemy troll archer AI tick � ranged kite + shoot.

import {
  ATTACK_DAMAGE,
  ATTACK_INTERVAL_MS,
  BARN_POS,
  BARN_VISION,
  BOSS_DAMAGE,
  BOSS_GOLD_REWARD,
  BOSS_XP_REWARD,
  BUILDING_COSTS,
  BUILDING_GRUNT_DAMAGE,
  CARRY_CAP,
  CATAPULT_DAMAGE,
  CATAPULT_FIRE_MS,
  CATAPULT_RANGE,
  CATAPULT_SPEED,
  CATAPULT_SPLASH_DAMAGE,
  CATAPULT_SPLASH_RANGE,
  CAVALRY_DAMAGE_BONUS,
  CAVALRY_SPEED,
  CAVALRY_SPRINT_SPEED_MULT,
  CAVALRY_TRAMPLE_DAMAGE,
  CAVALRY_TRAMPLE_RADIUS,
  CREEP_AGGRO_RANGE,
  CREEP_ATTACK_MS,
  CREEP_CAMPS,
  CREEP_DAMAGE,
  CREEP_LEASH_RANGE,
  CREEP_SPEED,
  DEMOLISHER_ATTACK_MS,
  DEMOLISHER_DAMAGE,
  DEMOLISHER_FIRE_RANGE,
  DEMOLISHER_GOLD_REWARD,
  DEMOLISHER_SPEED,
  DEMOLISHER_SPLASH_RANGE,
  DEMOLISHER_XP_REWARD,
  ENEMY_BARN_MAX_HP,
  ENEMY_BARN_POS,
  ENEMY_COUNTER_DAMAGE,
  FROST_TOWER_SLOW_FACTOR,
  GARRISON_ARMOR_PER_UNIT,
  GATHER_INTERVAL_MS,
  GRID_SIZE,
  GRUNT_ATTACK_MS,
  GRUNT_BARN_MELEE_RANGE,
  GRUNT_DAMAGE,
  GRUNT_MAX_HP,
  GRUNT_SPEED,
  HERO_DAMAGE_BONUS,
  HERO_ITEM_DATA,
  HERO_MAX_ITEMS,
  HERO_SHOUT_ATK_MULT,
  HERO_SHOUT_RADIUS,
  LUMBER_SHED_BONUS_MS,
  NECROMANCER_GOLD_REWARD,
  NECROMANCER_RAISE_MS,
  NECROMANCER_RAISE_RADIUS,
  NECROMANCER_SPEED,
  NECROMANCER_XP_REWARD,
  REPAIR_AMOUNT,
  REPAIR_INTERVAL_MS,
  REPAIR_RADIUS,
  SAPPER_EXPLODE_DAMAGE,
  SAPPER_EXPLODE_RADIUS,
  SAPPER_GOLD_REWARD,
  SAPPER_SPEED,
  SAPPER_XP_REWARD,
  SHAMAN_GOLD_REWARD,
  SHAMAN_HEAL_AMOUNT,
  SHAMAN_HEAL_MS,
  SHAMAN_HEAL_RADIUS,
  SHAMAN_SPEED,
  SHAMAN_XP_REWARD,
  SWORDSMAN_DAMAGE_BONUS,
  TREBUCHET_DAMAGE,
  TREBUCHET_FIRE_MS,
  TREBUCHET_MIN_RANGE,
  TREBUCHET_RANGE,
  TREBUCHET_SPEED,
  TROLL_ATTACK_MS,
  TROLL_ATTACK_RANGE,
  TROLL_DAMAGE,
  TROLL_GOLD_REWARD,
  TROLL_KITE_RANGE,
  TROLL_SPEED,
  TROLL_XP_REWARD,
  VETERAN_ATK_BONUS,
  VETERAN_HP_BONUS,
  WARCHIEF_DMG,
  WARCHIEF_GOLD_REWARD,
  WARCHIEF_SPEED,
  WARCHIEF_STOMP_COOLDOWN_MS,
  WARCHIEF_STOMP_RADIUS,
  WARCHIEF_STOMP_SLOW_MS,
  WARCHIEF_XP_REWARD,
  WARLORD_DMG,
  WARLORD_GOLD_REWARD,
  WARLORD_SHIELD_BASH_COOLDOWN_MS,
  WARLORD_SHIELD_BASH_RANGE,
  WARLORD_SHIELD_BASH_STUN_MS,
  WARLORD_SPEED,
  WARLORD_WAR_CRY_COOLDOWN_MS,
  WARLORD_WAR_CRY_RADIUS,
  WARLORD_WAR_CRY_SLOW_MS,
  WARLORD_XP_REWARD,
  LURKER_ATTACK_MS,
  LURKER_DAMAGE,
  LURKER_GOLD_REWARD,
  LURKER_SPEED,
  LURKER_XP_REWARD,
  WAR_RAM_ATTACK_MS,
  WAR_RAM_DAMAGE,
  WAR_RAM_GOLD_REWARD,
  WAR_RAM_SPEED,
  WAR_RAM_XP_REWARD,
  WATCHTOWER_VISION,
  WITCH_DOCTOR_BUFF_DURATION,
  WITCH_DOCTOR_BUFF_MS,
  WITCH_DOCTOR_BUFF_RADIUS,
  WITCH_DOCTOR_ENRAGE_DMG_BONUS,
  WITCH_DOCTOR_GOLD_REWARD,
  WITCH_DOCTOR_SPEED,
  WITCH_DOCTOR_XP_REWARD,
  WORKER_SPEED,
  WORKER_VISION,
  XP_PER_KILL,
  XP_TO_LEVEL_1,
  XP_TO_LEVEL_2,
  XP_TO_LEVEL_3,
} from '../../game/constants';
import { INITIAL_TILES, tileDist } from '../../game/map';
import { aStar } from '../../game/pathfinding';
import { ENEMY_VOICELINES, Snd, pickAck } from '../../game/sound';
import type {
  BuildingType,
  EnemyGrunt,
  EnemyLurker,
  EnemyWarlord,
  HeroItemId,
  ResourceNode,
} from '../../game/types';
import type { RTSGameContext } from '../context';
export function tickEnemyTrolls(ctx: RTSGameContext, dt: number): void {
  const {
    difficulty,
    addDmgLog,
    addFloatingText,
    addProjectile,
    triggerShakeRef,
    triggerUnderAttackRef,
    onAchievement,
    setDeadGruntPositions,
    setDeadWorkerPositions,
    setDroppedItems,
    setEnemyBarnHp,
    setEnemyGrunts,
    setEnemyNecromancers,
    setEnemySappers,
    setEnemyShamans,
    setEnemySiege,
    setEnemyTowers,
    setEnemyTrolls,
    setEnemyWalls,
    setEnemyWarchiefs,
    setEnemyLurkers,
    setEnemyWarlords,
    setEnemyWitchDoctors,
    setGameOver,
    setGoldMines,
    setHeroItems,
    setKillCount,
    setLootCrates,
    setNeutralCreeps,
    setPlacedBuildings,
    setPlayerBarnHp,
    setResources,
    setStoneNodes,
    setTotalGold,
    setTotalLumber,
    setTotalStone,
    setTrees,
    setWaveAnnouncement,
    setWorkers,
    setClearedCamps,
    attackTimeoutsRef,
    barnDmgThisWaveRef,
    barracksTechRef,
    blacksmithUpgradesRef,
    buildingAttackTimeoutsRef,
    campClearedAtRef,
    creepAttackTimeoutsRef,
    deadGruntPositionsRef,
    dropItemIdRef,
    droppedItemsRef,
    enemyBarnHpRef,
    enemyGruntsRef,
    enemyNecromancersRef,
    enemySappersRef,
    enemyShamansRef,
    enemySiegeRef,
    enemyTowersRef,
    enemyTrollsRef,
    enemyWallsRef,
    enemyLurkersRef,
    lurkerAttackTimeoutsRef,
    enemyWarchiefsRef,
    enemyWarlordsRef,
    enemyWitchDoctorsRef,
    garrisonedRef,
    goldMinesRef,
    gruntAttackTimeoutsRef,
    gruntHitRef,
    gruntIdRef,
    heroItemsRef,
    isNightRef,
    lastStandEnrageRef,
    lootCrateIdRef,
    lootCratesRef,
    necromancerIdRef,
    necromancerRaiseTimersRef,
    neutralCreepsRef,
    placedBuildingsRef,
    playerBarnHpRef,
    sapperKillCountRef,
    shamanHealTimersRef,
    shrinePlentyBuffRef,
    shrineWarBuffRef,
    siegeAttackTimeoutsRef,
    stoneNodesRef,
    treesRef,
    trollAttackTimersRef,
    upgradesRef,
    waveRef,
    witchDoctorBuffTimersRef,
    workerHitRef,
    workersRef,
    gameOverRef,
  } = ctx;
  // Update enemy Troll Archers
  const currentTrolls = enemyTrollsRef.current;
  const killedTrolls = currentTrolls.filter(t => t.hp <= 0);
  killedTrolls.forEach(t => {
    setResources(r => ({ ...r, gold: r.gold + TROLL_GOLD_REWARD }));
    addFloatingText(
      Math.round(t.x),
      Math.round(t.y),
      `+${TROLL_GOLD_REWARD}🪙`,
      '#fbbf24'
    );
  });
  setEnemyTrolls(ts => {
    const alive = ts.filter(t => t.hp > 0);
    return alive.map(t => {
      // Find nearest player unit within attack range
      const nearestWorker = workersRef.current
        .filter(w => w.hp > 0)
        .sort(
          (a, b2) =>
            tileDist(t.x, t.y, a.x, a.y) - tileDist(t.x, t.y, b2.x, b2.y)
        )[0];
      const distToWorker = nearestWorker
        ? tileDist(t.x, t.y, nearestWorker.x, nearestWorker.y)
        : 999;

      if (distToWorker <= TROLL_ATTACK_RANGE) {
        // Fire arrows at nearest worker
        if (!trollAttackTimersRef.current[t.id]) {
          const tid = t.id,
            twx = Math.round(nearestWorker!.x),
            twy = Math.round(nearestWorker!.y),
            wid = nearestWorker!.id;
          const capturedTX = Math.round(t.x),
            capturedTY = Math.round(t.y);
          trollAttackTimersRef.current[tid] = window.setTimeout(() => {
            delete trollAttackTimersRef.current[tid];
            addProjectile(capturedTX, capturedTY, twx, twy, 'arrow', 600);
            setWorkers(ws =>
              ws.map(w => {
                if (w.id !== wid || w.hp <= 0) return w;
                addFloatingText(twx, twy, `-${TROLL_DAMAGE}`, '#fca5a5');
                return { ...w, hp: Math.max(0, w.hp - TROLL_DAMAGE) };
              })
            );
          }, TROLL_ATTACK_MS);
        }
        // Kite: if worker is getting close, back away
        if (distToWorker < TROLL_KITE_RANGE) {
          const dx = t.x - nearestWorker!.x,
            dy = t.y - nearestWorker!.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = Math.max(
            0,
            Math.min(GRID_SIZE - 1, t.x + (dx / dist) * TROLL_SPEED * dt)
          );
          const ny = Math.max(
            0,
            Math.min(GRID_SIZE - 1, t.y + (dy / dist) * TROLL_SPEED * dt)
          );
          return {
            ...t,
            x: nx,
            y: ny,
            movingTo: null,
            path: [],
            state: 'kiting' as const,
          };
        }
        return { ...t, state: 'attacking' as const };
      }

      // March toward barn but stop at attack range
      const distToBarn = tileDist(t.x, t.y, BARN_POS.x, BARN_POS.y);
      if (distToBarn <= TROLL_ATTACK_RANGE) {
        // Fire at barn if no worker target
        if (!trollAttackTimersRef.current[t.id]) {
          const tid = t.id;
          const capturedTX2 = Math.round(t.x),
            capturedTY2 = Math.round(t.y);
          trollAttackTimersRef.current[tid] = window.setTimeout(() => {
            delete trollAttackTimersRef.current[tid];
            if (gameOverRef.current) return;
            if (!enemyTrollsRef.current.find(tr => tr.id === tid && tr.hp > 0))
              return;
            addProjectile(
              capturedTX2,
              capturedTY2,
              BARN_POS.x,
              BARN_POS.y,
              'arrow',
              700
            );
            addFloatingText(
              BARN_POS.x,
              BARN_POS.y,
              `🏹-${TROLL_DAMAGE}`,
              '#fca5a5'
            );
            addDmgLog('🏹 Troll Archer', TROLL_DAMAGE);
            setPlayerBarnHp(hp => {
              const nHp = Math.max(0, hp - TROLL_DAMAGE);
              if (nHp <= 0) setGameOver('defeat');
              return nHp;
            });
          }, TROLL_ATTACK_MS);
        }
        return { ...t, state: 'attacking' as const };
      }

      if (t.movingTo) {
        const dx = t.movingTo.x - t.x,
          dy = t.movingTo.y - t.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.1) {
          const next = t.path[0] ?? null;
          return {
            ...t,
            x: t.movingTo.x,
            y: t.movingTo.y,
            movingTo: next,
            path: t.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...t,
          x: t.x + (dx / dist) * Math.min(TROLL_SPEED * dt, dist),
          y: t.y + (dy / dist) * Math.min(TROLL_SPEED * dt, dist),
        };
      }
      const wallSetT = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const p = aStar(
        INITIAL_TILES,
        { x: Math.round(t.x), y: Math.round(t.y) },
        BARN_POS,
        true,
        wallSetT
      );
      return {
        ...t,
        movingTo: p[0] ?? BARN_POS,
        path: p.slice(1),
        state: 'moving' as const,
      };
    });
  });
}
