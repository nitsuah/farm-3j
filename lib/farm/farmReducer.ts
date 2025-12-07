import { FarmState, FarmAction } from './types';

export const initialFarmState: FarmState = {
  entities: [
    // Static barn in the center
    {
      id: 'barn-1',
      type: 'barn',
      x: 50,
      y: 40,
      width: 200,
      height: 180,
    },
    // Fences around the perimeter
    {
      id: 'fence-1',
      type: 'fence',
      x: 10,
      y: 10,
      width: 80,
      height: 10,
    },
  ],
  money: 5876,
  day: 27,
  time: 14.5,
  fenceHealth: 65,
  animalHealth: 90,
  isPaused: false,
};

export function farmReducer(state: FarmState, action: FarmAction): FarmState {
  switch (action.type) {
    case 'SPAWN_ANIMAL':
    case 'SPAWN_STATIC':
      return {
        ...state,
        entities: [...state.entities, action.payload],
      };

    case 'UPDATE_POSITION': {
      const { id, x, y, direction } = action.payload;
      return {
        ...state,
        entities: state.entities.map((entity) =>
          entity.id === id
            ? { ...entity, x, y, direction: direction ?? entity.direction, lastUpdate: Date.now() }
            : entity
        ),
      };
    }

    case 'BATCH_UPDATE_POSITIONS': {
      const updates = new Map(action.payload.map((p) => [p.id, p]));
      return {
        ...state,
        entities: state.entities.map((entity) => {
          const update = updates.get(entity.id);
          return update
            ? {
                ...entity,
                x: update.x,
                y: update.y,
                direction: update.direction ?? entity.direction,
                lastUpdate: Date.now(),
              }
            : entity;
        }),
      };
    }

    case 'REMOVE_ENTITY':
      return {
        ...state,
        entities: state.entities.filter((entity) => entity.id !== action.payload),
      };

    case 'UPDATE_STATS':
      return {
        ...state,
        ...action.payload,
      };

    case 'TOGGLE_PAUSE':
      return {
        ...state,
        isPaused: !state.isPaused,
      };

    default:
      return state;
  }
}
