/**
 * Map Presets
 *
 * Static wall-set definitions for preset maps from the GDD.
 * These are loadable from the Tool Palette preset buttons.
 *
 * Presets:
 * 1. "The Spiral" — winding corridor forcing deep paths
 * 2. "Local Maxima Trap" — U-shaped concave wall trapping greedy algorithms
 * 3. "The Chokepoints" — alternating wall barriers with narrow passages
 *
 * @module maps/presets
 */

import type { Point } from '../algorithms/types';

export interface MapPreset {
  /** Display name in the UI dropdown. */
  name: string;
  /** Description shown as tooltip / subtitle. */
  description: string;
  /** Grid width this preset is designed for. */
  width: number;
  /** Grid height this preset is designed for. */
  height: number;
  /** Wall cell coordinates as [x, y] tuples. */
  walls: [number, number][];
  /** Recommended start point. */
  start: Point;
  /** Recommended goal point. */
  goal: Point;
}

/**
 * "The Spiral" — a spiral-shaped maze that forces long winding paths.
 * Tests how algorithms handle non-obvious shortest paths.
 */
export const THE_SPIRAL: MapPreset = {
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
};

/**
 * "Local Maxima Trap" — a U-shaped wall that traps greedy algorithms.
 * Hill Climbing gets trapped; Simulated Annealing escapes.
 */
export const LOCAL_MAXIMA_TRAP: MapPreset = {
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
};

/**
 * "The Chokepoints" — alternating vertical barriers with single gaps.
 * Tests how algorithms navigate multiple bottleneck passages.
 */
export const THE_CHOKEPOINTS: MapPreset = {
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
};

/**
 * All available presets, indexed by a stable key.
 */
export const PRESETS: Record<string, MapPreset> = {
  spiral: THE_SPIRAL,
  trap: LOCAL_MAXIMA_TRAP,
  chokepoints: THE_CHOKEPOINTS,
};
