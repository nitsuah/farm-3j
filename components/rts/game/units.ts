// Unit factory shared by initial spawn, training, and save restore.

import type { WorkerState } from './types';
import {
  CATAPULT_MAX_HP,
  CAVALRY_MAX_HP,
  HERO_MAX_HP,
  SWORDSMAN_MAX_HP,
  TREBUCHET_MAX_HP,
  WORKER_MAX_HP,
} from './constants';
import type { UnitType } from './types';

export function makeUnit(
  id: number,
  x: number,
  y: number,
  unitType: UnitType
): WorkerState {
  const maxHp =
    unitType === 'hero'
      ? HERO_MAX_HP
      : unitType === 'swordsman'
        ? SWORDSMAN_MAX_HP
        : unitType === 'catapult'
          ? CATAPULT_MAX_HP
          : unitType === 'cavalry'
            ? CAVALRY_MAX_HP
            : unitType === 'trebuchet'
              ? TREBUCHET_MAX_HP
              : WORKER_MAX_HP;
  return {
    id,
    x,
    y,
    selected: false,
    movingTo: null,
    path: [],
    gathering: null,
    attacking: null,
    repairing: null,
    chargeCooldown: 0,
    sprintCooldown: 0,
    sprinting: false,
    waypoints: [],
    attackMove: false,
    attackMoveTarget: null,
    carrying: { gold: 0, lumber: 0, stone: 0 },
    state: 'idle',
    group: null,
    hp: maxHp,
    maxHp,
    patrol: null,
    holdPosition: false,
    unitType,
    xp: 0,
    level: 0,
  };
}
