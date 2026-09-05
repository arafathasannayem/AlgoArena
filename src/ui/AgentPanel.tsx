/**
 * AgentPanel — Floating glass panel for managing race agents.
 *
 * Positioned on the left or top-left, allows users to:
 * - Select an algorithm from the registry with search trait indicators
 * - 1-Click Quick Match setup (A* vs BFS showdown)
 * - Add a new agent to the race
 * - View existing agents with their status and color
 * - Toggle individual agent visualization overlays
 * - Remove single agent or Clear All
 *
 * Sourced directly from the ALGORITHMS registry to keep colors/labels in sync.
 *
 * @module ui/AgentPanel
 */

import { useState } from 'react';
import { useAgentStore } from '../state/agentStore';
import { useGridStore } from '../state/gridStore';
import { ALGORITHMS } from '../algorithms';
import { playClick } from '../utils/sound';
import { UserPlus, Trash2, Eye, EyeOff, Bot, Swords } from 'lucide-react';

const ALGO_TRAITS: Record<string, string> = {
  astar: 'Optimal Cost • Manhattan Heuristic',
  bfs: 'Fewest Steps • Unweighted',
  dijkstra: 'Cost-Optimal • Uniform Search',
  dfs: 'Deep Path • Non-Optimal',
  greedy: 'Greedy Heuristic • Fast Explorer',
  hillclimb: 'Local Ascent • Trap-Prone',
  annealing: 'Thermal Search • Escapes Traps',
};

export function AgentPanel() {
  const agents = useAgentStore((s) => s.agents);
  const addAgent = useAgentStore((s) => s.addAgent);
  const removeAgent = useAgentStore((s) => s.removeAgent);
  const toggleOverlay = useAgentStore((s) => s.toggleOverlay);
  const start = useGridStore((s) => s.start);

  // Default to first implemented algorithm
  const [selectedKey, setSelectedKey] = useState<string>('astar');

  const handleAddAgent = () => {
    const entry = ALGORITHMS[selectedKey];
    if (!entry) return;
    addAgent(selectedKey, entry.color, start);
    playClick();
  };

  const handleQuickMatch = () => {
    // Clear existing and add A* and BFS for instant race
    agents.forEach((a) => removeAgent(a.id));
    if (ALGORITHMS.astar) {
      addAgent('astar', ALGORITHMS.astar.color, start);
    }
    if (ALGORITHMS.bfs) {
      addAgent('bfs', ALGORITHMS.bfs.color, start);
    }
    playClick();
  };

  const handleClearAll = () => {
    agents.forEach((a) => removeAgent(a.id));
    playClick();
  };

  return (
    <div className="fixed top-4 left-4 bg-glass-bg backdrop-blur-md border border-glass-border rounded-panel p-3 flex flex-col gap-2.5 z-10 w-64 text-glass-text max-h-[calc(100vh-2rem)] overflow-y-auto shadow-xl">
      <div className="flex items-center justify-between pb-1 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-blue-400" />
          <span className="text-sm font-semibold tracking-wide">Agents ({agents.length})</span>
        </div>
        {agents.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-[10px] text-red-400/80 hover:text-red-300 font-medium px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
            title="Clear all placed agents"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Quick 1-Click Match Preset */}
      <button
        onClick={handleQuickMatch}
        className="flex items-center justify-center gap-2 w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors"
        title="Set up A* vs BFS match"
      >
        <Swords size={13} className="text-blue-400" />
        <span>Quick Match: A* vs BFS</span>
      </button>

      {/* Add Agent Form */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] uppercase tracking-wider text-glass-text/60 font-semibold">
          Select Algorithm
        </label>
        <div className="flex gap-2">
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="flex-1 bg-white/10 border border-glass-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {Object.entries(ALGORITHMS).map(([key, item]) => (
              <option key={key} value={key} className="bg-slate-900 text-white">
                {item.label} {!item.implemented ? '(TODO)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddAgent}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 shadow-sm"
            title="Add Agent to Grid"
          >
            <UserPlus size={16} />
          </button>
        </div>

        {/* Algorithm Characteristic Badge */}
        {ALGO_TRAITS[selectedKey] && (
          <div className="text-[10px] text-white/50 bg-white/5 border border-white/5 rounded px-2 py-1 leading-tight">
            {ALGO_TRAITS[selectedKey]}
          </div>
        )}
      </div>

      {/* Agent List */}
      {agents.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-glass-border">
          <span className="text-[10px] uppercase tracking-wider text-glass-text/40 font-semibold">
            Placed Agents
          </span>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {agents.map((agent) => {
              const meta = ALGORITHMS[agent.algorithmKey];
              const label = meta ? meta.label : agent.algorithmKey;

              return (
                <div
                  key={agent.id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/5 border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: agent.color }}
                    />
                    <span className="truncate font-medium">{label}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        toggleOverlay(agent.id);
                        playClick();
                      }}
                      className={`p-1 rounded transition-colors ${
                        agent.showOverlay
                          ? 'text-blue-400 hover:bg-white/10'
                          : 'text-white/30 hover:bg-white/10'
                      }`}
                      title={agent.showOverlay ? 'Hide Overlay' : 'Show Overlay'}
                    >
                      {agent.showOverlay ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        removeAgent(agent.id);
                        playClick();
                      }}
                      className="p-1 rounded text-red-400/70 hover:text-red-400 hover:bg-white/10 transition-colors"
                      title="Remove Agent"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
