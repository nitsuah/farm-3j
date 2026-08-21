// Enemy necromancer AI tick � raise dead grunts and march to barn.

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
export function tickEnemyNecromancers(ctx: RTSGameContext, dt: number): void {
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
  // Update Necromancers
  setEnemyNecromancers(ns => {
    const alive = ns.filter(n => n.hp > 0);
    const killed = ns.filter(n => n.hp <= 0);
    if (killed.length > 0) {
      killed.forEach(n => {
        setResources(r => ({
          ...r,
          gold: r.gold + NECROMANCER_GOLD_REWARD,
        }));
        addFloatingText(
          Math.round(n.x),
          Math.round(n.y),
          `+${NECROMANCER_GOLD_REWARD}🪙`,
          '#fbbf24'
        );
      });
    }
    return alive.map(n => {
      // Look for a recent dead grunt position within raise radius
      const now = Date.now();
      const nearCorpse = deadGruntPositionsRef.current.find(
        p =>
          now - p.t < 20000 &&
          tileDist(n.x, n.y, p.x, p.y) <= NECROMANCER_RAISE_RADIUS
      );
      if (nearCorpse) {
        if (!necromancerRaiseTimersRef.current[n.id]) {
          const nid = n.id;
          const cx2 = nearCorpse.x;
          const cy2 = nearCorpse.y;
          necromancerRaiseTimersRef.current[nid] = window.setTimeout(() => {
            delete necromancerRaiseTimersRef.current[nid];
            // Consume the corpse and spawn a skeleton grunt (half HP)
            setDeadGruntPositions(prev =>
              prev.filter(p => !(p.x === cx2 && p.y === cy2))
            );
            const skeletonHp = Math.round(GRUNT_MAX_HP * 0.5);
            const wallSetN = new Set(
              placedBuildingsRef.current
                .filter(b => b.type === 'wall')
                .map(b => `${b.x},${b.y}`)
            );
            const skPath = aStar(
              INITIAL_TILES,
              { x: cx2, y: cy2 },
              BARN_POS,
              true,
              wallSetN
            );
            const skeleton: EnemyGrunt = {
              id: gruntIdRef.current++,
              x: cx2,
              y: cy2,
              hp: skeletonHp,
              maxHp: skeletonHp,
              movingTo: skPath[0] ?? BARN_POS,
              path: skPath.slice(1),
              state: 'moving',
              isSkeleton: true,
            };
            setEnemyGrunts(gs => [...gs, skeleton]);
            addFloatingText(cx2, cy2, '💀 RAISED!', '#a855f7');
          }, NECROMANCER_RAISE_MS);
        }
        return { ...n, state: 'raising' as const };
      }
      // Move toward nearest corpse or follow grunts toward barn
      const nearestCorpse = deadGruntPositionsRef.current
        .filter(p => now - p.t < 20000)
        .sort(
          (a, b2) =>
            tileDist(n.x, n.y, a.x, a.y) - tileDist(n.x, n.y, b2.x, b2.y)
        )[0];
      const moveDest = nearestCorpse
        ? { x: nearestCorpse.x, y: nearestCorpse.y }
        : BARN_POS;
      if (n.movingTo) {
        const dx2 = n.movingTo.x - n.x,
          dy2 = n.movingTo.y - n.y;
        const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (d2 < 0.1) {
          const next2 = n.path[0] ?? null;
          return {
            ...n,
            x: n.movingTo.x,
            y: n.movingTo.y,
            movingTo: next2,
            path: n.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...n,
          x: n.x + (dx2 / d2) * Math.min(NECROMANCER_SPEED * dt, d2),
          y: n.y + (dy2 / d2) * Math.min(NECROMANCER_SPEED * dt, d2),
        };
      }
      const wallSetN2 = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const p2 = aStar(
        INITIAL_TILES,
        { x: Math.round(n.x), y: Math.round(n.y) },
        moveDest,
        true,
        wallSetN2
      );
      return { ...n, movingTo: p2[0] ?? moveDest, path: p2.slice(1) };
    });
  });
}
