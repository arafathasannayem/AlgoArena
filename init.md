# Algorithm Arena — Build Plan

You are an autonomous coding agent. Build this project end-to-end, phase by phase, in order. Do not skip ahead or merge phases. After each phase: run typecheck + lint + tests, fix failures before moving on, then commit with message `phase N: <summary>`. If a phase's acceptance criteria can't be met without a design decision not covered here, stop and ask — don't silently improvise around it.

## 0. What this is

A browser-based, isometric-diorama pathfinding visualizer. Users paint a maze on a grid, drop one or more agents on it, assign each a different search algorithm (A*, Dijkstra, BFS, DFS, Greedy Best-First, Hill Climbing, Simulated Annealing), and race them concurrently while watching each one's search process (frontier, visited nodes, heuristic target, live path) in a *Hitman GO*-style isometric tabletop scene. A dashboard reports nodes explored, path length, time, and success/failure per agent.

Full design reference: the attached GDD (`Algorithm Arena: Game Design Document`). This file translates that GDD into a build order — treat the GDD as the source of truth for anything ambiguous here.

## 1. Tech stack (do not substitute without a stated reason)

- **Vite 6** + **React 19** + **TypeScript** (strict mode on) — client-only app, no SSR/backend needed, so skip Next.js/Nuxt-style frameworks in favor of a leaner dev loop.
- **@react-three/fiber v9** + **@react-three/drei** + **three.js** (latest) — the diorama renderer. v9 is the React-19-compatible line; do not install v8.
- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin. v4 has no `tailwind.config.js` — theme tokens (colors, fonts, radii) go in a `@theme` block inside your main CSS file via `@import "tailwindcss";`. Do not write v3-style config.
- **Zustand** for app state (grid, agents, race status, playback speed).
- **@react-spring/three** for agent movement/camera easing.
- **lucide-react** for all icons.
- **Vitest** for unit tests (algorithm engine primarily).
- Deploy target: static build (`vite build`) to Vercel/Netlify — no server component.

## 2. Folder structure

```
src/
  algorithms/           # pure, framework-agnostic. no React/Three imports here.
    types.ts            # shared interfaces (see §3)
    astar.ts
    dijkstra.ts
    bfs.ts
    dfs.ts
    greedyBestFirst.ts
    hillClimbing.ts
    simulatedAnnealing.ts
    index.ts            # registry: name -> generator factory
    __tests__/
  state/
    gridStore.ts         # grid size, walls, start/end tiles
    agentStore.ts         # agents: id, algorithm, color, position, status, stats
    raceStore.ts          # race status, playback speed, tick scheduler
  scene/                  # all React Three Fiber
    Diorama.tsx           # Canvas, orthographic camera, lighting rig
    Tile.tsx
    Wall.tsx
    Node.tsx
    AgentPawn.tsx
    PathTrail.tsx
    HeuristicRay.tsx
    GoalGlow.tsx
  ui/                     # all Tailwind/HTML overlay, glassmorphism
    ToolPalette.tsx
    GridSizeControl.tsx
    AgentPanel.tsx
    SpeedSlider.tsx
    Leaderboard.tsx
    ResultsDashboard.tsx
    Hud.tsx
  maps/
    presets.ts            # "The Spiral", "Local Maxima Trap", etc.
  App.tsx
  main.tsx
  styles.css               # @import "tailwindcss"; + @theme tokens
```

## 3. Shared types (write this first, exactly — everything else depends on it)

```ts
// src/algorithms/types.ts

export interface Point { x: number; y: number }

export interface GridSnapshot {
  width: number
  height: number
  walls: Set<string>       // "x,y" keys
  start: Point
  goal: Point
}

export type StepEvent =
  | { kind: 'visit'; node: Point }
  | { kind: 'frontier'; nodes: Point[] }
  | { kind: 'consider'; node: Point; heuristicTarget?: Point }
  | { kind: 'path'; path: Point[] }              // current best-known path, may change
  | { kind: 'done'; result: AlgorithmResult }

export interface AlgorithmResult {
  status: 'success' | 'failed' | 'trapped'
  path: Point[] | null
  nodesExplored: number
  timeMs: number
}

// Every algorithm is a generator: yields one StepEvent per "tick" of visualization,
// and returns the final AlgorithmResult. This is what lets the scheduler advance
// N agents independently at a shared, slider-controlled pace.
export type AlgorithmGenerator = Generator<StepEvent, AlgorithmResult, void>

export interface AlgorithmConfig {
  // per-algorithm knobs, e.g. simulated annealing's initial temperature / cooling rate
  [key: string]: number | undefined
}

export type AlgorithmFactory = (grid: GridSnapshot, config?: AlgorithmConfig) => AlgorithmGenerator
```

Registry pattern (`src/algorithms/index.ts`) maps a display name + pawn color to a factory, so the UI dropdown and the scheduler both read from one place:

