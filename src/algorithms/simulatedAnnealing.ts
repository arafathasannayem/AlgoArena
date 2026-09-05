/**
 * Simulated Annealing — TODO
 *
 * A probabilistic optimization algorithm that can escape local optima (unlike
 * Hill Climbing) by occasionally accepting worse moves. The probability of
 * accepting a worse move decreases over time as the "temperature" cools.
 *
 * ## Implementation notes for the contributor
 *
 * - Accept config knobs: `initialTemp` (default 100) and `coolingRate` (default 0.995).
 * - Acceptance probability for a worse move: P = e^(-ΔE / T)
 *   where ΔE = h(neighbor) - h(current) > 0 and T is current temperature.
 * - Temperature decreases each step: T = T * coolingRate.
 * - Stop when T < 0.01 (effectively frozen) or when the goal is reached.
 * - If frozen without reaching the goal, report status: 'trapped'.
 * - Must be able to solve the U-trap that Hill Climbing fails on (given
 *   enough temperature / slow enough cooling).
 * - Set `heuristicTarget` on every consider event.
 *
 * ## Key test case
 *
 * The U-trap: Hill Climbing → 'trapped', Simulated Annealing → 'success'
 * (given default config). This is a critical acceptance criterion.
 *
 * @module algorithms/simulatedAnnealing
 */

import type { AlgorithmFactory } from './types';

export const simulatedAnnealingFactory: AlgorithmFactory = (_grid, _config) => {
  // TODO: Implement Simulated Annealing
  // See init.md §4 Phase 1 and design.md for specifications.
  throw new Error('Simulated Annealing algorithm not yet implemented — see TODO in simulatedAnnealing.ts');
};
