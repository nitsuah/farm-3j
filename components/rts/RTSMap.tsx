'use client';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';

import { RTSUI } from './RTSUI';
import {
  type FormationMode,
  type RTSHandlerContext,
  SHOP_ITEMS,
  useRTSHandlers,
} from './hooks/useRTSHandlers';

import {
  BARN_POS,
  BUILDING_COSTS,
  BUILDING_MAX_HP,
  CREEP_CAMPS,
  CREEP_MAX_HP,
  ENEMY_BARN_MAX_HP,
  ENEMY_BARN_POS,
  GARRISON_CAP,
  GRID_SIZE,
  HERO_MAX_HP,
  PLAYER_BARN_MAX_HP,
  TILE_SIZE,
} from './game/constants';
import type { BuildingType } from './game/types';
import { INITIAL_TILES, tileToSvg } from './game/map';
import { aStar } from './game/pathfinding';
import {
  ALL_ACHIEVEMENTS,
  unlockAchievement,
  type Achievement,
} from './game/achievements';
import { saveHighScore, writeSave, type SaveSlot } from './game/persistence';
import { makeUnit } from './game/units';
import {
  getSoundMuted,
  setSoundMuted,
  startAmbient,
  stopAmbient,
  Snd,
} from './game/sound';
import { AchievementPanel } from './hud/AchievementPanel';
import { AlertsOverlay } from './hud/AlertsOverlay';
import { BuffIndicators } from './hud/BuffIndicators';
import { ControlGroupBar } from './hud/ControlGroupBar';
import { ControlGroupChips } from './hud/ControlGroupChips';
import { DamageLogPanel } from './hud/DamageLogPanel';
import { GameOverOverlay } from './hud/GameOverOverlay';
import { MinimapPanel } from './hud/MinimapPanel';
import { ResourceBar } from './hud/ResourceBar';
import { BuildingsLayer } from './map/BuildingsLayer';
import { EffectsLayer } from './map/EffectsLayer';
import { EnemyBaseLayer } from './map/EnemyBaseLayer';
import { EnemyEliteLayer } from './map/EnemyEliteLayer';
import { EnemyGruntsLayer } from './map/EnemyGruntsLayer';
import { EnemySiegeCastersLayer } from './map/EnemySiegeCastersLayer';
import { NeutralLayer } from './map/NeutralLayer';
import { OverlayRingsLayer } from './map/OverlayRingsLayer';
import { PlayerBarnLayer } from './map/PlayerBarnLayer';
import { ResourceNodesLayer } from './map/ResourceNodesLayer';
import { TerrainLayer } from './map/TerrainLayer';
import { WorkersLayer } from './map/WorkersLayer';
import { useGameLoop } from './hooks/useGameLoop';
import { useProduction } from './hooks/useProduction';
import { useTowerCombat } from './hooks/useTowerCombat';
import { useWaveSpawner } from './hooks/useWaveSpawner';
import { useWorldTicks } from './hooks/useWorldTicks';
import {
  useBotController,
  type BotCommands,
  type BotSnapshot,
} from './hooks/useBotController';
import { useFloatingText } from './hooks/useFloatingText';
import { usePanZoom } from './hooks/usePanZoom';
import { useProjectiles } from './hooks/useProjectiles';
import { makeWorker, useRTSGameState } from './hooks/useRTSGameState';

// Re-exported for backwards compatibility â€” previously defined in this file.
export { BUILDING_REQUIRES } from './game/constants';

import type { DifficultyConfig } from './RTSGameRoot';

