// Gameplay tuning constants for the RTS mode.
// Split out of RTSMap.tsx — grouped by system (map, units, enemies, towers, buildings).

import type { BuildingType, HeroItemId, Upgrades } from './types';

// ---------- Map & core ----------
export const GRID_SIZE = 25;
export const TILE_SIZE = 64;
export const WORKER_SPEED = 1.5;
export const GRUNT_SPEED = 0.8;
export const GATHER_INTERVAL_MS = 900;
export const CARRY_CAP = 10;
export const FOOD_CAP_BASE = 10; // starts at 10 so 5 workers don't immediately hit cap penalty
export const FOOD_CAP_PER_LEVEL = 5;
export const WORKER_VISION = 3.5;
export const BARN_VISION = 5;
export const WATCHTOWER_VISION = 7;
export const WATCHTOWER_ATTACK_RANGE = 5;
export const WATCHTOWER_DAMAGE = 8;
export const WATCHTOWER_ATTACK_MS = 2000;
export const WATCHTOWER_GUARD_DAMAGE_BONUS = 7;
export const WATCHTOWER_GARRISON_DAMAGE_PER = 4;
export const WATCHTOWER_GUARD_RANGE_BONUS = 1;
export const WATCHTOWER_GARRISON_RANGE_PER = 0.5;
export const ENEMY_BARN_POS = { x: 22, y: 22 };
export const ENEMY_BARN_MAX_HP = 200;
export const PLAYER_BARN_MAX_HP = 300;
export const ATTACK_DAMAGE = 15;
export const ATTACK_INTERVAL_MS = 1200;
export const ENEMY_COUNTER_DAMAGE = 8;
export const WORKER_MAX_HP = 50;
export const GRUNT_MAX_HP = 60;
export const GRUNT_HP_PER_WAVE = 10;
export const GRUNT_COUNT_CAP = 6;
export const GRUNT_COUNT_BASE = 1;
export const GRUNT_DOUBLE_ASSAULT_BONUS = 2;
export const GRUNT_DAMAGE = 12;
export const GRUNT_ATTACK_MS = 1500;
export const BOSS_HP_MULTIPLIER = 3;
export const BOSS_DAMAGE = 25;
export const BOSS_GOLD_REWARD = 20;
export const BOSS_XP_REWARD = 80;
export const GRUNT_SPAWN_MS = 40000;
export const REPAIR_INTERVAL_MS = 2000;
export const REPAIR_AMOUNT = 2;
export const REPAIR_RADIUS = 3;
export const GARRISON_CAP = 5;
export const GARRISON_HEAL_MS = 1000;
export const GARRISON_HEAL_AMOUNT = 8;
export const GARRISON_BARN_HEAL_PER_UNIT = 4; // barn HP restored per garrisoned unit per tick
export const GARRISON_ARMOR_PER_UNIT = 2;

// ---------- Hero ----------
export const HERO_MAX_HP = 150;
export const HERO_DAMAGE_BONUS = 20;
export const HERO_ABILITY_RADIUS = 3.5;
export const HERO_ABILITY_DAMAGE = 30;
export const HERO_ABILITY_COOLDOWN_S = 25;
export const HERO_SHOUT_RADIUS = 4.0;
export const HERO_SHOUT_DURATION_MS = 8000;
export const HERO_SHOUT_COOLDOWN_S = 30;
export const HERO_SHOUT_ATK_MULT = 0.6; // 40% faster attack (0.6× interval)

// ---------- Player siege ----------
export const CATAPULT_MAX_HP = 60;
export const CATAPULT_SPEED = 0.45;
export const CATAPULT_RANGE = 6;
export const CATAPULT_DAMAGE = 22;
export const CATAPULT_SPLASH_RANGE = 1.5;
export const CATAPULT_SPLASH_DAMAGE = 11;
export const CATAPULT_FIRE_MS = 3500;

// ---------- XP & abilities ----------
export const XP_PER_KILL = 40;
export const XP_TO_LEVEL_1 = 40;
export const XP_TO_LEVEL_2 = 120;
export const XP_TO_LEVEL_3 = 280;
export const EARTHQUAKE_RADIUS = 5.0;
export const EARTHQUAKE_DAMAGE = 45;
export const EARTHQUAKE_COOLDOWN_S = 45;
export const EARTHQUAKE_STUN_MS = 2500;
export const VETERAN_HP_BONUS = 10;
export const VETERAN_ATK_BONUS = 5;

