/**
 * Bidirectional Breadth-First Search (Bidirectional BFS)
 *
 * Searches simultaneously from both the start and the goal, alternating
 * expansion between two frontiers. When the two frontier regions meet, the
 * path is reconstructed by joining the path from start to the meeting node
 * with the path from the meeting node to the goal.
 *
 * Because each side performs a level-by-level (BFS) expansion, the combined
 * result still finds the shortest path in terms of number of steps, and in
 * practice explores far fewer nodes than a single-direction BFS.
 *
 * Bidirectional BFS does not use a heuristic — it never sets
 * `heuristicTarget` on consider events, and it does not need any
 * configuration knobs.
 *
 * ## Generator protocol
 *
 * Each tick yields one or more `StepEvent`s:
 *   1. `consider` — the node being examined on one side.
 *   2. `visit`    — confirms the node was explored.
 *   3. `frontier` — nodes newly added to the frontier this tick.
 *   4. `path`     — current known path to the most recently examined node.
 *
 * On termination the generator **returns** (not yields) the `AlgorithmResult`.
 *
 * @module algorithms/bidirectionalBfs
 */

import type {
  AlgorithmConfig,
  AlgorithmFactory,
  AlgorithmGenerator,
  AlgorithmResult,
  GridSnapshot,
  Point,
} from './types';
import { goalPoints, isGoal } from './utils';

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Encode a Point as a string key for Set/Map lookups. */
function key(p: Point): string {
  return `${p.x},${p.y}`;
}

