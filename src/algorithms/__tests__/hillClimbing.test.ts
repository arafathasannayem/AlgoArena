/**
 * Unit tests for Hill Climbing.
 *
 * Tests cover all 4 shared fixture grids:
 *   1. Open field — finds a path (not necessarily optimal).
 *   2. Wall detour — navigates around obstacle.
 *   3. U-trap — HALTS with 'trapped' (no backtracking ⇒ no escaping the
 *               concave wall). This is what distinguishes it from search
 *               algorithms that can backtrack.
 *   4. Fully blocked — reports 'trapped' too: the walker gets stuck next to
 *               the walled goal with neighbors that cannot improve. The
 *               shared fixture note says "all algorithms report failed", but
 *               Hill Climbing's own semantics (design.md / stub) say 'failed'
 *               only when a node has NO neighbors at all — see the dedicated
 *               dead-end test below for that case.
 *
 * Validation of the generator protocol (step event ordering, heuristic
 * targets) and the trapped/failed distinction are also covered.
 *
 * @module algorithms/__tests__/hillClimbing.test
 */

import { describe, it, expect } from 'vitest';
import { hillClimbingSearch } from '../hillClimbing';
import type { StepEvent, AlgorithmResult } from '../types';
import {
  OPEN_FIELD,
  WALL_DETOUR,
  U_TRAP,
  FULLY_BLOCKED,
  pathEndpoints,
  pathIsContiguous,
  pathAvoidsWalls,
} from './fixtures';

// ── Helper ──────────────────────────────────────────────────────────────────

/** Run the generator to completion and collect events + final result. */
function run(grid: Parameters<typeof hillClimbingSearch>[0]) {
  const gen = hillClimbingSearch(grid);
  const events: StepEvent[] = [];
  let step = gen.next();
  while (!step.done) {
    events.push(step.value as StepEvent);
    step = gen.next();
  }
  return { events, result: step.value as AlgorithmResult };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Hill Climbing', () => {
  // ── Open field ──────────────────────────────────────────────────────────

  describe('open field (no walls)', () => {
    it('should find a path (status: success)', () => {
      const { result } = run(OPEN_FIELD);
      expect(result.status).toBe('success');
      expect(result.path).not.toBeNull();
    });

    it('should produce a valid contiguous path from start to goal', () => {
      const { result } = run(OPEN_FIELD);
      expect(result.path).not.toBeNull();
      const path = result.path!;
      expect(pathEndpoints(path, OPEN_FIELD.start, OPEN_FIELD.goal)).toBe(true);
      expect(pathIsContiguous(path)).toBe(true);
    });

    it('should report positive nodesExplored', () => {
      const { result } = run(OPEN_FIELD);
      expect(result.nodesExplored).toBeGreaterThan(0);
    });

    it('should report timeMs', () => {
      const { result } = run(OPEN_FIELD);
      expect(result.timeMs).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Wall detour ─────────────────────────────────────────────────────────

  describe('wall detour', () => {
    it('should find a path around the wall', () => {
      const { result } = run(WALL_DETOUR);
      expect(result.status).toBe('success');
      expect(result.path).not.toBeNull();
    });

    it('should produce a valid path that avoids walls', () => {
      const { result } = run(WALL_DETOUR);
      const path = result.path!;
      expect(pathEndpoints(path, WALL_DETOUR.start, WALL_DETOUR.goal)).toBe(true);
      expect(pathIsContiguous(path)).toBe(true);
      expect(pathAvoidsWalls(path, WALL_DETOUR.walls)).toBe(true);
    });
  });

  // ── U-trap ──────────────────────────────────────────────────────────────

  describe('U-trap', () => {
    it('should halt with status trapped (no backtracking)', () => {
      const { result } = run(U_TRAP);
      expect(result.status).toBe('trapped');
    });

    it('should keep the walked path when trapped', () => {
      const { result } = run(U_TRAP);
      expect(result.path).not.toBeNull();
      const path = result.path!;
      expect(path.length).toBeGreaterThan(1);
      // Walker never crosses a wall.
      expect(pathAvoidsWalls(path, U_TRAP.walls)).toBe(true);
      expect(pathIsContiguous(path)).toBe(true);
      // The walker should NOT have reached the goal inside the U.
      const last = path[path.length - 1]!;
      expect(last).not.toEqual(U_TRAP.goal);
    });
  });

  // ── Fully blocked ──────────────────────────────────────────────────────

  describe('fully blocked goal', () => {
    it('should halt with status trapped when stuck next to a walled goal', () => {
      const { result } = run(FULLY_BLOCKED);
      expect(result.status).toBe('trapped');
      expect(result.path).not.toBeNull();
    });
  });

  // ── Dead end (true 'failed') ───────────────────────────────────────────

  describe('dead end (no neighbors at all)', () => {
    it('should report failed when the current node has zero neighbors', () => {
      const { result } = run({
        width: 3,
        height: 3,
        walls: new Set<string>(['0,1', '2,1', '1,0', '1,2']),
        start: { x: 1, y: 1 },
        goal: { x: 0, y: 0 },
      });
      expect(result.status).toBe('failed');
      expect(result.path).toBeNull();
    });
  });

  // ── Generator protocol ─────────────────────────────────────────────────

  describe('generator protocol', () => {
    it('should yield visit events for explored nodes', () => {
      const { events } = run(OPEN_FIELD);
      const visits = events.filter((e): e is StepEvent & { kind: 'visit' } => e.kind === 'visit');
      expect(visits.length).toBeGreaterThan(0);
    });

    it('should yield consider events with heuristicTarget = goal', () => {
      const { events } = run(OPEN_FIELD);
      const considers = events.filter(
        (e): e is StepEvent & { kind: 'consider' } => e.kind === 'consider',
      );
      expect(considers.length).toBeGreaterThan(0);
      for (const c of considers) {
        expect(c.heuristicTarget).toEqual(OPEN_FIELD.goal);
      }
    });

    it('should yield a done event as the last yielded event', () => {
      const { events } = run(OPEN_FIELD);
      const lastEvent = events[events.length - 1];
      expect(lastEvent).toBeDefined();
      expect(lastEvent!.kind).toBe('done');
    });

    it('should yield path events during the walk', () => {
      const { events } = run(OPEN_FIELD);
      const paths = events.filter(
        (e): e is StepEvent & { kind: 'path' } => e.kind === 'path',
      );
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('should handle start === goal', () => {
      const gen = hillClimbingSearch({
        width: 3,
        height: 3,
        walls: new Set<string>(),
        start: { x: 1, y: 1 },
        goal: { x: 1, y: 1 },
      });
      const events: StepEvent[] = [];
      let step = gen.next();
      while (!step.done) {
        events.push(step.value as StepEvent);
        step = gen.next();
      }
      const result = step.value as AlgorithmResult;
      expect(result.status).toBe('success');
      expect(result.path).toHaveLength(1);
      expect(result.path![0]).toEqual({ x: 1, y: 1 });
    });

    it('should handle a 1×1 grid with start === goal', () => {
      const gen = hillClimbingSearch({
        width: 1,
        height: 1,
        walls: new Set<string>(),
        start: { x: 0, y: 0 },
        goal: { x: 0, y: 0 },
      });
      const events: StepEvent[] = [];
      let step = gen.next();
      while (!step.done) {
        events.push(step.value as StepEvent);
        step = gen.next();
      }
      const result = step.value as AlgorithmResult;
      expect(result.status).toBe('success');
    });
  });
});