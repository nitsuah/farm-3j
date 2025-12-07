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
  resources: {
    milk: 15,
    eggs: 42,
    meat: 8,
    wool: 12,
  },
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
        entities: state.entities.map(entity =>
          entity.id === id
            ? {
                ...entity,
                x,
                y,
                direction: direction ?? entity.direction,
                lastUpdate: Date.now(),
              }
            : entity
        ),
      };
    }

    case 'BATCH_UPDATE_POSITIONS': {
      type UpdateType = {
        id: string;
        x: number;
        y: number;
        direction?: number;
      };
      const updates = new Map<string, UpdateType>(
        action.payload.map((p: UpdateType) => [p.id, p])
      );
      return {
        ...state,
        entities: state.entities.map(entity => {
          const update = updates.get(entity.id);
          if (!update) return entity;
          return {
            ...entity,
            x: update.x,
            y: update.y,
            direction: update.direction ?? entity.direction,
            lastUpdate: Date.now(),
          };
        }),
      };
    }

    case 'REMOVE_ENTITY':
      return {
        ...state,
        entities: state.entities.filter(entity => entity.id !== action.payload),
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

    case 'PRODUCE_RESOURCES': {
      const now = Date.now();
      const updatedEntities = state.entities.map(entity => {
        if (!['cow', 'chicken', 'pig', 'sheep'].includes(entity.type)) {
          return entity;
        }

        const lastProduced = entity.lastProduced || now;
        const timeSinceProduction = (now - lastProduced) / 1000; // seconds

        // Produce every 3 seconds
        if (timeSinceProduction >= 3) {
          return {
            ...entity,
            lastProduced: now,
            inventory: (entity.inventory || 0) + 1,
          };
        }

        return entity;
      });

      // Collect resources from all animals
      let newMilk = state.resources.milk;
      let newEggs = state.resources.eggs;
      let newMeat = state.resources.meat;
      let newWool = state.resources.wool;

      updatedEntities.forEach(entity => {
        if (entity.inventory && entity.inventory > 0) {
          switch (entity.type) {
            case 'cow':
              newMilk += entity.inventory;
              break;
            case 'chicken':
              newEggs += entity.inventory;
              break;
            case 'pig':
              newMeat += entity.inventory;
              break;
            case 'sheep':
              newWool += entity.inventory;
              break;
          }
        }
      });

      // Clear inventories
      const clearedEntities = updatedEntities.map(entity => {
        if (entity.inventory && entity.inventory > 0) {
          return { ...entity, inventory: 0 };
        }
        return entity;
      });

      return {
        ...state,
        entities: clearedEntities,
        resources: {
          milk: newMilk,
          eggs: newEggs,
          meat: newMeat,
          wool: newWool,
        },
      };
    }

    case 'SELL_RESOURCE': {
      const { resource, amount } = action.payload;
      const prices = { milk: 10, eggs: 5, meat: 20, wool: 15 };
      const currentAmount = state.resources[resource];

      if (currentAmount < amount) {
        return state;
      }

      const revenue = amount * prices[resource];

      // Note: Notification is handled in the component to avoid import cycle
      return {
        ...state,
        money: state.money + revenue,
        resources: {
          ...state.resources,
          [resource]: currentAmount - amount,
        },
      };
    }

    default:
      return state;
  }
}
