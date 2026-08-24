# ROADMAP

Last Updated: 2026-08-22

## 2026 Q1 ✅

> Completed. Core Next.js architecture with linting/CI, Farm Tycoon Phase 1 MVP, and Farm Tycoon Phase 2a–2f isometric grid foundation shipped.

## 2026 Q2–Q3: Farm RTS MVP ✅ (feature-complete)

> All core gameplay systems shipped. 25×25 map, 10+ enemy unit types, full economy/combat/building loop, fog of war, day/night cycle, hero unit, 20+ buildings, unit veterancy, tech research, save/load, procedural audio, high-score leaderboard, and wave escalation all live. Codebase refactored with shared SVG component layer (HpBar, StructureDamageSmoke, StructureFireEffect) eliminating duplicated render primitives across all map layer files. Modularization Phase 1 completed (2026-08-04): `RTSUI` decomposed into `BuildMenu`/`WaveTimer`/`HeroPanel`; `HeaderCropRow` background extracted; pure functions isolated in `spawnHelpers`, `towerHelpers`, `mapSelectors` with +55 tests (264 total); domain hook shells and `MapRenderer` shell scaffolded as migration targets for `useGameLoop`/`RTSMap` (Phase 2).

## 2026 Q3: Farm RTS — Round 2

### Technical Health

- [ ] Continue SVG component extraction — worker body shapes, enemy unit torsos, building base rects are next candidates for shared components (see iter109 pattern)
- [x] Extract blacksmith upgrade costs to shared config constants — `BLACKSMITH_STEEL_EDGE_COSTS` and `BLACKSMITH_IRON_HIDE_COSTS` in `constants.ts`; TechTab consumes them (2026-08-07)
- [ ] Componentize large files Phase 2 — migrate logic from `useGameLoop.tsx` (5369 lines) into `useEnemyAI`, `useResourceTick`, `useCombatResolution`, `usePathfinding` domain hooks; wire `RTSMap.tsx` (4392 lines) through `MapRenderer` + `mapSelectors`
- [ ] Profile render loop on 25×25 map with 30+ units; investigate canvas or OffscreenCanvas fallback if SVG drops below 30fps on mobile
- [ ] Add unit tests for remaining core helpers: `tileDist`, `tileToSvg`, A\* pathfinding (damage formulas ✅ covered in towerHelpers/spawnHelpers; map selectors ✅ covered in mapSelectors tests)

### Gameplay Features

- [ ] **Named formations** — move a selected group in line, wedge, or box formation; prevents units stacking on the same tile and adds strategic depth to multi-unit control
- [ ] **Enemy hero unit** — Warlord spawns at wave 20+; unique abilities (War Cry, Shield Bash); harder than Warchief, drops rare item
- [ ] **Dropped hero items** — slain enemy elites drop equippable items Barnabas can pick up (Speed Boots, War Banner, Healing Totem); persists between hero deaths
- [x] **Save slots** — 3 cloud-backed save slots (0/1/2) with localStorage fallback via hybrid persistence; slot picker UI on New Game screen still TBD (2026-08-07)
- [ ] **Challenge / achievement system** — unlock badges for milestone runs (e.g., "Survive 20 waves without losing a building", "Kill 5 Sappers before they explode")
- [ ] **Campaign mode (Phase 1)** — linear sequence of 3 hand-crafted scenarios with scripted objectives beyond simple "defend the barn"

### Content & Polish

- [ ] Background ambient audio loop (farm sounds, wind, distant battle) with independent volume slider
- [ ] More unit voice lines and enemy audio cues (Warchief stomp roar, Sapper countdown tick)
- [ ] Minimap: show dropped hero items and loot crate positions
- [ ] Ensure farmers always render in front of barn and remain selectable when barn is clicked

## 2026 Q4: Product and Content Surface

- [ ] Improve the product gallery and catalog surface.
- [ ] Add a blog or news publishing path.
- [ ] Ship ecommerce phase 1.
- [ ] Evaluate subscription or recurring-order follow-ons.
- [ ] Harden accessibility and SEO for a broader launch.

## Legacy Tycoon Tasks (on hold)

- [ ] Finish the animal needs loop (hunger, thirst, happiness lifecycle).
- [ ] Finish feeding mechanics and inventory interactions.
- [ ] Finish fence placement and terrain editing workflows.
- [ ] Add save/load state and building expansion follow-on work.
- [ ] Validate the full gameplay loop end-to-end in Docker (start game → build → feed animals → save → reload).
