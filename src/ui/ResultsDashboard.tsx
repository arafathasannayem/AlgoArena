/**
 * ResultsDashboard — Post-race analytics dashboard.
 *
 * Appears once all agents reach `done` and the race is finished.
 * Displays a comparative summary table showing:
 * - Algorithm name & color
 * - Status (success / failed / trapped)
 * - Execution Time (ms)
 * - Nodes Explored
 * - Path Length
 *
 * @module ui/ResultsDashboard
 */

import { useAgentStore } from '../state/agentStore';
import { useRaceStore } from '../state/raceStore';
import { ALGORITHMS } from '../algorithms';
import { Trophy, Clock, Search, Navigation, X, RotateCcw, Award } from 'lucide-react';

export function ResultsDashboard() {
  const agents = useAgentStore((s) => s.agents);
  const showResults = useRaceStore((s) => s.showResults);
  const dismissResults = useRaceStore((s) => s.dismissResults);
  const startRace = useRaceStore((s) => s.startRace);

  // Only show when raceStore flags showResults and all agents have finished
  const allDone = agents.length > 0 && agents.every((a) => a.status === 'done');
  if (!showResults || !allDone) {
    return null;
  }

  // Find the winning agent (successful agent with shortest path, then lowest time)
  const successfulAgents = agents.filter((a) => a.result?.status === 'success');
  const bestAgent = successfulAgents.reduce<typeof agents[0] | null>((best, curr) => {
    if (!best) return curr;
    const bestLen = best.result?.path?.length ?? Infinity;
    const currLen = curr.result?.path?.length ?? Infinity;
    if (currLen < bestLen) return curr;
    if (currLen === bestLen) {
      return (curr.result?.timeMs ?? Infinity) < (best.result?.timeMs ?? Infinity) ? curr : best;
    }
    return best;
  }, null);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/90 border border-glass-border rounded-panel p-6 max-w-2xl w-full text-glass-text shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-glass-border pb-3">
          <div className="flex items-center gap-2">
            <Trophy size={22} className="text-amber-400" />
            <h2 className="text-lg font-bold tracking-wide">Race Results</h2>
          </div>

          <button
            onClick={dismissResults}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss to view board"
          >
            <X size={18} />
          </button>
        </div>

        {/* Winner Highlight (if any succeeded) */}
        {bestAgent && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center gap-3">
            <Award size={24} className="text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Optimal Path Winner
              </span>
              <p className="text-sm font-medium text-white">
                {ALGORITHMS[bestAgent.algorithmKey]?.label ?? bestAgent.algorithmKey} found a path of{' '}
                <span className="font-bold text-amber-300">{bestAgent.result?.path?.length}</span>{' '}
                steps in{' '}
                <span className="font-bold text-amber-300">
                  {bestAgent.result?.timeMs.toFixed(1)}ms
                </span>{' '}
                exploring {bestAgent.result?.nodesExplored} nodes.
              </p>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                <th className="py-2 px-3">Algorithm</th>
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
                    <Navigation size={12} /> Path Length
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {agents.map((agent) => {
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

                return (
                  <tr key={agent.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-semibold flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: agent.color }}
                      />
                      <span>{label}</span>
                    </td>
                    <td className="py-2.5 px-3">{statusBadge}</td>
                    <td className="py-2.5 px-3 tabular-nums text-white/80">
                      {result ? `${result.timeMs.toFixed(2)} ms` : '—'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-white/80">
                      {result ? result.nodesExplored : '—'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums font-medium text-white">
                      {result?.path ? `${result.path.length} steps` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-glass-border">
          <button
            onClick={dismissResults}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Inspect Board & Trails
          </button>

          <button
            onClick={startRace}
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
