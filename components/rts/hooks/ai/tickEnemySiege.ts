// Enemy siege (War Ram / Demolisher) AI tick.

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
export function tickEnemySiege(ctx: RTSGameContext, dt: number): void {
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
