import type { Metadata } from 'next';
import { SiteLayout } from '@/components/SiteLayout';

export const metadata: Metadata = {
  title: 'PG Farms RTS – Real-Time Strategy',
  description:
    'Defend your farm against waves of enemies. Build, gather, train, and conquer.',
};

const UNIT_ROSTER = [
  {
    emoji: '👨‍🌾',
    name: 'Farmer',
    role: 'Worker / Gatherer',
    desc: 'The backbone of your economy. Harvest gold, lumber, and stone. Can garrison inside the barn to boost its armor. Upgradeable with Sharper Tools and Swift Harvest.',
  },
  {
    emoji: '⚔️',
    name: 'Swordsman',
    role: 'Infantry',
    desc: 'Trained at the Barracks. Durable melee fighter with a charge ability that deals double damage on a 12s cooldown. Blacksmith upgrades increase attack and armor.',
  },
  {
    emoji: '🐴',
    name: 'Cavalry',
    role: 'Fast Skirmisher',
    desc: 'High-speed mounted unit that tramples grunts while moving. Sprint ability (2× speed for 5s). Requires a Stable built after a Barracks.',
  },
  {
    emoji: '⚙️',
    name: 'Catapult',
    role: 'Siege',
    desc: 'Area-of-effect siege unit from the Siege Workshop. Lobs boulders that splash on impact. Slow but devastating against clustered enemies.',
  },
  {
    emoji: '🏹',
    name: 'Trebuchet',
    role: 'Long-range Siege',
    desc: 'Extreme range (9 tiles) but has a minimum fire distance of 2.5 tiles. Fires massive projectiles with huge damage. Requires Blacksmith to unlock.',
  },
  {
    emoji: '🦸',
    name: 'Hero',
    role: 'Hero Unit',
    desc: 'A unique powerful unit that levels up by earning XP from kills. Gains abilities at level 1 (Earthquake AoE), level 2 (Battle Shout, buffing nearby allies), and level 3 (enhanced Shout). Can carry up to 3 hero items.',
  },
];

const ENEMY_ROSTER = [
  {
    emoji: '👹',
    name: 'Grunt',
    desc: 'Basic melee raider. Attacks your barn and buildings. Scales in HP per wave. Boss variants appear periodically.',
  },
  {
    emoji: '🧙',
    name: 'Shaman',
    desc: 'Heals nearby allies. Priority target — kill first to deny enemy sustain.',
  },
  {
    emoji: '🧌',
    name: 'Troll',
    desc: 'Kiting ranged unit (4-tile range). Backs away when you approach.',
  },
  {
    emoji: '💣',
    name: 'Sapper',
    desc: 'Explodes on contact, dealing massive AoE damage. Intercept before it reaches your walls.',
  },
  {
    emoji: '🪄',
    name: 'Necromancer',
    desc: 'Raises fallen grunts from the dead within 3 tiles every 4s. Destroy before it snowballs the fight.',
  },
  {
    emoji: '🩺',
    name: 'Witch Doctor',
    desc: 'Enrages nearby enemies, boosting their attack damage for 6s. Buffs cascade quickly — prioritize.',
  },
  {
    emoji: '🌊',
    name: 'War Ram',
    desc: 'Heavy siege unit that smashes buildings and your barn for massive damage. First appears wave 6.',
  },
  {
    emoji: '☄️',
    name: 'Demolisher',
    desc: 'Ranged siege catapult with 4-tile fire range and splash damage. Appears wave 14.',
  },
  {
    emoji: '🐺',
    name: 'Night Lurker',
    desc: 'Fast stealth-like raider that hunts down farmers. Only appears at night (wave 15+). Very high speed.',
  },
  {
    emoji: '👑',
    name: 'Warchief',
    desc: 'Elite boss-tier unit with a War Stomp AoE that stuns your units for 2.5s on a 12s cooldown.',
  },
  {
    emoji: '🛡️',
    name: 'Warlord',
    desc: 'Top-tier boss. War Cry slows all nearby units; Shield Bash stuns a single target. First at wave 20.',
  },
];

