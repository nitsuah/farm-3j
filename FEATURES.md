# FEATURES.md

## Shipped

- **Core Next.js Architecture** — TypeScript, ESLint, CI baseline; consistent build pipeline for the farm project family.
- **Farm Tycoon Phase 1 MVP** — Playable farm tycoon foundation with core game loop.
- **Farm Tycoon Phase 2a–2f Isometric Grid** — Isometric grid foundation including tile rendering, camera, and terrain system.
- **Farm RTS Milestone 1** — Map/camera foundation: tile-based map rendering and camera controls for the RTS game mode.
- **Farm RTS Milestone 3** — Resource node depletion with visual feedback; harvestable nodes deplete and show low-resource state.
- **Farm RTS: Stone Resource** — Stone quarry nodes added to map; workers right-click to harvest stone; stone shown in resource bar.
- **Farm RTS: Box Selection** — Drag to select multiple workers simultaneously with blue selection rect overlay.
- **Farm RTS: Population Cap** — Food/population system: workers consume food supply; training blocked at cap; Barn upgrade expands cap.
- **Farm RTS: Wired Command Card** — Stop button halts all selected workers; real unit info panel shows state, resource carried, and multi-select count.
- **Farm RTS: Building Placement** — Ghost preview on hover (green=valid/red=invalid); click to place Farmhouse, Lumber Shed, or Watchtower; tile collision detection; Farmhouse expands food cap.
- **Farm RTS: Control Groups** — Ctrl+1–9 assigns selected workers to a numbered group; press 1–9 to recall group; group badge shown on worker portrait.
- **Farm RTS: Fog of War** — Tiles start dark; explored-but-not-visible dimmed (45% overlay); currently visible (within unit/building vision radius) fully clear; watchtower extends vision to 7 tiles.
- **Farm RTS: Enemy Base + Combat** — Enemy barn at far corner with HP bar and red flag; workers right-click it to attack (15 dmg/tick); barn counter-attacks workers; worker HP bars displayed; victory overlay when enemy barn falls.
- **Farm RTS: Unit HP System** — Workers have HP; take damage when attacking enemy; die and are removed from the roster when HP reaches 0.
- **Farm RTS: A\* Pathfinding** — Workers and enemy grunts navigate around water tiles using 8-directional A* pathfinding; path is recomputed whenever a move order is issued.
- **Farm RTS: Enemy Grunts (Defeat Condition)** — Enemy spawns orange grunt units from the enemy barn every 25 seconds; grunts pathfind to the player barn and attack it; player barn HP at 0 triggers defeat overlay.
- **Farm RTS: Functional Minimap** — Real SVG minimap in the HUD shows workers (green/blue), enemy grunts (orange), player barn (yellow), and enemy barn (red) positions in real-time.
- **Farm RTS: Worker vs Grunt Combat** — Right-click an enemy grunt to send selected workers to attack it; workers chase and deal damage per-tick; grunts die when HP reaches 0.
- **Farm RTS: Grunt Proximity Aggro** — Grunts within 2 tiles of a worker drop their march to the barn and attack that worker instead, dealing damage and requiring players to defend actively.
- **Farm RTS: Rally Point** — Right-click any tile with the barn selected to set a rally point (blue flag); newly trained workers automatically pathfind there instead of sitting idle at spawn.
- **Farm RTS: Formation Movement** — When multiple workers are moved together, each worker targets a unique offset tile around the destination so they spread out naturally instead of stacking on one tile.
- **Farm RTS: Tech Research Upgrades** — Three permanent upgrade tracks researched from the barn (requires farmhouse built): ⚔️ Sharper Tools (+5 atk dmg/level), 🌾 Swift Harvest (-200ms gather/level), 🛡️ Iron Will (+25 worker max HP/level); 2 levels each, cost scales with level.
- **Farm RTS: Floating Damage Numbers** — Damage and heal events show animated floating text in SVG (red for worker/barn damage, orange for grunt damage, green for heals); text rises and fades over 1.2 seconds.
- **Farm RTS: Auto-Repair** — Idle workers within 3 tiles of the barn slowly regenerate 2 HP every 2 seconds, incentivizing returning injured units to base between fights.
- **Farm RTS: Wave Escalation** — Grunts spawn in numbered waves; each wave adds +10 HP to grunts and reduces spawn delay (min 10s); every 3rd wave sends 2 grunts simultaneously; wave number displayed in HUD with a full-screen announcement banner.
- **Farm RTS: Game Speed Toggle** — ▶ 1× / ▶▶ 2× button in the resource bar multiplies all unit movement and game time by 2×, letting players fast-forward through early game buildup.
- **Farm RTS: Kill Counter & Score** — Live ☠ kill counter in the HUD; on game end a "Battle Report" overlay shows waves survived, grunts killed, gold mined, lumber cut, workers alive, and time played.
- **Farm RTS: Enemy Archer Tower** — A defensive archer tower guards the enemy base at a fixed position near the enemy barn; fires 🏹 arrows at the nearest worker within 4 tiles every 2.5 seconds (10 damage); tower disappears when the enemy barn is destroyed.

## Planned

### Farm RTS Game (MVP in progress)

- **Resource System** — Wood, stone, and food nodes; workers harvest and return to base
- **Worker Units** — Selectable farmer units with move/harvest commands
- **Building Placement** — Place and upgrade buildings on valid tiles
- **Animal Units** — Chickens, cows, pigs with grazing AI and food meter
- **Win/Lose Conditions** — Objective-based victory and defeat triggers
- **Box Selection** — Drag-select multiple units simultaneously
- **Control Groups** — Numbered group assignments for unit management

### Product & Commerce Surface

- **Product Catalog** - Browse available farm products with descriptions and images.
- **Order Placement** - Submit orders for farm products with delivery or pickup options.
- **Inventory Management** - Track product availability and update stock levels.
- **Customer Accounts** - Allow users to create accounts to manage orders and preferences.
- **Contact Form** - Enable users to send inquiries to the farm.
- **Blog/News Section** - Showcase farm activities, news, and recipes.
- **Subscription Model** - Enable recurring orders for certain products.

### Integrations

- **Payment Gateway Integration** - Integrate with a payment provider (e.g., Stripe, PayPal) for online transactions.
- **Email Service Integration** - Send order confirmations and notifications via email.

## DevOps/Infrastructure

- **CI/CD Pipeline** - Automated build, test, and deployment process.
- **Containerization** - Docker for consistent deployment environments.
- **TypeScript Linting** - Consistent code style enforced through linting.
