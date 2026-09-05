/**
 * ResultsDashboard — Post-race analytics dashboard.
 *
 * Appears once all agents reach `done` and the race is finished.
 * Displays a comparative summary table showing:
 * - Ranked standings (#1, #2, #3)
 * - Algorithm name & color
 * - Status (success / failed / trapped)
 * - Execution Time (ms)
 * - Nodes Explored
 * - Path Length
 * - Total Path Cost (with terrain weighting)
 * - 1-Click "Copy Summary" to clipboard
 *
 * @module ui/ResultsDashboard
 */

import { useState, useEffect, useMemo } from 'react';
import { useAgentStore } from '../state/agentStore';
import { useRaceStore } from '../state/raceStore';
import { useGridStore } from '../state/gridStore';
import { ALGORITHMS } from '../algorithms';
import { playClick, playGoalChime } from '../utils/sound';
import {
  Trophy,
  Clock,
  Search,
  Navigation,
  X,
  RotateCcw,
  Award,
  Coins,
  Copy,
  Check,
} from 'lucide-react';

function getAgentPathCost(
  agent: ReturnType<typeof useAgentStore.getState>['agents'][0],
  costs: Map<string, number>
): number {
  if (agent.result?.cost !== undefined) return agent.result.cost;
  if (!agent.result?.path || agent.result.path.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < agent.result.path.length; i++) {
    const p = agent.result.path[i]!;
    sum += costs.get(`${p.x},${p.y}`) ?? 1;
  }
  return sum;
}

