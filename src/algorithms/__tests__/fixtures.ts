/**
 * Shared test fixtures for algorithm unit tests.
 *
 * These grids are the canonical test cases referenced in init.md §4 Phase 1.
 * Every algorithm (once implemented) must pass tests against all of these.
 *
 * ## Fixture overview
 *
 * 1. **Open field** (5×5)   — No walls. Trivial shortest path exists.
 * 2. **Wall detour** (7×7)  — A wall blocks the direct path; must go around.
 * 3. **U-trap** (10×10)     — A U-shaped wall that traps greedy/local-search
 *                             algorithms. A*, BFS, Dijkstra, DFS should solve.
 *                             Hill Climbing should report 'trapped'.
 * 4. **Fully blocked** (5×5) — Goal surrounded by walls. No path possible.
 *
 * @module algorithms/__tests__/fixtures
 */

import type { GridSnapshot, Point } from '../types';

// ── Helper to build wall sets from coordinate arrays ────────────────────────

function wallSet(coords: [number, number][]): Set<string> {
  return new Set(coords.map(([x, y]) => `${x},${y}`));
}

// ── 1. Open field ───────────────────────────────────────────────────────────

/**
 * ```
 * S . . . .
 * . . . . .
 * . . . . .
 * . . . . .
 * . . . . G
 * ```
 *
 * Shortest path length: 8 (Manhattan distance from (0,0) to (4,4)).
 */
export const OPEN_FIELD: GridSnapshot = {
  width: 5,
  height: 5,
  walls: new Set<string>(),
  start: { x: 0, y: 0 },
  goal: { x: 4, y: 4 },
};

/** Expected shortest path length for the open field grid. */
export const OPEN_FIELD_OPTIMAL_LENGTH = 9; // 8 steps + start node = 9 nodes in path

// ── 2. Wall detour ──────────────────────────────────────────────────────────

/**
 * ```
 * S . . . . . .
 * . . # . . . .
 * . . # . . . .
 * . . # . . . .
 * . . # . . . .
 * . . . . . . .
 * . . . . . . G
 * ```
 *
 * Wall at x=2, y=1..4 blocks the direct horizontal path.
 * Must go around (below the wall at y=5 or above at y=0).
 */
export const WALL_DETOUR: GridSnapshot = {
  width: 7,
  height: 7,
  walls: wallSet([
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
  ]),
  start: { x: 0, y: 0 },
  goal: { x: 6, y: 6 },
};

// ── 3. U-trap ───────────────────────────────────────────────────────────────

/**
 * ```
 * . . . . . . . . . .
 * . . . . . . . . . .
 * . . . # . . . . . .
 * . . . # . G . . . .
 * . . . # . . . . . .
 * . . . # . . . . . .
 * . . . # . . . . . .
 * . . . # # # # . . .
 * . S . . . . . . . .
 * . . . . . . . . . .
 * ```
 *
 * The start is at (1, 8), goal at (5, 3).
 * A U-shaped wall wraps around the left/bottom. Greedy approaches that just
 * minimize distance to goal will walk into the concave pocket and get stuck.
 *
 * - A*, BFS, Dijkstra → success (can backtrack / explore fully).
 * - Hill Climbing → trapped (no neighbor improves heuristic once inside U).
 * - Simulated Annealing → success (can probabilistically escape).
 */
export const U_TRAP: GridSnapshot = {
  width: 10,
  height: 10,
  walls: wallSet([
    [3, 2],
    [3, 3],
    [3, 4],
    [3, 5],
    [3, 6],
    [3, 7],
    [4, 7],
    [5, 7],
    [6, 7],
  ]),
  start: { x: 1, y: 8 },
  goal: { x: 5, y: 3 },
};

// ── 4. Fully blocked ────────────────────────────────────────────────────────

/**
 * ```
 * S . . . .
 * . . . . .
 * . . . # .
 * . . # G #
 * . . . # .
 * ```
 *
 * Goal at (3, 3) is completely surrounded by walls. No path possible.
 */
export const FULLY_BLOCKED: GridSnapshot = {
  width: 5,
  height: 5,
  walls: wallSet([
    [3, 2],
    [2, 3],
    [4, 3],
    [3, 4],
  ]),
  start: { x: 0, y: 0 },
  goal: { x: 3, y: 3 },
};

// ── 5. Multi-goal grids ─────────────────────────────────────────────────────

