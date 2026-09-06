/**
 * Shared type definitions for the Algorithm Arena engine.
 *
 * Every algorithm module, the scheduler, agent store, and visualization layer
 * depend on these types. **Do not add React/Three imports here** — this file
 * must stay framework-agnostic so the engine is testable in pure Node/Vitest.
 *
 * @module algorithms/types
 */

// ── Geometry ────────────────────────────────────────────────────────────────

/** A discrete (x, y) cell coordinate on the grid. */
export interface Point {
  x: number;
  y: number;
}

// ── Grid ────────────────────────────────────────────────────────────────────

/**
 * An immutable snapshot of the grid state handed to each algorithm factory.
 * Algorithms must not mutate this; the store creates a fresh snapshot per race.
 */
export interface GridSnapshot {
  width: number;
  height: number;
  /** Set of "x,y" string keys representing blocked cells. */
  walls: Set<string>;
  /** Optional map of "x,y" keys to traversal costs (default cost is 1). */
  costs?: Map<string, number>;
  start: Point;
  goal: Point;
}

// ── Step events (yielded by generators) ─────────────────────────────────────

/**
 * Discriminated union of events that an algorithm generator yields each tick.
 *
 * The race scheduler reads these to update the visualization state (frontier
 * highlights, visited overlays, heuristic rays, path trails).
 *
 * - `visit`    — the algorithm has "expanded" (officially explored) this node.
 * - `frontier` — current contents of the open set / queue after this tick.
 * - `consider` — the algorithm is evaluating this node; `heuristicTarget` is
 *                set only by heuristic-aware algorithms (A*, Greedy, etc.).
 * - `path`     — the current best-known path so far (may change on future ticks).
 * - `done`     — the algorithm has terminated; carries the final result.
 */
export type StepEvent =
  | { kind: 'visit'; node: Point }
  | { kind: 'frontier'; nodes: Point[] }
  | {
      kind: 'consider';
      node: Point;
      heuristicTarget?: Point;
      /** Live temperature for Simulated Annealing (undefined for others). */
      temperature?: number;
    }
  | { kind: 'path'; path: Point[] }
  | { kind: 'done'; result: AlgorithmResult };

// ── Algorithm result ────────────────────────────────────────────────────────

/**
 * Returned (not yielded) by the generator when it finishes.
 *
 * - `success` — a path was found from start to goal.
 * - `failed`  — the goal is unreachable (frontier exhausted).
 * - `trapped` — the algorithm is stuck in a local optimum (Hill Climbing).
 */
export interface AlgorithmResult {
  status: 'success' | 'failed' | 'trapped';
  path: Point[] | null;
  nodesExplored: number;
  timeMs: number;
  /** Total traversal cost of the path. */
  cost?: number;
}

// ── Generator & factory signatures ──────────────────────────────────────────

/**
 * Every algorithm is implemented as a generator function:
 *   - Yields one `StepEvent` per visualization "tick".
 *   - Returns an `AlgorithmResult` when done.
 *
 * This lets the race scheduler advance N agents independently at a shared,
 * slider-controlled pace.
 */
export type AlgorithmGenerator = Generator<StepEvent, AlgorithmResult, void>;

/**
 * Per-algorithm configuration knobs (e.g. temperature schedule for Simulated
 * Annealing). Values are numeric or flag-like booleans; undefined means "use
 * default".
 */
export interface AlgorithmConfig {
  [key: string]: number | boolean | undefined;
}

/**
 * A factory function that creates a fresh generator for one algorithm run.
 *
 * @param grid   - The grid snapshot to search over.
 * @param config - Optional algorithm-specific parameters.
 */
export type AlgorithmFactory = (
  grid: GridSnapshot,
  config?: AlgorithmConfig,
) => AlgorithmGenerator;
