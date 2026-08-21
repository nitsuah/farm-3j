// Neutral creep AI tick � aggro nearest worker, leash, return home.

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
  WorkerState,
} from '../../game/types';
import type { RTSGameContext } from '../context';
export function tickNeutralCreeps(ctx: RTSGameContext, dt: number): void {
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
  // Update neutral creeps
  const currentCreeps = neutralCreepsRef.current;
  const killedCreeps = currentCreeps.filter(c => c.hp <= 0);
  if (killedCreeps.length > 0) {
    const aliveCreeps = currentCreeps.filter(c => c.hp > 0);
    // Check if any camp is now fully cleared
    CREEP_CAMPS.forEach(camp => {
      const campAlive = aliveCreeps.filter(c => c.campId === camp.id);
      if (
        campAlive.length === 0 &&
        killedCreeps.some(c => c.campId === camp.id)
      ) {
        setClearedCamps(s => {
          if (s.has(camp.id)) return s;
          const n = new Set(s);
          n.add(camp.id);
          return n;
        });
        campClearedAtRef.current[camp.id] = Date.now();
        setResources(r => ({ ...r, gold: r.gold + camp.goldReward }));
        addFloatingText(
          camp.x,
          camp.y,
          `+${camp.goldReward}🪙 Camp!`,
          '#fbbf24'
        );
        if (Math.random() < 0.65) {
          const pool: HeroItemId[] = [
            'boots_speed',
            'battle_sword',
            'shield_pendant',
            'healing_potion',
          ];
          const pick = pool[Math.floor(Math.random() * pool.length)]!;
          setDroppedItems(ds => [
            ...ds,
            {
              id: dropItemIdRef.current++,
              itemId: pick,
              x: camp.x,
              y: camp.y + 1,
            },
          ]);
          addFloatingText(
            camp.x,
            camp.y,
            `📦 ${HERO_ITEM_DATA[pick].emoji} Item!`,
            '#c084fc'
          );
        }
      }
    });
    killedCreeps.forEach(c => {
      if (creepAttackTimeoutsRef.current[c.id]) {
        clearTimeout(creepAttackTimeoutsRef.current[c.id]);
        delete creepAttackTimeoutsRef.current[c.id];
      }
    });
  }
  setNeutralCreeps(creeps => {
    const alive = creeps.filter(c => c.hp > 0);
    return alive.map(c => {
      const workers2 = workersRef.current;
      // Leash: if too far from home, return
      const distHome = tileDist(c.x, c.y, c.homeX, c.homeY);
      if (distHome > CREEP_LEASH_RANGE) {
        return {
          ...c,
          state: 'returning' as const,
          targetWorkerId: null,
          x:
            c.x +
            ((c.homeX - c.x) / distHome) * Math.min(CREEP_SPEED * dt, distHome),
          y:
            c.y +
            ((c.homeY - c.y) / distHome) * Math.min(CREEP_SPEED * dt, distHome),
        };
      }
      // Aggro nearest worker in range
      const aggro = workers2.reduce<WorkerState | null>((best, w) => {
        const d = tileDist(c.x, c.y, w.x, w.y);
        if (d > CREEP_AGGRO_RANGE) return best;
        if (!best || d < tileDist(c.x, c.y, best.x, best.y)) return w;
        return best;
      }, null);
      if (aggro) {
        const distW = tileDist(c.x, c.y, aggro.x, aggro.y);
        if (distW <= 1.4) {
          if (!creepAttackTimeoutsRef.current[c.id]) {
            const wid = aggro.id;
            const capturedX = Math.round(aggro.x),
              capturedY = Math.round(aggro.y);
            creepAttackTimeoutsRef.current[c.id] = window.setTimeout(() => {
              delete creepAttackTimeoutsRef.current[c.id];
              const creepDmg = Math.max(
                1,
                CREEP_DAMAGE - blacksmithUpgradesRef.current.ironHide * 2
              );
              setWorkers(ws2 =>
                ws2.map(w2 =>
                  w2.id === wid
                    ? { ...w2, hp: Math.max(0, w2.hp - creepDmg) }
                    : w2
                )
              );
              addFloatingText(capturedX, capturedY, `-${creepDmg}`, '#a855f7');
            }, CREEP_ATTACK_MS);
          }
          return {
            ...c,
            state: 'chasing' as const,
            targetWorkerId: aggro.id,
          };
        }
        const dx2 = aggro.x - c.x,
          dy2 = aggro.y - c.y;
        const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        return {
          ...c,
          state: 'chasing' as const,
          targetWorkerId: aggro.id,
          x: c.x + (dx2 / d2) * Math.min(CREEP_SPEED * dt, d2),
          y: c.y + (dy2 / d2) * Math.min(CREEP_SPEED * dt, d2),
        };
      }
      // Return home if no aggro
      if (c.state === 'chasing' || c.state === 'returning') {
        if (distHome < 0.15)
          return {
            ...c,
            state: 'idle' as const,
            targetWorkerId: null,
            x: c.homeX,
            y: c.homeY,
          };
        const dx3 = c.homeX - c.x,
          dy3 = c.homeY - c.y;
        const d3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
        return {
          ...c,
          state: 'returning' as const,
          targetWorkerId: null,
          x: c.x + (dx3 / d3) * Math.min(CREEP_SPEED * dt, d3),
          y: c.y + (dy3 / d3) * Math.min(CREEP_SPEED * dt, d3),
        };
      }
      return c;
    });
  });
}
