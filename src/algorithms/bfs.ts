/**
 * Breadth-First Search (BFS) Algorithm
 *
 * Explores nodes level by level using a FIFO queue. BFS is optimal for
 * unweighted grids (all edges have cost 1) and guarantees the shortest path
 * in terms of number of steps.
 *
 * BFS does not use a heuristic — it never sets `heuristicTarget` on consider
 * events, and it does not need any configuration knobs.
 *
 * ## Generator protocol
 *
 * Each tick yields:
 *   1. `consider` — the node being dequeued and examined.
 *   2. `visit`    — confirms the node was explored.
 *   3. `frontier` — nodes newly added to the queue this tick.
 *   4. `path`     — current reconstructed path to the most recently visited node.
 *
 * On termination the generator **returns** the `AlgorithmResult`.
 *
 * @module algorithms/bfs
 */

import type {
  AlgorithmConfig,
  AlgorithmFactory,
  AlgorithmGenerator,
  AlgorithmResult,
  GridSnapshot,
  Point,
} from './types';

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
 * Reconstruct the path from start to `current` by walking the came-from map.
 */
function reconstructPath(cameFrom: Map<string, Point>, current: Point): Point[] {
  const path: Point[] = [current];
  let k = key(current);
  while (cameFrom.has(k)) {
    const prev = cameFrom.get(k)!;
    path.unshift(prev);
    k = key(prev);
  }
  return path;
}

// ── BFS generator ───────────────────────────────────────────────────────────

/**
 * BFS search generator factory.
 *
 * @param grid    - Immutable grid snapshot.
 * @param _config - Unused; BFS has no tunable knobs.
 * @returns A generator that yields StepEvents and returns an AlgorithmResult.
 */
export function* breadthFirstSearch(
  grid: GridSnapshot,
  _config?: AlgorithmConfig,
): AlgorithmGenerator {
  const t0 = performance.now();
  let nodesExplored = 0;

  const visited = new Set<string>();
  const cameFrom = new Map<string, Point>();

  // FIFO queue — shift from front, push to back.
  // For grids up to 30×30 (900 cells) this is perfectly fine;
  // a ring-buffer would matter only at much larger scales.
  const queue: Point[] = [grid.start];
  visited.add(key(grid.start));

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Yield consider event (no heuristic for BFS)
    yield { kind: 'consider', node: current };

    // Mark as explored
    nodesExplored++;
    yield { kind: 'visit', node: current };

    // Goal check
    if (current.x === grid.goal.x && current.y === grid.goal.y) {
      const path = reconstructPath(cameFrom, current);
      yield { kind: 'path', path };

      let cost = 0;
      for (let i = 1; i < path.length; i++) {
        const p = path[i]!;
        cost += grid.costs?.get(`${p.x},${p.y}`) ?? 1;
      }

      const result: AlgorithmResult = {
        status: 'success',
        path,
        nodesExplored,
        timeMs: performance.now() - t0,
        cost,
      };
      yield { kind: 'done', result };
      return result;
    }

    // Expand neighbors
    const frontierNodes: Point[] = [];

    for (const nbr of neighbors(current, grid)) {
      const nbrKey = key(nbr);
      if (!visited.has(nbrKey)) {
        visited.add(nbrKey);
        cameFrom.set(nbrKey, current);
        queue.push(nbr);
        frontierNodes.push(nbr);
      }
    }

    if (frontierNodes.length > 0) {
      yield { kind: 'frontier', nodes: frontierNodes };
    }

    // Yield current best path to the most recently visited node
    yield { kind: 'path', path: reconstructPath(cameFrom, current) };
  }

  // Queue exhausted — goal unreachable
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
export const bfsFactory: AlgorithmFactory = breadthFirstSearch;