// ---------- Enemy fortifications ----------
export const ARCHER_TOWER_POS = { x: 12, y: 13 };
export const ARCHER_TOWER_RANGE = 4;
export const ARCHER_TOWER_DAMAGE = 10;
export const ENEMY_TOWER_SPAWN_WAVES = [5, 10, 15] as const;
export const ENEMY_TOWER_POSITIONS = [
  { x: 18, y: 16 },
  { x: 16, y: 18 },
  { x: 20, y: 18 },
];
export const ENEMY_WALL_MAX_HP = 80;
// Wall rings spawn incrementally: wave 3 = south, wave 6 = west, wave 9 = north, wave 12 = east
export const ENEMY_WALL_SPAWN: Record<number, { x: number; y: number }[]> = {
  3: [
    { x: 21, y: 24 },
    { x: 22, y: 24 },
    { x: 23, y: 24 },
  ],
  6: [
    { x: 19, y: 22 },
    { x: 19, y: 23 },
  ],
  9: [
    { x: 21, y: 20 },
    { x: 22, y: 20 },
    { x: 23, y: 20 },
  ],
  12: [
    { x: 24, y: 21 },
    { x: 24, y: 22 },
    { x: 24, y: 23 },
  ],
};
export const ENEMY_TOWER_MAX_HP = 60;
export const ENEMY_TOWER_DAMAGE = 9;
export const ENEMY_TOWER_RANGE = 4.5;
export const ENEMY_TOWER_ATTACK_MS = 2500;
export const ARCHER_TOWER_ATTACK_MS = 2500;

// ---------- Enemy siege ----------
export const WAR_RAM_MAX_HP = 200;
export const WAR_RAM_SPEED = 0.3;
export const WAR_RAM_DAMAGE = 40;
export const WAR_RAM_ATTACK_MS = 3000;
export const WAR_RAM_GOLD_REWARD = 25;
export const WAR_RAM_XP_REWARD = 50;
export const WAR_RAM_FIRST_WAVE = 6;
export const DEMOLISHER_MAX_HP = 120;
export const DEMOLISHER_SPEED = 0.22;
export const DEMOLISHER_DAMAGE = 35;
export const DEMOLISHER_SPLASH_RANGE = 1.5;
export const DEMOLISHER_FIRE_RANGE = 4.0;
export const DEMOLISHER_ATTACK_MS = 4500;
export const DEMOLISHER_GOLD_REWARD = 30;
export const DEMOLISHER_XP_REWARD = 60;
export const DEMOLISHER_FIRST_WAVE = 14;

// ---------- Enemy casters & specials ----------
export const NECROMANCER_MAX_HP = 35;
export const NECROMANCER_SPEED = 0.5;
export const NECROMANCER_RAISE_RADIUS = 3.0;
export const NECROMANCER_RAISE_MS = 4000;
export const NECROMANCER_FIRST_WAVE = 16;
export const NECROMANCER_GOLD_REWARD = 20;
export const NECROMANCER_XP_REWARD = 45;
export const WITCH_DOCTOR_MAX_HP = 40;
export const WITCH_DOCTOR_SPEED = 0.45;
export const WITCH_DOCTOR_BUFF_RADIUS = 3.0;
export const WITCH_DOCTOR_BUFF_MS = 7000;
export const WITCH_DOCTOR_BUFF_DURATION = 6000;
export const WITCH_DOCTOR_FIRST_WAVE = 12;
export const WITCH_DOCTOR_GOLD_REWARD = 18;
export const WITCH_DOCTOR_XP_REWARD = 40;
export const WITCH_DOCTOR_ENRAGE_DMG_BONUS = 8;
export const WARCHIEF_MAX_HP = 300;
export const WARCHIEF_SPEED = 0.55;
export const WARCHIEF_DMG = 30;
export const WARCHIEF_FIRST_WAVE = 18;
export const WARCHIEF_STOMP_RADIUS = 3.0;
export const WARCHIEF_STOMP_SLOW_MS = 2500;
export const WARCHIEF_STOMP_COOLDOWN_MS = 12000;
export const WARCHIEF_GOLD_REWARD = 50;
export const WARCHIEF_XP_REWARD = 120;
export const WARLORD_MAX_HP = 500;
export const WARLORD_SPEED = 0.4;
export const WARLORD_DMG = 40;
export const WARLORD_FIRST_WAVE = 20;
export const WARLORD_WAR_CRY_RADIUS = 4.5;
export const WARLORD_WAR_CRY_SLOW_MS = 3000;
export const WARLORD_WAR_CRY_COOLDOWN_MS = 15000;
export const WARLORD_SHIELD_BASH_RANGE = 1.5;
export const WARLORD_SHIELD_BASH_STUN_MS = 2500;
export const WARLORD_SHIELD_BASH_COOLDOWN_MS = 12000;
export const WARLORD_GOLD_REWARD = 100;
export const WARLORD_XP_REWARD = 250;

