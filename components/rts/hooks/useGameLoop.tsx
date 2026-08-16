import { useEffect, useRef } from 'react';

import {
  ATTACK_DAMAGE,
  ATTACK_INTERVAL_MS,
  BARN_POS,
  BARN_VISION,
  BOSS_XP_REWARD,
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
  DEMOLISHER_XP_REWARD,
  ENEMY_BARN_MAX_HP,
  ENEMY_BARN_POS,
  ENEMY_COUNTER_DAMAGE,
  GATHER_INTERVAL_MS,
  GRID_SIZE,
  GRUNT_MAX_HP,
  HERO_DAMAGE_BONUS,
  HERO_ITEM_DATA,
  HERO_MAX_ITEMS,
  HERO_SHOUT_ATK_MULT,
  HERO_SHOUT_RADIUS,
  LUMBER_SHED_BONUS_MS,
  NECROMANCER_XP_REWARD,
  REPAIR_AMOUNT,
  REPAIR_INTERVAL_MS,
  REPAIR_RADIUS,
  SHAMAN_GOLD_REWARD,
  SHAMAN_XP_REWARD,
  SWORDSMAN_DAMAGE_BONUS,
  TREBUCHET_DAMAGE,
  TREBUCHET_FIRE_MS,
  TREBUCHET_MIN_RANGE,
  TREBUCHET_RANGE,
  TREBUCHET_SPEED,
  TROLL_XP_REWARD,
  VETERAN_ATK_BONUS,
  VETERAN_HP_BONUS,
  WARCHIEF_GOLD_REWARD,
  WARCHIEF_XP_REWARD,
  WARLORD_GOLD_REWARD,
  WARLORD_XP_REWARD,
  LURKER_XP_REWARD,
  WAR_RAM_XP_REWARD,
  WATCHTOWER_VISION,
  WITCH_DOCTOR_GOLD_REWARD,
  WITCH_DOCTOR_XP_REWARD,
  WORKER_SPEED,
  WORKER_VISION,
  XP_PER_KILL,
  XP_TO_LEVEL_1,
  XP_TO_LEVEL_2,
  XP_TO_LEVEL_3,
} from '../game/constants';
import { INITIAL_TILES, computeVisible, tileDist } from '../game/map';
import { aStar } from '../game/pathfinding';
import { Snd } from '../game/sound';
import type {
  EnemyGrunt,
  HeroItemId,
  ResourceNode,
} from '../game/types';
import type { RTSGameContext } from './context';
import { tickEnemyGrunts } from './ai/tickEnemyGrunts';
import { tickGoblinSappers } from './ai/tickGoblinSappers';
import { tickLurkers } from './ai/tickLurkers';
import { tickNecromancers } from './ai/tickNecromancers';
import { tickNeutralCreeps } from './ai/tickNeutralCreeps';
import { tickShamans } from './ai/tickShamans';
import { tickTrollArchers } from './ai/tickTrollArchers';
import { tickWarchiefs } from './ai/tickWarchiefs';
import { tickWarRams } from './ai/tickWarRams';
import { tickWarlords } from './ai/tickWarlords';
import { tickWitchDoctors } from './ai/tickWitchDoctors';

