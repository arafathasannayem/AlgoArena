# Design Document — Algorithm Arena

This document captures the architecture, design decisions, and conventions for the Algorithm Arena project. It serves as the single source of truth for how the codebase is structured and why.

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client-Only)                 │
├─────────────┬───────────────────────────┬───────────────┤
│   UI Layer  │      Scene Layer          │  State Layer  │
│  (Tailwind) │  (React Three Fiber)      │   (Zustand)   │
├─────────────┴───────────────────────────┴───────────────┤
│                  Algorithm Engine                        │
│              (Pure TypeScript, no framework deps)        │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Directory | Responsibility | Dependencies |
|-------|-----------|---------------|-------------|
| **Algorithm Engine** | `src/algorithms/` | Pure pathfinding logic. Generator-based. Framework-agnostic. | None (stdlib only) |
| **State** | `src/state/` | Zustand stores for grid, agents, race orchestration, presets, menus. | Algorithm Engine |
| **Scene** | `src/scene/` | React Three Fiber 3D rendering — diorama, tiles, walls, pawns, reticles. | State, Three.js |
| **UI** | `src/ui/` | Tailwind CSS overlay — HUD panels, Start Menu, Preset Chooser, Dashboard. | State |

### Critical Boundary

> **`src/algorithms/` must NEVER import from `scene/`, `ui/`, or `state/`.**
>
> This boundary ensures the algorithm engine is testable in pure Node.js/Vitest
> without a browser, DOM, or WebGL context. If you find yourself needing a
> React/Three type in an algorithm file, the interface in `types.ts` is wrong —
> fix the interface, don't break the boundary.

## 2. Algorithm Engine Design

### 2.1 Generator Protocol

Every algorithm is implemented as a **TypeScript generator function** that:
- **Yields** `StepEvent` objects (one per visualization "tick")
- **Returns** an `AlgorithmResult` when done

This design lets the race scheduler advance N agents independently at a shared, slider-controlled pace. The scheduler calls `.next()` on each generator once per tick.

```typescript
function* myAlgorithm(grid: GridSnapshot): AlgorithmGenerator {
  // 1. Initialize data structures
  // 2. Main loop:
  while (frontier is not empty) {
    yield { kind: 'consider', node: current };       // UI shows "evaluating this"
    yield { kind: 'visit', node: current };           // UI marks as explored
    yield { kind: 'frontier', nodes: newNeighbors };  // UI highlights open set
    yield { kind: 'path', path: bestSoFar };          // UI draws trail
  }
  // 3. Terminal event:
  yield { kind: 'done', result };
  return result;
}
```

### 2.2 Step Event Types

| Event | Purpose | When |
|-------|---------|------|
| `consider` | Show which node is being evaluated | Before expanding a node |
| `visit` | Mark a node as officially explored | After consider, before neighbors |
| `frontier` | Show the current open set / queue | After expanding neighbors |
| `path` | Show the current best-known path | After each expansion |
| `done` | Signal algorithm termination | Final event, carries result |

### 2.3 Algorithm Result Statuses

| Status | Meaning | Used By |
|--------|---------|---------|
| `success` | Path found from start to goal | All algorithms |
| `failed` | Goal is unreachable (frontier/queue exhausted) | All algorithms |
| `trapped` | Stuck in local optimum, neighbors exist but none improve | Hill Climbing |

### 2.4 Implemented Algorithms

#### A* Search (`src/algorithms/astar.ts`)
- **Strategy**: f(n) = g(n) + h(n) with Manhattan distance heuristic
- **Data structure**: Custom binary min-heap (no external deps)
- **Optimality**: Guaranteed (Manhattan is admissible for 4-dir grids)
- **heuristicTarget**: Always set to goal
- **Key detail**: Uses a closed set to skip duplicate heap entries

#### BFS (`src/algorithms/bfs.ts`)
- **Strategy**: Level-order FIFO queue, unweighted
- **Data structure**: Array with shift/push (fine for ≤900 cells)
- **Optimality**: Guaranteed for unweighted grids
- **heuristicTarget**: Never set (no heuristic)
- **Key detail**: Visited set prevents re-enqueueing

### 2.5 TODO Algorithms

| Algorithm | Key Difference from A* | Special Behavior |
|-----------|----------------------|-----------------|
| **Dijkstra** | h(n) = 0 always | Uniform-cost, no heuristic target |
| **DFS** | LIFO stack instead of priority queue | Not optimal, may find long paths |
| **Greedy Best-First** | Ordered by h(n) only, no g(n) | Fast but not optimal |
| **Hill Climbing** | No backtracking, greedy local | Must report `trapped` status |
| **Simulated Annealing** | Probabilistic worse-move acceptance | Must escape U-trap; uses config knobs |

## 3. Type System

### 3.1 Core Types (in `src/algorithms/types.ts`)

```
Point ──────────── {x, y} grid coordinate
GridSnapshot ───── Immutable grid state given to algorithms
StepEvent ──────── Discriminated union of visualization events
AlgorithmResult ── Final outcome (status, path, stats)
AlgorithmGenerator  Generator<StepEvent, AlgorithmResult, void>
AlgorithmConfig ── Per-algorithm numeric knobs
AlgorithmFactory ── (grid, config?) => AlgorithmGenerator
```

