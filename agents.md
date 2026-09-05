# Agents Guide — Algorithm Arena

This document is for **AI agents and human contributors** picking up work on this project. It provides everything you need to understand the codebase, find your way around, and contribute without breaking existing work.

## 1. Project Overview

Algorithm Arena is a browser-based pathfinding visualizer where users race different search algorithms against each other on a shared grid. The core architecture is:

- **Algorithm engine** (`src/algorithms/`): pure TypeScript, framework-free generator functions
- **State layer** (`src/state/`): Zustand stores for grid, agents, race, camera, presets, and menus
- **Scene layer** (`src/scene/`): React Three Fiber 3D isometric diorama with GLB models
- **UI layer** (`src/ui/`): Tailwind CSS v4 glassmorphic HUD, launcher menu, and modal screens

**Source of truth**: [`init.md`](init.md) is the original build plan. [`design.md`](design.md) has architecture details.

## 2. Current State (What's Done)

### Phase 0 — Scaffolding
- Vite 6 + React 19 + TypeScript (strict) + Tailwind CSS v4
- All dependencies installed and configured
- `npm run dev`, `npm test`, `npm run typecheck`, `npm run lint` all work cleanly

### Phase 1 — Algorithm Engine (Partial)
- **A\* Search**: Fully implemented and tested (17 tests)
- **BFS**: Fully implemented and tested (16 tests)
- **Registry**: Wired up with `implemented` flag per algorithm (10 tests)
- **Test fixtures**: 4 canonical grids with assertion helpers

### TODO — Remaining Algorithms (For Group Project)
- **Dijkstra, DFS, Greedy Best-First, Hill Climbing, Simulated Annealing**
- Each has a stub file with detailed implementation notes and interface signatures
- Stubs throw clear errors indicating they are ready for team implementation

### Phases 2-8 & Polish — Full Application Complete
- **Phase 2 (Grid & Presets)**: `gridStore.ts`, `presetStore.ts`, tool palette, drag wall painting, configurable high-cost terrain, 7 curated presets + custom map saving in `localStorage`
- **Phase 3 (3D Scene)**: `Diorama.tsx` (sandstone desert diorama), `CameraController.tsx` (pan/zoom/orbit), `Tile.tsx` (desert slabs with cost inscriptions), `Wall.tsx` (sandstone boulder monoliths), `GoalGlow.tsx` (golden altar beacon)
- **Phase 4 (Agents)**: `agentStore.ts`, `AgentPawn.tsx` (camel 3D models with team-colored saddles and non-overlapping cell clustering), `NodeOverlay`, `PathTrail`, `HeuristicRay`, `ScanReticle`
- **Phase 5 (Race Scheduler)**: `raceStore.ts`, rAF scheduler, two-phase execution (Scout exploration sweep followed by physical path runner sprint), mid-race speed controls
- **Phase 6 (Analytics)**: `Leaderboard.tsx` (live standings with distance and cost), `ResultsDashboard.tsx` (comparative stats, ranked standings, 1-click clipboard summary)
- **Phase 7 (Visual Polish & Audio)**: Web Audio API sound synthesizer (`src/utils/sound.ts`, `soundStore.ts`), global keyboard hotkeys (`useKeyboardShortcuts.ts`), player manual (`HelpModal.tsx`), Game Start Menu (`StartMenu.tsx`), Preset Chooser screen (`PresetChooserModal.tsx`, `MiniMapPreview.tsx`), Save Preset dialog (`SavePresetModal.tsx`)
- **Phase 8 (QA & Ship)**: 90 unit tests passing across 10 test files, clean typecheck, clean lint, production build verified

## 3. How to Pick Up Work

### 3.1 Implementing a TODO Algorithm

This is the most common task. Here's the step-by-step:

1. **Read the stub file** — e.g., `src/algorithms/dijkstra.ts` has implementation notes
2. **Read the reference implementations** — `astar.ts` and `bfs.ts` are the gold standard
3. **Understand the generator protocol** — see design.md §2.1 or the summary below
4. **Write the implementation** — as a generator function yielding `StepEvent`s
5. **Write tests** — copy the structure from `astar.test.ts`, test all 4 fixture grids
6. **Update the registry** — set `implemented: true` in `src/algorithms/index.ts`
7. **Update the registry test** — adjust `getImplementedAlgorithms` assertions
8. **Verify** — `npm run typecheck` + `npm test` must both pass

### 3.2 Generator Protocol Quick Reference

Every algorithm generator must:

```typescript
function* myAlgorithm(grid: GridSnapshot, config?: AlgorithmConfig): AlgorithmGenerator {
  const t0 = performance.now();
  let nodesExplored = 0;

  // Main loop
  while (/* frontier not empty */) {
    // 1. Pick next node from frontier
    // 2. Yield consider event (with heuristicTarget if algorithm uses heuristic)
    yield { kind: 'consider', node: current, heuristicTarget: grid.goal }; // or omit heuristicTarget

    // 3. Mark as visited
    nodesExplored++;
    yield { kind: 'visit', node: current };

    // 4. Check if goal reached
    if (current.x === grid.goal.x && current.y === grid.goal.y) {
      const path = reconstructPath(...);
      yield { kind: 'path', path };
      const result = { status: 'success', path, nodesExplored, timeMs: performance.now() - t0 };
      yield { kind: 'done', result };
      return result;
    }

    // 5. Expand neighbors
    yield { kind: 'frontier', nodes: newNeighbors };
    yield { kind: 'path', path: currentBestPath };
  }

  // Frontier exhausted
  const result = { status: 'failed', path: null, nodesExplored, timeMs: performance.now() - t0 };
  yield { kind: 'done', result };
  return result;
}
```

## 4. File Map

```
AlgoArena/
├── init.md                          # Original build plan (source of truth)
├── design.md                        # Architecture & design decisions
├── agents.md                        # THIS FILE — onboarding guide
├── README.md                        # Quick start & status
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json / .app.json / .node.json
├── eslint.config.js
├── index.html
└── src/
    ├── main.tsx                     # React entry point
    ├── App.tsx                      # Root component
    ├── styles.css                   # Tailwind v4 @theme tokens
    ├── vite-env.d.ts
    ├── algorithms/                  # ⭐ PURE ENGINE — no React/Three imports
    │   ├── types.ts                 # Core type definitions
    │   ├── astar.ts                 # Implemented A* Search
    │   ├── bfs.ts                   # Implemented BFS
    │   ├── dijkstra.ts              # TODO stub
    │   ├── dfs.ts                   # TODO stub
    │   ├── greedyBestFirst.ts       # TODO stub
    │   ├── hillClimbing.ts          # TODO stub
    │   ├── simulatedAnnealing.ts    # TODO stub
    │   ├── index.ts                 # Registry (ALGORITHMS map)
    │   └── __tests__/
    │       ├── fixtures.ts          # 4 canonical test grids + helpers
    │       ├── astar.test.ts        # 17 tests
    │       ├── bfs.test.ts          # 16 tests
    │       └── registry.test.ts     # 10 tests
    ├── state/                       # ⭐ Zustand stores
    │   ├── gridStore.ts             # Grid dimensions, walls, start/goal, presets
    │   ├── agentStore.ts            # Agent list, positions, overlays, and cluster offsets
    │   ├── raceStore.ts             # rAF scheduler, speed, status, two-phase runner
    │   ├── presetStore.ts           # Custom presets, localStorage CRUD, arena loader
    │   ├── gameMenuStore.ts         # Start menu, preset chooser, and save preset modal
    │   ├── soundStore.ts            # Web Audio FX toggle and volume state
    │   ├── cameraStore.ts           # Zoom controls, isometric/top-down camera states
    │   └── __tests__/
    │       ├── gridStore.test.ts    # 8 tests
    │       ├── agentStore.test.ts   # 5 tests
    │       ├── raceStore.test.ts    # 4 tests
    │       ├── cameraStore.test.ts  # 6 tests
    │       └── presetStore.test.ts  # 6 tests
    ├── scene/                       # ⭐ React Three Fiber
    │   ├── Diorama.tsx              # Main canvas + diorama pedestal + lighting
    │   ├── CameraController.tsx     # Animated camera transitions, zoom, and orientation
    │   ├── Tile.tsx                 # Grid tile mesh with soft cost inscriptions
    │   ├── Wall.tsx                 # Sandstone boulder monoliths with shadows
    │   ├── Node.tsx                 # Frontier and visited overlay markers
    │   ├── AgentPawn.tsx            # Animated camel pawns with team-colored saddles
    │   ├── PathTrail.tsx            # Emissive path line visualization
    │   ├── HeuristicRay.tsx         # Pulsing ray to heuristic target
    │   ├── GoalGlow.tsx             # Emissive pulsing goal beacon
    │   ├── ScanReticle.tsx          # Scout sweep evaluation indicator
    │   ├── SquareClusterIndicator.tsx # 4+ agent cluster overflow indicator
    │   └── clusterUtils.ts          # Non-overlapping pawn grid layout helpers
    ├── ui/                          # ⭐ Tailwind CSS Glassmorphic HUD & Menus
    │   ├── StartMenu.tsx            # Title screen launcher & game onboarding
    │   ├── PresetChooserModal.tsx   # Fullscreen preset browser with search & tabs
    │   ├── MiniMapPreview.tsx       # SVG vector thumbnail generator for presets
    │   ├── SavePresetModal.tsx      # Modal to capture & save custom maps
    │   ├── ToolPalette.tsx          # Wall/cost/eraser/start/goal tools + presets
    │   ├── GridSizeControl.tsx      # 10×10 / 20×20 / 30×30 selector
    │   ├── AgentPanel.tsx           # Add/remove agents & overlay toggles
    │   ├── SpeedSlider.tsx          # Play/pause/step & live speed slider
    │   ├── CameraControls.tsx       # Floating zoom in/out & view angle controls
    │   ├── Leaderboard.tsx          # Live ranked standings with distance & cost
    │   ├── ResultsDashboard.tsx     # Post-race comparative analytics & copy summary
    │   ├── HelpModal.tsx            # Player manual, tile rules & hotkey legend
    │   └── Hud.tsx                  # Root HUD container managing overlay layering
    ├── hooks/
    │   └── useKeyboardShortcuts.ts  # Global hotkeys listener
    ├── utils/
    │   └── sound.ts                 # Web Audio API procedural sound synthesizer
    └── maps/
        ├── presets.ts               # 7 curated challenge maps (Spiral, Oasis, etc.)
        └── __tests__/
            └── presets.test.ts      # 8 tests validating map geometry & endpoints
```

