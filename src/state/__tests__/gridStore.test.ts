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

  it('should paint and erase high cost tiles with configurable cost value', () => {
    const store = useGridStore.getState();
    expect(store.highCostValue).toBe(5);

    store.setHighCostValue(8);
    expect(useGridStore.getState().highCostValue).toBe(8);

    // Paint cost tile using current highCostValue
    store.paintCost(4, 4);
    expect(useGridStore.getState().costs.get('4,4')).toBe(8);

    // Paint cost tile with explicit cost
    store.paintCost(4, 5, 12);
    expect(useGridStore.getState().costs.get('4,5')).toBe(12);

    // Erase cost tile
    store.eraseCost(4, 4);
    expect(useGridStore.getState().costs.has('4,4')).toBe(false);
    expect(useGridStore.getState().costs.get('4,5')).toBe(12);

    // Erase via generic eraseWall should also remove cost tile
    store.eraseWall(4, 5);
    expect(useGridStore.getState().costs.has('4,5')).toBe(false);
  });

  it('should replace wall with cost and vice versa', () => {
    const store = useGridStore.getState();
    store.paintWall(2, 2);
    expect(useGridStore.getState().walls.has('2,2')).toBe(true);
    expect(useGridStore.getState().costs.has('2,2')).toBe(false);

    // Painting cost over wall converts it
    store.paintCost(2, 2, 7);
    expect(useGridStore.getState().walls.has('2,2')).toBe(false);
    expect(useGridStore.getState().costs.get('2,2')).toBe(7);

    // Painting wall over cost converts it back
    store.paintWall(2, 2);
    expect(useGridStore.getState().walls.has('2,2')).toBe(true);
    expect(useGridStore.getState().costs.has('2,2')).toBe(false);
  });

  it('should include costs in getSnapshot and clear costs on clearGrid', () => {
    const store = useGridStore.getState();
    store.paintCost(1, 2, 6);
    const snapshot = store.getSnapshot();
    expect(snapshot.costs?.get('1,2')).toBe(6);

    store.clearGrid();
    expect(useGridStore.getState().costs.size).toBe(0);
  });

  it('should toggle and set cost labels visibility', () => {
    const store = useGridStore.getState();
    expect(store.showCostLabels).toBe(true);

    store.toggleCostLabels();
    expect(useGridStore.getState().showCostLabels).toBe(false);

    store.toggleCostLabels();
    expect(useGridStore.getState().showCostLabels).toBe(true);

    store.setShowCostLabels(false);
    expect(useGridStore.getState().showCostLabels).toBe(false);
  });

  // ── Multi-goal ──────────────────────────────────────────────────────────

  it('should include goals in the algorithm snapshot', () => {
    const store = useGridStore.getState();
    store.toggleGoal(4, 4);
    const snapshot = store.getSnapshot();

    expect(snapshot.goals).toHaveLength(2);
    expect(snapshot.goals).toContainEqual(store.goal);
    expect(snapshot.goals).toContainEqual({ x: 4, y: 4 });
  });

  it('should toggle a goal tile in, keeping primary goal synced as goals[0]', () => {
    const store = useGridStore.getState();
    store.toggleGoal(3, 7);

    const state = useGridStore.getState();
    expect(state.goals).toHaveLength(2);
    expect(state.goals[0]).toEqual({ x: 9, y: 9 });
    expect(state.goal).toEqual(state.goals[0]);
    expect(state.goals[1]).toEqual({ x: 3, y: 7 });
  });

  it('should toggle a goal tile out, protecting the last remaining goal', () => {
    const store = useGridStore.getState();
    store.toggleGoal(3, 7);
    store.toggleGoal(3, 7); // remove secondary
    expect(useGridStore.getState().goals).toHaveLength(1);

    // Attempting to remove the last goal is a no-op
    store.toggleGoal(9, 9);
    expect(useGridStore.getState().goals).toHaveLength(1);
    expect(useGridStore.getState().goal).toEqual({ x: 9, y: 9 });
  });

  it('should erase a goal with the eraser tool when multiple goals exist, protecting the last remaining goal', () => {
    const store = useGridStore.getState();
    store.toggleGoal(3, 7);
    store.toggleGoal(5, 5);
    expect(useGridStore.getState().goals).toHaveLength(3);

    // Set eraser tool and apply on secondary goal (3, 7)
    store.setActiveTool('eraser');
    store.applyTool(3, 7);

    let state = useGridStore.getState();
    expect(state.goals).toHaveLength(2);
    expect(state.goals.some((g) => g.x === 3 && g.y === 7)).toBe(false);

    // Erase the primary goal (9, 9)
    store.applyTool(9, 9);
    state = useGridStore.getState();
    expect(state.goals).toHaveLength(1);
    expect(state.goals[0]).toEqual({ x: 5, y: 5 });
    expect(state.goal).toEqual({ x: 5, y: 5 });

    // Attempt to erase the last remaining goal (5, 5) with eraser tool
    store.applyTool(5, 5);
    state = useGridStore.getState();
    expect(state.goals).toHaveLength(1);
    expect(state.goals[0]).toEqual({ x: 5, y: 5 });
    expect(state.goal).toEqual({ x: 5, y: 5 });
  });

  it('should erase goals directly via eraseGoal', () => {
    const store = useGridStore.getState();
    store.toggleGoal(2, 4);
    expect(useGridStore.getState().goals).toHaveLength(2);

    store.eraseGoal(2, 4);
    expect(useGridStore.getState().goals).toHaveLength(1);

    // Erasing last goal is a no-op
    store.eraseGoal(9, 9);
    expect(useGridStore.getState().goals).toHaveLength(1);
  });

  it('should not paint walls or cost on ANY goal tile', () => {
    const store = useGridStore.getState();
    store.toggleGoal(3, 7);

    store.paintWall(9, 9);
    store.paintWall(3, 7);
    store.paintCost(3, 7, 8);

    const state = useGridStore.getState();
    expect(state.walls.has('9,9')).toBe(false);
    expect(state.walls.has('3,7')).toBe(false);
    expect(state.costs.has('3,7')).toBe(false);
  });

  it('should clear walls/cost beneath a newly toggled goal tile', () => {
    const store = useGridStore.getState();
    store.paintWall(2, 2);
    store.paintCost(3, 3, 6);

    store.toggleGoal(2, 2);
    store.toggleGoal(3, 3);

    const state = useGridStore.getState();
    expect(state.walls.has('2,2')).toBe(false);
    expect(state.costs.has('3,3')).toBe(false);
    expect(state.goals).toContainEqual({ x: 2, y: 2 });
    expect(state.goals).toContainEqual({ x: 3, y: 3 });
  });

  it('should replace all goals back to a single one via setGoal', () => {
    const store = useGridStore.getState();
    store.toggleGoal(1, 1);
    store.toggleGoal(5, 5);

    store.setGoal({ x: 8, y: 2 });

    const state = useGridStore.getState();
    expect(state.goals).toEqual([{ x: 8, y: 2 }]);
    expect(state.goal).toEqual({ x: 8, y: 2 });
  });

  it('should load a preset with multiple goals (primary first)', () => {
    const store = useGridStore.getState();
    store.loadPreset([], { x: 0, y: 0 }, { x: 6, y: 6 }, 7, 7, undefined, [
      { x: 6, y: 6 },
      { x: 6, y: 0 },
      { x: 0, y: 6 },
    ]);

    const state = useGridStore.getState();
    expect(state.goal).toEqual({ x: 6, y: 6 });
    expect(state.goals).toHaveLength(3);
    expect(state.goals[0]).toEqual({ x: 6, y: 6 });
  });

  it('should reset goals when resizing the grid', () => {
    const store = useGridStore.getState();
    store.toggleGoal(2, 2);
    store.setSize(30, 30);

    const state = useGridStore.getState();
    expect(state.goals).toEqual([{ x: 29, y: 29 }]);
    expect(state.goal).toEqual({ x: 29, y: 29 });
  });
});
