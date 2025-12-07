# 🌾 Farm Tycoon Homepage

## Interactive Next.js Design Plan

This plan outlines the architecture for creating a basic, interactive 2D farm simulation that serves as a modular and extensible Next.js homepage.

## 1. Core Principles

- **Modularity:** Separate static assets, animated entities, and control logic into distinct React components.
- **Lightweight Animation:** Use basic CSS and `requestAnimationFrame` instead of heavy game engines for optimal homepage performance.
- **Extensibility:** Base the entity system on a simple data model to easily add new animals and assets over time (e.g., for "Farm Tycoon" features).

## 2. Technology Stack

| Component     | Technology                                | Purpose                                                              |
| ------------- | ----------------------------------------- | -------------------------------------------------------------------- |
| **Framework** | Next.js (React)                           | Structure, routing, and component management.                        |
| **Rendering** | HTML/CSS (Absolute/Relative Positioning)  | 2D World rendering; lightweight alternative to Canvas/WebGL.         |
| **State**     | `useReducer` / Context API                | Centralized state management for all entities (animals, structures). |
| **Animation** | `requestAnimationFrame` + CSS Transitions | Smooth, performant game loop and movement updates.                   |

## 3. Data Model (Entity State)

All elements in the farm will be represented by objects in a central state array.

```typescript
interface Entity {
  id: string; // Unique identifier
  type: 'cow' | 'chicken' | 'barn' | 'fence'; // Entity category
  x: number; // X-coordinate (e.g., 0-100% of canvas width)
  y: number; // Y-coordinate (e.g., 0-100% of canvas height)
  orientation: 'left' | 'right'; // Facing direction for sprites
  isAnimated: boolean; // True for animals/moving elements
  velocity?: number; // Movement speed (for animated entities)
}
```

## 4. Component Structure

| Component        | Role & Functionality                                                                                                                                                                                         | Dependencies                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `FarmCanvas.js`  | The World Container. Renders the background. Iterates over the global entities state and renders the appropriate child component for each entity. Crucially, it manages the requestAnimationFrame game loop. | Entity.js, StaticAsset.js     |
| `FarmEditor.js`  | The Control Panel/UI. Provides buttons to dispatch SPAWN_ANIMAL actions. (Future: Controls for moving/editing static assets).                                                                                | Global State Context/Dispatch |
| `Entity.js`      | Base Component. Renders a wrapper div with position: absolute calculated from the x and y props. Handles rendering the correct image/sprite based on type.                                                   | CSS/Spritesheets              |
| `Animal.js`      | Animated Entity. Extends Entity.js. Contains specific styling for animal sprites and handles rendering walking animation frames (if applicable).                                                             | Entity.js                     |
| `StaticAsset.js` | Fixed Entity. Renders non-moving items like the barn, fences, and chicken coop.                                                                                                                              | Entity.js                     |

## 5. Next.js Implementation Flow

### 5.1 State Management (Context / useReducer)

- Create a `FarmContext` and `useFarmState` hook.
- The `farmReducer` handles all updates: `SPAWN_ANIMAL`, `UPDATE_POSITION`, `REMOVE_ENTITY`.

### 5.2 The Game Loop (FarmCanvas.js)

```javascript
// Pseudo-code for FarmCanvas.js useEffect
useEffect(() => {
  let animationFrameId;

  const gameLoop = timestamp => {
    // 1. Calculate new positions for all entities where isAnimated = true
    const newPositions = calculateMovement(entities, timestamp);

    // 2. Dispatch a single action to update the state with all new positions
    dispatch({ type: 'UPDATE_POSITIONS', payload: newPositions });

    // 3. Queue the next frame
    animationFrameId = requestAnimationFrame(gameLoop);
  };

  requestAnimationFrame(gameLoop);

  return () => {
    // Cleanup: stop the loop when the component unmounts
    cancelAnimationFrame(animationFrameId);
  };
}, [entities, dispatch]); // Re-run if entities or dispatch changes
```

### 5.3 Spawning Logic (FarmEditor.js)

- A utility function (`Spawner.js`) defines the default parameters (velocity, sprite) for each new animal type.
- The Editor button click:
  - Calls `const newAnimal = spawnAnimal('cow');`
  - Calls `dispatch({ type: 'SPAWN_ANIMAL', payload: newAnimal });`

## 6. Extensibility Roadmap

| Phase   | Goal                                          | Implementation Detail                                                                                                |
| ------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Initial | Basic moving animals on a static farm canvas. | Implement the core state, components, and game loop.                                                                 |
| Phase 2 | Simple Editor.                                | Add controls to move Static Assets (Barn) and change animal speeds/colors via the FarmEditor.js interface.           |
| Phase 3 | Basic AI.                                     | Add pathfinding constraints (e.g., animals avoid the barn, stay within the fence bounds).                            |
| Phase 4 | 3D Migration.                                 | Switch the rendering component from HTML/CSS to Three.js/React-Three-Fiber, retaining the core state and game logic. |

---

## 🚜 Farm Tycoon Vision: Progressive Development Roadmap

This document outlines the phased development required to transition the simple interactive farm homepage into a basic resource management and simulation game, inspired by Dino Park Tycoon's core loop.

