import type { RTSGameContext } from './context';

// Returns a stable tick function called each rAF frame by useGameLoop.
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

  return (_dt: number) => {
    // Food drain from dead workers
    const deadWorkerCount = workersRef.current.filter(w => w.hp <= 0).length;
    if (deadWorkerCount > 0)
      setResources(r => ({ ...r, food: Math.max(0, r.food - deadWorkerCount) }));

    // Gold from destroyed enemy walls
    const destroyedWalls = enemyWallsRef.current.filter(ew => ew.hp <= 0);
    if (destroyedWalls.length > 0) {
      setEnemyWalls(ews => ews.filter(ew => ew.hp > 0));
      destroyedWalls.forEach(ew => {
        const gold = 15;
        setResources(r => ({ ...r, gold: r.gold + gold }));
        addFloatingText(ew.x, ew.y, `🧱 +${gold}🪙`, '#fbbf24');
      });
    }

    // Gold from destroyed enemy towers
    const destroyedTowers = enemyTowersRef.current.filter(t => t.hp <= 0);
    if (destroyedTowers.length > 0) {
      setEnemyTowers(ts => ts.filter(t => t.hp > 0));
      destroyedTowers.forEach(t => {
        const gold = t.id === -1 ? 40 : 25;
        setResources(r => ({ ...r, gold: r.gold + gold }));
        addFloatingText(t.x, t.y, `🏰 +${gold}🪙`, '#fbbf24');
      });
    }
  };
}
