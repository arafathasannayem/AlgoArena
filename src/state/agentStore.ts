/**
 * Agent Store — Zustand store for agent management.
 *
 * Manages the list of agents, their algorithm assignments, physical pawn positions,
 * active scout scanner positions, statuses, and per-agent visualization state.
 *
 * @module state/agentStore
 */

import { create } from 'zustand';
import type { AlgorithmResult, Point, StepEvent } from '../algorithms/types';

// ── Types ───────────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  /** Key from ALGORITHMS registry (e.g. 'astar', 'bfs'). */
  algorithmKey: string;
  /** Hex color from ALGORITHMS registry. */
  color: string;
  /** Physical pawn position on the grid (stays on valid walkable paths). */
  position: Point;
  /** Active scout scanner probe position evaluating candidate nodes. */
  scanPosition?: Point;
  /** Agent lifecycle status. */
  status: 'idle' | 'running' | 'done';
  /** Final result after the algorithm finishes. */
  result?: AlgorithmResult;

  // ── Per-agent visualization state ────────────────────────────────────
  /** Set of "x,y" keys for cells the algorithm has officially visited. */
  visitedNodes: Set<string>;
  /** Current frontier/open-set nodes. */
  frontierNodes: Point[];
  /** Current best-known path. */
  currentPath: Point[];
  /** Where the heuristic is pointing (A*, Greedy, etc.). */
  heuristicTarget?: Point;
  /** Whether this agent's visualization overlay is active. */
  showOverlay: boolean;
}

export interface AgentState {
  agents: Agent[];

  // Actions
  addAgent: (algorithmKey: string, color: string, start: Point) => void;
  removeAgent: (id: string) => void;
  clearAgents: () => void;
  toggleOverlay: (id: string) => void;

  /** Apply a step event from the race scheduler to an agent's visualization state. */
  applyStep: (agentId: string, event: StepEvent) => void;
  /** Advance the physical pawn one step along a validated path. */
  advancePawn: (agentId: string, point: Point) => void;
  /** Mark an agent as running (called by race start). */
  setRunning: (agentId: string) => void;
  /** Reset all agents to idle with cleared visualization state. */
  resetAll: (start: Point) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

let nextId = 1;

function createAgent(algorithmKey: string, color: string, start: Point): Agent {
  return {
    id: `agent-${nextId++}`,
    algorithmKey,
    color,
    position: { ...start },
    scanPosition: undefined,
    status: 'idle',
    visitedNodes: new Set(),
    frontierNodes: [],
    currentPath: [],
    showOverlay: true,
  };
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],

  addAgent: (algorithmKey, color, start) =>
    set((s) => ({
      agents: [...s.agents, createAgent(algorithmKey, color, start)],
    })),

  removeAgent: (id) =>
    set((s) => ({
      agents: s.agents.filter((a) => a.id !== id),
    })),

  clearAgents: () => set({ agents: [] }),

  toggleOverlay: (id) =>
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id === id ? { ...a, showOverlay: !a.showOverlay } : a,
      ),
    })),

  setRunning: (agentId) =>
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id === agentId ? { ...a, status: 'running' as const } : a,
      ),
    })),

  advancePawn: (agentId, point) =>
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id === agentId ? { ...a, position: { ...point } } : a,
      ),
    })),

  applyStep: (agentId, event) =>
    set((s) => ({
      agents: s.agents.map((a) => {
        if (a.id !== agentId) return a;

        switch (event.kind) {
          case 'consider': {
            return {
              ...a,
              scanPosition: { ...event.node },
              heuristicTarget: event.heuristicTarget
                ? { ...event.heuristicTarget }
                : undefined,
            };
          }
          case 'visit': {
            const visited = new Set(a.visitedNodes);
            visited.add(`${event.node.x},${event.node.y}`);
            return { ...a, visitedNodes: visited };
          }
          case 'frontier': {
            return { ...a, frontierNodes: [...event.nodes] };
          }
          case 'path': {
            return { ...a, currentPath: [...event.path] };
          }
          case 'done': {
            return {
              ...a,
              status: 'done' as const,
              result: event.result,
              currentPath: event.result.path ? [...event.result.path] : [],
            };
          }
        }
      }),
    })),

  resetAll: (start) =>
    set((s) => ({
      agents: s.agents.map((a) => ({
        ...a,
        status: 'idle' as const,
        position: { ...start },
        scanPosition: undefined,
        result: undefined,
        visitedNodes: new Set<string>(),
        frontierNodes: [],
        currentPath: [],
        heuristicTarget: undefined,
      })),
    })),
}));
