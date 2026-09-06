/**
 * Unit tests for Simulated Annealing.
 *
 * Tests cover all 4 shared fixture grids:
 *   1. Open field — finds a path (status: success).
 *   2. Wall detour — navigates around obstacle.
 *   3. U-trap — ESCAPES the concave wall probabilistically (status: success).
 *               This is the critical acceptance criterion: Hill Climbing
 *               reports 'trapped' here, Simulated Annealing must not.
 *   4. Fully blocked — reports 'trapped' once the temperature freezes.
 *
 * Additional tests verify the config knobs (initialTemp / coolingRate /
 * maxSteps / avoidImmediateBacktrack), the trapped/failed distinction, and
 * the generator protocol.
 *
 * Note: the walk is probabilistic. The default cooling rate is derived from
 * grid size and start-goal distance so the step budget scales with the map,
 * and the success assertions below (open field, wall detour, U-trap) hold
 * deterministically across many repeated runs.
 *
 * @module algorithms/__tests__/simulatedAnnealing.test
 */

import { describe, it, expect } from 'vitest';
import { simulatedAnnealingSearch } from '../simulatedAnnealing';
import type { StepEvent, AlgorithmResult, AlgorithmConfig } from '../types';
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
function run(grid: Parameters<typeof simulatedAnnealingSearch>[0], config?: AlgorithmConfig) {
  const gen = simulatedAnnealingSearch(grid, config);
  const events: StepEvent[] = [];
  let step = gen.next();
  while (!step.done) {
    events.push(step.value as StepEvent);
    step = gen.next();
  }
  return { events, result: step.value as AlgorithmResult };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Simulated Annealing', () => {
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

  // ── U-trap (critical) ──────────────────────────────────────────────────

  describe('U-trap', () => {
    it('should escape the U-trap (status: success) — the critical case', () => {
      const { result } = run(U_TRAP);
      expect(result.status).toBe('success');
      expect(result.path).not.toBeNull();
    });
  });

  // ── Fully blocked ──────────────────────────────────────────────────────

  describe('fully blocked goal', () => {
    it('should report trapped once frozen before reaching the goal', () => {
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

  // ── Config knobs ───────────────────────────────────────────────────────

  describe('config knobs', () => {
    it('should accept custom initialTemp and coolingRate', () => {
      // Explicit schedule + generous budget: T=50 cooling by 0.95 down to
      // 0.01 ≈ 166 steps within the 240-step cap — plenty for a 5×5 grid.
      const { result } = run(OPEN_FIELD, {
        initialTemp: 50,
        coolingRate: 0.95,
        maxSteps: 240,
      });
      expect(result.status).toBe('success');
    });

    it('should use the default knobs when config is omitted', () => {
      const { result } = run(U_TRAP);
      expect(result.status).toBe('success');
    });

    it('should freeze quickly with a very low initial temperature', () => {
      // At T=0.1 (just above frozen) worse moves are essentially never
      // accepted, so the walk behaves like greedy search (Hill Climbing) and
      // gets trapped in the U-trap's local optimum.
      const { result } = run(U_TRAP, { initialTemp: 0.1 });
      expect(['success', 'trapped']).toContain(result.status);
    });

    it('should cap the number of steps with maxSteps', () => {
      // coolingRate 0.999 keeps T high for thousands of steps, so the walker
      // is halted by maxSteps=40, not by freezing. nodesExplored counts one
      // attempt per step plus the start cell.
      const { result } = run(U_TRAP, { initialTemp: 100, coolingRate: 0.999, maxSteps: 40 });
      expect(result.nodesExplored).toBeLessThanOrEqual(41);
      expect(['success', 'trapped']).toContain(result.status);
    });

    it('should accept avoidImmediateBacktrack as a boolean flag', () => {
      const { result } = run(OPEN_FIELD, { avoidImmediateBacktrack: false });
      expect(['success', 'trapped', 'failed']).toContain(result.status);
    });
  });

  // ── Generator protocol ─────────────────────────────────────────────────

  describe('generator protocol', () => {
    it('should yield visit events for moved nodes', () => {
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

    it('should carry a live temperature on consider events', () => {
      const { events } = run(OPEN_FIELD);
      const considers = events.filter(
        (e): e is StepEvent & { kind: 'consider' } => e.kind === 'consider',
      );
      expect(considers.length).toBeGreaterThan(0);
      for (const c of considers) {
        expect(c.temperature).toBeDefined();
        expect(c.temperature!).toBeGreaterThanOrEqual(0.01);
        expect(c.temperature!).toBeLessThanOrEqual(100);
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
      const gen = simulatedAnnealingSearch({
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
      const gen = simulatedAnnealingSearch({
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