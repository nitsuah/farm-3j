// Enemy lurker AI tick � fast flanker, chases nearest worker.

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
export function tickEnemyLurkers(
  ctx: RTSGameContext,
  dt: number,
  lurkerKillCountRef: { current: number }
): void {
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
  } = ctx;
  // lurkerKillCountRef is passed in from useGameLoop to persist across frames
  // Update Enemy Lurkers (fast flankers — chase nearest worker or march to barn)
  setEnemyLurkers((lks: EnemyLurker[]) => {
    const alive = lks.filter(lk => lk.hp > 0);
    const killed = lks.filter(lk => lk.hp <= 0);
    killed.forEach(lk => {
      lurkerKillCountRef.current += 1;
      if (lurkerKillCountRef.current >= 10) onAchievement('lurker_slayer');
      setResources(r => ({ ...r, gold: r.gold + LURKER_GOLD_REWARD }));
      setKillCount(k => k + 1);
      addFloatingText(
        Math.round(lk.x),
        Math.round(lk.y),
        `+${LURKER_GOLD_REWARD}🪙`,
        '#34d399'
      );
    });
    return alive.map(lk => {
      // Find nearest alive worker
      const nearestWorker = workersRef.current
        .filter(w => w.hp > 0)
        .reduce<(typeof workersRef.current)[0] | null>(
          (best, w) =>
            !best ||
            tileDist(lk.x, lk.y, w.x, w.y) <
              tileDist(lk.x, lk.y, best.x, best.y)
              ? w
              : best,
          null
        );
      const distToWorker = nearestWorker
        ? tileDist(lk.x, lk.y, nearestWorker.x, nearestWorker.y)
        : 999;
      const distToBarn = tileDist(lk.x, lk.y, BARN_POS.x, BARN_POS.y);

      // Attack nearest worker when adjacent
      if (nearestWorker && distToWorker <= 1.2) {
        if (!lurkerAttackTimeoutsRef.current[lk.id]) {
          const wid = nearestWorker.id;
          const capturedWX = Math.round(nearestWorker.x),
            capturedWY = Math.round(nearestWorker.y);
          const capturedLkId = lk.id;
          lurkerAttackTimeoutsRef.current[capturedLkId] = window.setTimeout(
            () => {
              delete lurkerAttackTimeoutsRef.current[capturedLkId];
              setWorkers(ws =>
                ws.map(w => {
                  if (w.id !== wid || w.hp <= 0) return w;
                  addFloatingText(
                    capturedWX,
                    capturedWY,
                    `-${LURKER_DAMAGE}`,
                    '#99f6e4'
                  );
                  return { ...w, hp: Math.max(0, w.hp - LURKER_DAMAGE) };
                })
              );
            },
            LURKER_ATTACK_MS
          );
        }
        return { ...lk, state: 'attacking' as const };
      }

      // Attack barn when adjacent (use negative id to avoid collision with worker-attack keys)
      if (distToBarn <= 1.2) {
        const barnKey = -lk.id;
        if (!lurkerAttackTimeoutsRef.current[barnKey]) {
          lurkerAttackTimeoutsRef.current[barnKey] = window.setTimeout(() => {
            delete lurkerAttackTimeoutsRef.current[barnKey];
            addDmgLog('🦇 Night Lurker', LURKER_DAMAGE);
            barnDmgThisWaveRef.current += LURKER_DAMAGE;
            setPlayerBarnHp(hp => Math.max(0, hp - LURKER_DAMAGE));
            addFloatingText(
              BARN_POS.x,
              BARN_POS.y,
              `-${LURKER_DAMAGE}🏰`,
              '#99f6e4'
            );
          }, LURKER_ATTACK_MS);
        }
        return { ...lk, state: 'attacking' as const };
      }

      // Chase nearest worker if within 5 tiles, else march to barn
      const chaseTarget =
        nearestWorker && distToWorker <= 5
          ? {
              x: Math.round(nearestWorker.x),
              y: Math.round(nearestWorker.y),
            }
          : null;
      const dest = chaseTarget ?? BARN_POS;

      if (lk.movingTo) {
        const dx = lk.movingTo.x - lk.x,
          dy = lk.movingTo.y - lk.y;
        const distLK = Math.sqrt(dx * dx + dy * dy);
        if (distLK < 0.1) {
          const next = lk.path[0] ?? null;
          return {
            ...lk,
            x: lk.movingTo.x,
            y: lk.movingTo.y,
            movingTo: next,
            path: lk.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...lk,
          x: lk.x + (dx / distLK) * Math.min(LURKER_SPEED * dt, distLK),
          y: lk.y + (dy / distLK) * Math.min(LURKER_SPEED * dt, distLK),
          state: 'moving' as const,
        };
      }
      // Need new path — pathfind around walls
      const wallSetLK = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const pLK = aStar(
        INITIAL_TILES,
        { x: Math.round(lk.x), y: Math.round(lk.y) },
        dest,
        true,
        wallSetLK
      );
      return { ...lk, movingTo: pLK[0] ?? dest, path: pLK.slice(1) };
    });
  });
}
