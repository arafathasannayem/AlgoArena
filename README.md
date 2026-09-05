# Algorithm Arena

A browser-based, isometric-diorama pathfinding visualizer. Users paint a maze on a grid, drop one or more agents on it, assign each a different search algorithm, and race them concurrently while watching each one's search process in a *Hitman GO*-style isometric tabletop scene.

## Quick Start

```bash
npm install
npm run dev       # Start dev server
npm test          # Run unit tests
npm run typecheck # TypeScript strict check
npm run lint      # ESLint
npm run build     # Production build
```

## Project Status

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Scaffolding (Vite 6 + React 19 + TS strict + Tailwind v4) | ✅ Done |
| 1 | Algorithm engine (A* & BFS complete; 5 stubs with specs) | ✅ Done (Group TODOs) |
| 2 | Grid state + map builder (Zustand, drag paint, presets) | ✅ Done |
| 3 | Isometric diorama scene (R3F, orthographic camera, shadows) | ✅ Done |
| 4 | Agents (animated pawn meshes, per-agent overlays) | ✅ Done |
| 5 | Race orchestration (rAF scheduler, live speed slider) | ✅ Done |
| 6 | Analytics (live standings leaderboard, post-race dashboard) | ✅ Done |
| 7 | Visual polish (glassmorphism HUD, edge-anchored layout) | ✅ Done |
| 8 | QA and ship (59 unit tests green, production build verified) | ✅ Done |

### Algorithm Implementation Status

| Algorithm | Status | File | Tests |
|-----------|--------|------|-------|
| A* | ✅ Implemented | `src/algorithms/astar.ts` | 17 tests passing |
| BFS | ✅ Implemented | `src/algorithms/bfs.ts` | 16 tests passing |
| Dijkstra's | 🚧 TODO (Group) | `src/algorithms/dijkstra.ts` | Stubs & specs ready |
| DFS | 🚧 TODO (Group) | `src/algorithms/dfs.ts` | Stubs & specs ready |
| Greedy Best-First | 🚧 TODO (Group) | `src/algorithms/greedyBestFirst.ts` | Stubs & specs ready |
| Hill Climbing | 🚧 TODO (Group) | `src/algorithms/hillClimbing.ts` | Stubs & specs ready |
| Simulated Annealing | 🚧 TODO (Group) | `src/algorithms/simulatedAnnealing.ts` | Stubs & specs ready |

## Tech Stack

- **Vite 6** + **React 19** + **TypeScript** (strict mode, `noUncheckedIndexedAccess`)
- **@react-three/fiber v9** + **@react-three/drei** + **three.js**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin, `@theme` glassmorphism tokens)
- **Zustand** for state management (`gridStore`, `agentStore`, `raceStore`)
- **@react-spring/three** for smooth pawn movement animations
- **lucide-react** for all icons
- **Vitest** for unit test suites (59 tests passing)

## Architecture

See [`design.md`](design.md) for the full architecture and design decisions.

See [`agents.md`](agents.md) for the onboarding guide for contributors picking up the remaining TODO algorithms.

See [`init.md`](init.md) for the original build plan and GDD specification.

## Key Rules

1. **No `any`** — TypeScript strict mode is strictly enforced across all files.
2. **Algorithm isolation** — `src/algorithms/` must never import from `scene/`, `ui/`, or `state/`.
3. **Tests first** — Every algorithm gets unit tests in the same phase it's written.
4. **Generator protocol** — All algorithms are generators yielding `StepEvent`s.
