/**
 * HelpModal — In-game player manual, algorithm compendium, and keyboard reference.
 *
 * Provides players with:
 * - Complete keyboard shortcut legend
 * - Tile mechanics explanation (Regular, Wall, High Cost, Start, Goal)
 * - Algorithm profiles and search characteristics
 *
 * @module ui/HelpModal
 */

import { useEffect } from 'react';
import {
  X,
  Keyboard,
  Compass,
  Zap,
  MapPin,
  Flag,
  Mountain,
  Square,
  BookOpen,
} from 'lucide-react';
import { ALGORITHMS } from '../algorithms';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900/95 border border-glass-border rounded-panel p-6 max-w-2xl w-full text-glass-text shadow-2xl flex flex-col gap-5 my-8 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-glass-border pb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-slate-300" />
            <h2 className="text-base font-semibold tracking-wide text-white">
              Reference Guide & Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Guide [Esc]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hotkeys Section */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <Keyboard size={15} />
            <span>Hotkeys & Controls</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Play / Pause</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                Space
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Reset Race</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                R
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Step 1 Tick</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                → or .
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Wall Tool</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                W
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Cost Tool</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                C
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Eraser Tool</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                E
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Set Start</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                S
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Toggle Goal</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                G
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Isometric View</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                I
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Top-Down 2D</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                T
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Zoom In/Out</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                + / -
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Main Menu</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                M
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">Map Presets</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                P
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/70">This Guide</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                ? or H
              </kbd>
            </div>
          </div>
        </div>

        {/* Tile Mechanics */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Compass size={15} />
            <span>Tile Types & Mechanics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex gap-2.5">
              <Flag size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Start Pad</span>
                <p className="text-[11px] text-white/60">
                  Where agents spawn. Click grid with Start tool to relocate.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex gap-2.5">
              <MapPin size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Goal Beacons</span>
                <p className="text-[11px] text-white/60">
                  Target destinations. Agents win by reaching ANY beacon. Toggle tiles
                  with the Goal tool to place multiple goals.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex gap-2.5">
              <Square size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Boulders (Walls)</span>
                <p className="text-[11px] text-white/60">
                  Impassable sandstone boulders that block agent movement.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex gap-2.5">
              <Mountain size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Rough Terrain</span>
                <p className="text-[11px] text-white/60">
                  Traversable desert scrub with higher travel cost (×2 to ×99). Cost-aware algorithms detour around it, while unweighted algorithms traverse directly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Profiles */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Zap size={15} />
            <span>Search Algorithm Profiles</span>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            {Object.entries(ALGORITHMS).map(([key, item]) => (
              <div
                key={key}
                className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-white">{item.label}</span>
                  {item.implemented ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                      TODO
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-white/60 text-right">
                  {key === 'astar' && 'Shortest cost-optimal path using Manhattan heuristic.'}
                  {key === 'bfs' && 'Unweighted level-by-level search (fewest step count).'}
                  {key === 'dijkstra' && 'Uniform-cost search without heuristic.'}
                  {key === 'dfs' && 'Depth-first search exploring deep branches first.'}
                  {key === 'greedy' && 'Fast heuristic-greedy search without cost.'}
                  {key === 'hillclimb' && 'Local gradient ascent; subject to traps.'}
                  {key === 'annealing' && 'Probabilistic thermal search to escape local traps.'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-glass-border">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