/**
 * ```
 * G . . . . . G     (G = goal; S = start)
 * . . . . . . .
 * . . . . . . .
 * . . . . . . .
 * . . . . . . .
 * . . . . . . .
 * G . . . . . S
 * ```
 *
 * 7×7 fully open. Start (0, 0). Goals at (6, 0), (0, 6) and (6, 6) — all
 * reachable. Any algorithm that reaches ANY goal counts as success.
 */
export const MULTI_GOAL_OPEN: GridSnapshot = {
  width: 7,
  height: 7,
  walls: new Set<string>(),
  start: { x: 0, y: 0 },
  goal: { x: 6, y: 6 },
  goals: [
    { x: 6, y: 0 },
    { x: 0, y: 6 },
    { x: 6, y: 6 },
  ],
};

/**
 * ```
 * . G . . . . .          y = 0
 * . . . . . . .
 * . . . . . . .
 * S . . . . . G          y = 3  (S at (0,3), far goal at (6,3))
 * . . . . . . .
 * . . . . . . .
 * . . . . . . .
 * ```
 *
 * 7×7 open. Start (0, 3). Two goals: (1, 0) at distance 4 and (6, 3) at
 * distance 6. The nearer goal (1, 0) is the one optimal searches must end at.
 */
export const MULTI_GOAL_NEAREST: GridSnapshot = {
  width: 7,
  height: 7,
  walls: new Set<string>(),
  start: { x: 0, y: 3 },
  goal: { x: 6, y: 3 },
  goals: [
    { x: 6, y: 3 },
    { x: 1, y: 0 },
  ],
};

/**
 * ```
 * S . . . G . .          y = 0  (nearest reachable goal at (4,0), dist 4)
 * . . . . . . .
 * . . . . . . .
 * . . . . . . .
 * . . . . . . .
 * . . . . . . #
 * . . . . . # G          (goal A at (6,6) boxed in by walls (6,5) & (5,6))
 * ```
 *
 * 7×7. Goals are (4, 0) — reachable and the nearest — and (6, 6), which is
 * unreachable (its only two in-grid neighbours (5,6) and (6,5) are walls).
 * Proves an algorithm succeeds despite one goal being walled off, and that
 * heuristics steer toward the REACHABLE (nearest) goal.
 */
export const MULTI_GOAL_WALLED_GOAL: GridSnapshot = {
  width: 7,
  height: 7,
  walls: wallSet([
    [6, 5],
    [5, 6],
  ]),
  start: { x: 0, y: 0 },
  goal: { x: 6, y: 6 },
  goals: [
    { x: 6, y: 6 },
    { x: 4, y: 0 },
  ],
};

// ── Utilities for test assertions ───────────────────────────────────────────

/** Check that a path starts at `start` and ends at `goal`. */
export function pathEndpoints(path: Point[], start: Point, goal: Point): boolean {
  if (path.length < 2) return false;
  const first = path[0]!;
  const last = path[path.length - 1]!;
  return (
    first.x === start.x &&
    first.y === start.y &&
    last.x === goal.x &&
    last.y === goal.y
  );
}

/** Check that a path starts at `start` and ends at ANY of the given goals. */
export function pathEndsAtAnyGoal(path: Point[], start: Point, goals: Point[]): boolean {
  if (path.length < 2) return false;
  const first = path[0]!;
  const last = path[path.length - 1]!;
  if (first.x !== start.x || first.y !== start.y) return false;
  return goals.some((g) => g.x === last.x && g.y === last.y);
}

/** Check that a path ends at exactly the given goal node. */
export function pathEndsAt(path: Point[], goal: Point): boolean {
  const last = path[path.length - 1]!;
  return last.x === goal.x && last.y === goal.y;
}

/** Check that each consecutive pair in a path is one cardinal step apart. */
export function pathIsContiguous(path: Point[]): boolean {
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1]!;
    const curr = path[i]!;
    const dx = Math.abs(curr.x - prev.x);
    const dy = Math.abs(curr.y - prev.y);
    if (dx + dy !== 1) return false;
  }
  return true;
}

/** Check that no node in a path sits on a wall. */
export function pathAvoidsWalls(path: Point[], walls: Set<string>): boolean {
  return path.every((p) => !walls.has(`${p.x},${p.y}`));
}

/**
 * Run a generator to completion, collecting all yielded step events.
 * Returns `{ events, result }`.
 */
export function runToCompletion(
  gen: Generator<unknown, { status: string; path: Point[] | null; nodesExplored: number; timeMs: number }, void>,
) {
  const events: unknown[] = [];
  let step = gen.next();
  while (!step.done) {
    events.push(step.value);
    step = gen.next();
  }
  return { events, result: step.value };
}
