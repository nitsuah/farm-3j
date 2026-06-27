# TASKS

Last Updated: 2026-06-26 (Farm RTS MVP focus)

## Farm RTS MVP (2026 Q2–Q3)

- [ ] Complete all MVP milestones as defined in docs/Farm_RTS_Game_Manual.md and docs/FARM-RTS-TODO.md
  - Progress: Milestone 1 complete; Milestone 3 (resource node depletion/feedback) complete
  - Priority: P0
  - Acceptance Criteria: All core gameplay systems (map, camera, resource, worker, building, win/lose) are playable and validated in Docker.

## Legacy Tycoon Tasks (on hold)

- [ ] Complete Farm Tycoon phase 2 core systems (animal needs, feeding, fence, save/load)
- [ ] Refresh README and deployment notes with actual release path.
- [ ] Build content and discovery surfaces (gallery, blog, SEO, accessibility)
- [ ] Plan and implement ecommerce phase 1.

## Unfinished Todos (RTS Farm Game)

- [x] Add stone resource nodes (2026-06-26)
- [x] Add box selection for multiple units (2026-06-26)
- [x] Wire up Stop command in command card (2026-06-26)
- [x] Real unit info panel (state, carrying, multi-select count) (2026-06-26)
- [x] Population/food cap system (2026-06-26)
- [ ] Add animal units (chickens, cows, pigs) with grazing AI
- [ ] Implement grazing logic and food meter
- [x] Enable building placement on valid tiles — ghost preview + valid/invalid tile detection (2026-06-26)
- [ ] Ensure farmers render in front of barn and are always selectable
- [x] Lay groundwork for control groups (Ctrl+1-9) (2026-06-26)
- [ ] Add buttons to train animal units from Barn
- [ ] Fog of war — tile visibility driven by unit vision radius
- [x] Fog of war — tile visibility driven by unit/building vision radius; dark/dim/clear states (2026-06-26)
- [x] Enemy base + win/lose condition (Milestone 7) — enemy barn at (10,10) with HP bar, attack on right-click, victory overlay (2026-06-26)
- [x] A* pathfinding — workers and grunts avoid water; 8-directional grid search (2026-06-26)
- [x] Enemy grunts — spawn every 25s, pathfind to player barn, reduce barn HP, defeat overlay on 0 HP (2026-06-26)
- [x] Functional minimap — real-time SVG minimap showing all units and buildings (2026-06-26)
- [x] Worker vs grunt combat — right-click grunt to attack; workers chase and deal ATTACK_DAMAGE per tick (2026-06-26)
- [x] Grunt proximity aggro — grunts within 2 tiles of a worker attack it instead of marching to barn (2026-06-26)
- [x] Rally point — right-click tile with barn selected; new workers auto-walk there on train (2026-06-26)
- [x] Formation movement — multi-unit move spreads workers to offset tiles around target (2026-06-26)
- [x] Tech research upgrades — Sharper Tools / Swift Harvest / Iron Will, 2 levels each, gated on farmhouse (2026-06-26)
- [x] Floating damage numbers — animated SVG text on all damage/heal events, color-coded, rises and fades (2026-06-26)
- [x] Auto-repair — idle workers near barn regen 2 HP/2s with green +2 float (2026-06-26)
- [x] Wave escalation — grunts stronger/faster each wave; double-assault every 3rd; HUD wave counter + banner (2026-06-26)
- [x] Game speed toggle — 1×/2× button multiplies animation dt (2026-06-26)
- [x] Kill counter + score — live ☠ HUD counter; end-screen Battle Report with 6 stats (2026-06-26)
- [x] Enemy archer tower — static tower near enemy barn fires arrows at workers in range; 10 dmg/2.5s; disappears with barn (2026-06-26)
- [x] Worker patrol — P key / Patrol button; workers cycle between two waypoints; dashed route line shown on selection; Stop cancels (2026-06-26)
- [x] Palisade wall building — blocks enemy grunt pathfinding; workers can build them anywhere; creates tactical chokepoints (2026-06-26)
- [x] Windmill building — passive +2 gold every 5s per windmill; floating gold text on each tick (2026-06-26)
