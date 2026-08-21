// Enemy warlord AI tick � War Cry slow + Shield Bash + march to barn.

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
export function tickEnemyWarlords(ctx: RTSGameContext, dt: number): void {
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
  // Update Enemy Warlords (War Cry slow AoE + Shield Bash hero stun + march to barn)
  const currentWarlords = enemyWarlordsRef.current;
  const killedWarlords = currentWarlords.filter(wl => wl.hp <= 0);
  killedWarlords.forEach(wl => {
    setResources(r => ({ ...r, gold: r.gold + WARLORD_GOLD_REWARD }));
    addFloatingText(
      Math.round(wl.x),
      Math.round(wl.y),
      `⚔ +${WARLORD_GOLD_REWARD}🪙`,
      '#c4b5fd'
    );
    const wlDropPool: HeroItemId[] = ['battle_sword', 'boots_speed'];
    const wlDrop = wlDropPool[Math.floor(Math.random() * wlDropPool.length)]!;
    setDroppedItems(ds => [
      ...ds,
      {
        id: dropItemIdRef.current++,
        itemId: wlDrop,
        x: Math.round(wl.x),
        y: Math.round(wl.y),
      },
    ]);
    addFloatingText(
      Math.round(wl.x),
      Math.round(wl.y),
      `⚔ ${HERO_ITEM_DATA[wlDrop].emoji} Dropped!`,
      '#c084fc'
    );
  });
  setEnemyWarlords((wls: EnemyWarlord[]) => {
    const alive = wls.filter(wl => wl.hp > 0);
    const now = Date.now();
    return alive.map(wl => {
      // War Cry: slow all workers in radius
      if (now - wl.lastWarCryAt >= WARLORD_WAR_CRY_COOLDOWN_MS) {
        const slowUntil = now + WARLORD_WAR_CRY_SLOW_MS;
        setWorkers(ws =>
          ws.map(w => {
            if (
              w.hp <= 0 ||
              tileDist(w.x, w.y, wl.x, wl.y) > WARLORD_WAR_CRY_RADIUS
            )
              return w;
            addFloatingText(
              Math.round(w.x),
              Math.round(w.y),
              '🌀SLOWED!',
              '#a855f7'
            );
            return { ...w, stunUntil: slowUntil };
          })
        );
        Snd.warlordWarCry();
        addFloatingText(
          Math.round(wl.x),
          Math.round(wl.y),
          '📣 WAR CRY!',
          '#a855f7'
        );
        addFloatingText(
          Math.round(wl.x),
          Math.round(wl.y) - 1,
          pickAck(ENEMY_VOICELINES.warlord_warcry ?? []),
          '#c4b5fd'
        );
        return { ...wl, lastWarCryAt: now };
      }
      // Shield Bash: stun the closest hero within bash range
      if (now - wl.lastShieldBashAt >= WARLORD_SHIELD_BASH_COOLDOWN_MS) {
        const heroInRange = workersRef.current.find(
          w =>
            w.unitType === 'hero' &&
            w.hp > 0 &&
            tileDist(w.x, w.y, wl.x, wl.y) <= WARLORD_SHIELD_BASH_RANGE
        );
        if (heroInRange) {
          const stunUntil = now + WARLORD_SHIELD_BASH_STUN_MS;
          Snd.warlordShieldBash();
          setWorkers(ws =>
            ws.map(w => {
              if (w.id !== heroInRange.id) return w;
              addFloatingText(
                Math.round(w.x),
                Math.round(w.y),
                '🛡 SHIELD BASH!',
                '#ef4444'
              );
              return { ...w, stunUntil };
            })
          );
          addFloatingText(
            Math.round(wl.x),
            Math.round(wl.y) - 1,
            pickAck(ENEMY_VOICELINES.warlord_bash ?? []),
            '#c4b5fd'
          );
          return { ...wl, lastShieldBashAt: now };
        }
      }
      // Attack barn when adjacent
      const distToBarnWL = tileDist(wl.x, wl.y, BARN_POS.x, BARN_POS.y);
      if (distToBarnWL <= 1.2) {
        const wlBarnTimeouts = buildingAttackTimeoutsRef.current as Record<
          string,
          number
        >;
        const wlBarnKey = `wl_${wl.id}`;
        if (!wlBarnTimeouts[wlBarnKey]) {
          wlBarnTimeouts[wlBarnKey] = window.setTimeout(() => {
            delete wlBarnTimeouts[wlBarnKey];
            addDmgLog('⚔️ Warlord', WARLORD_DMG);
            setPlayerBarnHp(hp => Math.max(0, hp - WARLORD_DMG));
            addFloatingText(
              BARN_POS.x,
              BARN_POS.y,
              `-${WARLORD_DMG}🏰`,
              '#fca5a5'
            );
          }, ATTACK_INTERVAL_MS);
        }
        return { ...wl, state: 'attacking' as const };
      }
      // March toward barn
      if (wl.movingTo) {
        const dx = wl.movingTo.x - wl.x,
          dy = wl.movingTo.y - wl.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.1) {
          const next = wl.path[0] ?? null;
          return {
            ...wl,
            x: wl.movingTo.x,
            y: wl.movingTo.y,
            movingTo: next,
            path: wl.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...wl,
          x: wl.x + (dx / dist) * Math.min(WARLORD_SPEED * dt, dist),
          y: wl.y + (dy / dist) * Math.min(WARLORD_SPEED * dt, dist),
          state: 'moving' as const,
        };
      }
      const wallSetWL = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const pWL = aStar(
        INITIAL_TILES,
        { x: Math.round(wl.x), y: Math.round(wl.y) },
        BARN_POS,
        true,
        wallSetWL
      );
      return { ...wl, movingTo: pWL[0] ?? BARN_POS, path: pWL.slice(1) };
    });
  });
}
