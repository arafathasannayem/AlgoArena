/**
 * GridSizeControl — Floating panel for grid size selection.
 *
 * Positioned at the top-right edge. Offers 10×10, 20×20, 30×30 grid sizes.
 * Switching size clears the grid and resets start/goal.
 *
 * @module ui/GridSizeControl
 */

import { useGridStore } from '../state/gridStore';
import { useRaceStore } from '../state/raceStore';
import { playClick } from '../utils/sound';

const SIZES = [10, 20, 30] as const;

export function GridSizeControl() {
  const width = useGridStore((s) => s.width);
  const setSize = useGridStore((s) => s.setSize);
  const isRunning = useRaceStore((s) => s.status === 'running');

  if (isRunning) return null;

  return (
    <div className="fixed top-4 right-4 bg-glass-bg backdrop-blur-md border border-glass-border rounded-panel p-2 flex items-center gap-1.5 z-10 shadow-lg animate-in fade-in duration-150">
      <span className="text-[10px] uppercase tracking-wider text-glass-text/40 font-semibold px-2">
        Grid
      </span>
      {SIZES.map((s) => (
        <button
          key={s}
          onClick={() => {
            setSize(s, s);
            playClick();
          }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            width === s
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-glass-text/60 hover:text-white hover:bg-white/10'
          }`}
        >
          {s}×{s}
        </button>
      ))}
    </div>
  );
}
