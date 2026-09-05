/**
 * Unit tests for Curated Map Presets.
 *
 * Validates map boundaries, wall placement, cost bounds, and start/goal positions.
 *
 * @module maps/__tests__/presets.test
 */

import { describe, it, expect } from 'vitest';
import { PRESETS } from '../presets';

describe('Map Presets', () => {
  it('should contain at least 7 distinct presets', () => {
    const keys = Object.keys(PRESETS);
    expect(keys.length).toBeGreaterThanOrEqual(7);
    expect(keys).toContain('spiral');
    expect(keys).toContain('trap');
    expect(keys).toContain('chokepoints');
    expect(keys).toContain('oasis');
    expect(keys).toContain('labyrinth');
    expect(keys).toContain('twin_chambers');
    expect(keys).toContain('islands');
  });

  it.each(Object.entries(PRESETS))('preset %s should have valid geometry and walkable endpoints', (_key, preset) => {
    expect(preset.name).toBeTruthy();
    expect(preset.description).toBeTruthy();
    expect(preset.width).toBeGreaterThan(0);
    expect(preset.height).toBeGreaterThan(0);

    const wallSet = new Set(preset.walls.map(([x, y]) => `${x},${y}`));

    // Start must be within bounds and not on a wall
    expect(preset.start.x).toBeGreaterThanOrEqual(0);
    expect(preset.start.x).toBeLessThan(preset.width);
    expect(preset.start.y).toBeGreaterThanOrEqual(0);
    expect(preset.start.y).toBeLessThan(preset.height);
    expect(wallSet.has(`${preset.start.x},${preset.start.y}`)).toBe(false);

    // Goal must be within bounds and not on a wall
    expect(preset.goal.x).toBeGreaterThanOrEqual(0);
    expect(preset.goal.x).toBeLessThan(preset.width);
    expect(preset.goal.y).toBeGreaterThanOrEqual(0);
    expect(preset.goal.y).toBeLessThan(preset.height);
    expect(wallSet.has(`${preset.goal.x},${preset.goal.y}`)).toBe(false);

    // Start and goal cannot be identical
    expect(preset.start).not.toEqual(preset.goal);

    // All walls must be within bounds
    for (const [x, y] of preset.walls) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(preset.width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(preset.height);
    }

    // All costs must be within bounds and positive
    if (preset.costs) {
      for (const [x, y, cost] of preset.costs) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThan(preset.width);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThan(preset.height);
        expect(cost).toBeGreaterThan(1);
        expect(wallSet.has(`${x},${y}`)).toBe(false);
      }
    }
  });
});
