/**
 * Bidirectional A* Search Algorithm
 *
 * Searches simultaneously from both the start and the goal, alternating
 * expansion between two A* frontiers. Each side orders its frontier by
 * f(n) = g(n) + h(n):
 *   - start side: gA(n) = cost from start, hA(n) = Manhattan(n, goal)
 *   - goal side: gB(n) = cost from goal, hB(n) = Manhattan(n, start)
 *
 * When a node is reached by both frontiers, the two half-paths are joined into
 * a candidate path. The search stops when the sum of the smallest f-values of
 * the two frontiers is no better than the best candidate found so far, which
 * guarantees the shortest (minimum-cost) path for consistent heuristics.
 *
 * ## Generator protocol
 *
 * Each tick yields one or more `StepEvent`s:
 *   1. `consider` — the node being expanded, with `heuristicTarget` pointing
 *                   toward the opposite endpoint of the grid.
 *   2. `visit`    — confirms the node was officially explored.
 *   3. `frontier` — updated open set after neighbor expansion.
 *   4. `path`     — current best-known path (joined half-paths if found).
 *
 * On termination the generator **returns** (not yields) the `AlgorithmResult`.
 *
 * @module algorithms/bidirectionalAstar
 */

import type {
  AlgorithmConfig,
  AlgorithmFactory,
  AlgorithmGenerator,
  AlgorithmResult,
  GridSnapshot,
  Point,
} from './types';
import { goalPoints, isGoal, nearestGoal, nearestGoalDist } from './utils';

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Encode a Point as a string key for Set/Map lookups. */
function key(p: Point): string {
  return `${p.x},${p.y}`;
}

/** Manhattan distance — consistent heuristic for 4-directional grids. */
function manhattan(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
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

// ── Min-heap (binary heap) for the open sets ────────────────────────────────

interface HeapEntry {
  point: Point;
  f: number;
}

/**
 * Minimal binary min-heap ordered by `f` score.
 *
 * We roll our own rather than pulling in a library to keep the algorithms/
 * directory dependency-free (init.md §5: "smallest dependency that does the
 * job").
 */
class MinHeap {
  private data: HeapEntry[] = [];

  get size(): number {
    return this.data.length;
  }

  push(entry: HeapEntry): void {
    this.data.push(entry);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): HeapEntry | undefined {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0 && last !== undefined) {
      this.data[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  /** Peek at the smallest f-value in the heap without popping. */
  peekF(): number {
    return this.data[0]?.f ?? Infinity;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[i]!.f < this.data[parent]!.f) {
        [this.data[i], this.data[parent]] = [this.data[parent]!, this.data[i]!];
        i = parent;
      } else {
        break;
      }
    }
  }

  private sinkDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.data[left]!.f < this.data[smallest]!.f) {
        smallest = left;
      }
      if (right < n && this.data[right]!.f < this.data[smallest]!.f) {
        smallest = right;
      }
      if (smallest !== i) {
        [this.data[i], this.data[smallest]] = [this.data[smallest]!, this.data[i]!];
        i = smallest;
      } else {
        break;
      }
    }
  }
}

// ── Bidirectional A* generator ──────────────────────────────────────────────

/**
 * Bidirectional A* search generator factory.
 *
 * @param grid    - Immutable grid snapshot.
 * @param _config - Unused; Bidirectional A* has no tunable knobs.
 * @returns A generator that yields StepEvents and returns an AlgorithmResult.
 */
