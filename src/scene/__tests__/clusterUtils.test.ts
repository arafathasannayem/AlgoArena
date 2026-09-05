/**
 * Unit tests for multi-agent cluster layout utility.
 *
 * Verifies that agents sharing the same cell are arranged with non-overlapping
 * coordinates and scaled appropriately within the cell bounds.
 *
 * @module scene/__tests__/clusterUtils.test
 */

import { describe, it, expect } from 'vitest';
import { getClusterOffset } from '../clusterUtils';

describe('clusterUtils — getClusterOffset', () => {
  it('returns centered position and full scale for a single agent', () => {
    const single = getClusterOffset(0, 1);
    expect(single).toEqual({ offsetX: 0, offsetZ: 0, scale: 1.0 });

    const zero = getClusterOffset(0, 0);
    expect(zero).toEqual({ offsetX: 0, offsetZ: 0, scale: 1.0 });
  });

  it('positions 2 agents side-by-side without overlapping', () => {
    const p0 = getClusterOffset(0, 2);
    const p1 = getClusterOffset(1, 2);

    expect(p0.offsetX).toBeLessThan(0);
    expect(p1.offsetX).toBeGreaterThan(0);
    expect(p0.offsetZ).toBe(0);
    expect(p1.offsetZ).toBe(0);
    expect(p0.scale).toBe(0.78);
    expect(p1.scale).toBe(0.78);

    // Distance between centers must exceed pawn base diameter (0.6 * scale)
    const dist = Math.hypot(p1.offsetX - p0.offsetX, p1.offsetZ - p0.offsetZ);
    const diameter = 0.6 * p0.scale;
    expect(dist).toBeGreaterThan(diameter);

    // Must stay within tile boundary (-0.49 to +0.49)
    expect(Math.abs(p0.offsetX) + diameter / 2).toBeLessThan(0.49);
    expect(Math.abs(p1.offsetX) + diameter / 2).toBeLessThan(0.49);
  });

  it('positions 3 agents in a triangular formation without overlapping', () => {
    const p0 = getClusterOffset(0, 3);
    const p1 = getClusterOffset(1, 3);
    const p2 = getClusterOffset(2, 3);

    const pawns = [p0, p1, p2];
    const diameter = 0.6 * p0.scale;
    expect(p0.scale).toBe(0.68);

    // Check all pairs don't overlap
    for (let i = 0; i < pawns.length; i++) {
      for (let j = i + 1; j < pawns.length; j++) {
        const a = pawns[i]!;
        const b = pawns[j]!;
        const dist = Math.hypot(a.offsetX - b.offsetX, a.offsetZ - b.offsetZ);
        expect(dist).toBeGreaterThan(diameter);
      }
      // Must stay within tile boundary
      expect(Math.abs(pawns[i]!.offsetX) + diameter / 2).toBeLessThan(0.49);
      expect(Math.abs(pawns[i]!.offsetZ) + diameter / 2).toBeLessThan(0.49);
    }
  });

  it('positions 4 agents into 4 quadrants without overlapping', () => {
    const pawns = [
      getClusterOffset(0, 4),
      getClusterOffset(1, 4),
      getClusterOffset(2, 4),
      getClusterOffset(3, 4),
    ];
    const diameter = 0.6 * pawns[0]!.scale;
    expect(pawns[0]!.scale).toBe(0.58);

    for (let i = 0; i < pawns.length; i++) {
      for (let j = i + 1; j < pawns.length; j++) {
        const a = pawns[i]!;
        const b = pawns[j]!;
        const dist = Math.hypot(a.offsetX - b.offsetX, a.offsetZ - b.offsetZ);
        expect(dist).toBeGreaterThan(diameter);
      }
      // Must stay within tile boundary
      expect(Math.abs(pawns[i]!.offsetX) + diameter / 2).toBeLessThan(0.49);
      expect(Math.abs(pawns[i]!.offsetZ) + diameter / 2).toBeLessThan(0.49);
    }
  });

  it('handles overflow indices (4+) gracefully', () => {
    const p4 = getClusterOffset(4, 5);
    const p3 = getClusterOffset(3, 5);
    // Index 4 clamps to index 3 offset
    expect(p4.offsetX).toBe(p3.offsetX);
    expect(p4.offsetZ).toBe(p3.offsetZ);
    expect(p4.scale).toBe(0.58);
  });
});
