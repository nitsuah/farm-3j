import { useCallback, useEffect, useRef } from 'react';

import {
  computeGruntHp,
  computeGruntCount,
  buildWallSet,
} from './spawnHelpers';

import {
  BARN_POS,
  BOSS_HP_MULTIPLIER,
  ENEMY_FLANK_POSITIONS,
  DEMOLISHER_FIRST_WAVE,
  DEMOLISHER_MAX_HP,
  ENEMY_BARN_POS,
  ENEMY_TOWER_MAX_HP,
  ENEMY_TOWER_POSITIONS,
  ENEMY_TOWER_SPAWN_WAVES,
  ENEMY_WALL_MAX_HP,
  ENEMY_WALL_SPAWN,
  GRID_SIZE,
  GRUNT_SPAWN_MS,
  NECROMANCER_FIRST_WAVE,
  NECROMANCER_MAX_HP,
  SAPPER_FIRST_WAVE,
  SAPPER_MAX_HP,
  SHAMAN_FIRST_WAVE,
  SHAMAN_MAX_HP,
  TROLL_FIRST_WAVE,
  TROLL_MAX_HP,
  WARCHIEF_FIRST_WAVE,
  WARCHIEF_MAX_HP,
  LURKER_FIRST_WAVE,
  LURKER_MAX_HP,
  WARLORD_FIRST_WAVE,
  WARLORD_MAX_HP,
  WAR_RAM_FIRST_WAVE,
  WAR_RAM_MAX_HP,
  WITCH_DOCTOR_FIRST_WAVE,
  WITCH_DOCTOR_MAX_HP,
} from '../game/constants';
import { INITIAL_TILES, tileDist } from '../game/map';
import { aStar } from '../game/pathfinding';
import { Snd } from '../game/sound';
import type {
  EnemyGrunt,
  EnemyLurker,
  EnemyNecromancer,
  EnemySapper,
  EnemyShaman,
  EnemySiege,
  EnemyTroll,
  EnemyWarchief,
  EnemyWarlord,
  EnemyWitchDoctor,
  PlacedBuilding,
} from '../game/types';
import type { RTSGameContext } from './context';

