/**
 * SquareClusterIndicator — Floating indicator for 4+ agents sharing a square.
 *
 * Appears directly above any grid tile occupied by 4 or more agents.
 * Visually highlights the last-entered agents with colored indicators
 * and labels, preventing overcrowding while maintaining full visibility.
 *
 * @module scene/SquareClusterIndicator
 */

import { Html } from '@react-three/drei';
import type { Agent } from '../state/agentStore';
import { ALGORITHMS } from '../algorithms';

interface SquareClusterIndicatorProps {
  x: number;
  y: number;
  lastEnteredAgents: Agent[];
  onToggleOverlay: (agentId: string) => void;
}

export function SquareClusterIndicator({
  x,
  y,
  lastEnteredAgents,
  onToggleOverlay,
}: SquareClusterIndicatorProps) {
  if (lastEnteredAgents.length === 0) return null;

  return (
    <Html center position={[x, 1.35, y]} style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-amber-400/40 text-amber-300 text-[10px] font-bold shadow-xl backdrop-blur-md whitespace-nowrap select-none transition-all hover:scale-105">
        <span className="text-[9px] uppercase tracking-wider text-amber-400/70 font-semibold">
          Last:
        </span>

        <div className="flex items-center -space-x-1">
          {lastEnteredAgents.map((agent) => {
            const label = ALGORITHMS[agent.algorithmKey]?.label ?? agent.algorithmKey;

            return (
              <button
                key={agent.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleOverlay(agent.id);
                }}
                className="relative group focus:outline-none"
                title={`${label} (Last entered) — click to toggle overlay`}
              >
                <span
                  className="block w-3 h-3 rounded-full border border-slate-900 shadow-sm transition-transform group-hover:scale-125 group-hover:z-10"
                  style={{ backgroundColor: agent.color }}
                />
              </button>
            );
          })}
        </div>

        <span className="text-[10px] text-white/80 font-medium">
          {lastEnteredAgents.length === 1
            ? ALGORITHMS[lastEnteredAgents[0]?.algorithmKey ?? '']?.label ?? ''
            : `+${lastEnteredAgents.length}`}
        </span>
      </div>
    </Html>
  );
}
