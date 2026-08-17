// Enemy warchief AI tick � War Stomp AoE + march to barn.

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
export function tickEnemyWarchiefs(ctx: RTSGameContext, dt: number): void {
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
  // Update Enemy Warchiefs (War Stomp + march to barn)
  setEnemyWarchiefs(wcs => {
    const alive = wcs.filter(wc2 => wc2.hp > 0);
    const killed = wcs.filter(wc2 => wc2.hp <= 0);
    killed.forEach(wc2 => {
      setResources(r => ({ ...r, gold: r.gold + WARCHIEF_GOLD_REWARD }));
      addFloatingText(
        Math.round(wc2.x),
        Math.round(wc2.y),
        `👑 +${WARCHIEF_GOLD_REWARD}🪙`,
        '#fbbf24'
      );
      const wcPool2: HeroItemId[] = [
        'battle_sword',
        'shield_pendant',
        'tome_xp',
        'healing_potion',
      ];
      const wcDrop2 = wcPool2[Math.floor(Math.random() * wcPool2.length)]!;
      setDroppedItems(ds => [
        ...ds,
        {
          id: dropItemIdRef.current++,
          itemId: wcDrop2,
          x: Math.round(wc2.x),
          y: Math.round(wc2.y),
        },
      ]);
      addFloatingText(
        Math.round(wc2.x),
        Math.round(wc2.y),
        `👑 ${HERO_ITEM_DATA[wcDrop2].emoji} Dropped!`,
        '#c084fc'
      );
    });
    const now = Date.now();
    return alive.map(wc2 => {
      // War Stomp: every WARCHIEF_STOMP_COOLDOWN_MS stun all workers within radius
      if (now - wc2.lastStompAt >= WARCHIEF_STOMP_COOLDOWN_MS) {
        const stunUntil = now + WARCHIEF_STOMP_SLOW_MS;
        setWorkers(ws =>
          ws.map(w => {
            if (
              w.hp <= 0 ||
              tileDist(w.x, w.y, wc2.x, wc2.y) > WARCHIEF_STOMP_RADIUS
            )
              return w;
            addFloatingText(
              Math.round(w.x),
              Math.round(w.y),
              '💫STUNNED!',
              '#fbbf24'
            );
            return { ...w, stunUntil };
          })
        );
        Snd.warchiefStomp();
        addFloatingText(
          Math.round(wc2.x),
          Math.round(wc2.y),
          '👊 WAR STOMP!',
          '#ef4444'
        );
        addFloatingText(
          Math.round(wc2.x),
          Math.round(wc2.y) - 1,
          pickAck(ENEMY_VOICELINES.warchief_stomp ?? []),
          '#fbbf24'
        );
        return { ...wc2, state: 'stomping' as const, lastStompAt: now };
      }
      // Attack barn when adjacent
      const distToBarn = tileDist(wc2.x, wc2.y, BARN_POS.x, BARN_POS.y);
      if (distToBarn <= 1.2) {
        addDmgLog('⚔️ Warchief', WARCHIEF_DMG);
        setPlayerBarnHp(hp => Math.max(0, hp - WARCHIEF_DMG));
        addFloatingText(
          BARN_POS.x,
          BARN_POS.y,
          `-${WARCHIEF_DMG}🏰`,
          '#fca5a5'
        );
        return { ...wc2, state: 'attacking' as const };
      }
      // March toward barn
      if (wc2.movingTo) {
        const dx = wc2.movingTo.x - wc2.x,
          dy = wc2.movingTo.y - wc2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.1) {
          const next = wc2.path[0] ?? null;
          return {
            ...wc2,
            x: wc2.movingTo.x,
            y: wc2.movingTo.y,
            movingTo: next,
            path: wc2.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...wc2,
          x: wc2.x + (dx / dist) * Math.min(WARCHIEF_SPEED * dt, dist),
          y: wc2.y + (dy / dist) * Math.min(WARCHIEF_SPEED * dt, dist),
          state: 'moving' as const,
        };
      }
      const wallSetWC2 = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const pWC = aStar(
        INITIAL_TILES,
        { x: Math.round(wc2.x), y: Math.round(wc2.y) },
        BARN_POS,
        true,
        wallSetWC2
      );
      return { ...wc2, movingTo: pWC[0] ?? BARN_POS, path: pWC.slice(1) };
    });
  });
}
