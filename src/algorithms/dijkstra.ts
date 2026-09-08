/**
 * Dijkstra's Algorithm — TODO
 *
 * Uniform-cost search. Identical to A* but with h(n) = 0 (no heuristic).
 * Never sets `heuristicTarget` on consider events.
 *
 * ## Implementation notes for the contributor
 *
 * - Use a min-heap ordered by g(n) (actual cost from start).
 * - The MinHeap class from astar.ts can be extracted to a shared util if needed.
 * - Yield the same event sequence as A* but omit `heuristicTarget`.
 * - Multi-goal support: check goal completion using `isGoal(grid, current)` so reaching ANY goal counts as success.
 * - See init.md Phase 1 for the full spec.
 * - Must pass the shared fixture grids: open field, wall detour, U-trap, blocked.
 *
 * @module algorithms/dijkstra
 */

import type { AlgorithmFactory } from './types';

export const dijkstraFactory: AlgorithmFactory = (_grid, _config) => {
  // TODO: Implement Dijkstra's algorithm
  // See init.md §4 Phase 1 and design.md for specifications.
  throw new Error('Dijkstra algorithm not yet implemented — see TODO in dijkstra.ts');
};
