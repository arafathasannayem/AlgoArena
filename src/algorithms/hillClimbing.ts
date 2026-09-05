/**
 * Hill Climbing — TODO
 *
 * Greedy local search that always moves to the neighbor with the lowest
 * heuristic value. Cannot backtrack — if no neighbor improves on the current
 * position, the algorithm is **trapped**.
 *
 * ## Implementation notes for the contributor
 *
 * - At each step, evaluate all walkable neighbors and pick the one with the
 *   smallest h(n). If none are better than the current node, terminate with
 *   status: 'trapped' (NOT 'failed').
 * - 'failed' means the frontier is exhausted (no neighbors at all).
 *   'trapped' means neighbors exist but none improve the heuristic.
 * - This distinction matters for the U-trap test case: Hill Climbing should
 *   report 'trapped' when stuck in the concave wall, while A_star/BFS solve it.
 * - Set `heuristicTarget` on every consider event.
 *
 * @module algorithms/hillClimbing
 */

import type { AlgorithmFactory } from './types';

export const hillClimbingFactory: AlgorithmFactory = (_grid, _config) => {
  // TODO: Implement Hill Climbing
  // See init.md §4 Phase 1 and design.md for specifications.
  throw new Error('Hill Climbing algorithm not yet implemented — see TODO in hillClimbing.ts');
};
