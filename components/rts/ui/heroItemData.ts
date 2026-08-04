/** Static display data for hero inventory items. */
export const HERO_ITEM_DATA: Record<
  string,
  { name: string; emoji: string; desc: string; consumable?: boolean }
> = {
  boots_speed: {
    name: 'Boots of Swiftness',
    emoji: '👟',
    desc: '+0.4 move speed',
  },
  battle_sword: {
    name: 'Battle Blade',
    emoji: '🗡️',
    desc: '+20 hero damage',
  },
  shield_pendant: {
    name: 'Shield Pendant',
    emoji: '🛡️',
    desc: '-6 damage taken',
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
