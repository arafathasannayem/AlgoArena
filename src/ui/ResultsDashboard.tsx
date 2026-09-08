/**
 * ResultsDashboard — Brick-Themed Post-Race Standings & Analytics.
 *
 * Implements Section 4.3 & 5.4 of the UI/UX Guidelines:
 * - Brick White (#F4F4F4) card with 3px black border and hard offset drop shadow.
 * - Top header with 4 raised LEGO studs and circular close button.
 * - Stud medals: #1 Gold (#F2CD37), #2 Silver (#A3A2A4), #3 Bronze (#AA7F2E).
 * - Comparative analytics table with 1-click summary copy and Race Again CTA.
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

  const allDone = agents.length > 0 && agents.every((a) => a.status === 'done');

  useEffect(() => {
    if (showResults && allDone) {
      playGoalChime();
    }
  }, [showResults, allDone]);

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

      return (a.result?.nodesExplored ?? 0) - (b.result?.nodesExplored ?? 0);
    });
  }, [agents, costs]);

  if (!showResults || !allDone) {
    return null;
  }

  const bestAgent = rankedAgents[0]?.result?.status === 'success' ? rankedAgents[0] : null;

  const handleCopySummary = async () => {
    const lines = [
      'Algorithm Arena — Brick Racer Championship Results',
      '==================================================',
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
    <div className="fixed inset-0 bg-[#05131D]/65 backdrop-blur-sm z-[100] flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#F4F4F4] border-[3px] border-[#05131D] rounded-3xl p-6 max-w-2xl w-full text-[#05131D] shadow-[0_10px_0_rgba(5,19,29,0.35)] flex flex-col gap-4 relative">
        {/* 4 Raised Studs Header Affordance (§4.3) */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
        </div>

        {/* Circular Reddish-Brown 1x1 Round Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 w-7 h-7 rounded-full bg-[#582A12] hover:bg-[#6e3618] border-2 border-[#05131D] text-[#F4F4F4] flex items-center justify-center shadow-[0_2px_0_#05131D] active:translate-y-0.5 cursor-pointer"
          title="Dismiss [Esc]"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 border-b-2 border-[#05131D]/15 pb-3">
          <div className="p-2 rounded-xl bg-[#F2CD37] text-[#05131D] border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
            <Trophy size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#05131D] uppercase font-display">
              Championship Results
            </h2>
            <p className="text-xs text-[#595D60] font-semibold">
              Final standings and metrics for all 7 algorithm racers
            </p>
          </div>
        </div>

        {/* Winner Highlight */}
        {bestAgent && (
          <div className="bg-[#F2CD37]/25 border-2 border-[#05131D] rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_2px_0_#05131D]">
            <div className="w-9 h-9 rounded-full bg-[#F2CD37] border-2 border-[#05131D] flex items-center justify-center text-[#05131D] font-mono font-black text-sm shrink-0 shadow-sm">
              #1
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-[#05131D] uppercase tracking-wider flex items-center gap-1.5 font-display">
                <Award size={14} className="text-[#AA7F2E]" /> Best Path — {ALGORITHMS[bestAgent.algorithmKey]?.label ?? bestAgent.algorithmKey}
              </span>
              <p className="text-xs text-[#595D60] mt-0.5 font-medium">
                Optimal cost of{' '}
                <span className="font-bold text-[#05131D]">
                  {getAgentPathCost(bestAgent, costs)}
                </span>{' '}
                ({bestAgent.result?.path ? `${bestAgent.result.path.length} steps` : ''}) in{' '}
                <span className="font-bold text-[#05131D]">
                  {bestAgent.result?.timeMs.toFixed(1)}ms
                </span>{' '}
                across {bestAgent.result?.nodesExplored} nodes explored.
              </p>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="overflow-x-auto bg-white border-2 border-[#05131D] rounded-2xl p-1 shadow-[0_2px_0_#05131D]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-[#05131D]/15 text-[#595D60] uppercase tracking-wider text-[10px] font-black font-display">
                <th className="py-2 px-3">Racer</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Time
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
                  <span className="flex items-center gap-1 text-[#AA7F2E]">
                    <Coins size={12} /> Cost
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y border-[#05131D]/10 font-bold">
              {rankedAgents.map((agent, index) => {
                const meta = ALGORITHMS[agent.algorithmKey];
                const label = meta ? meta.label : agent.algorithmKey;
                const result = agent.result;

                let medalBadge = 'bg-[#595D60] text-white';
                if (index === 0) medalBadge = 'bg-[#F2CD37] text-[#05131D] border-[#05131D]';
                else if (index === 1) medalBadge = 'bg-[#A3A2A4] text-[#05131D] border-[#05131D]';
                else if (index === 2) medalBadge = 'bg-[#AA7F2E] text-white border-[#05131D]';

                let statusBadge: React.ReactNode;
                if (result?.status === 'success') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-md bg-[#237841]/15 text-[#237841] border border-[#237841]/30 font-bold">
                      SUCCESS
                    </span>
                  );
                } else if (result?.status === 'trapped') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-md bg-[#923978]/15 text-[#923978] border border-[#923978]/30 font-bold">
                      TRAPPED
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-md bg-[#C91A09]/15 text-[#C91A09] border border-[#C91A09]/30 font-bold">
                      FAILED
                    </span>
                  );
                }

                return (
                  <tr key={agent.id} className="hover:bg-[#f8f8f8] transition-colors">
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono shrink-0 border ${medalBadge}`}>
                        {index + 1}
                      </span>
                      <span
                        className="w-3 h-3 rounded-full border border-[#05131D] shrink-0 shadow-sm"
                        style={{ backgroundColor: agent.color }}
                      />
                      <span className="text-[#05131D] font-bold font-sans">{label}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[10px]">{statusBadge}</td>
                    <td className="py-2.5 px-3 tabular-nums font-mono text-[#595D60]">
                      {result ? `${result.timeMs.toFixed(1)}ms` : '—'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums font-mono text-[#595D60]">
                      {result ? result.nodesExplored : '—'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums font-mono text-[#05131D]">
                      {result?.path ? `${result.path.length}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums font-mono font-black text-[#05131D]">
                      {result?.status === 'success' ? getAgentPathCost(agent, costs) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t-2 border-[#05131D]/15">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDismiss}
              className="text-xs text-[#595D60] hover:text-[#05131D] font-bold transition-colors cursor-pointer"
            >
              Inspect Board
            </button>

            <button
              onClick={handleCopySummary}
              className="brick-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-[#05131D] text-xs font-bold shadow-[0_2px_0_#05131D] cursor-pointer"
              title="Copy match summary to clipboard"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-[#237841]" />
                  <span className="text-[#237841]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-[#0055BF]" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleRaceAgain}
            className="brick-btn flex items-center gap-1.5 px-4 py-2 bg-[#C91A09] hover:bg-[#b01607] text-[#F4F4F4] rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_3px_0_#05131D] cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Race Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
