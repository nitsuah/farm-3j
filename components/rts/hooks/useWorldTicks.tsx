import { useEffect } from 'react';

import {
  BUILDING_COSTS,
  CONSTRUCTION_MS,
  LOOT_CRATE_POSITIONS,
  LOOT_CRATE_SPAWN_MS,
  SHRINES,
} from '../game/constants';
import { Snd } from '../game/sound';
import type { RTSGameContext } from './context';

export function useWorldTicks(ctx: RTSGameContext) {
  const {
    addFloatingText,
    capturedShrinesRef,
    gameOver,
    gameOverRef,
    lootCrateIdRef,
    lootCratesRef,
    placedBuildingsRef,
    setCapturedShrines,
    setLootCrates,
    setPlacedBuildings,
    setResources,
    setShrineCapturing,
    setShrinePlentyBuff,
    setShrineWarBuff,
    setWorkers,
    shrineCapturingRef,
    waveRef,
    workersRef,
  } = ctx;

  // Loot crate spawner — 1-3 crates appear every 35s; more on later waves
  useEffect(() => {
    if (gameOver) return;
    const spawnCrate = () => {
      if (gameOverRef.current) return;
      const RESOURCES = [
        { gold: 40, lumber: 0, stone: 0 },
        { gold: 0, lumber: 30, stone: 0 },
        { gold: 0, lumber: 0, stone: 25 },
        { gold: 20, lumber: 15, stone: 0 },
        { gold: 25, lumber: 0, stone: 20 },
        { gold: 15, lumber: 15, stone: 10 },
      ];
      const spawnCount =
        waveRef.current >= 10 ? 3 : waveRef.current >= 5 ? 2 : 1;
      const occupied = new Set(lootCratesRef.current.map(c => `${c.x},${c.y}`));
      const candidates = LOOT_CRATE_POSITIONS.filter(
        p => !occupied.has(`${p.x},${p.y}`)
      );
      for (let s = 0; s < spawnCount && candidates.length > 0; s++) {
        const idx = Math.floor(Math.random() * candidates.length);
        const pos = candidates.splice(idx, 1)[0];
        if (!pos) break;
        const res = RESOURCES[Math.floor(Math.random() * RESOURCES.length)] ?? {
          gold: 30,
          lumber: 0,
          stone: 0,
        };
        setLootCrates(cs => [
          ...cs,
          {
            id: lootCrateIdRef.current++,
            x: pos.x,
            y: pos.y,
            gold: res.gold,
            lumber: res.lumber,
            stone: res.stone,
          },
        ]);
      }
      window.setTimeout(spawnCrate, LOOT_CRATE_SPAWN_MS);
    };
    const t = window.setTimeout(spawnCrate, LOOT_CRATE_SPAWN_MS);
    return () => clearTimeout(t);
  }, [gameOver]);

  // Shrine capture polling — check every 200ms if channeling worker is still on shrine tile
  useEffect(() => {
    if (gameOver) return;
    const interval = window.setInterval(() => {
      if (gameOverRef.current) return;
      const cap = shrineCapturingRef.current;
      if (!cap) return;
      const shrine = SHRINES.find(s => s.id === cap.shrineId);
      if (!shrine || capturedShrinesRef.current.has(shrine.id)) {
        setShrineCapturing(null);
        return;
      }
      const worker = workersRef.current.find(
        w => w.id === cap.workerId && w.hp > 0
      );
      if (
        !worker ||
        Math.round(worker.x) !== shrine.x ||
        Math.round(worker.y) !== shrine.y ||
        worker.movingTo !== null
      ) {
        setShrineCapturing(null);
        return;
      }
      if (Date.now() - cap.startedAt >= shrine.captureMs) {
        setCapturedShrines(s => {
          const ns = new Set(s);
          ns.add(shrine.id);
          return ns;
        });
        setShrineCapturing(null);
        if (shrine.type === 'war') {
          setShrineWarBuff(true);
          addFloatingText(shrine.x, shrine.y, '⚔️ WAR SHRINE!', '#f97316');
        } else {
          setShrinePlentyBuff(true);
          addFloatingText(shrine.x, shrine.y, '🌾 PLENTY SHRINE!', '#4ade80');
        }
      }
    }, 200);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Building construction completion — poll every 500ms and complete any that have finished
  useEffect(() => {
    if (gameOver) return;
    const id = window.setInterval(() => {
      if (gameOverRef.current) return;
      const now = Date.now();
      // Compute which buildings just finished BEFORE entering any updater
      const justFinished = placedBuildingsRef.current.filter(b => {
        if (!b.constructing) return false;
        const assistCount = workersRef.current.filter(
          w => w.assistBuildId === b.id && w.hp > 0
        ).length;
        const speedMult = 1 + assistCount * 0.4;
        return (now - (b.constructedAt ?? now)) * speedMult >= CONSTRUCTION_MS;
      });
      if (justFinished.length === 0) return;
      // Side effects (sound/text/other state) — safe to call outside updater
      justFinished.forEach(b => {
        addFloatingText(b.x, b.y, '✅ Built!', '#4ade80');
        Snd.buildComplete();
        const bonus = BUILDING_COSTS[b.type]?.foodCapBonus ?? 0;
        if (bonus > 0)
          setResources(r => ({ ...r, foodCap: r.foodCap + bonus }));
      });
      // Release assisting workers
      const finishedIds = new Set(justFinished.map(b => b.id));
      setWorkers(ws =>
        ws.map(w =>
          finishedIds.has(w.assistBuildId!)
            ? { ...w, assistBuildId: undefined, state: 'idle' as const }
            : w
        )
      );
      // Mark buildings as complete
      setPlacedBuildings(bs =>
        bs.map(b => {
          if (!finishedIds.has(b.id)) return b;
          return {
            ...b,
            constructing: false,
            constructedAt: undefined,
            hp: b.maxHp,
          };
        })
      );
    }, 500);
    return () => clearInterval(id);
  }, [gameOver, addFloatingText]);
}
