/**
 * Race Store — Zustand store for race orchestration.
 *
 * Owns the algorithm generator instances, race execution status, playback speed,
 * and the central rAF-based scheduler that ticks all running agents concurrently:
 * 1. Scout Search Phase: Scouts sweep and evaluate frontier nodes without physical jumping.
 * 2. Path Runner Phase: Pawns smoothly sprint the discovered contiguous path step-by-step.
 *
 * @module state/raceStore
 */

import { create } from 'zustand';
import type { AlgorithmGenerator, Point } from '../algorithms/types';
import { ALGORITHMS } from '../algorithms';
import { useAgentStore } from './agentStore';
import { useGridStore } from './gridStore';

export interface RaceState {
  status: 'idle' | 'running' | 'finished';
  /** Delay per step in ms (smaller = faster). */
  speed: number;
  /** Number of discrete ticks executed in current race. */
  stepCount: number;
  /** Whether the post-race results modal is currently visible. */
  showResults: boolean;

  // Actions
  startRace: () => void;
  pauseRace: () => void;
  resumeRace: () => void;
  resetRace: () => void;
  stepForward: () => void;
  setSpeed: (ms: number) => void;
  dismissResults: () => void;
  tick: () => void;
}

// Module-scoped scheduler state (outside Zustand to avoid reactive overhead on 60fps ticks)
let generators = new Map<string, AlgorithmGenerator>();
let activeAgentIds = new Set<string>();
const runnerQueues = new Map<string, { path: Point[]; nextIndex: number }>();
let animationFrameId: number | null = null;
let lastTimestamp: number | null = null;
let accumulator = 0;

function stopLoop() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  lastTimestamp = null;
  accumulator = 0;
}

function runScheduler() {
  stopLoop();

  const loop = (timestamp: number) => {
    const state = useRaceStore.getState();
    if (state.status !== 'running') {
      stopLoop();
      return;
    }

    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }

    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    accumulator += delta;

    const stepDelay = Math.max(5, state.speed);

    // If stepDelay is very small, tick multiple times per frame (up to 10 max to prevent locking)
    let iterations = 0;
    while (accumulator >= stepDelay && iterations < 10) {
      state.tick();
      accumulator -= stepDelay;
      iterations++;
      if (useRaceStore.getState().status !== 'running') {
        stopLoop();
        return;
      }
    }

    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);
}

export const useRaceStore = create<RaceState>((set) => ({
  status: 'idle',
  speed: 60, // 60ms delay per step default
  stepCount: 0,
  showResults: false,

  setSpeed: (ms: number) => {
    set({ speed: ms });
  },

  dismissResults: () => {
    set({ showResults: false });
  },

  stepForward: () => {
    const state = useRaceStore.getState();
    if (state.status === 'idle') {
      if (activeAgentIds.size === 0 && runnerQueues.size === 0) {
        state.startRace();
        state.pauseRace();
      }
      state.tick();
    }
  },

  startRace: () => {
    const gridStore = useGridStore.getState();
    const agentStore = useAgentStore.getState();

    if (agentStore.agents.length === 0) return;

    // Reset all agents to start position and clear viz
    agentStore.resetAll(gridStore.start);

    // Create fresh generators for all placed agents
    const snapshot = gridStore.getSnapshot();
    generators = new Map();
    activeAgentIds = new Set();
    runnerQueues.clear();

    for (const agent of agentStore.agents) {
      const entry = ALGORITHMS[agent.algorithmKey];
      if (!entry) continue;

      try {
        const gen = entry.factory(snapshot);
        generators.set(agent.id, gen);
        activeAgentIds.add(agent.id);
        agentStore.setRunning(agent.id);
      } catch (err) {
        console.warn(`Failed to initialize generator for ${agent.algorithmKey}:`, err);
      }
    }

    if (activeAgentIds.size === 0) {
      set({ status: 'idle', showResults: false, stepCount: 0 });
      return;
    }

    set({ status: 'running', showResults: false, stepCount: 0 });
    runScheduler();
  },

  pauseRace: () => {
    stopLoop();
    set({ status: 'idle' });
  },

  resumeRace: () => {
    if (activeAgentIds.size === 0 && runnerQueues.size === 0) return;
    set({ status: 'running' });
    runScheduler();
  },

  resetRace: () => {
    stopLoop();
    generators.clear();
    activeAgentIds.clear();
    runnerQueues.clear();
    const gridStore = useGridStore.getState();
    useAgentStore.getState().resetAll(gridStore.start);
    set({ status: 'idle', showResults: false, stepCount: 0 });
  },

  tick: () => {
    set((s) => ({ stepCount: s.stepCount + 1 }));

    // If no agents are searching and no pawns are running, finish race
    if (activeAgentIds.size === 0 && runnerQueues.size === 0) {
      stopLoop();
      set({ status: 'finished', showResults: true });
      return;
    }

    const agentStore = useAgentStore.getState();
    const finishedSearchIds: string[] = [];

    // 1. Advance search phase for active generators
    for (const id of activeAgentIds) {
      const gen = generators.get(id);
      if (!gen) {
        finishedSearchIds.push(id);
        continue;
      }

      const step = gen.next();
      if (!step.done) {
        agentStore.applyStep(id, step.value);
        if (step.value.kind === 'done') {
          finishedSearchIds.push(id);
          if (step.value.result.status === 'success' && step.value.result.path && step.value.result.path.length > 0) {
            runnerQueues.set(id, { path: step.value.result.path, nextIndex: 0 });
          }
        }
      } else {
        if (step.value) {
          agentStore.applyStep(id, { kind: 'done', result: step.value });
          if (step.value.status === 'success' && step.value.path && step.value.path.length > 0) {
            runnerQueues.set(id, { path: step.value.path, nextIndex: 0 });
          }
        }
        finishedSearchIds.push(id);
      }
    }

    for (const id of finishedSearchIds) {
      activeAgentIds.delete(id);
    }

    // 2. Advance runner phase for completed algorithms (pawn walks the contiguous path)
    const finishedRunners: string[] = [];
    for (const [id, runner] of runnerQueues) {
      const nextPoint = runner.path[runner.nextIndex];
      if (nextPoint) {
        agentStore.advancePawn(id, nextPoint);
        runner.nextIndex++;
      }

      if (runner.nextIndex >= runner.path.length) {
        finishedRunners.push(id);
      }
    }

    for (const id of finishedRunners) {
      runnerQueues.delete(id);
    }

    // Check if everything has finished
    if (activeAgentIds.size === 0 && runnerQueues.size === 0) {
      stopLoop();
      set({ status: 'finished', showResults: true });
    }
  },
}));
