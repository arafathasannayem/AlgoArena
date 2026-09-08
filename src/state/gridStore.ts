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
export type Tool = 'wall' | 'eraser' | 'start' | 'goal' | 'cost';

export interface GridState {
  /** Grid width in cells. */
  width: number;
  /** Grid height in cells. */
  height: number;
  /** Set of "x,y" keys marking blocked cells. */
  walls: Set<string>;
  /** Map of "x,y" keys to custom traversal cost values. */
  costs: Map<string, number>;
  /** Active path cost value when painting cost tiles (e.g. 5). */
  highCostValue: number;
  /** The start tile. */
  start: Point;
  /** The primary goal tile (always `goals[0]`). */
  goal: Point;
  /** All goal tiles. Reaching any one of them counts as success. */
  goals: Point[];
  /** Currently selected editing tool. */
  activeTool: Tool;
  /** Whether to softly display path cost values directly on the tile design. */
  showCostLabels: boolean;

  // ── Actions ─────────────────────────────────────────────────────────────

  /** Toggle soft cost label display on tiles. */
  toggleCostLabels: () => void;
  /** Explicitly set cost label display on tiles. */
  setShowCostLabels: (show: boolean) => void;
  /** Resize the grid. Clears walls and costs, resets start/goal. */
  setSize: (w: number, h: number) => void;
  /** Add a wall at (x, y). Removes cost if any. No-op on start/goal or existing walls. */
  paintWall: (x: number, y: number) => void;
  /** Paint a high path cost tile at (x, y). Removes wall if any. */
  paintCost: (x: number, y: number, cost?: number) => void;
  /** Set the configurable high path cost value. */
  setHighCostValue: (cost: number) => void;
  /** Remove a wall, high cost tile, or goal at (x, y). The last remaining goal is protected. */
  eraseWall: (x: number, y: number) => void;
  /** Remove high cost tile at (x, y). */
  eraseCost: (x: number, y: number) => void;
  /** Remove a goal at (x, y). The last remaining goal is protected. */
  eraseGoal: (x: number, y: number) => void;
  /** Move the start point. Removes wall/cost at new position if any. */
  setStart: (p: Point) => void;
  /** Replace all goals with a single goal point. Removes wall/cost at it if any. */
  setGoal: (p: Point) => void;
  /** Toggle a goal tile in/out of the goal set. The last remaining goal is protected. */
  toggleGoal: (x: number, y: number) => void;
  /** Switch the active editing tool. */
  setActiveTool: (tool: Tool) => void;
  /** Remove all walls and custom costs (keeps size, start, goal). */
  clearGrid: () => void;
  /** Load a map preset (sets walls, start, goals, and resizes grid). */
  loadPreset: (
    walls: [number, number][],
    start: Point,
    goal: Point,
    width: number,
    height: number,
    costs?: [number, number, number][],
    goals?: Point[],
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
  costs: new Map<string, number>(),
  highCostValue: 5,
  start: { x: 0, y: 0 },
  goal: { x: 9, y: 9 },
  goals: [{ x: 9, y: 9 }],
  activeTool: 'wall',
  showCostLabels: true,

  toggleCostLabels: () => set((s) => ({ showCostLabels: !s.showCostLabels })),
  setShowCostLabels: (showCostLabels) => set({ showCostLabels }),

  setSize: (w, h) =>
    set({
      width: w,
      height: h,
      walls: new Set<string>(),
      costs: new Map<string, number>(),
      start: { x: 0, y: 0 },
      goal: { x: w - 1, y: h - 1 },
      goals: [{ x: w - 1, y: h - 1 }],
    }),

  paintWall: (x, y) => {
    const { walls, costs, start, goals, width, height } = get();
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const k = wk(x, y);
    // Don't paint walls on start or any goal tile
    if (k === wk(start.x, start.y) || goals.some((g) => k === wk(g.x, g.y))) return;
    if (walls.has(k)) return;
    const nextWalls = new Set(walls);
    nextWalls.add(k);
    if (costs.has(k)) {
      const nextCosts = new Map(costs);
      nextCosts.delete(k);
      set({ walls: nextWalls, costs: nextCosts });
    } else {
      set({ walls: nextWalls });
    }
  },

  paintCost: (x, y, cost) => {
    const { walls, costs, start, goals, width, height, highCostValue } = get();
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const k = wk(x, y);
    if (k === wk(start.x, start.y) || goals.some((g) => k === wk(g.x, g.y))) return;
    const assignedCost = cost ?? highCostValue;
    const nextCosts = new Map(costs);
    nextCosts.set(k, assignedCost);
    if (walls.has(k)) {
      const nextWalls = new Set(walls);
      nextWalls.delete(k);
      set({ costs: nextCosts, walls: nextWalls });
    } else {
      set({ costs: nextCosts });
    }
  },

  setHighCostValue: (cost) => set({ highCostValue: Math.max(2, Math.round(cost)) }),

  eraseWall: (x, y) => {
    const { walls, costs, goals } = get();
    const k = wk(x, y);
    let changed = false;
    let nextWalls = walls;
    let nextCosts = costs;
    let nextGoals = goals;
    let nextGoal = get().goal;

    if (walls.has(k)) {
      nextWalls = new Set(walls);
      nextWalls.delete(k);
      changed = true;
    }
    if (costs.has(k)) {
      nextCosts = new Map(costs);
      nextCosts.delete(k);
      changed = true;
    }

    // Erase goal if present, protecting the last remaining goal
    const goalIdx = goals.findIndex((g) => g.x === x && g.y === y);
    if (goalIdx !== -1 && goals.length > 1) {
      nextGoals = goals.filter((_, idx) => idx !== goalIdx);
      nextGoal = nextGoals[0]!;
      changed = true;
    }

    if (changed) {
      set({ walls: nextWalls, costs: nextCosts, goals: nextGoals, goal: nextGoal });
    }
  },

  eraseCost: (x, y) => {
    const { costs } = get();
    const k = wk(x, y);
    if (!costs.has(k)) return;
    const nextCosts = new Map(costs);
    nextCosts.delete(k);
    set({ costs: nextCosts });
  },

  eraseGoal: (x, y) => {
    const { goals } = get();
    if (goals.length <= 1) return;
    const existingIdx = goals.findIndex((g) => g.x === x && g.y === y);
    if (existingIdx === -1) return;
    const nextGoals = goals.filter((_, idx) => idx !== existingIdx);
    set({ goals: nextGoals, goal: nextGoals[0]! });
  },

  setStart: (p) => {
    const { walls, costs } = get();
    const k = wk(p.x, p.y);
    const nextWalls = walls.has(k) ? new Set(walls) : walls;
    nextWalls.delete(k);
    const nextCosts = costs.has(k) ? new Map(costs) : costs;
    nextCosts.delete(k);
    set({ start: p, walls: nextWalls, costs: nextCosts });
  },

  setGoal: (p) => {
    const { walls, costs } = get();
    const k = wk(p.x, p.y);
    const nextWalls = walls.has(k) ? new Set(walls) : walls;
    nextWalls.delete(k);
    const nextCosts = costs.has(k) ? new Map(costs) : costs;
    nextCosts.delete(k);
    set({ goal: p, goals: [{ ...p }], walls: nextWalls, costs: nextCosts });
  },

  toggleGoal: (x, y) => {
    const { walls, costs, goals, width, height } = get();
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const k = wk(x, y);
    const existing = goals.find((g) => k === wk(g.x, g.y));
    const p = { x, y };

    // Toggle off — but never remove the last remaining goal.
    if (existing) {
      if (goals.length === 1) return;
      const nextGoals = goals.filter((g) => g !== existing);
      set({ goals: nextGoals, goal: nextGoals[0]! });
      return;
    }

    // Toggle on — clear any wall/cost beneath the new goal tile.
    const nextWalls = walls.has(k) ? new Set(walls) : walls;
    nextWalls.delete(k);
    const nextCosts = costs.has(k) ? new Map(costs) : costs;
    nextCosts.delete(k);
    set({
      goals: [...goals, p],
      goal: goals[0]!,
      walls: nextWalls,
      costs: nextCosts,
    });
  },

  setActiveTool: (tool) => set({ activeTool: tool }),

  clearGrid: () => set({ walls: new Set<string>(), costs: new Map<string, number>() }),

  loadPreset: (walls, start, goal, width, height, costs, goals) => {
    const resolved = goals && goals.length > 0 ? goals.map((g) => ({ ...g })) : [{ ...goal }];
    return set({
      width,
      height,
      walls: new Set(walls.map(([x, y]) => wk(x, y))),
      costs: new Map(costs ? costs.map(([x, y, c]) => [wk(x, y), c]) : []),
      start,
      goal: resolved[0]!,
      goals: resolved,
    });
  },

  applyTool: (x, y) => {
    const state = get();
    switch (state.activeTool) {
      case 'wall':
        state.paintWall(x, y);
        break;
      case 'cost':
        state.paintCost(x, y);
        break;
      case 'eraser':
        state.eraseWall(x, y);
        break;
      case 'start':
        state.setStart({ x, y });
        break;
      case 'goal':
        state.toggleGoal(x, y);
        break;
    }
  },

  getSnapshot: () => {
    const { width, height, walls, costs, start, goal, goals } = get();
    return {
      width,
      height,
      walls: new Set(walls),
      costs: new Map(costs),
      start: { ...start },
      goal: { ...goal },
      goals: goals.map((g) => ({ ...g })),
    };
  },
}));