// ---------- Night Lurker ----------
export const LURKER_MAX_HP = 70;
export const LURKER_SPEED = 1.4;
export const LURKER_DAMAGE = 12;
export const LURKER_ATTACK_MS = 900;
export const LURKER_FIRST_WAVE = 15;
export const LURKER_GOLD_REWARD = 35;
export const LURKER_XP_REWARD = 40;

export const LOOT_CRATE_SPAWN_MS = 45000;
export const SHAMAN_MAX_HP = 45;
export const SHAMAN_SPEED = 0.6;
export const SHAMAN_HEAL_AMOUNT = 5;
export const SHAMAN_HEAL_RADIUS = 2.5;
export const SHAMAN_HEAL_MS = 2000;
export const SHAMAN_FIRST_WAVE = 8;
export const SHAMAN_GOLD_REWARD = 15;
export const SHAMAN_XP_REWARD = 35;
export const TROLL_MAX_HP = 30;
export const TROLL_SPEED = 0.9;
export const TROLL_ATTACK_RANGE = 4.0;
export const TROLL_KITE_RANGE = 3.0;
export const TROLL_DAMAGE = 8;
export const TROLL_ATTACK_MS = 2500;
export const TROLL_FIRST_WAVE = 10;
export const TROLL_GOLD_REWARD = 12;
export const TROLL_XP_REWARD = 30;

export const SAPPER_MAX_HP = 25;
export const SAPPER_SPEED = 1.3;
export const SAPPER_EXPLODE_RADIUS = 1.5;
export const SAPPER_EXPLODE_DAMAGE = 80;
export const SAPPER_FIRST_WAVE = 12;
export const SAPPER_GOLD_REWARD = 20;
export const SAPPER_XP_REWARD = 45;
export const LUMBER_SHED_BONUS_MS = 200;
export const TREBUCHET_MAX_HP = 45;
export const TREBUCHET_SPEED = 0.28;
export const TREBUCHET_RANGE = 9;
export const TREBUCHET_MIN_RANGE = 2.5;
export const TREBUCHET_DAMAGE = 40;
export const TREBUCHET_FIRE_MS = 6000;

// ---------- Player defensive towers ----------
export const FROST_TOWER_RANGE = 4.5;
export const FROST_TOWER_DAMAGE = 5;
export const FROST_TOWER_ATTACK_MS = 2500;
export const FROST_TOWER_SLOW_DURATION = 3000;
export const FROST_TOWER_SLOW_FACTOR = 0.5;
export const FROST_TOWER_HP = 160;
export const FROST_TOWER_GOLD_COST = 80;
export const FROST_TOWER_LUMBER_COST = 40;
export const FROST_TOWER_STONE_COST = 60;

export const BALLISTA_RANGE = 6.5;
export const BALLISTA_DAMAGE = 18;
export const BALLISTA_PIERCE_RANGE = 1.5;
export const BALLISTA_PIERCE_DAMAGE = 9;
export const BALLISTA_ATTACK_MS = 4000;
export const BALLISTA_HP = 150;
export const POISON_TOWER_RANGE = 5.0;
export const POISON_TOWER_DAMAGE = 8;
export const POISON_TOWER_DPS = 3;
export const POISON_TOWER_DURATION_MS = 4000;
export const POISON_TOWER_ATTACK_MS = 3000;
export const POISON_TOWER_HP = 130;

