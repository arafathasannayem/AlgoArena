/**
 * Map Presets
 *
 * Curated challenge maps testing distinct pathfinding algorithmic properties:
 * 1. "The Spiral" — winding corridor forcing deep paths
 * 2. "Local Maxima Trap" — U-shaped concave wall trapping greedy algorithms
 * 3. "The Chokepoints" — alternating wall barriers with narrow passages
 * 4. "The Desert Oasis" — direct high-cost swamp vs wide open bypass detour
 * 5. "The Labyrinth" — multi-branching maze with dead ends and junction turns
 * 6. "Twin Chambers" — two courtyards joined by open north gate & high-cost south gate
 * 7. "Islands & Stepping Stones" — open desert dotted with boulder clusters & scrub
 *
 * @module maps/presets
 */

import type { Point } from '../algorithms/types';

export interface MapPreset {
  /** Optional identifier for custom or stored presets. */
  id?: string;
  /** Display name in the UI. */
  name: string;
  /** Description shown in preset chooser & tooltips. */
  description: string;
  /** Grid width this preset is designed for. */
  width: number;
  /** Grid height this preset is designed for. */
  height: number;
  /** Wall cell coordinates as [x, y] tuples. */
  walls: [number, number][];
  /** High-cost cell coordinates as [x, y, cost] tuples (optional). */
  costs?: [number, number, number][];
  /** Recommended start point. */
  start: Point;
  /** Recommended goal point. */
  goal: Point;
  /** Category tag: 'official' or 'custom'. */
  category?: 'official' | 'custom';
  /** Creation timestamp for custom presets. */
  createdAt?: number;
}

/**
 * "The Spiral" — a spiral-shaped maze that forces long winding paths.
 * Tests how algorithms handle non-obvious shortest paths.
 */
