/**
 * Unit tests for Grid Store.
 *
 * @module state/__tests__/gridStore.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGridStore } from '../gridStore';
import { PRESETS } from '../../maps/presets';

describe('Grid Store', () => {
  beforeEach(() => {
    useGridStore.getState().setSize(10, 10);
    useGridStore.getState().clearGrid();
  });

  it('should initialize with default 10x10 dimensions and start/goal', () => {
    const state = useGridStore.getState();
    expect(state.width).toBe(10);
    expect(state.height).toBe(10);
    expect(state.start).toEqual({ x: 0, y: 0 });
    expect(state.goal).toEqual({ x: 9, y: 9 });
    expect(state.walls.size).toBe(0);
  });

  it('should paint and erase walls', () => {
    const store = useGridStore.getState();
    store.paintWall(3, 4);
    expect(useGridStore.getState().walls.has('3,4')).toBe(true);

    store.eraseWall(3, 4);
    expect(useGridStore.getState().walls.has('3,4')).toBe(false);
  });

  it('should not paint walls on start or goal coordinates', () => {
    const store = useGridStore.getState();
    store.paintWall(0, 0); // start
    store.paintWall(9, 9); // goal
    expect(useGridStore.getState().walls.has('0,0')).toBe(false);
    expect(useGridStore.getState().walls.has('9,9')).toBe(false);
  });

  it('should clear all walls on clearGrid', () => {
    const store = useGridStore.getState();
    store.paintWall(2, 2);
    store.paintWall(2, 3);
    expect(useGridStore.getState().walls.size).toBe(2);

    store.clearGrid();
    expect(useGridStore.getState().walls.size).toBe(0);
  });

  it('should resize grid and reset start/goal', () => {
    const store = useGridStore.getState();
    store.paintWall(1, 1);
    store.setSize(20, 20);

    const state = useGridStore.getState();
    expect(state.width).toBe(20);
    expect(state.height).toBe(20);
    expect(state.start).toEqual({ x: 0, y: 0 });
    expect(state.goal).toEqual({ x: 19, y: 19 });
    expect(state.walls.size).toBe(0);
  });

  it('should load presets correctly', () => {
    const store = useGridStore.getState();
    const preset = PRESETS['spiral']!;
    store.loadPreset(preset.walls, preset.start, preset.goal, preset.width, preset.height);

    const state = useGridStore.getState();
    expect(state.width).toBe(20);
    expect(state.height).toBe(20);
    expect(state.start).toEqual(preset.start);
    expect(state.goal).toEqual(preset.goal);
    expect(state.walls.size).toBe(preset.walls.length);
  });

  it('should produce an immutable snapshot for algorithms', () => {
    const store = useGridStore.getState();
    store.paintWall(5, 5);
    const snapshot = store.getSnapshot();

    expect(snapshot.width).toBe(10);
    expect(snapshot.height).toBe(10);
    expect(snapshot.walls.has('5,5')).toBe(true);

    // Snapshot modification shouldn't mutate store
    snapshot.walls.add('1,1');
    expect(useGridStore.getState().walls.has('1,1')).toBe(false);
  });
});