export const LOOT_CRATE_POSITIONS = [
  // Near player base
  { x: 3, y: 10 },
  { x: 10, y: 3 },
  { x: 1, y: 6 },
  { x: 6, y: 1 },
  // Mid map
  { x: 7, y: 9 },
  { x: 9, y: 7 },
  { x: 13, y: 5 },
  { x: 5, y: 13 },
  // Contested center
  { x: 12, y: 12 },
  { x: 10, y: 16 },
  { x: 16, y: 10 },
  // Deep map
  { x: 18, y: 7 },
  { x: 7, y: 18 },
  { x: 20, y: 13 },
  { x: 13, y: 20 },
  { x: 22, y: 5 },
  { x: 5, y: 22 },
  { x: 17, y: 17 },
];

// ---------- Hero items ----------
export const HERO_ITEM_DATA: Record<
  HeroItemId,
  {
    name: string;
    emoji: string;
    desc: string;
    speedBonus?: number;
    dmgBonus?: number;
    armorBonus?: number;
    consumable?: boolean;
  }
> = {
  boots_speed: {
    name: 'Boots of Swiftness',
    emoji: '👟',
    desc: '+0.4 move speed',
    speedBonus: 0.4,
  },
  battle_sword: {
    name: 'Battle Blade',
    emoji: '🗡️',
    desc: '+20 hero damage',
    dmgBonus: 20,
  },
  shield_pendant: {
    name: 'Shield Pendant',
    emoji: '🛡️',
    desc: '-6 damage taken',
    armorBonus: 6,
  },
  healing_potion: {
    name: 'Healing Potion',
    emoji: '🧪',
    desc: 'Restore 75 HP',
    consumable: true,
  },
  tome_xp: {
    name: 'Tome of Knowledge',
    emoji: '📖',
    desc: '+80 XP (instant)',
    consumable: true,
  },
};
export const HERO_MAX_ITEMS = 3;

// ---------- Neutral creeps & shrines ----------
export const CREEP_MAX_HP = 45;
export const CREEP_DAMAGE = 9;
export const CREEP_SPEED = 1.2;
export const CREEP_AGGRO_RANGE = 3.5;
export const CREEP_ATTACK_MS = 1400;
export const CREEP_LEASH_RANGE = 5;
export const CAMP_GOLD_REWARD = 60;

export const CREEP_CAMPS: {
  id: number;
  x: number;
  y: number;
  goldReward: number;
}[] = [
  { id: 1, x: 2, y: 14, goldReward: CAMP_GOLD_REWARD },
  { id: 2, x: 14, y: 2, goldReward: CAMP_GOLD_REWARD },
  { id: 3, x: 6, y: 6, goldReward: CAMP_GOLD_REWARD },
  { id: 4, x: 17, y: 8, goldReward: CAMP_GOLD_REWARD },
  { id: 5, x: 8, y: 17, goldReward: CAMP_GOLD_REWARD },
  { id: 6, x: 20, y: 14, goldReward: CAMP_GOLD_REWARD },
  { id: 7, x: 14, y: 20, goldReward: CAMP_GOLD_REWARD },
];

export const BARN_POS = { x: 2, y: 2 };

export const SHRINES: {
  id: number;
  x: number;
  y: number;
  type: 'war' | 'plenty';
  label: string;
  captureMs: number;
}[] = [
  { id: 1, x: 5, y: 11, type: 'war', label: 'Shrine of War', captureMs: 6000 },
  {
    id: 2,
    x: 11,
    y: 5,
    type: 'plenty',
    label: 'Shrine of Plenty',
    captureMs: 6000,
  },
  { id: 3, x: 19, y: 13, type: 'war', label: 'Shrine of War', captureMs: 8000 },
  {
    id: 4,
    x: 13,
    y: 19,
    type: 'plenty',
    label: 'Shrine of Plenty',
    captureMs: 8000,
  },
];

// ---------- Buildings ----------
export const BUILDING_COSTS: Record<
  BuildingType,
  {
    gold: number;
    lumber: number;
    stone: number;
    label: string;
    foodCapBonus: number;
  }
