// Enemy goblin sapper AI tick � move toward buildings and explode.

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
export function tickEnemySappers(
  ctx: RTSGameContext,
  dt: number,
  sapperWarnedRef: { current: Set<number> }
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
  // sapperWarnedRef is passed in from useGameLoop to persist across frames
  // Update Goblin Sappers
  const currentSappers = enemySappersRef.current;
  const killedSappers = currentSappers.filter(s => !s.exploded && s.hp <= 0);
  killedSappers.forEach(s => {
    sapperKillCountRef.current += 1;
    if (sapperKillCountRef.current >= 5) onAchievement('sapper_slayer');
    setResources(r => ({ ...r, gold: r.gold + SAPPER_GOLD_REWARD }));
    addFloatingText(
      Math.round(s.x),
      Math.round(s.y),
      `+${SAPPER_GOLD_REWARD}🪙 💥Defused!`,
      '#fbbf24'
    );
  });
  setEnemySappers(ss => {
    const alive = ss.filter(s => !s.exploded && s.hp > 0);
    return alive
      .map(s => {
        const distToTarget = tileDist(s.x, s.y, s.targetX, s.targetY);
        // Proximity warning when sapper closes within 4 tiles — shown once per sapper
        if (distToTarget < 4 && !sapperWarnedRef.current.has(s.id)) {
          sapperWarnedRef.current.add(s.id);
          addFloatingText(
            Math.round(s.x),
            Math.round(s.y),
            pickAck(ENEMY_VOICELINES.sapper_incoming ?? []),
            '#fbbf24'
          );
          Snd.sapperTick();
        }
        // Explode on reaching target
        if (distToTarget < 0.8) {
          addFloatingText(
            Math.round(s.x),
            Math.round(s.y),
            '💥 BOOM!',
            '#f97316'
          );
          // Damage all buildings in radius
          setPlacedBuildings(bs =>
            bs.map(b => {
              const d = tileDist(b.x, b.y, s.x, s.y);
              if (d > SAPPER_EXPLODE_RADIUS) return b;
              const newHp = Math.max(0, b.hp - SAPPER_EXPLODE_DAMAGE);
              addFloatingText(b.x, b.y, `-${SAPPER_EXPLODE_DAMAGE}`, '#ef4444');
              return { ...b, hp: newHp };
            })
          );
          // Damage player barn if in range
          if (
            tileDist(s.x, s.y, BARN_POS.x, BARN_POS.y) <= SAPPER_EXPLODE_RADIUS
          ) {
            addDmgLog('💣 Goblin Sapper', SAPPER_EXPLODE_DAMAGE);
            setPlayerBarnHp(hp => {
              const nHp = Math.max(0, hp - SAPPER_EXPLODE_DAMAGE);
              if (nHp <= 0) setGameOver('defeat');
              return nHp;
            });
            addFloatingText(
              BARN_POS.x,
              BARN_POS.y,
              `-${SAPPER_EXPLODE_DAMAGE}`,
              '#ef4444'
            );
          }
          // Damage workers in radius
          setWorkers(ws =>
            ws.map(w => {
              if (tileDist(w.x, w.y, s.x, s.y) > SAPPER_EXPLODE_RADIUS)
                return w;
              addFloatingText(
                Math.round(w.x),
                Math.round(w.y),
                `-${SAPPER_EXPLODE_DAMAGE}`,
                '#fca5a5'
              );
              return {
                ...w,
                hp: Math.max(0, w.hp - SAPPER_EXPLODE_DAMAGE),
              };
            })
          );
          // XP reward to nearby attackers
          setWorkers(ws2 =>
            ws2.map(u => {
              if (!u.attacking || u.attacking.targetType !== 'sapper') return u;
              const xpGain = SAPPER_XP_REWARD;
              const newXp = u.xp + xpGain;
              const newLevel =
                newXp >= XP_TO_LEVEL_3
                  ? 3
                  : newXp >= XP_TO_LEVEL_2
                    ? 2
                    : newXp >= XP_TO_LEVEL_1
                      ? 1
                      : 0;
              if (newLevel > u.level) {
                addFloatingText(
                  Math.round(u.x),
                  Math.round(u.y),
                  `⭐ Level ${newLevel}!`,
                  '#fbbf24'
                );
                return {
                  ...u,
                  xp: newXp,
                  level: newLevel,
                  maxHp: u.maxHp + VETERAN_HP_BONUS,
                  hp: Math.min(
                    u.hp + VETERAN_HP_BONUS,
                    u.maxHp + VETERAN_HP_BONUS
                  ),
                  attacking: null,
                  state: 'idle' as const,
                };
              }
              return {
                ...u,
                xp: newXp,
                attacking: null,
                state: 'idle' as const,
              };
            })
          );
          return { ...s, exploded: true };
        }
        // Move toward target
        if (s.movingTo) {
          const dx = s.movingTo.x - s.x,
            dy = s.movingTo.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.1) {
            const next = s.path[0] ?? null;
            if (!next)
              return {
                ...s,
                x: s.movingTo.x,
                y: s.movingTo.y,
                movingTo: null,
                path: [],
              };
            return {
              ...s,
              x: s.movingTo.x,
              y: s.movingTo.y,
              movingTo: next,
              path: s.path.slice(1),
            };
          }
          return {
            ...s,
            x: s.x + (dx / dist) * Math.min(SAPPER_SPEED * dt, dist),
            y: s.y + (dy / dist) * Math.min(SAPPER_SPEED * dt, dist),
          };
        }
        const wallSetSp = new Set(
          placedBuildingsRef.current
            .filter(b => b.type === 'wall')
            .map(b => `${b.x},${b.y}`)
        );
        const p = aStar(
          INITIAL_TILES,
          { x: Math.round(s.x), y: Math.round(s.y) },
          { x: s.targetX, y: s.targetY },
          true,
          wallSetSp
        );
        return {
          ...s,
          movingTo: p[0] ?? { x: s.targetX, y: s.targetY },
          path: p.slice(1),
        };
      })
      .filter(s => !s.exploded);
  });
}
