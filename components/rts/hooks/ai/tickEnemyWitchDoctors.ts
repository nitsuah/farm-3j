// Enemy witch doctor AI tick � buff nearby grunts and march to barn.

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
export function tickEnemyWitchDoctors(ctx: RTSGameContext, dt: number): void {
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
  // Update Witch Doctors
  const currentWDs = enemyWitchDoctorsRef.current;
  const killedWDs = currentWDs.filter(d => d.hp <= 0);
  killedWDs.forEach(d => {
    setResources(r => ({ ...r, gold: r.gold + WITCH_DOCTOR_GOLD_REWARD }));
    addFloatingText(
      Math.round(d.x),
      Math.round(d.y),
      `+${WITCH_DOCTOR_GOLD_REWARD}🪙`,
      '#fbbf24'
    );
    setKillCount(k => k + 1);
  });
  setEnemyWitchDoctors(wds => {
    return wds
      .filter(d => d.hp > 0)
      .map(wd => {
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