### 3.2 Registry Entry (in `src/algorithms/index.ts`)

```typescript
interface AlgorithmEntry {
  label: string;        // "A*", "BFS", etc.
  color: string;        // Hex color for pawn/overlays
  factory: AlgorithmFactory;
  implemented: boolean; // true = functional, false = throws
}
```

## 4. State Management

Zustand stores structured by domain:

| Store | Owns | Persistence |
|-------|------|-------------|
| `gridStore` | Dimensions, walls, start/goal, active tool, terrain costs | In-memory / presets |
| `agentStore` | Agent list, colors, visited nodes, live path, cluster offsets | In-memory |
| `raceStore` | Generator instances, rAF scheduler, mid-race speed, race status | In-memory |
| `presetStore` | Official presets, custom map saving & deletion, arena loader | `localStorage` |
| `gameMenuStore` | Start Menu launcher, Preset Chooser modal, Save Preset modal | In-memory |
| `soundStore` | Procedural Web Audio FX enable/mute state | In-memory |
| `cameraStore` | Orthographic zoom, reset isometric angle, top-down 2D preset | In-memory |

## 5. Scene Architecture

The scene uses React Three Fiber with an **orthographic camera** and tabletop desert aesthetics:
- **Diorama Pedestal**: Beveled sandstone slab pedestal grounding the board.
- **Lighting**: Soft directional sunlight with shadow maps + ambient fill light.
- **Camera Navigation**: Smooth animated transitions between isometric perspective (~35.264° tilt, 45° rotation) and Top-Down 2D view, with zoom controls.
- **Desert 3D Assets**:
  - Wall Monoliths: 3D sandstone boulder clusters (`sandstone-boulder.glb`).
  - Rough Terrain: Desert scrub vegetation with configurable traversal cost (`desert-scrub.glb`).
  - Agents: Animated camel figurines with team saddle colors (`camel.glb`) and local Draco decompression.
- **Agent Dynamics & Anti-Overlap**:
  - Non-overlapping pawn grid layout via `clusterUtils.ts` when multiple agents occupy the same tile.
  - Two-phase execution: Search sweep phase (frontier reticle sweeps grid without pawn teleporting over walls) followed by smooth physical path runner sprint.

## 6. UI Architecture

Glassmorphism floating panels with a restrained, minimal color guideline (no AI slop, no emojis, no artificial gradients):
- **Start Menu (`StartMenu.tsx`)**: Game launcher onboarding card offering Quick Match, Map Preset Browser, Sandbox mode, and Manual.
- **Preset Chooser (`PresetChooserModal.tsx`)**: Real-time vector SVG mini-map browser for 7 curated challenges and custom user maps.
- **Save Preset Modal (`SavePresetModal.tsx`)**: Capture active grid walls, dimensions, and costs to browser `localStorage`.
- **Toolbox (`ToolPalette.tsx`)**: Draggable tool window for walls, eraser, high-cost terrain, and start/goal points. Automatically hidden during active races to maintain an unobstructed view.
- **Grid Size Selector (`GridSizeControl.tsx`)**: 10×10, 20×20, 30×30 grid chooser, automatically hidden during active races.
- **Agent Panel (`AgentPanel.tsx`)**: Add/remove agents and toggle visualization overlays.
- **Speed Slider (`SpeedSlider.tsx`)**: Play/pause/step playback bar with fine slider and quick multipliers (0.5x, 1x, 2x, 5x, MAX).
- **Leaderboard (`Leaderboard.tsx`)**: Live ranked standings showing goal distance, explored count, and path cost.
- **Results Dashboard (`ResultsDashboard.tsx`)**: Post-race analytics table with 1-click clipboard summary export.
- **Player Guide (`HelpModal.tsx`)**: In-game manual with tile mechanics, algorithm traits, and keyboard hotkeys.

## 7. Testing Strategy

### Test Suites (Vitest)
- Total tests: **90 unit tests** across 10 test suites.
- Coverage:
  - Algorithm engine (`astar.test.ts`, `bfs.test.ts`, `registry.test.ts`): 43 tests
  - Grid and map presets (`gridStore.test.ts`, `presets.test.ts`): 16 tests
  - Custom preset persistence (`presetStore.test.ts`): 6 tests
  - Agent and cluster mechanics (`agentStore.test.ts`, `clusterUtils.test.ts`): 11 tests
  - Race scheduler (`raceStore.test.ts`): 4 tests
  - Camera navigation (`cameraStore.test.ts`): 6 tests
- Fixtures: 4 canonical test grids + assertion helpers in `src/algorithms/__tests__/fixtures.ts`.

## 8. Conventions

### Code Style
- **No `any`** — TypeScript strict mode strictly enforced.
- **No inline lint suppression** — All ESLint rules adhered to without exception.
- **No Emojis or AI Slop** — Monospace typographic indicators (`#1`, `#2`) and clean Lucide SVG icons.
- **Algorithm isolation** — `src/algorithms/` must never import from `scene/`, `ui/`, or `state/`.
