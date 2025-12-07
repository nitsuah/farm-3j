// Game constants and configuration

export const GAME_CONFIG = {
  // Grid system
  GRID_SIZE: 20,
  CELL_SIZE: 5, // percentage

  // Time system
  TIME_SPEED: 0.1, // Game hours per real second
  HOURS_PER_DAY: 24,

  // Animal properties
  ANIMALS: {
    cow: {
      velocity: 0.5,
      size: 48,
      price: 500,
      produces: 'milk',
      productionRate: 0.2, // per hour
    },
    chicken: {
      velocity: 1.2,
      size: 32,
      price: 100,
      produces: 'eggs',
      productionRate: 0.5,
    },
    pig: {
      velocity: 0.7,
      size: 40,
      price: 300,
      produces: 'meat',
      productionRate: 0.1,
    },
    sheep: {
      velocity: 0.8,
      size: 40,
      price: 400,
      produces: 'wool',
      productionRate: 0.15,
    },
  },

  // Decay rates
  FENCE_DECAY_PER_DAY: 2,
  HEALTH_DECAY_PER_DAY: 1,

  // Costs
  FENCE_REPAIR_COST: 50,
  ANIMAL_HEAL_COST: 100,
} as const;

export type AnimalType = keyof typeof GAME_CONFIG.ANIMALS;