const BUILDING_GROUPS = [
  {
    label: 'Economy',
    buildings: [
      {
        emoji: '🏠',
        name: 'Farmhouse',
        desc: '+5 food cap per level. Research Sharper Tools, Swift Harvest, Iron Will.',
      },
      {
        emoji: '🌾',
        name: 'Granary',
        desc: '+15 food cap. Expand your army size significantly.',
      },
      {
        emoji: '🪵',
        name: 'Lumber Shed',
        desc: 'Drop-off site for lumber. Each shed reduces gather time by 200ms.',
      },
      {
        emoji: '⛏️',
        name: 'Mining Camp',
        desc: 'Drop-off for gold and stone. Speeds up mining runs.',
      },
      { emoji: '🏪', name: 'Market', desc: '+2 gold every 5s passive income.' },
      {
        emoji: '💨',
        name: 'Windmill',
        desc: '+2 gold every 5s. Stack with Markets for strong passive economy.',
      },
    ],
  },
  {
    label: 'Military',
    buildings: [
      {
        emoji: '🏯',
        name: 'Barracks',
        desc: 'Train Swordsmen. Unlock War Drums upgrade. Requires Farmhouse.',
      },
      {
        emoji: '🐴',
        name: 'Stable',
        desc: 'Train Cavalry. Requires Barracks.',
      },
      {
        emoji: '🔨',
        name: 'Blacksmith',
        desc: 'Steel Edge (+5 atk per level) and Iron Hide (-5 dmg per level). Requires Barracks.',
      },
      {
        emoji: '⚙️',
        name: 'Siege Workshop',
        desc: 'Build Catapults & Trebuchets. Requires Blacksmith.',
      },
      {
        emoji: '🛒',
        name: 'Farm Supply Store',
        desc: 'Hero item shop. Buy Boots, Blade, Shield, Potions. Requires Market.',
      },
    ],
  },
  {
    label: 'Defense',
    buildings: [
      {
        emoji: '🗼',
        name: 'Watchtower',
        desc: '5-tile vision, 5-tile attack range, garrison up to 3 units for bonus damage and range.',
      },
      {
        emoji: '🧱',
        name: 'Palisade Wall',
        desc: 'Blocks enemy pathing. Forces grunts to break through before reaching your core.',
      },
      {
        emoji: '🪤',
        name: 'Spike Trap',
        desc: 'Deals 20 damage to any grunt that steps on it. 30s recharge.',
      },
      {
        emoji: '❄️',
        name: 'Frost Tower',
        desc: 'Slows enemies by 50% for 3s. 5-tile range.',
      },
      {
        emoji: '🏹',
        name: 'Ballista Tower',
        desc: 'High single-target damage with pierce. Requires Watchtower.',
      },
      {
        emoji: '☠️',
        name: 'Poison Tower',
        desc: 'AoE poison DoT on hit. Requires Watchtower.',
      },
    ],
  },
];

const MECHANICS = [
  {
    emoji: '🌙',
    title: 'Day / Night Cycle',
    desc: 'Enemies speed up at night. Night Lurkers only appear after dark. Plan your garrison and build your defenses before sunset.',
  },
  {
    emoji: '🌊',
    title: 'Wave System',
    desc: 'Enemies raid in escalating waves. Each wave grows harder: more grunts, higher HP, and new enemy types unlock over time.',
  },
  {
    emoji: '⛩️',
    title: 'Shrines',
    desc: 'Neutral shrines scattered across the map. Channel to capture: Shrine of War grants +5 attack to all units; Shrine of Plenty speeds up resource gathering by 15%.',
  },
  {
    emoji: '📦',
    title: 'Loot Crates',
    desc: 'Crates spawn every 45s on fixed map positions. Send a farmer to collect free gold, lumber, or stone.',
  },
  {
    emoji: '🏰',
    title: 'Enemy Fortifications',
    desc: 'The enemy base builds walls and towers as waves progress. Breach their defenses to destroy the enemy barn and win.',
  },
  {
    emoji: '💾',
    title: 'Save System',
    desc: 'Up to 3 save slots with wave progress, resources, buildings, and units preserved. Cloud saves (cross-device) coming soon.',
  },
];

