// Enemy grunt AI tick � kill processing, building damage, and movement.

import {
  BARN_POS,
  BOSS_DAMAGE,
  BOSS_GOLD_REWARD,
  BUILDING_COSTS,
  BUILDING_GRUNT_DAMAGE,
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

const BUILDING_PRIORITY: Partial<Record<BuildingType, number>> = {
  barracks: 5,
  siegeWorkshop: 4,
  stable: 4,
  watchtower: 3,
  blacksmith: 2,
  farmhouse: 1,
};

export function tickEnemyGrunts(ctx: RTSGameContext, dt: number): void {
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
  const NIGHT_SPEED_MULT = 1.3;

  // Update enemy grunts
  const currentWorkers = workersRef.current;
  const currentGrunts = enemyGruntsRef.current;
  const killedGrunts = currentGrunts.filter(g => g.hp <= 0);
  if (killedGrunts.length > 0) {
    setKillCount(k => k + killedGrunts.length);
    const goldDrop = killedGrunts.reduce(
      (sum, g) => sum + (g.isBoss ? BOSS_GOLD_REWARD : 5),
      0
    );
    setResources(r => ({ ...r, gold: r.gold + goldDrop }));
    Snd.death();
    killedGrunts.forEach(g =>
      addFloatingText(
        Math.round(g.x),
        Math.round(g.y),
        g.isBoss ? `💀+${BOSS_GOLD_REWARD}🪙` : `+5🪙`,
        '#fbbf24'
      )
    );
    // Record positions for necromancer to raise
    const now = Date.now();
    setDeadGruntPositions(prev => [
      ...prev.filter(p => now - p.t < 20000),
      ...killedGrunts.map(g => ({
        x: Math.round(g.x),
        y: Math.round(g.y),
        t: now,
      })),
    ]);
  }
  setEnemyGrunts(gs => gs.filter(g => g.hp > 0));
  // Remove destroyed buildings and spawn loot drops (partial resource refund)
  setPlacedBuildings(bs => {
    const destroyed = bs.filter(b => b.hp <= 0);
    destroyed.forEach(b => {
      const cost = BUILDING_COSTS[b.type];
      if (!cost) return;
      const gold = Math.round((cost.gold ?? 0) * 0.3);
      const lumber = Math.round((cost.lumber ?? 0) * 0.3);
      const stone = Math.round((cost.stone ?? 0) * 0.3);
      if (gold > 0 || lumber > 0 || stone > 0) {
        const newId = lootCrateIdRef.current++;
        setLootCrates(lcs => [
          ...lcs,
          { id: newId, x: b.x, y: b.y, gold, lumber, stone },
        ]);
        addFloatingText(b.x, b.y, '💥 DESTROYED!', '#f97316');
      }
    });
    return bs.filter(b => b.hp > 0);
  });

  // Burn damage: buildings below 25% HP take 1 HP/s unless a worker is actively repairing
  const repairingBuildingIds = new Set(
    workersRef.current
      .filter(w => w.state === 'repairing' && w.repairing)
      .map(w => w.repairing!.buildingId)
  );
  setPlacedBuildings(bs =>
    bs.map(b => {
      if (b.hp <= 0 || b.hp / b.maxHp >= 0.25) return b;
      if (repairingBuildingIds.has(b.id)) return b;
      return { ...b, hp: Math.max(1, b.hp - dt) };
    })
  );

  const gruntSpeedMult =
    (isNightRef.current ? NIGHT_SPEED_MULT : 1) *
    (difficulty?.gruntSpeedMult ?? 1);
  const nowPoison = Date.now();
  setEnemyGrunts(gs =>
    gs.map(gIn => {
      let g = gIn;
      // Poison DoT tick — apply before other processing
      const poisoned = g.poisonedUntil && nowPoison < g.poisonedUntil;
      if (poisoned && g.poisonDps && g.poisonDps * dt > 0) {
        g = { ...g, hp: Math.max(0, g.hp - g.poisonDps * dt) };
      }
      const frostMult =
        g.frozenUntil && nowPoison < g.frozenUntil
          ? FROST_TOWER_SLOW_FACTOR
          : 1;
      // Proximity aggro: switch to attack nearest worker within 2 tiles
      const nearWorker = currentWorkers.find(
        w => w.hp > 0 && tileDist(g.x, g.y, w.x, w.y) <= 2
      );
      if (nearWorker) {
        const distToWorker = tileDist(g.x, g.y, nearWorker.x, nearWorker.y);
        if (distToWorker <= 1.4) {
          // Attack worker
          if (!gruntAttackTimeoutsRef.current[g.id]) {
            const wid = nearWorker.id;
            const capturedGruntId = g.id;
            const capturedWX = Math.round(nearWorker.x),
              capturedWY = Math.round(nearWorker.y);
            gruntAttackTimeoutsRef.current[g.id] = window.setTimeout(() => {
              delete gruntAttackTimeoutsRef.current[g.id];
              const gruntEnraged =
                (enemyGruntsRef.current.find(gg => gg.id === capturedGruntId)
                  ?.enragedUntil ?? 0) > Date.now();
              const targetHeroArmor =
                workersRef.current.find(w2 => w2.id === wid)?.unitType ===
                'hero'
                  ? heroItemsRef.current.reduce(
                      (s, it) =>
                        s + (HERO_ITEM_DATA[it.itemId].armorBonus ?? 0),
                      0
                    )
                  : 0;
              const gruntDmg = Math.max(
                1,
                Math.round(
                  (GRUNT_DAMAGE +
                    (gruntEnraged ? WITCH_DOCTOR_ENRAGE_DMG_BONUS : 0)) *
                    (difficulty?.gruntDmgMult ?? 1)
                ) -
                  blacksmithUpgradesRef.current.ironHide * 2 -
                  targetHeroArmor
              );
              setWorkers(ws2 =>
                ws2.map(w2 => {
                  if (w2.id !== wid) return w2;
                  const newHp = Math.max(0, w2.hp - gruntDmg);
                  // Auto-retaliate: if idle and capable of fighting, attack the grunt back
                  if (
                    w2.state === 'idle' &&
                    !w2.attacking &&
                    w2.unitType !== 'catapult' &&
                    w2.unitType !== 'trebuchet'
                  ) {
                    const attacker = enemyGruntsRef.current.find(
                      gg => gg.id === capturedGruntId && gg.hp > 0
                    );
                    if (attacker)
                      return {
                        ...w2,
                        hp: newHp,
                        attacking: {
                          targetType: 'grunt' as const,
                          gruntId: capturedGruntId,
                        },
                        state: 'attacking' as const,
                      };
                  }
                  return { ...w2, hp: newHp };
                })
              );
              workerHitRef.current.set(wid, Date.now());
              addFloatingText(
                capturedWX,
                capturedWY,
                `-${gruntDmg}`,
                '#ef4444'
              );
              Snd.hit();
              triggerUnderAttackRef.current({
                x: capturedWX,
                y: capturedWY,
              });
            }, GRUNT_ATTACK_MS);
          }
          return { ...g, movingTo: null, path: [], state: 'attacking' };
        }
        // Move toward worker
        const p = aStar(
          INITIAL_TILES,
          { x: Math.round(g.x), y: Math.round(g.y) },
          { x: Math.round(nearWorker.x), y: Math.round(nearWorker.y) },
          true,
          new Set(
            placedBuildingsRef.current
              .filter(b => b.type === 'wall')
              .map(b => `${b.x},${b.y}`)
          )
        );
        const dx = nearWorker.x - g.x,
          dy = nearWorker.y - g.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return {
          ...g,
          movingTo: p[0] ?? { x: nearWorker.x, y: nearWorker.y },
          path: p.slice(1),
          state: 'moving',
          x:
            g.x +
            (dx / d) *
              Math.min(GRUNT_SPEED * gruntSpeedMult * frostMult * dt, d),
          y:
            g.y +
            (dy / d) *
              Math.min(GRUNT_SPEED * gruntSpeedMult * frostMult * dt, d),
        };
      }

      // Building aggro: prioritize military buildings over economic ones (AoE-style target AI)
      const nearBuildingCandidates = placedBuildingsRef.current.filter(
        b =>
          b.type !== 'wall' &&
          b.hp > 0 &&
          !b.constructing &&
          tileDist(g.x, g.y, b.x, b.y) <= 1.2
      );
      const nearBuilding =
        nearBuildingCandidates.sort(
          (a, b2) =>
            (BUILDING_PRIORITY[b2.type] ?? 0) - (BUILDING_PRIORITY[a.type] ?? 0)
        )[0] ?? null;
      if (nearBuilding) {
        if (!buildingAttackTimeoutsRef.current[g.id]) {
          const bid = nearBuilding.id;
          const bx = nearBuilding.x;
          const by = nearBuilding.y;
          buildingAttackTimeoutsRef.current[g.id] = window.setTimeout(() => {
            delete buildingAttackTimeoutsRef.current[g.id];
            setPlacedBuildings(bs =>
              bs.map(b =>
                b.id === bid
                  ? {
                      ...b,
                      hp: Math.max(0, b.hp - BUILDING_GRUNT_DAMAGE),
                    }
                  : b
              )
            );
            addFloatingText(bx, by, `-${BUILDING_GRUNT_DAMAGE}`, '#f97316');
            triggerUnderAttackRef.current({ x: bx, y: by });
          }, GRUNT_ATTACK_MS);
        }
        return { ...g, movingTo: null, path: [], state: 'attacking' };
      }

      if (g.movingTo) {
        const dx = g.movingTo.x - g.x,
          dy = g.movingTo.y - g.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const epsilon = 0.12;
        if (d < epsilon) {
          if (g.path.length > 0) {
            const [next, ...rest] = g.path;
            return {
              ...g,
              x: g.movingTo.x,
              y: g.movingTo.y,
              movingTo: next ?? null,
              path: rest,
            };
          }
          return {
            ...g,
            x: g.movingTo.x,
            y: g.movingTo.y,
            movingTo: null,
            path: [],
            state: 'attacking',
          };
        }
        return {
          ...g,
          x:
            g.x +
            (dx / d) *
              Math.min(GRUNT_SPEED * gruntSpeedMult * frostMult * dt, d),
          y:
            g.y +
            (dy / d) *
              Math.min(GRUNT_SPEED * gruntSpeedMult * frostMult * dt, d),
        };
      }
      if (g.state === 'attacking') {
        // Require the grunt to be within melee range of the barn before it can deal damage.
        // Without this check a grunt stuck in 'attacking' state (e.g. after destroying a
        // building) would damage the barn from arbitrary distances.
        const distToBarnNow = tileDist(g.x, g.y, BARN_POS.x, BARN_POS.y);
        if (distToBarnNow > GRUNT_BARN_MELEE_RANGE) {
          // Not close enough — re-path to the barn and clear the stale attacking state
          const wallSet3 = new Set(
            placedBuildingsRef.current
              .filter(b => b.type === 'wall')
              .map(b => `${b.x},${b.y}`)
          );
          const pBarn = aStar(
            INITIAL_TILES,
            { x: Math.round(g.x), y: Math.round(g.y) },
            BARN_POS,
            true,
            wallSet3
          );
          return {
            ...g,
            movingTo: pBarn[0] ?? BARN_POS,
            path: pBarn.slice(1),
            state: 'moving' as const,
          };
        }
        if (!gruntAttackTimeoutsRef.current[g.id]) {
          gruntAttackTimeoutsRef.current[g.id] = window.setTimeout(() => {
            delete gruntAttackTimeoutsRef.current[g.id];
            const barnArmor = Math.min(
              8,
              garrisonedRef.current.length * GARRISON_ARMOR_PER_UNIT
            );
            const rawBarnDmg = g.isBoss ? BOSS_DAMAGE : GRUNT_DAMAGE;
            const barnDmg = Math.max(1, rawBarnDmg - barnArmor);
            Snd.hit();
            barnDmgThisWaveRef.current += barnDmg;
            addDmgLog(g.isBoss ? '🐂 Boss Grunt' : '👹 Grunt', barnDmg);
            setPlayerBarnHp(hp => {
              const nHp = Math.max(0, hp - barnDmg);
              if (nHp <= 0) setGameOver('defeat');
              return nHp;
            });
            addFloatingText(
              BARN_POS.x,
              BARN_POS.y,
              `-${barnDmg}`,
              g.isBoss ? '#dc2626' : '#ef4444'
            );
            triggerUnderAttackRef.current({ x: BARN_POS.x, y: BARN_POS.y });
            if (g.isBoss) triggerShakeRef.current(2);
          }, GRUNT_ATTACK_MS);
        }
      }
      // If grunt has no path and isn't attacking anything, re-path to highest-priority building in range or barn
      if (!g.movingTo && g.state !== 'attacking') {
        const buildings = placedBuildingsRef.current.filter(
          b => b.type !== 'wall' && b.hp > 0
        );
        const target = buildings.sort(
          (a, b2) =>
            (BUILDING_PRIORITY[b2.type] ?? 0) - (BUILDING_PRIORITY[a.type] ?? 0)
        )[0];
        const dest = target ? { x: target.x, y: target.y } : BARN_POS;
        const wallSet2 = new Set(
          placedBuildingsRef.current
            .filter(b => b.type === 'wall')
            .map(b => `${b.x},${b.y}`)
        );
        const p2 = aStar(
          INITIAL_TILES,
          { x: Math.round(g.x), y: Math.round(g.y) },
          dest,
          true,
          wallSet2
        );
        return {
          ...g,
          movingTo: p2[0] ?? dest,
          path: p2.slice(1),
          state: 'moving',
        };
      }
      return g;
    })
  );
}
