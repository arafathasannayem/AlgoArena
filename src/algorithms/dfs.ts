/**
 * Depth-First Search (DFS) — TODO
 *
 * Explores nodes using a LIFO stack. DFS is **not optimal** — it will find
 * *a* path, but not necessarily the shortest one.
 *
 * ## Implementation notes for the contributor
 *
 * - Use an explicit stack (array with push/pop), not recursion (avoids stack
 *   overflow on large grids).
 * - Do NOT set `heuristicTarget` — DFS has no heuristic.
 * - Multi-goal support: check goal completion using `isGoal(grid, current)` so reaching ANY goal counts as success.
 * - The result may report a longer-than-necessary path; this is correct.
 * - Yield the same event categories as BFS: consider, visit, frontier, path.
 * - Must pass the shared fixture grids: open field, wall detour, U-trap, blocked.
 *
 * @module algorithms/dfs
 */

import type { AlgorithmFactory } from './types';

export const dfsFactory: AlgorithmFactory = (_grid, _config) => {
  // TODO: Implement DFS algorithm
  // See init.md §4 Phase 1 and design.md for specifications.
  throw new Error('DFS algorithm not yet implemented — see TODO in dfs.ts');
};