export default function RTSLandingPage() {
  return (
    <SiteLayout>
      <main className="flex-1 bg-gray-50 dark:bg-gray-950">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-yellow-800 py-20 text-center text-white">
          <div className="relative z-10 mx-auto max-w-3xl px-6">
            <div className="mb-4 text-6xl">🌾⚔️🏰</div>
            <h1 className="mb-4 text-5xl font-bold drop-shadow-lg">
              PG Farms RTS
            </h1>
            <p className="mb-8 text-lg text-green-100 opacity-90">
              Defend your farm. Train your army. Survive the siege.
              <br />A real-time strategy game built in the browser.
            </p>
            <a
              href="/rtsfarm/play"
              className="inline-block rounded-xl bg-yellow-500 px-10 py-4 text-2xl font-bold text-black shadow-lg transition hover:bg-yellow-400 hover:shadow-xl"
            >
              ▶ Play Now
            </a>
          </div>
        </section>

        {/* Game Mechanics */}
        <section className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="mb-8 text-center text-3xl font-bold text-green-900 dark:text-green-300">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MECHANICS.map(m => (
              <div
                key={m.title}
                className="rounded-xl border border-green-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-green-900 dark:bg-gray-900"
              >
                <div className="mb-2 text-3xl">{m.emoji}</div>
                <h3 className="mb-1 font-bold text-green-800 dark:text-green-300">
                  {m.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Unit Roster */}
        <section className="bg-white py-14 dark:bg-gray-900">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 text-center text-3xl font-bold text-green-900 dark:text-green-300">
              Your Units
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {UNIT_ROSTER.map(u => (
                <div
                  key={u.name}
                  className="flex gap-4 rounded-xl border border-green-100 bg-green-50 p-4 transition hover:border-green-300 dark:border-green-900 dark:bg-gray-800 dark:hover:border-green-700"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-200 text-3xl dark:bg-green-900">
                    {u.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-900 dark:text-green-200">
                        {u.name}
                      </span>
                      <span className="rounded bg-green-800 px-1.5 py-0.5 text-xs text-green-100">
                        {u.role}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {u.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enemy Roster */}
        <section className="py-14">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 text-center text-3xl font-bold text-red-800 dark:text-red-400">
              Your Enemies
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ENEMY_ROSTER.map(e => (
                <div
                  key={e.name}
                  className="flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4 transition hover:border-red-300 dark:border-red-900 dark:bg-gray-900 dark:hover:border-red-700"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-200 text-2xl dark:bg-red-900">
                    {e.emoji}
                  </div>
                  <div>
                    <span className="font-bold text-red-900 dark:text-red-300">
                      {e.name}
                    </span>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                      {e.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Buildings */}
        <section className="bg-white py-14 dark:bg-gray-900">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 text-center text-3xl font-bold text-green-900 dark:text-green-300">
              Buildings
            </h2>
            <div className="space-y-10">
              {BUILDING_GROUPS.map(group => (
                <div key={group.label}>
                  <h3 className="mb-4 text-lg font-semibold text-green-800 dark:text-green-400">
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.buildings.map(b => (
                      <div
                        key={b.name}
                        className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <span className="text-2xl">{b.emoji}</span>
                        <div>
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {b.name}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {b.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-green-900 dark:text-green-300">
            Ready to defend the farm?
          </h2>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            No download required. Runs in your browser.
          </p>
          <a
            href="/rtsfarm/play"
            className="inline-block rounded-xl bg-yellow-600 px-12 py-4 text-2xl font-bold text-white shadow-lg transition hover:bg-yellow-500"
          >
            ▶ Play Now
          </a>
        </section>
      </main>
    </SiteLayout>
  );
}