```ts
export const ALGORITHMS: Record<string, { label: string; color: string; factory: AlgorithmFactory }> = {
  astar: { label: 'A*', color: '#3b82f6', factory: aStarSearch },
  dijkstra: { label: "Dijkstra's", color: '#22c55e', factory: dijkstra },
  bfs: { label: 'BFS', color: '#eab308', factory: breadthFirstSearch },
  dfs: { label: 'DFS', color: '#a855f7', factory: depthFirstSearch },
  greedy: { label: 'Greedy Best-First', color: '#f97316', factory: greedyBestFirst },
  hillclimb: { label: 'Hill Climbing', color: '#ef4444', factory: hillClimbing },
  annealing: { label: 'Simulated Annealing', color: '#14b8a6', factory: simulatedAnnealing },
}
```

## 4. Build phases

### Phase 0 — Scaffolding
- `npm create vite@latest` (react-ts template), add Tailwind v4 via `@tailwindcss/vite`, set up `@theme` tokens for the palette in §6.
- Install: `three @react-three/fiber @react-three/drei @react-spring/three zustand lucide-react`, plus `vitest @testing-library/react` as dev deps.
- Configure `tsconfig.json` strict mode (`strict: true`, `noUncheckedIndexedAccess: true`). No `any` anywhere in the codebase — this is a hard rule, not a suggestion.
- **Acceptance:** `npm run dev` shows a blank canvas; `npm run typecheck`, `npm run lint`, `npm test` all pass on the empty scaffold.

### Phase 1 — Algorithm engine (build and test this before any rendering)
- Implement all 7 generators in `src/algorithms/` against the `AlgorithmGenerator` interface in §3. Use the GDD's abstracts as the spec:
  - **A\***: `f(n) = g(n) + h(n)`, Manhattan/Euclidean heuristic, yield `consider` with `heuristicTarget` set to the goal on each expansion.
  - **Dijkstra**: uniform-cost, no heuristic — never set `heuristicTarget`.
  - **BFS**: FIFO frontier, unweighted.
  - **DFS**: LIFO frontier/stack, explicitly not optimal — result may report a longer-than-necessary path.
  - **Greedy Best-First**: expands by `h(n)` only, no `g(n)`.
  - **Hill Climbing**: greedy local search; must be able to terminate in a `trapped` status (not `failed`) when no neighbor improves on the current heuristic distance — this is what produces the "halts at a U-shaped wall" behavior in the GDD.
  - **Simulated Annealing**: needs a temperature schedule in `AlgorithmConfig` (`initialTemp`, `coolingRate`); must be able to accept a worse move probabilistically (`P = e^(-ΔE / T)`) to escape the same trap Hill Climbing fails on.
- Each generator must yield `visit`/`frontier`/`consider` events fine-grained enough that the UI can highlight "which nodes have been evaluated" and "where the heuristic is pointing" per the GDD's 2.2 user story — don't just yield the final path.
- Write Vitest unit tests per algorithm covering: a clear path, a fully blocked goal (`failed`), and the U-shaped trap (`trapped` for Hill Climbing, `success` for Simulated Annealing given enough iterations).
- **Acceptance:** all 7 algorithms pass unit tests against at least 3 shared fixture grids (open field, wall detour, U-trap) with no rendering code involved at all.

### Phase 2 — Grid state + map builder (no 3D yet, plain DOM/2D is fine for this phase's dev/testing, but wire it to the real store)
- `gridStore.ts`: width/height (10x10 / 20x20 / 30x30 selectable), `walls: Set<string>`, `start`/`goal` points, `clearGrid()`.
- Tool palette: Start Point / End Point / Wall tools; click-and-drag continuous wall painting (track pointer-down → pointer-move → pointer-up, paint every cell crossed, not just clicked).
- Map presets from the GDD ("The Spiral", "Local Maxima Trap") stored as static wall-sets in `src/maps/presets.ts`, loadable from a dropdown.
- **Acceptance:** can paint/erase walls by dragging, switch grid size (grid clears on resize), load a preset, and hit "Clear Grid".

### Phase 3 — Isometric diorama scene
- `Diorama.tsx`: R3F `<Canvas>` with an **orthographic camera** at the isometric angle (~35.264° tilt, 45° rotation — true isometric, not "2.5D" dimetric unless you deliberately choose that look).
- Render the grid as `Tile` components; walls as `Wall` (raised block geometry, not just colored tiles — GDD explicitly wants "physical weight" — concrete/wood/hedge material variants are a nice-to-have, but at minimum walls must be a distinct 3D volume, not a flat texture).
- Baked-feel lighting: one directional "sun" light + soft ambient fill + shadow-mapping enabled on the renderer; keep it static (no dynamic day/night), matching the GDD's "baked-in, dramatic lighting."
- `GoalGlow.tsx`: emissive material or point light pulsing softly at the goal tile.
- **Acceptance:** the grid from Phase 2 renders as a 3D isometric diorama; walls read as physical blocks with shadows; goal tile visibly glows.

