/**
 * Map Presets
 *
 * Static wall-set definitions for preset maps from the GDD.
 * These are loadable from a dropdown in the UI.
 *
 * ## TODO — Phase 2
 *
 * Finalize wall coordinates for each preset at each grid size.
 * Current definitions are for 20×20 grids.
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
 * All available presets, indexed by a stable key.
 */
export const PRESETS: Record<string, MapPreset> = {
  spiral: THE_SPIRAL,
  trap: LOCAL_MAXIMA_TRAP,
};