export const THE_SPIRAL: MapPreset = {
  id: 'spiral',
  name: 'The Spiral',
  description: 'A spiral maze that forces winding paths — tests pathfinding efficiency.',
  width: 20,
  height: 20,
  walls: [
    // Outer ring (partial)
    ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((x): [number, number] => [x, 2]),
    ...[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((y): [number, number] => [17, y]),
    ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((x): [number, number] => [x, 17]),
    ...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((y): [number, number] => [2, y]),
    // Inner ring
    ...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((x): [number, number] => [x, 4]),
    ...[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((y): [number, number] => [15, y]),
    ...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((x): [number, number] => [x, 15]),
    ...[6, 7, 8, 9, 10, 11, 12, 13].map((y): [number, number] => [4, y]),
  ],
  start: { x: 0, y: 0 },
  goal: { x: 10, y: 10 },
  category: 'official',
};

/**
 * "Local Maxima Trap" — a U-shaped wall that traps greedy algorithms.
 * Hill Climbing gets trapped; Simulated Annealing escapes.
 */
export const LOCAL_MAXIMA_TRAP: MapPreset = {
  id: 'trap',
  name: 'Local Maxima Trap',
  description: 'A U-shaped wall that traps greedy algorithms — tests escape behavior.',
  width: 20,
  height: 20,
  walls: [
    // Vertical wall
    ...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((y): [number, number] => [8, y]),
    // Bottom horizontal wall
    ...[8, 9, 10, 11, 12].map((x): [number, number] => [x, 14]),
  ],
  start: { x: 5, y: 10 },
  goal: { x: 15, y: 8 },
  category: 'official',
};

/**
 * "The Chokepoints" — alternating vertical barriers with single gaps.
 * Tests how algorithms navigate multiple bottleneck passages.
 */
export const THE_CHOKEPOINTS: MapPreset = {
  id: 'chokepoints',
  name: 'The Chokepoints',
  description: 'Alternating barriers with single gaps — tests bottleneck navigation.',
  width: 20,
  height: 20,
  walls: [
    // Barrier 1 at x = 5 (gap at y = 17)
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((y): [number, number] => [5, y]),
    // Barrier 2 at x = 10 (gap at y = 2)
    ...[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((y): [number, number] => [10, y]),
    // Barrier 3 at x = 15 (gap at y = 16)
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((y): [number, number] => [15, y]),
  ],
  start: { x: 1, y: 10 },
  goal: { x: 18, y: 10 },
  category: 'official',
};

/**
 * "The Desert Oasis" — high-cost terrain swamp directly between start and goal.
 * Cost-aware search (A*, Dijkstra) detours around it; unweighted search (BFS) plows straight through.
 */
export const THE_DESERT_OASIS: MapPreset = {
  id: 'oasis',
  name: 'The Desert Oasis',
  description: 'Dense rough terrain swamp in the center — tests cost optimization vs step count.',
  width: 20,
  height: 20,
  walls: [
    // Upper wall guide
    ...[7, 8, 9, 10, 11, 12, 13].map((x): [number, number] => [x, 5]),
    // Lower wall guide
    ...[7, 8, 9, 10, 11, 12, 13].map((x): [number, number] => [x, 15]),
  ],
  costs: (() => {
    const c: [number, number, number][] = [];
    for (let x = 7; x <= 13; x++) {
      for (let y = 6; y <= 14; y++) {
        c.push([x, y, 10]);
      }
    }
    return c;
  })(),
  start: { x: 1, y: 10 },
  goal: { x: 18, y: 10 },
  category: 'official',
};

/**
 * "The Labyrinth" — multi-branching maze with dead ends and junction turns.
 * Tests deep exploration vs heuristic guidance.
 */
export const THE_LABYRINTH: MapPreset = {
  id: 'labyrinth',
  name: 'The Labyrinth',
  description: 'Complex multi-branch maze — tests heuristic pruning and dead-end avoidance.',
  width: 20,
  height: 20,
  walls: [
    ...Array.from({ length: 15 }, (_, i): [number, number] => [i + 1, 3]),
    ...Array.from({ length: 15 }, (_, i): [number, number] => [i + 4, 6]),
    ...Array.from({ length: 12 }, (_, i): [number, number] => [i + 1, 9]),
    ...[15, 16, 17, 18].map((x): [number, number] => [x, 9]),
    ...Array.from({ length: 14 }, (_, i): [number, number] => [i + 5, 12]),
    ...Array.from({ length: 15 }, (_, i): [number, number] => [i + 1, 15]),
    ...[0, 1, 2].map((y): [number, number] => [8, y]),
    ...[4, 5].map((y): [number, number] => [14, y]),
    ...[7, 8].map((y): [number, number] => [4, y]),
    ...[10, 11].map((y): [number, number] => [10, y]),
    ...[13, 14].map((y): [number, number] => [8, y]),
    ...[16, 17].map((y): [number, number] => [14, y]),
  ],
  start: { x: 1, y: 1 },
  goal: { x: 18, y: 18 },
  category: 'official',
};

/**
 * "Twin Chambers" — two courtyards joined by dual bridge crossings.
 * North bridge is clear; South bridge is high-cost rough terrain.
 */
export const TWIN_CHAMBERS: MapPreset = {
  id: 'twin_chambers',
  name: 'Twin Chambers',
  description: 'Two fortress courtyards with open north bridge vs high-cost south passage.',
  width: 20,
  height: 20,
  walls: [
    ...Array.from({ length: 20 }, (_, y) => y)
      .filter((y) => y !== 3 && y !== 16)
      .flatMap((y): [number, number][] => [[9, y], [10, y]]),
    [4, 4],
    [4, 15],
    [15, 4],
    [15, 15],
  ],
  costs: [
    [9, 16, 15],
    [10, 16, 15],
  ],
  start: { x: 3, y: 10 },
  goal: { x: 16, y: 10 },
  category: 'official',
};

/**
 * "Islands & Stepping Stones" — open desert arena dotted with boulder clusters.
 * Tests open-field multi-agent heuristic path diversity.
 */
export const ISLANDS_AND_STONES: MapPreset = {
  id: 'islands',
  name: 'Islands & Stepping Stones',
  description: 'Open desert dotted with boulder formations and scattered scrub patches.',
  width: 20,
  height: 20,
  walls: [
    ...[5, 6].flatMap((x): [number, number][] => [13, 14].map((y) => [x, y])),
    ...[10, 11, 12].flatMap((x): [number, number][] => [14, 15].map((y) => [x, y])),
    ...[6, 7].flatMap((x): [number, number][] => [8, 9].map((y) => [x, y])),
    ...[12, 13, 14].flatMap((x): [number, number][] => [9, 10].map((y) => [x, y])),
    ...[4, 5].flatMap((x): [number, number][] => [3, 4].map((y) => [x, y])),
    ...[9, 10, 11].flatMap((x): [number, number][] => [4, 5].map((y) => [x, y])),
    ...[15, 16].flatMap((x): [number, number][] => [6, 7].map((y) => [x, y])),
  ],
  costs: [
    ...[8, 9].flatMap((x): [number, number, number][] => [11, 12].map((y) => [x, y, 5])),
    ...[13, 14].flatMap((x): [number, number, number][] => [13, 14].map((y) => [x, y, 5])),
    ...[7, 8].flatMap((x): [number, number, number][] => [6, 7].map((y) => [x, y, 5])),
  ],
  start: { x: 2, y: 17 },
  goal: { x: 17, y: 2 },
  category: 'official',
};

/**
 * All official curated presets, indexed by stable key.
 */
export const PRESETS: Record<string, MapPreset> = {
  spiral: THE_SPIRAL,
  trap: LOCAL_MAXIMA_TRAP,
  chokepoints: THE_CHOKEPOINTS,
  oasis: THE_DESERT_OASIS,
  labyrinth: THE_LABYRINTH,
  twin_chambers: TWIN_CHAMBERS,
  islands: ISLANDS_AND_STONES,
};
