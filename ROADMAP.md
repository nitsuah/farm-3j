# ROADMAP

Last Updated: 2026-06-25

## 2026 Q1 ✅

> Completed. Core Next.js architecture with linting/CI, Farm Tycoon Phase 1 MVP, and Farm Tycoon Phase 2a–2f isometric grid foundation shipped.

## 2026 Q2–Q3: Farm RTS MVP

- [ ] Complete all MVP milestones as defined in docs/Farm_RTS_Game_Manual.md and docs/FARM-RTS-TODO.md and refer to docs/FARM-RTS-NORTH-STAR.md for guidance on the overall vision.
  - Progress: Milestones 1, 3, 4 (partial), 5 (building placement), 7 (enemy+win/lose) complete (reverify progress and remaining tasks in docs/FARM-RTS-TODO.md docs/TASKS.md)
  - Also shipped: fog of war, control groups, stone resource, box selection, population cap, unit HP, grunt-vs-worker combat, formation/patrol commands
  - Remaining: animal units, advanced combat polish

## 2026 Q4: Product and Content Surface

- [ ] Improve the product gallery and catalog surface.
- [ ] Add a blog or news publishing path.
- [ ] Ship ecommerce phase 1.
- [ ] Evaluate subscription or recurring-order follow-ons.
- [ ] Harden accessibility and SEO for a broader launch.
- [ ] **Fog of war** — tile visibility driven by unit and building vision radius; unexplored tiles dark, explored-but-unoccupied tiles dimmed; creates strategic exploration tension without adding a full multiplayer requirement.
- [ ] **Unit formation commands** — move a selected group in a named formation (line, wedge, box); prevents all units path-finding to the same point and adds visual strategic depth to multi-unit control.

## Legacy Tycoon Tasks (on hold)

- [ ] Finish the animal needs loop (hunger, thirst, happiness lifecycle).
- [ ] Finish feeding mechanics and inventory interactions.
- [ ] Finish fence placement and terrain editing workflows.
- [ ] Add save/load state and building expansion follow-on work.
- [ ] Validate the full gameplay loop end-to-end in Docker (start game → build → feed animals → save → reload).