> = {
  farmhouse: {
    gold: 60,
    lumber: 30,
    stone: 0,
    label: 'Farmhouse',
    foodCapBonus: 5,
  },
  lumberShed: {
    gold: 40,
    lumber: 60,
    stone: 0,
    label: 'Lumber Shed',
    foodCapBonus: 0,
  },
  miningCamp: {
    gold: 50,
    lumber: 30,
    stone: 20,
    label: 'Mining Camp',
    foodCapBonus: 0,
  },
  watchtower: {
    gold: 80,
    lumber: 0,
    stone: 60,
    label: 'Watchtower',
    foodCapBonus: 0,
  },
  wall: {
    gold: 15,
    lumber: 25,
    stone: 0,
    label: 'Palisade Wall',
    foodCapBonus: 0,
  },
  windmill: {
    gold: 60,
    lumber: 40,
    stone: 0,
    label: 'Windmill',
    foodCapBonus: 0,
  },
  barracks: {
    gold: 80,
    lumber: 60,
    stone: 40,
    label: 'Barracks',
    foodCapBonus: 0,
  },
  siegeWorkshop: {
    gold: 100,
    lumber: 80,
    stone: 60,
    label: 'Siege Workshop',
    foodCapBonus: 0,
  },
  market: { gold: 80, lumber: 60, stone: 20, label: 'Market', foodCapBonus: 0 },
  blacksmith: {
    gold: 100,
    lumber: 60,
    stone: 80,
    label: 'Blacksmith',
    foodCapBonus: 0,
  },
  granary: {
    gold: 50,
    lumber: 80,
    stone: 20,
    label: 'Granary',
    foodCapBonus: 8,
  },
  stable: { gold: 80, lumber: 60, stone: 30, label: 'Stable', foodCapBonus: 0 },
  spikeTrap: {
    gold: 30,
    lumber: 20,
    stone: 10,
    label: 'Spike Trap',
    foodCapBonus: 0,
  },
  frostTower: {
    gold: FROST_TOWER_GOLD_COST,
    lumber: FROST_TOWER_LUMBER_COST,
    stone: FROST_TOWER_STONE_COST,
    label: 'Frost Tower',
    foodCapBonus: 0,
  },
  ballista: {
    gold: 100,
    lumber: 60,
    stone: 80,
    label: 'Ballista Tower',
    foodCapBonus: 0,
  },
  poisonTower: {
    gold: 70,
    lumber: 40,
    stone: 50,
    label: 'Poison Tower',
    foodCapBonus: 0,
  },
  supplyStore: {
    gold: 80,
    lumber: 40,
    stone: 20,
    label: 'Farm Supply Store',
    foodCapBonus: 0,
  },
};

// Tech tree prerequisites: building type → required building type (must be fully built)
export const BUILDING_REQUIRES: Partial<Record<BuildingType, BuildingType>> = {
  barracks: 'farmhouse',
  stable: 'barracks',
  blacksmith: 'barracks',
  siegeWorkshop: 'blacksmith',
  ballista: 'watchtower',
  supplyStore: 'market',
};

export const BUILDING_EMOJI: Record<BuildingType, string> = {
  farmhouse: '🏠',
  lumberShed: '🪵',
  watchtower: '🗼',
  wall: '🧱',
  windmill: '💨',
  barracks: '🏯',
  siegeWorkshop: '⚙️',
  market: '🏪',
  blacksmith: '🔨',
  granary: '🌾',
  stable: '🐴',
  spikeTrap: '🪤',
  frostTower: '❄️',
  ballista: '🏹',
  poisonTower: '☠️',
  supplyStore: '🛒',
  miningCamp: '⛏️',
};

export const BUILDING_DESCS: Partial<Record<BuildingType, string>> = {
  watchtower: 'Ranged attack · garrison 3 units',
  barracks: 'Trains swordsmen · upgrade to guard',
  frostTower: 'Slows enemies · 5-tile range',
  ballista: 'High dmg · long range · single target',
  poisonTower: 'Poisons AoE · 3-tile range',
  siegeWorkshop: 'Builds catapults & trebuchets',
  market: 'Passive gold income +2/5s',
  blacksmith: 'Upgrade unit attack & armor',
  stable: 'Trains cavalry units',
  granary: '+15 food cap',
  lumberShed: 'Lumber drop-off · gather bonus',
  windmill: '+2🪙 every 5s',
  spikeTrap: 'Damage grunts that step on it',
  farmhouse: '+5 food cap per level',
  supplyStore: 'Hero item shop · buy with gold',
  miningCamp: 'Gold/stone drop-off site',
};