export function ResultsDashboard() {
  const agents = useAgentStore((s) => s.agents);
  const costs = useGridStore((s) => s.costs);
  const showResults = useRaceStore((s) => s.showResults);
  const dismissResults = useRaceStore((s) => s.dismissResults);
  const startRace = useRaceStore((s) => s.startRace);

  const [copied, setCopied] = useState(false);

  // Only show when raceStore flags showResults and all agents have finished
  const allDone = agents.length > 0 && agents.every((a) => a.status === 'done');

  // Victory chime when modal first appears
  useEffect(() => {
    if (showResults && allDone) {
      playGoalChime();
    }
  }, [showResults, allDone]);

  // Ranked order of all agents (successful ones with lowest cost first, then lowest steps, then lowest time)
  const rankedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      const aSuccess = a.result?.status === 'success';
      const bSuccess = b.result?.status === 'success';
      if (aSuccess && !bSuccess) return -1;
      if (!aSuccess && bSuccess) return 1;

      if (aSuccess && bSuccess) {
        const aCost = getAgentPathCost(a, costs);
        const bCost = getAgentPathCost(b, costs);
        if (aCost !== bCost) return aCost - bCost;
        const aLen = a.result?.path?.length ?? Infinity;
        const bLen = b.result?.path?.length ?? Infinity;
        if (aLen !== bLen) return aLen - bLen;
        return (a.result?.timeMs ?? 0) - (b.result?.timeMs ?? 0);
      }

      // If both non-success, sort by nodes explored
      return (a.result?.nodesExplored ?? 0) - (b.result?.nodesExplored ?? 0);
    });
  }, [agents, costs]);

  if (!showResults || !allDone) {
    return null;
  }

  const bestAgent = rankedAgents[0]?.result?.status === 'success' ? rankedAgents[0] : null;

  const handleCopySummary = async () => {
    const lines = [
      'Algorithm Arena — Race Results',
      '---------------------------------',
      ...rankedAgents.map((agent, i) => {
        const label = ALGORITHMS[agent.algorithmKey]?.label ?? agent.algorithmKey;
        const res = agent.result;
        if (!res) return `#${i + 1} ${label}: No result`;
        const statusStr = res.status.toUpperCase();
        const costStr = res.status === 'success' ? `Cost: ${getAgentPathCost(agent, costs)}, ` : '';
        const stepsStr = res.path ? `${res.path.length} steps, ` : '';
        return `#${i + 1} ${label}: [${statusStr}] ${costStr}${stepsStr}${res.nodesExplored} nodes explored in ${res.timeMs.toFixed(1)}ms`;
      }),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      playClick();
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback if clipboard API restricted
    }
  };

  const handleDismiss = () => {
    dismissResults();
    playClick();
  };

  const handleRaceAgain = () => {
    startRace();
    playClick();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900/95 border border-glass-border rounded-panel p-6 max-w-2xl w-full text-glass-text shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-glass-border pb-3">
          <div className="flex items-center gap-2">
            <Trophy size={22} className="text-amber-400" />
            <h2 className="text-lg font-bold tracking-wide text-white">Race Results</h2>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss to view board [Esc]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Winner Highlight (if any succeeded) */}
        {bestAgent && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-mono font-bold text-sm shrink-0">
              #1
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-amber-400" /> Best Path — {ALGORITHMS[bestAgent.algorithmKey]?.label ?? bestAgent.algorithmKey}
              </span>
              <p className="text-xs text-white/80 mt-0.5">
                Optimal cost of{' '}
                <span className="font-bold text-amber-300">
                  {getAgentPathCost(bestAgent, costs)}
                </span>{' '}
                ({bestAgent.result?.path ? `${bestAgent.result.path.length} steps` : ''}) completed in{' '}
                <span className="font-bold text-white">
                  {bestAgent.result?.timeMs.toFixed(1)}ms
                </span>{' '}
                across {bestAgent.result?.nodesExplored} nodes explored.
              </p>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                <th className="py-2 px-3">Rank & Algorithm</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Time (ms)
                  </span>
                </th>
                <th className="py-2 px-3">
                  <span className="flex items-center gap-1">
                    <Search size={12} /> Explored
                  </span>
                </th>
                <th className="py-2 px-3">
                  <span className="flex items-center gap-1">
                    <Navigation size={12} /> Steps
                  </span>
                </th>
                <th className="py-2 px-3">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Coins size={12} className="text-amber-400" /> Path Cost
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rankedAgents.map((agent, index) => {
                const meta = ALGORITHMS[agent.algorithmKey];
                const label = meta ? meta.label : agent.algorithmKey;
                const result = agent.result;

                let statusBadge: React.ReactNode;
                if (result?.status === 'success') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                      Success
                    </span>
                  );
                } else if (result?.status === 'trapped') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                      Trapped
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                      Failed
                    </span>
                  );
                }

                // Clean typographic rank indicator
                let rankColor = 'text-white/40';
                if (result?.status === 'success') {
                  if (index === 0) rankColor = 'text-amber-400 font-bold';
                  else if (index === 1) rankColor = 'text-slate-300 font-bold';
                  else if (index === 2) rankColor = 'text-amber-600 font-bold';
                }

                return (
                  <tr key={agent.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-semibold flex items-center gap-2">
                      <span className={`w-5 text-center text-xs font-mono ${rankColor}`}>
                        #{index + 1}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: agent.color }}
                      />
                      <span className="text-white">{label}</span>
                    </td>
                    <td className="py-2.5 px-3">{statusBadge}</td>
                    <td className="py-2.5 px-3 tabular-nums text-white/80 font-mono">
                      {result ? `${result.timeMs.toFixed(2)} ms` : '—'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-white/80 font-mono">
                      {result ? result.nodesExplored : '—'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums font-medium text-white font-mono">
                      {result?.path ? `${result.path.length} steps` : '—'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums font-bold text-amber-300 font-mono">
                      {result?.status === 'success' ? getAgentPathCost(agent, costs) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-glass-border">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              Inspect Board & Trails
            </button>

            <span className="text-white/20">•</span>

            {/* Copy Summary Button */}
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200 transition-colors"
              title="Copy match summary to clipboard"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleRaceAgain}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
          >
            <RotateCcw size={14} />
            <span>Race Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
