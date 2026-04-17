// Tech tree definition for farm upgrades and unlocks

export interface TechNode {
  id: string;
  name: string;
  description: string;
  cost: { [resource: string]: number };
  prerequisites: string[];
  unlocked: boolean;
  effect: () => void;
}

export const TECH_TREE: TechNode[] = [
  {
    id: 'tractor-unlock',
    name: 'Tractor',
    description: 'Unlocks the use of tractors for faster hay gathering.',
    cost: { hay: 50, money: 500 },
    prerequisites: [],
    unlocked: false,
    effect: () => {},
  },
  {
    id: 'irrigation-unlock',
    name: 'Irrigation',
    description: 'Unlocks irrigation for increased water production.',
    cost: { water: 50, money: 400 },
    prerequisites: [],
    unlocked: false,
    effect: () => {},
  },
  {
    id: 'barn-upgrade',
    name: 'Barn Upgrade',
    description: 'Upgrade the barn to train units faster.',
    cost: { money: 1000, hay: 100 },
    prerequisites: ['tractor-unlock'],
    unlocked: false,
    effect: () => {},
  },
  {
    id: 'animal-ability',
    name: 'Animal Ability',
    description: 'Unlock special animal abilities (e.g., cows produce more milk).',
    cost: { money: 800, hay: 60 },
    prerequisites: ['barn-upgrade'],
    unlocked: false,
    effect: () => {},
  },
];