## 5. Test Fixtures Reference

All algorithms should be tested against these 4 grids (in `src/algorithms/__tests__/fixtures.ts`):

### 5.1 Open Field (5×5)
- No walls, trivial shortest path
- Expected: `status: 'success'`, path length = 9 (including start)
- All algorithms should succeed

### 5.2 Wall Detour (7×7)
- Vertical wall at x=2, y=1..4 blocks direct path
- Expected: `status: 'success'`, path goes around wall
- All algorithms should succeed

### 5.3 U-Trap (10×10)
- U-shaped wall that traps greedy local search
- Expected for A*, BFS, Dijkstra, DFS: `status: 'success'`
- Expected for Hill Climbing: `status: 'trapped'`
- Expected for Simulated Annealing: `status: 'success'` (escapes probabilistically)

### 5.4 Fully Blocked (5×5)
- Goal surrounded by walls on all 4 sides
- Expected: `status: 'failed'`, path = null
- All algorithms should report failed

## 6. Helper Functions Available

From `fixtures.ts`:
- `pathEndpoints(path, start, goal)` — validates start/end of path
- `pathIsContiguous(path)` — checks each step is one cardinal move
- `pathAvoidsWalls(path, walls)` — ensures path doesn't cross walls
- `runToCompletion(gen)` — exhausts a generator, returns `{events, result}`

## 7. Common Patterns

### Encoding Points as Map/Set Keys
```typescript
function key(p: Point): string {
  return `${p.x},${p.y}`;
}
```

### Getting Walkable Neighbors
```typescript
const DIRS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];

function neighbors(p: Point, grid: GridSnapshot): Point[] {
  return DIRS
    .map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(n =>
      n.x >= 0 && n.x < grid.width &&
      n.y >= 0 && n.y < grid.height &&
      !grid.walls.has(`${n.x},${n.y}`)
    );
}
```

### Reconstructing a Path
```typescript
function reconstructPath(cameFrom: Map<string, Point>, current: Point): Point[] {
  const path = [current];
  let k = key(current);
  while (cameFrom.has(k)) {
    const prev = cameFrom.get(k)!;
    path.unshift(prev);
    k = key(prev);
  }
  return path;
}
```

## 8. Verification Checklist

Before committing, always run:

```bash
npm run typecheck   # Must exit 0 (no TypeScript errors)
npm test            # Must exit 0 (all 90 tests pass)
npm run lint        # Must exit 0 (no lint errors)
npm run build       # Must exit 0 (production build verified)
```

## 9. Rules (Non-Negotiable)

1. **No `any`** — TypeScript strict mode. Fix types, don't escape them.
2. **No inline lint suppression** — `// eslint-disable` and `// @ts-ignore` are banned.
3. **Algorithm isolation** — `src/algorithms/` must never import from `scene/`, `ui/`, or `state/`.
4. **Test with implementation** — every algorithm gets tests in the same phase.
5. **No AI Slop / Emojis** — Use crisp typographic indicators (`#1`, `#2`) and clean Lucide SVG icons.
6. **Don't break existing tests** — 90 tests currently pass. They must continue to pass.
