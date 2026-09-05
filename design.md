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
| **State** | `src/state/` | Zustand stores for grid, agents, race orchestration. | Algorithm Engine |
| **Scene** | `src/scene/` | React Three Fiber 3D rendering — diorama, tiles, walls, pawns. | State, Three.js |
| **UI** | `src/ui/` | Tailwind CSS overlay — HUD panels, controls, leaderboard. | State |

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
// Simplified flow:
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

Each stub file contains detailed implementation notes. Summary:

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

Helper functions:
- `getImplementedAlgorithms()` — for UI dropdowns (only show working ones)
- `getTodoAlgorithms()` — for progress tracking

## 4. State Management (TODO — Phase 2-5)

Three Zustand stores, each owning a distinct domain:

| Store | Owns | Phase |
|-------|------|-------|
| `gridStore` | Grid dimensions, walls, start/goal | Phase 2 |
| `agentStore` | Agent list, algorithm assignment, viz state | Phase 4 |
| `raceStore` | Generator instances, scheduler, speed | Phase 5 |

See the stub files in `src/state/` for detailed interface specs.

## 5. Scene Architecture (TODO — Phase 3-4)

The scene uses React Three Fiber with an **orthographic camera** at true isometric angle:
- Tilt: ~35.264°
- Rotation: 45°
- No orbit controls

Component hierarchy:
```
<Canvas>
  <OrthographicCamera />
  <DirectionalLight />   (sun, casts shadows)
  <AmbientLight />       (soft fill)
  <group>                (grid container)
    {tiles.map(Tile)}
    {walls.map(Wall)}    (raised 3D blocks)
    <GoalGlow />         (emissive pulse at goal)
    {agents.map(AgentPawn)}
    {agents.map(PathTrail)}
    {agents.map(HeuristicRay)}
  </group>
</Canvas>
```

## 6. UI Architecture (TODO — Phase 2-7)

Glassmorphism floating panels, edge-anchored:
- **Left/Bottom**: Tool palette (wall/start/end tools)
- **Top-left**: Leaderboard
- **Bottom-right**: Speed slider
- **Center overlay** (post-race): Results dashboard

Style tokens defined in `src/styles.css` via Tailwind v4 `@theme`:
- `--color-glass-bg`: rgba(15, 23, 42, 0.65)
- `--color-glass-border`: rgba(255, 255, 255, 0.12)
- Backdrop blur via `backdrop-blur-md`

## 7. Testing Strategy

### Unit Tests (Vitest)
- **Scope**: Algorithm engine only (pure logic, no DOM/WebGL)
- **Fixtures**: 4 canonical grids in `src/algorithms/__tests__/fixtures.ts`
  - Open field (5×5, no walls)
  - Wall detour (7×7, wall blocks direct path)
  - U-trap (10×10, concave wall traps greedy algorithms)
  - Fully blocked (5×5, goal surrounded by walls)
- **Assertions**: Path validity (contiguous, avoids walls, correct endpoints), status correctness, generator protocol compliance

### Adding Tests for New Algorithms

When implementing a new algorithm:
1. Create `src/algorithms/__tests__/<name>.test.ts`
2. Import the 4 fixtures from `fixtures.ts`
3. Test all 4 grids + generator protocol + any algorithm-specific behavior
4. Use the `pathEndpoints`, `pathIsContiguous`, `pathAvoidsWalls` helpers

## 8. Conventions

### Code Style
- **No `any`** — ever. Fix the types instead.
- **No inline lint suppression** — if it doesn't compile, fix the code.
- Strict TypeScript: `strict: true`, `noUncheckedIndexedAccess: true`

### Commit Messages
- Format: `phase N: <summary>`
- One commit per completed phase
- Don't commit mid-phase with broken tests

### Dependencies
- Smallest dependency that does the job
- The algorithm engine uses zero external deps (custom min-heap)
- Don't add packages without a stated reason

### File Naming
- Algorithms: `camelCase.ts` (e.g., `greedyBestFirst.ts`)
- Components: `PascalCase.tsx` (e.g., `AgentPawn.tsx`)
- Stores: `camelCase.ts` (e.g., `gridStore.ts`)
- Tests: `<name>.test.ts` in `__tests__/` directories
