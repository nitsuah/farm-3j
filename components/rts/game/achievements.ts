export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Kill your first enemy',
    emoji: '⚔️',
  },
  {
    id: 'kill_100',
    name: 'Century Kill',
    description: 'Kill 100 enemies in a run',
    emoji: '💀',
  },
  {
    id: 'kill_500',
    name: 'Butcher',
    description: 'Kill 500 enemies in a run',
    emoji: '🗡️',
  },
  {
    id: 'wave_10',
    name: 'Battle Tested',
    description: 'Survive to wave 10',
    emoji: '🛡️',
  },
  {
    id: 'wave_20',
    name: 'Survivor',
    description: 'Survive to wave 20',
    emoji: '🏆',
  },
  {
    id: 'wave_30',
    name: 'War Veteran',
    description: 'Survive to wave 30',
    emoji: '⭐',
  },
  {
    id: 'wave_50',
    name: 'Legendary',
    description: 'Survive to wave 50',
    emoji: '👑',
  },
  {
    id: 'pack_leader',
    name: 'Pack Leader',
    description: 'Command 6 or more units at once',
    emoji: '⚔️',
  },
  {
    id: 'fortified',
    name: 'Fortified',
    description: 'Build 3 walls',
    emoji: '🧱',
  },
  {
    id: 'blacksmith_max',
    name: "Blacksmith's Best",
    description: 'Max out a Blacksmith upgrade to level 2',
    emoji: '⚒️',
  },
  {
    id: 'flawless',
    name: 'Flawless',
    description: 'Complete a wave with no barn damage',
    emoji: '✨',
  },
  {
    id: 'sapper_slayer',
    name: 'Sapper Slayer',
    description: 'Kill 5 sappers before they explode',
    emoji: '💥',
  },
  {
    id: 'warchief_slayer',
    name: 'Warchief Slayer',
    description: 'Defeat an Enemy Warchief',
    emoji: '👑',
  },
  {
    id: 'warlord_slayer',
    name: 'Warlord Slayer',
    description: 'Defeat the Enemy Warlord',
    emoji: '🔮',
  },
  {
    id: 'veteran_corps',
    name: 'Veteran Corps',
    description: 'Field 3 level-3 units simultaneously',
    emoji: '⭐',
  },
  {
    id: 'gold_baron',
    name: 'Gold Baron',
    description: 'Earn 1000 total gold in a run',
    emoji: '🪙',
  },
  {
    id: 'hero_equipped',
    name: 'Well Armed',
    description: 'Equip Barnabas with 3 hero items',
    emoji: '🦸',
  },
];

const ACHIEVEMENT_KEY = 'farm3j_achievements_v1';

export function getEarnedAchievements(): Set<string> {
  try {
    const raw =
      typeof window !== 'undefined'
        ? localStorage.getItem(ACHIEVEMENT_KEY)
        : null;
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** Returns true if this is a NEW unlock (was not already earned). */
export function unlockAchievement(id: string): boolean {
  const earned = getEarnedAchievements();
  if (earned.has(id)) return false;
  earned.add(id);
  try {
    localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify([...earned]));
  } catch {
    /* storage quota */
  }
  return true;
}
