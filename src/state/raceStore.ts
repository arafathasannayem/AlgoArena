/**
 * Race Store — Zustand store for race orchestration.
 *
 * Owns the algorithm generator instances, race execution status, playback speed,
 * and the central rAF-based scheduler that ticks all running agents concurrently.
 *
 * @module state/raceStore
 */

import { create } from 'zustand';
import type { AlgorithmGenerator } from '../algorithms/types';
import { ALGORITHMS } from '../algorithms';
import { useAgentStore } from './agentStore';
import { useGridStore } from './gridStore';

export interface RaceState {
  status: 'idle' | 'running' | 'finished';
  /** Delay per step in ms (smaller = faster). */
  speed: number;

  // Actions
  startRace: () => void;
  pauseRace: () => void;
  resumeRace: () => void;
  resetRace: () => void;
  setSpeed: (ms: number) => void;
  tick: () => void;
}

// Module-scoped scheduler state (outside Zustand to avoid reactive overhead on 60fps ticks)
let generators = new Map<string, AlgorithmGenerator>();
let activeAgentIds = new Set<string>();
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

  setSpeed: (ms: number) => {
    set({ speed: ms });
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
      set({ status: 'idle' });
      return;
    }

    set({ status: 'running' });
    runScheduler();
  },

  pauseRace: () => {
    stopLoop();
    set({ status: 'idle' });
  },

  resumeRace: () => {
    if (activeAgentIds.size === 0) return;
    set({ status: 'running' });
    runScheduler();
  },

  resetRace: () => {
    stopLoop();
    generators.clear();
    activeAgentIds.clear();
    const gridStore = useGridStore.getState();
    useAgentStore.getState().resetAll(gridStore.start);
    set({ status: 'idle' });
  },

  tick: () => {
    if (activeAgentIds.size === 0) {
      stopLoop();
      set({ status: 'finished' });
      return;
    }

    const agentStore = useAgentStore.getState();
    const finishedIds: string[] = [];

    for (const id of activeAgentIds) {
      const gen = generators.get(id);
      if (!gen) {
        finishedIds.push(id);
        continue;
      }

      const step = gen.next();
      if (!step.done) {
        agentStore.applyStep(id, step.value);
        if (step.value.kind === 'done') {
          finishedIds.push(id);
        }
      } else {
        if (step.value) {
          agentStore.applyStep(id, { kind: 'done', result: step.value });
        }
        finishedIds.push(id);
      }
    }

    for (const id of finishedIds) {
      activeAgentIds.delete(id);
    }

    if (activeAgentIds.size === 0) {
      stopLoop();
      set({ status: 'finished' });
    }
  },
}));