export function* bidirectionalAStar(
  grid: GridSnapshot,
  _config?: AlgorithmConfig,
): AlgorithmGenerator {
  const t0 = performance.now();
  let nodesExplored = 0;

  const start = grid.start;
  const goals = goalPoints(grid);

  // If start is one of the goals, we're done immediately.
  if (isGoal(grid, start)) {
    const path = [start];
    yield { kind: 'consider', node: start, heuristicTarget: nearestGoal(grid, start), direction: 'forward' };
    yield { kind: 'visit', node: start };
    yield { kind: 'path', path };
    const result: AlgorithmResult = {
      status: 'success',
      path,
      nodesExplored: 1,
      timeMs: performance.now() - t0,
      cost: 0,
    };
    yield { kind: 'done', result };
    return result;
  }

  // ── Start side (A) ───────────────────────────────────────────────────────
  const openA = new MinHeap();
  const gA = new Map<string, number>();
  const cameFromA = new Map<string, Point>();
  const closedA = new Set<string>();
  gA.set(key(start), 0);
  openA.push({ point: start, f: nearestGoalDist(grid, start) });

  // ── Goal side (B) — independent frontier queue per goal node ────────────
  // Each goal gets its own MinHeap so that all goals run backward checks
  // concurrently towards start, rather than letting a single geometrically
  // closer goal starve the others.
  const openBs: MinHeap[] = goals.map(() => new MinHeap());
  const gB = new Map<string, number>();
  const cameFromB = new Map<string, Point>();
  const closedB = new Set<string>();

  for (let i = 0; i < goals.length; i++) {
    const g = goals[i]!;
    const gKey = key(g);
    gB.set(gKey, 0);
    openBs[i]!.push({ point: g, f: manhattan(g, start) });
  }

  /** Whether any goal frontier still has nodes to expand. */
  function hasOpenB(): boolean {
    for (let i = 0; i < openBs.length; i++) {
      if (openBs[i]!.size > 0) return true;
    }
    return false;
  }

  /** Lowest f-score across all active goal frontiers. */
  function minOpenBF(): number {
    let minF = Infinity;
    for (let i = 0; i < openBs.length; i++) {
      if (openBs[i]!.size > 0) {
        const f = openBs[i]!.peekF();
        if (f < minF) minF = f;
      }
    }
    return minF;
  }

  // Best meeting point found so far (for optimal stopping).
  let bestMeet: Point | null = null;
  let bestCost = Infinity;

  /** Try to register a meeting at `meet` with combined cost `cost`. */
  function considerMeeting(meet: Point, cost: number): void {
    if (cost < bestCost) {
      bestCost = cost;
      bestMeet = meet;
    }
  }

  /** Join the two half-paths at a meeting node into one full path. */
  function joinAt(meet: Point): Point[] {
    const fromStart = reconstructFrom(cameFromA, meet); // [start, ..., meet]
    const toGoal = reconstructToward(cameFromB, meet); // [meet, ..., goal]
    return [...fromStart, ...toGoal.slice(1)];
  }

  // Alternate which side expands next.
  let turnA = true;
  let goalIndex = 0;

  while (openA.size > 0 && hasOpenB()) {
    // ── Expand one node from the start side ────────────────────────────────
    if (turnA && openA.size > 0) {
      const entry = openA.pop()!;
      const current = entry.point;
      const currentKey = key(current);

      if (closedA.has(currentKey)) continue;

      yield { kind: 'consider', node: current, heuristicTarget: nearestGoal(grid, current), direction: 'forward' };
      closedA.add(currentKey);
      nodesExplored++;
      yield { kind: 'visit', node: current };

      // If the goal side already reached this node → meeting point.
      const gBhere = gB.get(currentKey);
      if (gBhere !== undefined) {
        considerMeeting(current, (gA.get(currentKey) ?? 0) + gBhere);
        if (openA.peekF() + minOpenBF() >= bestCost) break;
      }

      const currentG = gA.get(currentKey) ?? Infinity;
      const frontierNodes: Point[] = [];

      for (const nbr of neighbors(current, grid)) {
        const nbrKey = key(nbr);
        if (closedA.has(nbrKey)) continue;

        const stepCost = grid.costs?.get(nbrKey) ?? 1;
        const tentativeG = currentG + stepCost;
        const bestG = gA.get(nbrKey) ?? Infinity;

        if (tentativeG < bestG) {
          cameFromA.set(nbrKey, current);
          gA.set(nbrKey, tentativeG);
          openA.push({ point: nbr, f: tentativeG + nearestGoalDist(grid, nbr) });
          frontierNodes.push(nbr);

          // Neighbor reached by both frontiers → meeting point.
          const gBnb = gB.get(nbrKey);
          if (gBnb !== undefined) {
            considerMeeting(nbr, tentativeG + gBnb);
          }
        }
      }

      if (frontierNodes.length > 0) {
        yield { kind: 'frontier', nodes: frontierNodes };
      }
      yield { kind: 'path', path: bestMeet ? joinAt(bestMeet) : reconstructFrom(cameFromA, current) };
    }

    // ── Expand one node from the goal side (round-robin among goals) ────────
    if (!turnA && hasOpenB()) {
      let attempts = 0;
      while (openBs[goalIndex]!.size === 0 && attempts < goals.length) {
        goalIndex = (goalIndex + 1) % goals.length;
        attempts++;
      }

      const currentGoalIdx = goalIndex;
      const activeHeap = openBs[currentGoalIdx]!;
      goalIndex = (goalIndex + 1) % goals.length;

      const entry = activeHeap.pop()!;
      const current = entry.point;
      const currentKey = key(current);

      if (closedB.has(currentKey)) continue;

      yield { kind: 'consider', node: current, heuristicTarget: start, direction: 'backward' };
      closedB.add(currentKey);
      nodesExplored++;
      yield { kind: 'visit', node: current };

      // If the start side already reached this node → meeting point.
      const gAhere = gA.get(currentKey);
      if (gAhere !== undefined) {
        considerMeeting(current, gAhere + (gB.get(currentKey) ?? 0));
        if (openA.peekF() + minOpenBF() >= bestCost) break;
      }

      const currentG = gB.get(currentKey) ?? Infinity;
      const frontierNodes: Point[] = [];

      for (const nbr of neighbors(current, grid)) {
        const nbrKey = key(nbr);
        if (closedB.has(nbrKey)) continue;

        const stepCost = grid.costs?.get(nbrKey) ?? 1;
        const tentativeG = currentG + stepCost;
        const bestG = gB.get(nbrKey) ?? Infinity;

        if (tentativeG < bestG) {
          cameFromB.set(nbrKey, current);
          gB.set(nbrKey, tentativeG);
          openBs[currentGoalIdx]!.push({ point: nbr, f: tentativeG + manhattan(nbr, start) });
          frontierNodes.push(nbr);

          // Neighbor reached by both frontiers → meeting point.
          const gAnb = gA.get(nbrKey);
          if (gAnb !== undefined) {
            considerMeeting(nbr, gAnb + tentativeG);
          }
        }
      }

      if (frontierNodes.length > 0) {
        yield { kind: 'frontier', nodes: frontierNodes };
      }
      yield { kind: 'path', path: bestMeet ? joinAt(bestMeet) : reconstructToward(cameFromB, current) };
    }

    // Optional stop: no remaining candidate can beat the best path found.
    if (bestMeet !== null && openA.peekF() + minOpenBF() >= bestCost) {
      break;
    }

    // Symmetric alternation (skip if the other side emptied this round).
    if (turnA && openA.size === 0) turnA = false;
    else if (!turnA && !hasOpenB()) turnA = true;
    else turnA = !turnA;
  }

  // ── Outcome ─────────────────────────────────────────────────────────────
  if (bestMeet !== null) {
    const path = joinAt(bestMeet);
    yield { kind: 'path', path };
    const result: AlgorithmResult = {
      status: 'success',
      path,
      nodesExplored,
      timeMs: performance.now() - t0,
      cost: bestCost,
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
export const bidirectionalAStarFactory: AlgorithmFactory = bidirectionalAStar;