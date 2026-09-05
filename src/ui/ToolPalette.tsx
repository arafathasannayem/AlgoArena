/**
 * ToolPalette — Floating glass panel with editing tools and presets.
 *
 * Positioned at the left edge of the viewport. Contains:
 * - Wall / Eraser / Start / Goal tool buttons
 * - Clear Grid button
 * - Map preset buttons
 *
 * @module ui/ToolPalette
 */

import { useGridStore, type Tool } from '../state/gridStore';
import { Square, Eraser, Flag, Target, Trash2, Map } from 'lucide-react';
import { PRESETS } from '../maps/presets';

interface ToolDef {
  id: Tool;
  label: string;
  icon: React.ReactNode;
}

const TOOLS: ToolDef[] = [
  { id: 'wall', label: 'Wall', icon: <Square size={18} /> },
  { id: 'eraser', label: 'Eraser', icon: <Eraser size={18} /> },
  { id: 'start', label: 'Start Point', icon: <Flag size={18} /> },
  { id: 'goal', label: 'Goal Point', icon: <Target size={18} /> },
];

export function ToolPalette() {
  const activeTool = useGridStore((s) => s.activeTool);
  const setActiveTool = useGridStore((s) => s.setActiveTool);
  const clearGrid = useGridStore((s) => s.clearGrid);
  const loadPreset = useGridStore((s) => s.loadPreset);

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-glass-bg backdrop-blur-md border border-glass-border rounded-panel p-3 flex flex-col gap-1.5 z-10">
      {/* Tool buttons */}
      {TOOLS.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTool(t.id)}
          className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 ${
            activeTool === t.id
              ? 'bg-white/20 text-white'
              : 'text-glass-text/60 hover:text-white hover:bg-white/10'
          }`}
          title={t.label}
        >
          {t.icon}
          <span className="text-xs">{t.label}</span>
        </button>
      ))}

      <div className="border-t border-glass-border my-1" />

      {/* Clear button */}
      <button
        onClick={clearGrid}
        className="p-2.5 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-white/10 transition-colors flex items-center gap-2"
        title="Clear Grid"
      >
        <Trash2 size={18} />
        <span className="text-xs">Clear</span>
      </button>

      <div className="border-t border-glass-border my-1" />

      {/* Map presets */}
      <div className="px-2 py-1">
        <span className="text-[10px] uppercase tracking-wider text-glass-text/40 font-semibold">
          Presets
        </span>
      </div>
      {Object.entries(PRESETS).map(([key, preset]) => (
        <button
          key={key}
          onClick={() =>
            loadPreset(preset.walls, preset.start, preset.goal, preset.width, preset.height)
          }
          className="p-2 rounded-lg text-glass-text/60 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
          title={preset.description}
        >
          <Map size={14} />
          <span className="text-xs">{preset.name}</span>
        </button>
      ))}
    </div>
  );
}