export const BUILDING_MAX_HP: Record<BuildingType, number> = {
  farmhouse: 200,
  lumberShed: 150,
  watchtower: 180,
  wall: 120,
  windmill: 100,
  barracks: 250,
  siegeWorkshop: 220,
  market: 160,
  blacksmith: 200,
  granary: 140,
  stable: 200,
  spikeTrap: 60,
  frostTower: FROST_TOWER_HP,
  ballista: BALLISTA_HP,
  poisonTower: POISON_TOWER_HP,
  supplyStore: 180,
  miningCamp: 150,
};
export const BUILDING_GRUNT_DAMAGE = 8; // damage per hit from grunt to building
export const CONSTRUCTION_MS = 6000; // time to construct a building

// ---------- Production & traps ----------
export const TRAIN_TIME_MS = 8000;
export const TRAP_DAMAGE = 20;
export const TRAP_COOLDOWN_MS = 30000;
export const TRAP_RADIUS = 0.8;

// ---------- Enemy barn counterfire & base expansion ----------
export const BARN_COUNTER_RANGE = 5;
export const BARN_COUNTER_DMG = 7;
export const BARN_COUNTER_MS = 3000;
export const ENEMY_EXTRA_TOWER_SLOTS = [
  { x: 20, y: 21 },
  { x: 21, y: 20 },
  { x: 23, y: 20 },
  { x: 20, y: 23 },
];
export const ENEMY_EXTRA_WALL_SLOTS = [
  { x: 20, y: 24 },
  { x: 21, y: 23 },
  { x: 23, y: 21 },
  { x: 24, y: 20 },
];
export const ENEMY_FLANK_POSITIONS = [
  { x: 24, y: 12 },
  { x: 12, y: 24 },
];

// ---------- Loot crate rewards ----------
export const LOOT_CRATE_REWARDS = [
  { gold: 40, lumber: 0, stone: 0 },
  { gold: 0, lumber: 30, stone: 0 },
  { gold: 0, lumber: 0, stone: 25 },
  { gold: 20, lumber: 15, stone: 0 },
  { gold: 25, lumber: 0, stone: 20 },
  { gold: 15, lumber: 15, stone: 10 },
];

// Player barn defense fire — single source for both combat logic and the
// range ring drawn on the map, so the displayed ring matches the real reach
export const BARN_DEFENSE_RANGE = 5;

// ---------- UI display ----------
export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 2.5;
export const ZOOM_STEP = 0.15;
// Low-resource warning cutoffs for the resource bar
export const LOW_GOLD_WARNING = 30;
export const LOW_LUMBER_WARNING = 20;
export const LOW_STONE_WARNING = 10;

// ---------- Player military units ----------
export const SWORDSMAN_MAX_HP = 80;
export const SWORDSMAN_DAMAGE_BONUS = 10;
export const SWORDSMAN_CHARGE_COOLDOWN_S = 12;
export const SWORDSMAN_CHARGE_DAMAGE_MULT = 2;
export const CAVALRY_MAX_HP = 65;
export const CAVALRY_SPEED = 3.0;
export const CAVALRY_DAMAGE_BONUS = 8;
export const CAVALRY_TRAMPLE_RADIUS = 0.8;
export const CAVALRY_TRAMPLE_DAMAGE = 6;
export const CAVALRY_SPRINT_COOLDOWN_S = 20;
export const CAVALRY_SPRINT_DURATION_MS = 5000;
export const CAVALRY_SPRINT_SPEED_MULT = 2;

// ---------- Blacksmith upgrade costs [level 0→1, level 1→2] ----------
export const BLACKSMITH_STEEL_EDGE_COSTS: { gold: number; stone: number }[] = [
  { gold: 80, stone: 60 },
  { gold: 160, stone: 120 },
];
export const BLACKSMITH_IRON_HIDE_COSTS: { gold: number; lumber: number }[] = [
  { gold: 80, lumber: 50 },
  { gold: 160, lumber: 100 },
];

// ---------- Farmhouse upgrade research costs ----------
export const UPGRADE_MAX = 2;

export const UPGRADE_COSTS: Record<
  keyof Upgrades,
  { gold: number; lumber: number; stone: number }[]
> = {
  sharperTools: [
    { gold: 75, lumber: 0, stone: 25 },
    { gold: 150, lumber: 0, stone: 50 },
  ],
  swiftHarvest: [
    { gold: 50, lumber: 75, stone: 0 },
    { gold: 100, lumber: 150, stone: 0 },
  ],
  ironWill: [
    { gold: 75, lumber: 50, stone: 0 },
    { gold: 150, lumber: 100, stone: 0 },
  ],
};
