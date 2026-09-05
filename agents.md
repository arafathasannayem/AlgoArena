# Agents Guide — Algorithm Arena

This document is for **AI agents and human contributors** picking up work on this project. It provides everything you need to understand the codebase, find your way around, and contribute without breaking existing work.

## 1. Project Overview

Algorithm Arena is a browser-based pathfinding visualizer where users race different search algorithms against each other on a shared grid. The core architecture is:

- **Algorithm engine** (pure TypeScript, framework-free) — the only part currently implemented
- **State layer** (Zustand) — TODO
- **Scene layer** (React Three Fiber) — TODO
- **UI layer** (Tailwind CSS) — TODO

**Source of truth**: [`init.md`](init.md) is the original build plan. [`design.md`](design.md) has architecture details.

## 2. Current State (What's Done)

### ✅ Phase 0 — Scaffolding
- Vite 6 + React 19 + TypeScript (strict) + Tailwind CSS v4
- All dependencies installed and configured
- `npm run dev`, `npm test`, `npm run typecheck` all work

### ✅ Phase 1 — Algorithm Engine (Partial)
- **A\* Search**: Fully implemented and tested (17 tests)
- **BFS**: Fully implemented and tested (16 tests)
- **Registry**: Wired up with `implemented` flag per algorithm (10 tests)
- **Test fixtures**: 4 canonical grids with assertion helpers

### 🚧 TODO — Remaining Algorithms (For Group Project)
- **Dijkstra, DFS, Greedy Best-First, Hill Climbing, Simulated Annealing**
- Each has a stub file with detailed implementation notes and interface signatures
- Stubs throw clear errors indicating they are ready for team implementation

