/**
 * ToolDock — Left vertical tool palette for maze editing.
 *
 * Implements Section 5.3 of the UI/UX Guidelines:
 * - 64px wide vertical stack on the left screen rail.
 * - Chunky brick buttons with 2px black borders and 3px press depth.
 * - Active tool gets Brick Red (#C91A09) fill + Brick Yellow (#F2CD37) glow ring.
 * - Destructive Clear action uses Reddish Brown (#582A12).
 * - Tooltip appears to the right on hover.
 *
 * @module ui/ToolDock
 */

import { useState } from 'react';
import { useGridStore, type Tool } from '../state/gridStore';
import { useRaceStore } from '../state/raceStore';
import { useGameMenuStore } from '../state/gameMenuStore';
import { playClick, playSnap } from '../utils/sound';
import {
  Square,
  Mountain,
  Eraser,
  Flag,
  Target,
  Map,
  Trash2,
} from 'lucide-react';

interface ToolItem {
  id: Tool | 'preset' | 'clear';
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  desc: string;
  isDestructive?: boolean;
}

const TOOLS: ToolItem[] = [
  {
    id: 'wall',
    label: 'Wall Brick',
    shortcut: 'W',
    icon: <Square size={20} className="fill-current stroke-[2.5]" />,
    desc: 'Paint solid brick walls',
  },
  {
    id: 'cost',
    label: 'Rough Terrain',
    shortcut: 'C',
    icon: <Mountain size={20} className="stroke-[2.5]" />,
    desc: 'Paint high-cost studs (x5)',
  },
  {
    id: 'eraser',
    label: 'Eraser',
    shortcut: 'E',
    icon: <Eraser size={20} className="stroke-[2.5]" />,
    desc: 'Remove walls and terrain',
  },
  {
    id: 'start',
    label: 'Start Stud',
    shortcut: 'S',
    icon: <Flag size={20} className="stroke-[2.5]" />,
    desc: 'Move starting position',
  },
  {
    id: 'goal',
    label: 'Goal Stud',
    shortcut: 'G',
    icon: <Target size={20} className="stroke-[2.5]" />,
    desc: 'Place or toggle goal studs',
  },
  {
    id: 'preset',
    label: 'Map Presets',
    shortcut: 'P',
    icon: <Map size={20} className="stroke-[2.5]" />,
    desc: 'Browse curated arena maps',
  },
  {
    id: 'clear',
    label: 'Clear Board',
    icon: <Trash2 size={20} className="stroke-[2.5]" />,
    desc: 'Clear all walls and studs',
    isDestructive: true,
  },
];

export function ToolDock() {
  const activeTool = useGridStore((s) => s.activeTool);
  const setActiveTool = useGridStore((s) => s.setActiveTool);
  const clearGrid = useGridStore((s) => s.clearGrid);
  const openPresetChooser = useGameMenuStore((s) => s.openPresetChooser);

  const raceStatus = useRaceStore((s) => s.status);
  const isRunning = raceStatus === 'running';

  const [hoveredTool, setHoveredTool] = useState<ToolItem | null>(null);

  const handleToolClick = (tool: ToolItem) => {
    if (isRunning) return;

    if (tool.id === 'preset') {
      openPresetChooser();
      playClick();
    } else if (tool.id === 'clear') {
      clearGrid();
      playSnap();
    } else {
      setActiveTool(tool.id);
      playSnap();
    }
  };

  return (
    <aside className="fixed left-3 top-20 z-20 flex flex-col items-center select-none">
      {/* 64px wide vertical dock container */}
      <div className="w-16 bg-[#595D60] border-[3px] border-[#05131D] rounded-2xl p-2 flex flex-col items-center gap-2.5 shadow-[0_6px_0_rgba(5,19,29,0.35)]">
        {/* Top Decorative 2 Studs */}
        <div className="flex items-center justify-center gap-2 pb-1 border-b-2 border-[#05131D]/40 w-full">
          <div className="w-2.5 h-2.5 rounded-full bg-[#A3A2A4] border border-[#05131D]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#A3A2A4] border border-[#05131D]" />
        </div>

        {/* Tools Stack */}
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          const isDestructive = tool.isDestructive;

          return (
            <div key={tool.id} className="relative group">
              <button
                onClick={() => handleToolClick(tool)}
                onMouseEnter={() => setHoveredTool(tool)}
                onMouseLeave={() => setHoveredTool(null)}
                disabled={isRunning}
                className={`w-11 h-11 rounded-xl flex items-center justify-center brick-btn transition-all ${
                  isDestructive
                    ? 'bg-[#582A12] text-[#F4F4F4] hover:bg-[#6e3618]'
                    : isActive
                      ? 'bg-[#C91A09] text-[#F4F4F4] ring-2 ring-[#F2CD37] shadow-[0_2px_0_#05131D]'
                      : 'bg-[#595D60] text-[#F4F4F4] hover:bg-[#6C6E68]'
                }`}
                aria-label={tool.label}
              >
                {tool.icon}
              </button>

              {/* Tooltip on right */}
              {hoveredTool?.id === tool.id && (
                <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none pl-2 animate-in fade-in-50 zoom-in-95 duration-100">
                  <div className="bg-[#F4F4F4] text-[#05131D] border-2 border-[#05131D] px-2.5 py-1.5 rounded-xl shadow-[0_4px_0_rgba(5,19,29,0.3)] whitespace-nowrap flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs font-sans">
                      <span>{tool.label}</span>
                      {tool.shortcut && (
                        <kbd className="px-1 py-0.2 rounded bg-[#05131D]/10 text-[9px] font-mono border border-[#05131D]/20">
                          {tool.shortcut}
                        </kbd>
                      )}
                    </div>
                    <span className="text-[10px] text-[#595D60] font-medium font-sans">
                      {tool.desc}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
