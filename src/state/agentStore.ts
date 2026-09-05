/**
 * Agent Store — Zustand store for agent management.
 *
 * ## TODO — Phase 4
 *
 * Implement the following store shape:
 *
 * ```ts
 * interface Agent {
 *   id: string;
 *   algorithmKey: string;        // key from ALGORITHMS registry
 *   color: string;               // from ALGORITHMS[key].color
 *   position: Point;
 *   status: 'idle' | 'running' | 'done';
 *   result?: AlgorithmResult;
 *
 *   // Visualization state (per-agent)
 *   visitedNodes: Set<string>;
 *   frontierNodes: Point[];
 *   currentPath: Point[];
 *   heuristicTarget?: Point;
 * }
 *
 * interface AgentState {
 *   agents: Agent[];
 *   addAgent: (algorithmKey: string) => void;
 *   removeAgent: (id: string) => void;
 *   updateAgent: (id: string, patch: Partial<Agent>) => void;
 *   clearAgents: () => void;
 * }
 * ```
 *
 * See init.md §4 Phase 4 for acceptance criteria.
 *
 * @module state/agentStore
 */

export {}; // Placeholder — remove when implementing
