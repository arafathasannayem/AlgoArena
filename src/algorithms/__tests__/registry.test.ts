/**
 * Unit tests for the algorithm registry.
 *
 * Verifies that the registry is correctly wired and that helper functions
 * accurately report implementation status.
 *
 * @module algorithms/__tests__/registry.test
 */

import { describe, it, expect } from 'vitest';
import { ALGORITHMS, getImplementedAlgorithms, getTodoAlgorithms } from '../index';

describe('Algorithm Registry', () => {
  it('should contain all 8 algorithms', () => {
    const keys = Object.keys(ALGORITHMS);
    expect(keys).toHaveLength(8);
    expect(keys).toContain('astar');
    expect(keys).toContain('bfs');
    expect(keys).toContain('dijkstra');
    expect(keys).toContain('dfs');
    expect(keys).toContain('greedy');
    expect(keys).toContain('hillclimb');
    expect(keys).toContain('annealing');
    expect(keys).toContain('bidir-bfs');
  });

  it('every entry should have label, color, factory, and implemented fields', () => {
    for (const [key, entry] of Object.entries(ALGORITHMS)) {
      expect(entry.label, `${key} missing label`).toBeTruthy();
      expect(entry.color, `${key} missing color`).toMatch(/^#[0-9a-f]{6}$/i);
      expect(entry.factory, `${key} missing factory`).toBeTypeOf('function');
      expect(entry.implemented, `${key} missing implemented flag`).toBeTypeOf('boolean');
    }
  });

  it('getImplementedAlgorithms should return only implemented ones', () => {
    const impl = getImplementedAlgorithms();
    const keys = Object.keys(impl);
    expect(keys).toContain('astar');
    expect(keys).toContain('bfs');
    expect(keys).toContain('greedy');
    expect(keys).toContain('bidir-bfs');
    // The rest are TODO
    expect(keys).not.toContain('dijkstra');
    expect(keys).not.toContain('dfs');
    expect(keys).not.toContain('hillclimb');
    expect(keys).not.toContain('annealing');
  });

  it('getTodoAlgorithms should return unimplemented algorithm keys', () => {
    const todos = getTodoAlgorithms();
    expect(todos).toContain('dijkstra');
    expect(todos).toContain('dfs');
    expect(todos).not.toContain('greedy');
    expect(todos).toContain('hillclimb');
    expect(todos).toContain('annealing');
    expect(todos).not.toContain('astar');
    expect(todos).not.toContain('bfs');
    expect(todos).not.toContain('bidir-bfs');
  });

  it('all colors should be unique', () => {
    const colors = Object.values(ALGORITHMS).map((e) => e.color);
    const unique = new Set(colors);
    expect(unique.size).toBe(colors.length);
  });
});
