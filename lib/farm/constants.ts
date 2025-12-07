// Game constants and configuration

export const GAME_CONFIG = {
  // Grid system
  GRID_SIZE: 20,
  CELL_SIZE: 5, // percentage

  // Time system
  TIME_SPEED: 0.1, // Game hours per real second
  HOURS_PER_DAY: 24,
  TIME_UPDATE_THRESHOLD: 0.1, // Minimum time difference to trigger update

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

  // Animal needs
  HUNGER_INCREASE_PER_HOUR: 5, // Hunger increases by 5 per game hour
  HAPPINESS_DECREASE_PER_HOUR: 2, // Happiness decreases by 2 per game hour
  HUNGER_UNHAPPY_THRESHOLD: 60, // Animals become unhappy when hunger > 60
  HUNGER_STARVING_THRESHOLD: 80, // Animals start losing health when hunger > 80
  HAPPINESS_PRODUCTION_THRESHOLD: 50, // Animals only produce when happiness > 50

  // Trough and feeding
  TROUGH_CAPACITY: 100, // Maximum food units in a trough
  TROUGH_REFILL_COST: 20, // Cost to refill a trough
  FEEDING_DISTANCE: 10, // Percentage distance to be considered "at" a trough
  FEEDING_RATE: 30, // Hunger reduced per feeding session
  HUNGER_SEEK_THRESHOLD: 50, // Animals seek food when hunger > 50

  // Visual effects
  NIGHT_STAR_COUNT: 50,

  // Costs
  FENCE_REPAIR_COST: 50,
  ANIMAL_HEAL_COST: 100,
} as const;

export type AnimalType = keyof typeof GAME_CONFIG.ANIMALS;
