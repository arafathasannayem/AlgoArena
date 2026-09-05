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
| 0 | Scaffolding (Vite + React + TS + Tailwind) | ✅ Done |
| 1 | Algorithm engine (partial) | 🚧 In progress |
| 2 | Grid state + map builder | ❌ Not started |
| 3 | Isometric diorama scene | ❌ Not started |
| 4 | Agents | ❌ Not started |
| 5 | Race orchestration | ❌ Not started |
| 6 | Analytics | ❌ Not started |
| 7 | Visual polish | ❌ Not started |
| 8 | QA and ship | ❌ Not started |

### Algorithm Implementation Status

| Algorithm | Status | File | Tests |
|-----------|--------|------|-------|
| A* | ✅ Implemented | `src/algorithms/astar.ts` | 17 tests passing |
| BFS | ✅ Implemented | `src/algorithms/bfs.ts` | 16 tests passing |
| Dijkstra's | 🚧 TODO | `src/algorithms/dijkstra.ts` | — |
| DFS | 🚧 TODO | `src/algorithms/dfs.ts` | — |
| Greedy Best-First | 🚧 TODO | `src/algorithms/greedyBestFirst.ts` | — |
| Hill Climbing | 🚧 TODO | `src/algorithms/hillClimbing.ts` | — |
| Simulated Annealing | 🚧 TODO | `src/algorithms/simulatedAnnealing.ts` | — |

## Tech Stack

- **Vite 6** + **React 19** + **TypeScript** (strict mode)
- **@react-three/fiber v9** + **@react-three/drei** + **three.js**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **Zustand** for state management
- **@react-spring/three** for animations
- **lucide-react** for icons
- **Vitest** for unit tests

## Architecture

See [`design.md`](design.md) for the full architecture and design decisions.

See [`agents.md`](agents.md) for onboarding guide for new contributors (human or AI).

See [`init.md`](init.md) for the original build plan and GDD translation.

## Key Rules

1. **No `any`** — TypeScript strict mode is enforced. No inline lint disabling.
2. **Algorithm isolation** — `src/algorithms/` must never import from `scene/` or `ui/`.
3. **Tests first** — Every algorithm gets unit tests in the same phase it's written.
4. **Generator protocol** — All algorithms are generators yielding `StepEvent`s. See `src/algorithms/types.ts`.
5. **Commit per phase** — One commit per completed phase, message format: `phase N: <summary>`.
