/**
 * Grid Store — Zustand store for the grid state.
 *
 * Manages grid dimensions, wall placement, start/goal points, active editing
 * tool, and preset loading. This store is the single source of truth for the
 * grid; both the 2D dev view (Phase 2) and the 3D diorama (Phase 3+) read
 * from it.
 *
 * @module state/gridStore
 */

import { create } from 'zustand';
import type { GridSnapshot, Point } from '../algorithms/types';

// ── Types ───────────────────────────────────────────────────────────────────

/** The editing tools available in the tool palette. */
export type Tool = 'wall' | 'eraser' | 'start' | 'goal';

export interface GridState {
  /** Grid width in cells. */
  width: number;
  /** Grid height in cells. */
  height: number;
  /** Set of "x,y" keys marking blocked cells. */
  walls: Set<string>;
  /** The start tile. */
  start: Point;
  /** The goal tile. */
  goal: Point;
  /** Currently selected editing tool. */
  activeTool: Tool;

  // ── Actions ─────────────────────────────────────────────────────────────

  /** Resize the grid. Clears walls and resets start/goal. */
  setSize: (w: number, h: number) => void;
  /** Add a wall at (x, y). No-op on start/goal or existing walls. */
  paintWall: (x: number, y: number) => void;
  /** Remove a wall at (x, y). No-op if no wall there. */
  eraseWall: (x: number, y: number) => void;
  /** Move the start point. Removes wall at new position if any. */
  setStart: (p: Point) => void;
  /** Move the goal point. Removes wall at new position if any. */
  setGoal: (p: Point) => void;
  /** Switch the active editing tool. */
  setActiveTool: (tool: Tool) => void;
  /** Remove all walls (keeps size, start, goal). */
  clearGrid: () => void;
  /** Load a map preset (sets walls, start, goal, and resizes grid). */
  loadPreset: (
    walls: [number, number][],
    start: Point,
    goal: Point,
    width: number,
    height: number,
  ) => void;
  /** Apply the currently active tool at grid position (x, y). */
  applyTool: (x: number, y: number) => void;
  /** Create an immutable GridSnapshot for the algorithm engine. */
  getSnapshot: () => GridSnapshot;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function wk(x: number, y: number): string {
  return `${x},${y}`;
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useGridStore = create<GridState>((set, get) => ({
  width: 10,
  height: 10,
  walls: new Set<string>(),
  start: { x: 0, y: 0 },
  goal: { x: 9, y: 9 },
  activeTool: 'wall',

  setSize: (w, h) =>
    set({
      width: w,
      height: h,
      walls: new Set<string>(),
      start: { x: 0, y: 0 },
      goal: { x: w - 1, y: h - 1 },
    }),

  paintWall: (x, y) => {
    const { walls, start, goal, width, height } = get();
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const k = wk(x, y);
    // Don't paint walls on start or goal
    if (k === wk(start.x, start.y) || k === wk(goal.x, goal.y)) return;
    if (walls.has(k)) return;
    const next = new Set(walls);
    next.add(k);
    set({ walls: next });
  },

  eraseWall: (x, y) => {
    const { walls } = get();
    const k = wk(x, y);
    if (!walls.has(k)) return;
    const next = new Set(walls);
    next.delete(k);
    set({ walls: next });
  },

  setStart: (p) => {
    const { walls } = get();
    const k = wk(p.x, p.y);
    if (walls.has(k)) {
      const next = new Set(walls);
      next.delete(k);
      set({ start: p, walls: next });
    } else {
      set({ start: p });
    }
  },

  setGoal: (p) => {
    const { walls } = get();
    const k = wk(p.x, p.y);
    if (walls.has(k)) {
      const next = new Set(walls);
      next.delete(k);
      set({ goal: p, walls: next });
    } else {
      set({ goal: p });
    }
  },

  setActiveTool: (tool) => set({ activeTool: tool }),

  clearGrid: () => set({ walls: new Set<string>() }),

  loadPreset: (walls, start, goal, width, height) =>
    set({
      width,
      height,
      walls: new Set(walls.map(([x, y]) => wk(x, y))),
      start,
      goal,
    }),

  applyTool: (x, y) => {
    const state = get();
    switch (state.activeTool) {
      case 'wall':
        state.paintWall(x, y);
        break;
      case 'eraser':
        state.eraseWall(x, y);
        break;
      case 'start':
        state.setStart({ x, y });
        break;
      case 'goal':
        state.setGoal({ x, y });
        break;
    }
  },

  getSnapshot: () => {
    const { width, height, walls, start, goal } = get();
    return {
      width,
      height,
      walls: new Set(walls),
      start: { ...start },
      goal: { ...goal },
    };
  },
}));