export function useWaveSpawner(ctx: RTSGameContext) {
  const {
    difficulty,
    onAchievement,
    addFloatingText,
    barnDmgThisWaveRef,
    enemyWallIdRef,
    gameOver,
    gameOverRef,
    gameSpeed,
    gruntIdRef,
    necromancerIdRef,
    nextWaveAtRef,
    placedBuildingsRef,
    previewTimerRef,
    sapperIdRef,
    setEnemyGrunts,
    setEnemyLurkers,
    setEnemyNecromancers,
    setEnemySappers,
    setEnemyShamans,
    setEnemySiege,
    setEnemyTowers,
    setEnemyTrolls,
    setEnemyWalls,
    setEnemyWarchiefs,
    setEnemyWarlords,
    setEnemyWitchDoctors,
    setNextWaveAt,
    setResources,
    setWave,
    setWaveAnnouncement,
    setWavePreview,
    shamanIdRef,
    siegeIdRef,
    spawnTimerRef,
    trollIdRef,
    lurkerIdRef,
    warchiefIdRef,
    warlordIdRef,
    waveRef,
    waveTimerRemainingRef,
    witchDoctorIdRef,
  } = ctx;

  // Wave-based grunt spawner
  const doSpawnWave = useCallback(() => {
    if (gameOverRef.current) return;
    const newWave = waveRef.current + 1;
    // Wave clear bonus: if barn took no damage last wave, award bonus gold
    if (newWave > 1 && barnDmgThisWaveRef.current === 0) {
      const bonus = 20 + newWave * 3;
      setResources(r => ({ ...r, gold: r.gold + bonus }));
      addFloatingText(
        BARN_POS.x,
        BARN_POS.y,
        `✨ Flawless! +${bonus}🪙`,
        '#fbbf24'
      );
      onAchievement('flawless');
    }
    barnDmgThisWaveRef.current = 0;
    waveRef.current = newWave;
    setWave(newWave);
    Snd.waveWarning();
    const towerIdx = ENEMY_TOWER_SPAWN_WAVES.indexOf(
      newWave as (typeof ENEMY_TOWER_SPAWN_WAVES)[number]
    );
    const isBossWave = newWave % 10 === 0;
    if (towerIdx >= 0 && !isBossWave) {
      const pos = ENEMY_TOWER_POSITIONS[towerIdx];
      // Guard only the tower spawn — never abort the rest of the wave
      if (pos) {
        setEnemyTowers(ts => [
          ...ts,
          {
            id: newWave,
            x: pos.x,
            y: pos.y,
            hp: ENEMY_TOWER_MAX_HP,
            maxHp: ENEMY_TOWER_MAX_HP,
          },
        ]);
        setWaveAnnouncement(`⚔️ Wave ${newWave} — ENEMY TOWER BUILT!`);
      }
    } else if (isBossWave) {
      setWaveAnnouncement(`💀 Wave ${newWave} — WAR BULL INCOMING!`);
    } else {
      setWaveAnnouncement(
        `⚔️ Wave ${newWave}${newWave % 3 === 0 ? ' — DOUBLE ASSAULT!' : '!'}`
      );
    }
    window.setTimeout(() => setWaveAnnouncement(null), 3000);

    // Enemy fortification walls build up progressively around their base
    const wallPositions = ENEMY_WALL_SPAWN[newWave];
    if (wallPositions) {
      setEnemyWalls(ws => {
        const newWalls = wallPositions
          .filter(pos => !ws.some(w => w.x === pos.x && w.y === pos.y))
          .map(pos => ({
            id: enemyWallIdRef.current++,
            x: pos.x,
            y: pos.y,
            hp: ENEMY_WALL_MAX_HP,
            maxHp: ENEMY_WALL_MAX_HP,
          }));
        return [...ws, ...newWalls];
      });
    }

    const diffHpMult = difficulty?.gruntHpMult ?? 1;
    const gruntHp = computeGruntHp(newWave, diffHpMult);
    const wallSet = buildWallSet(placedBuildingsRef.current);

    // Boss spawn on multiples of 10
    if (isBossWave) {
      const bossHp = gruntHp * BOSS_HP_MULTIPLIER;
      const cx = Math.max(0, ENEMY_BARN_POS.x - 1);
      const cy = ENEMY_BARN_POS.y;
      const bossPath = aStar(
        INITIAL_TILES,
        { x: cx, y: cy },
        BARN_POS,
        true,
        wallSet
      );
      const boss: EnemyGrunt = {
        id: gruntIdRef.current++,
        x: cx,
        y: cy,
        hp: bossHp,
        maxHp: bossHp,
        movingTo: bossPath[0] ?? BARN_POS,
        path: bossPath.slice(1),
        state: 'moving',
        isBoss: true,
      };
      setEnemyGrunts(gs => [...gs, boss]);
    }

    // Scale count: 1-2 early, up to 4-6 by wave 20+; double on every 3rd wave
    const count = computeGruntCount(newWave);
    for (let i = 0; i < count; i++) {
      const ox = (i % 3) - 1; // spread: -1, 0, +1
      const oy = Math.floor(i / 3) % 2 === 0 ? 1 : -1;
      const cx = Math.max(0, Math.min(GRID_SIZE - 1, ENEMY_BARN_POS.x + ox));
      const cy = Math.max(0, Math.min(GRID_SIZE - 1, ENEMY_BARN_POS.y + oy));
      const path = aStar(
        INITIAL_TILES,
        { x: cx, y: cy },
        BARN_POS,
        true,
        wallSet
      );
      const grunt: EnemyGrunt = {
        id: gruntIdRef.current++,
        x: cx,
        y: cy,
        hp: gruntHp,
        maxHp: gruntHp,
        movingTo: path[0] ?? BARN_POS,
        path: path.slice(1),
        state: 'moving',
      };
      setEnemyGrunts(gs => [...gs, grunt]);
    }
    // Flanking attack: wave 8+ every 4 waves — 2 grunts from east/south corner
    if (newWave >= 8 && newWave % 4 === 0) {
      ENEMY_FLANK_POSITIONS.forEach(fp => {
        const fPath = aStar(INITIAL_TILES, fp, BARN_POS, true, wallSet);
        const flankGrunt: EnemyGrunt = {
          id: gruntIdRef.current++,
          x: fp.x,
          y: fp.y,
          hp: gruntHp,
          maxHp: gruntHp,
          movingTo: fPath[0] ?? BARN_POS,
          path: fPath.slice(1),
          state: 'moving',
        };
        setEnemyGrunts(gs => [...gs, flankGrunt]);
      });
      addFloatingText(BARN_POS.x, BARN_POS.y, '⚠ FLANKING!', '#f97316');
    }

    // War Ram spawn: wave 6+ every 3 waves
    if (newWave >= WAR_RAM_FIRST_WAVE && newWave % 3 === 0) {
      const rx = Math.max(0, ENEMY_BARN_POS.x - 2);
      const ry = ENEMY_BARN_POS.y;
      const nearestBuilding = placedBuildingsRef.current
        .filter(b => b.hp > 0)
        .reduce<PlacedBuilding | null>(
          (best, b) =>
            !best ||
            tileDist(rx, ry, b.x, b.y) < tileDist(rx, ry, best.x, best.y)
              ? b
              : best,
          null
        );
      const ramDest = nearestBuilding ?? BARN_POS;
      const ramPath = aStar(
        INITIAL_TILES,
        { x: rx, y: ry },
        { x: ramDest.x, y: ramDest.y },
        true,
        wallSet
      );
      const ram: EnemySiege = {
        id: siegeIdRef.current++,
        x: rx,
        y: ry,
        hp: WAR_RAM_MAX_HP,
        maxHp: WAR_RAM_MAX_HP,
        movingTo: ramPath[0] ?? { x: ramDest.x, y: ramDest.y },
        path: ramPath.slice(1),
        state: 'moving',
        targetBuildingId: nearestBuilding?.id ?? -1,
      };
      setEnemySiege(prev => [...prev, ram]);
      setWaveAnnouncement(`🪵 Wave ${newWave} — WAR RAM INCOMING!`);
      window.setTimeout(() => setWaveAnnouncement(null), 3000);
    }

    // Demolisher spawn: wave 14+ every 4 waves
    if (newWave >= DEMOLISHER_FIRST_WAVE && newWave % 4 === 0) {
      const dx = Math.max(0, ENEMY_BARN_POS.x - 2);
      const dy = ENEMY_BARN_POS.y + 1;
      const nearestBuilding2 = placedBuildingsRef.current
        .filter(b => b.hp > 0)
        .reduce<PlacedBuilding | null>(
          (best, b) =>
            !best ||
            tileDist(dx, dy, b.x, b.y) < tileDist(dx, dy, best.x, best.y)
              ? b
              : best,
          null
        );
      const dDest = nearestBuilding2 ?? BARN_POS;
      const dPath = aStar(
        INITIAL_TILES,
        { x: dx, y: dy },
        { x: dDest.x, y: dDest.y },
        true,
        wallSet
      );
      const demolisher: EnemySiege = {
        id: siegeIdRef.current++,
        x: dx,
        y: dy,
        hp: DEMOLISHER_MAX_HP,
        maxHp: DEMOLISHER_MAX_HP,
        movingTo: dPath[0] ?? { x: dDest.x, y: dDest.y },
        path: dPath.slice(1),
        state: 'moving',
        targetBuildingId: nearestBuilding2?.id ?? -1,
        siegeType: 'demolisher',
      };
      setEnemySiege(prev => [...prev, demolisher]);
      setWaveAnnouncement(
        `💣 Wave ${newWave} — DEMOLISHER! Protect your buildings!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 3500);
    }

    // Shaman spawn: wave 8+ every 4 waves
    if (newWave >= SHAMAN_FIRST_WAVE && newWave % 4 === 0) {
      const sx = Math.max(0, ENEMY_BARN_POS.x - 1);
      const sy = Math.max(0, ENEMY_BARN_POS.y - 1);
      const shamanPath = aStar(
        INITIAL_TILES,
        { x: sx, y: sy },
        BARN_POS,
        true,
        wallSet
      );
      const shaman: EnemyShaman = {
        id: shamanIdRef.current++,
        x: sx,
        y: sy,
        hp: SHAMAN_MAX_HP,
        maxHp: SHAMAN_MAX_HP,
        movingTo: shamanPath[0] ?? BARN_POS,
        path: shamanPath.slice(1),
        state: 'moving',
      };
      setEnemyShamans(ss => [...ss, shaman]);
      setWaveAnnouncement(
        `🧙 Wave ${newWave} — SHAMAN SPAWNS! Kill the healer!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 3000);
    }

    // Troll spawn: wave 10+ every 5 waves
    if (newWave >= TROLL_FIRST_WAVE && newWave % 5 === 0) {
      const tx2 = Math.max(0, ENEMY_BARN_POS.x - 1);
      const ty2 = Math.max(0, ENEMY_BARN_POS.y + 1);
      const troll: EnemyTroll = {
        id: trollIdRef.current++,
        x: tx2,
        y: ty2,
        hp: TROLL_MAX_HP,
        maxHp: TROLL_MAX_HP,
        movingTo: null,
        path: [],
        state: 'moving',
        targetType: 'barn',
        targetId: null,
      };
      setEnemyTrolls(ts => [...ts, troll]);
      setWaveAnnouncement(
        `🏹 Wave ${newWave} — TROLL ARCHER! Flank with cavalry!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 3000);
    }

    // Sapper spawn: wave 12+ every 6 waves
    if (newWave >= SAPPER_FIRST_WAVE && newWave % 6 === 0) {
      const sx2 = Math.max(0, ENEMY_BARN_POS.x - 2);
      const sy2 = ENEMY_BARN_POS.y;
      // Target: nearest wall, or barn if no walls
      const wallSet2 = buildWallSet(placedBuildingsRef.current);
      const nearestWall = placedBuildingsRef.current
        .filter(b => b.type === 'wall' && b.hp > 0)
        .sort(
          (a, b2) =>
            tileDist(sx2, sy2, a.x, a.y) - tileDist(sx2, sy2, b2.x, b2.y)
        )[0];
      const sapperTarget = nearestWall ?? BARN_POS;
      const sapperPath = aStar(
        INITIAL_TILES,
        { x: sx2, y: sy2 },
        { x: sapperTarget.x, y: sapperTarget.y },
        true,
        wallSet2
      );
      const sapper: EnemySapper = {
        id: sapperIdRef.current++,
        x: sx2,
        y: sy2,
        hp: SAPPER_MAX_HP,
        maxHp: SAPPER_MAX_HP,
        movingTo: sapperPath[0] ?? { x: sapperTarget.x, y: sapperTarget.y },
        path: sapperPath.slice(1),
        targetX: sapperTarget.x,
        targetY: sapperTarget.y,
        exploded: false,
      };
      setEnemySappers(ss => [...ss, sapper]);
      setWaveAnnouncement(
        `💥 Wave ${newWave} — GOBLIN SAPPER! Kill it before it reaches your walls!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 4000);
    }

    // Necromancer spawn: wave 16+ every 5 waves
    if (newWave >= NECROMANCER_FIRST_WAVE && newWave % 5 === 0) {
      const nx = Math.max(0, ENEMY_BARN_POS.x - 2);
      const ny = ENEMY_BARN_POS.y - 1;
      const nPath = aStar(
        INITIAL_TILES,
        { x: nx, y: ny },
        BARN_POS,
        true,
        wallSet
      );
      const necro: EnemyNecromancer = {
        id: necromancerIdRef.current++,
        x: nx,
        y: ny,
        hp: NECROMANCER_MAX_HP,
        maxHp: NECROMANCER_MAX_HP,
        movingTo: nPath[0] ?? BARN_POS,
        path: nPath.slice(1),
        state: 'moving',
      };
      setEnemyNecromancers(ns => [...ns, necro]);
      setWaveAnnouncement(
        `💀 Wave ${newWave} — NECROMANCER! Kill it before it raises the dead!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 4000);
    }

    // Witch Doctor spawn: wave 12+ every 3 waves
    if (newWave >= WITCH_DOCTOR_FIRST_WAVE && newWave % 3 === 2) {
      const wdx = Math.max(0, ENEMY_BARN_POS.x - 1);
      const wdy = Math.max(0, ENEMY_BARN_POS.y - 2);
      const wdPath = aStar(
        INITIAL_TILES,
        { x: wdx, y: wdy },
        BARN_POS,
        true,
        wallSet
      );
      const wd: EnemyWitchDoctor = {
        id: witchDoctorIdRef.current++,
        x: wdx,
        y: wdy,
        hp: WITCH_DOCTOR_MAX_HP,
        maxHp: WITCH_DOCTOR_MAX_HP,
        movingTo: wdPath[0] ?? BARN_POS,
        path: wdPath.slice(1),
        state: 'moving',
      };
      setEnemyWitchDoctors(prev => [...prev, wd]);
      setWaveAnnouncement(
        `🔮 Wave ${newWave} — WITCH DOCTOR! Kill it or grunts go berserk!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 4000);
    }

    // Warchief spawn: wave 18+ every 8 waves
    if (newWave >= WARCHIEF_FIRST_WAVE && newWave % 8 === 2) {
      const wx2 = Math.max(0, ENEMY_BARN_POS.x - 1);
      const wy2 = ENEMY_BARN_POS.y + 1;
      const wPath = aStar(
        INITIAL_TILES,
        { x: wx2, y: wy2 },
        BARN_POS,
        true,
        wallSet
      );
      const warchief: EnemyWarchief = {
        id: warchiefIdRef.current++,
        x: wx2,
        y: wy2,
        hp: WARCHIEF_MAX_HP,
        maxHp: WARCHIEF_MAX_HP,
        movingTo: wPath[0] ?? BARN_POS,
        path: wPath.slice(1),
        state: 'moving',
        lastStompAt: 0,
      };
      setEnemyWarchiefs(ws2 => [...ws2, warchief]);
      setWaveAnnouncement(
        `👑 Wave ${newWave} — WARCHIEF! Dangerous — he stomps and stuns your units!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 5000);
    }

    // Warlord spawn: wave 20+ every 10 waves
    if (
      newWave >= WARLORD_FIRST_WAVE &&
      (newWave - WARLORD_FIRST_WAVE) % 10 === 0
    ) {
      const wlx = Math.max(0, ENEMY_BARN_POS.x - 2);
      const wly = ENEMY_BARN_POS.y + 2;
      const wlPath = aStar(
        INITIAL_TILES,
        { x: wlx, y: wly },
        BARN_POS,
        true,
        wallSet
      );
      const warlord: EnemyWarlord = {
        id: warlordIdRef.current++,
        x: wlx,
        y: wly,
        hp: WARLORD_MAX_HP,
        maxHp: WARLORD_MAX_HP,
        movingTo: wlPath[0] ?? BARN_POS,
        path: wlPath.slice(1),
        state: 'moving',
        lastWarCryAt: 0,
        lastShieldBashAt: 0,
      };
      setEnemyWarlords(wls => [...wls, warlord]);
      setWaveAnnouncement(
        `⚔ Wave ${newWave} — WARLORD! A dread champion approaches — he War Cries and Shield Bashes!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 6000);
    }

    // Night Lurker spawn: wave 15+ every 2 waves — fast flankers from sides
    if (
      newWave >= LURKER_FIRST_WAVE &&
      (newWave - LURKER_FIRST_WAVE) % 2 === 0
    ) {
      const lurkerCount =
        2 + Math.min(3, Math.floor((newWave - LURKER_FIRST_WAVE) / 6));
      const lurkerPositions = ENEMY_FLANK_POSITIONS.slice(
        0,
        Math.min(lurkerCount, ENEMY_FLANK_POSITIONS.length)
      );
      lurkerPositions.forEach(fp => {
        const lkPath = aStar(INITIAL_TILES, fp, BARN_POS, true, wallSet);
        const lurker: EnemyLurker = {
          id: lurkerIdRef.current++,
          x: fp.x,
          y: fp.y,
          hp: LURKER_MAX_HP,
          maxHp: LURKER_MAX_HP,
          movingTo: lkPath[0] ?? BARN_POS,
          path: lkPath.slice(1),
          state: 'moving',
        };
        setEnemyLurkers(lks => [...lks, lurker]);
      });
      // Extra lurker from enemy base at higher waves
      if (newWave >= LURKER_FIRST_WAVE + 10) {
        const lx = Math.max(0, ENEMY_BARN_POS.x - 1);
        const ly = Math.max(0, ENEMY_BARN_POS.y - 1);
        const lPath = aStar(
          INITIAL_TILES,
          { x: lx, y: ly },
          BARN_POS,
          true,
          wallSet
        );
        const extraLurker: EnemyLurker = {
          id: lurkerIdRef.current++,
          x: lx,
          y: ly,
          hp: LURKER_MAX_HP,
          maxHp: LURKER_MAX_HP,
          movingTo: lPath[0] ?? BARN_POS,
          path: lPath.slice(1),
          state: 'moving',
        };
        setEnemyLurkers(lks => [...lks, extraLurker]);
      }
      Snd.lurkerShriek();
      setWaveAnnouncement(
        `🦇 Wave ${newWave} — NIGHT LURKERS! Fast flankers strike from the shadows!`
      );
      window.setTimeout(() => setWaveAnnouncement(null), 4500);
    }

    const nextDelay = Math.max(
      12000,
      Math.round(
        (GRUNT_SPAWN_MS - (newWave - 1) * 800) *
          (difficulty?.waveIntervalMult ?? 1)
      )
    );
    setNextWaveAt(Date.now() + nextDelay);
    spawnTimerRef.current = window.setTimeout(doSpawnWave, nextDelay);

    // Wave preview: show composition ~6s before next wave
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    const previewWave = newWave + 1;
    const previewDelay = Math.max(0, nextDelay - 6000);
    previewTimerRef.current = window.setTimeout(() => {
      if (gameOverRef.current) return;
      const gruntCount =
        previewWave + 2 + (previewWave % 3 === 0 ? previewWave + 2 : 0);
      const parts: string[] = [`${gruntCount} Grunts`];
      if (previewWave % 10 === 0) parts.push('1 WAR BULL 🐂');
      if (previewWave >= 8 && previewWave % 4 === 0) parts.push('1 Shaman 🧙');
      if (previewWave >= 12 && previewWave % 3 === 2)
        parts.push('1 Witch Doctor 🔮');
      if (previewWave >= 10 && previewWave % 5 === 0) parts.push('1 Troll 🏹');
      if (previewWave >= 12 && previewWave % 6 === 0) parts.push('1 Sapper 💥');
      if (previewWave >= 14 && previewWave % 4 === 0)
        parts.push('1 Demolisher 💣');
      if (previewWave >= 16 && previewWave % 5 === 0)
        parts.push('1 Necromancer 💀');
      if (previewWave >= WARCHIEF_FIRST_WAVE && previewWave % 8 === 2)
        parts.push('1 WARCHIEF 👑');
      if (
        previewWave >= WARLORD_FIRST_WAVE &&
        (previewWave - WARLORD_FIRST_WAVE) % 10 === 0
      )
        parts.push('1 ⚔ WARLORD ⚔');
      if (previewWave >= 6 && previewWave % 3 === 0) parts.push('1 War Ram 🪵');
      if (
        previewWave >= LURKER_FIRST_WAVE &&
        (previewWave - LURKER_FIRST_WAVE) % 2 === 0
      )
        parts.push('2+ 🦇 Night Lurkers');
      setWavePreview(`⚠ INCOMING Wave ${previewWave}: ${parts.join(', ')}`);
      window.setTimeout(() => setWavePreview(null), 5500);
    }, previewDelay);
  }, []);

  useEffect(() => {
    if (gameOver) {
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
      return;
    }
    // Don't start wave timer while paused — pause/resume effect handles it
    if (gameSpeed === 0) return;
    const firstDelay = Math.round(
      GRUNT_SPAWN_MS * (difficulty?.waveIntervalMult ?? 1)
    );
    setNextWaveAt(Date.now() + firstDelay);
    spawnTimerRef.current = window.setTimeout(doSpawnWave, firstDelay);
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [gameOver, doSpawnWave, gameSpeed]);

  // Pause / resume wave spawn timer when gameSpeed toggles between 0 and running
  const doSpawnWaveRef = useRef(doSpawnWave);
  useEffect(() => {
    doSpawnWaveRef.current = doSpawnWave;
  }, [doSpawnWave]);
  useEffect(() => {
    if (gameOver) return;
    if (gameSpeed === 0) {
      // Pausing: cancel timer and save remaining time
      if (spawnTimerRef.current !== null && nextWaveAtRef.current !== null) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
        waveTimerRemainingRef.current = Math.max(
          1000,
          nextWaveAtRef.current - Date.now()
        );
      }
    } else {
      // Unpausing: restart timer if we saved remaining time
      if (
        waveTimerRemainingRef.current !== null &&
        spawnTimerRef.current === null
      ) {
        const remaining = waveTimerRemainingRef.current;
        waveTimerRemainingRef.current = null;
        setNextWaveAt(Date.now() + remaining);
        spawnTimerRef.current = window.setTimeout(
          () => doSpawnWaveRef.current(),
          remaining
        );
      }
    }
  }, [gameSpeed, gameOver]);
}
