/**
 * Leaderboard — Live-updating leaderboard during race.
 *
 * Positioned in the top-left (or embedded beneath agent panel), sorted by
 * proximity to goal (distance in Manhattan steps, closest first).
 *
 * Updates in real-time on every tick as agents explore the grid.
 *
 * @module ui/Leaderboard
 */

import { useMemo } from 'react';
import { useAgentStore } from '../state/agentStore';
import { useGridStore } from '../state/gridStore';
import { ALGORITHMS } from '../algorithms';
import { Trophy, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { Agent } from '../state/agentStore';

function getAgentPathCost(agent: Agent, costs: Map<string, number>): number {
  if (agent.result?.cost !== undefined) return agent.result.cost;
  if (!agent.result?.path || agent.result.path.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < agent.result.path.length; i++) {
    sum += costs.get(`${agent.result.path[i]!.x},${agent.result.path[i]!.y}`) ?? 1;
  }
  return sum;
}

export function Leaderboard() {
  const agents = useAgentStore((s) => s.agents);
  const goal = useGridStore((s) => s.goal);
  const costs = useGridStore((s) => s.costs);

  // Sort agents primarily by goal reached / distance to goal
  const ranked = useMemo(() => {
    return [...agents].sort((a, b) => {
      // 1. Successful finishers first
      const aDone = a.result?.status === 'success';
      const bDone = b.result?.status === 'success';
      if (aDone && !bDone) return -1;
      if (!aDone && bDone) return 1;

      if (aDone && bDone) {
        // Compare path cost, then path length, then time
        const aCost = getAgentPathCost(a, costs);
        const bCost = getAgentPathCost(b, costs);
        if (aCost !== bCost) return aCost - bCost;
        const aLen = a.result?.path?.length ?? Infinity;
        const bLen = b.result?.path?.length ?? Infinity;
        if (aLen !== bLen) return aLen - bLen;
        return (a.result?.timeMs ?? 0) - (b.result?.timeMs ?? 0);
      }

      // 2. Otherwise sort by Manhattan distance to goal
      const distA = Math.abs(a.position.x - goal.x) + Math.abs(a.position.y - goal.y);
      const distB = Math.abs(b.position.x - goal.x) + Math.abs(b.position.y - goal.y);
      if (distA !== distB) return distA - distB;

      // 3. Tie-break on nodes explored
      return a.visitedNodes.size - b.visitedNodes.size;
    });
  }, [agents, goal, costs]);

  if (agents.length === 0) return null;

  return (
    <div className="fixed top-4 left-72 bg-glass-bg backdrop-blur-md border border-glass-border rounded-panel p-3 flex flex-col gap-2 z-10 w-72 text-glass-text shadow-lg max-h-72 overflow-y-auto">
      <div className="flex items-center justify-between pb-1 border-b border-glass-border">
        <div className="flex items-center gap-1.5">
          <Trophy size={16} className="text-amber-400" />
          <span className="text-xs font-semibold tracking-wide">Live Standings</span>
        </div>
        <span className="text-[10px] text-glass-text/40">By Proximity to Goal</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {ranked.map((agent, index) => {
          const meta = ALGORITHMS[agent.algorithmKey];
          const label = meta ? meta.label : agent.algorithmKey;
          const dist = Math.abs(agent.position.x - goal.x) + Math.abs(agent.position.y - goal.y);
          const nodesExplored = agent.result ? agent.result.nodesExplored : agent.visitedNodes.size;

          return (
            <div
              key={agent.id}
              className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 border border-white/5 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-bold text-glass-text/40 w-3.5 text-center">
                  #{index + 1}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: agent.color }}
                />
                <span className="truncate font-medium">{label}</span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 text-[11px]">
                <span className="text-glass-text/60" title="Nodes explored">
                  {nodesExplored} exp
                </span>

                {agent.status === 'running' && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <Loader2 size={12} className="animate-spin" />
                    <span>{dist} left</span>
                  </span>
                )}

                {agent.status === 'done' && agent.result?.status === 'success' && (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 size={12} />
                    <span>Done (Cost {getAgentPathCost(agent, costs)}, {agent.result.path?.length}s)</span>
                  </span>
                )}

                {agent.status === 'done' && agent.result?.status === 'failed' && (
                  <span className="flex items-center gap-1 text-red-400 font-medium">
                    <XCircle size={12} />
                    <span>Failed</span>
                  </span>
                )}

                {agent.status === 'done' && agent.result?.status === 'trapped' && (
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <AlertTriangle size={12} />
                    <span>Trapped</span>
                  </span>
                )}

                {agent.status === 'idle' && (
                  <span className="text-glass-text/30">{dist} steps</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
