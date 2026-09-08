/**
 * HelpModal — Brick Racer Field Manual, Algorithm Compendium & Keyboard Reference.
 *
 * Implements Section 4.3 & Section 0 of the UI/UX Guidelines:
 * - Brick White (#F4F4F4) card with 3px black border and hard offset drop shadow.
 * - Top header with 4 raised LEGO studs and circular close button.
 * - Complete keyboard shortcut legend.
 * - Tile mechanics (Stud Baseplate, Stacked Brick Walls, Rough Studs, Start/Goal).
 * - 7 algorithm racer profiles with their canonical colors.
 *
 * @module ui/HelpModal
 */

import { useEffect } from 'react';
import {
  X,
  Keyboard,
  Compass,
  Zap,
  Flag,
  Mountain,
  Square,
  BookOpen,
  Target,
} from 'lucide-react';
import { ALGORITHMS } from '../algorithms';
import { playClick } from '../utils/sound';

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
      className="fixed inset-0 bg-[#05131D]/65 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-y-auto select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F4F4F4] border-[3px] border-[#05131D] rounded-3xl p-6 max-w-2xl w-full text-[#05131D] shadow-[0_10px_0_rgba(5,19,29,0.35)] flex flex-col gap-4 my-8 max-h-[85vh] overflow-y-auto relative"
      >
        {/* 4 Raised Studs Header Affordance (§4.3) */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
        </div>

        {/* Circular Reddish-Brown 1x1 Round Close Button */}
        <button
          onClick={() => {
            onClose();
            playClick();
          }}
          className="absolute right-4 top-4 w-7 h-7 rounded-full bg-[#582A12] hover:bg-[#6e3618] border-2 border-[#05131D] text-[#F4F4F4] flex items-center justify-center shadow-[0_2px_0_#05131D] active:translate-y-0.5 cursor-pointer"
          title="Close [Esc]"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 border-b-2 border-[#05131D]/15 pb-3">
          <div className="p-2 rounded-xl bg-[#0055BF] text-[#F4F4F4] border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#05131D] uppercase font-display">
              Field Manual & Rules
            </h2>
            <p className="text-xs text-[#595D60] font-semibold">
              Brick mechanics, algorithm profiles, and hotkeys
            </p>
          </div>
        </div>

        {/* Hotkeys Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0055BF] font-display">
            <Keyboard size={15} />
            <span>Hotkeys & Controls</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <span className="font-bold text-[#595D60]">Play / Pause</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#05131D]/10 text-[#05131D] font-mono text-[10px] font-bold border border-[#05131D]/20">
                Space
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <span className="font-bold text-[#595D60]">Reset Race</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#05131D]/10 text-[#05131D] font-mono text-[10px] font-bold border border-[#05131D]/20">
                R
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <span className="font-bold text-[#595D60]">Step 1 Tick</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#05131D]/10 text-[#05131D] font-mono text-[10px] font-bold border border-[#05131D]/20">
                → or .
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <span className="font-bold text-[#595D60]">Wall Brush</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#05131D]/10 text-[#05131D] font-mono text-[10px] font-bold border border-[#05131D]/20">
                W
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <span className="font-bold text-[#595D60]">Cost Tool</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#05131D]/10 text-[#05131D] font-mono text-[10px] font-bold border border-[#05131D]/20">
                C
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <span className="font-bold text-[#595D60]">Eraser</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#05131D]/10 text-[#05131D] font-mono text-[10px] font-bold border border-[#05131D]/20">
                E
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <span className="font-bold text-[#595D60]">Start Stud</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#05131D]/10 text-[#05131D] font-mono text-[10px] font-bold border border-[#05131D]/20">
                S
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <span className="font-bold text-[#595D60]">Goal Stud</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#05131D]/10 text-[#05131D] font-mono text-[10px] font-bold border border-[#05131D]/20">
                G
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <span className="font-bold text-[#595D60]">3D Isometric</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#05131D]/10 text-[#05131D] font-mono text-[10px] font-bold border border-[#05131D]/20">
                I
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <span className="font-bold text-[#595D60]">2D Top-Down</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#05131D]/10 text-[#05131D] font-mono text-[10px] font-bold border border-[#05131D]/20">
                T
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <span className="font-bold text-[#595D60]">Map Presets</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#05131D]/10 text-[#05131D] font-mono text-[10px] font-bold border border-[#05131D]/20">
                P
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <span className="font-bold text-[#595D60]">Pause Menu</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#05131D]/10 text-[#05131D] font-mono text-[10px] font-bold border border-[#05131D]/20">
                Esc
              </kbd>
            </div>
          </div>
        </div>

        {/* Tile Mechanics */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#AA7F2E] font-display">
            <Compass size={15} />
            <span>Brick Board Elements</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-white border-2 border-[#05131D] flex gap-2.5 shadow-[0_2px_0_#05131D]">
              <Flag size={18} className="text-[#0055BF] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#05131D] font-display">Start Pad (Gold Disc)</span>
                <p className="text-[11px] text-[#595D60] font-medium">
                  Where racers spawn. Click grid with Start tool to relocate.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border-2 border-[#05131D] flex gap-2.5 shadow-[0_2px_0_#05131D]">
              <Target size={18} className="text-[#F2CD37] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#05131D] font-display">Goal Flag (Bright Yellow)</span>
                <p className="text-[11px] text-[#595D60] font-medium">
                  The finish line with checkered flag. Racers win by reaching ANY goal.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border-2 border-[#05131D] flex gap-2.5 shadow-[0_2px_0_#05131D]">
              <Square size={18} className="text-[#582A12] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#05131D] font-display">Stacked Bricks (Walls)</span>
                <p className="text-[11px] text-[#595D60] font-medium">
                  Impassable stacked ABS bricks (1–3 layers) that block racer movement.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border-2 border-[#05131D] flex gap-2.5 shadow-[0_2px_0_#05131D]">
              <Mountain size={18} className="text-[#FE8A18] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#05131D] font-display">Rough Studs (Cost Terrain)</span>
                <p className="text-[11px] text-[#595D60] font-medium">
                  Higher travel cost tiles (×2 to ×25). Cost-aware algorithms detour around it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Profiles */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#237841] font-display">
            <Zap size={15} />
            <span>The 7 Algorithm Racers</span>
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            {Object.entries(ALGORITHMS).map(([key, item]) => (
              <div
                key={key}
                className="p-2.5 rounded-xl bg-white border-2 border-[#05131D] flex items-center justify-between gap-3 shadow-[0_2px_0_#05131D]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-[#05131D] shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-[#05131D] font-display">{item.label}</span>
                </div>

                <div className="text-[11px] text-[#595D60] font-medium text-right">
                  {key === 'astar' && 'Shortest cost-optimal path using Manhattan distance heuristic.'}
                  {key === 'bfs' && 'Unweighted level-by-level search (guarantees fewest steps).'}
                  {key === 'dijkstra' && 'Uniform-cost search exploring lowest-cost path without heuristic.'}
                  {key === 'dfs' && 'Depth-first search exploring deep corridors first.'}
                  {key === 'greedy' && 'Fast heuristic-greedy search rushing toward the goal.'}
                  {key === 'hillClimbing' && 'Local gradient descent, subject to traps.'}
                  {key === 'simulatedAnnealing' && 'Thermal probabilistic search able to escape traps.'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t-2 border-[#05131D]/15">
          <button
            onClick={() => {
              onClose();
              playClick();
            }}
            className="brick-btn px-4 py-1.5 bg-[#0055BF] hover:bg-[#0047a3] text-[#F4F4F4] rounded-xl text-xs font-bold shadow-[0_2px_0_#05131D] cursor-pointer"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
