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
- [x] Barracks building + Swordsman unit — Barracks (80g/60l/40s) enables training ⚔️ Swordsmen (50g, 80HP, +10 dmg bonus, can't harvest); distinct dark-red visual; damage bonus stacks with Sharper Tools upgrade (2026-06-26)
- [x] Save/load game state — full localStorage persistence; auto-save every 30s + on tab close; 💾 Save and 🗑 New Game buttons in resource bar; Play Again clears save (2026-06-26)
- [x] Day/night cycle — 60s day / 45s night loop; night darkens map with SVG overlay; grunts move 30% faster at night; resource bar and border tint to indigo at night; phase announcement banners; progress bar shows time remaining (2026-06-26)
- [x] Garrisoning — right-click barn or click 🏰 Garrison button to send selected units inside (cap 5); units heal 5 HP/s; each garrisoned unit reduces grunt barn damage by 2 (max 8); barn border turns cyan when occupied; 🚪 Deploy button releases all units (2026-06-26)
- [x] Hero unit (Barnabas) — unique 🦸 hero recruitable from Barracks (150g, 150HP, +20 dmg); crown SVG + gold border; ⚡ Rallying Cry ability deals 30 AoE damage to all grunts within 3.5 tiles; 25s cooldown shown in command card (2026-06-26)
- [x] Siege Workshop + Catapult unit — Siege Workshop (100🪙 80🌲 60🪨) enables training 🪨 Catapults (150g/80l, 60HP); catapults auto-fire AoE splash at grunts within 6 tiles (22 direct / 11 splash, 3.5s cooldown); slow movement; distinct SVG (wooden frame, wheels, throwing arm, boulder); can't harvest or garrison (2026-06-26)
- [x] Player watchtowers fire defensive arrows — watchtowers shoot 8 dmg at nearest grunt within 5 tiles every 2s; floating 🏹 hit text; creates AoE/Warcraft-style defensive tower lines (2026-06-26)
- [x] Grunt gold drops — each grunt killed drops 5🪙 with floating text; Warcraft-style loot incentive for engaging enemies (2026-06-26)
- [x] Market building — Market (80🪙 60🌲 20🪨) enables trading: sell 50🌲 for 30🪙 or 30🪨 for 20🪙 via command card buttons; AoE-style economy layer for converting surplus resources (2026-06-26)
- [x] Stable building + Cavalry unit — Stable (80🪙 60🌲 30🪨) enables 🐴 Cavalry (60🪙, 65HP, 3× speed, +8 dmg); horse+rider SVG; cannot harvest; shares vet/blacksmith upgrades (2026-07-01)
- [x] Lumber Shed passive bonus — each Lumber Shed reduces lumber gather interval by 200ms (stacks with Swift Harvest, min 400ms); AoE-style economic building that actually rewards building drop sites near forests (2026-07-01)
- [x] Enhanced minimap — minimap now renders tree/gold/stone resource nodes, all placed buildings, and uncleaned creep camp markers; legend below map; taller map panel for readability (2026-07-01)
- [x] Player barn defense fire — barn auto-fires 🏰-6 dmg at nearest grunt within 4 tiles every 3s (Town Center mechanic); dashed ring around barn when under siege; defense stat shown in barn command card (2026-07-01)
- [x] Hero second ability: Harvest Boon — 🌾 all farmers gather 2× faster for 10s; 40s cooldown; active state shown on button; boon applies to gold/lumber/stone; WC3-style hero economic support ability (2026-07-01)
- [x] Enemy fortress escalation — enemy base spawns destroyable 🏹 archer towers at waves 5/10/15 (60 HP, 9 dmg, 4.5-tile range); right-click to attack; tower HP bars displayed; red dots on minimap; wave announcement "ENEMY TOWER BUILT!"; makes late-game sieging feel like AoE/WC3 fortress assault (2026-07-01)
- [x] Guard Tower research — 120🪙 80🪨 one-time research upgrades all watchtowers to Guard Towers (+7 dmg: 8→15, +1 range: 5→6); 🏰 emoji on shots; button in farmhouse card when watchtower is built; AoE-style tower upgrade tech (2026-07-01)
- [x] Hero Morale Aura — hero alive within 3 tiles speeds up all unit attacks by 30% (1200ms→840ms); dashed golden ring on affected units; getMoraleMs() helper used at all 4 attack timeout sites; WC3-style passive hero aura (2026-07-01)
- [x] Idle worker alert — yellow ! badge above idle farmers; orange ! above idle combat units; keeps player aware of unassigned units like AoE's worker alert (2026-07-01)
- [x] Enemy Boss Grunt (War Bull) — spawns on every 10th wave alongside regular grunts; 3× HP, 25 barn dmg (vs 12), 80 XP reward, 20🪙 gold drop; distinct bull SVG with horns, red eyes, and WAR BULL label; 💀 wave banner; WC3/AoE-style boss difficulty spike (2026-07-01)
- [x] Neutral creep camps — 3 camps of 2 purple boar creeps; aggro 3.5 tile range, leash; +60🪙 loot on clear; grant XP to killing unit; right-click to attack (2026-07-01)
- [x] Granary building — Granary (50🪙 80🌲 20🪨) adds +8 food cap on placement; stackable silo SVG; AoE-style dedicated pop-cap building cheaper than Farmhouse (2026-07-01)
- [x] Unit veterancy — combat units earn XP per kill; level 1 at 40 XP (+10 HP +5 atk), level 2 at 120 XP (+10 HP +5 atk); ⭐ badges on SVG; XP bar in command panel; stacks with all other bonuses (2026-07-01)
- [x] Blacksmith building — Blacksmith (100🪙 60🌲 80🪨) enables ⚔️ Steel Edge (2 levels, +5 atk per level all units) and 🛡️ Iron Hide (2 levels, -2 dmg taken per level from grunts); stone forge SVG with chimney; AoE/Warcraft-style dedicated upgrade building (2026-07-01)
- [x] Spike Trap building — Spike Trap (30🪙 20🌲 10🪨) deals 20 dmg to any grunt stepping within 0.8 tiles; 30s rearm cooldown per trap; shows armed (yellow spikes) vs recharging (gray spikes) state; build button in farmhouse command card; stackable in chokepoints for layered ground defense; WC3/AoE-style terrain trap (2026-07-01)
- [x] Unit Training Queue — Swordsman and Cavalry training now takes 8s instead of being instant; up to 5 units can be queued per click; progress bar and unit-icon queue shown in command card; "⚔️ Ready!" / "🐴 Ready!" floating text on spawn; AoE/WC3-style queued training that rewards forward planning (2026-07-01)
- [x] Auto-gather on resource depletion — when a farmer's tree/stone node runs dry after returning resources, it automatically pathfinds to the nearest non-empty node of the same type instead of going idle; AoE-style villager auto-reassignment that keeps economy flowing without micromanagement (2026-07-01)
- [x] Command hotkeys — F=train farmer, Q=train swordsman, R=train cavalry, Del=stop selected units, G=garrison; hotkey hints shown in buttons and HUD tooltip bar; AoE/WC3-style keyboard shortcuts for experienced players (2026-07-01)
- [x] Resource shortage alerts — gold <30, lumber <20, stone <10 flash red in HUD with pulse animation; food at cap shows ⚠ warning in red; AoE-style visual alert that surfaces economy bottlenecks without interrupting gameplay (2026-07-01)
- [x] Fog of war on enemy units — enemy grunts and enemy fortress towers only render when their tile is within player vision radius (fogVisible check); adds WC3/AoE tension where threats approach unseen through the fog (2026-07-01)
- [x] Next wave countdown timer — live ⏱ Xs countdown in HUD showing seconds until next grunt wave; pulses red when ≤5s; 1s tick interval drives re-render; AoE/WC3-style wave warning that lets players prepare defenses in time (2026-07-01)
- [x] Minimap click-to-pan — clicking anywhere on the minimap pans the main camera to center on that tile position; cursor:crosshair on minimap SVG; coordinates mapped from minimap SVG space to tile space to camera translate; AoE/WC3 standard navigation feature (2026-07-01)
- [x] Ctrl+A select all units — Ctrl+A selects all living player units; added to HUD hint bar; AoE/WC3 all-select hotkey for rapid army assembly (2026-07-01)
- [x] Watchtower garrison — right-click a watchtower with units selected to garrison up to 3 units inside; each garrisoned unit adds +4 tower damage and +0.5 tile range; cyan border + 👥×N label on occupied towers; Deploy button in farmhouse command card per tower; units restore food on deploy; AoE2-style garrisoned tower mechanic rewarding defensive investment (2026-07-01)
- [x] Attack-Move command [A] — press A with combat units selected then right-click a destination; units march but auto-engage any enemy grunt or creep within 2.5 tiles; resume march after kill until reaching destination; red ⚔️ Attack-Move mode banner in HUD; Esc cancels; A hotkey hint added to tooltip bar; SC2/AoE/WC3 staple micro mechanic (2026-07-01)
- [x] Building repair by workers — right-click any damaged building with units selected to send them to repair it; workers enter 🔧 Repairing state; +5 HP every 2s with green float; damaged buildings show orange border + "🔧 REPAIR" hint; fully repaired buildings return workers to idle; WC3/AoE-style villager repair mechanic (2026-07-01)
- [x] Building damage from grunts — placed buildings now have HP (farmhouse 200, watchtower 180, barracks 250, etc.); grunts within 1.2 tiles attack buildings for 8 dmg/1.5s; destroyed buildings removed from map; HP bars shown on damaged buildings (green→yellow→red); old saves migrated to add HP; WC3/AoE strategic depth where players must defend entire base not just barn (2026-07-01)