export function useGameLoop(ctx: RTSGameContext) {
  const lurkerKillCountRef = useRef(0);
  const sapperWarnedRef = useRef<Set<number>>(new Set());
  const {
    onAchievement,
    addFloatingText,
    addProjectile,
    animationRef,
    attackTimeoutsRef,
    barracksTechRef,
    battleShoutUntilRef,
    blacksmithUpgradesRef,
    buildingRepairTimeoutsRef,
    creepAttackTimeoutsRef,
    deadWorkerIdsRef,
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
    enemyWarchiefsRef,
    enemyWarlordsRef,
    enemyLurkersRef,
    enemyWitchDoctorsRef,
    fogExploredRef,
    fogVisibleRef,
    gameSpeedRef,
    gatherTimeoutsRef,
    goldMinesRef,
    gruntAttackTimeoutsRef,
    gruntHitRef,
    gruntIdRef,
    harvestBoonRef,
    heroItemsRef,
    incomeAccRef,
    lastFogUpdateRef,
    lastStandEnrageRef,
    lootCratesRef,
    neutralCreepsRef,
    pendingPickupRef,
    placedBuildingsRef,
    prevTimeRef,
    repairTimeoutsRef,
    sallyForthThresholdsRef,
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
    setEnemyWarlords,
    setEnemyLurkers,
    setEnemyWitchDoctors,
    setFogExplored,
    setFogVisible,
    setGameOver,
    setGoldMines,
    setHeroItems,
    setLootCrates,
    setNeutralCreeps,
    setPlacedBuildings,
    setResources,
    setStoneNodes,
    setTotalGold,
    setTotalLumber,
    setTotalStone,
    setTrees,
    setWaveAnnouncement,
    setWorkers,
    shrinePlentyBuffRef,
    shrineWarBuffRef,
    stanceRef,
    stoneNodesRef,
    treesRef,
    upgradesRef,
    upkeepMultRef,
    waveRef,
    workersRef,
  } = ctx;

  // Animation loop
  useEffect(() => {
    function animate(timestamp: number) {
      // When paused, skip all game-state updates to avoid 60fps React re-renders
      if (gameSpeedRef.current === 0) {
        prevTimeRef.current = null; // reset so we get a clean delta on resume
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      const deltaTime =
        prevTimeRef.current !== null
          ? (timestamp - prevTimeRef.current) / 1000
          : 1 / 60;
      const dt = Math.min(deltaTime, 0.1) * gameSpeedRef.current;
      prevTimeRef.current = timestamp;

      const curTrees = treesRef.current;
      const curGoldMines = goldMinesRef.current;
      const curStone = stoneNodesRef.current;
      const gatherT = gatherTimeoutsRef.current;
      const attackT = attackTimeoutsRef.current;

      // Morale aura: hero within 3 tiles speeds up attack interval by 30%
      // Battle Shout (level 2 hero ability): all units within 4 tiles get 40% faster attacks for 8s
      const heroUnit = workersRef.current.find(
        w => w.unitType === 'hero' && w.hp > 0
      );
      const shouting = battleShoutUntilRef.current > Date.now();
      const getMoraleMs = (wx: number, wy: number) => {
        if (!heroUnit) return ATTACK_INTERVAL_MS;
        const moraleMult =
          tileDist(wx, wy, heroUnit.x, heroUnit.y) <= 3 ? 0.7 : 1;
        const shoutMult =
          shouting &&
          tileDist(wx, wy, heroUnit.x, heroUnit.y) <= HERO_SHOUT_RADIUS
            ? HERO_SHOUT_ATK_MULT
            : 1;
        return Math.round(ATTACK_INTERVAL_MS * moraleMult * shoutMult);
      };

      // Hero item auto-pickup (must run outside setWorkers updater to avoid nested setState)
      const heroForPickup = workersRef.current.find(
        w => w.unitType === 'hero' && w.hp > 0
      );
      if (heroForPickup) {
        const nearItem = droppedItemsRef.current.find(
          d =>
            !pendingPickupRef.current.has(d.id) &&
            tileDist(d.x, d.y, heroForPickup.x, heroForPickup.y) <= 1.0
        );
        if (nearItem) {
          const data = HERO_ITEM_DATA[nearItem.itemId];
          if (nearItem.itemId === 'tome_xp') {
            pendingPickupRef.current.add(nearItem.id);
            setWorkers(ws2 =>
              ws2.map(u => {
                if (u.unitType !== 'hero') return u;
                const newXp = u.xp + 80;
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
                  };
                }
                return { ...u, xp: newXp };
              })
            );
            addFloatingText(
              Math.round(heroForPickup.x),
              Math.round(heroForPickup.y),
              `📖 +80 XP!`,
              '#c084fc'
            );
            setDroppedItems(ds => {
              pendingPickupRef.current.delete(nearItem.id);
              return ds.filter(d => d.id !== nearItem.id);
            });
          } else if (heroItemsRef.current.length < HERO_MAX_ITEMS) {
            pendingPickupRef.current.add(nearItem.id);
            setHeroItems(hi => [
              ...hi,
              { id: nearItem.id, itemId: nearItem.itemId },
            ]);
            setDroppedItems(ds => {
              pendingPickupRef.current.delete(nearItem.id);
              return ds.filter(d => d.id !== nearItem.id);
            });
            addFloatingText(
              Math.round(heroForPickup.x),
              Math.round(heroForPickup.y),
              `${data.emoji} ${data.name}!`,
              '#c084fc'
            );
          }
        }
      }

      // Update workers — compute food loss from ref to avoid setState-inside-updater
      const deadWorkerCount = workersRef.current.filter(w => w.hp <= 0).length;
      if (deadWorkerCount > 0)
        setResources(r => ({
          ...r,
          food: Math.max(0, r.food - deadWorkerCount),
        }));
      setWorkers(ws => {
        const alive = ws.filter(w => w.hp > 0);

        return alive.map(w => {
          // Stun check: War Stomp from Warchief freezes unit in place
          if (w.stunUntil && Date.now() < w.stunUntil) return w;

          // Attack-move: scan for nearby enemies while marching
          if (w.attackMove && w.state === 'moving' && !w.attacking) {
            const AM_SCAN = 2.5;
            const nearGrunt = enemyGruntsRef.current.find(
              g => g.hp > 0 && tileDist(w.x, w.y, g.x, g.y) <= AM_SCAN
            );
            if (nearGrunt)
              return {
                ...w,
                attacking: {
                  targetType: 'grunt' as const,
                  gruntId: nearGrunt.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearCreep = neutralCreepsRef.current.find(
              c => c.hp > 0 && tileDist(w.x, w.y, c.x, c.y) <= AM_SCAN
            );
            if (nearCreep)
              return {
                ...w,
                attacking: {
                  targetType: 'creep' as const,
                  creepId: nearCreep.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearRam = enemySiegeRef.current.find(
              r => r.hp > 0 && tileDist(w.x, w.y, r.x, r.y) <= AM_SCAN
            );
            if (nearRam)
              return {
                ...w,
                attacking: {
                  targetType: 'siege' as const,
                  siegeId: nearRam.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearShaman = enemyShamansRef.current.find(
              s => s.hp > 0 && tileDist(w.x, w.y, s.x, s.y) <= AM_SCAN
            );
            if (nearShaman)
              return {
                ...w,
                attacking: {
                  targetType: 'shaman' as const,
                  shamanId: nearShaman.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearTroll = enemyTrollsRef.current.find(
              t => t.hp > 0 && tileDist(w.x, w.y, t.x, t.y) <= AM_SCAN
            );
            if (nearTroll)
              return {
                ...w,
                attacking: {
                  targetType: 'troll' as const,
                  trollId: nearTroll.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearSapper = enemySappersRef.current.find(
              s =>
                s.hp > 0 &&
                !s.exploded &&
                tileDist(w.x, w.y, s.x, s.y) <= AM_SCAN
            );
            if (nearSapper)
              return {
                ...w,
                attacking: {
                  targetType: 'sapper' as const,
                  sapperId: nearSapper.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearNecro = enemyNecromancersRef.current.find(
              n => n.hp > 0 && tileDist(w.x, w.y, n.x, n.y) <= AM_SCAN
            );
            if (nearNecro)
              return {
                ...w,
                attacking: {
                  targetType: 'necromancer' as const,
                  necromancerId: nearNecro.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearWD = enemyWitchDoctorsRef.current.find(
              d => d.hp > 0 && tileDist(w.x, w.y, d.x, d.y) <= AM_SCAN
            );
            if (nearWD)
              return {
                ...w,
                attacking: {
                  targetType: 'witchDoctor' as const,
                  witchDoctorId: nearWD.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearWC = enemyWarchiefsRef.current.find(
              wc2 => wc2.hp > 0 && tileDist(w.x, w.y, wc2.x, wc2.y) <= AM_SCAN
            );
            if (nearWC)
              return {
                ...w,
                attacking: {
                  targetType: 'warchief' as const,
                  warchiefId: nearWC.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearWL = enemyWarlordsRef.current.find(
              wl => wl.hp > 0 && tileDist(w.x, w.y, wl.x, wl.y) <= AM_SCAN
            );
            if (nearWL)
              return {
                ...w,
                attacking: {
                  targetType: 'warlord' as const,
                  warlordId: nearWL.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
            const nearLKAM = enemyLurkersRef.current.find(
              lk => lk.hp > 0 && tileDist(w.x, w.y, lk.x, lk.y) <= AM_SCAN
            );
            if (nearLKAM)
              return {
                ...w,
                attacking: {
                  targetType: 'lurker' as const,
                  lurkerId: nearLKAM.id,
                },
                state: 'attacking' as const,
                movingTo: null,
                path: [],
              };
          }
          // Hold position: stay put, auto-attack nearby enemies without chasing
          if (w.holdPosition) {
            if (
              w.state === 'idle' &&
              !w.attacking &&
              w.unitType !== 'farmer' &&
              w.unitType !== 'catapult' &&
              w.unitType !== 'trebuchet'
            ) {
              const HP_RANGE = 1.8;
              const nearGruntH = enemyGruntsRef.current.find(
                g => g.hp > 0 && tileDist(w.x, w.y, g.x, g.y) <= HP_RANGE
              );
              if (nearGruntH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'grunt' as const,
                    gruntId: nearGruntH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearRamH = enemySiegeRef.current.find(
                r => r.hp > 0 && tileDist(w.x, w.y, r.x, r.y) <= HP_RANGE
              );
              if (nearRamH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'siege' as const,
                    siegeId: nearRamH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearShamanH = enemyShamansRef.current.find(
                s => s.hp > 0 && tileDist(w.x, w.y, s.x, s.y) <= HP_RANGE
              );
              if (nearShamanH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'shaman' as const,
                    shamanId: nearShamanH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearTrollH = enemyTrollsRef.current.find(
                t => t.hp > 0 && tileDist(w.x, w.y, t.x, t.y) <= HP_RANGE
              );
              if (nearTrollH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'troll' as const,
                    trollId: nearTrollH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearSapperH = enemySappersRef.current.find(
                s =>
                  s.hp > 0 &&
                  !s.exploded &&
                  tileDist(w.x, w.y, s.x, s.y) <= HP_RANGE
              );
              if (nearSapperH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'sapper' as const,
                    sapperId: nearSapperH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearNecroH = enemyNecromancersRef.current.find(
                n => n.hp > 0 && tileDist(w.x, w.y, n.x, n.y) <= HP_RANGE
              );
              if (nearNecroH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'necromancer' as const,
                    necromancerId: nearNecroH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearWDH = enemyWitchDoctorsRef.current.find(
                d => d.hp > 0 && tileDist(w.x, w.y, d.x, d.y) <= HP_RANGE
              );
              if (nearWDH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'witchDoctor' as const,
                    witchDoctorId: nearWDH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearWCH = enemyWarchiefsRef.current.find(
                wc2 =>
                  wc2.hp > 0 && tileDist(w.x, w.y, wc2.x, wc2.y) <= HP_RANGE
              );
              if (nearWCH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'warchief' as const,
                    warchiefId: nearWCH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearWLH = enemyWarlordsRef.current.find(
                wl => wl.hp > 0 && tileDist(w.x, w.y, wl.x, wl.y) <= HP_RANGE
              );
              if (nearWLH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'warlord' as const,
                    warlordId: nearWLH.id,
                  },
                  state: 'attacking' as const,
                };
              const nearLKH = enemyLurkersRef.current.find(
                lk => lk.hp > 0 && tileDist(w.x, w.y, lk.x, lk.y) <= HP_RANGE
              );
              if (nearLKH)
                return {
                  ...w,
                  attacking: {
                    targetType: 'lurker' as const,
                    lurkerId: nearLKH.id,
                  },
                  state: 'attacking' as const,
                };
            }
            // After killing target, go back to idle (don't chase)
            if (w.state === 'attacking' && w.attacking) {
              const isGruntDead =
                w.attacking.targetType === 'grunt' &&
                !enemyGruntsRef.current.find(
                  g =>
                    g.id ===
                      (w.attacking as { targetType: 'grunt'; gruntId: number })
                        .gruntId && g.hp > 0
                );
              const isRamDead =
                w.attacking.targetType === 'siege' &&
                !enemySiegeRef.current.find(
                  r =>
                    r.id ===
                      (w.attacking as { targetType: 'siege'; siegeId: number })
                        .siegeId && r.hp > 0
                );
              if (isGruntDead || isRamDead)
                return { ...w, attacking: null, state: 'idle' };
            }
            // Block movement while holding position
            if (w.state === 'moving')
              return { ...w, movingTo: null, path: [], state: 'idle' };
            return w;
          }
          // Aggressive stance: idle combat units auto-engage nearby enemies within 3 tiles
          if (
            stanceRef.current === 'aggressive' &&
            w.state === 'idle' &&
            !w.attacking &&
            !w.holdPosition &&
            !w.patrol &&
            w.unitType !== 'farmer' &&
            w.unitType !== 'catapult' &&
            w.unitType !== 'trebuchet'
          ) {
            const AGG_RANGE = 3;
            const nearGruntA = enemyGruntsRef.current.find(
              g => g.hp > 0 && tileDist(w.x, w.y, g.x, g.y) <= AGG_RANGE
            );
            if (nearGruntA)
              return {
                ...w,
                attacking: {
                  targetType: 'grunt' as const,
                  gruntId: nearGruntA.id,
                },
                state: 'attacking' as const,
              };
            const nearRamA = enemySiegeRef.current.find(
              r => r.hp > 0 && tileDist(w.x, w.y, r.x, r.y) <= AGG_RANGE
            );
            if (nearRamA)
              return {
                ...w,
                attacking: {
                  targetType: 'siege' as const,
                  siegeId: nearRamA.id,
                },
                state: 'attacking' as const,
              };
            const nearSapperA = enemySappersRef.current.find(
              s =>
                s.hp > 0 &&
                !s.exploded &&
                tileDist(w.x, w.y, s.x, s.y) <= AGG_RANGE
            );
            if (nearSapperA)
              return {
                ...w,
                attacking: {
                  targetType: 'sapper' as const,
                  sapperId: nearSapperA.id,
                },
                state: 'attacking' as const,
              };
            const nearNecroA = enemyNecromancersRef.current.find(
              n => n.hp > 0 && tileDist(w.x, w.y, n.x, n.y) <= AGG_RANGE
            );
            if (nearNecroA)
              return {
                ...w,
                attacking: {
                  targetType: 'necromancer' as const,
                  necromancerId: nearNecroA.id,
                },
                state: 'attacking' as const,
              };
            const nearWDA = enemyWitchDoctorsRef.current.find(
              d => d.hp > 0 && tileDist(w.x, w.y, d.x, d.y) <= AGG_RANGE
            );
            if (nearWDA)
              return {
                ...w,
                attacking: {
                  targetType: 'witchDoctor' as const,
                  witchDoctorId: nearWDA.id,
                },
                state: 'attacking' as const,
              };
            const nearWCA = enemyWarchiefsRef.current.find(
              wc2 => wc2.hp > 0 && tileDist(w.x, w.y, wc2.x, wc2.y) <= AGG_RANGE
            );
            if (nearWCA)
              return {
                ...w,
                attacking: {
                  targetType: 'warchief' as const,
                  warchiefId: nearWCA.id,
                },
                state: 'attacking' as const,
              };
            const nearWLA = enemyWarlordsRef.current.find(
              wl => wl.hp > 0 && tileDist(w.x, w.y, wl.x, wl.y) <= AGG_RANGE
            );
            if (nearWLA)
              return {
                ...w,
                attacking: {
                  targetType: 'warlord' as const,
                  warlordId: nearWLA.id,
                },
                state: 'attacking' as const,
              };
            const nearLKA = enemyLurkersRef.current.find(
              lk => lk.hp > 0 && tileDist(w.x, w.y, lk.x, lk.y) <= AGG_RANGE
            );
            if (nearLKA)
              return {
                ...w,
                attacking: {
                  targetType: 'lurker' as const,
                  lurkerId: nearLKA.id,
                },
                state: 'attacking' as const,
              };
          }
          // When attack-move unit finishes its target, resume march to original destination
          if (w.attackMove && w.state === 'idle' && w.attackMoveTarget) {
            const dest = w.attackMoveTarget;
            const atDest = tileDist(w.x, w.y, dest.x, dest.y) < 0.5;
            if (!atDest) {
              const p = aStar(
                INITIAL_TILES,
                { x: Math.round(w.x), y: Math.round(w.y) },
                dest
              );
              return {
                ...w,
                movingTo: p[0] ?? dest,
                path: p.slice(1),
                state: 'moving' as const,
              };
            }
            return { ...w, attackMove: false, attackMoveTarget: null };
          }

          if (w.movingTo) {
            const dx = w.movingTo.x - w.x,
              dy = w.movingTo.y - w.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const epsilon = 0.12;
            if (d < epsilon) {
              // Advance along A* path
              if (w.path.length > 0) {
                const [next, ...rest] = w.path;
                return {
                  ...w,
                  x: w.movingTo.x,
                  y: w.movingTo.y,
                  movingTo: next ?? null,
                  path: rest,
                };
              }
              // Arrived at final destination
              if (w.gathering && w.state !== 'returning')
                return {
                  ...w,
                  x: w.movingTo.x,
                  y: w.movingTo.y,
                  movingTo: null,
                  path: [],
                  state: 'gathering',
                };
              if (w.attacking && w.state !== 'returning')
                return {
                  ...w,
                  x: w.movingTo.x,
                  y: w.movingTo.y,
                  movingTo: null,
                  path: [],
                  state: 'attacking',
                };
              if (w.repairing && w.state !== 'returning')
                return {
                  ...w,
                  x: w.movingTo.x,
                  y: w.movingTo.y,
                  movingTo: null,
                  path: [],
                  state: 'repairing',
                };
              if (w.state === 'returning') {
                const movDest = w.movingTo!;
                const atBarn =
                  tileDist(movDest.x, movDest.y, BARN_POS.x, BARN_POS.y) <
                  epsilon;
                const atLumberShed =
                  !atBarn &&
                  w.carrying.lumber > 0 &&
                  placedBuildingsRef.current.some(
                    b =>
                      b.type === 'lumberShed' &&
                      b.hp > 0 &&
                      tileDist(movDest.x, movDest.y, b.x, b.y) < epsilon
                  );
                const atMiningCamp =
                  !atBarn &&
                  !atLumberShed &&
                  (w.carrying.gold > 0 || w.carrying.stone > 0) &&
                  placedBuildingsRef.current.some(
                    b =>
                      b.type === 'miningCamp' &&
                      b.hp > 0 &&
                      tileDist(movDest.x, movDest.y, b.x, b.y) < epsilon
                  );
                if (atBarn || atLumberShed || atMiningCamp) {
                  const goldDeposit = Math.round(
                    w.carrying.gold * upkeepMultRef.current
                  );
                  if (
                    goldDeposit > 0 ||
                    w.carrying.lumber > 0 ||
                    w.carrying.stone > 0
                  )
                    Snd.gold();
                  setResources(r => ({
                    ...r,
                    gold: r.gold + goldDeposit,
                    lumber: r.lumber + w.carrying.lumber,
                    stone: r.stone + w.carrying.stone,
                  }));
                  incomeAccRef.current.gold += goldDeposit;
                  incomeAccRef.current.lumber += w.carrying.lumber;
                  incomeAccRef.current.stone += w.carrying.stone;
                  if (w.carrying.gold > 0)
                    setTotalGold(g => g + w.carrying.gold);
                  if (w.carrying.lumber > 0)
                    setTotalLumber(l => l + w.carrying.lumber);
                  if (w.carrying.stone > 0)
                    setTotalStone(s => s + w.carrying.stone);
                  if (w.gathering) {
                    if (w.gathering.type === 'tree') {
                      const t = curTrees[w.gathering.idx];
                      if (t && t.amount > 0) {
                        const p = aStar(
                          INITIAL_TILES,
                          {
                            x: Math.round(w.movingTo.x),
                            y: Math.round(w.movingTo.y),
                          },
                          { x: t.x, y: t.y }
                        );
                        return {
                          ...w,
                          x: w.movingTo.x,
                          y: w.movingTo.y,
                          movingTo: p[0] ?? { x: t.x, y: t.y },
                          path: p.slice(1),
                          carrying: { gold: 0, lumber: 0, stone: 0 },
                          state: 'moving',
                        };
                      }
                    } else if (w.gathering.type === 'gold') {
                      const mineIdx = w.gathering.idx;
                      const mine = curGoldMines[mineIdx];
                      if (mine && mine.amount > 0) {
                        const p = aStar(
                          INITIAL_TILES,
                          {
                            x: Math.round(w.movingTo.x),
                            y: Math.round(w.movingTo.y),
                          },
                          { x: mine.x, y: mine.y }
                        );
                        return {
                          ...w,
                          x: w.movingTo.x,
                          y: w.movingTo.y,
                          movingTo: p[0] ?? mine,
                          path: p.slice(1),
                          carrying: { gold: 0, lumber: 0, stone: 0 },
                          state: 'moving',
                        };
                      }
                      // mine depleted — auto-find nearest non-empty mine
                      const wx3 = Math.round(w.movingTo.x),
                        wy3 = Math.round(w.movingTo.y);
                      const altMine = curGoldMines.reduce<{
                        node: ResourceNode;
                        idx: number;
                        d: number;
                      } | null>((best, m, i) => {
                        if (m.amount <= 0) return best;
                        const d = tileDist(wx3, wy3, m.x, m.y);
                        return !best || d < best.d
                          ? { node: m, idx: i, d }
                          : best;
                      }, null);
                      if (altMine) {
                        const p = aStar(
                          INITIAL_TILES,
                          { x: wx3, y: wy3 },
                          { x: altMine.node.x, y: altMine.node.y }
                        );
                        return {
                          ...w,
                          x: w.movingTo.x,
                          y: w.movingTo.y,
                          movingTo: p[0] ?? altMine.node,
                          path: p.slice(1),
                          carrying: { gold: 0, lumber: 0, stone: 0 },
                          state: 'moving',
                          gathering: { type: 'gold', idx: altMine.idx },
                        };
                      }
                    } else if (w.gathering.type === 'stone') {
                      const n = curStone[w.gathering.idx];
                      if (n && n.amount > 0) {
                        const p = aStar(
                          INITIAL_TILES,
                          {
                            x: Math.round(w.movingTo.x),
                            y: Math.round(w.movingTo.y),
                          },
                          { x: n.x, y: n.y }
                        );
                        return {
                          ...w,
                          x: w.movingTo.x,
                          y: w.movingTo.y,
                          movingTo: p[0] ?? n,
                          path: p.slice(1),
                          carrying: { gold: 0, lumber: 0, stone: 0 },
                          state: 'moving',
                        };
                      }
                    }
                  }
                  // Auto-gather: find nearest non-empty node of same type
                  if (w.unitType === 'farmer' && w.gathering) {
                    const gType2 = w.gathering.type;
                    const wx2 = Math.round(w.movingTo.x),
                      wy2 = Math.round(w.movingTo.y);
                    if (gType2 === 'tree') {
                      const alt = curTrees.reduce<{
                        node: (typeof curTrees)[0];
                        idx: number;
                        d: number;
                      } | null>((best, t, i) => {
                        if (t.amount <= 0) return best;
                        const d = tileDist(wx2, wy2, t.x, t.y);
                        return !best || d < best.d
                          ? { node: t, idx: i, d }
                          : best;
                      }, null);
                      if (alt) {
                        const p = aStar(
                          INITIAL_TILES,
                          { x: wx2, y: wy2 },
                          { x: alt.node.x, y: alt.node.y }
                        );
                        return {
                          ...w,
                          x: w.movingTo.x,
                          y: w.movingTo.y,
                          movingTo: p[0] ?? alt.node,
                          path: p.slice(1),
                          carrying: { gold: 0, lumber: 0, stone: 0 },
                          state: 'moving',
                          gathering: { type: 'tree', idx: alt.idx },
                        };
                      }
                    } else if (gType2 === 'gold') {
                      // gold is a single node; if depleted, go idle
                    } else if (gType2 === 'stone') {
                      const alt = curStone.reduce<{
                        node: (typeof curStone)[0];
                        idx: number;
                        d: number;
                      } | null>((best, n, i) => {
                        if (n.amount <= 0) return best;
                        const d = tileDist(wx2, wy2, n.x, n.y);
                        return !best || d < best.d
                          ? { node: n, idx: i, d }
                          : best;
                      }, null);
                      if (alt) {
                        const p = aStar(
                          INITIAL_TILES,
                          { x: wx2, y: wy2 },
                          { x: alt.node.x, y: alt.node.y }
                        );
                        return {
                          ...w,
                          x: w.movingTo.x,
                          y: w.movingTo.y,
                          movingTo: p[0] ?? alt.node,
                          path: p.slice(1),
                          carrying: { gold: 0, lumber: 0, stone: 0 },
                          state: 'moving',
                          gathering: { type: 'stone', idx: alt.idx },
                        };
                      }
                    }
                  }
                  return {
                    ...w,
                    x: w.movingTo.x,
                    y: w.movingTo.y,
                    movingTo: null,
                    path: [],
                    carrying: { gold: 0, lumber: 0, stone: 0 },
                    state: 'idle',
                    gathering: null,
                  };
                }
              }
              // Consume next queued waypoint instead of going idle
              if (w.waypoints && w.waypoints.length > 0) {
                const [nextWP, ...restWPs] = w.waypoints;
                if (nextWP) {
                  const p = aStar(
                    INITIAL_TILES,
                    { x: w.movingTo.x, y: w.movingTo.y },
                    nextWP
                  );
                  return {
                    ...w,
                    x: w.movingTo.x,
                    y: w.movingTo.y,
                    movingTo: p[0] ?? nextWP,
                    path: p.slice(1),
                    waypoints: restWPs,
                    state: 'moving' as const,
                  };
                }
              }
              // Loot crate pickup: if unit steps onto a crate tile, collect it
              const arrivedAt = w.movingTo;
              const crateHere = arrivedAt
                ? lootCratesRef.current.find(
                    c =>
                      Math.round(c.x) === Math.round(arrivedAt.x) &&
                      Math.round(c.y) === Math.round(arrivedAt.y)
                  )
                : undefined;
              if (crateHere && w.unitType === 'farmer') {
                setLootCrates(cs => cs.filter(c => c.id !== crateHere.id));
                setResources(r => ({
                  ...r,
                  gold: r.gold + crateHere.gold,
                  lumber: r.lumber + crateHere.lumber,
                  stone: r.stone + crateHere.stone,
                }));
                const label = [
                  crateHere.gold > 0 && `+${crateHere.gold}🪙`,
                  crateHere.lumber > 0 && `+${crateHere.lumber}🌲`,
                  crateHere.stone > 0 && `+${crateHere.stone}🪨`,
                ]
                  .filter(Boolean)
                  .join(' ');
                addFloatingText(
                  Math.round(w.movingTo.x),
                  Math.round(w.movingTo.y),
                  label,
                  '#fbbf24'
                );
              }
              return {
                ...w,
                x: w.movingTo.x,
                y: w.movingTo.y,
                movingTo: null,
                path: [],
                state: 'idle',
              };
            }
            // Cavalry trample: deal passive damage to grunts within radius while moving
            if (w.unitType === 'cavalry') {
              enemyGruntsRef.current.forEach(g => {
                if (
                  g.hp > 0 &&
                  tileDist(w.x, w.y, g.x, g.y) <= CAVALRY_TRAMPLE_RADIUS
                ) {
                  setEnemyGrunts(gs =>
                    gs.map(eg =>
                      eg.id === g.id
                        ? {
                            ...eg,
                            hp: Math.max(
                              0,
                              eg.hp - CAVALRY_TRAMPLE_DAMAGE * dt
                            ),
                          }
                        : eg
                    )
                  );
                }
              });
            }
            const sprintMult = w.sprinting ? CAVALRY_SPRINT_SPEED_MULT : 1;
            const itemSpeedBonus =
              w.unitType === 'hero'
                ? heroItemsRef.current.reduce(
                    (s, it) => s + (HERO_ITEM_DATA[it.itemId].speedBonus ?? 0),
                    0
                  )
                : 0;
            const moveSpeed =
              (w.unitType === 'catapult'
                ? CATAPULT_SPEED
                : w.unitType === 'trebuchet'
                  ? TREBUCHET_SPEED
                  : w.unitType === 'cavalry'
                    ? CAVALRY_SPEED
                    : WORKER_SPEED + itemSpeedBonus) * sprintMult;
            return {
              ...w,
              x: w.x + (dx / d) * Math.min(moveSpeed * dt, d),
              y: w.y + (dy / d) * Math.min(moveSpeed * dt, d),
            };
          }

          if (w.state === 'gathering' && w.gathering) {
            const gType = w.gathering.type;
            if (gType === 'tree') {
              if (w.carrying.lumber >= CARRY_CAP) {
                const sheds = placedBuildingsRef.current.filter(
                  b => b.type === 'lumberShed' && b.hp > 0
                );
                const dropSite =
                  sheds.reduce<{ x: number; y: number } | null>((best, s) => {
                    const d = tileDist(w.x, w.y, s.x, s.y);
                    return !best || d < tileDist(w.x, w.y, best.x, best.y)
                      ? { x: s.x, y: s.y }
                      : best;
                  }, null) ?? BARN_POS;
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  dropSite
                );
                return {
                  ...w,
                  state: 'returning',
                  movingTo: p[0] ?? dropSite,
                  path: p.slice(1),
                };
              }
              if (!gatherT[w.id]) {
                const lumberShedCount = placedBuildingsRef.current.filter(
                  b => b.type === 'lumberShed'
                ).length;
                const boonDiv = harvestBoonRef.current ? 2 : 1;
                const plentyDiv = shrinePlentyBuffRef.current ? 1.15 : 1;
                const gatherMs = Math.max(
                  400,
                  (GATHER_INTERVAL_MS -
                    upgradesRef.current.swiftHarvest * 200 -
                    lumberShedCount * LUMBER_SHED_BONUS_MS) /
                    boonDiv /
                    plentyDiv
                );
                gatherT[w.id] = window.setTimeout(() => {
                  delete gatherTimeoutsRef.current[w.id];
                  const idx = w.gathering!.idx;
                  setWorkers(ws2 =>
                    ws2.map(w2 => {
                      if (
                        w2.id !== w.id ||
                        w2.state !== 'gathering' ||
                        !w2.gathering
                      )
                        return w2;
                      if (
                        (treesRef.current[idx]?.amount ?? 0) > 0 &&
                        w2.carrying.lumber < CARRY_CAP
                      ) {
                        setTrees(ts =>
                          ts.map((t, i) => {
                            if (i !== idx) return t;
                            const next = Math.max(0, t.amount - CARRY_CAP);
                            if (next === 0)
                              addFloatingText(
                                t.x,
                                t.y,
                                '🌲 Depleted!',
                                '#92400e'
                              );
                            return { ...t, amount: next };
                          })
                        );
                        const sheds2 = placedBuildingsRef.current.filter(
                          b => b.type === 'lumberShed' && b.hp > 0
                        );
                        const dropSite2 =
                          sheds2.reduce<{ x: number; y: number } | null>(
                            (best, s) => {
                              const d = tileDist(w2.x, w2.y, s.x, s.y);
                              return !best ||
                                d < tileDist(w2.x, w2.y, best.x, best.y)
                                ? { x: s.x, y: s.y }
                                : best;
                            },
                            null
                          ) ?? BARN_POS;
                        const p = aStar(
                          INITIAL_TILES,
                          { x: Math.round(w2.x), y: Math.round(w2.y) },
                          dropSite2
                        );
                        return {
                          ...w2,
                          carrying: {
                            gold: 0,
                            lumber: w2.carrying.lumber + CARRY_CAP,
                            stone: 0,
                          },
                          state: 'returning',
                          movingTo: p[0] ?? dropSite2,
                          path: p.slice(1),
                        };
                      }
                      return w2;
                    })
                  );
                }, gatherMs);
              }
            } else if (gType === 'gold') {
              if (w.carrying.gold >= CARRY_CAP) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  BARN_POS
                );
                return {
                  ...w,
                  state: 'returning',
                  movingTo: p[0] ?? BARN_POS,
                  path: p.slice(1),
                };
              }
              if (!gatherT[w.id]) {
                const gatherMs = Math.max(
                  400,
                  (GATHER_INTERVAL_MS -
                    upgradesRef.current.swiftHarvest * 200) /
                    (harvestBoonRef.current ? 2 : 1) /
                    (shrinePlentyBuffRef.current ? 1.15 : 1)
                );
                const mineIdx = w.gathering.idx;
                gatherT[w.id] = window.setTimeout(() => {
                  delete gatherTimeoutsRef.current[w.id];
                  setWorkers(ws2 =>
                    ws2.map(w2 => {
                      if (
                        w2.id !== w.id ||
                        w2.state !== 'gathering' ||
                        !w2.gathering
                      )
                        return w2;
                      const mine = goldMinesRef.current[mineIdx];
                      if (
                        mine &&
                        mine.amount > 0 &&
                        w2.carrying.gold < CARRY_CAP
                      ) {
                        setGoldMines(gms =>
                          gms.map((gm, i) => {
                            if (i !== mineIdx) return gm;
                            const next = Math.max(0, gm.amount - CARRY_CAP);
                            if (next === 0)
                              addFloatingText(
                                gm.x,
                                gm.y,
                                '🪙 Mine Depleted!',
                                '#92400e'
                              );
                            return { ...gm, amount: next };
                          })
                        );
                        const camps = placedBuildingsRef.current.filter(
                          b => b.type === 'miningCamp' && b.hp > 0
                        );
                        const goldDrop =
                          camps.reduce<{ x: number; y: number } | null>(
                            (best, c) => {
                              const d = tileDist(w2.x, w2.y, c.x, c.y);
                              return !best ||
                                d < tileDist(w2.x, w2.y, best.x, best.y)
                                ? { x: c.x, y: c.y }
                                : best;
                            },
                            null
                          ) ?? BARN_POS;
                        const p = aStar(
                          INITIAL_TILES,
                          { x: Math.round(w2.x), y: Math.round(w2.y) },
                          goldDrop
                        );
                        return {
                          ...w2,
                          carrying: {
                            gold: w2.carrying.gold + CARRY_CAP,
                            lumber: 0,
                            stone: 0,
                          },
                          state: 'returning',
                          movingTo: p[0] ?? goldDrop,
                          path: p.slice(1),
                        };
                      }
                      return w2;
                    })
                  );
                }, gatherMs);
              }
            } else if (gType === 'stone') {
              if (w.carrying.stone >= CARRY_CAP) {
                const stoneCamps = placedBuildingsRef.current.filter(
                  b => b.type === 'miningCamp' && b.hp > 0
                );
                const stoneDrop =
                  stoneCamps.reduce<{ x: number; y: number } | null>(
                    (best, c) => {
                      const d = tileDist(w.x, w.y, c.x, c.y);
                      return !best || d < tileDist(w.x, w.y, best.x, best.y)
                        ? { x: c.x, y: c.y }
                        : best;
                    },
                    null
                  ) ?? BARN_POS;
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  stoneDrop
                );
                return {
                  ...w,
                  state: 'returning',
                  movingTo: p[0] ?? stoneDrop,
                  path: p.slice(1),
                };
              }
              if (!gatherT[w.id]) {
                const idx = w.gathering.idx;
                const gatherMs = Math.max(
                  400,
                  (GATHER_INTERVAL_MS -
                    upgradesRef.current.swiftHarvest * 200) /
                    (harvestBoonRef.current ? 2 : 1) /
                    (shrinePlentyBuffRef.current ? 1.15 : 1)
                );
                gatherT[w.id] = window.setTimeout(() => {
                  delete gatherTimeoutsRef.current[w.id];
                  setWorkers(ws2 =>
                    ws2.map(w2 => {
                      if (
                        w2.id !== w.id ||
                        w2.state !== 'gathering' ||
                        !w2.gathering
                      )
                        return w2;
                      if (
                        (stoneNodesRef.current[idx]?.amount ?? 0) > 0 &&
                        w2.carrying.stone < CARRY_CAP
                      ) {
                        setStoneNodes(ns =>
                          ns.map((n, i) => {
                            if (i !== idx) return n;
                            const next = Math.max(0, n.amount - CARRY_CAP);
                            if (next === 0)
                              addFloatingText(
                                n.x,
                                n.y,
                                '🪨 Quarry Depleted!',
                                '#92400e'
                              );
                            return { ...n, amount: next };
                          })
                        );
                        const stoneCamps2 = placedBuildingsRef.current.filter(
                          b => b.type === 'miningCamp' && b.hp > 0
                        );
                        const stoneDrop2 =
                          stoneCamps2.reduce<{ x: number; y: number } | null>(
                            (best, c) => {
                              const d = tileDist(w2.x, w2.y, c.x, c.y);
                              return !best ||
                                d < tileDist(w2.x, w2.y, best.x, best.y)
                                ? { x: c.x, y: c.y }
                                : best;
                            },
                            null
                          ) ?? BARN_POS;
                        const p = aStar(
                          INITIAL_TILES,
                          { x: Math.round(w2.x), y: Math.round(w2.y) },
                          stoneDrop2
                        );
                        return {
                          ...w2,
                          carrying: {
                            gold: 0,
                            lumber: 0,
                            stone: w2.carrying.stone + CARRY_CAP,
                          },
                          state: 'returning',
                          movingTo: p[0] ?? stoneDrop2,
                          path: p.slice(1),
                        };
                      }
                      return w2;
                    })
                  );
                }, gatherMs);
              }
            }
          }

          if (w.state === 'attacking' && w.attacking) {
            if (w.attacking.targetType === 'creep') {
              const creepId = (
                w.attacking as { targetType: 'creep'; creepId: number }
              ).creepId;
              const creepTarget = neutralCreepsRef.current.find(
                c => c.id === creepId
              );
              if (!creepTarget) return { ...w, attacking: null, state: 'idle' };
              const distToCreep = tileDist(
                w.x,
                w.y,
                creepTarget.x,
                creepTarget.y
              );
              if (distToCreep > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(creepTarget.x), y: Math.round(creepTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: creepTarget.x, y: creepTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedCX = Math.round(creepTarget.x),
                  capturedCY = Math.round(creepTarget.y);
                const capturedWX3 = Math.round(w.x),
                  capturedWY3 = Math.round(w.y);
                const unitBonusC =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetC = w.level;
                const moraleMs1 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmgC =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusC +
                    capturedVetC * VETERAN_ATK_BONUS;
                  addFloatingText(
                    capturedCX,
                    capturedCY,
                    `-${dmgC}`,
                    '#a855f7'
                  );
                  addFloatingText(capturedWX3, capturedWY3, `⚔️`, '#fbbf24');
                  // Award XP if creep dies
                  setNeutralCreeps(cs =>
                    cs.map(c => {
                      if (c.id !== creepId) return c;
                      const newHp = Math.max(0, c.hp - dmgC);
                      if (newHp <= 0 && c.hp > 0) {
                        setWorkers(ws3 =>
                          ws3.map(u => {
                            if (u.id !== w.id) return u;
                            const newXp = u.xp + XP_PER_KILL;
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
                                capturedWX3,
                                capturedWY3,
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
                              };
                            }
                            return { ...u, xp: newXp };
                          })
                        );
                      }
                      return { ...c, hp: newHp };
                    })
                  );
                }, moraleMs1);
              }
            } else if (w.attacking.targetType === 'grunt') {
              const target = enemyGruntsRef.current.find(
                g =>
                  g.id ===
                  (w.attacking as { targetType: 'grunt'; gruntId: number })
                    .gruntId
              );
              if (!target) return { ...w, attacking: null, state: 'idle' };
              const distToGrunt = tileDist(w.x, w.y, target.x, target.y);
              if (distToGrunt > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(target.x), y: Math.round(target.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: target.x, y: target.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const gruntId = w.attacking.gruntId;
                const capturedGX = Math.round(target.x),
                  capturedGY = Math.round(target.y);
                const capturedWX = Math.round(w.x),
                  capturedWY = Math.round(w.y);
                const capturedWorkerId = w.id;
                const unitBonus =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const moraleMs2 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[capturedWorkerId];
                  setWorkers(ws2 => {
                    const attacker = ws2.find(u => u.id === capturedWorkerId);
                    const veteranBonus = attacker
                      ? attacker.level * VETERAN_ATK_BONUS
                      : 0;
                    const dmg =
                      ATTACK_DAMAGE +
                      upgradesRef.current.sharperTools * 5 +
                      blacksmithUpgradesRef.current.steelEdge * 5 +
                      (shrineWarBuffRef.current ? 5 : 0) +
                      (barracksTechRef.current.warDrums ? 8 : 0) +
                      unitBonus +
                      veteranBonus;
                    gruntHitRef.current.set(gruntId, Date.now());
                    addFloatingText(
                      capturedGX,
                      capturedGY,
                      `-${dmg}`,
                      '#f97316'
                    );
                    addFloatingText(capturedWX, capturedWY, `⚔️`, '#fbbf24');
                    setEnemyGrunts(gs =>
                      gs.map(g => {
                        if (g.id !== gruntId) return g;
                        const newHp = Math.max(0, g.hp - dmg);
                        if (newHp <= 0 && g.hp > 0) {
                          // Award XP to attacker
                          return { ...g, hp: 0 };
                        }
                        return { ...g, hp: newHp };
                      })
                    );
                    // Award XP to attacker + 25% shared XP to nearby allies within 3 tiles
                    return ws2.map(u => {
                      const gruntCurrent = enemyGruntsRef.current.find(
                        g => g.id === gruntId
                      );
                      const veteranDmg =
                        ATTACK_DAMAGE +
                        upgradesRef.current.sharperTools * 5 +
                        blacksmithUpgradesRef.current.steelEdge * 5 +
                        (shrineWarBuffRef.current ? 5 : 0) +
                        (barracksTechRef.current.warDrums ? 8 : 0) +
                        unitBonus +
                        u.level * VETERAN_ATK_BONUS;
                      const gruntDies =
                        gruntCurrent && gruntCurrent.hp - veteranDmg <= 0;
                      if (!gruntDies) return u;
                      const isAttacker = u.id === capturedWorkerId;
                      const isNearby =
                        !isAttacker &&
                        u.hp > 0 &&
                        tileDist(u.x, u.y, capturedWX, capturedWY) <= 3;
                      const baseXp = gruntCurrent.isBoss
                        ? BOSS_XP_REWARD
                        : XP_PER_KILL;
                      const xpGain = isAttacker
                        ? baseXp
                        : isNearby
                          ? Math.round(baseXp * 0.25)
                          : 0;
                      if (xpGain === 0) return u;
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
                        const hpGain = VETERAN_HP_BONUS;
                        return {
                          ...u,
                          xp: newXp,
                          level: newLevel,
                          maxHp: u.maxHp + hpGain,
                          hp: Math.min(u.hp + hpGain, u.maxHp + hpGain),
                        };
                      }
                      return { ...u, xp: newXp };
                    });
                  });
                }, moraleMs2);
              }
            } else if (w.attacking.targetType === 'enemyTower') {
              const towerId = (
                w.attacking as { targetType: 'enemyTower'; towerId: number }
              ).towerId;
              const towerTarget = enemyTowersRef.current.find(
                t => t.id === towerId && t.hp > 0
              );
              if (!towerTarget) return { ...w, attacking: null, state: 'idle' };
              const distToTower = tileDist(
                w.x,
                w.y,
                towerTarget.x,
                towerTarget.y
              );
              if (distToTower > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.max(0, towerTarget.x - 1), y: towerTarget.y }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: towerTarget.x - 1, y: towerTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedTX = towerTarget.x,
                  capturedTY = towerTarget.y;
                const capturedTId = towerId;
                const unitBonusT =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetT = w.level;
                const moraleMs3 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusT +
                    capturedVetT * VETERAN_ATK_BONUS;
                  setEnemyTowers(ts =>
                    ts.map(t =>
                      t.id === capturedTId
                        ? { ...t, hp: Math.max(0, t.hp - dmg) }
                        : t
                    )
                  );
                  addFloatingText(capturedTX, capturedTY, `-${dmg}`, '#ef4444');
                }, moraleMs3);
              }
            } else if (w.attacking.targetType === 'enemyWall') {
              const wallId = (
                w.attacking as { targetType: 'enemyWall'; wallId: number }
              ).wallId;
              const wallTarget = enemyWallsRef.current.find(
                ew => ew.id === wallId && ew.hp > 0
              );
              if (!wallTarget) return { ...w, attacking: null, state: 'idle' };
              if (tileDist(w.x, w.y, wallTarget.x, wallTarget.y) > 1.5) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: wallTarget.x, y: wallTarget.y }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: wallTarget.x, y: wallTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedWallId = wallId;
                const capturedWX2 = wallTarget.x,
                  capturedWY2 = wallTarget.y;
                const unitBonusW =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetW = w.level;
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusW +
                    capturedVetW * VETERAN_ATK_BONUS;
                  setEnemyWalls(ews =>
                    ews.map(ew =>
                      ew.id === capturedWallId
                        ? { ...ew, hp: Math.max(0, ew.hp - dmg) }
                        : ew
                    )
                  );
                  addFloatingText(
                    capturedWX2,
                    capturedWY2,
                    `-${dmg}`,
                    '#ef4444'
                  );
                }, 1200);
              }
            } else if (w.attacking.targetType === 'siege') {
              const siegeId = (
                w.attacking as { targetType: 'siege'; siegeId: number }
              ).siegeId;
              const siegeTarget = enemySiegeRef.current.find(
                r => r.id === siegeId && r.hp > 0
              );
              if (!siegeTarget) return { ...w, attacking: null, state: 'idle' };
              const distToSiege = tileDist(
                w.x,
                w.y,
                siegeTarget.x,
                siegeTarget.y
              );
              if (distToSiege > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(siegeTarget.x), y: Math.round(siegeTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: siegeTarget.x, y: siegeTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedSX = Math.round(siegeTarget.x),
                  capturedSY = Math.round(siegeTarget.y);
                const capturedSiegeId = siegeId;
                const unitBonusS =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetS = w.level;
                const moraleMs5 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusS +
                    capturedVetS * VETERAN_ATK_BONUS;
                  setEnemySiege(rs =>
                    rs.map(r =>
                      r.id === capturedSiegeId
                        ? { ...r, hp: Math.max(0, r.hp - dmg) }
                        : r
                    )
                  );
                  addFloatingText(capturedSX, capturedSY, `-${dmg}`, '#ef4444');
                  // XP for killing a ram/demolisher
                  const ramCurrent = enemySiegeRef.current.find(
                    r => r.id === capturedSiegeId
                  );
                  if (ramCurrent && ramCurrent.hp - dmg <= 0) {
                    const siegeXp =
                      ramCurrent.siegeType === 'demolisher'
                        ? DEMOLISHER_XP_REWARD
                        : WAR_RAM_XP_REWARD;
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedSX, capturedSY) <= 3;
                        const xpGain = isAttacker
                          ? siegeXp
                          : isNearby
                            ? Math.round(siegeXp * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
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
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleMs5);
              }
            } else if (w.attacking.targetType === 'shaman') {
              const shamanId = (
                w.attacking as { targetType: 'shaman'; shamanId: number }
              ).shamanId;
              const shamanTarget = enemyShamansRef.current.find(
                s => s.id === shamanId && s.hp > 0
              );
              if (!shamanTarget)
                return { ...w, attacking: null, state: 'idle' };
              const distToShaman = tileDist(
                w.x,
                w.y,
                shamanTarget.x,
                shamanTarget.y
              );
              if (distToShaman > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  {
                    x: Math.round(shamanTarget.x),
                    y: Math.round(shamanTarget.y),
                  }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: shamanTarget.x, y: shamanTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedShX = Math.round(shamanTarget.x),
                  capturedShY = Math.round(shamanTarget.y);
                const capturedShamanId = shamanId;
                const unitBonusSh =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetSh = w.level;
                const moraleMs6 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusSh +
                    capturedVetSh * VETERAN_ATK_BONUS;
                  setEnemyShamans(ss =>
                    ss.map(s =>
                      s.id === capturedShamanId
                        ? { ...s, hp: Math.max(0, s.hp - dmg) }
                        : s
                    )
                  );
                  addFloatingText(
                    capturedShX,
                    capturedShY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                  const shamCurrent = enemyShamansRef.current.find(
                    s => s.id === capturedShamanId
                  );
                  if (shamCurrent && shamCurrent.hp - dmg <= 0) {
                    setResources(r => ({
                      ...r,
                      gold: r.gold + SHAMAN_GOLD_REWARD,
                    }));
                    addFloatingText(
                      capturedShX,
                      capturedShY,
                      `+${SHAMAN_GOLD_REWARD}g`,
                      '#fbbf24'
                    );
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedShX, capturedShY) <= 3;
                        const xpGain = isAttacker
                          ? SHAMAN_XP_REWARD
                          : isNearby
                            ? Math.round(SHAMAN_XP_REWARD * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
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
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleMs6);
              }
            } else if (w.attacking.targetType === 'troll') {
              const trollId = (
                w.attacking as { targetType: 'troll'; trollId: number }
              ).trollId;
              const trollTarget = enemyTrollsRef.current.find(
                t => t.id === trollId && t.hp > 0
              );
              if (!trollTarget) return { ...w, attacking: null, state: 'idle' };
              const distToTroll = tileDist(
                w.x,
                w.y,
                trollTarget.x,
                trollTarget.y
              );
              if (distToTroll > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(trollTarget.x), y: Math.round(trollTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: trollTarget.x, y: trollTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedTrX = Math.round(trollTarget.x),
                  capturedTrY = Math.round(trollTarget.y);
                const capturedTrollId = trollId;
                const unitBonusTr =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetTr = w.level;
                const moraleMs7 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusTr +
                    capturedVetTr * VETERAN_ATK_BONUS;
                  setEnemyTrolls(ts =>
                    ts.map(t =>
                      t.id === capturedTrollId
                        ? { ...t, hp: Math.max(0, t.hp - dmg) }
                        : t
                    )
                  );
                  addFloatingText(
                    capturedTrX,
                    capturedTrY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                  const trCurrent = enemyTrollsRef.current.find(
                    t => t.id === capturedTrollId
                  );
                  if (trCurrent && trCurrent.hp - dmg <= 0) {
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedTrX, capturedTrY) <= 3;
                        const xpGain = isAttacker
                          ? TROLL_XP_REWARD
                          : isNearby
                            ? Math.round(TROLL_XP_REWARD * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
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
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleMs7);
              }
            } else if (w.attacking.targetType === 'sapper') {
              const sapperId = (
                w.attacking as { targetType: 'sapper'; sapperId: number }
              ).sapperId;
              const sapperTarget = enemySappersRef.current.find(
                s => s.id === sapperId && s.hp > 0 && !s.exploded
              );
              if (!sapperTarget)
                return { ...w, attacking: null, state: 'idle' };
              const distToSapper = tileDist(
                w.x,
                w.y,
                sapperTarget.x,
                sapperTarget.y
              );
              if (distToSapper > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  {
                    x: Math.round(sapperTarget.x),
                    y: Math.round(sapperTarget.y),
                  }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: sapperTarget.x, y: sapperTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedSpX = Math.round(sapperTarget.x),
                  capturedSpY = Math.round(sapperTarget.y);
                const capturedSapperId = sapperId;
                const unitBonusSp =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetSp = w.level;
                const moraleMs8 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusSp +
                    capturedVetSp * VETERAN_ATK_BONUS;
                  setEnemySappers(ss =>
                    ss.map(s =>
                      s.id === capturedSapperId
                        ? { ...s, hp: Math.max(0, s.hp - dmg) }
                        : s
                    )
                  );
                  addFloatingText(
                    capturedSpX,
                    capturedSpY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                }, moraleMs8);
              }
            } else if (w.attacking.targetType === 'necromancer') {
              const necroId = (
                w.attacking as {
                  targetType: 'necromancer';
                  necromancerId: number;
                }
              ).necromancerId;
              const necroTarget = enemyNecromancersRef.current.find(
                n => n.id === necroId && n.hp > 0
              );
              if (!necroTarget) return { ...w, attacking: null, state: 'idle' };
              const distToNecro = tileDist(
                w.x,
                w.y,
                necroTarget.x,
                necroTarget.y
              );
              if (distToNecro > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(necroTarget.x), y: Math.round(necroTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: necroTarget.x, y: necroTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedNcX = Math.round(necroTarget.x),
                  capturedNcY = Math.round(necroTarget.y);
                const capturedNecroId = necroId;
                const unitBonusNc =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetNc = w.level;
                const moraleMs9 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusNc +
                    capturedVetNc * VETERAN_ATK_BONUS;
                  setEnemyNecromancers(ns =>
                    ns.map(n =>
                      n.id === capturedNecroId
                        ? { ...n, hp: Math.max(0, n.hp - dmg) }
                        : n
                    )
                  );
                  addFloatingText(
                    capturedNcX,
                    capturedNcY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                  const necroCurrent = enemyNecromancersRef.current.find(
                    n => n.id === capturedNecroId
                  );
                  if (necroCurrent && necroCurrent.hp - dmg <= 0) {
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedNcX, capturedNcY) <= 3;
                        const xpGain = isAttacker
                          ? NECROMANCER_XP_REWARD
                          : isNearby
                            ? Math.round(NECROMANCER_XP_REWARD * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
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
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleMs9);
              }
            } else if (w.attacking.targetType === 'witchDoctor') {
              const wdId = (
                w.attacking as {
                  targetType: 'witchDoctor';
                  witchDoctorId: number;
                }
              ).witchDoctorId;
              const wdTarget = enemyWitchDoctorsRef.current.find(
                d => d.id === wdId && d.hp > 0
              );
              if (!wdTarget) return { ...w, attacking: null, state: 'idle' };
              const distToWD = tileDist(w.x, w.y, wdTarget.x, wdTarget.y);
              if (distToWD > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(wdTarget.x), y: Math.round(wdTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: wdTarget.x, y: wdTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedWDX = Math.round(wdTarget.x),
                  capturedWDY = Math.round(wdTarget.y);
                const capturedWDId = wdId;
                const unitBonusWD =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetWD = w.level;
                const moraleWD = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusWD +
                    capturedVetWD * VETERAN_ATK_BONUS;
                  setEnemyWitchDoctors(ds =>
                    ds.map(d =>
                      d.id === capturedWDId
                        ? { ...d, hp: Math.max(0, d.hp - dmg) }
                        : d
                    )
                  );
                  addFloatingText(
                    capturedWDX,
                    capturedWDY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                  const wdCurrent = enemyWitchDoctorsRef.current.find(
                    d => d.id === capturedWDId
                  );
                  if (wdCurrent && wdCurrent.hp - dmg <= 0) {
                    setResources(r => ({
                      ...r,
                      gold: r.gold + WITCH_DOCTOR_GOLD_REWARD,
                    }));
                    addFloatingText(
                      capturedWDX,
                      capturedWDY,
                      `+${WITCH_DOCTOR_GOLD_REWARD}🪙`,
                      '#fbbf24'
                    );
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedWDX, capturedWDY) <= 3;
                        const xpGain = isAttacker
                          ? WITCH_DOCTOR_XP_REWARD
                          : isNearby
                            ? Math.round(WITCH_DOCTOR_XP_REWARD * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
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
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleWD);
              }
            } else if (w.attacking.targetType === 'warchief') {
              const wcId = (
                w.attacking as { targetType: 'warchief'; warchiefId: number }
              ).warchiefId;
              const wcTarget = enemyWarchiefsRef.current.find(
                wc2 => wc2.id === wcId && wc2.hp > 0
              );
              if (!wcTarget) return { ...w, attacking: null, state: 'idle' };
              const distToWC = tileDist(w.x, w.y, wcTarget.x, wcTarget.y);
              if (distToWC > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(wcTarget.x), y: Math.round(wcTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: wcTarget.x, y: wcTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedWCX = Math.round(wcTarget.x),
                  capturedWCY = Math.round(wcTarget.y);
                const capturedWCId = wcId;
                const unitBonusWC =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetWC = w.level;
                const moraleWC = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusWC +
                    capturedVetWC * VETERAN_ATK_BONUS;
                  setEnemyWarchiefs(wcs =>
                    wcs.map(wc2 =>
                      wc2.id === capturedWCId
                        ? { ...wc2, hp: Math.max(0, wc2.hp - dmg) }
                        : wc2
                    )
                  );
                  addFloatingText(
                    capturedWCX,
                    capturedWCY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                  const wcCurrent = enemyWarchiefsRef.current.find(
                    wc2 => wc2.id === capturedWCId
                  );
                  if (wcCurrent && wcCurrent.hp - dmg <= 0) {
                    onAchievement('warchief_slayer');
                    setResources(r => ({
                      ...r,
                      gold: r.gold + WARCHIEF_GOLD_REWARD,
                    }));
                    addFloatingText(
                      capturedWCX,
                      capturedWCY,
                      `👑 +${WARCHIEF_GOLD_REWARD}🪙`,
                      '#fbbf24'
                    );
                    const wcPool: HeroItemId[] = [
                      'battle_sword',
                      'shield_pendant',
                      'tome_xp',
                      'healing_potion',
                    ];
                    const wcDrop =
                      wcPool[Math.floor(Math.random() * wcPool.length)]!;
                    setDroppedItems(ds => [
                      ...ds,
                      {
                        id: dropItemIdRef.current++,
                        itemId: wcDrop,
                        x: capturedWCX,
                        y: capturedWCY,
                      },
                    ]);
                    addFloatingText(
                      capturedWCX,
                      capturedWCY,
                      `👑 ${HERO_ITEM_DATA[wcDrop].emoji} Dropped!`,
                      '#c084fc'
                    );
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedWCX, capturedWCY) <= 3;
                        const xpGain = isAttacker
                          ? WARCHIEF_XP_REWARD
                          : isNearby
                            ? Math.round(WARCHIEF_XP_REWARD * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
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
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleWC);
              }
            } else if (w.attacking.targetType === 'warlord') {
              const wlId = (
                w.attacking as { targetType: 'warlord'; warlordId: number }
              ).warlordId;
              const wlTarget = enemyWarlordsRef.current.find(
                wl => wl.id === wlId && wl.hp > 0
              );
              if (!wlTarget) return { ...w, attacking: null, state: 'idle' };
              const distToWL = tileDist(w.x, w.y, wlTarget.x, wlTarget.y);
              if (distToWL > 1.8) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(wlTarget.x), y: Math.round(wlTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: wlTarget.x, y: wlTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedWLX = Math.round(wlTarget.x),
                  capturedWLY = Math.round(wlTarget.y);
                const capturedWLId = wlId;
                const unitBonusWL =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetWL = w.level;
                const moraleWL = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusWL +
                    capturedVetWL * VETERAN_ATK_BONUS;
                  setEnemyWarlords(wls =>
                    wls.map(wl =>
                      wl.id === capturedWLId
                        ? { ...wl, hp: Math.max(0, wl.hp - dmg) }
                        : wl
                    )
                  );
                  addFloatingText(
                    capturedWLX,
                    capturedWLY,
                    `-${dmg}`,
                    '#ef4444'
                  );
                  const wlCurrent = enemyWarlordsRef.current.find(
                    wl => wl.id === capturedWLId
                  );
                  if (wlCurrent && wlCurrent.hp - dmg <= 0) {
                    onAchievement('warlord_slayer');
                    setResources(r => ({
                      ...r,
                      gold: r.gold + WARLORD_GOLD_REWARD,
                    }));
                    addFloatingText(
                      capturedWLX,
                      capturedWLY,
                      `⚔ +${WARLORD_GOLD_REWARD}🪙`,
                      '#c4b5fd'
                    );
                    // Warlord drops a rare item (always battle_sword or boots_speed)
                    const wlDropPool: HeroItemId[] = [
                      'battle_sword',
                      'boots_speed',
                    ];
                    const wlDrop =
                      wlDropPool[
                        Math.floor(Math.random() * wlDropPool.length)
                      ]!;
                    setDroppedItems(ds => [
                      ...ds,
                      {
                        id: dropItemIdRef.current++,
                        itemId: wlDrop,
                        x: capturedWLX,
                        y: capturedWLY,
                      },
                    ]);
                    addFloatingText(
                      capturedWLX,
                      capturedWLY,
                      `⚔ ${HERO_ITEM_DATA[wlDrop].emoji} Dropped!`,
                      '#c084fc'
                    );
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedWLX, capturedWLY) <= 3;
                        const xpGain = isAttacker
                          ? WARLORD_XP_REWARD
                          : isNearby
                            ? Math.round(WARLORD_XP_REWARD * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
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
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleWL);
              }
            } else if (w.attacking.targetType === 'lurker') {
              const lkId = (
                w.attacking as { targetType: 'lurker'; lurkerId: number }
              ).lurkerId;
              const lkTarget = enemyLurkersRef.current.find(
                lk => lk.id === lkId && lk.hp > 0
              );
              if (!lkTarget) return { ...w, attacking: null, state: 'idle' };
              const distToLK = tileDist(w.x, w.y, lkTarget.x, lkTarget.y);
              if (distToLK > 1.5) {
                const p = aStar(
                  INITIAL_TILES,
                  { x: Math.round(w.x), y: Math.round(w.y) },
                  { x: Math.round(lkTarget.x), y: Math.round(lkTarget.y) }
                );
                return {
                  ...w,
                  movingTo: p[0] ?? { x: lkTarget.x, y: lkTarget.y },
                  path: p.slice(1),
                  state: 'moving',
                };
              }
              if (!attackT[w.id]) {
                const capturedLKX = Math.round(lkTarget.x),
                  capturedLKY = Math.round(lkTarget.y);
                const capturedLKId = lkId;
                const unitBonusLK =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetLK = w.level;
                const moraleLK = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonusLK +
                    capturedVetLK * VETERAN_ATK_BONUS;
                  setEnemyLurkers(lks =>
                    lks.map(lk =>
                      lk.id === capturedLKId
                        ? { ...lk, hp: Math.max(0, lk.hp - dmg) }
                        : lk
                    )
                  );
                  addFloatingText(
                    capturedLKX,
                    capturedLKY,
                    `-${dmg}`,
                    '#99f6e4'
                  );
                  const lkCurrent = enemyLurkersRef.current.find(
                    lk => lk.id === capturedLKId
                  );
                  if (lkCurrent && lkCurrent.hp - dmg <= 0) {
                    setWorkers(ws2 =>
                      ws2.map(u => {
                        const isAttacker = u.id === w.id;
                        const isNearby =
                          !isAttacker &&
                          u.hp > 0 &&
                          tileDist(u.x, u.y, capturedLKX, capturedLKY) <= 3;
                        const xpGain = isAttacker
                          ? LURKER_XP_REWARD
                          : isNearby
                            ? Math.round(LURKER_XP_REWARD * 0.25)
                            : 0;
                        if (xpGain === 0) return u;
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
                          };
                        }
                        return { ...u, xp: newXp };
                      })
                    );
                  }
                }, moraleLK);
              }
            } else {
              if (!attackT[w.id]) {
                const capturedWX = Math.round(w.x),
                  capturedWY = Math.round(w.y);
                const unitBonus2 =
                  w.unitType === 'hero'
                    ? HERO_DAMAGE_BONUS +
                      heroItemsRef.current.reduce(
                        (s, it) =>
                          s + (HERO_ITEM_DATA[it.itemId].dmgBonus ?? 0),
                        0
                      )
                    : w.unitType === 'swordsman'
                      ? SWORDSMAN_DAMAGE_BONUS
                      : w.unitType === 'cavalry'
                        ? CAVALRY_DAMAGE_BONUS
                        : 0;
                const capturedVetLevel = w.level;
                const moraleMs4 = getMoraleMs(w.x, w.y);
                attackT[w.id] = window.setTimeout(() => {
                  delete attackTimeoutsRef.current[w.id];
                  const dmg =
                    ATTACK_DAMAGE +
                    upgradesRef.current.sharperTools * 5 +
                    blacksmithUpgradesRef.current.steelEdge * 5 +
                    (shrineWarBuffRef.current ? 5 : 0) +
                    (barracksTechRef.current.warDrums ? 8 : 0) +
                    unitBonus2 +
                    capturedVetLevel * VETERAN_ATK_BONUS;
                  setWorkers(ws2 =>
                    ws2.map(w2 => {
                      if (
                        w2.id !== w.id ||
                        w2.state !== 'attacking' ||
                        !w2.attacking
                      )
                        return w2;
                      setEnemyBarnHp(hp => {
                        const nHp = Math.max(0, hp - dmg);
                        if (nHp <= 0) {
                          setGameOver('victory');
                          return nHp;
                        }
                        const crossed = [
                          ...sallyForthThresholdsRef.current,
                        ].filter(t => hp > t && nHp <= t);
                        if (crossed.length > 0) {
                          crossed.forEach(t =>
                            sallyForthThresholdsRef.current.delete(t)
                          );
                          const wSet = new Set(
                            placedBuildingsRef.current
                              .filter(b => b.type === 'wall')
                              .map(b => `${b.x},${b.y}`)
                          );
                          const gruntHp = Math.round(
                            GRUNT_MAX_HP + (waveRef.current - 1) * 10
                          );
                          const defenders = [
                            { ox: -1, oy: 0 },
                            { ox: 0, oy: 1 },
                          ].map(({ ox, oy }) => {
                            const sx = ENEMY_BARN_POS.x + ox,
                              sy = ENEMY_BARN_POS.y + oy;
                            const path = aStar(
                              INITIAL_TILES,
                              { x: sx, y: sy },
                              BARN_POS,
                              true,
                              wSet
                            );
                            return {
                              id: gruntIdRef.current++,
                              x: sx,
                              y: sy,
                              hp: gruntHp,
                              maxHp: gruntHp,
                              movingTo: path[0] ?? BARN_POS,
                              path: path.slice(1),
                              state: 'moving' as const,
                              isBoss: false,
                            };
                          });
                          setEnemyGrunts(gs => [...gs, ...defenders]);
                          addFloatingText(
                            ENEMY_BARN_POS.x,
                            ENEMY_BARN_POS.y,
                            '⚔️ DEFENDERS!',
                            '#ef4444'
                          );
                        }
                        // Last-stand enrage: enemy barn below 50% → all grunts go berserk
                        if (
                          !lastStandEnrageRef.current &&
                          nHp <= ENEMY_BARN_MAX_HP * 0.5
                        ) {
                          lastStandEnrageRef.current = true;
                          const enrageUntil = Date.now() + 60000;
                          setEnemyGrunts(gs =>
                            gs.map(g =>
                              g.hp > 0 ? { ...g, enragedUntil: enrageUntil } : g
                            )
                          );
                          addFloatingText(
                            ENEMY_BARN_POS.x,
                            ENEMY_BARN_POS.y,
                            '💢 LAST STAND!',
                            '#dc2626'
                          );
                          setWaveAnnouncement(
                            '💢 ENEMY LAST STAND — ALL GRUNTS ENRAGED!'
                          );
                          window.setTimeout(
                            () => setWaveAnnouncement(null),
                            4000
                          );
                        }
                        return nHp;
                      });
                      addFloatingText(
                        ENEMY_BARN_POS.x,
                        ENEMY_BARN_POS.y,
                        `-${dmg}`,
                        '#ef4444'
                      );
                      const heroArmorBonus =
                        w2.unitType === 'hero'
                          ? heroItemsRef.current.reduce(
                              (s, it) =>
                                s + (HERO_ITEM_DATA[it.itemId].armorBonus ?? 0),
                              0
                            )
                          : 0;
                      const counterDmg = Math.max(
                        1,
                        ENEMY_COUNTER_DAMAGE -
                          blacksmithUpgradesRef.current.ironHide * 2 -
                          heroArmorBonus
                      );
                      addFloatingText(
                        capturedWX,
                        capturedWY,
                        `-${counterDmg}`,
                        '#fca5a5'
                      );
                      return { ...w2, hp: Math.max(0, w2.hp - counterDmg) };
                    })
                  );
                }, moraleMs4);
              }
            }
          }

          // Catapult auto-fire: idle catapult fires AoE splash at nearest grunt in range
          if (
            w.unitType === 'catapult' &&
            w.state === 'idle' &&
            !attackT[w.id]
          ) {
            const nearestGrunt =
              enemyGruntsRef.current.reduce<EnemyGrunt | null>((best, g) => {
                const d = tileDist(w.x, w.y, g.x, g.y);
                if (d > CATAPULT_RANGE) return best;
                if (!best || d < tileDist(w.x, w.y, best.x, best.y)) return g;
                return best;
              }, null);
            if (nearestGrunt) {
              const cx = nearestGrunt.x,
                cy = nearestGrunt.y;
              const capturedWX = Math.round(w.x),
                capturedWY = Math.round(w.y);
              addProjectile(
                capturedWX,
                capturedWY,
                Math.round(cx),
                Math.round(cy),
                'rock',
                CATAPULT_FIRE_MS
              );
              attackT[w.id] = window.setTimeout(() => {
                delete attackTimeoutsRef.current[w.id];
                addFloatingText(capturedWX, capturedWY, '🪨 Fire!', '#f97316');
                setEnemyGrunts(gs =>
                  gs.map(g => {
                    const d = tileDist(g.x, g.y, cx, cy);
                    if (d <= CATAPULT_SPLASH_RANGE) {
                      const dmg =
                        d === 0 ? CATAPULT_DAMAGE : CATAPULT_SPLASH_DAMAGE;
                      addFloatingText(
                        Math.round(g.x),
                        Math.round(g.y),
                        `-${dmg}`,
                        '#f97316'
                      );
                      return { ...g, hp: Math.max(0, g.hp - dmg) };
                    }
                    return g;
                  })
                );
              }, CATAPULT_FIRE_MS);
            }
          }

          // Trebuchet auto-fire: idle trebuchet fires at enemy barn or enemy towers in range (min range enforced)
          if (
            w.unitType === 'trebuchet' &&
            w.state === 'idle' &&
            !attackT[w.id]
          ) {
            const barnDist = tileDist(
              w.x,
              w.y,
              ENEMY_BARN_POS.x,
              ENEMY_BARN_POS.y
            );
            const barnAlive = enemyBarnHpRef.current > 0;
            const towerTarget = enemyTowersRef.current.find(
              t =>
                t.hp > 0 &&
                tileDist(w.x, w.y, t.x, t.y) <= TREBUCHET_RANGE &&
                tileDist(w.x, w.y, t.x, t.y) >= TREBUCHET_MIN_RANGE
            );
            const shootBarn =
              barnAlive &&
              barnDist <= TREBUCHET_RANGE &&
              barnDist >= TREBUCHET_MIN_RANGE;
            if (shootBarn || towerTarget) {
              const capturedWX = Math.round(w.x),
                capturedWY = Math.round(w.y);
              const targetPos = towerTarget
                ? {
                    x: towerTarget.x,
                    y: towerTarget.y,
                    isTower: true,
                    towerId: towerTarget.id,
                  }
                : {
                    x: ENEMY_BARN_POS.x,
                    y: ENEMY_BARN_POS.y,
                    isTower: false,
                    towerId: -1,
                  };
              addProjectile(
                capturedWX,
                capturedWY,
                targetPos.x,
                targetPos.y,
                'rock',
                TREBUCHET_FIRE_MS
              );
              attackT[w.id] = window.setTimeout(() => {
                delete attackTimeoutsRef.current[w.id];
                addFloatingText(capturedWX, capturedWY, '🪨 FIRE!', '#b45309');
                if (targetPos.isTower) {
                  addFloatingText(
                    targetPos.x,
                    targetPos.y,
                    `-${TREBUCHET_DAMAGE}`,
                    '#b45309'
                  );
                  setEnemyTowers(ts =>
                    ts.map(t =>
                      t.id === targetPos.towerId
                        ? { ...t, hp: Math.max(0, t.hp - TREBUCHET_DAMAGE) }
                        : t
                    )
                  );
                } else {
                  addFloatingText(
                    ENEMY_BARN_POS.x,
                    ENEMY_BARN_POS.y,
                    `-${TREBUCHET_DAMAGE}`,
                    '#b45309'
                  );
                  setEnemyBarnHp(hp => {
                    const nHp = Math.max(0, hp - TREBUCHET_DAMAGE);
                    if (nHp <= 0) {
                      setGameOver('victory');
                      return nHp;
                    }
                    const crossed = [...sallyForthThresholdsRef.current].filter(
                      t => hp > t && nHp <= t
                    );
                    if (crossed.length > 0) {
                      crossed.forEach(t =>
                        sallyForthThresholdsRef.current.delete(t)
                      );
                      const wSet = new Set(
                        placedBuildingsRef.current
                          .filter(b => b.type === 'wall')
                          .map(b => `${b.x},${b.y}`)
                      );
                      const gruntHp = Math.round(
                        GRUNT_MAX_HP + (waveRef.current - 1) * 10
                      );
                      const defenders = [
                        { ox: -1, oy: 0 },
                        { ox: 0, oy: 1 },
                      ].map(({ ox, oy }) => {
                        const sx = ENEMY_BARN_POS.x + ox,
                          sy = ENEMY_BARN_POS.y + oy;
                        const path = aStar(
                          INITIAL_TILES,
                          { x: sx, y: sy },
                          BARN_POS,
                          true,
                          wSet
                        );
                        return {
                          id: gruntIdRef.current++,
                          x: sx,
                          y: sy,
                          hp: gruntHp,
                          maxHp: gruntHp,
                          movingTo: path[0] ?? BARN_POS,
                          path: path.slice(1),
                          state: 'moving' as const,
                          isBoss: false,
                        };
                      });
                      setEnemyGrunts(gs => [...gs, ...defenders]);
                      addFloatingText(
                        ENEMY_BARN_POS.x,
                        ENEMY_BARN_POS.y,
                        '⚔️ DEFENDERS!',
                        '#ef4444'
                      );
                    }
                    return nHp;
                  });
                }
              }, TREBUCHET_FIRE_MS);
            }
          }

          // Building repair: worker in 'repairing' state ticks HP up on the target building
          if (w.state === 'repairing' && w.repairing) {
            const bid = w.repairing.buildingId;
            if (!buildingRepairTimeoutsRef.current[w.id]) {
              const capturedWId = w.id;
              buildingRepairTimeoutsRef.current[capturedWId] =
                window.setTimeout(() => {
                  delete buildingRepairTimeoutsRef.current[capturedWId];
                  let stillDamaged = false;
                  setPlacedBuildings(bs =>
                    bs.map(b => {
                      if (b.id !== bid) return b;
                      const newHp = Math.min(b.maxHp, b.hp + 5);
                      stillDamaged = newHp < b.maxHp;
                      addFloatingText(b.x, b.y, '+5🔧', '#34d399');
                      return { ...b, hp: newHp };
                    })
                  );
                  // If building is fully repaired, go idle
                  if (!stillDamaged) {
                    setWorkers(ws2 =>
                      ws2.map(w2 =>
                        w2.id === capturedWId
                          ? { ...w2, repairing: null, state: 'idle' as const }
                          : w2
                      )
                    );
                  }
                }, REPAIR_INTERVAL_MS);
            }
          } else if (
            buildingRepairTimeoutsRef.current[w.id] &&
            w.state !== 'repairing'
          ) {
            clearTimeout(buildingRepairTimeoutsRef.current[w.id]);
            delete buildingRepairTimeoutsRef.current[w.id];
          }

          // Auto-repair: idle workers near barn slowly regenerate HP
          if (
            w.state === 'idle' &&
            w.hp < w.maxHp &&
            tileDist(w.x, w.y, BARN_POS.x, BARN_POS.y) <= REPAIR_RADIUS
          ) {
            if (!repairTimeoutsRef.current[w.id]) {
              const capturedId = w.id;
              repairTimeoutsRef.current[capturedId] = window.setTimeout(() => {
                delete repairTimeoutsRef.current[capturedId];
                setWorkers(ws2 =>
                  ws2.map(w2 => {
                    if (
                      w2.id !== capturedId ||
                      w2.state !== 'idle' ||
                      w2.hp >= w2.maxHp
                    )
                      return w2;
                    addFloatingText(
                      Math.round(w2.x),
                      Math.round(w2.y),
                      `+${REPAIR_AMOUNT}`,
                      '#4ade80'
                    );
                    return {
                      ...w2,
                      hp: Math.min(w2.maxHp, w2.hp + REPAIR_AMOUNT),
                    };
                  })
                );
              }, REPAIR_INTERVAL_MS);
            }
          } else if (repairTimeoutsRef.current[w.id] && w.state !== 'idle') {
            clearTimeout(repairTimeoutsRef.current[w.id]);
            delete repairTimeoutsRef.current[w.id];
          }

          // Auto-repair burning buildings: idle farmers near a burning building automatically start repairing it
          if (
            w.state === 'idle' &&
            w.unitType === 'farmer' &&
            !w.gathering &&
            !w.attacking
          ) {
            const burningBuilding = placedBuildingsRef.current.find(
              b =>
                b.hp > 0 &&
                b.hp / b.maxHp < 0.25 &&
                tileDist(w.x, w.y, b.x, b.y) <= 3
            );
            if (burningBuilding) {
              const dest = { x: burningBuilding.x, y: burningBuilding.y };
              const p = aStar(
                INITIAL_TILES,
                { x: Math.round(w.x), y: Math.round(w.y) },
                dest
              );
              return {
                ...w,
                repairing: { buildingId: burningBuilding.id },
                state: 'moving' as const,
                movingTo: p[0] ?? dest,
                path: p.slice(1),
              };
            }
          }

          // Patrol: when idle at endpoint, flip heading and march to other point
          if (w.patrol && w.state === 'idle' && !w.movingTo) {
            const nextTarget =
              w.patrol.heading === 'b' ? w.patrol.a : w.patrol.b;
            const newHeading =
              w.patrol.heading === 'b' ? ('a' as const) : ('b' as const);
            const p = aStar(
              INITIAL_TILES,
              { x: Math.round(w.x), y: Math.round(w.y) },
              nextTarget
            );
            return {
              ...w,
              patrol: { ...w.patrol, heading: newHeading },
              movingTo: p[0] ?? nextTarget,
              path: p.slice(1),
              state: 'moving',
            };
          }

          return w;
        });
      });

      // Detect newly dead workers and record corpse positions
      {
        const now = Date.now();
        const newlyDead = workersRef.current.filter(
          w => w.hp <= 0 && !deadWorkerIdsRef.current.has(w.id)
        );
        if (newlyDead.length > 0) {
          newlyDead.forEach(w => deadWorkerIdsRef.current.add(w.id));
          setDeadWorkerPositions(prev => [
            ...prev.filter(p => now - p.t < 8000),
            ...newlyDead.map(w => ({
              x: Math.round(w.x),
              y: Math.round(w.y),
              t: now,
              unitType: w.unitType,
            })),
          ]);
        }
      }

      // Detect destroyed enemy walls and award loot
      {
        const destroyed = enemyWallsRef.current.filter(ew => ew.hp <= 0);
        if (destroyed.length > 0) {
          setEnemyWalls(ews => ews.filter(ew => ew.hp > 0));
          destroyed.forEach(ew => {
            const gold = 15;
            setResources(r => ({ ...r, gold: r.gold + gold }));
            addFloatingText(ew.x, ew.y, `🧱 +${gold}🪙`, '#fbbf24');
          });
        }
      }
      // Detect destroyed enemy towers, award loot, clean up dead entries
      {
        const destroyed = enemyTowersRef.current.filter(t => t.hp <= 0);
        if (destroyed.length > 0) {
          setEnemyTowers(ts => ts.filter(t => t.hp > 0));
          destroyed.forEach(t => {
            const gold = t.id === -1 ? 40 : 25;
            setResources(r => ({ ...r, gold: r.gold + gold }));
            addFloatingText(t.x, t.y, `🏰 +${gold}🪙`, '#fbbf24');
          });
        }
      }

      tickEnemyGrunts(ctx, dt);

      tickWarRams(ctx, dt);

      tickShamans(ctx, dt);

      tickNecromancers(ctx, dt);

      tickWitchDoctors(ctx, dt);

      tickWarchiefs(ctx, dt);

      tickWarlords(ctx, dt);

      tickLurkers(ctx, dt, lurkerKillCountRef);

      tickTrollArchers(ctx, dt);

      tickGoblinSappers(ctx, dt, sapperWarnedRef);

      tickNeutralCreeps(ctx, dt);

      // Fog of war update — throttled to every 350ms to avoid per-frame state churn
      const nowFog = Date.now();
      if (nowFog - lastFogUpdateRef.current >= 350) {
        lastFogUpdateRef.current = nowFog;
        const newVisible = computeVisible([
          { x: BARN_POS.x, y: BARN_POS.y, r: BARN_VISION },
          ...workersRef.current.map(w => ({
            x: Math.round(w.x),
            y: Math.round(w.y),
            r: WORKER_VISION,
          })),
          ...placedBuildingsRef.current.map(b => ({
            x: b.x,
            y: b.y,
            r: b.type === 'watchtower' ? WATCHTOWER_VISION : 2,
          })),
        ]);
        // Check if visible set changed
        let visChanged = false;
        const prevVis = fogVisibleRef.current;
        outer: for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            if (!!newVisible[i]?.[j] !== !!prevVis[i]?.[j]) {
              visChanged = true;
              break outer;
            }
          }
        }
        if (visChanged) {
          fogVisibleRef.current = newVisible;
          setFogVisible(newVisible);
          // Also expand explored fog
          const prevExp = fogExploredRef.current;
          let expChanged = false;
          const nextExp = prevExp.map((row, i) =>
            row.map((v, j) => {
              if (!v && newVisible[i]?.[j]) {
                expChanged = true;
                return true;
              }
              return v;
            })
          );
          if (expChanged) {
            fogExploredRef.current = nextExp;
            setFogExplored(nextExp);
          }
        }
      }

      // Workers can also attack creeps (already tracked via attackTimeoutsRef for grunt targets)
      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      Object.values(gatherTimeoutsRef.current).forEach(clearTimeout);
      Object.values(attackTimeoutsRef.current).forEach(clearTimeout);
      Object.values(gruntAttackTimeoutsRef.current).forEach(clearTimeout);
      Object.values(repairTimeoutsRef.current).forEach(clearTimeout);
      Object.values(creepAttackTimeoutsRef.current).forEach(clearTimeout);
      Object.values(buildingRepairTimeoutsRef.current).forEach(clearTimeout);
      gatherTimeoutsRef.current = {};
      attackTimeoutsRef.current = {};
      gruntAttackTimeoutsRef.current = {};
      repairTimeoutsRef.current = {};
      creepAttackTimeoutsRef.current = {};
      buildingRepairTimeoutsRef.current = {};
    };
  }, []);
}
