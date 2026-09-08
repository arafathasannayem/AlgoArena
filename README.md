# Algorithm Arena

A browser-based, isometric-diorama pathfinding visualizer. Users paint a maze on a desert grid, drop one or more agents on it, assign each a different search algorithm, and race them concurrently while watching each one's search process in a tabletop isometric diorama scene.

## Quick Start

```bash
npm install
npm run dev       # Start dev server
npm test          # Run unit tests (258 tests passing)
npm run typecheck # TypeScript strict check
npm run lint      # ESLint
npm run build     # Production build
```

## Key Features

- **3D Tabletop Diorama**: Desert theme rendered in Three.js and React Three Fiber v9 with sandstone boulder monoliths (`sandstone-boulder.glb`), desert scrub rough terrain (`desert-scrub.glb`), animated camel pawns with team-colored saddles (`camel.glb`), and local Draco decompression.
- **7 Curated Map Presets**:
  - *The Spiral*: Winding corridor forcing deep path exploration.
  - *Local Maxima Trap*: U-shaped concave trap testing greedy escape behavior.
  - *The Chokepoints*: Alternating barriers with narrow bottleneck passages.
  - *The Desert Oasis*: Central high-cost swamp (cost ×10) vs wide-open bypass detour to compare cost-aware vs unweighted algorithms.
  - *The Labyrinth*: Complex multi-branching maze with dead ends and junction turns.
  - *Twin Chambers*: Dual fortress courtyards with open north bridge vs high-cost south passage.
  - *Islands & Stepping Stones*: Open desert dotted with boulder formations and scattered scrub patches.
- **Custom Map Saving (LocalStorage)**: Design custom walls and rough terrain layouts, name and save them directly in browser storage, preview them with vector mini-maps, and reload them anytime.
- **Indie Game UI & Tactical Pause System**:
  - *Title Screen Launcher*: Atmospheric game launcher featuring 1-click Quick Match (A* vs BFS), Map Preset Archives, Arena Sandbox Mode, and Field Manual.
  - *Tactical Pause Menu*: Triggered via `Esc`, `M`, or TopBar pause button. Freezes active rAF race execution, displays map & racer telemetry, and provides quick restart, volume slider, map archives, and return to title screen.
  - *TopBar Command Deck*: Streamlined header bar with live race status badge, current map title chip, volume popover, camera angle/zoom toggles, and hotkey legend.
  - *RacerDock Sidebar*: Unified, collapsible left drawer merging agent roster configuration, visual overlay toggles (frontier, visited, path, rays), and live distance/cost standings.
  - *BottomConsole*: Docked bottom toolbar that seamlessly transitions between world-editing tools (boulder, scrub, eraser, start, goal, grid size) when idle, and playback controls (speed slider, step, pause, abort) when racing.
- **Preset Chooser Screen**: Fullscreen map browser with real-time SVG vector mini-map thumbnails, obstacle statistics, and search/filter tabs (All, Curated, My Saved).
- **Audio Synthesizer & Master Volume**: Procedural Web Audio API sound synthesizer for placement, step ticks, fanfares, and goal chimes with volume slider and global mute toggle.
- **Keyboard Navigation**: Global hotkeys for pause menu (`Esc`), playback (`Space`), reset (`R`), step (`→`), tools (`W`, `C`, `E`, `S`, `G`), camera view presets (`I`, `T`), zoom (`+`, `-`), main menu (`M`), preset browser (`P`), and manual (`?`).
- **Restrained UI / Zero AI Slop**: Clean, distraction-free tabletop palette without artificial gradients or emojis; zero clutter with docked, collapsible zones.

## Project Status

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Scaffolding (Vite 6 + React 19 + TS strict + Tailwind v4) | Completed |
| 1 | Algorithm engine (7 algorithms implemented, incl. bidirectional + multi-goal) | Completed |
| 2 | Grid state + map builder (Zustand, drag paint, 7 presets, local storage) | Completed |
| 3 | Isometric diorama scene (R3F, orthographic camera, shadows, 3D GLB assets) | Completed |
| 4 | Agents (camel pawns, saddle team colors, per-agent overlays, heuristic rays) | Completed |
| 5 | Race orchestration (rAF scheduler, live speed slider, search vs run phases) | Completed |
| 6 | Analytics (live standings leaderboard, post-race comparative dashboard) | Completed |
| 7 | Visual polish & Audio (Web Audio synth, Title Screen, Pause Menu, compact HUD) | Completed |
| 8 | QA and ship (258 unit tests green, clean typecheck, clean lint, production build) | Completed |

### Algorithm Implementation Status

| Algorithm | Status | File | Tests |
|-----------|--------|------|-------|
| A* | Implemented | `src/algorithms/astar.ts` | 17 tests passing |
| BFS | Implemented | `src/algorithms/bfs.ts` | 16 tests passing |
| Greedy Best-First | Implemented | `src/algorithms/greedyBestFirst.ts` | 15 tests passing |
| Hill Climbing | Implemented | `src/algorithms/hillClimbing.ts` | 16 tests passing |
| Simulated Annealing | Implemented | `src/algorithms/simulatedAnnealing.ts` | 17 tests passing |
| Bidirectional BFS | Implemented | `src/algorithms/bidirectionalBfs.ts` | 21 tests passing |
| Bidirectional A* | Implemented | `src/algorithms/bidirectionalAstar.ts` | 33 tests passing |
| Dijkstra's | Ready for team | `src/algorithms/dijkstra.ts` | Stubs & specs ready |
| DFS | Ready for team | `src/algorithms/dfs.ts` | Stubs & specs ready |

## Multi-Goal Support

Every implemented algorithm treats reaching **any** goal node as success. Users toggle multiple goal beacons onto the grid with the Goal tool; agents race to the nearest reachable one. Bidirectional searches seed their backward frontier from *every* goal. The goal set is carried on `GridSnapshot.goals` (optional — single-goal grids are unaffected) with shared helpers in `src/algorithms/utils.ts`.

## Tech Stack

- **Vite 6** + **React 19** + **TypeScript** (strict mode, `noUncheckedIndexedAccess`)
- **@react-three/fiber v9** + **@react-three/drei** + **three.js**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin, `@theme` glassmorphism tokens)
- **Zustand** for state management (`gridStore`, `agentStore`, `raceStore`, `presetStore`, `gameMenuStore`, `soundStore`, `cameraStore`)
- **@react-spring/three** for smooth pawn movement animations
- **lucide-react** for clean UI icons
- **Vitest** for unit test suites (258 tests passing)

## Architecture

- See [`design.md`](design.md) for full architecture and design decisions.
- See [`agents.md`](agents.md) for the onboarding guide for contributors picking up remaining algorithms.
- See [`init.md`](init.md) for the original build plan and GDD specification.

## Key Rules

1. **No `any`** — TypeScript strict mode is strictly enforced across all files.
2. **Algorithm isolation** — `src/algorithms/` must never import from `scene/`, `ui/`, or `state/`.
3. **Tests first** — Every algorithm and store gets comprehensive unit tests.
4. **Generator protocol** — All algorithms are generators yielding `StepEvent`s.
