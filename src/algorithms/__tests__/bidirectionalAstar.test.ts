/**
 * Unit tests for Bidirectional A*.
 *
 * Tests cover all 4 shared fixture grids:
 *   1. Open field — finds the optimal shortest path.
 *   2. Wall detour — navigates around obstacle.
 *   3. U-trap — solves despite the concave wall.
 *   4. Fully blocked — reports 'failed' when goal is unreachable.
 *
 * Additional tests verify the generator protocol (step event ordering),
 * correctness of path reconstruction (the two halves joined), and meeting
 * point behavior.
 *
 * @module algorithms/__tests__/bidirectionalAstar.test
 */

import { describe, it, expect } from 'vitest';
import { bidirectionalAStar } from '../bidirectionalAstar';
import type { StepEvent, AlgorithmResult } from '../types';
import {
  OPEN_FIELD,
  OPEN_FIELD_OPTIMAL_LENGTH,
  WALL_DETOUR,
  U_TRAP,
  FULLY_BLOCKED,
  MULTI_GOAL_OPEN,
  MULTI_GOAL_WALLED_GOAL,
  pathEndpoints,
  pathEndsAtAnyGoal,
  pathIsContiguous,
  pathAvoidsWalls,
  wallSet,
} from './fixtures';

// ── Helper ──────────────────────────────────────────────────────────────────