const RTSMap: React.FC<{
  onNewGame?: () => void;
  difficulty?: DifficultyConfig;
  slot?: SaveSlot;
}> = ({ onNewGame, difficulty, slot = 0 }) => {
  // ── Game state (state declarations, ref-sync effects) ──────────────────────
  const {
    tiles,
    fogExplored,
    setFogExplored,
    fogExploredRef,
    fogVisible,
    setFogVisible,
    fogVisibleRef,
    placedBuildings,
    setPlacedBuildings,
    buildingIdRef,
    placedBuildingsRef,
    resources,
    setResources,
    trees,
    setTrees,
    treesRef,
    goldMines,
    setGoldMines,
    goldMinesRef,
    stoneNodes,
    setStoneNodes,
    stoneNodesRef,
    workers,
    setWorkers,
    workersRef,
    enemyGrunts,
    setEnemyGrunts,
    enemyGruntsRef,
    gruntIdRef,
    gruntAttackTimeoutsRef,
    neutralCreeps,
    setNeutralCreeps,
    neutralCreepsRef,
    clearedCamps,
    setClearedCamps,
    campClearedAtRef,
    creepAttackTimeoutsRef,
    creepIdCounterRef,
    wave,
    setWave,
    waveRef,
    enemyTowers,
    setEnemyTowers,
    enemyTowersRef,
    enemyTowerTimersRef,
    enemyWalls,
    setEnemyWalls,
    enemyWallsRef,
    enemyWallIdRef,
    enemySiege,
    setEnemySiege,
    enemySiegeRef,
    siegeIdRef,
    enemyShamans,
    setEnemyShamans,
    enemyShamansRef,
    shamanIdRef,
    shamanHealTimersRef,
    enemyNecromancers,
    setEnemyNecromancers,
    enemyNecromancersRef,
    necromancerIdRef,
    necromancerRaiseTimersRef,
    enemyWitchDoctors,
    setEnemyWitchDoctors,
    enemyWitchDoctorsRef,
    witchDoctorIdRef,
    witchDoctorBuffTimersRef,
    enemyWarchiefs,
    setEnemyWarchiefs,
    enemyWarchiefsRef,
    warchiefIdRef,
    enemyWarlords,
    setEnemyWarlords,
    enemyWarlordsRef,
    warlordIdRef,
    enemyLurkers,
    setEnemyLurkers,
    enemyLurkersRef,
    lurkerIdRef,
    lurkerAttackTimeoutsRef,
    enemyTrolls,
    setEnemyTrolls,
    enemyTrollsRef,
    trollIdRef,
    trollAttackTimersRef,
    enemySappers,
    setEnemySappers,
    enemySappersRef,
    sapperIdRef,
    deadGruntPositions,
    setDeadGruntPositions,
    deadGruntPositionsRef,
    deadWorkerPositions,
    setDeadWorkerPositions,
    deadWorkerIdsRef,
    lootCrates,
    setLootCrates,
    lootCratesRef,
    lootCrateIdRef,
    heroItems,
    setHeroItems,
    heroItemsRef,
    droppedItems,
    setDroppedItems,
    droppedItemsRef,
    dropItemIdRef,
    pendingPickupRef,
    waveAnnouncement,
    setWaveAnnouncement,
    wavePreview,
    setWavePreview,
    previewTimerRef,
    gameOver,
    setGameOver,
    gameOverRef,
    spawnTimerRef,
    nextWaveAt,
    setNextWaveAt,
    nextWaveAtRef,
    waveTimerRemainingRef,
    capturedShrines,
    setCapturedShrines,
    capturedShrinesRef,
    shrineCapturing,
    setShrineCapturing,
    shrineCapturingRef,
    shrineWarBuff,
    setShrineWarBuff,
    shrineWarBuffRef,
    shrinePlentyBuff,
    setShrinePlentyBuff,
    shrinePlentyBuffRef,
    gameSpeed,
    setGameSpeed,
    gameSpeedRef,
    barnDmgThisWaveRef,
    sallyForthThresholdsRef,
    lastStandEnrageRef,
    enemyBarnHp,
    setEnemyBarnHp,
    enemyBarnHpRef,
    playerBarnHp,
    setPlayerBarnHp,
    playerBarnHpRef,
    garrisoned,
    setGarrisoned,
    garrisonedRef,
    towerGarrison,
    setTowerGarrison,
    towerGarrisonRef,
    heroRecruited,
    setHeroRecruited,
    heroReviveAt,
    setHeroReviveAt,
    heroReviveCountdown,
    setHeroReviveCountdown,
    heroXpRef,
    heroAbilityCooldown,
    setHeroAbilityCooldown,
    heroShoutCooldown,
    setHeroShoutCooldown,
    battleShoutUntil,
    setBattleShoutUntil,
    battleShoutUntilRef,
    harvestBoonCooldown,
    setHarvestBoonCooldown,
    harvestBoonActive,
    setHarvestBoonActive,
    harvestBoonRef,
    earthquakeCooldown,
    setEarthquakeCooldown,
    earthquakeEffect,
    setEarthquakeEffect,
    killCount,
    setKillCount,
    totalGold,
    setTotalGold,
    totalLumber,
    setTotalLumber,
    totalStone,
    setTotalStone,
    farmhouse,
    setFarmhouse,
    rallyPoint,
    setRallyPoint,
    rallyPointRef,
    stance,
    setStance,
    stanceRef,
    upgrades,
    setUpgrades,
    upgradesRef,
    blacksmithUpgrades,
    setBlacksmithUpgrades,
    blacksmithUpgradesRef,
    guardTowerResearched,
    setGuardTowerResearched,
    guardTowerRef,
    barracksTech,
    setBarracksTech,
    barracksTechRef,
    upkeepMult,
    upkeepMultRef,
    trainingQueue,
    setTrainingQueue,
    trainingQueueRef,
    trainingElapsedRef,
    trainingProgress,
    setTrainingProgress,
    isNightRef,
    incomeAccRef,
    sapperKillCountRef,
    gatherTimeoutsRef,
    attackTimeoutsRef,
    repairTimeoutsRef,
    watchtowerTimersRef,
    trapTriggeredRef,
    buildingAttackTimeoutsRef,
    siegeAttackTimeoutsRef,
    buildingRepairTimeoutsRef,
    animationRef,
    prevTimeRef,
    lastFogUpdateRef,
    workerHitRef,
    gruntHitRef,
  } = useRTSGameState(slot, difficulty);

  // ── UI-only state (stays in RTSMap) ───────────────────────────────────────
  const {
    svgRef,
    zoom,
    setZoom,
    camera,
    setCamera,
    screenShake,
    triggerShake: _triggerShake,
    triggerShakeRef,
  } = usePanZoom();
  const [soundMuted, setSoundMutedState] = useState(getSoundMuted);
  const toggleMute = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setSoundMutedState(next);
  };

  const [dragBox, setDragBox] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);
  const isDraggingRef = useRef(false);
  const [buildMode, setBuildMode] = useState<BuildingType | null>(null);
  const [ghostTile, setGhostTile] = useState<{ x: number; y: number } | null>(
    null
  );
  const [controlGroups, setControlGroups] = useState<Record<number, number[]>>(
    {}
  );
  const [formationMode, setFormationMode] = useState<FormationMode>('cluster');
  const formationModeRef = useRef<FormationMode>('cluster');
  useEffect(() => {
    formationModeRef.current = formationMode;
  }, [formationMode]);
  const idleWorkerIndexRef = useRef(0);
  const lastGroupKeyRef = useRef<{ num: number; t: number } | null>(null);
  // Ambient chickens — decorative only, wander near barn
  const [chickens, setChickens] = useState<
    { id: number; x: number; y: number; facing: 1 | -1 }[]
  >(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: BARN_POS.x + (i % 3) - 1,
      y: BARN_POS.y + Math.floor(i / 3) + 1,
      facing: 1 as const,
    }))
  );
  const [damageLog, setDamageLog] = useState<
    { source: string; amount: number; t: number }[]
  >([]);
  const [damageLogOpen, setDamageLogOpen] = useState(false);
  const addDmgLog = useCallback((source: string, amount: number) => {
    setDamageLog(prev => [
      ...prev.slice(-49),
      { source, amount, t: Date.now() },
    ]);
  }, []);
  const startTimeRef = useRef(Date.now());
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  useEffect(() => {
    if (gameOver && !gameEndTime) {
      const endTime = Date.now();
      setGameEndTime(endTime);
      void saveHighScore({
        wave,
        kills: killCount,
        result: gameOver,
        gold: totalGold,
        time: Math.floor((endTime - startTimeRef.current) / 1000),
        date: new Date().toLocaleDateString(),
      });
      if (gameOver === 'victory') Snd.victory();
      else Snd.defeat();
    }
  }, [gameOver, gameEndTime, wave, killCount, totalGold]);

  const farmhouseUpgradeCosts = [
    { gold: 50, lumber: 50 },
    { gold: 100, lumber: 100 },
    { gold: 200, lumber: 200 },
  ];
  const farmhouseStorage = [
    { gold: 100, lumber: 100 },
    { gold: 200, lumber: 200 },
    { gold: 400, lumber: 400 },
  ];
  const [selectedType, setSelectedType] = useState<
    'worker' | 'farmhouse' | 'building' | null
  >('worker');
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(
    null
  );
  const [patrolMode, setPatrolMode] = useState(false);
  const patrolModeRef = useRef(false);
  useEffect(() => {
    patrolModeRef.current = patrolMode;
  }, [patrolMode]);
  const [attackMoveMode, setAttackMoveMode] = useState(false);
  const attackMoveModeRef = useRef(false);
  useEffect(() => {
    attackMoveModeRef.current = attackMoveMode;
  }, [attackMoveMode]);
  // Day/Night cycle
  const DAY_DURATION_MS = 60000;
  const NIGHT_DURATION_MS = 45000;
  const [dayPhase, setDayPhase] = useState<'day' | 'night'>('day');
  const [dayProgress, setDayProgress] = useState(0); // 0-1 through current phase
  const [phaseAnnouncement, setPhaseAnnouncement] = useState<string | null>(
    null
  );
  useEffect(() => {
    isNightRef.current = dayPhase === 'night';
    if (!soundMuted) startAmbient(dayPhase === 'night');
  }, [dayPhase, soundMuted]);

  // Stop ambient audio when muted or game over
  useEffect(() => {
    if (soundMuted || gameOver) stopAmbient();
    else startAmbient(isNightRef.current);
  }, [soundMuted, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    let phaseStart = Date.now();
    let currentPhase: 'day' | 'night' = 'day';
    const tick = setInterval(() => {
      if (gameOverRef.current) return;
      const elapsed = Date.now() - phaseStart;
      const duration =
        currentPhase === 'day' ? DAY_DURATION_MS : NIGHT_DURATION_MS;
      setDayProgress(Math.min(1, elapsed / duration));
      if (elapsed >= duration) {
        currentPhase = currentPhase === 'day' ? 'night' : 'day';
        setDayPhase(currentPhase);
        phaseStart = Date.now();
        const msg =
          currentPhase === 'night'
            ? 'ðŸŒ™ Night Falls! Grunts grow strongerâ€¦'
            : 'â˜€ï¸ Dawn Breaks!';
        setPhaseAnnouncement(msg);
        setTimeout(() => setPhaseAnnouncement(null), 2500);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [gameOver]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(
    null
  );
  const [achievementPanelOpen, setAchievementPanelOpen] = useState(false);
  const [incomeRate, setIncomeRate] = useState({
    gold: 0,
    lumber: 0,
    stone: 0,
  });
  const [underAttack, setUnderAttack] = useState(false);
  const underAttackTimerRef = useRef<number | null>(null);
  const [minimapPings, setMinimapPings] = useState<
    { x: number; y: number; t: number }[]
  >([]);
  const triggerUnderAttack = useCallback((pos?: { x: number; y: number }) => {
    setUnderAttack(true);
    if (underAttackTimerRef.current) clearTimeout(underAttackTimerRef.current);
    underAttackTimerRef.current = window.setTimeout(
      () => setUnderAttack(false),
      4000
    );
    if (pos)
      setMinimapPings(prev => [
        ...prev.filter(p => Date.now() - p.t < 3000),
        { x: pos.x, y: pos.y, t: Date.now() },
      ]);
  }, []);
  const triggerUnderAttackRef = useRef(triggerUnderAttack);
  useEffect(() => {
    triggerUnderAttackRef.current = triggerUnderAttack;
  }, [triggerUnderAttack]);

  const doSave = useCallback(() => {
    writeSave(
      {
        version: 1,
        resources,
        workers: workersRef.current.map(w => ({
          id: w.id,
          x: Math.round(w.x),
          y: Math.round(w.y),
          hp: w.hp,
          maxHp: w.maxHp,
          unitType: w.unitType,
          group: w.group,
          xp: w.xp,
          level: w.level,
          gathering: w.gathering,
          state: w.state,
        })),
        trees: treesRef.current,
        goldMines: goldMinesRef.current,
        stoneNodes: stoneNodesRef.current,
        placedBuildings: placedBuildingsRef.current,
        buildingNextId: buildingIdRef.current,
        farmhouse,
        upgrades: upgradesRef.current,
        wave: waveRef.current,
        killCount,
        totalGold,
        totalLumber,
        totalStone,
        playerBarnHp: playerBarnHpRef.current,
        enemyBarnHp,
        rallyPoint,
        fogExplored,
        guardTowerResearched,
        barracksTech,
        blacksmithUpgrades,
        savedAt: Date.now(),
        difficultyId: difficulty?.id,
      },
      slot
    );
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [
    resources,
    farmhouse,
    killCount,
    totalGold,
    totalLumber,
    totalStone,
    enemyBarnHp,
    rallyPoint,
    fogExplored,
    guardTowerResearched,
    barracksTech,
    blacksmithUpgrades,
  ]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(doSave, 30000);
    return () => clearInterval(id);
  }, [gameOver, doSave]);

  const triggerAchievement = useCallback((id: string) => {
    const isNew = unlockAchievement(id);
    if (!isNew) return;
    const achv = ALL_ACHIEVEMENTS.find(a => a.id === id);
    if (!achv) return;
    Snd.achievementUnlock();
    setAchievementToast(achv);
    window.setTimeout(() => setAchievementToast(null), 4500);
  }, []);

  // Achievement: kill milestones
  useEffect(() => {
    if (killCount >= 1) triggerAchievement('first_blood');
    if (killCount >= 100) triggerAchievement('kill_100');
    if (killCount >= 500) triggerAchievement('kill_500');
  }, [killCount, triggerAchievement]);

  // Achievement: wave milestones
  useEffect(() => {
    if (wave >= 10) triggerAchievement('wave_10');
    if (wave >= 20) triggerAchievement('wave_20');
    if (wave >= 30) triggerAchievement('wave_30');
    if (wave >= 50) triggerAchievement('wave_50');
  }, [wave, triggerAchievement]);

  // Achievement: total gold earned
  useEffect(() => {
    if (totalGold >= 1000) triggerAchievement('gold_baron');
  }, [totalGold, triggerAchievement]);

  // Achievement: unit count and veterancy
  useEffect(() => {
    if (workers.length >= 6) triggerAchievement('pack_leader');
    const level3Count = workers.filter(w => w.level >= 3).length;
    if (level3Count >= 3) triggerAchievement('veteran_corps');
  }, [workers, triggerAchievement]);

  // Achievement: hero items
  useEffect(() => {
    if (heroItems.length >= 3) triggerAchievement('hero_equipped');
  }, [heroItems, triggerAchievement]);

  // Achievement: buildings â€” fortified (3 walls) and blacksmith max
  useEffect(() => {
    const wallCount = placedBuildings.filter(b => b.type === 'wall').length;
    if (wallCount >= 3) triggerAchievement('fortified');
  }, [placedBuildings, triggerAchievement]);

  useEffect(() => {
    if (blacksmithUpgrades.steelEdge >= 2 || blacksmithUpgrades.ironHide >= 2) {
      triggerAchievement('blacksmith_max');
    }
  }, [blacksmithUpgrades, triggerAchievement]);

  // Income rate: snapshot every 30s, publish as per-minute rate
  useEffect(() => {
    const id = setInterval(() => {
      const acc = incomeAccRef.current;
      setIncomeRate({
        gold: acc.gold * 2,
        lumber: acc.lumber * 2,
        stone: acc.stone * 2,
      });
      incomeAccRef.current = { gold: 0, lumber: 0, stone: 0 };
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Save on tab close
  useEffect(() => {
    const handler = () => {
      if (!gameOverRef.current) doSave();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [doSave]);

  const { floatingTexts, addFloatingText } = useFloatingText();

  // Creep camp respawn: cleared camps respawn after 3 minutes (WC3-style)
  const CAMP_RESPAWN_MS = 180_000;
  useEffect(() => {
    const id = setInterval(() => {
      if (gameOverRef.current || gameSpeedRef.current === 0) return;
      const now = Date.now();
      const toRespawn = CREEP_CAMPS.filter(camp => {
        const clearedAt = campClearedAtRef.current[camp.id];
        return clearedAt && now - clearedAt >= CAMP_RESPAWN_MS;
      });
      if (toRespawn.length === 0) return;
      toRespawn.forEach(camp => {
        delete campClearedAtRef.current[camp.id];
        addFloatingText(camp.x, camp.y, 'âš  Creeps Respawned!', '#f87171');
      });
      setClearedCamps(s => {
        const n = new Set(s);
        toRespawn.forEach(c => n.delete(c.id));
        return n;
      });
      setNeutralCreeps(cs => {
        const respawnedIds = new Set(toRespawn.map(c => c.id));
        const existing = cs.filter(c => !respawnedIds.has(c.campId));
        const newCreeps = toRespawn.flatMap(camp => [
          {
            id: creepIdCounterRef.current++,
            campId: camp.id,
            x: camp.x,
            y: camp.y,
            homeX: camp.x,
            homeY: camp.y,
            hp: CREEP_MAX_HP,
            maxHp: CREEP_MAX_HP,
            state: 'idle' as const,
            targetWorkerId: null,
          },
          {
            id: creepIdCounterRef.current++,
            campId: camp.id,
            x: camp.x + 1,
            y: camp.y,
            homeX: camp.x + 1,
            homeY: camp.y,
            hp: CREEP_MAX_HP,
            maxHp: CREEP_MAX_HP,
            state: 'idle' as const,
            targetWorkerId: null,
          },
        ]);
        return [...existing, ...newCreeps];
      });
    }, 5000);
    return () => clearInterval(id);
  }, [addFloatingText]);

  // Hero revive timer â€” ticks down, spawns hero on completion
  useEffect(() => {
    if (heroReviveAt === null) {
      setHeroReviveCountdown(0);
      return;
    }
    const id = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((heroReviveAt - Date.now()) / 1000)
      );
      setHeroReviveCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        setHeroReviveAt(null);
        setWorkers(ws => {
          const newId = Math.max(...ws.map(w => w.id), 0) + 1;
          const hero = makeUnit(newId, BARN_POS.x, BARN_POS.y, 'hero');
          const saved = heroXpRef.current;
          return [
            ...ws,
            saved
              ? {
                  ...hero,
                  xp: saved.xp,
                  level: saved.level,
                  maxHp: HERO_MAX_HP + saved.level * 10,
                  hp: HERO_MAX_HP + saved.level * 10,
                }
              : hero,
          ];
        });
        addFloatingText(
          BARN_POS.x,
          BARN_POS.y,
          'ðŸ¦¸ Barnabas Returns!',
          '#fbbf24'
        );
      }
    }, 500);
    return () => clearInterval(id);
  }, [heroReviveAt, addFloatingText]);

  // Detect hero death â†' start auto-revive timer
  useEffect(() => {
    if (!heroRecruited || heroReviveAt !== null || gameOver) return;
    const hero = workers.find(w => w.unitType === 'hero');
    if (!hero || hero.hp > 0) return;
    heroXpRef.current = { xp: hero.xp, level: hero.level };
    const reviveDelay = Math.min(60000, 20000 + waveRef.current * 2000);
    setHeroReviveAt(Date.now() + reviveDelay);
    setWorkers(ws => ws.filter(w => w.unitType !== 'hero'));
    addFloatingText(hero.x, hero.y, 'ðŸ¦¸ Barnabas Fallen!', '#f97316');
  }, [workers, heroRecruited, heroReviveAt, gameOver, addFloatingText]);

  const { projectiles, addProjectile, moveRing, setMoveRing } =
    useProjectiles();

  // Fog of war: updated in the animate loop to avoid useEffect cascade

  const gameCtx = {
    difficulty,
    onAchievement: triggerAchievement,
    addDmgLog,
    addFloatingText,
    addProjectile,
    animationRef,
    attackTimeoutsRef,
    barnDmgThisWaveRef,
    barracksTechRef,
    battleShoutUntilRef,
    blacksmithUpgradesRef,
    buildingAttackTimeoutsRef,
    buildingRepairTimeoutsRef,
    campClearedAtRef,
    capturedShrinesRef,
    creepAttackTimeoutsRef,
    deadGruntPositionsRef,
    deadWorkerIdsRef,
    dropItemIdRef,
    droppedItemsRef,
    enemyBarnHpRef,
    enemyGruntsRef,
    enemyNecromancersRef,
    enemySappersRef,
    enemyShamansRef,
    enemySiegeRef,
    enemyTowerTimersRef,
    enemyTowers,
    enemyTowersRef,
    enemyTrollsRef,
    enemyWallIdRef,
    enemyLurkersRef,
    enemyWallsRef,
    enemyWarchiefsRef,
    enemyWarlordsRef,
    enemyWitchDoctorsRef,
    farmhouse,
    fogExploredRef,
    fogVisibleRef,
    gameOver,
    gameOverRef,
    gameSpeed,
    gameSpeedRef,
    garrisoned,
    garrisonedRef,
    gatherTimeoutsRef,
    goldMinesRef,
    gruntAttackTimeoutsRef,
    gruntHitRef,
    gruntIdRef,
    guardTowerRef,
    harvestBoonRef,
    heroItemsRef,
    incomeAccRef,
    isNightRef,
    lastFogUpdateRef,
    lastStandEnrageRef,
    lootCrateIdRef,
    lootCratesRef,
    necromancerIdRef,
    necromancerRaiseTimersRef,
    neutralCreepsRef,
    nextWaveAtRef,
    pendingPickupRef,
    placedBuildings,
    placedBuildingsRef,
    playerBarnHpRef,
    prevTimeRef,
    previewTimerRef,
    rallyPointRef,
    repairTimeoutsRef,
    sallyForthThresholdsRef,
    sapperIdRef,
    sapperKillCountRef,
    setCapturedShrines,
    setClearedCamps,
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
    setEnemyLurkers,
    setEnemyWalls,
    setEnemyWarchiefs,
    setEnemyWarlords,
    setEnemyWitchDoctors,
    setFogExplored,
    setFogVisible,
    setGameOver,
    setGarrisoned,
    setGoldMines,
    setHeroItems,
    setKillCount,
    setLootCrates,
    setNeutralCreeps,
    setNextWaveAt,
    setPlacedBuildings,
    setPlayerBarnHp,
    setResources,
    setShrineCapturing,
    setShrinePlentyBuff,
    setShrineWarBuff,
    setStoneNodes,
    setTotalGold,
    setTotalLumber,
    setTotalStone,
    setTrainingProgress,
    setTrainingQueue,
    setTrees,
    setWave,
    setWaveAnnouncement,
    setWavePreview,
    setWorkers,
    shamanHealTimersRef,
    shamanIdRef,
    shrineCapturingRef,
    shrinePlentyBuffRef,
    shrineWarBuffRef,
    siegeAttackTimeoutsRef,
    siegeIdRef,
    spawnTimerRef,
    stance,
    stanceRef,
    stoneNodesRef,
    tiles,
    towerGarrisonRef,
    trainingElapsedRef,
    trainingQueueRef,
    trapTriggeredRef,
    treesRef,
    triggerShakeRef,
    triggerUnderAttackRef,
    lurkerAttackTimeoutsRef,
    lurkerIdRef,
    trollAttackTimersRef,
    trollIdRef,
    upgradesRef,
    upkeepMultRef,
    warchiefIdRef,
    warlordIdRef,
    watchtowerTimersRef,
    wave,
    waveRef,
    waveTimerRemainingRef,
    witchDoctorBuffTimersRef,
    witchDoctorIdRef,
    workerHitRef,
    workers,
    workersRef,
  };
  useWaveSpawner(gameCtx);
  useWorldTicks(gameCtx);
  useTowerCombat(gameCtx);
  useProduction(gameCtx);

  const handlerCtx: RTSHandlerContext = {
    buildMode,
    setBuildMode,
    setGhostTile,
    formationModeRef,
    setDragBox,
    isDraggingRef,
    buildingIdRef,
    svgRef,
    setMoveRing,
    towerGarrison,
    setTowerGarrison,
    trees,
    goldMines,
    stoneNodes,
    resources,
    heroAbilityCooldown,
    setHeroAbilityCooldown,
    heroShoutCooldown,
    setHeroShoutCooldown,
    setBattleShoutUntil,
    harvestBoonCooldown,
    harvestBoonActive,
    setHarvestBoonCooldown,
    setHarvestBoonActive,
    harvestBoonRef,
    earthquakeCooldown,
    setEarthquakeCooldown,
    setEarthquakeEffect,
    heroItems,
    enemyBarnHp,
    setFarmhouse,
    heroRecruited,
    setHeroRecruited,
    guardTowerResearched,
    setGuardTowerResearched,
    barracksTech,
    setBarracksTech,
    blacksmithUpgrades,
    setBlacksmithUpgrades,
    trainingQueue,
    rallyPoint,
    setRallyPoint,
    upgrades,
    setUpgrades,
    setPatrolMode,
    setSelectedType,
  };
  const handlers = useRTSHandlers(gameCtx, handlerCtx);

  // Chicken wander â€” move each chicken to an adjacent clear tile every ~2s
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => {
      setChickens(cs =>
        cs.map(c => {
          const dirs = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 0 },
          ];
          const shuffled = dirs.sort(() => Math.random() - 0.5);
          for (const d of shuffled) {
            const nx = c.x + d.dx,
              ny = c.y + d.dy;
            if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE)
              continue;
            if (
              INITIAL_TILES[nx]?.[ny] === 'water' ||
              INITIAL_TILES[nx]?.[ny] === 'tree'
            )
              continue;
            // Stay within 5 tiles of barn
            if (Math.abs(nx - BARN_POS.x) > 5 || Math.abs(ny - BARN_POS.y) > 5)
              continue;
            const facing =
              d.dx === -1
                ? (-1 as const)
                : d.dx === 1
                  ? (1 as const)
                  : c.facing;
            return { ...c, x: nx, y: ny, facing };
          }
          return c;
        })
      );
    }, 2000);
    return () => clearInterval(id);
  }, [gameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBuildMode(null);
        setGhostTile(null);
        setPatrolMode(false);
        setAttackMoveMode(false);
      }
      if (
        e.key === ' ' &&
        !e.ctrlKey &&
        !e.metaKey &&
        (e.target as HTMLElement).tagName !== 'INPUT'
      ) {
        e.preventDefault();
        if (!gameOverRef.current) setGameSpeed(s => (s === 0 ? 1 : 0));
      }
      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
        setWorkers(ws => {
          if (ws.some(w => w.selected)) {
            setPatrolMode(m => !m);
          }
          return ws;
        });
      }
      if ((e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.metaKey) {
        setWorkers(ws => {
          if (
            ws.some(
              w =>
                w.selected &&
                w.unitType !== 'farmer' &&
                w.unitType !== 'catapult' &&
                w.unitType !== 'trebuchet'
            )
          ) {
            setAttackMoveMode(m => !m);
          }
          return ws;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Ctrl+A: select all living units
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setWorkers(ws =>
          ws.map(w => (w.hp > 0 ? { ...w, selected: true } : w))
        );
        setSelectedType('worker');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Command hotkeys: F=train farmer, Q=train swordsman, R=cavalry, Delete=stop, G=garrison
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA'
      )
        return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handlers.handleFarmhouseAction('train');
      }
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        handlers.handleFarmhouseAction('trainSwordsman');
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handlers.handleFarmhouseAction('trainCavalry');
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        setWorkers(ws =>
          ws.map(w =>
            w.selected
              ? {
                  ...w,
                  movingTo: null,
                  path: [],
                  gathering: null,
                  attacking: null,
                  repairing: null,
                  attackMove: false,
                  attackMoveTarget: null,
                  patrol: null,
                  holdPosition: false,
                  waypoints: [],
                  state: 'idle' as const,
                }
              : w
          )
        );
      }
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handlers.handleGarrison();
      }
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handlers.handleEarthquake();
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handlers.handleSwordsmanCharge();
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handlers.handleCavalrySprint();
      }
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setWorkers(ws =>
          ws.map(w =>
            w.selected
              ? {
                  ...w,
                  holdPosition: true,
                  movingTo: null,
                  path: [],
                  patrol: null,
                  attackMove: false,
                  attackMoveTarget: null,
                  waypoints: [],
                  state: 'idle' as const,
                }
              : w
          )
        );
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        setWorkers(ws => {
          const idleWorkers = ws.filter(
            w =>
              w.hp > 0 &&
              w.state === 'idle' &&
              !w.gathering &&
              !w.attacking &&
              !w.repairing
          );
          if (idleWorkers.length === 0) return ws;
          const idx = idleWorkerIndexRef.current % idleWorkers.length;
          idleWorkerIndexRef.current = (idx + 1) % idleWorkers.length;
          const target = idleWorkers[idx] ?? idleWorkers[0];
          if (!target) return ws;
          // Pan camera to center on this worker
          const { isoX, isoY } = tileToSvg(target.x, target.y);
          const svgEl = svgRef.current;
          if (svgEl) {
            const rect = svgEl.getBoundingClientRect();
            setCamera({
              x: rect.width / 2 - isoX - TILE_SIZE / 2,
              y: rect.height / 2 - isoY - 18,
            });
          }
          setSelectedType('worker');
          return ws.map(w => ({ ...w, selected: w.id === target.id }));
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (isNaN(num) || num < 1 || num > 9) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const ids = workers.filter(w => w.selected).map(w => w.id);
        if (!ids.length) return;
        setControlGroups(cg => ({ ...cg, [num]: ids }));
        setWorkers(ws =>
          ws.map(w =>
            w.selected
              ? { ...w, group: num }
              : w.group === num
                ? { ...w, group: null }
                : w
          )
        );
      } else {
        setControlGroups(cg => {
          const ids = cg[num];
          if (!ids?.length) return cg;
          setSelectedType('worker');
          setWorkers(ws =>
            ws.map(w => ({ ...w, selected: ids.includes(w.id) }))
          );
          // Double-tap: center camera on group centroid
          const now = Date.now();
          const last = lastGroupKeyRef.current;
          if (last && last.num === num && now - last.t < 500) {
            const units = workersRef.current.filter(
              w => ids.includes(w.id) && w.hp > 0
            );
            if (units.length > 0) {
              const cx = units.reduce((s, u) => s + u.x, 0) / units.length;
              const cy = units.reduce((s, u) => s + u.y, 0) / units.length;
              const { isoX, isoY } = tileToSvg(cx, cy);
              const svgEl = svgRef.current;
              if (svgEl) {
                const rect = svgEl.getBoundingClientRect();
                setCamera({
                  x: rect.width / 2 - isoX - TILE_SIZE / 2,
                  y: rect.height / 2 - isoY - 18,
                });
              }
            }
            lastGroupKeyRef.current = null;
          } else {
            lastGroupKeyRef.current = { num, t: now };
          }
          return cg;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [workers]);

  useGameLoop(gameCtx);

  // ---------- Bot / Demo mode ----------
  const isDemo = difficulty?.id === 'demo';
  const botSnapshotRef = useRef<BotSnapshot | null>(null);
  useEffect(() => {
    botSnapshotRef.current = {
      resources,
      workers,
      placedBuildings,
      tiles,
      wave,
      farmhouse,
      gameOver,
    };
  }, [resources, workers, placedBuildings, tiles, wave, farmhouse, gameOver]);

  const botCommands = useMemo<BotCommands>(
    () => ({
      orderGather: (workerId, resourceType, resourceIdx) => {
        const nodes =
          resourceType === 'gold'
            ? goldMinesRef.current
            : resourceType === 'tree'
              ? treesRef.current
              : stoneNodesRef.current;
        const node = nodes[resourceIdx];
        if (!node) return;
        setWorkers(ws =>
          ws.map(w => {
            if (w.id !== workerId || w.hp <= 0) return w;
            const dest = { x: node.x, y: node.y };
            const path = aStar(
              INITIAL_TILES,
              { x: Math.round(w.x), y: Math.round(w.y) },
              dest
            );
            return {
              ...w,
              movingTo: path[0] ?? dest,
              path: path.slice(1),
              gathering: { type: resourceType, idx: resourceIdx },
              attacking: null,
              state: 'moving' as const,
              selected: false,
            };
          })
        );
      },

      orderAttack: (workerId, target) => {
        setWorkers(ws =>
          ws.map(w => {
            if (w.id !== workerId || w.hp <= 0) return w;
            return {
              ...w,
              attacking: target,
              gathering: null,
              movingTo: null,
              path: [],
              state: 'attacking' as const,
              selected: false,
            };
          })
        );
      },

      orderMove: (workerId, tx, ty) => {
        setWorkers(ws =>
          ws.map(w => {
            if (w.id !== workerId || w.hp <= 0) return w;
            const dest = { x: tx, y: ty };
            const path = aStar(
              INITIAL_TILES,
              { x: Math.round(w.x), y: Math.round(w.y) },
              dest
            );
            return {
              ...w,
              movingTo: path[0] ?? dest,
              path: path.slice(1),
              attacking: null,
              gathering: null,
              state: 'moving' as const,
              selected: false,
            };
          })
        );
      },

      buildAt: (type, tx, ty) => {
        const snap = botSnapshotRef.current;
        if (!snap) return false;
        const cost = BUILDING_COSTS[type];
        if (!cost) return false;
        if (
          snap.resources.gold < cost.gold ||
          snap.resources.lumber < cost.lumber ||
          snap.resources.stone < cost.stone
        )
          return false;
        const occupied =
          (tx === BARN_POS.x && ty === BARN_POS.y) ||
          (tx === ENEMY_BARN_POS.x && ty === ENEMY_BARN_POS.y) ||
          tiles[tx]?.[ty] === 'water' ||
          tiles[tx]?.[ty] === 'tree' ||
          tiles[tx]?.[ty] === 'rock' ||
          placedBuildingsRef.current.some(b => b.x === tx && b.y === ty) ||
          treesRef.current.some(
            t => t.x === tx && t.y === ty && t.amount > 0
          ) ||
          goldMinesRef.current.some(
            m => m.x === tx && m.y === ty && m.amount > 0
          ) ||
          stoneNodesRef.current.some(
            s => s.x === tx && s.y === ty && s.amount > 0
          );
        if (occupied) return false;
        setResources(r => ({
          ...r,
          gold: r.gold - cost.gold,
          lumber: r.lumber - cost.lumber,
          stone: r.stone - cost.stone,
        }));
        setPlacedBuildings(bs => [
          ...bs,
          {
            id: buildingIdRef.current++,
            type,
            x: tx,
            y: ty,
            hp: 1,
            maxHp: BUILDING_MAX_HP[type] ?? 100,
            constructing: true,
            constructedAt: Date.now(),
          },
        ]);
        return true;
      },

      trainFarmer: () => {
        const snap = botSnapshotRef.current;
        if (!snap) return false;
        if (
          snap.resources.gold < 30 ||
          snap.resources.food >= snap.resources.foodCap
        )
          return false;
        if (!snap.farmhouse.built) return false;
        setResources(r => ({ ...r, gold: r.gold - 30, food: r.food + 1 }));
        setWorkers(ws => {
          const newId = Math.max(...ws.map(w => w.id), 0) + 1;
          return [...ws, makeWorker(newId, BARN_POS.x, BARN_POS.y)];
        });
        return true;
      },

      trainSwordsman: () => {
        const snap = botSnapshotRef.current;
        if (!snap) return false;
        if (
          snap.resources.gold < 50 ||
          snap.resources.food >= snap.resources.foodCap
        )
          return false;
        setResources(r => ({ ...r, gold: r.gold - 50, food: r.food + 1 }));
        setTrainingQueue(q => [...q, { type: 'swordsman' }]);
        return true;
      },
    }),
    // deps intentionally empty â€” botCommands is stable (useMemo with [] deps above)
    []
  );

  useBotController(gameCtx, botCommands, botSnapshotRef, isDemo);

  // Demo mode: auto-restart 5 s after game over so it loops as a showcase
  useEffect(() => {
    if (!isDemo || !gameOver) return;
    const id = window.setTimeout(() => {
      if (onNewGame) onNewGame();
    }, 5000);
    return () => window.clearTimeout(id);
  }, [isDemo, gameOver, onNewGame]);

  const selectedWorkers = workers.filter(w => w.selected);
  const anySelected = selectedWorkers.length > 0;
  const viewBoxW = GRID_SIZE * TILE_SIZE * 2 + 200;
  const viewBoxH = GRID_SIZE * TILE_SIZE + 200;

  const minimapData = useMemo(
    () => ({
      workers: workers.map(w => ({ x: w.x, y: w.y, selected: w.selected })),
      grunts: enemyGrunts.map(g => ({ x: g.x, y: g.y })),
      enemyBarnAlive: enemyBarnHp > 0,
      buildings: placedBuildings.map(b => ({ x: b.x, y: b.y, type: b.type })),
      creepCamps: CREEP_CAMPS.map(c => ({
        x: c.x,
        y: c.y,
        cleared: clearedCamps.has(c.id),
      })),
      enemyTowers: enemyTowers
        .filter(t => t.hp > 0)
        .map(t => ({ x: t.x, y: t.y })),
      goldNodes: goldMines
        .filter(m => m.amount > 0)
        .map(m => ({ x: m.x, y: m.y })),
      stoneNodes: stoneNodes
        .filter(n => n.amount > 0)
        .map(n => ({ x: n.x, y: n.y })),
      treeNodes: trees.filter(t => t.amount > 0).map(t => ({ x: t.x, y: t.y })),
      warRams: enemySiege.filter(r => r.hp > 0).map(r => ({ x: r.x, y: r.y })),
      shamans: enemyShamans
        .filter(s => s.hp > 0)
        .map(s => ({ x: s.x, y: s.y })),
      trolls: enemyTrolls.filter(t => t.hp > 0).map(t => ({ x: t.x, y: t.y })),
      sappers: enemySappers
        .filter(s => s.hp > 0 && !s.exploded)
        .map(s => ({ x: s.x, y: s.y })),
      witchDoctors: enemyWitchDoctors
        .filter(d => d.hp > 0)
        .map(d => ({ x: d.x, y: d.y })),
      warchiefs: enemyWarchiefs
        .filter(wc2 => wc2.hp > 0)
        .map(wc2 => ({ x: wc2.x, y: wc2.y })),
      fogExplored,
      attackPings: minimapPings.filter(p => Date.now() - p.t < 2500),
      enemyWalls: enemyWalls
        .filter(ew => ew.hp > 0)
        .map(ew => ({ x: ew.x, y: ew.y })),
      lootCrates: lootCrates.map(c => ({ x: c.x, y: c.y })),
      droppedItems: droppedItems.map(d => ({ x: d.x, y: d.y })),
      warlords: enemyWarlords
        .filter(wl => wl.hp > 0)
        .map(wl => ({ x: wl.x, y: wl.y })),
      lurkers: enemyLurkers
        .filter(lk => lk.hp > 0)
        .map(lk => ({ x: lk.x, y: lk.y })),
    }),
    [
      workers,
      enemyGrunts,
      enemyBarnHp,
      placedBuildings,
      clearedCamps,
      goldMines,
      stoneNodes,
      trees,
      enemyTowers,
      enemySiege,
      enemyShamans,
      enemyTrolls,
      enemySappers,
      enemyWitchDoctors,
      enemyWarchiefs,
      fogExplored,
      minimapPings,
      enemyWalls,
      lootCrates,
      droppedItems,
      enemyWarlords,
      enemyLurkers,
    ]
  );

  return (
    <div
      className="absolute inset-0 bg-black"
      style={
        screenShake > 0
          ? {
              transform: `translate(${(Math.random() - 0.5) * 6 * screenShake}px, ${(Math.random() - 0.5) * 6 * screenShake}px)`,
            }
          : undefined
      }
      onContextMenu={e => {
        if (buildMode) {
          e.preventDefault();
          setBuildMode(null);
          setGhostTile(null);
        }
      }}
    >
      <GameOverOverlay
        {...{
          gameEndTime,
          gameOver,
          isDemo,
          killCount,
          onNewGame,
          placedBuildings,
          slot,
          startTimeRef,
          totalGold,
          totalLumber,
          totalStone,
          wave,
          workers,
        }}
      />
      <AlertsOverlay
        {...{
          gameOver,
          gameSpeed,
          playerBarnHp,
          underAttack,
          waveAnnouncement,
          wavePreview,
        }}
      />
      <DamageLogPanel
        {...{
          damageLog,
          damageLogOpen,
          idleWorkerIndexRef,
          setCamera,
          setDamageLog,
          setDamageLogOpen,
          setSelectedType,
          setWorkers,
          svgRef,
          underAttack,
          workers,
        }}
      />
      <BuffIndicators
        {...{ dayPhase, phaseAnnouncement, shrinePlentyBuff, shrineWarBuff }}
      />
      <ResourceBar
        {...{
          attackMoveMode,
          buildMode,
          difficulty,
          dayPhase,
          dayProgress,
          doSave,
          enemyGrunts,
          enemySappers,
          enemyShamans,
          enemySiege,
          enemyTrolls,
          enemyWarchiefs,
          gameOver,
          gameSpeed,
          incomeRate,
          killCount,
          nextWaveAt,
          onNewGame,
          patrolMode,
          resources,
          saveStatus,
          setGameSpeed,
          setZoom,
          slot,
          soundMuted,
          startTimeRef,
          toggleMute,
          upkeepMult,
          wave,
          waveTimerRemainingRef,
          zoom,
        }}
      />
      <ControlGroupChips {...{ controlGroups, setSelectedType, setWorkers }} />
      {!gameOver && (
        <MinimapPanel
          {...{
            enemyGrunts,
            enemyLurkers,
            enemySappers,
            enemyShamans,
            enemySiege,
            enemyTrolls,
            enemyWarchiefs,
            enemyWarlords,
            fogExplored,
            fogVisible,
            placedBuildings,
            tiles,
            workers,
          }}
        />
      )}
      {/* SVG map */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: 'block',
            pointerEvents: 'auto',
            transform: `translate(${camera.x}px,${camera.y}px) scale(${zoom})`,
            userSelect: 'none',
            cursor: buildMode ? 'crosshair' : 'default',
          }}
          onMouseDown={handlers.handleSvgMouseDown}
          onMouseMove={handlers.handleSvgMouseMove}
          onMouseUp={handlers.handleSvgMouseUp}
          onMouseLeave={() => {
            isDraggingRef.current = false;
            setDragBox(null);
            setGhostTile(null);
          }}
        >
          <TerrainLayer
            {...{
              addFloatingText,
              anySelected,
              attackMoveMode,
              attackMoveModeRef,
              buildMode,
              capturedShrines,
              commandMove: handlers.commandMove,
              commandQueueMove: handlers.commandQueueMove,
              lootCrates,
              patrolMode,
              patrolModeRef,
              selectedType,
              setAttackMoveMode,
              setPatrolMode,
              setRallyPoint,
              setShrineCapturing,
              setWorkers,
              tiles,
              workers,
            }}
          />
          <OverlayRingsLayer
            {...{
              buildMode,
              enemySiege,
              enemyTowers,
              enemyTrolls,
              enemyWarchiefs,
              fogVisible,
              ghostTile,
              guardTowerResearched,
              isTileOccupied: handlers.isTileOccupied,
              placedBuildings,
            }}
          />
          <ResourceNodesLayer
            {...{
              buildMode,
              commandMove: handlers.commandMove,
              goldMines,
              stoneNodes,
              trees,
            }}
          />
          <BuildingsLayer
            {...{
              anySelected,
              handleAssistConstruction: handlers.handleAssistConstruction,
              handleFarmhouseAction: handlers.handleFarmhouseAction,
              handleRepairBuilding: handlers.handleRepairBuilding,
              handleTowerGarrison: handlers.handleTowerGarrison,
              placedBuildings,
              resources,
              selectedBuildingId,
              setSelectedBuildingId,
              setSelectedType,
              setWorkers,
              towerGarrison,
              trapTriggeredRef,
              workers,
            }}
          />

          <EnemyBaseLayer
            {...{
              anySelected,
              enemyBarnHp,
              enemyTowers,
              enemyWalls,
              fogVisible,
              handleAttackEnemyBarn: handlers.handleAttackEnemyBarn,
              handleAttackEnemyTower: handlers.handleAttackEnemyTower,
              handleAttackEnemyWall: handlers.handleAttackEnemyWall,
            }}
          />
          <PlayerBarnLayer
            {...{
              anySelected,
              buildMode,
              clientToSvg: handlers.clientToSvg,
              enemyGrunts,
              fogVisible,
              garrisoned,
              handleGarrison: handlers.handleGarrison,
              playerBarnHp,
              rallyPoint,
              selectedType,
              setRallyPoint,
              setSelectedBuildingId,
              setSelectedType,
              setWorkers,
            }}
          />
          <NeutralLayer
            {...{
              anySelected,
              capturedShrines,
              clearedCamps,
              deadGruntPositions,
              fogVisible,
              handleAttackCreep: handlers.handleAttackCreep,
              neutralCreeps,
              shrineCapturing,
            }}
          />
          <EnemyGruntsLayer
            {...{
              anySelected,
              commandMove: handlers.commandMove,
              droppedItems,
              enemyGrunts,
              enemyLurkers,
              fogVisible,
              gruntHitRef,
              handleAttackGrunt: handlers.handleAttackGrunt,
              handleAttackLurker: handlers.handleAttackLurker,
              lootCrates,
            }}
          />
          <EnemySiegeCastersLayer
            {...{
              anySelected,
              enemyNecromancers,
              enemySappers,
              enemyShamans,
              enemySiege,
              enemyWitchDoctors,
              fogVisible,
              handleAttackNecromancer: handlers.handleAttackNecromancer,
              handleAttackSapper: handlers.handleAttackSapper,
              handleAttackShaman: handlers.handleAttackShaman,
              handleAttackSiege: handlers.handleAttackSiege,
              handleAttackWitchDoctor: handlers.handleAttackWitchDoctor,
            }}
          />
          <EnemyEliteLayer
            {...{
              anySelected,
              enemyTrolls,
              enemyWarchiefs,
              enemyWarlords,
              fogVisible,
              handleAttackTroll: handlers.handleAttackTroll,
              handleAttackWarchief: handlers.handleAttackWarchief,
              handleAttackWarlord: handlers.handleAttackWarlord,
            }}
          />
          <WorkersLayer
            {...{
              battleShoutUntil,
              buildMode,
              deadWorkerPositions,
              fogVisible,
              isDraggingRef,
              setSelectedBuildingId,
              setSelectedType,
              setWorkers,
              workerHitRef,
              workers,
            }}
          />
          <EffectsLayer
            {...{
              chickens,
              dayPhase,
              dragBox,
              earthquakeEffect,
              floatingTexts,
              fogExplored,
              fogVisible,
              moveRing,
              projectiles,
              viewBoxH,
              viewBoxW,
              workers,
            }}
          />
        </svg>
      </div>

      <ControlGroupBar {...{ controlGroups, workers }} />
      <RTSUI
        selectedType={selectedType}
        selectedWorkers={selectedWorkers}
        farmhouse={farmhouse}
        farmhouseUpgradeCosts={farmhouseUpgradeCosts}
        farmhouseStorage={farmhouseStorage}
        resources={resources}
        placedBuildings={placedBuildings}
        buildingCosts={BUILDING_COSTS}
        onFarmhouseAction={handlers.handleFarmhouseAction}
        onWorkerCommand={handlers.handleWorkerCommand}
        patrolMode={patrolMode}
        onPatrolCommand={() => setPatrolMode(m => !m)}
        onHoldPosition={() =>
          setWorkers(ws =>
            ws.map(w =>
              w.selected
                ? {
                    ...w,
                    holdPosition: true,
                    movingTo: null,
                    path: [],
                    patrol: null,
                    attackMove: false,
                    attackMoveTarget: null,
                    waypoints: [],
                    state: 'idle',
                  }
                : w
            )
          )
        }
        buildMode={buildMode}
        upgrades={upgrades}
        onResearch={handlers.handleResearch}
        stance={stance}
        onToggleStance={() =>
          setStance(s => (s === 'aggressive' ? 'passive' : 'aggressive'))
        }
        hasBarracks={placedBuildings.some(
          b => b.type === 'barracks' && !b.constructing
        )}
        garrisonedCount={garrisoned.length}
        garrisonCap={GARRISON_CAP}
        onGarrison={handlers.handleGarrison}
        onUngarrison={handlers.handleUngarrison}
        heroRecruited={heroRecruited}
        heroReviveCountdown={heroReviveCountdown}
        heroReviveCost={Math.min(200, 80 + wave * 5)}
        onInstantRevive={() => {
          const cost = Math.min(200, 80 + wave * 5);
          if (resources.gold < cost) return;
          setResources(r => ({ ...r, gold: r.gold - cost }));
          setHeroReviveAt(null);
          const saved = heroXpRef.current;
          setWorkers(ws => {
            const newId = Math.max(...ws.map(w => w.id), 0) + 1;
            const hero = makeUnit(newId, BARN_POS.x, BARN_POS.y, 'hero');
            return [
              ...ws,
              saved
                ? {
                    ...hero,
                    xp: saved.xp,
                    level: saved.level,
                    maxHp: HERO_MAX_HP + saved.level * 10,
                    hp: HERO_MAX_HP + saved.level * 10,
                  }
                : hero,
            ];
          });
          addFloatingText(BARN_POS.x, BARN_POS.y, 'ðŸ¦¸ Revived!', '#fbbf24');
        }}
        heroAbilityCooldown={heroAbilityCooldown}
        onHeroAbility={handlers.handleHeroAbility}
        heroShoutCooldown={heroShoutCooldown}
        battleShoutActive={battleShoutUntil > Date.now()}
        onBattleShout={handlers.handleBattleShout}
        harvestBoonCooldown={harvestBoonCooldown}
        harvestBoonActive={harvestBoonActive}
        onHarvestBoon={handlers.handleHarvestBoon}
        onRecruitHero={() => handlers.handleFarmhouseAction('recruitHero')}
        hasSiegeWorkshop={placedBuildings.some(
          b => b.type === 'siegeWorkshop' && !b.constructing
        )}
        hasMarket={placedBuildings.some(
          b => b.type === 'market' && !b.constructing
        )}
        hasBlacksmith={placedBuildings.some(
          b => b.type === 'blacksmith' && !b.constructing
        )}
        blacksmithUpgrades={blacksmithUpgrades}
        onBlacksmithUpgrade={type =>
          handlers.handleFarmhouseAction(`blacksmith:${type}`)
        }
        hasStable={placedBuildings.some(
          b => b.type === 'stable' && !b.constructing
        )}
        hasWatchtower={placedBuildings.some(
          b => b.type === 'watchtower' && !b.constructing
        )}
        guardTowerResearched={guardTowerResearched}
        onGuardTower={() => handlers.handleFarmhouseAction('guardTower')}
        trainingQueue={trainingQueue}
        trainingProgress={trainingProgress}
        towerGarrison={towerGarrison}
        onTowerGarrison={handlers.handleTowerGarrison}
        onTowerDeploy={handlers.handleTowerDeploy}
        selectedBuilding={
          placedBuildings.find(b => b.id === selectedBuildingId) ?? null
        }
        onSwordsmanCharge={handlers.handleSwordsmanCharge}
        onCavalrySprint={handlers.handleCavalrySprint}
        onMinimapClick={(tx, ty) => {
          const { isoX, isoY } = tileToSvg(tx, ty);
          const bounds = {
            minX: -((GRID_SIZE * TILE_SIZE) / 2),
            maxX: (GRID_SIZE * TILE_SIZE) / 2,
            minY: -100,
            maxY: (GRID_SIZE * TILE_SIZE) / 2,
          };
          setCamera({
            x: Math.max(bounds.minX, Math.min(bounds.maxX, -isoX + 400)),
            y: Math.max(bounds.minY, Math.min(bounds.maxY, -isoY + 200)),
          });
        }}
        minimapData={minimapData}
        enemyBarnHp={enemyBarnHp}
        enemyBarnMaxHp={ENEMY_BARN_MAX_HP}
        playerBarnHp={playerBarnHp}
        playerBarnMaxHp={PLAYER_BARN_MAX_HP}
        underAttack={underAttack}
        incomeRate={incomeRate}
        barracksTech={barracksTech}
        onBarracksTech={type =>
          handlers.handleFarmhouseAction(`barracks:${type}`)
        }
        earthquakeCooldown={earthquakeCooldown}
        onEarthquake={handlers.handleEarthquake}
        heroItems={heroItems}
        onDropItem={handlers.handleDropItem}
        onUsePotion={handlers.handleUsePotion}
        shopItems={SHOP_ITEMS}
        onBuyItem={handlers.handleBuyItem}
        formationMode={formationMode}
        onCycleFormation={() =>
          setFormationMode(m => {
            const order: FormationMode[] = ['cluster', 'line', 'wedge', 'box'];
            return order[(order.indexOf(m) + 1) % order.length]!;
          })
        }
      />
      {/* Demo mode indicator */}
      {isDemo && (
        <div
          style={{
            position: 'fixed',
            top: '0.4rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: 'rgba(109,40,217,0.85)',
            border: '1.5px solid #a78bfa',
            borderRadius: '1rem',
            color: '#ddd6fe',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.2rem 0.75rem',
            letterSpacing: 1,
            pointerEvents: 'none',
          }}
        >
          ðŸ¤– DEMO MODE â€” AI is playing
        </div>
      )}
      {/* Achievement panel button */}
      <button
        onClick={() => setAchievementPanelOpen(o => !o)}
        style={{
          position: 'fixed',
          top: '3.5rem',
          right: '0.5rem',
          zIndex: 150,
          background: achievementPanelOpen
            ? 'rgba(109,40,217,0.9)'
            : 'rgba(30,27,75,0.85)',
          border: '1.5px solid #7c3aed',
          borderRadius: '0.5rem',
          color: '#c4b5fd',
          fontSize: '1.1rem',
          padding: '0.3rem 0.5rem',
          cursor: 'pointer',
          lineHeight: 1,
        }}
        title="Achievements"
      >
        ðŸ†
      </button>
      {/* Achievement panel */}
      {achievementPanelOpen && (
        <AchievementPanel onClose={() => setAchievementPanelOpen(false)} />
      )}
      {/* Achievement unlock toast */}
      {achievementToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '5.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
            border: '1.5px solid #a855f7',
            borderRadius: '0.75rem',
            padding: '0.6rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 4px 24px rgba(168,85,247,0.5)',
            pointerEvents: 'none',
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>{achievementToast.emoji}</span>
          <div>
            <div
              style={{
                fontSize: '0.6rem',
                color: '#c4b5fd',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
              }}
            >
              Achievement Unlocked
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                color: '#f5f3ff',
                fontWeight: 700,
              }}
            >
              {achievementToast.name}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#ddd6fe' }}>
              {achievementToast.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RTSMap;
