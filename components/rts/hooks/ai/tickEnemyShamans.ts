// Enemy shaman AI tick � heal injured grunts and march to barn.

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
export function tickEnemyShamans(ctx: RTSGameContext, dt: number): void {
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
  // Update Shamans
  setEnemyShamans(ss => {
    const alive = ss.filter(s => s.hp > 0);
    const killed = ss.filter(s => s.hp <= 0);
    if (killed.length > 0) {
      killed.forEach(s => {
        setResources(res => ({
          ...res,
          gold: res.gold + SHAMAN_GOLD_REWARD,
        }));
        addFloatingText(
          Math.round(s.x),
          Math.round(s.y),
          `+${SHAMAN_GOLD_REWARD}🪙`,
          '#fbbf24'
        );
      });
    }
    return alive.map(s => {
      // Find nearest injured grunt within heal radius to follow
      const injuredGrunts = enemyGruntsRef.current.filter(
        g => g.hp > 0 && g.hp < g.maxHp
      );
      const nearInjured = injuredGrunts.sort(
        (a, b2) => tileDist(s.x, s.y, a.x, a.y) - tileDist(s.x, s.y, b2.x, b2.y)
      )[0];
      if (nearInjured) {
        const d = tileDist(s.x, s.y, nearInjured.x, nearInjured.y);
        if (d <= SHAMAN_HEAL_RADIUS) {
          // In range — heal nearby grunts
          if (!shamanHealTimersRef.current[s.id]) {
            const sid = s.id;
            shamanHealTimersRef.current[sid] = window.setTimeout(() => {
              delete shamanHealTimersRef.current[sid];
              setEnemyGrunts(gs =>
                gs.map(g => {
                  if (
                    g.hp <= 0 ||
                    tileDist(s.x, s.y, g.x, g.y) > SHAMAN_HEAL_RADIUS
                  )
                    return g;
                  const newHp = Math.min(g.maxHp, g.hp + SHAMAN_HEAL_AMOUNT);
                  if (newHp > g.hp)
                    addFloatingText(
                      Math.round(g.x),
                      Math.round(g.y),
                      `🧙+${SHAMAN_HEAL_AMOUNT}`,
                      '#86efac'
                    );
                  return { ...g, hp: newHp };
                })
              );
            }, SHAMAN_HEAL_MS);
          }
          return { ...s, state: 'healing' as const };
        }
        // Move toward injured grunt
        const dx = nearInjured.x - s.x,
          dy = nearInjured.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return {
          ...s,
          x: s.x + (dx / dist) * Math.min(SHAMAN_SPEED * dt, dist),
          y: s.y + (dy / dist) * Math.min(SHAMAN_SPEED * dt, dist),
          state: 'moving' as const,
        };
      }
      // No injured grunts — follow nearest grunt toward barn
      if (s.movingTo) {
        const dx = s.movingTo.x - s.x,
          dy = s.movingTo.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.1) {
          const next = s.path[0] ?? null;
          return {
            ...s,
            x: s.movingTo.x,
            y: s.movingTo.y,
            movingTo: next,
            path: s.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...s,
          x: s.x + (dx / dist) * Math.min(SHAMAN_SPEED * dt, dist),
          y: s.y + (dy / dist) * Math.min(SHAMAN_SPEED * dt, dist),
        };
      }
      const wallSetS = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const p = aStar(
        INITIAL_TILES,
        { x: Math.round(s.x), y: Math.round(s.y) },
        BARN_POS,
        true,
        wallSetS
      );
      return { ...s, movingTo: p[0] ?? BARN_POS, path: p.slice(1) };
    });
  });
}
