import { useRef } from 'react';

import type { RTSGameContext } from './context';
import { tickWorkers } from './ai/tickWorkers';
import { tickEnemyGrunts } from './ai/tickEnemyGrunts';
import { tickEnemySiege } from './ai/tickEnemySiege';
import { tickEnemyShamans } from './ai/tickEnemyShamans';
import { tickEnemyNecromancers } from './ai/tickEnemyNecromancers';
import { tickEnemyWitchDoctors } from './ai/tickEnemyWitchDoctors';
import { tickEnemyWarchiefs } from './ai/tickEnemyWarchiefs';
import { tickEnemyWarlords } from './ai/tickEnemyWarlords';
import { tickEnemyLurkers } from './ai/tickEnemyLurkers';
import { tickEnemyTrolls } from './ai/tickEnemyTrolls';
import { tickEnemySappers } from './ai/tickEnemySappers';
import { tickNeutralCreeps } from './ai/tickNeutralCreeps';

// Returns a stable tick function called each rAF frame by useGameLoop.
export function useEnemyAI(ctx: RTSGameContext): (dt: number) => void {
  const lurkerKillCountRef = useRef(0);
  const sapperWarnedRef = useRef<Set<number>>(new Set());

  return (dt: number) => {
    ctx.setWorkers(ws => tickWorkers(ws, ctx, dt));
    tickEnemyGrunts(ctx, dt);
    tickEnemySiege(ctx, dt);
    tickEnemyShamans(ctx, dt);
    tickEnemyNecromancers(ctx, dt);
    tickEnemyWitchDoctors(ctx, dt);
    tickEnemyWarchiefs(ctx, dt);
    tickEnemyWarlords(ctx, dt);
    tickEnemyLurkers(ctx, dt, lurkerKillCountRef);
    tickEnemyTrolls(ctx, dt);
    tickEnemySappers(ctx, dt, sapperWarnedRef);
    tickNeutralCreeps(ctx, dt);
  };
}
