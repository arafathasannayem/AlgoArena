/**
 * Greedy Best-First Search — TODO
 *
 * Expands nodes by h(n) only (no g(n) cost). This makes it faster than A*
 * in many cases but **not optimal** — the path found may not be the shortest.
 *
 * ## Implementation notes for the contributor
 *
 * - Use a min-heap ordered by h(n) = Manhattan distance to goal.
 * - Always set `heuristicTarget` to the goal in consider events.
 * - Unlike A*, do NOT track g(n) for ordering — only h(n) matters.
 * - Must pass the shared fixture grids: open field, wall detour, U-trap, blocked.
 *
 * @module algorithms/greedyBestFirst
 */

import type { AlgorithmFactory } from './types';

export const greedyBestFirstFactory: AlgorithmFactory = (_grid, _config) => {
  // TODO: Implement Greedy Best-First Search
  // See init.md §4 Phase 1 and design.md for specifications.
  throw new Error('Greedy Best-First algorithm not yet implemented — see TODO in greedyBestFirst.ts');
};