### ✅ Phases 2-8 — Full Application Complete
- **Phase 2 (Grid & Presets)**: `gridStore.ts`, tool palette, drag wall painting, 3 presets (7 tests)
- **Phase 3 (3D Scene)**: `Diorama.tsx`, `IsometricCamera`, `Tile.tsx`, `Wall.tsx`, `GoalGlow.tsx`
- **Phase 4 (Agents)**: `agentStore.ts`, `AgentPawn.tsx` (spring lerp), `NodeOverlay`, `PathTrail`, `HeuristicRay` (5 tests)
- **Phase 5 (Race Scheduler)**: `raceStore.ts`, rAF scheduler, mid-race speed slider (4 tests)
- **Phase 6 (Analytics)**: `Leaderboard.tsx` (live standings), `ResultsDashboard.tsx` (comparative stats)
- **Phase 7 (Visual Polish)**: Glassmorphism HUD overlay, edge-anchored panels, tactile theme
- **Phase 8 (QA & Ship)**: 59 tests passing, clean typecheck, clean lint, production build verified

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
    if (current === goal) {
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

### 3.3 Working on Phases 2-8

Each phase builds on the previous. **Do not skip phases.** Read `init.md` §4 for detailed phase specs. Key constraints:

- **Phase 2** (Grid): Zustand store + click-drag wall painting + presets
- **Phase 3** (Scene): R3F orthographic camera at isometric angle, wall blocks with shadows
- **Phase 4** (Agents): Agent store, pawn meshes, per-agent visualization overlay
- **Phase 5** (Race): Single scheduler advancing all generators, speed slider
- **Phase 6** (Analytics): Live leaderboard + post-race dashboard
- **Phase 7** (Polish): Glassmorphism HUD, shadow tuning, style guide compliance
- **Phase 8** (QA): Cross-test all combos, perf check at 30×30, production build

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
    ├── App.tsx                      # Root component (placeholder)
    ├── styles.css                   # Tailwind v4 @theme tokens
    ├── vite-env.d.ts
    ├── algorithms/                  # ⭐ PURE ENGINE — no React/Three imports
    │   ├── types.ts                 # Core type definitions
    │   ├── astar.ts                 # ✅ A* Search
    │   ├── bfs.ts                   # ✅ BFS
    │   ├── dijkstra.ts              # 🚧 TODO stub
    │   ├── dfs.ts                   # 🚧 TODO stub
    │   ├── greedyBestFirst.ts       # 🚧 TODO stub
    │   ├── hillClimbing.ts          # 🚧 TODO stub
    │   ├── simulatedAnnealing.ts    # 🚧 TODO stub
    │   ├── index.ts                 # Registry (ALGORITHMS map)
    │   └── __tests__/
    │       ├── fixtures.ts          # 4 canonical test grids + helpers
    │       ├── astar.test.ts        # 17 tests
    │       ├── bfs.test.ts          # 16 tests
    │       └── registry.test.ts     # 10 tests
    ├── state/                       # ⭐ Zustand stores
    │   ├── gridStore.ts             # ✅ Grid dimensions, walls, start/goal, presets
    │   ├── agentStore.ts            # ✅ Agent list & visualization state
    │   └── raceStore.ts             # ✅ rAF scheduler, speed, status
    ├── scene/                       # ⭐ React Three Fiber
    │   ├── Diorama.tsx              # ✅ Main canvas + orthographic camera
    │   ├── Tile.tsx                 # ✅ Grid tile mesh
    │   ├── Wall.tsx                 # ✅ Raised 3D wall block with shadow
    │   ├── Node.tsx                 # ✅ Frontier/visited overlay
    │   ├── AgentPawn.tsx            # ✅ Animated pawn mesh (spring lerp)
    │   ├── PathTrail.tsx            # ✅ Emissive path visualization
    │   ├── HeuristicRay.tsx         # ✅ Pulsing ray to heuristic target
    │   └── GoalGlow.tsx             # ✅ Emissive pulsing goal beacon
    ├── ui/                          # ⭐ Tailwind CSS Glassmorphic HUD
    │   ├── ToolPalette.tsx          # ✅ Wall/eraser/start/goal tools + presets
    │   ├── GridSizeControl.tsx      # ✅ 10×10 / 20×20 / 30×30 selector
    │   ├── AgentPanel.tsx           # ✅ Add/remove agents & overlay toggles
    │   ├── SpeedSlider.tsx          # ✅ Play/pause/step & live speed slider
    │   ├── Leaderboard.tsx          # ✅ Live ranked standings
    │   ├── ResultsDashboard.tsx     # ✅ Post-race comparative results
    │   └── Hud.tsx                  # ✅ HUD container
    └── maps/
        └── presets.ts               # ✅ The Spiral, Local Maxima Trap, Chokepoints
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
npm test            # Must exit 0 (all tests pass)
npm run lint        # Should exit 0 (no lint errors)
```

## 9. Rules (Non-Negotiable)

1. **No `any`** — TypeScript strict mode. Fix types, don't escape them.
2. **No inline lint suppression** — `// eslint-disable` and `// @ts-ignore` are banned.
3. **Algorithm isolation** — `src/algorithms/` must never import from `scene/`, `ui/`, or `state/`.
4. **Test with implementation** — every algorithm gets tests in the same phase.
5. **One commit per phase** — message format: `phase N: <summary>`.
6. **Don't break existing tests** — 43 tests currently pass. They must continue to pass.

## 10. FAQ

**Q: Can I extract the MinHeap from astar.ts into a shared utility?**
A: Yes, if another algorithm needs it. Put it in `src/algorithms/utils.ts`. Keep it in the `algorithms/` directory — no framework deps.

**Q: Should DFS path be optimal?**
A: No. DFS explicitly finds *a* path, not the shortest. The test should verify the path is valid (contiguous, avoids walls) but not assert it's optimal.

**Q: How does Hill Climbing differ from Greedy Best-First?**
A: Hill Climbing has **no backtracking** — it only looks at immediate neighbors and picks the best. If no neighbor improves the heuristic, it's `trapped`. Greedy Best-First uses a priority queue and can explore other branches.

**Q: What config knobs does Simulated Annealing need?**
A: `initialTemp` (default 100) and `coolingRate` (default 0.995). Read from `AlgorithmConfig`. The acceptance probability for worse moves is `P = e^(-ΔE / T)`.

**Q: Can I use diagonal movement?**
A: No. All algorithms use 4-directional cardinal movement only. The `neighbors()` helper uses `DIRS = [{0,-1}, {1,0}, {0,1}, {-1,0}]`.
