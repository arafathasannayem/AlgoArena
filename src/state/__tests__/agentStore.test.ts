/**
 * Unit tests for Agent Store.
 *
 * @module state/__tests__/agentStore.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAgentStore } from '../agentStore';

describe('Agent Store', () => {
  beforeEach(() => {
    useAgentStore.getState().clearAgents();
  });

  it('should add an agent with initial values', () => {
    const store = useAgentStore.getState();
    store.addAgent('astar', '#3b82f6', { x: 0, y: 0 });

    const agents = useAgentStore.getState().agents;
    expect(agents).toHaveLength(1);
    expect(agents[0]!.algorithmKey).toBe('astar');
    expect(agents[0]!.color).toBe('#3b82f6');
    expect(agents[0]!.position).toEqual({ x: 0, y: 0 });
    expect(agents[0]!.status).toBe('idle');
    expect(agents[0]!.showOverlay).toBe(true);
  });

  it('should toggle agent overlay visibility', () => {
    const store = useAgentStore.getState();
    store.addAgent('astar', '#3b82f6', { x: 0, y: 0 });
    const id = useAgentStore.getState().agents[0]!.id;

    store.toggleOverlay(id);
    expect(useAgentStore.getState().agents[0]!.showOverlay).toBe(false);

    store.toggleOverlay(id);
    expect(useAgentStore.getState().agents[0]!.showOverlay).toBe(true);
  });

  it('should toggle all agent overlays and explicitly set all overlays', () => {
    const store = useAgentStore.getState();
    store.addAgent('astar', '#3b82f6', { x: 0, y: 0 });
    store.addAgent('bfs', '#eab308', { x: 0, y: 0 });

    expect(useAgentStore.getState().agents[0]!.showOverlay).toBe(true);
    expect(useAgentStore.getState().agents[1]!.showOverlay).toBe(true);

    // Toggle all off
    store.toggleAllOverlays();
    expect(useAgentStore.getState().agents[0]!.showOverlay).toBe(false);
    expect(useAgentStore.getState().agents[1]!.showOverlay).toBe(false);

    // Toggle all on
    store.toggleAllOverlays();
    expect(useAgentStore.getState().agents[0]!.showOverlay).toBe(true);
    expect(useAgentStore.getState().agents[1]!.showOverlay).toBe(true);

    // Explicitly set all to false
    store.setAllOverlays(false);
    expect(useAgentStore.getState().agents[0]!.showOverlay).toBe(false);
    expect(useAgentStore.getState().agents[1]!.showOverlay).toBe(false);
  });

  it('should toggle and set showExploredNodes independently', () => {
    const store = useAgentStore.getState();
    expect(store.showExploredNodes).toBe(true);

    store.toggleExploredNodes();
    expect(useAgentStore.getState().showExploredNodes).toBe(false);

    store.toggleExploredNodes();
    expect(useAgentStore.getState().showExploredNodes).toBe(true);

    store.setShowExploredNodes(false);
    expect(useAgentStore.getState().showExploredNodes).toBe(false);
  });

  it('should change an agent color with setColor', () => {
    const store = useAgentStore.getState();
    store.addAgent('astar', '#3b82f6', { x: 0, y: 0 });
    const id = useAgentStore.getState().agents[0]!.id;

    store.setColor(id, '#ff00aa');
    expect(useAgentStore.getState().agents[0]!.color).toBe('#ff00aa');
  });

  it('should remove an agent by ID', () => {
    const store = useAgentStore.getState();
    store.addAgent('astar', '#3b82f6', { x: 0, y: 0 });
    store.addAgent('bfs', '#eab308', { x: 0, y: 0 });
    expect(useAgentStore.getState().agents).toHaveLength(2);

    const firstId = useAgentStore.getState().agents[0]!.id;
    store.removeAgent(firstId);

    const agents = useAgentStore.getState().agents;
    expect(agents).toHaveLength(1);
    expect(agents[0]!.algorithmKey).toBe('bfs');
  });

  it('should apply step events to agent visualization state', () => {
    const store = useAgentStore.getState();
    store.addAgent('astar', '#3b82f6', { x: 0, y: 0 });
    const id = useAgentStore.getState().agents[0]!.id;

    // Consider event
    store.applyStep(id, { kind: 'consider', node: { x: 1, y: 0 }, heuristicTarget: { x: 9, y: 9 }, temperature: 88.5 });
    let agent = useAgentStore.getState().agents[0]!;
    expect(agent.scanPosition).toEqual({ x: 1, y: 0 });
    expect(agent.position).toEqual({ x: 0, y: 0 }); // Grounded on walkable path
    expect(agent.heuristicTarget).toEqual({ x: 9, y: 9 });
    expect(agent.temperature).toBe(88.5);

    // Consider without temperature (non-annealing algorithm) clears it
    store.applyStep(id, { kind: 'consider', node: { x: 1, y: 1 } });
    agent = useAgentStore.getState().agents[0]!;
    expect(agent.temperature).toBeUndefined();

    // Advance pawn along path
    store.advancePawn(id, { x: 1, y: 0 });
    agent = useAgentStore.getState().agents[0]!;
    expect(agent.position).toEqual({ x: 1, y: 0 });

    // Visit event
    store.applyStep(id, { kind: 'visit', node: { x: 1, y: 0 } });
    agent = useAgentStore.getState().agents[0]!;
    expect(agent.visitedNodes.has('1,0')).toBe(true);

    // Frontier event
    store.applyStep(id, { kind: 'frontier', nodes: [{ x: 2, y: 0 }, { x: 1, y: 1 }] });
    agent = useAgentStore.getState().agents[0]!;
    expect(agent.frontierNodes).toHaveLength(2);

    // Path event
    store.applyStep(id, { kind: 'path', path: [{ x: 0, y: 0 }, { x: 1, y: 0 }] });
    agent = useAgentStore.getState().agents[0]!;
    expect(agent.currentPath).toHaveLength(2);

    // Done event
    store.applyStep(id, {
      kind: 'done',
      result: { status: 'success', path: [{ x: 0, y: 0 }, { x: 1, y: 0 }], nodesExplored: 2, timeMs: 5 },
    });
    agent = useAgentStore.getState().agents[0]!;
    expect(agent.status).toBe('done');
    expect(agent.result?.status).toBe('success');
  });

  it('should reset all agents to idle at new start position', () => {
    const store = useAgentStore.getState();
    store.addAgent('astar', '#3b82f6', { x: 0, y: 0 });
    const id = useAgentStore.getState().agents[0]!.id;
    store.applyStep(id, { kind: 'visit', node: { x: 1, y: 1 } });
    store.applyStep(id, { kind: 'consider', node: { x: 1, y: 1 }, temperature: 42 });

    store.resetAll({ x: 2, y: 2 });
    const agent = useAgentStore.getState().agents[0]!;
    expect(agent.position).toEqual({ x: 2, y: 2 });
    expect(agent.status).toBe('idle');
    expect(agent.visitedNodes.size).toBe(0);
    expect(agent.result).toBeUndefined();
    expect(agent.temperature).toBeUndefined();
  });

  it('should track arrival order via monotonic enteredAt counter', () => {
    const store = useAgentStore.getState();
    store.addAgent('astar', '#3b82f6', { x: 0, y: 0 });
    store.addAgent('bfs', '#eab308', { x: 0, y: 0 });

    const agents = useAgentStore.getState().agents;
    expect(agents[0]!.enteredAt).toBeDefined();
    expect(agents[1]!.enteredAt).toBeGreaterThan(agents[0]!.enteredAt);

    const firstEntered = agents[0]!.enteredAt;
    // Moving the first agent advances its enteredAt
    store.advancePawn(agents[0]!.id, { x: 1, y: 0 });
    const updatedAgent0 = useAgentStore.getState().agents[0]!;
    expect(updatedAgent0.enteredAt).toBeGreaterThan(firstEntered);
    expect(updatedAgent0.enteredAt).toBeGreaterThan(agents[1]!.enteredAt);

    // If advancePawn is called with same coordinates, enteredAt should NOT change
    const samePositionEntered = updatedAgent0.enteredAt;
    store.advancePawn(agents[0]!.id, { x: 1, y: 0 });
    expect(useAgentStore.getState().agents[0]!.enteredAt).toBe(samePositionEntered);
  });

  it('should maintain separate forward and backward scanner plates during bidirectional search', () => {
    const store = useAgentStore.getState();
    store.addAgent('bidir-bfs', '#ec4899', { x: 0, y: 0 });
    const id = useAgentStore.getState().agents[0]!.id;

    // Start-side consider event (forward)
    store.applyStep(id, {
      kind: 'consider',
      node: { x: 0, y: 1 },
      direction: 'forward',
    });

    let agent = useAgentStore.getState().agents[0]!;
    expect(agent.scanPosition).toEqual({ x: 0, y: 1 });
    expect(agent.scanPositionBackward).toBeUndefined();

    // Goal-side consider event (backward)
    store.applyStep(id, {
      kind: 'consider',
      node: { x: 9, y: 8 },
      direction: 'backward',
      heuristicTarget: { x: 0, y: 0 },
    });

    agent = useAgentStore.getState().agents[0]!;
    // Forward plate remains untouched on its side
    expect(agent.scanPosition).toEqual({ x: 0, y: 1 });
    // Backward plate updates on its side
    expect(agent.scanPositionBackward).toEqual({ x: 9, y: 8 });
    expect(agent.heuristicTargetBackward).toEqual({ x: 0, y: 0 });

    // Subsequent start-side consider does not alter backward plate
    store.applyStep(id, {
      kind: 'consider',
      node: { x: 1, y: 1 },
      direction: 'forward',
      heuristicTarget: { x: 9, y: 9 },
    });

    agent = useAgentStore.getState().agents[0]!;
    expect(agent.scanPosition).toEqual({ x: 1, y: 1 });
    expect(agent.heuristicTarget).toEqual({ x: 9, y: 9 });
    expect(agent.scanPositionBackward).toEqual({ x: 9, y: 8 });
    expect(agent.heuristicTargetBackward).toEqual({ x: 0, y: 0 });

    // Reset clears both scanner plates
    store.resetAll({ x: 0, y: 0 });
    agent = useAgentStore.getState().agents[0]!;
    expect(agent.scanPosition).toBeUndefined();
    expect(agent.scanPositionBackward).toBeUndefined();
    expect(agent.heuristicTargetBackward).toBeUndefined();
  });
});