## 1. Core Simulation Vision

The game loop should eventually involve:

**Placement** (Assets, Fences) → **Maintenance** (Fences, Health) → **Resource Flow** (Spawning, Selling Produce) → **Challenge** (Escapes, Disease, Weather)

## 2. Architectural Pillars for Simulation

To support this complexity, we must introduce the following new systems:

| System                | Purpose                                                                            | Impact on Current Design                                                                          |
| --------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Grid/Coordinates**  | Defines the placement and boundaries for assets and movement.                      | Transition x, y from screen percentage to grid coordinates (e.g., 10×10 tile map).                |
| **Interaction Layer** | Handles clicks/hovers on entities for editing, info, or repair actions.            | Needs a global click handler in FarmCanvas to map screen coordinates to grid coordinates.         |
| **Logic Engine**      | Separates the movement/status calculation from the React component rendering.      | A pure JavaScript module responsible for animal AI, fence status, and resource updates.           |
| **Time/Clock**        | Required to tick the simulation and trigger time-based events (e.g., fence decay). | Implement a globally managed simulation clock (simple setInterval or requestAnimationFrame loop). |

## 3. Prioritized Feature Roadmap (MVPs)

We will break the development into three main phases:

### Phase 1: Interactive MVP (Current Focus)

**Goal:** Establish the foundation for the visual editor and animated entities.

| Feature                     | Description                                                                                                      | Technical Implementation                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| A. Entity Spawning          | Buttons in FarmEditor.js to spawn Cows and Chickens in random areas.                                             | Complete (SPAWN_ANIMAL reducer action).                                                   |
| B. Basic Movement           | Animals move randomly within the entire canvas bounds.                                                           | Complete (requestAnimationFrame game loop and UPDATE_POSITION action).                    |
| C. Isometric Display        | Use isometric sprites and layout to give the Tycoon feel.                                                        | Update CSS/Spritesheets and ensure y coordinates correctly adjust z-index for depth.      |
| D. Grid Layer               | Establish the underlying grid system (even if not visible).                                                      | Map screen positioning logic to coordinate system (e.g., Tile 0,0 to 20,20).              |
| E. Action Buttons (MVP Fix) | Add simple UI buttons to instantly "Fix" or "Cure" future problems (e.g., "Fix All Fences," "Cure All Disease"). | Simple global state actions triggered by FarmEditor buttons (no logic engine needed yet). |

### Phase 2: Editor & Placement MVP

**Goal:** Introduce player agency through placement and resource boundaries.

| Feature                     | Description                                                                                        | Technical Implementation                                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| A. Fence Placement          | The ability to click an empty grid square to place a piece of fence.                               | New state entity: Fence. New reducer action: PLACE_FENCE. Requires the Grid/Coordinates system.                                     |
| B. Terrain Editing (Simple) | Button to change a grid area from 'Pasture' to 'Pond' or 'Dirt'.                                   | New state entity: Terrain. Tiles must now render terrain type.                                                                      |
| C. Constrained Movement     | Animals must now recognize and respect fence boundaries and stay within designated Paddocks.       | Logic Engine MVP: Implement basic collision/boundary checks within the movement update function before dispatching UPDATE_POSITION. |
| D. Entity Inspection        | Clicking an animal or fence piece displays basic information (e.g., Health: 100%, Status: Normal). | Implement the Interaction Layer (map click x, y to entity ID).                                                                      |
| E. Resource: Food           | A new "Trough" asset can be placed. Animals must seek out food.                                    | New animal state: `hunger: number`. New AI goal in the Logic Engine: move toward nearest Trough if hunger > 50.                     |

### Phase 3: Simulation & Challenge MVP

**Goal:** Introduce the core challenge and resource management loop.

| Feature                  | Description                                                                                                               | Technical Implementation                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| A. Fence Decay           | Fences have a Health property that decreases over time.                                                                   | Integrate the Time/Clock system. The Logic Engine runs a check every 'game hour' to decrease fence health.                        |
| B. Animal Escape         | When a fence's health hits 0, the animal movement constraints are lifted, and the animal can exit the paddock.            | Logic Engine Update: Animals check their paddock's fence health before calculating movement.                                      |
| C. Disease State         | Animals can randomly enter a `diseased: true` state, and this state can spread to neighbors.                              | New animal state: `health: number`, `diseased: boolean`. Logic Engine Update: Implement a chance-based infection/spread function. |
| D. Editor: Repair & Cure | The user can now click a broken fence or a diseased animal and click the "Repair" or "Cure" button to restore its status. | Interaction Layer triggers a dedicated REPAIR_FENCE or CURE_ANIMAL action (replacing the MVP fix buttons).                        |
| E. Resources: Money      | Display a simple money counter. Spawning animals or placing structures costs money.                                       | New global state variable: `money: number`. New reducer actions: BUY_ENTITY, DEDUCT_MONEY.                                        |

## 4. Next Step

We have a clear path from simple interaction to complex simulation. Before moving to the advanced phases, we need to solidify the Phase 1 foundation.

**Question:** Would you like to start by focusing on Phase 1, Step C (Isometric Display), or should we define the new Grid Coordinate System first?
