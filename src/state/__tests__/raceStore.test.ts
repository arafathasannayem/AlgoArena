/**
 * Unit tests for Race Store.
 *
 * @module state/__tests__/raceStore.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useRaceStore } from '../raceStore';
import { useAgentStore } from '../agentStore';
import { useGridStore } from '../gridStore';

describe('Race Store', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(Date.now()), 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      clearTimeout(id);
    });

    useGridStore.getState().setSize(5, 5);
    useAgentStore.getState().clearAgents();
    useRaceStore.getState().resetRace();
  });

  afterEach(() => {
    useRaceStore.getState().resetRace();
    vi.unstubAllGlobals();
  });

  it('should initialize in idle state', () => {
    const state = useRaceStore.getState();
    expect(state.status).toBe('idle');
    expect(state.speed).toBe(60);
    expect(state.showResults).toBe(false);
  });

  it('should adjust speed without restarting', () => {
    useRaceStore.getState().setSpeed(20);
    expect(useRaceStore.getState().speed).toBe(20);
  });

  it('should not start race if no agents are placed', () => {
    useRaceStore.getState().startRace();
    expect(useRaceStore.getState().status).toBe('idle');
  });

  it('should start race, run tick steps, and complete when agents finish', () => {
    // Add A* and BFS agents
    useAgentStore.getState().addAgent('astar', '#3b82f6', { x: 0, y: 0 });
    useAgentStore.getState().addAgent('bfs', '#eab308', { x: 0, y: 0 });

    useRaceStore.getState().startRace();
    expect(useRaceStore.getState().status).toBe('running');

    // Run tick until finish
    let safetyLimit = 500;
    while (useRaceStore.getState().status === 'running' && safetyLimit > 0) {
      useRaceStore.getState().tick();
      safetyLimit--;
    }

    expect(useRaceStore.getState().status).toBe('finished');
    expect(useRaceStore.getState().showResults).toBe(true);

    const agents = useAgentStore.getState().agents;
    expect(agents[0]!.status).toBe('done');
    expect(agents[0]!.result?.status).toBe('success');
    expect(agents[1]!.status).toBe('done');
    expect(agents[1]!.result?.status).toBe('success');
  });
});