### Phase 4 — Agents
- `agentStore.ts`: list of agents, each `{ id, algorithmKey, color (from ALGORITHMS registry), position, status: 'idle'|'running'|'done', result?: AlgorithmResult }`.
- "Add Agent" UI + algorithm dropdown (sourced from the `ALGORITHMS` registry so colors/labels never drift out of sync between UI and engine).
- `AgentPawn.tsx`: low-poly pawn mesh, colored per its assigned algorithm, animated position via `@react-spring/three` so movement between grid steps is a smooth lerp, not a teleport.
- On click, an agent shows its live visualization overlay: frontier nodes highlighted, a `HeuristicRay` line toward its `heuristicTarget` (only when the algorithm sets one), and its currently-considered path traced via `PathTrail`.
- **Acceptance:** can spawn 2+ agents on the same map with different algorithms; clicking one toggles its visualization overlay without affecting the others.

### Phase 5 — Race orchestration
- `raceStore.ts`: owns one `AlgorithmGenerator` instance per agent (created from the registry factory + current `GridSnapshot` on "Start Race"), plus `speed` (delay-per-step, controlled by a slider) and `status`.
- A single scheduler (interval or `requestAnimationFrame`-driven accumulator, not one `setInterval` per agent) advances every running agent's generator once per tick at the current speed, applies the `StepEvent` to that agent's rendering state, and stops that agent when its generator returns `done`.
- Speed slider must be adjustable mid-race without restarting agents already in progress.
- "Start Race" is disabled until at least one agent has been placed and the grid has a valid start+goal.
- **Acceptance:** hitting "Start Race" runs all placed agents concurrently and visibly at independent progress; the speed slider changes pace live; each agent stops and flips to `done` on reaching/failing to reach the goal.

### Phase 6 — Analytics
- `Leaderboard.tsx`: live-updating, sorted by nodes explored or proximity-to-goal (pick one primary sort and label it) — updates every tick while the race runs, in the top-left per the GDD's HUD layout.
- `ResultsDashboard.tsx`: appears once all agents reach `done`; per agent shows Execution Time, Nodes Explored, Path Length, Status (`success` / `failed` / `trapped`).
- **Acceptance:** leaderboard updates in real time during a race; full dashboard appears after the last agent finishes, with correct per-algorithm numbers (spot-check against the Phase 1 fixture results).

### Phase 7 — Visual polish pass
- Apply the style guide in §6 to every HUD component: floating panels at screen edges, glassmorphism (translucent + backdrop-blur), Inter or Roboto typography, high-contrast text.
- Confirm the diorama itself stays uncluttered by UI — HUD must never overlap the board at default viewport sizes.
- Tune shadow softness, ambient occlusion (if using `drei`'s `<AccumulativeShadows>` or similar), and the goal glow intensity so the board reads as a tangible object, not a flat game board.
- **Acceptance:** side-by-side against the GDD's §3 (Art & UI Style) — isometric tabletop with physical walls, minimalist floating glass HUD, no visual regression from earlier phases.

### Phase 8 — QA and ship
- Cross-check all 3 map presets at all 3 grid sizes with all 7 algorithms at least once each.
- Performance check at 30x30 with 4+ concurrent agents — if frame rate drops, instance the wall/tile geometry (`InstancedMesh`) rather than one mesh per cell.
- `vite build`, verify the static output runs correctly when served (no dev-only assumptions leaking in), deploy.
- **Acceptance:** no console errors, no dropped frames at 30x30/4-agent race, typecheck/lint/tests all green, production build deploys and runs identically to dev.

## 5. Working agreement for the agent

- Algorithms in `src/algorithms/` must never import from `scene/` or `ui/` — keep the engine testable in isolation. If you find yourself wanting to import a React/Three type there, that's a sign the interface in §3 is wrong; fix the interface, don't break the boundary.
- No `any`. No disabling lint rules inline to make something compile — if a type doesn't fit, fix the type.
- Every new algorithm-engine function gets a unit test in the same phase it's written, not deferred to Phase 8.
- Prefer the smallest dependency that does the job — nothing in §1's stack should need a heavier alternative swapped in without a stated reason.
- Commit at the end of each phase, not mid-phase.

## 6. Style guide quick reference

- **Camera:** true isometric, orthographic projection, fixed angle — no free rotation/orbit controls unless explicitly requested later.
- **Palette:** cool neutral board (concrete/wood/hedge tones) + one warm glow accent at the goal; agent pawn colors come from the `ALGORITHMS` registry in §3, not chosen ad hoc per component.
- **Typography:** Inter or Roboto, high-contrast, sans-serif only.
- **HUD:** floating, edge-anchored, glassmorphism (translucent + blur); tool palette bottom or left; leaderboard top-left. Never a full-width top/bottom bar that fights the diorama for attention.