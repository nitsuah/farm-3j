import type { RTSGameContext } from './context';

// Returns a stable tick function called each rAF frame by useGameLoop.
// Idempotency: refs track processed IDs so each dead unit/structure is only
// handled once across the multiple frames before React state commits.
export function useResourceTick(ctx: RTSGameContext): (dt: number) => void {
  const {
    addFloatingText,
    enemyTowersRef,
    enemyWallsRef,
    setEnemyTowers,
    setEnemyWalls,
    setResources,
    workersRef,
  } = ctx;

  const processedDeadWorkerIds = new Set<number>();
  const processedWallIds = new Set<number>();
  const processedTowerIds = new Set<number>();

  return (_dt: number) => {
    // Food drain from dead workers — only once per worker death
    const newlyDeadWorkers = workersRef.current.filter(
      w => w.hp <= 0 && !processedDeadWorkerIds.has(w.id)
    );
    if (newlyDeadWorkers.length > 0) {
      newlyDeadWorkers.forEach(w => processedDeadWorkerIds.add(w.id));
      const count = newlyDeadWorkers.length;
      setResources(r => ({ ...r, food: Math.max(0, r.food - count) }));
    }

    // Gold from destroyed enemy walls — only once per wall
    const destroyedWalls = enemyWallsRef.current.filter(
      ew => ew.hp <= 0 && !processedWallIds.has(ew.id)
    );
    if (destroyedWalls.length > 0) {
      destroyedWalls.forEach(ew => processedWallIds.add(ew.id));
      setEnemyWalls(ews => ews.filter(ew => ew.hp > 0));
      destroyedWalls.forEach(ew => {
        const gold = 15;
        setResources(r => ({ ...r, gold: r.gold + gold }));
        addFloatingText(ew.x, ew.y, `🧱 +${gold}🪙`, '#fbbf24');
      });
    }

    // Gold from destroyed enemy towers — only once per tower
    const destroyedTowers = enemyTowersRef.current.filter(
      t => t.hp <= 0 && !processedTowerIds.has(t.id)
    );
    if (destroyedTowers.length > 0) {
      destroyedTowers.forEach(t => processedTowerIds.add(t.id));
      setEnemyTowers(ts => ts.filter(t => t.hp > 0));
      destroyedTowers.forEach(t => {
        const gold = t.id === -1 ? 40 : 25;
        setResources(r => ({ ...r, gold: r.gold + gold }));
        addFloatingText(t.x, t.y, `🏰 +${gold}🪙`, '#fbbf24');
      });
    }
  };
}