/** Cardinal neighbor offsets (no diagonals). */
const DIRS: readonly Point[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

/** Return walkable cardinal neighbors of `p` within `grid`. */
function neighbors(p: Point, grid: GridSnapshot): Point[] {
  const result: Point[] = [];
  for (const d of DIRS) {
    const nx = p.x + d.x;
    const ny = p.y + d.y;
    if (nx >= 0 && nx < grid.width && ny >= 0 && ny < grid.height) {
      if (!grid.walls.has(`${nx},${ny}`)) {
        result.push({ x: nx, y: ny });
      }
    }
  }
  return result;
}

/**
 * Reconstruct the path from the origin of `cameFrom` to `current`.
 * `cameFrom` maps each node to its predecessor (toward the origin side).
 */
function reconstructFrom(cameFrom: Map<string, Point>, current: Point): Point[] {
  const path: Point[] = [current];
  let k = key(current);
  while (cameFrom.has(k)) {
    const prev = cameFrom.get(k)!;
    path.unshift(prev);
    k = key(prev);
  }
  return path;
}

/**
 * Reconstruct the path from `current` outward following `cameFrom`.
 * Used on the goal side, where `cameFrom` points toward the goal.
 */
function reconstructToward(cameFrom: Map<string, Point>, current: Point): Point[] {
  const path: Point[] = [current];
  let k = key(current);
  while (cameFrom.has(k)) {
    const next = cameFrom.get(k)!;
    path.push(next);
    k = key(next);
  }
  return path;
}

// ── Bidirectional BFS generator ─────────────────────────────────────────────

/**
 * Bidirectional BFS search generator factory.
 *
 * @param grid    - Immutable grid snapshot.
 * @param _config - Unused; Bidirectional BFS has no tunable knobs.
 * @returns A generator that yields StepEvents and returns an AlgorithmResult.
 */
export function* bidirectionalBfs(
  grid: GridSnapshot,
  _config?: AlgorithmConfig,
): AlgorithmGenerator {
  const t0 = performance.now();
  let nodesExplored = 0;

  // Frontier queues for each direction. The goal side starts from EVERY goal
  // node so the search converges on the closest reachable one.
  const queueFromStart: Point[] = [grid.start];
  const queueFromGoal: Point[] = goalPoints(grid);

  // Visited sets — also used for meeting-point detection.
  const visitedA = new Set<string>([key(grid.start)]);
  const visitedB = new Set<string>(queueFromGoal.map(key));

  // Predecessor maps for path reconstruction.
  const parentA = new Map<string, Point>(); // start side
  const parentB = new Map<string, Point>(); // goal side

  /**
   * Join two half-paths at a meeting node `meet` into one full path.
   * Returns `null` if anything is inconsistent.
   */
  function joinAt(meet: Point): Point[] | null {
    const fromStart = reconstructFrom(parentA, meet); // [start, ..., meet]
    const toGoal = reconstructToward(parentB, meet); // [meet, ..., goal]
    return [...fromStart, ...toGoal.slice(1)];
  }

  // If start is one of the goals, we're done immediately.
  if (isGoal(grid, grid.start)) {
    const path = [grid.start];
    yield { kind: 'consider', node: grid.start };
    yield { kind: 'visit', node: grid.start };
    yield { kind: 'path', path };
    const result: AlgorithmResult = {
      status: 'success',
      path,
      nodesExplored: 1,
      timeMs: performance.now() - t0,
    };
    yield { kind: 'done', result };
    return result;
  }

  let fullPath: Point[] | null = null;

  while (queueFromStart.length > 0 && queueFromGoal.length > 0) {
    // ── Expand one node from the start side ──────────────────────────────
    if (queueFromStart.length > 0) {
      const current = queueFromStart.shift()!;
      const currentKey = key(current);

      // Meeting point: this node was already reached from the goal side.
      if (visitedB.has(currentKey)) {
        fullPath = joinAt(current);
        if (fullPath) break;
      }

      yield { kind: 'consider', node: current };
      nodesExplored++;
      yield { kind: 'visit', node: current };

      const frontierNodes: Point[] = [];
      for (const nbr of neighbors(current, grid)) {
        const nbrKey = key(nbr);
        if (visitedA.has(nbrKey)) continue;
        visitedA.add(nbrKey);
        parentA.set(nbrKey, current);
        queueFromStart.push(nbr);
        frontierNodes.push(nbr);

        // Found a node already reached from the goal side → meeting point.
        if (visitedB.has(nbrKey)) {
          fullPath = joinAt(nbr);
          break;
        }
      }

      if (frontierNodes.length > 0) {
        yield { kind: 'frontier', nodes: frontierNodes };
      }
      yield { kind: 'path', path: reconstructFrom(parentA, current) };

      if (fullPath) break;
    }

    // ── Expand one node from the goal side ───────────────────────────────
    if (queueFromGoal.length > 0) {
      const current = queueFromGoal.shift()!;
      const currentKey = key(current);

      // Meeting point: this node was already reached from the start side.
      if (visitedA.has(currentKey)) {
        fullPath = joinAt(current);
        if (fullPath) break;
      }

      yield { kind: 'consider', node: current };
      nodesExplored++;
      yield { kind: 'visit', node: current };

      const frontierNodes: Point[] = [];
      for (const nbr of neighbors(current, grid)) {
        const nbrKey = key(nbr);
        if (visitedB.has(nbrKey)) continue;
        visitedB.add(nbrKey);
        parentB.set(nbrKey, current);
        queueFromGoal.push(nbr);
        frontierNodes.push(nbr);

        // Found a node already reached from the start side → meeting point.
        if (visitedA.has(nbrKey)) {
          fullPath = joinAt(nbr);
          break;
        }
      }

      if (frontierNodes.length > 0) {
        yield { kind: 'frontier', nodes: frontierNodes };
      }
      yield { kind: 'path', path: reconstructFrom(parentB, current) };

      if (fullPath) break;
    }
  }

  // ── Outcome ─────────────────────────────────────────────────────────────
  if (fullPath) {
    yield { kind: 'path', path: fullPath };
    const result: AlgorithmResult = {
      status: 'success',
      path: fullPath,
      nodesExplored,
      timeMs: performance.now() - t0,
    };
    yield { kind: 'done', result };
    return result;
  }

  // One or both frontiers exhausted — goal unreachable.
  const result: AlgorithmResult = {
    status: 'failed',
    path: null,
    nodesExplored,
    timeMs: performance.now() - t0,
  };
  yield { kind: 'done', result };
  return result;
}

// Re-export the factory with the correct type for the registry
export const bidirectionalBfsFactory: AlgorithmFactory = bidirectionalBfs;