/** Run the generator to completion and collect events + final result. */
function run(grid: Parameters<typeof bidirectionalAStar>[0]) {
  const gen = bidirectionalAStar(grid);
  const events: StepEvent[] = [];
  let step = gen.next();
  while (!step.done) {
    events.push(step.value as StepEvent);
    step = gen.next();
  }
  return { events, result: step.value as AlgorithmResult };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Bidirectional A*', () => {
  // ── Open field ──────────────────────────────────────────────────────────

  describe('open field (no walls)', () => {
    it('should find a path (status: success)', () => {
      const { result } = run(OPEN_FIELD);
      expect(result.status).toBe('success');
      expect(result.path).not.toBeNull();
    });

    it('should find the optimal shortest path', () => {
      const { result } = run(OPEN_FIELD);
      expect(result.path).toHaveLength(OPEN_FIELD_OPTIMAL_LENGTH);
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
    it('should solve the U-trap (status: success)', () => {
      const { result } = run(U_TRAP);
      expect(result.status).toBe('success');
      expect(result.path).not.toBeNull();
    });

    it('should produce a valid path through the U-trap', () => {
      const { result } = run(U_TRAP);
      const path = result.path!;
      expect(pathEndpoints(path, U_TRAP.start, U_TRAP.goal)).toBe(true);
      expect(pathIsContiguous(path)).toBe(true);
      expect(pathAvoidsWalls(path, U_TRAP.walls)).toBe(true);
    });
  });

  // ── Fully blocked ──────────────────────────────────────────────────────

  describe('fully blocked goal', () => {
    it('should report failed when goal is unreachable', () => {
      const { result } = run(FULLY_BLOCKED);
      expect(result.status).toBe('failed');
      expect(result.path).toBeNull();
    });

    it('should still report nodesExplored > 0', () => {
      const { result } = run(FULLY_BLOCKED);
      expect(result.nodesExplored).toBeGreaterThan(0);
    });
  });

  // ── Generator protocol ─────────────────────────────────────────────────

  describe('generator protocol', () => {
    it('should yield visit events for explored nodes', () => {
      const { events } = run(OPEN_FIELD);
      const visits = events.filter((e): e is StepEvent & { kind: 'visit' } => e.kind === 'visit');
      expect(visits.length).toBeGreaterThan(0);
    });

    it('should yield consider events with a heuristicTarget', () => {
      const { events } = run(OPEN_FIELD);
      const considers = events.filter(
        (e): e is StepEvent & { kind: 'consider' } => e.kind === 'consider',
      );
      expect(considers.length).toBeGreaterThan(0);
      for (const c of considers) {
        // Bidirectional A* points at the opposite endpoint from the expanding side.
        expect(c.heuristicTarget).toBeDefined();
      }
    });

    it('should yield consider events with direction for forward and backward frontiers', () => {
      const { events } = run(OPEN_FIELD);
      const considers = events.filter(
        (e): e is StepEvent & { kind: 'consider' } => e.kind === 'consider',
      );
      const forwardConsiders = considers.filter((c) => c.direction === 'forward');
      const backwardConsiders = considers.filter((c) => c.direction === 'backward');
      expect(forwardConsiders.length).toBeGreaterThan(0);
      expect(backwardConsiders.length).toBeGreaterThan(0);
    });

    it('should yield frontier events', () => {
      const { events } = run(OPEN_FIELD);
      const frontiers = events.filter(
        (e): e is StepEvent & { kind: 'frontier' } => e.kind === 'frontier',
      );
      expect(frontiers.length).toBeGreaterThan(0);
    });

    it('should yield a done event as the last yielded event', () => {
      const { events } = run(OPEN_FIELD);
      const lastEvent = events[events.length - 1];
      expect(lastEvent).toBeDefined();
      expect(lastEvent!.kind).toBe('done');
    });

    it('should yield path events during search', () => {
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
      const gen = bidirectionalAStar({
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
      const gen = bidirectionalAStar({
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
      expect(result.path).toHaveLength(1);
    });

    it('should handle adjacent start and goal', () => {
      const { result } = run({
        width: 3,
        height: 3,
        walls: new Set<string>(),
        start: { x: 0, y: 0 },
        goal: { x: 1, y: 0 },
      });
      expect(result.status).toBe('success');
      expect(result.path).toHaveLength(2);
    });

    it('should detour around high cost tiles when a lower-cost path exists', () => {
      // Direct path (0,0)->(1,0)->(2,0) passes through (1,0).
      // Detour path (0,0)->(0,1)->(1,1)->(2,1)->(2,0) takes 4 steps (cost 4).
      // When (1,0) has cost 10, total direct path cost is 11 > 4.
      const costs = new Map<string, number>();
      costs.set('1,0', 10);

      const { result } = run({
        width: 3,
        height: 2,
        walls: new Set<string>(),
        costs,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 0 },
      });

      expect(result.status).toBe('success');
      expect(result.path).not.toBeNull();
      // Should detour: path must NOT pass through high-cost cell (1,0)
      const passedThroughHighCost = result.path!.some((p) => p.x === 1 && p.y === 0);
      expect(passedThroughHighCost).toBe(false);
      expect(result.path).toHaveLength(5); // 4 steps + start = 5 nodes
    });
  });

  // ── Multi-goal behavior ────────────────────────────────────────────────
  describe('multi-goal behavior', () => {
    it('should run bidirectional checks from all goal points (not picking only one ahead of time)', () => {
      const { events, result } = run(MULTI_GOAL_OPEN);
      expect(result.status).toBe('success');
      expect(result.path).not.toBeNull();
      expect(pathEndsAtAnyGoal(result.path!, MULTI_GOAL_OPEN.start, MULTI_GOAL_OPEN.goals!)).toBe(true);

      // Verify that every goal point was visited and explored
      const visitedCoords = new Set(
        events
          .filter((e): e is StepEvent & { kind: 'visit' } => e.kind === 'visit')
          .map((e) => `${e.node.x},${e.node.y}`),
      );

      for (const g of MULTI_GOAL_OPEN.goals!) {
        expect(visitedCoords.has(`${g.x},${g.y}`)).toBe(true);
      }
    });

    it('should find the path to the reachable goal when a geometrically nearer goal is walled off', () => {
      // Goal 1 at (2,0) is closer (dist 2) to start (0,0) but completely boxed in.
      // Goal 2 at (0,4) is farther (dist 4) but completely open.
      const boxedGrid = {
        width: 5,
        height: 5,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 0 },
        goals: [
          { x: 2, y: 0 }, // walled off
          { x: 0, y: 4 }, // open and reachable
        ],
        walls: wallSet([
          [1, 0],
          [2, 1],
          [3, 0],
        ]),
      };

      const { events, result } = run(boxedGrid);
      expect(result.status).toBe('success');
      expect(result.path).not.toBeNull();
      // Ends at the open goal (0, 4)
      const last = result.path![result.path!.length - 1]!;
      expect(last).toEqual({ x: 0, y: 4 });

      // Both goals were checked
      const visitedCoords = new Set(
        events
          .filter((e): e is StepEvent & { kind: 'visit' } => e.kind === 'visit')
          .map((e) => `${e.node.x},${e.node.y}`),
      );
      expect(visitedCoords.has('2,0')).toBe(true);
      expect(visitedCoords.has('0,4')).toBe(true);
    });

    it('should solve MULTI_GOAL_WALLED_GOAL fixture', () => {
      const { result } = run(MULTI_GOAL_WALLED_GOAL);
      expect(result.status).toBe('success');
      expect(result.path).not.toBeNull();
      expect(pathEndsAtAnyGoal(result.path!, MULTI_GOAL_WALLED_GOAL.start, MULTI_GOAL_WALLED_GOAL.goals!)).toBe(true);
    });
  });
});